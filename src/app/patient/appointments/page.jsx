"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input, Label } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Calendar as CalendarIcon, Clock, Video, MapPin, Search, Plus, Filter, XCircle, MessageCircle, BellRing, X, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AppointmentsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [chatNowAlert, setChatNowAlert] = useState(null) // { doctorName, doctorId, aptId }

  // Patient Rescheduling modal states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" })

  const [formData, setFormData] = useState({
    doctor: "",
    date: "",
    time: "",
    consultationType: "video",
    reason: ""
  })

  const selectedDoc = doctors.find(d => d._id === formData.doctor);

  const getAvailabilityText = (doc) => {
    if (!doc.weeklyAvailability || doc.weeklyAvailability.length === 0) {
      return "Monday till Friday (09:00 AM - 05:00 PM)";
    }
    const availableDays = doc.weeklyAvailability
      .filter(d => d.available)
      .map(d => d.day);

    if (availableDays.length === 0) {
      return "Not accepting appointments";
    }

    const standardOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const activeDays = standardOrder.filter(d => availableDays.includes(d));

    let availabilityString = "";
    if (activeDays.length === 1) {
      availabilityString = activeDays[0];
    } else {
      const indices = activeDays.map(d => standardOrder.indexOf(d));
      let isContinuous = true;
      for (let k = 1; k < indices.length; k++) {
        if (indices[k] !== indices[k - 1] + 1) {
          isContinuous = false;
          break;
        }
      }
      if (isContinuous && activeDays.length > 1) {
        availabilityString = `${activeDays[0]} till ${activeDays[activeDays.length - 1]}`;
      } else {
        availabilityString = `${activeDays.slice(0, -1).join(', ')} and ${activeDays[activeDays.length - 1]}`;
      }
    }

    const firstActiveDay = doc.weeklyAvailability.find(d => d.available);
    let timeRange = "";
    if (firstActiveDay && firstActiveDay.startTime && firstActiveDay.endTime) {
      const format12h = (timeStr) => {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":");
        const hr = parseInt(h);
        const ampm = hr >= 12 ? "PM" : "AM";
        const hr12 = hr % 12 || 12;
        return `${hr12}:${m} ${ampm}`;
      };
      timeRange = ` (${format12h(firstActiveDay.startTime)} - ${format12h(firstActiveDay.endTime)})`;
    }

    return `${availabilityString}${timeRange}`;
  };

  const fetchAppointments = async () => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');

    if (!token) {
      setError("Please login to view appointments");
      return;
    }

    if (role !== 'patient') {
      setError("Access denied. This page is for patients only.");
      return;
    }
    try {
      setIsLoading(true)
      setError("")
      const res = await api.get('/appointments/patient')
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

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors')
      if (res.data.success) {
        setDoctors(res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchDoctors()

    const handleCancelledEvent = () => {
      console.log("[AppointmentsPage] Received appointmentCancelled custom event. Hot-reloading...");
      fetchAppointments()
    }
    window.addEventListener("appointmentCancelled", handleCancelledEvent)

    const interval = setInterval(fetchAppointments, 10000) // Poll every 10s
    return () => {
      clearInterval(interval)
      window.removeEventListener("appointmentCancelled", handleCancelledEvent)
    }
  }, [])

  // ── Appointment-time popup checker ─────────────────────────────
  useEffect(() => {
    const checkAppointmentTime = () => {
      const now = new Date()
      // Load alerted IDs from localStorage to persist across reloads
      let alertedIds = []
      try {
        const stored = localStorage.getItem('alertedAptIds')
        if (stored) alertedIds = JSON.parse(stored)
      } catch (e) {}
      const alertedSet = new Set(alertedIds)

      appointments.forEach(apt => {
        if (alertedSet.has(apt._id)) return
        if (apt.status !== 'confirmed' && apt.status !== 'scheduled' && apt.status !== 'pending') return

        // Parse appointment date + time string (e.g. "10:30 AM")
        const aptDate = new Date(apt.date)
        if (apt.time) {
          const [timePart, modifier] = apt.time.split(' ')
          let [hours, minutes] = timePart.split(':').map(Number)
          if (modifier === 'PM' && hours !== 12) hours += 12
          if (modifier === 'AM' && hours === 12) hours = 0
          aptDate.setHours(hours, minutes, 0, 0)
        }

        // Trigger popup within a ±5 min window of appointment time
        const diffMs = aptDate - now
        if (diffMs >= -5 * 60 * 1000 && diffMs <= 5 * 60 * 1000) {
          alertedSet.add(apt._id)
          try {
            localStorage.setItem('alertedAptIds', JSON.stringify([...alertedSet]))
          } catch(e) {}
          setChatNowAlert({
            doctorName: apt.doctor?.fullName || 'your doctor',
            doctorId: apt.doctor?._id,
            aptId: apt._id,
            time: apt.time,
            consultationType: apt.consultationType,
          })
        }
      })
    }

    checkAppointmentTime() // run immediately
    const timer = setInterval(checkAppointmentTime, 60 * 1000) // check every minute
    return () => clearInterval(timer)
  }, [appointments])

  const handleStartVideoCall = async (apt) => {
    try {
      const res = await api.post('/chats', { appointmentId: apt._id })
      if (res.data.success) {
        const chatId = res.data.data._id
        window.location.href = `/patient/video-call?chatId=${chatId}&isVideo=true`
      }
    } catch (err) {
      console.error("Failed to start video call", err)
      toast.error(err.response?.data?.message || "Failed to start video call")
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    try {
      // Map consultationType to backend enum
      const payload = {
        ...formData,
        consultationType: formData.consultationType === "video" ? "online" : formData.consultationType === "chat" ? "chat" : "offline",
        reason: formData.reason || "General Consultation" // Ensure reason is not empty
      }

      const res = await api.post('/appointments', payload)
      if (res.data.success) {
        setIsBookingModalOpen(false)
        setFormData({
          doctor: "", date: "", time: "", consultationType: "video", reason: ""
        })
        toast.success("Appointment requested successfully! Waiting for doctor's approval.")
        fetchAppointments()
      }
    } catch (err) {
      console.error("Failed to book appointment", err)
      toast.error(err.response?.data?.message || err.message || "Failed to book appointment")
    }
  }

  const handleAcceptReschedule = async (id) => {
    try {
      await api.put(`/appointments/${id}`, { status: 'approved_pending_payment' })
      toast.success("Schedule accepted! Please complete your payment now.")
      fetchAppointments()
    } catch (err) {
      console.error("Failed to accept schedule", err)
      toast.error(err.response?.data?.message || "Failed to accept schedule")
    }
  }

  const handlePayment = async (aptId) => {
    try {
      toast.success("Redirecting to checkout...")
      const paymentRes = await api.post('/payment/checkout', {
        itemId: aptId,
        type: 'appointment'
      })

      if (paymentRes.data.success) {
        router.push(paymentRes.data.data.url)
      } else {
        toast.error("Failed to initiate payment")
      }
    } catch (err) {
      console.error("Payment error:", err)
      toast.error(err.response?.data?.message || "Failed to process payment request")
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
      toast.success("Suggested new schedule to doctor.")
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reschedule")
    }
  }

  const handleCancelAppointment = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}`, { status: 'cancelled' })
      toast.success("Appointment cancelled")
      fetchAppointments()
    } catch (err) {
      console.error("Failed to cancel appointment", err)
      toast.error(err.response?.data?.message || "Failed to cancel appointment")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">Confirmed & Scheduled</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">Awaiting Doctor Approval</Badge>;
      case 'pending_reschedule_by_doctor':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium animate-pulse">Doctor Rescheduled</Badge>;
      case 'pending_reschedule_by_patient':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-medium">Waiting for Doctor Response</Badge>;
      case 'approved_pending_payment':
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 font-medium">Approved (Awaiting Payment)</Badge>;
      case 'completed':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-200 font-medium">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200 font-medium">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const isUpcoming = ['pending', 'pending_reschedule_by_doctor', 'pending_reschedule_by_patient', 'approved_pending_payment', 'scheduled', 'confirmed'].includes(apt.status);
    const isPast = apt.status === 'completed' || apt.status === 'cancelled';

    const matchesTab = activeTab === "upcoming" ? isUpcoming : isPast;

    const docName = apt.doctor?.fullName || "";
    const matchesSearch = docName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">

      {/* ── Appointment Time Popup ── */}
      {chatNowAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 fade-in">
            {/* Teal top bar */}
            <div className="h-2 bg-gradient-to-r from-teal-400 to-teal-600" />

            {/* Close */}
            <button
              onClick={() => setChatNowAlert(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {/* Icon */}
              <div className="mx-auto mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-teal-50 ring-4 ring-teal-100">
                <BellRing className="h-7 w-7 text-teal-600 animate-bounce" />
              </div>

              <h2 className="text-xl font-bold text-slate-900 text-center">It's appointment time!</h2>
              <p className="text-slate-500 text-sm text-center mt-2">
                Your appointment with <span className="font-semibold text-slate-700">Dr. {chatNowAlert.doctorName}</span> is happening now.
              </p>
              <p className="text-xs text-slate-400 text-center mt-1">⏰ {chatNowAlert.time}</p>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href={`/patient/chat?doctorId=${chatNowAlert.doctorId}`}
                  onClick={() => setChatNowAlert(null)}
                >
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white gap-2 h-11 text-base shadow-sm">
                    <MessageCircle className="h-5 w-5" /> Chat Now!
                  </Button>
                </Link>

                {chatNowAlert.consultationType === 'online' && (
                  <Button variant="outline" className="w-full gap-2 h-10 border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => {
                    const apt = appointments.find(a => a._id === chatNowAlert.aptId)
                    if (apt) handleStartVideoCall(apt)
                    setChatNowAlert(null)
                  }}>
                    <Video className="h-4 w-4" /> Join Video Call
                  </Button>
                )}

                <button
                  onClick={() => setChatNowAlert(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 text-center mt-1 underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Appointments</h1>
          <p className="text-slate-500">Manage your upcoming and past consultations.</p>
        </div>
        <Button onClick={() => setIsBookingModalOpen(true)} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
          <Plus className="h-4 w-4" /> Book Appointment
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "past" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            Past Appointments
          </button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 text-slate-600 bg-white">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full sm:w-64 rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading appointments...</div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => (
            <Card key={apt._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                {/* Date/Time Block */}
                <div className="bg-slate-50 sm:w-48 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
                  <div className="text-center">
                    <p className="text-sm font-medium text-teal-600 uppercase tracking-wider">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-3xl font-bold text-slate-900 leading-none my-1">{new Date(apt.date).getDate()}</p>
                    <p className="text-sm text-slate-500">{apt.time}</p>
                  </div>
                </div>

                {/* Details Block */}
                <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6 sm:items-center justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">Dr. {apt.doctor?.fullName || 'Unknown'}</h3>
                      {getStatusBadge(apt.status)}
                      
                      {apt.paymentStatus === 'paid' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Paid ₹{apt.amount || 500}</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Payment Pending</Badge>
                      )}
                    </div>
                    <p className="text-slate-600">{apt.doctor?.specialization}</p>
                    {apt.reason && <p className="text-sm text-slate-500 mt-1">Reason: {apt.reason}</p>}

                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                      {apt.consultationType === "online" ? (
                        <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium">
                          <Video className="h-4 w-4" /> Video Consultation
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                          <MapPin className="h-4 w-4" /> Clinic Visit
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 sm:pl-6 sm:border-l border-slate-100 shrink-0 min-w-[150px]">
                    {/* Collaborative actions */}
                    {apt.status === "pending_reschedule_by_doctor" && (
                      <div className="flex flex-col gap-2 w-full">
                        <Button 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                          onClick={() => handleAcceptReschedule(apt._id)}
                        >
                          Accept Suggested Time
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full text-xs font-medium border-slate-200 hover:bg-slate-50"
                          onClick={() => handleOpenReschedule(apt)}
                        >
                          Suggest New Time
                        </Button>
                      </div>
                    )}

                    {apt.status === "approved_pending_payment" && (
                      <div className="flex flex-col gap-2 w-full">
                        <Button 
                          className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold animate-pulse hover:from-teal-600 hover:to-emerald-700 text-sm shadow-md"
                          onClick={() => handlePayment(apt._id)}
                        >
                          Pay Now to Book
                        </Button>
                      </div>
                    )}

                    {/* Standard Action buttons */}
                    {(apt.status === "confirmed" || apt.status === "scheduled") && (
                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          className="w-full bg-teal-600 hover:bg-teal-700"
                          onClick={() => window.location.href = `/patient/chat?doctorId=${apt.doctor?._id}`}
                        >
                          Chat
                        </Button>
                        {apt.consultationType === "online" && (
                          <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => handleStartVideoCall(apt)}
                          >
                            <Video className="h-4 w-4 mr-2" /> Video Call
                          </Button>
                        )}
                      </div>
                    )}

                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <Button 
                        variant="outline" 
                        onClick={() => handleCancelAppointment(apt._id)} 
                        className="w-full text-xs text-red-600 border-red-100 hover:text-red-700 hover:bg-red-50"
                      >
                        Cancel Appointment
                      </Button>
                    )}

                    {(apt.status === 'completed' || apt.status === 'cancelled') && (
                      <Button 
                        className="w-full bg-slate-900 text-white hover:bg-slate-800" 
                        onClick={() => setIsBookingModalOpen(true)}
                      >
                        Book Follow-up
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl border-dashed">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <CalendarIcon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No appointments found</h3>
            <p className="text-slate-500 mt-1 mb-4">You have no {activeTab} appointments.</p>
            {activeTab === "upcoming" && (
              <Button onClick={() => setIsBookingModalOpen(true)}>Book your first appointment</Button>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} title="Book Appointment">
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">Select Doctor</Label>
            <select
              id="doctor"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              required
            >
              <option value="" disabled>Select a doctor...</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  Dr. {doc.fullName} - {doc.specialization}
                </option>
              ))}
            </select>
            {selectedDoc && (
              <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-start gap-2.5 mt-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
                <CalendarIcon className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-teal-800">Doctor Availability: </span>
                  <span className="text-slate-600 font-medium capitalize">
                    {getAvailabilityText(selectedDoc)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="consultationType">Consultation Type</Label>
            <select
              id="consultationType"
              value={formData.consultationType}
              onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <option value="video">Video Consultation</option>
              <option value="chat">Chat Consultation</option>
              <option value="in-person">In-person Clinic Visit</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Visit</Label>
            <Input
              id="reason"
              placeholder="e.g. Regular checkup, Headache..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-medium">Book Appointment</Button>
          </div>
        </form>
      </Modal>

      {/* Patient Reschedule Suggestion Modal */}
      <Modal isOpen={isRescheduleModalOpen} onClose={() => setIsRescheduleModalOpen(false)} title="Suggest Alternative Timing">
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient-res-date">Preferred Date</Label>
            <Input
              id="patient-res-date"
              type="date"
              value={rescheduleData.date}
              onChange={e => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient-res-time">Preferred Time</Label>
            <Input
              id="patient-res-time"
              type="time"
              value={rescheduleData.time}
              onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              required
            />
          </div>
          <div className="bg-teal-50 p-3 rounded-lg border border-teal-100 flex items-start gap-2 animate-pulse">
            <CalendarIcon className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
            <p className="text-xs text-teal-800">
              Note: The doctor will see this timing proposal and can approve it to prompt your checkout payment.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Suggest to Doctor</Button>
          </div>
        </form>
      </Modal>

    </div>
  )
}

