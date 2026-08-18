"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Edit2, Trash2, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import api from "@/lib/api"

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [selectedAppointment, setSelectedAppointment] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    date: "", time: "", status: "pending", reason: ""
  })

  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/admin/appointments')
      if (res.data.success) {
        setAppointments(res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()

    const handleRefresh = () => fetchAppointments()
    window.addEventListener("refreshAdminAppointments", handleRefresh)

    const handleCancelledEvent = () => {
      console.log("[AdminAppointments] Received appointmentCancelledAdmin custom event. Hot-reloading...");
      fetchAppointments()
    }
    window.addEventListener("appointmentCancelledAdmin", handleCancelledEvent)

    return () => {
      window.removeEventListener("appointmentCancelledAdmin", handleCancelledEvent)
    }
  }, [])

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const doctorName = appt.doctor?.fullName || "";
      const patientName = appt.patient?.fullName || "";
      const matchesSearch =
        doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || appt.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchQuery, statusFilter]);

  const handleOpenEdit = (appt) => {
    setFormData({
      date: new Date(appt.date).toISOString().split('T')[0],
      time: appt.time,
      status: appt.status,
      reason: appt.reason
    })
    setSelectedAppointment(appt)
    setIsFormModalOpen(true)
  }

  const handleOpenDelete = (appt) => {
    setSelectedAppointment(appt)
    setIsDeleteModalOpen(true)
  }

  const handleSaveAppointment = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/appointments/${selectedAppointment._id}`, formData)
      fetchAppointments()
      setIsFormModalOpen(false)
      alert("Appointment updated successfully.")
    } catch (err) {
      alert("Failed to update appointment")
    }
  }

  const handleDeleteAppointment = async () => {
    try {
      await api.delete(`/appointments/${selectedAppointment._id}`)
      fetchAppointments()
      setIsDeleteModalOpen(false)
      alert("Appointment deleted/cancelled successfully.")
    } catch (err) {
      alert("Failed to delete appointment")
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)

  const getPageNumbers = () => {
    const pageNumbers = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i)
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pageNumbers
  }

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "teal";
      case "scheduled": return "teal";
      case "pending": return "warning";
      case "completed": return "success";
      case "cancelled": return "destructive";
      default: return "default";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="text-slate-500">Platform-wide appointment monitoring.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by doctor or patient..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No appointments found.
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map(appt => (
                  <TableRow key={appt._id}>
                    <TableCell className="font-medium text-slate-900">{appt.patient?.fullName || "N/A"}</TableCell>
                    <TableCell>{appt.doctor?.fullName || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{new Date(appt.date).toLocaleDateString()}</span>
                        <span className="text-xs text-slate-500">{appt.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{appt.consultationType}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appt.status)}>{appt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(appt)} title="Edit">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(appt)} title="Delete/Cancel">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {filteredAppointments.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-4 gap-4">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{indexOfFirstItem + 1}</span> to <span className="font-medium text-slate-900">{Math.min(indexOfLastItem, filteredAppointments.length)}</span> of <span className="font-medium text-slate-900">{filteredAppointments.length}</span> entries
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center gap-1 hidden md:flex">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-[2rem] px-2 ${currentPage === page ? "bg-teal-600 text-white hover:bg-teal-700" : "text-slate-600"}`}
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 gap-1 pr-2.5"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Edit Appointment"
      >
        <form onSubmit={handleSaveAppointment} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} required />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="reason">Reason / Notes</Label>
              <Input id="reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} required />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete/Cancel Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to cancel/delete the appointment for <span className="font-semibold text-slate-900">{selectedAppointment?.patient?.fullName || "Unknown Patient"}</span> with <span className="font-semibold text-slate-900">Dr. {selectedAppointment?.doctor?.fullName || "Unknown"}</span>? This action will notify the patient if cancelled.</p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Keep Appointment</Button>
            <Button variant="danger" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteAppointment}>Cancel/Delete Appointment</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
