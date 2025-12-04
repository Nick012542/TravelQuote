"use server"

import { signUp, signIn, signOut, approveUser, rejectUser, createAdmin, getCurrentUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const role = formData.get("role") as "owner" | "salesperson"

  const result = await signUp(email, password, fullName, role)

  if (!result.success) {
    return { error: result.error }
  }

  // If user is auto-approved (first user), sign them in
  if (result.user?.is_approved) {
    const signInResult = await signIn(email, password)
    if (signInResult.success && signInResult.token) {
      const cookieStore = await cookies()
      cookieStore.set("auth_token", signInResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      })
      return { success: true, redirect: "/owner" }
    }
  }

  return { success: true, pendingApproval: true }
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const result = await signIn(email, password)

  if (!result.success) {
    return { error: result.error }
  }

  const cookieStore = await cookies()
  cookieStore.set("auth_token", result.token!, {
    httpOnly: true,
    secure: false, // Allow on HTTP for preview
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })

  console.log("[v0] Cookie set for token:", result.token?.substring(0, 10) + "...")

  // Redirect based on role
  const redirectPath = result.user?.role === "owner" ? "/owner" : "/sales"
  return { success: true, redirect: redirectPath }
}

export async function signOutAction() {
  await signOut()
  const cookieStore = await cookies()
  cookieStore.delete("auth_token")
  redirect("/auth/login")
}

export async function approveUserAction(userId: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== "owner") {
    return { error: "Unauthorized" }
  }

  const success = await approveUser(userId)
  return { success }
}

export async function rejectUserAction(userId: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== "owner") {
    return { error: "Unauthorized" }
  }

  const success = await rejectUser(userId)
  return { success }
}

export async function createAdminAction(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || !user.is_primary_admin) {
    return { error: "Only primary admin can create new admins" }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  const result = await createAdmin(email, password, fullName)
  return result
}

export async function getSessionUser() {
  return await getCurrentUser()
}
