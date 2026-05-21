"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, Check, Calendar } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

export default function DoctorLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, token, authLoaded } = useAuth()
  const [isReady, setIsReady] = useState(false)

  // Consultation Request State
  const [incomingRequest, setIncomingRequest] = useState(null)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleTime, setRescheduleTime] = useState("")
  // Track dismissed/rejected chat IDs so polling never re-shows them
  const dismissedChatIds = useRef(new Set())

  useEffect(() => {
    if (authLoaded) {
      if (!token) {
        router.push('/auth/login?role=doctor')
      } else if (role !== 'doctor') {
        router.push(`/${role}/dashboard`)
      } else {
        setIsReady(true)
      }
    }
  }, [authLoaded, token, role, router])

  // Socket.io Setup
  useEffect(() => {
    let socket;
    const doctorId = user?._id || user?.id;
    if (isReady && role === 'doctor' && doctorId) {
      console.log(`[Socket] Doctor socket connected with doctorId: ${doctorId}`);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiBase.replace('/api', '');

      socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on("connect", () => {
        console.log(`[Socket] Doctor joined room: doctor_${doctorId}`);
        socket.emit("joinRoom", `doctor_${doctorId}`);
      });

      socket.on("connect_error", (err) => {
        console.error("[Socket] Doctor connection error:", err);
      });

      socket.on("newChatRequest", (chatData) => {
        console.log(`[Socket] Doctor received newChatRequest event:`, chatData);
        // Only show if the chat status is requested (pending)
        if (chatData.status === 'requested') {
          setIncomingRequest(chatData);
          toast.success("New consultation request!");
        }
      });

      socket.on("cancelChatRequest", (data) => {
        console.log(`[Socket] Doctor received cancelChatRequest event:`, data);
        toast.error("Patient cancelled the consultation request");
        setIncomingRequest(prev => {
          if (prev && prev._id === data.chatId) return null;
          return prev;
        });
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Doctor disconnected");
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isReady, role, user]);

  // Polling for incoming consultation requests (Fallback)
  useEffect(() => {
    let interval;
    if (isReady && role === 'doctor') {
      interval = setInterval(async () => {
        try {
          const res = await api.get('/chats/doctor/pending')
          if (res.data.success) {
            if (res.data.data.length > 0) {
              // Filter out any IDs the doctor has already dismissed/rejected
              const newRequest = res.data.data.find(
                (c) => !dismissedChatIds.current.has(c._id)
              )
              if (newRequest) {
                if (!incomingRequest || incomingRequest._id !== newRequest._id) {
                  setIncomingRequest(newRequest)
                }
              } else if (incomingRequest) {
                setIncomingRequest(null)
              }
            } else if (incomingRequest) {
              // The request was cancelled or accepted elsewhere
              setIncomingRequest(null)
            }
          }
        } catch (err) { }
      }, 10000) // Poll every 10s
    }
    return () => clearInterval(interval)
  }, [isReady, role, incomingRequest])

  const handleAccept = async () => {
    try {
      await api.put(`/chats/${incomingRequest._id}/respond`, { status: 'active' })

      // Automatically update status to busy
      try {
        await api.patch('/auth/profile', { onlineStatus: 'busy' })
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = { ...base, onlineStatus: 'busy' }
        sessionStorage.setItem("user", JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      } catch (statusErr) {
        console.error("Failed to update status to busy:", statusErr)
      }

      toast.success("Consultation accepted!")
      const chatUrl = `/doctor/chat/${incomingRequest._id}`
      dismissedChatIds.current.add(incomingRequest._id)
      setIncomingRequest(null)
      router.push(chatUrl)
    } catch (err) {
      toast.error("Failed to accept consultation")
    }
  }

  const handleBusy = async () => {
    try {
      // Mark as ended in DB so it never appears in pending again
      await api.put(`/chats/${incomingRequest._id}/respond`, { status: 'rescheduled', scheduledTime: 'Doctor is busy' })
    } catch (err) {
      // Even if backend fails, still dismiss locally
    } finally {
      dismissedChatIds.current.add(incomingRequest._id)
      setIncomingRequest(null)
      setIsRescheduling(false)
      toast("Request dismissed")
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleTime) return toast.error("Please select a time")
    try {
      await api.put(`/chats/${incomingRequest._id}/respond`, {
        status: 'rescheduled',
        scheduledTime: new Date(rescheduleTime).toLocaleString()
      })
      toast.success("Rescheduled successfully")
      dismissedChatIds.current.add(incomingRequest._id)
      setIncomingRequest(null)
      setIsRescheduling(false)
    } catch (err) {
      toast.error("Failed to reschedule")
    }
  }

  if (!authLoaded || !isReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Verifying doctor access...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="doctor" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role="doctor" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* Incoming Consultation Modal */}
      {incomingRequest && !pathname.includes(incomingRequest._id) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-teal-600 p-6 text-white text-center relative">
              <button
                onClick={handleBusy}
                className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold text-sm transition-all"
                title="Dismiss"
              >✕</button>
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Incoming Consultation</h3>
              <p className="text-teal-100 text-sm mt-1">A patient wants to chat with you right now</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                  {incomingRequest.patient?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-slate-500 font-medium">Patient Name</p>
                  <p className="text-lg font-bold text-slate-900 truncate">{incomingRequest.patient?.fullName}</p>
                </div>
              </div>

              {isRescheduling ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Suggest New Time</label>
                    <input
                      type="datetime-local"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-900 bg-white"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setIsRescheduling(false)}>Back</Button>
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={handleReschedule}>Confirm</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50" onClick={handleBusy}>
                    <Clock className="h-4 w-4 mr-2" /> Busy
                  </Button>
                  <Button className="h-12 bg-teal-600 hover:bg-teal-700 font-bold shadow-lg shadow-teal-100" onClick={handleAccept}>
                    <Check className="h-4 w-4 mr-2" /> Accept
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
