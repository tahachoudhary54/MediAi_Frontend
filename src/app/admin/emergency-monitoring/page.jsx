"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertTriangle, MapPin, Phone, Activity, Clock, Shield, Search, Truck, Archive, Check, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

export default function EmergencyMonitoring() {
  const [emergencies, setEmergencies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Active")
  const [riskFilter, setRiskFilter] = useState("All")
  const fetchEmergencies = async () => {
    try {
      const res = await api.get('/admin/emergencies')
      if (res.data.success) {
        setEmergencies(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch emergencies:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmergencies()
    const interval = setInterval(fetchEmergencies, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const playAlertSound = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playNote = (freq, startTime, duration) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        };
        const now = audioCtx.currentTime;
        // Play an urgent two-tone alert pattern twice
        playNote(880, now, 0.2);
        playNote(1108.73, now + 0.15, 0.4);
        playNote(880, now + 0.45, 0.2);
        playNote(1108.73, now + 0.60, 0.4);
      } catch (e) {
        console.warn("Audio alert failed to play:", e);
      }
    };

    const handleEmergencyAlert = (e) => {
      const newEmergency = e.detail;
      playAlertSound();
      // Toast and Voice message are handled in the global admin layout
      setEmergencies(prev => {
        if (prev.some(item => item._id === newEmergency._id)) return prev;
        return [newEmergency, ...prev];
      });
    };

    window.addEventListener("emergency_alert_received", handleEmergencyAlert);

    return () => {
      window.removeEventListener("emergency_alert_received", handleEmergencyAlert);
    };
  }, [])

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/admin/emergencies/${id}/status`, { status })
      if (res.data.success) {
        toast.success(`Emergency status updated to ${status}`)
        fetchEmergencies()
      }
    } catch (err) {
      console.error("Failed to update status:", err)
      toast.error("Failed to update status")
    }
  }

  const handleArchive = async (id) => {
    try {
      const res = await api.patch(`/admin/emergencies/${id}/archive`)
      if (res.data.success) {
        toast.success("Emergency removed from dashboard")
        fetchEmergencies()
      }
    } catch (err) {
      console.error("Failed to archive:", err)
      toast.error("Failed to remove case")
    }
  }

  const filteredEmergencies = useMemo(() => {
    return emergencies.filter(item => {
      const patientName = item.patient?.fullName || ""
      const symptoms = item.symptoms || ""
      const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        symptoms.toLowerCase().includes(searchQuery.toLowerCase())

      let matchesStatus = true;
      if (statusFilter === "Active") {
        matchesStatus = (item.status === 'pending' || item.status === 'assigned') && !item.isArchived;
      } else if (statusFilter === "Resolved") {
        matchesStatus = item.status === 'resolved' && !item.isArchived;
      } else if (statusFilter === "All") {
        matchesStatus = !item.isArchived;
      }

      const matchesRisk = riskFilter === "All" || item.riskLevel === riskFilter
      return matchesSearch && matchesStatus && matchesRisk
    })
  }, [emergencies, searchQuery, statusFilter, riskFilter])

  const getRiskBadge = (level) => {
    switch (level) {
      case 'Critical': return <Badge variant="destructive" className="animate-pulse">CRITICAL</Badge>
      case 'High': return <Badge variant="destructive">HIGH</Badge>
      case 'Medium': return <Badge variant="warning">MEDIUM</Badge>
      case 'Low': return <Badge variant="success">LOW</Badge>
      default: return <Badge variant="default">{level}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'assigned':
      case 'in progress': return <Badge className="bg-blue-100 text-blue-700 border border-blue-200">Dispatched</Badge>
      case 'resolved': return <Badge variant="success">Resolved</Badge>
      default: return <Badge variant="default">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Initializing live emergency feed...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Emergency Monitoring</h1>
          <p className="text-slate-500">Real-time view of high-risk cases and SOS triggers.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          Live Feed Active
        </div>
      </div>

      {/* Stats Row - Full Width */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-red-600">{emergencies.filter(e => e.status === 'pending' && !e.isArchived).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Dispatched</p>
              <p className="text-3xl font-bold text-blue-600">{emergencies.filter(e => e.status === 'assigned' && !e.isArchived).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Resolved</p>
              <p className="text-3xl font-bold text-emerald-600">{emergencies.filter(e => e.status === 'resolved' && !e.isArchived).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <Clock className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Cases</p>
              <p className="text-3xl font-bold text-slate-900">{emergencies.filter(e => !e.isArchived).length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <Card className="bg-slate-50/50">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by patient name or symptoms..."
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {['Active', 'Resolved', 'All'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === tab ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="All">All Risk Levels</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-4">
          {filteredEmergencies.length > 0 ? (
            filteredEmergencies.map((emergency) => (
              <Card key={emergency._id} className="relative overflow-hidden border-slate-200 transition-all hover:shadow-md">
                <div className={`h-1.5 w-full ${emergency.riskLevel === 'Critical' ? 'bg-red-500' : 'bg-red-400'}`}></div>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    
                    {/* Main Info Area */}
                    <div className="flex-1 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           {getRiskBadge(emergency.riskLevel)}
                           {getStatusBadge(emergency.status)}
                        </div>
                        <span className="text-sm text-slate-500 flex items-center gap-1.5 font-medium">
                           <Clock className="h-4 w-4" /> {new Date(emergency.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">{emergency.patient?.fullName || "Anonymous Patient"}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                         {/* Section 1: Medical Info */}
                         <div>
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <Activity className="h-4 w-4" /> Symptoms
                           </h4>
                           <p className="text-slate-800 font-medium text-sm leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                             {emergency.symptoms}
                           </p>
                         </div>
                         
                         {/* Section 2: Location Info */}
                         <div>
                           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                             <MapPin className="h-4 w-4" /> Location
                           </h4>
                           <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                             {emergency.latitude && emergency.longitude ? (
                               <a
                                  href={`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                               >
                                  <div className="p-1.5 bg-blue-100 rounded-md"><MapPin className="h-4 w-4 text-blue-600" /></div>
                                  <span>{`${emergency.latitude.toFixed(4)}, ${emergency.longitude.toFixed(4)}`}</span>
                               </a>
                             ) : (
                               <span className="text-sm text-slate-500 font-medium">Unavailable</span>
                             )}
                           </div>
                         </div>
                         
                         {/* Section 3: Contact Info */}
                         <div className="md:col-span-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                               <Phone className="h-4 w-4" /> Contacts
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                               <div>
                                  <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Patient Phone</p>
                                  <p className="text-sm font-semibold text-slate-900">{emergency.patient?.phone || "N/A"}</p>
                               </div>
                               {emergency.patient?.emergencyContact?.phone && (
                                 <div>
                                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Emergency Contact</p>
                                    <p className="text-sm font-semibold text-slate-900">{emergency.patient.emergencyContact.phone}</p>
                                    {emergency.patient.emergencyContact.name && (
                                      <p className="text-xs text-slate-500 mt-0.5">{emergency.patient.emergencyContact.name} ({emergency.patient.emergencyContact.relation || 'Unknown'})</p>
                                    )}
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>

                      {emergency.nearestDoctors?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nearest Doctors</p>
                          <div className="flex flex-wrap gap-2">
                            {emergency.nearestDoctors.map((doc, idx) => (
                              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-sm font-medium text-slate-700">{doc.doctor?.fullName || "Doctor"}</span>
                                <span className="text-xs text-slate-500">({doc.distance?.toFixed(1)} km)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Area */}
                    <div className="w-full md:w-72 bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-center gap-2.5">
                       {emergency.status === 'pending' && (
                         <Button
                           onClick={() => handleUpdateStatus(emergency._id, 'assigned')}
                           className="w-full h-10 gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-semibold"
                         >
                           <Shield className="h-4 w-4" /> Mark Dispatched
                         </Button>
                       )}
                       {emergency.status !== 'resolved' && (
                         <Button
                           onClick={() => handleUpdateStatus(emergency._id, 'resolved')}
                           className="w-full h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
                         >
                           <Check className="h-4 w-4" /> Mark Resolved
                         </Button>
                       )}
                       {emergency.status === 'resolved' && !emergency.isArchived && (
                         <Button
                           variant="outline"
                           onClick={() => handleArchive(emergency._id)}
                           className="w-full h-10 gap-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold shadow-sm"
                         >
                           <Trash2 className="h-4 w-4" /> Remove from Dashboard
                         </Button>
                       )}
                       
                       <div className="h-px bg-slate-200 my-1 w-full"></div>
                       
                       <a
                         href={`tel:${emergency.patient?.phone || ''}`}
                         className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors h-10 px-4 py-2 w-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                       >
                         <Phone className="h-4 w-4 mr-2 text-slate-500" />
                         Call Patient
                       </a>
                       <Button
                         variant="outline"
                         onClick={() => toast.success("🚑 Ambulance dispatched! ETA: 5 mins")}
                         className="w-full h-10 gap-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold shadow-sm"
                       >
                         <Truck className="h-4 w-4" /> Dispatch Ambulance
                       </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl border-dashed">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 mb-4">
                <Shield className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No emergency cases found</h3>
              <p className="text-slate-500">Try adjusting your filters or search query.</p>
            </div>
          )}
      </div>
    </div>
  )
}
