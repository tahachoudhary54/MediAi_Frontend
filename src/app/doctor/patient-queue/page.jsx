"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Activity, Clock, AlertTriangle, MessageSquare, Video } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

export default function PatientQueue() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await api.get('/appointments/doctor')
        if (res.data.success) {
          // Filter for today's appointments that are not cancelled or completed
          const today = new Date().toDateString()
          const queue = res.data.data.filter(apt =>
            new Date(apt.date).toDateString() === today &&
            (apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'scheduled')
          ).sort((a, b) => new Date(b.date) - new Date(a.date))
          setAppointments(queue)
        }
      } catch (err) {
        console.error("Failed to fetch patient queue:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchQueue()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading patient queue...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patient Queue</h1>
          <p className="text-slate-500">Manage incoming consultation requests for today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-700">Accepting Patients</span>
        </div>
      </div>

      <div className="grid gap-4">
        {appointments.length > 0 ? (
          appointments.map((apt, index) => {
            const isHighRisk = apt.reason?.toLowerCase().includes('pain') || apt.reason?.toLowerCase().includes('chest')

            return (
              <Card key={apt._id} className={`overflow-hidden transition-all hover:shadow-md ${isHighRisk ? 'border-red-200 shadow-sm shadow-red-100' : ''}`}>
                <CardContent className="p-0 flex flex-col md:flex-row">

                  {/* Status & Priority Indicator */}
                  <div className={`w-full md:w-32 flex flex-row md:flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-100 ${isHighRisk ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'}`}>
                    <h2 className="text-3xl font-bold mr-3 md:mr-0 md:mb-1">#{index + 1}</h2>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Clock className="h-4 w-4" /> {apt.time}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{apt.patient?.fullName || "Patient"}</h3>
                        <Badge variant={isHighRisk ? 'destructive' : 'success'}>
                          {isHighRisk ? 'High' : 'Normal'} Priority
                        </Badge>
                        {isHighRisk && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <AlertTriangle className="h-3 w-3" /> Urgent
                          </span>
                        )}
                      </div>

                      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                          <Activity className="h-3 w-3" /> Appointment Reason
                        </p>
                        <p className="text-sm text-slate-800 font-medium">{apt.reason || "General Checkup"}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                      <Link href="/doctor/chat" className="w-full">
                        <Button className={`w-full gap-2 bg-teal-600 hover:bg-teal-700 ${isHighRisk ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}>
                          <Video className="h-4 w-4" /> Consult Now
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full gap-2 border-slate-200">
                        <MessageSquare className="h-4 w-4" /> Message
                      </Button>
                    </div>
                  </div>

                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl border-dashed">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">Queue is empty</h3>
            <p className="text-slate-500">There are no patients scheduled for today right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
