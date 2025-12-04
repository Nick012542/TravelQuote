"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Plus, Crown, AlertCircle, Copy, Check } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { createAdminAction } from "@/app/actions/auth"
import type { Profile } from "@/lib/types"

interface AdminManagementProps {
  admins: Profile[]
  currentUserEmail: string
  isPrimaryAdmin: boolean
}

export function AdminManagement({ admins: initialAdmins, currentUserEmail, isPrimaryAdmin }: AdminManagementProps) {
  const router = useRouter()
  const [admins, setAdmins] = useState(initialAdmins)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [newAdminName, setNewAdminName] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.full_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(text)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      setError("Please enter a valid email address")
      return
    }
    if (!newAdminName) {
      setError("Please enter admin name")
      return
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append("email", newAdminEmail)
    formData.append("fullName", newAdminName)
    formData.append("password", newAdminPassword)

    const result = await createAdminAction(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Admin account created successfully!
        
Email: ${newAdminEmail}
Password: ${newAdminPassword}

Share these credentials with the new admin.`)
      setNewAdminEmail("")
      setNewAdminName("")
      setNewAdminPassword("")
      router.refresh()
    }

    setIsLoading(false)
  }

  const primaryAdmin = admins.find((a) => a.is_primary_admin)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Management</h1>
          <p className="text-slate-600 mt-1">Manage admin accounts and access</p>
        </div>
        {isPrimaryAdmin && (
          <Dialog
            open={isAdding}
            onOpenChange={(open) => {
              setIsAdding(open)
              if (!open) {
                setError(null)
                setSuccess(null)
                setNewAdminEmail("")
                setNewAdminName("")
                setNewAdminPassword("")
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Create a new admin account with email and password.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="adminName">Full Name</Label>
                  <Input
                    id="adminName"
                    type="text"
                    placeholder="John Doe"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email Address</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="newadmin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Password</Label>
                  <Input
                    id="adminPassword"
                    type="text"
                    placeholder="Enter password (min 6 characters)"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800 whitespace-pre-line text-sm">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}
                {!success && (
                  <Button
                    onClick={handleAddAdmin}
                    disabled={isLoading || !newAdminEmail || !newAdminName || !newAdminPassword}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? "Creating..." : "Create Admin Account"}
                  </Button>
                )}
                {success && (
                  <Button
                    onClick={() => {
                      setIsAdding(false)
                      setSuccess(null)
                    }}
                    className="w-full"
                  >
                    Done
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {primaryAdmin && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald-800">Primary Admin Account</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Name: <span className="font-medium">{primaryAdmin.full_name}</span>
                </p>
                <p className="text-sm text-emerald-700">
                  Email: <span className="font-mono font-medium">{primaryAdmin.email}</span>
                </p>
                <p className="text-xs text-emerald-600 mt-2">Only the primary admin can create new admin accounts.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            All Admin Accounts
          </CardTitle>
          <CardDescription>
            Admins can manage salespersons, pricing, destinations, hotels, and all quotes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SearchInput
            placeholder="Search admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />

          {filteredAdmins.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>{searchQuery ? "No admins match your search" : "No admin accounts found"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Added On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        <div>
                          {admin.full_name}
                          <p className="text-xs text-slate-500 sm:hidden">{admin.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]">{admin.email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(admin.email)}
                          >
                            {copiedEmail === admin.email ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {admin.is_primary_admin ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            <Crown className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
