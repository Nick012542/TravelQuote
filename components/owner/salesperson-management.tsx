"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, CheckCircle, Clock, XCircle } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import { approveUserAction, rejectUserAction } from "@/app/actions/auth"
import type { Profile } from "@/lib/types"

interface SalespersonManagementProps {
  salespersons: Profile[]
}

export function SalespersonManagement({ salespersons: initialSalespersons }: SalespersonManagementProps) {
  const router = useRouter()
  const [salespersons, setSalespersons] = useState(initialSalespersons)
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSalespersons = salespersons.filter(
    (person) =>
      person.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleApproval = async (userId: number, approve: boolean) => {
    setIsLoading(userId)

    if (approve) {
      const result = await approveUserAction(userId)
      if (result.success) {
        setSalespersons(salespersons.map((s) => (s.id === userId ? { ...s, is_approved: true } : s)))
      }
    } else {
      const result = await rejectUserAction(userId)
      if (result.success) {
        setSalespersons(salespersons.filter((s) => s.id !== userId))
      }
    }

    setIsLoading(null)
    router.refresh()
  }

  const pendingCount = salespersons.filter((s) => !s.is_approved).length
  const approvedCount = salespersons.filter((s) => s.is_approved).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Salesperson Management</h1>
        <p className="text-slate-600 mt-1">Approve or manage salesperson accounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{salespersons.length}</p>
                <p className="text-xs sm:text-sm text-slate-600">Total Salespersons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs sm:text-sm text-slate-600">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs sm:text-sm text-slate-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="space-y-4">
          <CardTitle>All Salespersons</CardTitle>
          <SearchInput
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </CardHeader>
        <CardContent>
          {filteredSalespersons.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>{searchQuery ? "No salespersons match your search" : "No salespersons registered yet"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalespersons.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">
                        <div>
                          {person.full_name || "N/A"}
                          <p className="text-xs text-slate-500 sm:hidden">{person.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{person.email}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(person.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {person.is_approved ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Approved</span>
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Pending</span>
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!person.is_approved ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproval(person.id, true)}
                              disabled={isLoading === person.id}
                            >
                              {isLoading === person.id ? (
                                "..."
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Approve</span>
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                                >
                                  <XCircle className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Reject</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Application?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will reject {person.full_name || person.email}'s application and delete their
                                    account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleApproval(person.id, false)}
                                  >
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                              >
                                <span className="hidden sm:inline">Revoke</span>
                                <XCircle className="h-3 w-3 sm:hidden" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Access?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {person.full_name || person.email} from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleApproval(person.id, false)}
                                >
                                  Revoke Access
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
