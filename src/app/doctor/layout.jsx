"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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
  // Preload the notification sound once so there is no gap on second play
  const notificationAudio = useRef(null)
  const lastPlayedRequestId = useRef(null)
  const soundTimers = useRef([])

  useEffect(() => {
    // Eagerly create and load the audio object once on mount
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audio.preload = "auto";
    audio.load();
    notificationAudio.current = audio;
  }, [])

  // Play sound 3 times with a short gap when a NEW incoming request arrives
  useEffect(() => {
    if (
      incomingRequest &&
      incomingRequest._id !== lastPlayedRequestId.current &&
      !pathname.includes(incomingRequest._id)
    ) {
      lastPlayedRequestId.current = incomingRequest._id;

      // Cancel any previous pending repeats
      soundTimers.current.forEach(t => clearTimeout(t));
      soundTimers.current = [];

      const playOnce = () => {
        try {
          if (notificationAudio.current) {
            notificationAudio.current.currentTime = 0;
            notificationAudio.current.play().catch(e => console.log('Audio error:', e));
          }
        } catch (err) {}
      };

      // Play immediately, then repeat 2 more times with 1800ms (medium) gap
      playOnce();
      soundTimers.current.push(setTimeout(playOnce, 1800));
      soundTimers.current.push(setTimeout(playOnce, 3600));
    }

    // If request is dismissed, cancel any scheduled repeats
    if (!incomingRequest) {
      soundTimers.current.forEach(t => clearTimeout(t));
      soundTimers.current = [];
    }
  }, [incomingRequest, pathname])

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

      socket.on("userProfileUpdated", (updatedUser) => {
        console.log(`[Socket] Doctor received userProfileUpdated event:`, updatedUser);
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}");
        const base = stored.user || stored;
        if (base._id === updatedUser._id || base.id === updatedUser._id) {
           const updatedData = { ...base, ...updatedUser };
           sessionStorage.setItem("user", JSON.stringify(updatedData));
           window.dispatchEvent(new CustomEvent("profileUpdated"));
           toast.success("Your profile was updated by an admin");
        }
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isReady, role, user]);

  // Keep a ref to incomingRequest so polling closure isn't stale
  const incomingRequestRef = useRef(incomingRequest)
  useEffect(() => { incomingRequestRef.current = incomingRequest }, [incomingRequest])

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
              const current = incomingRequestRef.current;
              if (newRequest) {
                if (!current || current._id !== newRequest._id) {
                  setIncomingRequest(newRequest)
                }
              } else if (current) {
                setIncomingRequest(null)
              }
            } else if (incomingRequestRef.current) {
              // The request was cancelled or accepted elsewhere
              setIncomingRequest(null)
            }
          }
        } catch (err) { }
      }, 10000) // Poll every 10s as a fallback
    }
    return () => clearInterval(interval)
  }, [isReady, role]) // No longer depends on incomingRequest — uses ref instead

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
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-700/50">
            <div className="bg-gradient-to-br from-teal-900 to-teal-950 p-8 text-center relative border-b border-teal-800/50">
              <button
                onClick={handleBusy}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-all"
                title="Decline"
              >✕</button>
              
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-teal-500/30 animate-ping"></div>
                <div className="relative h-20 w-20 bg-gradient-to-b from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/20 border-4 border-[#0f172a]">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-4 border-teal-950 flex items-center justify-center">
                   <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Consultation Request</h3>
              <p className="text-teal-200/80 text-sm mt-2 font-medium">{incomingRequest.patient?.fullName} wants to connect with you</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                <div className="h-14 w-14 rounded-full bg-slate-700 flex items-center justify-center text-teal-400 font-bold text-xl border border-slate-600 shadow-inner">
                  {incomingRequest.patient?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Patient</p>
                  <p className="text-xl font-bold text-slate-100 truncate">{incomingRequest.patient?.fullName}</p>
                </div>
              </div>

              {isRescheduling ? (
                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300">Suggest New Time</label>
                    <input
                      type="datetime-local"
                      className="w-full h-12 px-4 rounded-xl border border-slate-600 focus:ring-2 focus:ring-teal-500 text-slate-100 bg-slate-800"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800" onClick={() => setIsRescheduling(false)}>Back</Button>
                    <Button className="flex-1 h-12 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold" onClick={handleReschedule}>Confirm</Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-14 rounded-xl border-slate-700 bg-slate-800/80 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all" onClick={handleBusy}>
                    Decline
                  </Button>
                  <Button className="h-14 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)] transition-all flex items-center justify-center gap-2" onClick={handleAccept}>
                    Accept Consultation
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
