"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { AlertTriangle, Clock, MapPin, Phone, User, Activity, CheckCircle, Ambulance, XCircle, Shield, RefreshCw, Trash2 } from "lucide-react"

export default function EmergencyControlCenter() {
  const { token } = useAuth()
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, pending, assigned, resolved

  const fetchEmergencies = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/super-admin/emergencies`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setEmergencies(data.data)
      } else {
        toast.error(data.message || 'Failed to load emergencies')
      }
    } catch (error) {
      console.error(error)
      toast.error('Network error loading emergencies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchEmergencies()
    
    // Listen for socket events
    const handleNewEmergency = (e) => {
      fetchEmergencies()
    }
    window.addEventListener("emergency_alert_received", handleNewEmergency)
    return () => window.removeEventListener("emergency_alert_received", handleNewEmergency)
  }, [token])

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/super-admin/emergencies/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Emergency status updated to ${newStatus}`)
        fetchEmergencies()
      } else {
        toast.error(data.message)
      }
    } catch (err) {
      toast.error("Error updating status")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this emergency case? This action cannot be undone.')) {
      return
    }
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${apiBase}/super-admin/emergencies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Emergency case deleted successfully')
        fetchEmergencies()
      } else {
        toast.error(data.message || 'Failed to delete')
      }
    } catch (err) {
      toast.error('Error deleting emergency case')
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  const filteredEmergencies = emergencies.filter(e => filter === 'all' || e.status === filter)

  const pendingCount = emergencies.filter(e => e.status === 'pending').length
  const assignedCount = emergencies.filter(e => e.status === 'assigned' || e.status === 'dispatched').length
  const resolvedCount = emergencies.filter(e => e.status === 'resolved').length

  return (
    <div className="min-h-full">

      {/* ── Page Header ── */}
      <div className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              Global Emergency Control
            </h1>
            <p className="text-slate-500 mt-2 ml-14 text-[15px]">
              Monitor and override emergency SOS requests across all regions.
            </p>
          </div>

          <button
            onClick={() => { setLoading(true); fetchEmergencies() }}
            className="self-start lg:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition text-sm font-medium shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <div className="flex items-center gap-4 bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
            <p className="text-sm text-slate-500 font-medium">Pending</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{assignedCount}</p>
            <p className="text-sm text-slate-500 font-medium">Assigned / Dispatched</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{resolvedCount}</p>
            <p className="text-sm text-slate-500 font-medium">Resolved</p>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-8 w-fit">
        {[
          { key: 'all', label: 'All', activeClass: 'bg-slate-800 text-white' },
          { key: 'pending', label: 'Pending', activeClass: 'bg-red-600 text-white' },
          { key: 'assigned', label: 'Assigned', activeClass: 'bg-blue-600 text-white' },
          { key: 'resolved', label: 'Resolved', activeClass: 'bg-emerald-600 text-white' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              filter === tab.key
                ? tab.activeClass + ' shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Emergency Cards Grid ── */}
      {filteredEmergencies.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
          <CheckCircle className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Clear</h3>
          <p className="text-slate-500 text-base">
            No {filter !== 'all' ? filter : ''} emergencies found at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredEmergencies.map(emergency => {
            const isGuest = emergency.source === 'guest';
            const name = isGuest ? emergency.guestName : emergency.patient?.fullName;
            const phone = isGuest ? emergency.guestPhone : emergency.patient?.phone;

            const statusConfig = {
              pending: {
                border: 'border-red-200',
                headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
                badge: 'bg-red-100 text-red-800',
              },
              assigned: {
                border: 'border-blue-200',
                headerBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
                badge: 'bg-blue-100 text-blue-800',
              },
              dispatched: {
                border: 'border-indigo-200',
                headerBg: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                badge: 'bg-indigo-100 text-indigo-800',
              },
              resolved: {
                border: 'border-emerald-200',
                headerBg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
                badge: 'bg-emerald-100 text-emerald-800',
              },
            }
            const config = statusConfig[emergency.status] || statusConfig.pending

            return (
              <div
                key={emergency._id}
                className={`rounded-2xl border-2 ${config.border} bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col`}
              >
                {/* Card Header */}
                <div className={`${config.headerBg} px-6 py-4 flex justify-between items-center`}>
                  <span className="text-xs font-bold uppercase tracking-widest text-white/90 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {emergency.status}
                  </span>
                  <span className="text-xs text-white/80 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(emergency.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col gap-5">

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isGuest ? 'bg-purple-100' : 'bg-teal-100'}`}>
                      <User className={`w-6 h-6 ${isGuest ? 'text-purple-600' : 'text-teal-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                          isGuest ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                          {isGuest ? 'Guest SOS' : 'Patient'}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">
                        {name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{phone || 'No phone'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Emergency Details */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="font-semibold text-slate-700 flex items-center gap-2 mb-1.5 text-sm">
                      <Activity className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {emergency.emergencyType
                        ? emergency.emergencyType.charAt(0).toUpperCase() + emergency.emergencyType.slice(1)
                        : 'Medical Emergency'}
                    </p>
                    <p className="text-slate-500 text-sm leading-relaxed pl-6">
                      {emergency.symptoms || emergency.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Location */}
                  {emergency.latitude && emergency.longitude && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${emergency.latitude},${emergency.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 text-sm text-slate-600 bg-blue-50/60 border border-blue-100 p-3.5 rounded-xl hover:bg-blue-100/80 transition-colors cursor-pointer group"
                    >
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                      <span>
                        <span className="font-medium text-slate-700">Location: </span>
                        <span className="text-blue-600 group-hover:underline font-medium">
                          {emergency.latitude.toFixed(4)}, {emergency.longitude.toFixed(4)}
                        </span>
                        <span className="ml-2 text-xs text-blue-500 opacity-80">(Click to view map)</span>
                      </span>
                    </a>
                  )}

                  {/* Spacer to push buttons to bottom */}
                  <div className="flex-1" />

                  {/* Action Buttons */}
                  {emergency.status === 'pending' && (
                    <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                      {isGuest ? (
                        <button
                          onClick={() => handleStatusUpdate(emergency._id, 'dispatched')}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Ambulance className="w-4 h-4" />
                          Dispatch Ambulance
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusUpdate(emergency._id, 'assigned')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Shield className="w-4 h-4" />
                          Force Assign
                        </button>
                      )}
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(emergency._id, 'resolved')}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleDelete(emergency._id)}
                          className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center"
                          title="Delete this emergency case"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {(emergency.status === 'assigned' || emergency.status === 'dispatched') && (
                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleStatusUpdate(emergency._id, 'resolved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleDelete(emergency._id)}
                        className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                        title="Delete this emergency case"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {emergency.status === 'resolved' && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleDelete(emergency._id)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
