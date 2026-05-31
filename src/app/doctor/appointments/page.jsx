"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Calendar, Clock, Video, MapPin, CheckCircle2, AlertCircle, XCircle, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" })

  const fetchAppointments = async () => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token) {
      setError("Please login to view appointments");
      return;
    }

    if (role !== 'doctor') {
      setError("Access denied. This page is for doctors only.");
      return;
    }
    try {
      setIsLoading(true)
      setError("")
      const res = await api.get('/appointments/doctor')
      if (res.data.success) {
        setAppointments(res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date)))
      }
    } catch (err) {
      console.error("Appointment fetch error:", err.response?.data || err.message || err)
      const errorMsg = err.response?.data?.message || err.message || "Failed to load appointments."
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status })
      fetchAppointments()
      const statusLabel = status === 'approved_pending_payment' ? 'approved (pending payment)' : status;
      toast.success(`Appointment status updated to ${statusLabel} successfully.`)
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}`, { status: 'cancelled' })
      fetchAppointments()
      toast.success("Appointment cancelled successfully.")
    } catch (err) {
      console.error("Failed to cancel appointment", err)
      toast.error(err.response?.data?.message || "Failed to cancel appointment")
    }
  }

  const handleOpenReschedule = (appointment) => {
    setSelectedAppointment(appointment)
    setRescheduleData({
      date: new Date(appointment.date).toISOString().split('T')[0],
      time: appointment.time
    })
    setIsRescheduleModalOpen(true)
  }

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/appointments/${selectedAppointment._id}`, rescheduleData)
      setIsRescheduleModalOpen(false)
      fetchAppointments()
      toast.success("Appointment rescheduled and patient notified")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reschedule")
    }
  }

  const getStatusBadge = (status, paymentStatus) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Confirmed & Scheduled</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">New Request</Badge>;
      case 'pending_reschedule_by_doctor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Waiting for Patient Response</Badge>;
      case 'pending_reschedule_by_patient':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Patient Rescheduled (Action Needed)</Badge>;
      case 'approved_pending_payment':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Approved (Awaiting Payment)</Badge>;
      case 'completed':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="text-slate-500">View and manage your upcoming consultations.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg">Upcoming Requests</h3>

          {isLoading ? (
            <p className="text-slate-500 text-center py-12">Loading...</p>
          ) : appointments.length > 0 ? (
            appointments.map(apt => (
              <Card key={apt._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center font-bold text-teal-600 shrink-0">
                        {apt.patient?.fullName?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 text-lg">{apt.patient?.fullName}</h4>
                          {getStatusBadge(apt.status, apt.paymentStatus)}
                          {apt.paymentStatus === 'paid' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Paid</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{apt.reason}</p>
                        <div className="flex flex-wrap gap-3 text-sm font-medium">
                          <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Calendar className="h-3.5 w-3.5" /> {new Date(apt.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Clock className="h-3.5 w-3.5" /> {apt.time}
                          </span>
                          {apt.consultationType === 'online' ? (
                            <span className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                              <Video className="h-3.5 w-3.5" /> Video
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                              <MapPin className="h-3.5 w-3.5" /> Clinic
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                      {(apt.status === 'pending' || apt.status === 'pending_reschedule_by_patient') && (
                        <Button 
                          onClick={() => handleStatusChange(apt._id, 'approved_pending_payment')} 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                        >
                          Approve
                        </Button>
                      )}
                      
                      {['pending', 'pending_reschedule_by_patient'].includes(apt.status) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenReschedule(apt)}
                          className="border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Reschedule
                        </Button>
                      )}

                      {apt.status === 'scheduled' && (
                        <Button
                          onClick={() => handleStatusChange(apt._id, 'completed')}
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white"
                        >
                          Complete
                        </Button>
                      )}

                      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(apt._id)} 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl border-dashed">
              <p className="text-slate-500">No appointments scheduled.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-teal-600 mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">Schedule Management</h3>
              <p className="text-sm text-slate-500 mb-4">View your full monthly schedule and block out unavailable times.</p>
              <Button variant="outline" className="w-full">Open Calendar</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-teal-400" />
                <h3 className="font-semibold">Doctor Guidelines</h3>
              </div>
              <ul className="text-sm space-y-2 text-slate-300">
                <li>• Approve pending requests when you are available.</li>
                <li>• Suggest a reschedule if you are busy.</li>
                <li>• Mark appointments as completed after consultation.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reschedule Modal */}
      <Modal isOpen={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} title="Reschedule Appointment">
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="res-date">New Date</Label>
            <Input
              id="res-date"
              type="date"
              value={rescheduleData.date}
              onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="res-time">New Time</Label>
            <Input
              id="res-time"
              type="time"
              value={rescheduleData.time}
              onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              required
            />
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 animate-pulse shrink-0" />
            <p className="text-xs text-amber-800">
              Note: Rescheduling will notify the patient with the new timings. They can accept your reschedule or propose a new one.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Update & Notify Patient</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

