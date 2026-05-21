"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, FileText, AlertTriangle, ChevronRight, Activity, DollarSign } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        if (typeof window !== 'undefined') {
          const storedUser = sessionStorage.getItem('user')
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser)
            setDoctor(parsedUser.user || parsedUser)
          }
        }

        const [apptsRes, repsRes] = await Promise.allSettled([
          api.get('/appointments/doctor'),
          api.get('/reports/doctor')
        ])

        if (apptsRes.status === 'fulfilled' && apptsRes.value.data.success) {
          setAppointments(apptsRes.value.data.data.sort((a, b) => new Date(b.date) - new Date(a.date)))
        }
        if (repsRes.status === 'fulfilled' && repsRes.value.data.success) {
          setReports(repsRes.value.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
      } catch (error) {
        console.error("Failed to fetch doctor dashboard data", error)
        toast.error(typeof error === 'string' ? error : "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctorData()
    const interval = setInterval(fetchDoctorData, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [])

  const upcomingAppointments = appointments.filter(a =>
    a.status === "Upcoming" || a.status === "scheduled" || a.status === "Scheduled" || a.status === "confirmed"
  )

  if (isLoading || !doctor) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading your doctor dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Dashboard</h1>
          <p className="text-slate-500">Welcome back, Dr. {doctor.fullName || doctor.name}. Here's your overview for today.</p>
        </div>
        {doctor.verificationStatus !== 'approved' && (
          <Badge variant="warning" className="self-start sm:self-auto text-sm py-1.5 px-3">
            <AlertTriangle className="h-4 w-4 mr-2" /> {doctor.verificationStatus === 'pending' ? 'Pending Verification' : 'Verification Issue'}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/doctor/patient-queue" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Patients"
            value={Array.from(new Set(appointments.map(a => a.patient?._id))).length}
            icon={Users}
            trend="up"
            trendValue="--"
          />
        </Link>
        <Link href="/doctor/appointments" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Today's Appointments"
            value={upcomingAppointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}
            icon={Calendar}
            description="Scheduled for today"
          />
        </Link>
        <Link href="/doctor/reports" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            title="Pending Reports"
            value={reports.filter(r => r.status === 'pending' || r.status === 'Under Doctor Review').length}
            icon={FileText}
            description="Requires verification"
          />
        </Link>
        <div className="block">
          <StatCard
            title="Emergency Cases"
            value="0"
            icon={AlertTriangle}
            trend="stable"
            trendValue="None"
            className="border-slate-200 bg-slate-50/30"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Patient Interactions</CardTitle>
                <CardDescription>Patients from your recent appointments.</CardDescription>
              </div>
              <Link href="/doctor/appointments">
                <Button variant="ghost" size="sm" className="gap-1 text-teal-600">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length > 0 ? (
                  appointments.slice(0, 3).map((apt) => (
                    <div key={apt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-semibold text-slate-900">{apt.patient?.fullName || "Patient"}</h4>
                          <Badge variant={apt.status === 'confirmed' ? 'success' : 'secondary'}>
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-slate-600">
                          <p>{apt.reason || "General Consultation"}</p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 min-w-[120px]">
                        <span className="text-xs font-medium text-slate-500">{apt.time}</span>
                        <Link href="/doctor/chat">
                          <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700">Open Chat</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <p className="text-sm text-slate-500">No recent patient interactions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Graph Mock */}
          <Card className="h-[300px]">
            <CardHeader>
              <CardTitle>Consultation Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end gap-2 h-[180px] mt-4 px-6 pb-2">
              {[60, 80, 50, 100, 75, 40, 90].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                  <div
                    className="w-full bg-teal-600 rounded-t-md hover:bg-teal-700 transition-colors relative group cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-500">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Today's Schedule</span>
                <Link href="/doctor/appointments" className="text-teal-600 hover:text-teal-700 text-sm font-normal">View All</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 5).map((apt) => (
                    <div key={apt._id} className="flex gap-4">
                      <div className="w-16 text-right">
                        <p className="text-sm font-bold text-slate-900">{apt.time.split(' ')[0]}</p>
                        <p className="text-[10px] font-medium text-slate-500">{apt.time.split(' ')[1]}</p>
                      </div>
                      <div className="flex-1 border-l-2 border-teal-200 pl-4 pb-4">
                        <p className="font-semibold text-slate-900 text-sm">{apt.patient?.fullName || "Patient"}</p>
                        <p className="text-xs text-slate-500 mb-2">{apt.consultationType || "Visit"}</p>
                        <Link href="/doctor/chat">
                          <Button variant="outline" size="sm" className="h-7 text-xs px-2 w-full border-teal-200 text-teal-700 hover:bg-teal-50">Start Consultation</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No appointments for today</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-teal-900 text-white border-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-teal-50">Earnings</h3>
                <DollarSign className="h-5 w-5 text-teal-300" />
              </div>
              <p className="text-3xl font-bold mb-1">$0.00</p>
              <p className="text-sm text-teal-300">Start consultations to earn</p>

              <Link href="/doctor/earnings">
                <Button className="w-full mt-6 bg-white text-teal-900 hover:bg-teal-50">View Wallet</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
