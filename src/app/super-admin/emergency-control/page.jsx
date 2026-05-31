"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { AlertTriangle, Clock, MapPin, Phone, User, Activity, CheckCircle, Search, Filter } from "lucide-react"

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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
      </div>
    )
  }

  const filteredEmergencies = emergencies.filter(e => filter === 'all' || e.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
            Global Emergency Control
          </h1>
          <p className="text-slate-500 mt-1">Monitor and override emergency SOS requests across all regions.</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'pending' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-700'}`}>Pending</button>
          <button onClick={() => setFilter('assigned')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'assigned' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>Assigned</button>
          <button onClick={() => setFilter('resolved')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${filter === 'resolved' ? 'bg-green-50 text-green-700' : 'text-slate-500 hover:text-slate-700'}`}>Resolved</button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmergencies.length === 0 ? (
          <div className="col-span-full py-12 bg-white rounded-xl border border-slate-200 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">All Clear</h3>
            <p className="text-slate-500">No {filter !== 'all' ? filter : ''} emergencies found at the moment.</p>
          </div>
        ) : (
          filteredEmergencies.map(emergency => {
            const isGuest = emergency.source === 'guest';
            const name = isGuest ? emergency.guestName : emergency.patient?.fullName;
            const phone = isGuest ? emergency.guestPhone : emergency.patient?.phone;
            
            return (
              <div key={emergency._id} className={`rounded-xl border overflow-hidden shadow-sm transition-all hover:shadow-md ${
                emergency.status === 'pending' ? 'border-red-200 bg-white' : 
                emergency.status === 'assigned' || emergency.status === 'dispatched' ? 'border-blue-200 bg-white' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${
                  emergency.status === 'pending' ? 'bg-red-50 border-red-100' : 
                  emergency.status === 'assigned' || emergency.status === 'dispatched' ? 'bg-blue-50 border-blue-100' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                    emergency.status === 'pending' ? 'bg-red-100 text-red-700' : 
                    emergency.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 
                    emergency.status === 'dispatched' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {emergency.status}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(emergency.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center text-lg">
                        {isGuest ? (
                          <span className="bg-purple-100 text-purple-700 text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 font-bold tracking-wider">Guest SOS</span>
                        ) : (
                          <span className="bg-teal-100 text-teal-700 text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 font-bold tracking-wider">Patient</span>
                        )}
                        {name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1.5" /> {phone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-3 text-sm border border-slate-100">
                    <p className="font-medium text-slate-700 mb-1 flex items-center">
                      <Activity className="w-4 h-4 mr-1.5 text-indigo-500" />
                      {emergency.emergencyType || 'Medical Emergency'}
                    </p>
                    <p className="text-slate-600 text-xs">{emergency.symptoms || emergency.description || 'No description provided'}</p>
                  </div>
                  
                  {emergency.latitude && emergency.longitude && (
                    <div className="flex items-center text-xs text-slate-500 bg-slate-50 p-2 rounded">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      Location Captured: {emergency.latitude.toFixed(4)}, {emergency.longitude.toFixed(4)}
                    </div>
                  )}

                  {emergency.status === 'pending' && (
                    <div className="pt-2 flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(emergency._id, 'assigned')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                      >
                        Force Assign (SA)
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(emergency._id, 'resolved')}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                  {(emergency.status === 'assigned' || emergency.status === 'dispatched') && (
                    <div className="pt-2">
                      <button 
                        onClick={() => handleStatusUpdate(emergency._id, 'resolved')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
