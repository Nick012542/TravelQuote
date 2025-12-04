"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Settings, CheckCircle, XCircle, CreditCard, AlertTriangle } from "lucide-react"
import type { PackagePolicy } from "@/lib/types"

interface PolicyManagementProps {
  policies: PackagePolicy[]
}

export function PolicyManagement({ policies: initialPolicies }: PolicyManagementProps) {
  const router = useRouter()
  const [policies, setPolicies] = useState(initialPolicies)
  const [isLoading, setIsLoading] = useState(false)
  const [newPolicy, setNewPolicy] = useState({ type: "include" as const, description: "" })

  const addPolicy = async () => {
    if (!newPolicy.description.trim()) return
    setIsLoading(true)

    const maxOrder = policies.filter((p) => p.type === newPolicy.type).length

    try {
      const response = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newPolicy.type,
          description: newPolicy.description,
          order_index: maxOrder + 1,
          is_default: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPolicies([...policies, data])
        setNewPolicy({ ...newPolicy, description: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding policy:", error)
    }
    setIsLoading(false)
  }

  const deletePolicy = async (id: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/policies?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPolicies(policies.filter((p) => p.id !== id))
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting policy:", error)
    }
    setIsLoading(false)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "include":
        return <CheckCircle className="h-5 w-5 text-emerald-600" />
      case "exclude":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "payment":
        return <CreditCard className="h-5 w-5 text-sky-600" />
      case "cancellation":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const typeLabels = {
    include: "Package Includes",
    exclude: "Package Excludes",
    payment: "Payment Policy",
    cancellation: "Cancellation Policy",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Package Policies</h1>
        <p className="text-slate-600 mt-1">Manage package includes, excludes, and policies</p>
      </div>

      {/* Add New Policy */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" />
            Add New Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={newPolicy.type} onValueChange={(v: any) => setNewPolicy({ ...newPolicy, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="include">Package Include</SelectItem>
                  <SelectItem value="exclude">Package Exclude</SelectItem>
                  <SelectItem value="payment">Payment Policy</SelectItem>
                  <SelectItem value="cancellation">Cancellation Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Input
                placeholder="Enter policy description"
                value={newPolicy.description}
                onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addPolicy} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                Add Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policies by Type */}
      <Tabs defaultValue="include">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="include">Includes</TabsTrigger>
          <TabsTrigger value="exclude">Excludes</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
        </TabsList>

        {(["include", "exclude", "payment", "cancellation"] as const).map((type) => (
          <TabsContent key={type} value={type}>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getIcon(type)}
                  {typeLabels[type]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {policies.filter((p) => p.type === type).length === 0 ? (
                  <p className="text-center py-8 text-slate-500">No {type} policies added yet</p>
                ) : (
                  <ul className="space-y-2">
                    {policies
                      .filter((p) => p.type === type)
                      .map((policy) => (
                        <li key={policy.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm">{policy.description}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePolicy(policy.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </li>
                      ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
