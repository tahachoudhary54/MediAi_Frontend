"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Ambulance, Plus, Pencil, Trash2, Search, Phone, CreditCard, Car, Sun, Moon, Clock } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

const STATUS_COLORS = {
  available: "bg-emerald-100 text-emerald-700 border-emerald-200",
  on_duty: "bg-amber-100 text-amber-700 border-amber-200",
  maintenance: "bg-red-100 text-red-700 border-red-200",
}
const STATUS_LABELS = {
  available: "Available",
  on_duty: "On Duty",
  maintenance: "Maintenance",
}

const SHIFT_CONFIG = {
  morning: { label: "Morning Shift", icon: Sun, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  night:   { label: "Night Shift",   icon: Moon, color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  both:    { label: "Both Shifts",   icon: Clock, color: "bg-slate-100 text-slate-700 border-slate-200" },
}

const emptyForm = {
  numberPlate: "",
  driverName: "",
  phoneNumber: "",
  drivingLicense: "",
  status: "available",
  shift: "morning",
}

export default function AdminAmbulancesPage() {
  const [ambulances, setAmbulances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const socketRef = useRef(null)

  // Fetch initial data
  const fetchAmbulances = async () => {
    try {
      const res = await api.get("/ambulances")
      if (res.data.success) setAmbulances(res.data.data)
    } catch {
      toast.error("Failed to load ambulances")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAmbulances()

    // Real-time socket connection
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const socketUrl = apiBase.replace("/api", "")
    const socket = io(socketUrl, { withCredentials: true, transports: ["websocket", "polling"] })
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("joinRoom", "admin_room")
    })

    socket.on("ambulance_added", (newAmb) => {
      setAmbulances(prev => {
        if (prev.find(a => a._id === newAmb._id)) return prev
        return [newAmb, ...prev]
      })
      toast.success(`🚑 New ambulance added: ${newAmb.numberPlate}`)
    })

    socket.on("ambulance_updated", (updated) => {
      setAmbulances(prev => prev.map(a => a._id === updated._id ? updated : a))
    })

    socket.on("ambulance_deleted", (id) => {
      setAmbulances(prev => prev.filter(a => a._id !== id))
      toast.error("An ambulance was removed.")
    })

    return () => socket.disconnect()
  }, [])

  const openAdd = () => {
    setEditTarget(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (amb) => {
    setEditTarget(amb)
    setForm({
      numberPlate: amb.numberPlate,
      driverName: amb.driverName,
      phoneNumber: amb.phoneNumber,
      drivingLicense: amb.drivingLicense,
      status: amb.status,
      shift: amb.shift || "morning",
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.numberPlate || !form.driverName || !form.phoneNumber || !form.drivingLicense) {
      toast.error("All fields are required")
      return
    }
    setSubmitting(true)
    try {
      if (editTarget) {
        const res = await api.put(`/ambulances/${editTarget._id}`, form)
        if (res.data.success) {
          toast.success("Ambulance updated")
        }
      } else {
        const res = await api.post("/ambulances", form)
        if (res.data.success) {
          toast.success("Ambulance added")
        }
      }
      setModalOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this ambulance?")) return
    try {
      await api.delete(`/ambulances/${id}`)
    } catch {
      toast.error("Failed to delete ambulance")
    }
  }

  const filtered = ambulances.filter(a =>
    a.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.numberPlate.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: ambulances.length,
    available: ambulances.filter(a => a.status === "available").length,
    on_duty: ambulances.filter(a => a.status === "on_duty").length,
    maintenance: ambulances.filter(a => a.status === "maintenance").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ambulance Management</h1>
          <p className="text-slate-500 mt-1">Register and manage ambulance fleet — updates in real time.</p>
        </div>
        <Button onClick={openAdd} className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Ambulance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-slate-100 text-slate-700" },
          { label: "Available", value: stats.available, color: "bg-emerald-100 text-emerald-700" },
          { label: "On Duty", value: stats.on_duty, color: "bg-amber-100 text-amber-700" },
          { label: "Maintenance", value: stats.maintenance, color: "bg-red-100 text-red-700" },
        ].map(stat => (
          <Card key={stat.label} className="border-slate-200">
            <CardContent className="p-5 flex items-center gap-3">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <Ambulance className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              Registered Ambulances
              <span className="inline-flex items-center gap-1 text-xs font-normal text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by driver or plate..."
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
                  <TableHead>Number Plate</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Driving License</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        Loading ambulances...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <Ambulance className="w-12 h-12 text-slate-200" />
                        <p className="font-semibold text-slate-700">No ambulances found</p>
                        <p className="text-sm text-slate-400">Click "Add Ambulance" to register one.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(amb => {
                    const shiftCfg = SHIFT_CONFIG[amb.shift || "morning"]
                    const ShiftIcon = shiftCfg.icon
                    return (
                      <TableRow key={amb._id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-2 font-mono font-bold text-slate-800 text-sm">
                            <Car className="w-4 h-4 text-teal-500" />
                            {amb.numberPlate}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{amb.driverName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {amb.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-slate-600 text-sm font-mono">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            {amb.drivingLicense}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${shiftCfg.color}`}>
                            <ShiftIcon className="w-3 h-3" />
                            {shiftCfg.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[amb.status]}`}>
                            {STATUS_LABELS[amb.status]}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(amb.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                              onClick={() => openEdit(amb)}
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(amb._id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? "Edit Ambulance" : "Add New Ambulance"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="numberPlate">
              Car Number Plate *
            </label>
            <Input
              id="numberPlate"
              placeholder="e.g. MH-12-AB-1234"
              value={form.numberPlate}
              onChange={e => setForm(f => ({ ...f, numberPlate: e.target.value.toUpperCase() }))}
              className="font-mono"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="driverName">
              Driver Name *
            </label>
            <Input
              id="driverName"
              placeholder="Full name of driver"
              value={form.driverName}
              onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="phoneNumber">
              Phone Number *
            </label>
            <Input
              id="phoneNumber"
              placeholder="+91 XXXXX XXXXX"
              value={form.phoneNumber}
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="drivingLicense">
              Driving License Number *
            </label>
            <Input
              id="drivingLicense"
              placeholder="e.g. MH1220XX123456"
              value={form.drivingLicense}
              onChange={e => setForm(f => ({ ...f, drivingLicense: e.target.value.toUpperCase() }))}
              className="font-mono"
              required
            />
          </div>

          {/* Shift Selection */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Shift *</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(SHIFT_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon
                const isSelected = form.shift === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, shift: key }))}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="available">Available</option>
              <option value="on_duty">On Duty</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={submitting}>
              {submitting ? "Saving..." : editTarget ? "Update" : "Add Ambulance"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
