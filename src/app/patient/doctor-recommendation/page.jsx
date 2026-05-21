"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Star, Clock, Video, MessageSquare, Calendar, Stethoscope } from "lucide-react"
import api from "@/lib/api"
import Link from "next/link"
import { io } from "socket.io-client"

export default function DoctorRecommendation() {
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [specialization, setSpecialization] = useState("All")

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/doctors')
        if (res.data.success) {
          setDoctors(res.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch doctors:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDoctors()
  }, [])

  useEffect(() => {
    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socket.on('doctorStatusChanged', (data) => {
      setDoctors(prevDoctors =>
        prevDoctors.map(doc =>
          doc._id === data.doctorId
            ? { ...doc, onlineStatus: data.status, breakExpiresAt: data.breakExpiresAt }
            : doc
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specialization === "All" || doc.specialization === specialization;
    return matchesSearch && matchesSpec;
  })

  const uniqueSpecializations = ["All", ...new Set(doctors.map(d => d.specialization).filter(Boolean))]

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Finding the best doctors for you...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recommended Doctors</h1>
        <p className="text-slate-500">Based on your recent symptom check and medical history.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search doctors, specialties, or clinics..."
            className="pl-10 text-slate-900 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            {uniqueSpecializations.map(spec => (
              <option key={spec} value={spec}>{spec === "All" ? "All Specialties" : spec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="overflow-hidden hover:border-teal-200 transition-all hover:shadow-md group">
              <CardContent className="p-0 sm:flex">
                <div className="bg-slate-50 w-full sm:w-48 flex flex-col items-center justify-center p-6 border-r border-slate-100">
                  <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border-4 border-white shadow-sm">
                    <span className="text-2xl font-bold text-teal-700">{doctor.fullName?.charAt(0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    4.9
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Dr. {doctor.fullName}</h3>
                        <p className="text-teal-600 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Stethoscope className="h-4 w-4" /> {doctor.specialization}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          className="font-extrabold text-[9px] uppercase px-2 py-0.5 border shadow-sm"
                          style={{
                            color: (doctor.onlineStatus === 'available' || !doctor.onlineStatus) ? '#10b981' : doctor.onlineStatus === 'busy' ? '#ef4444' : '#f97316',
                            borderColor: (doctor.onlineStatus === 'available' || !doctor.onlineStatus) ? '#a7f3d0' : doctor.onlineStatus === 'busy' ? '#fecaca' : '#fed7aa',
                            backgroundColor: (doctor.onlineStatus === 'available' || !doctor.onlineStatus) ? '#ecfdf5' : doctor.onlineStatus === 'busy' ? '#fef2f2' : '#fff7ed'
                          }}
                        >
                          {(() => {
                            const formatTime12 = (t) => {
                              if (!t) return '';
                              const [h, m] = t.split(':');
                              const hours = parseInt(h, 10);
                              const ampm = hours >= 12 ? 'PM' : 'AM';
                              const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
                              return `${formattedHours}:${m} ${ampm}`;
                            };
                            return (doctor.onlineStatus === 'available' || !doctor.onlineStatus)
                              ? '🟢 Available'
                              : doctor.onlineStatus === 'busy'
                                ? '🔴 Busy (In Chat)'
                                : doctor.breakExpiresAt
                                  ? `🟠 On Break (until ${new Date(doctor.breakExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                                  : doctor.dailyBreak?.enabled
                                    ? `🟠 Scheduled Break (${formatTime12(doctor.dailyBreak.startTime)} - ${formatTime12(doctor.dailyBreak.endTime)})`
                                    : '🟠 On Break';
                          })()}
                        </Badge>
                        <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">Verified</Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600 mt-4">
                      <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> {doctor.yearsOfExperience || 5}+ yrs Exp.</span>
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {doctor.hospitalName || "MediAI Clinic"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                    <Link href="/patient/appointments" className="flex-1 sm:flex-none">
                      <Button className="w-full gap-2 bg-teal-600 hover:bg-teal-700 shadow-sm">
                        <Calendar className="h-4 w-4" /> Book Appointment
                      </Button>
                    </Link>
                    <Link href={`/patient/chat?doctorId=${doctor._id}`} className="flex-1 sm:flex-none">
                      <Button variant="outline" className="w-full gap-2 text-teal-600 border-teal-200 hover:bg-teal-50">
                        <MessageSquare className="h-4 w-4" /> Start Chat
                      </Button>
                    </Link>
                    <div className="flex gap-2 ml-auto">
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 text-slate-400 border border-slate-100" title="Video Consultation Available">
                        <Video className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search filters or specialization.</p>
          </div>
        )}
      </div>
    </div>
  )
}
