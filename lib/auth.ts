"use server"

import { sql } from "./db"
import { cookies } from "next/headers"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16))
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  const keyMaterial = await globalThis.crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ])

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )

  const hashArray = Array.from(new Uint8Array(derivedBits))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return `${saltHex}:${hashHex}`
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(":")
  const encoder = new TextEncoder()

  // Convert salt from hex to Uint8Array
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)))

  const keyMaterial = await globalThis.crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ])

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )

  const hashArray = Array.from(new Uint8Array(derivedBits))
  const verifyHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex === verifyHex
}

function generateToken(): string {
  const array = new Uint8Array(32)
  globalThis.crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export interface User {
  id: number
  email: string
  full_name: string
  role: "owner" | "salesperson"
  is_approved: boolean
  is_primary_admin: boolean
  created_at: string
}

// Check if any users exist (for first admin setup)
export async function hasAnyUsers(): Promise<boolean> {
  const result = await sql`SELECT COUNT(*) as count FROM users`
  return Number.parseInt(result[0].count) > 0
}

// Sign up a new user
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: "owner" | "salesperson" = "salesperson",
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return { success: false, error: "Email already registered" }
    }

    // Check if this is the first user (they become primary admin)
    const hasUsers = await hasAnyUsers()
    const isPrimaryAdmin = !hasUsers
    const isApproved = isPrimaryAdmin // First user is auto-approved
    const userRole = isPrimaryAdmin ? "owner" : role

    // Hash password and create user
    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (email, password_hash, full_name, role, is_approved, is_primary_admin)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName}, ${userRole}, ${isApproved}, ${isPrimaryAdmin})
      RETURNING id, email, full_name, role, is_approved, is_primary_admin, created_at
    `

    return { success: true, user: result[0] as User }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { success: false, error: error.message || "Failed to create account" }
  }
}

// Sign in a user
export async function signIn(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User; token?: string }> {
  try {
    console.log("[v0] Attempting sign in for:", email.toLowerCase())

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash, full_name, role, is_approved, is_primary_admin, created_at
      FROM users WHERE email = ${email.toLowerCase()}
    `

    console.log("[v0] Users found:", users.length)

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]
    console.log("[v0] User found:", { id: user.id, email: user.email, is_approved: user.is_approved, role: user.role })

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    console.log("[v0] Password valid:", isValid)

    if (!isValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check if approved
    if (!user.is_approved) {
      console.log("[v0] User not approved")
      return { success: false, error: "Your account is pending approval. Please wait for admin to approve." }
    }

    // Create session token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    console.log("[v0] Creating session...")
    await sql`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    `
    console.log("[v0] Session created successfully")

    // Remove password_hash from returned user
    const { password_hash, ...safeUser } = user

    return { success: true, user: safeUser as User, token }
  } catch (error: any) {
    console.error("[v0] Signin error:", error)
    return { success: false, error: error.message || "Failed to sign in" }
  }
}

// Get current user from session token
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    const result = await sql`
      SELECT u.id, u.email, u.full_name, u.role, u.is_approved, u.is_primary_admin, u.created_at
      FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ${token} AND s.expires_at > NOW()
    `

    if (result.length === 0) {
      return null
    }

    return result[0] as User
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Sign out
export async function signOut(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (token) {
      await sql`DELETE FROM sessions WHERE token = ${token}`
    }
  } catch (error) {
    console.error("Signout error:", error)
  }
}

// Get all pending users (for admin approval)
export async function getPendingUsers(): Promise<User[]> {
  const result = await sql`
    SELECT id, email, full_name, role, is_approved, is_primary_admin, created_at
    FROM users WHERE is_approved = FALSE
    ORDER BY created_at DESC
  `
  return result as User[]
}

// Approve a user
export async function approveUser(userId: number): Promise<boolean> {
  try {
    await sql`UPDATE users SET is_approved = TRUE WHERE id = ${userId}`
    return true
  } catch (error) {
    console.error("Approve user error:", error)
    return false
  }
}

// Reject (delete) a user
export async function rejectUser(userId: number): Promise<boolean> {
  try {
    await sql`DELETE FROM users WHERE id = ${userId} AND is_primary_admin = FALSE`
    return true
  } catch (error) {
    console.error("Reject user error:", error)
    return false
  }
}

// Get all users (for admin)
export async function getAllUsers(): Promise<User[]> {
  const result = await sql`
    SELECT id, email, full_name, role, is_approved, is_primary_admin, created_at
    FROM users ORDER BY created_at DESC
  `
  return result as User[]
}

// Create new admin (only primary admin can do this)
export async function createAdmin(
  email: string,
  password: string,
  fullName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return { success: false, error: "Email already registered" }
    }

    const passwordHash = await hashPassword(password)

    await sql`
      INSERT INTO users (email, password_hash, full_name, role, is_approved, is_primary_admin)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${fullName}, 'owner', TRUE, FALSE)
    `

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
