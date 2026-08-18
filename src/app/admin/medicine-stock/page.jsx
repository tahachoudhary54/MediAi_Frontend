"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Plus, Pencil, Trash2, BriefcaseMedical, Activity, AlertTriangle, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

const CATEGORIES = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'other']
const UNITS = ['strip', 'bottle', 'tube', 'vial', 'box', 'piece']

const emptyForm = {
  name: "",
  genericName: "",
  category: "tablet",
  mg: "",
  price: "",
  quantity: "",
  unit: "strip",
  lowStockThreshold: "10",
  discount: "10",
  description: ""
}

export default function AdminMedicineStockPage() {
  const [medicines, setMedicines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  
  // For stock adjustment
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [adjustForm, setAdjustForm] = useState({ adjustment: "", type: "add" })

  const socketRef = useRef(null)

  const fetchMedicines = async () => {
    try {
      const res = await api.get("/medicine-stock")
      if (res.data.success) setMedicines(res.data.data)
    } catch {
      toast.error("Failed to load medicine stock")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicines()

    const handleStockUpdate = () => {
      fetchMedicines()
    }

    window.addEventListener("medicineStockUpdated", handleStockUpdate)

    return () => {
      window.removeEventListener("medicineStockUpdated", handleStockUpdate)
    }
  }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (med) => {
    setEditTarget(med)
    setForm({
      name: med.name,
      genericName: med.genericName || "",
      category: med.category,
      mg: med.mg || "",
      price: med.price,
      quantity: med.quantity,
      unit: med.unit,
      lowStockThreshold: med.lowStockThreshold,
      discount: med.discount || "0",
      description: med.description || ""
    })
    setModalOpen(true)
  }

  const openAdjust = (med) => {
    setAdjustTarget(med)
    setAdjustForm({ adjustment: "", type: "add" })
    setAdjustModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || form.price === "" || form.quantity === "") {
      toast.error("Name, price, and quantity are required")
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
        lowStockThreshold: Number(form.lowStockThreshold),
        discount: Number(form.discount) || 0
      }
      
      if (editTarget) {
        const res = await api.put(`/medicine-stock/${editTarget._id}`, payload)
        if (res.data.success) toast.success("Medicine updated")
      } else {
        const res = await api.post("/medicine-stock", payload)
        if (res.data.success) toast.success("Medicine added")
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdjustSubmit = async (e) => {
    e.preventDefault()
    if (!adjustForm.adjustment) return
    setSubmitting(true)
    try {
      const payload = {
        adjustment: Number(adjustForm.adjustment),
        type: adjustForm.type
      }
      const res = await api.patch(`/medicine-stock/${adjustTarget._id}/stock`, payload)
      if (res.data.success) toast.success("Stock adjusted")
      setAdjustModalOpen(false)
    } catch (err) {
      toast.error("Failed to adjust stock")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return
    try {
      await api.delete(`/medicine-stock/${id}`)
    } catch {
      toast.error("Failed to delete medicine")
    }
  }

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMedicines = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1) }
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1) }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const stats = {
    total: medicines.length,
    lowStock: medicines.filter(m => m.quantity <= m.lowStockThreshold).length,
    outOfStock: medicines.filter(m => m.quantity === 0).length,
    totalValue: medicines.reduce((acc, m) => acc + (m.price * m.quantity), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medicine Stock Management</h1>
          <p className="text-slate-500 mt-1">Manage inventory, pricing, and stock levels.</p>
        </div>
        <Button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Medicine
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Medicines", value: stats.total, color: "bg-indigo-100 text-indigo-700", icon: BriefcaseMedical },
          { label: "Low Stock", value: stats.lowStock, color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
          { label: "Out of Stock", value: stats.outOfStock, color: "bg-red-100 text-red-700", icon: Activity },
          { label: "Total Value", value: `₹${stats.totalValue.toLocaleString()}`, color: "bg-emerald-100 text-emerald-700", icon: IndianRupee },
        ].map(stat => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold text-slate-900">Current Inventory</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search medicines..."
                className="pl-9 bg-slate-50 border-slate-200 text-slate-900"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70">
                  <TableHead>Medicine Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading inventory...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <BriefcaseMedical className="w-12 h-12 text-slate-200" />
                        <p className="font-semibold text-slate-700">No medicines found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMedicines.map(med => (
                    <TableRow key={med._id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="font-semibold text-slate-900">{med.name}</div>
                        <div className="text-xs text-slate-500">{med.genericName || "—"} • {med.mg ? `${med.mg}mg` : "—"}</div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-slate-600 text-sm">{med.category}</span>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          ₹{med.price} {med.discount > 0 && <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-1 rounded ml-1">-{med.discount}%</span>}
                        </div>
                        <div className="text-xs text-slate-500">per {med.unit}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{med.quantity}</div>
                        <div className="text-xs text-slate-500">{med.unit}s</div>
                      </TableCell>
                      <TableCell>
                        {med.quantity === 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">
                            Out of Stock
                          </span>
                        ) : med.quantity <= med.lowStockThreshold ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                            In Stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => openAdjust(med)}>
                            Adjust
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-teal-600 hover:bg-teal-50" onClick={() => openEdit(med)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(med._id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium">{filtered.length === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <div className="text-sm font-medium text-slate-700 px-2">
                Page {currentPage} of {totalPages || 1}
              </div>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Medicine" : "Add New Medicine"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Generic Name</label>
              <Input value={form.genericName} onChange={e => setForm(f => ({ ...f, genericName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-600">
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-teal-600">
                {UNITS.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Price (₹) *</label>
              <Input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Initial Quantity *</label>
              <Input type="number" min="0" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} disabled={!!editTarget} required={!editTarget} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">mg</label>
              <Input type="number" value={form.mg} onChange={e => setForm(f => ({ ...f, mg: e.target.value }))} placeholder="e.g. 500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Low Stock Alert At</label>
              <Input type="number" min="0" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Discount (%)</label>
              <Input type="number" min="0" max="100" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} placeholder="e.g. 10" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={submitting}>{submitting ? "Saving..." : editTarget ? "Update" : "Save Medicine"}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={adjustModalOpen} onClose={() => setAdjustModalOpen(false)} title={`Adjust Stock: ${adjustTarget?.name}`}>
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg flex items-center justify-between text-sm">
            <span className="text-slate-600">Current Quantity:</span>
            <span className="font-bold text-slate-900">{adjustTarget?.quantity} {adjustTarget?.unit}s</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Action Type</label>
            <select value={adjustForm.type} onChange={e => setAdjustForm(f => ({ ...f, type: e.target.value }))} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600">
              <option value="add">Add to Stock</option>
              <option value="subtract">Remove from Stock</option>
              <option value="set">Set Exact Quantity</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Quantity</label>
            <Input type="number" min="1" value={adjustForm.adjustment} onChange={e => setAdjustForm(f => ({ ...f, adjustment: e.target.value }))} required />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setAdjustModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={submitting}>{submitting ? "Applying..." : "Apply Adjustment"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
