"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Trash2, Eye, Edit, Calendar, Upload, File } from "lucide-react"
import { SearchInput } from "@/components/ui/search-input"
import type { Destination } from "@/lib/types"

interface Itinerary {
  id: number
  destination_id: number
  name: string
  description: string
  days: number
  content: string
  file_url?: string
  file_type?: string
  created_at: string
}

interface ItineraryManagerProps {
  itineraries: Itinerary[]
  destinations: Destination[]
}

export function ItineraryManager({ itineraries, destinations }: ItineraryManagerProps) {
  const router = useRouter()
  const [isAddingItinerary, setIsAddingItinerary] = useState(false)
  const [isUploadingPDF, setIsUploadingPDF] = useState(false)
  const [viewingItinerary, setViewingItinerary] = useState<Itinerary | null>(null)
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | null>(null)
  const [newItinerary, setNewItinerary] = useState({
    destination_id: "",
    name: "",
    description: "",
    days: 1,
    content: "",
  })
  const [pdfUpload, setPdfUpload] = useState({
    destination_id: "",
    name: "",
    description: "",
    file: null as File | null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItineraries = itineraries.filter((it) => {
    const dest = destinations.find((d) => d.id === it.destination_id)
    return (
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleAddItinerary = async () => {
    if (!newItinerary.name || !newItinerary.destination_id) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItinerary),
      })

      if (response.ok) {
        setNewItinerary({ destination_id: "", name: "", description: "", days: 1, content: "" })
        setIsAddingItinerary(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error adding itinerary:", error)
    }
    setIsLoading(false)
  }

  const handleUploadPDF = async () => {
    if (!pdfUpload.name || !pdfUpload.destination_id || !pdfUpload.file) return
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", pdfUpload.file)
      formData.append("name", pdfUpload.name)
      formData.append("destination_id", pdfUpload.destination_id)
      formData.append("description", pdfUpload.description)

      const response = await fetch("/api/itineraries/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setPdfUpload({ destination_id: "", name: "", description: "", file: null })
        setIsUploadingPDF(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Error uploading PDF:", error)
    }
    setIsLoading(false)
  }

  const handleUpdateItinerary = async () => {
    if (!editingItinerary) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/itineraries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItinerary),
      })

      if (response.ok) {
        setEditingItinerary(null)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating itinerary:", error)
    }
    setIsLoading(false)
  }

  const handleDeleteItinerary = async (id: number) => {
    if (!confirm("Delete this itinerary?")) return
    await fetch(`/api/itineraries?id=${id}`, { method: "DELETE" })
    router.refresh()
  }

  const getDestinationName = (destId: number) => {
    return destinations.find((d) => d.id === destId)?.name || "Unknown"
  }

  const isPDFItinerary = (itinerary: Itinerary) => {
    return itinerary.file_url && itinerary.file_type === "application/pdf"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Itineraries</h1>
          <p className="text-slate-600 mt-1">Upload and manage fixed itineraries</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingItinerary} onOpenChange={setIsAddingItinerary}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Text Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Text Itinerary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Select
                      value={newItinerary.destination_id}
                      onValueChange={(value) => setNewItinerary({ ...newItinerary, destination_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {destinations.map((dest) => (
                          <SelectItem key={dest.id} value={String(dest.id)}>
                            {dest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Days</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newItinerary.days}
                      onChange={(e) => setNewItinerary({ ...newItinerary, days: Number.parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Itinerary Name</Label>
                  <Input
                    placeholder="e.g., North India 5N/6D Budget Package"
                    value={newItinerary.name}
                    onChange={(e) => setNewItinerary({ ...newItinerary, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Short Description</Label>
                  <Textarea
                    placeholder="Brief overview of the package..."
                    rows={2}
                    value={newItinerary.description}
                    onChange={(e) => setNewItinerary({ ...newItinerary, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Full Itinerary Content</Label>
                  <Textarea
                    placeholder={`Day 1: Arrival at Delhi, transfer to Manali\n- Morning: Pick up from Delhi\n- Evening: Reach Manali, check-in hotel\n- Overnight at Manali\n\nDay 2: Manali Local Sightseeing\n- Hadimba Temple\n- Mall Road\n- Vashisht Hot Springs\n...`}
                    rows={12}
                    value={newItinerary.content}
                    onChange={(e) => setNewItinerary({ ...newItinerary, content: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
                <Button
                  onClick={handleAddItinerary}
                  disabled={isLoading || !newItinerary.name || !newItinerary.destination_id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? "Adding..." : "Add Itinerary"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadingPDF} onOpenChange={setIsUploadingPDF}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF Itinerary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload PDF Itinerary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Itinerary Name *</Label>
                  <Input
                    placeholder="e.g., Manali-Dharamshala-Amritsar-Delhi 7N/8D"
                    value={pdfUpload.name}
                    onChange={(e) => setPdfUpload({ ...pdfUpload, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Region *</Label>
                  <Select
                    value={pdfUpload.destination_id}
                    onValueChange={(value) => setPdfUpload({ ...pdfUpload, destination_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={String(dest.id)}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Short Description (Optional)</Label>
                  <Textarea
                    placeholder="Brief overview of the itinerary..."
                    rows={2}
                    value={pdfUpload.description}
                    onChange={(e) => setPdfUpload({ ...pdfUpload, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>PDF File *</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {pdfUpload.file ? (
                          <>
                            <File className="h-8 w-8 text-emerald-600 mb-2" />
                            <p className="text-sm text-slate-700 font-medium">{pdfUpload.file.name}</p>
                            <p className="text-xs text-slate-500">
                              {(pdfUpload.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600">Click to upload PDF</p>
                            <p className="text-xs text-slate-500">Max file size: 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file && file.size <= 10 * 1024 * 1024) {
                            setPdfUpload({ ...pdfUpload, file })
                          } else {
                            alert("File size must be less than 10MB")
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
                <Button
                  onClick={handleUploadPDF}
                  disabled={isLoading || !pdfUpload.name || !pdfUpload.destination_id || !pdfUpload.file}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? "Uploading..." : "Upload Itinerary"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <SearchInput
            placeholder="Search itineraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery("")}
          />
        </CardContent>
      </Card>

      {filteredItineraries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {searchQuery
                ? "No itineraries match your search"
                : "No itineraries yet. Upload your first itinerary to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItineraries.map((itinerary) => (
            <Card key={itinerary.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isPDFItinerary(itinerary) ? "bg-red-100" : "bg-emerald-100"}`}>
                      {isPDFItinerary(itinerary) ? (
                        <File className="h-4 w-4 text-red-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1">{itinerary.name}</CardTitle>
                      <p className="text-sm text-slate-500">{getDestinationName(itinerary.destination_id)}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isPDFItinerary(itinerary) && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{itinerary.days} Days</span>
                  </div>
                )}
                {isPDFItinerary(itinerary) && (
                  <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
                    <File className="h-4 w-4" />
                    <span>PDF Document</span>
                  </div>
                )}
                {itinerary.description && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4">{itinerary.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setViewingItinerary(itinerary)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {!isPDFItinerary(itinerary) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setEditingItinerary(itinerary)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteItinerary(itinerary.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Itinerary Dialog - Updated for PDF */}
      <Dialog open={!!viewingItinerary} onOpenChange={() => setViewingItinerary(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingItinerary?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                {viewingItinerary && getDestinationName(viewingItinerary.destination_id)}
              </span>
              {viewingItinerary && !isPDFItinerary(viewingItinerary) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {viewingItinerary.days} Days
                </span>
              )}
            </div>
            {viewingItinerary?.description && <p className="text-slate-600">{viewingItinerary.description}</p>}
            <div className="border-t pt-4">
              {viewingItinerary && isPDFItinerary(viewingItinerary) ? (
                <div>
                  <h4 className="font-medium mb-2">PDF Itinerary</h4>
                  <iframe
                    src={viewingItinerary.file_url}
                    className="w-full h-[600px] border rounded-lg"
                    title={viewingItinerary.name}
                  />
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-2">Full Itinerary</h4>
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg font-sans">
                    {viewingItinerary?.content}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Itinerary Dialog */}
      <Dialog open={!!editingItinerary} onOpenChange={() => setEditingItinerary(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Itinerary</DialogTitle>
          </DialogHeader>
          {editingItinerary && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Region</Label>
                  <Select
                    value={String(editingItinerary.destination_id)}
                    onValueChange={(value) =>
                      setEditingItinerary({ ...editingItinerary, destination_id: Number.parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((dest) => (
                        <SelectItem key={dest.id} value={String(dest.id)}>
                          {dest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Number of Days</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingItinerary.days}
                    onChange={(e) =>
                      setEditingItinerary({ ...editingItinerary, days: Number.parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Itinerary Name</Label>
                <Input
                  value={editingItinerary.name}
                  onChange={(e) => setEditingItinerary({ ...editingItinerary, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Short Description</Label>
                <Textarea
                  rows={2}
                  value={editingItinerary.description || ""}
                  onChange={(e) => setEditingItinerary({ ...editingItinerary, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Full Itinerary Content</Label>
                <Textarea
                  rows={12}
                  value={editingItinerary.content}
                  onChange={(e) => setEditingItinerary({ ...editingItinerary, content: e.target.value })}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleUpdateItinerary}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
