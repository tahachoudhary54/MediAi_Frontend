"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Ambulance, Search, Phone, CreditCard, Car, User, Shield, Sun, Moon, Clock, AlertCircle } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

const STATUS_CONFIG = {
  available:   { label: "Available",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  on_duty:     { label: "On Duty",     color: "bg-amber-100 text-amber-700 border-amber-200" },
  maintenance: { label: "Maintenance", color: "bg-red-100 text-red-700 border-red-200" },
}

const SHIFT_CONFIG = {
  morning: { label: "Morning Shift", icon: Sun,   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  night:   { label: "Night Shift",   icon: Moon,  color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  both:    { label: "Both Shifts",   icon: Clock, color: "bg-slate-100 text-slate-600 border-slate-200" },
}

export default function SuperAdminAmbulancesPage() {
  const [ambulances, setAmbulances] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const socketRef = useRef(null)

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const res = await api.get("/ambulances")
        if (res.data.success) setAmbulances(res.data.data)
      } catch {
        toast.error("Failed to load ambulance data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAmbulances()

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    const socketUrl = apiBase.replace("/api", "")
    const socket = io(socketUrl, { withCredentials: true, transports: ["websocket", "polling"] })
    socketRef.current = socket

    socket.on("connect", () => socket.emit("joinRoom", "super_admin"))

    socket.on("ambulance_added", (newAmb) => {
      setAmbulances(prev => prev.find(a => a._id === newAmb._id) ? prev : [newAmb, ...prev])
      toast.success(`🚑 New ambulance registered: ${newAmb.numberPlate}`)
    })
    socket.on("ambulance_updated", (updated) => {
      setAmbulances(prev => prev.map(a => a._id === updated._id ? updated : a))
    })
    socket.on("ambulance_deleted", (id) => {
      setAmbulances(prev => prev.filter(a => a._id !== id))
    })

    return () => socket.disconnect()
  }, [])

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
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ambulance Fleet Overview</h1>
          <p className="text-slate-500 mt-1 text-sm">Read-only real-time view of all registered ambulances.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live Updates
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Fleet",  value: stats.total,       color: "bg-indigo-50 text-indigo-600",  ring: "border-indigo-100"  },
          { label: "Available",    value: stats.available,   color: "bg-emerald-50 text-emerald-600", ring: "border-emerald-100" },
          { label: "On Duty",      value: stats.on_duty,     color: "bg-amber-50 text-amber-600",    ring: "border-amber-100"   },
          { label: "Maintenance",  value: stats.maintenance, color: "bg-red-50 text-red-600",        ring: "border-red-100"     },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl border ${stat.ring} p-5 bg-white flex items-center gap-4 shadow-sm`}>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">{stat.label}</p>
              <p className="text-3xl font-extrabold text-slate-900 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by driver name or plate..."
          className="pl-9 bg-white border-slate-200 text-slate-900"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Ambulance Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading fleet data...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Ambulance className="w-14 h-14 text-slate-200" />
          <p className="text-base font-semibold text-slate-700">No ambulances found</p>
          <p className="text-sm">Admins can register ambulances from their panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(amb => {
            const statusCfg = STATUS_CONFIG[amb.status] || STATUS_CONFIG.available
            const shiftCfg  = SHIFT_CONFIG[amb.shift || "morning"]
            const ShiftIcon = shiftCfg.icon

            return (
              <Card key={amb._id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Card top strip */}
                <div className="h-1.5 bg-gradient-to-r from-teal-500 to-indigo-500" />

                <CardContent className="p-5 space-y-4">
                  {/* Number plate + badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Car className="w-5 h-5 text-slate-600" />
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-base tracking-wide">
                        {amb.numberPlate}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${shiftCfg.color}`}>
                        <ShiftIcon className="w-3 h-3" />
                        {shiftCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Driver details */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Driver</p>
                        <p className="text-sm font-semibold text-slate-800">{amb.driverName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Phone</p>
                        <p className="text-sm font-medium text-slate-700">{amb.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Driving License</p>
                        <p className="text-sm font-mono text-slate-700">{amb.drivingLicense}</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Footer: added by + date */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span>
                        {amb.addedBy?.fullName
                          ? <span className="font-medium text-slate-600">{amb.addedBy.fullName}</span>
                          : "Unknown Admin"}
                      </span>
                    </div>
                    <span>{new Date(amb.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
