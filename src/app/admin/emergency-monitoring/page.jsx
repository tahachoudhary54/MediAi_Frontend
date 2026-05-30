"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { AlertTriangle, MapPin, Phone, Activity, Clock, Shield, Search, Truck, Check, Archive } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

export default function EmergencyMonitoring() {
  const [emergencies, setEmergencies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("Active")
  const [riskFilter, setRiskFilter] = useState("All")
  const [checkedItems, setCheckedItems] = useState({})

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

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
        toast.success("Emergency case archived")
        fetchEmergencies()
      }
    } catch (err) {
      console.error("Failed to archive:", err)
      toast.error("Failed to archive case")
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
        matchesStatus = true;
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
              <p className="text-3xl font-bold text-slate-900">{emergencies.length}</p>
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

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Emergency Cards - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          {filteredEmergencies.length > 0 ? (
            filteredEmergencies.map((emergency) => (
              <Card key={emergency._id} className="border-red-200 shadow-sm overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${emergency.riskLevel === 'Critical' ? 'bg-red-600' : 'bg-red-400'}`}></div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getRiskBadge(emergency.riskLevel)}
                        {getStatusBadge(emergency.status)}
                        <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                          <Clock className="h-3 w-3" /> {new Date(emergency.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{emergency.patient?.fullName || "Anonymous Patient"}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Symptoms</p>
                          <p className="text-sm text-slate-700 font-medium">{emergency.symptoms}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                          {emergency.latitude && emergency.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors w-fit"
                            >
                              <MapPin className="h-4 w-4 text-red-500" />
                              {`${emergency.latitude.toFixed(4)}, ${emergency.longitude.toFixed(4)}`}
                              {emergency.accuracy ? ` (±${Math.round(emergency.accuracy)}m)` : ''}
                            </a>
                          ) : (
                            <p className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              Unavailable
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</p>
                          <p className="text-sm text-slate-700 font-medium">{emergency.patient?.phone || "N/A"}</p>
                          {emergency.patient?.emergencyContact?.phone && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Emergency Contact</p>
                              <p className="text-sm text-slate-700 font-medium">{emergency.patient.emergencyContact.phone}</p>
                              {emergency.patient.emergencyContact.name && (
                                <p className="text-[10px] text-slate-500 font-medium">{emergency.patient.emergencyContact.name} ({emergency.patient.emergencyContact.relation || 'Unknown'})</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {emergency.nearestDoctors?.length > 0 && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Nearest Doctors</p>
                          <div className="flex flex-wrap gap-2">
                            {emergency.nearestDoctors.map((doc, idx) => (
                              <Badge key={idx} variant="outline" className="bg-white text-xs py-0.5">
                                {doc.doctor?.fullName || "Doctor"} ({doc.distance?.toFixed(1)} km)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-6 min-w-[180px]">
                      {emergency.status === 'pending' && (
                        <Button
                          onClick={() => handleUpdateStatus(emergency._id, 'assigned')}
                          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          Mark Dispatched
                        </Button>
                      )}
                      {emergency.status !== 'resolved' && (
                        <Button
                          onClick={() => handleUpdateStatus(emergency._id, 'resolved')}
                          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        >
                          Mark Resolved
                        </Button>
                      )}
                      {emergency.status === 'resolved' && !emergency.isArchived && (
                        <Button
                          variant="outline"
                          onClick={() => handleArchive(emergency._id)}
                          className="w-full gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm"
                        >
                          <Archive className="h-4 w-4" />
                          Archive Case
                        </Button>
                      )}
                      <a
                        href={`tel:${emergency.patient?.phone || ''}`}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 w-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                      >
                        <Phone className="h-4 w-4 mr-2 text-slate-500" />
                        Call Patient
                      </a>
                      <Button
                        variant="outline"
                        onClick={() => toast.success("🚑 Ambulance dispatched! ETA: 5 mins")}
                        className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                      >
                        <Truck className="h-4 w-4" />
                        Dispatch Ambulance
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

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-6">

          {/* Risk Distribution */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-600" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {['Critical', 'High', 'Medium', 'Low'].map(level => {
                const count = emergencies.filter(e => e.riskLevel === level).length
                const total = emergencies.length || 1
                const percent = (count / total) * 100
                return (
                  <div key={level} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{level}</span>
                      <span className="text-slate-500 font-semibold">{count}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${level === 'Critical' ? 'bg-red-600' : level === 'High' ? 'bg-red-400' : level === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Response Checklist */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-teal-600" />
                Response Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-1">
              {[
                "Confirm patient location",
                "Assess risk and symptoms",
                "Assign nearest doctor/EMS",
                "Notify emergency contacts",
                "Follow up until resolved"
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 text-sm text-slate-600 cursor-pointer hover:bg-slate-50 rounded-md transition-colors"
                  onClick={() => toggleCheck(i)}
                >
                  <div className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checkedItems[i] ? 'bg-teal-600 border-teal-600' : 'border-slate-300'}`}>
                    {checkedItems[i] && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={checkedItems[i] ? 'line-through text-slate-400' : ''}>{item}</span>
                </div>
              ))}
              {Object.values(checkedItems).filter(Boolean).length === 5 && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <p className="text-sm font-semibold text-emerald-700">✓ All steps completed!</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
