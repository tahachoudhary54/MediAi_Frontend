"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { MessageSquare, Bell } from "lucide-react"
import { IncomingCallModal } from "@/components/shared/IncomingCallModal"

let patientSocket = null;

export default function PatientLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, token, authLoaded } = useAuth()
  const [isReady, setIsReady] = useState(false)
  const patientId = user?._id || user?.id;

  const [incomingDoctorRequest, setIncomingDoctorRequest] = useState(null);
  const [followUpNotification, setFollowUpNotification] = useState(null);
  const [globalSocket, setGlobalSocket] = useState(null);
  const notifAudioRef = useRef(null);
  const notifTimers = useRef([]);

  // Preload notification audio on mount
  useEffect(() => {
    notifAudioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    notifAudioRef.current.load();
  }, []);

  // Play sound when incoming consultation request arrives
  useEffect(() => {
    if (incomingDoctorRequest && !pathname.includes(incomingDoctorRequest._id)) {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.play().catch(e => console.log('Audio error:', e));
      } catch (err) {}
    }
  }, [incomingDoctorRequest, pathname])

  useEffect(() => {
    if (authLoaded) {
      if (!token) {
        router.push('/auth/login?role=patient')
      } else if (role !== 'patient') {
        router.push(`/${role}/dashboard`)
      } else {
        setIsReady(true)
      }
    }
  }, [authLoaded, token, role, router])

  // Socket.io Setup for Patient Notifications
  useEffect(() => {
    if (isReady && role === 'patient' && patientId) {
      if (!patientSocket) {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const socketUrl = apiBase.replace('/api', '');
        patientSocket = io(socketUrl, {
          withCredentials: true,
          transports: ['websocket', 'polling'],
          autoConnect: false
        });
      }
      setGlobalSocket(patientSocket);

      // Remove duplicate socket listeners before adding
      patientSocket.off("connect");
      patientSocket.off("connect_error");
      patientSocket.off("appointmentCancelled");
      patientSocket.off("doctorChatRequest");
      patientSocket.off("userProfileUpdated");
      patientSocket.off("orderStatusUpdated");
      patientSocket.off("orderDeletedPatient");
      patientSocket.off("medicineStockUpdated");
      patientSocket.off("disconnect");

      patientSocket.on("connect", () => {
        console.log(`[Socket] Patient socket connected with patientId: ${patientId}`);
        patientSocket.emit("joinRoom", `patient_${patientId}`);
      });

      if (patientSocket.connected) {
        patientSocket.emit("joinRoom", `patient_${patientId}`);
      }

      patientSocket.on("connect_error", (err) => {
        console.error("[Socket] Patient connection error:", err);
      });

      patientSocket.on("appointmentCancelled", (data) => {
        console.log(`[Socket] Patient received appointmentCancelled event:`, data);
        toast.error((t) => (
          <div 
            onClick={() => toast.dismiss(t.id)} 
            className="flex items-center justify-between w-full cursor-pointer select-none"
            title="Click to dismiss"
          >
            <span>{data.message}</span>
            <span className="ml-3 text-red-800 hover:text-red-950 font-extrabold text-sm flex-shrink-0">✕</span>
          </div>
        ), {
          duration: 10000,
          position: "top-right",
          style: {
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#7f1d1d',
            background: '#fef2f2',
            fontWeight: 'bold'
          }
        });
        window.dispatchEvent(new CustomEvent("appointmentCancelled", { detail: data }));
      });

      patientSocket.on("doctorChatRequest", (chatData) => {
        console.log(`[Socket] Patient received doctorChatRequest event:`, chatData);
        if (chatData.status === 'doctor-requested') {
          setIncomingDoctorRequest(chatData);
          toast.success(`Dr. ${chatData.doctor?.fullName} wants to chat!`);
        }
      });

      patientSocket.on("userProfileUpdated", (updatedUser) => {
        console.log(`[Socket] Patient received userProfileUpdated event:`, updatedUser);
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}");
        const base = stored.user || stored;
        if (base._id === updatedUser._id || base.id === updatedUser._id) {
           const updatedData = { ...base, ...updatedUser };
           sessionStorage.setItem("user", JSON.stringify(updatedData));
           window.dispatchEvent(new CustomEvent("profileUpdated"));
           toast.success("Your profile was updated by an admin");
        }
      });

      patientSocket.on("orderStatusUpdated", (updatedOrder) => {
        console.log(`[Socket] Patient received orderStatusUpdated event:`, updatedOrder);
        const orderIdShort = updatedOrder._id.substring(updatedOrder._id.length - 8).toUpperCase();
        const displayStatus = updatedOrder.status.replace(/_/g, ' ').toUpperCase();
        
        toast.success(`💊 Order #${orderIdShort} status updated to: ${displayStatus}`, {
          duration: 6000,
          position: "top-right",
          style: { background: '#f0fdf4', color: '#166534', fontWeight: 'bold', border: '1px solid #22c55e' }
        });
        
        // Dispatch custom event to let active sub-pages (like pharmacy delivery) hot-reload their list!
        window.dispatchEvent(new CustomEvent("orderStatusUpdated", { detail: updatedOrder }));
      });

      patientSocket.on("orderDeletedPatient", (orderId) => {
        console.log(`[Socket] Patient received orderDeletedPatient event:`, orderId);
        toast.error("An order was deleted or cancelled", {
          duration: 5000,
          position: "top-right"
        });
        window.dispatchEvent(new CustomEvent("orderStatusUpdated")); // Hot-reloads page orders
      });

      patientSocket.on("medicineStockUpdated", () => {
        console.log(`[Socket] Patient received medicineStockUpdated`);
        window.dispatchEvent(new CustomEvent("medicineStockUpdated"));
      });

      patientSocket.on("doctorFollowUpMessage", (data) => {
        console.log(`[Socket] Patient received doctorFollowUpMessage event:`, data);
        
        // If the patient is already actively viewing this specific chat, don't show the global popup
        if (window.currentActiveChatId === data.chatId) {
            return;
        }

        // Ignore auto-generated system messages like Call History
        if (data.message?.content?.startsWith('📞')) {
            return;
        }

        // Cancel any existing timers
        notifTimers.current.forEach(t => clearTimeout(t));
        notifTimers.current = [];
        // Play 3 beeps with 1800ms gap
        const playOnce = () => {
          try {
            if (notifAudioRef.current) {
              notifAudioRef.current.currentTime = 0;
              notifAudioRef.current.play().catch(() => {});
            }
          } catch (err) {}
        };
        playOnce();
        notifTimers.current.push(setTimeout(playOnce, 1800));
        notifTimers.current.push(setTimeout(playOnce, 3600));
        
        // Show both the custom popup and the toast notification
        setFollowUpNotification(data);
        toast.success(`New message from Dr. ${data.doctorName}`);
      });

      patientSocket.on("disconnect", () => {
        console.log("[Socket] Patient disconnected");
      });

      if (!patientSocket.connected) {
        patientSocket.connect();
      }
    }

    return () => {
      // Cleanup on unmount
      if (patientSocket) {
        patientSocket.disconnect();
        patientSocket = null;
      }
    };
  }, [isReady, role, patientId]);

  if (!authLoaded || !isReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Verifying patient access...</p>
      </div>
    )
  }

  const handleAcceptDoctorRequest = async () => {
    try {
      await api.put(`/chats/${incomingDoctorRequest._id}/patient-respond`, { status: 'active' });
      toast.success("Consultation accepted!");
      const chatUrl = `/patient/chat?doctorId=${incomingDoctorRequest.doctor._id}&resume=true`;
      setIncomingDoctorRequest(null);
      router.push(chatUrl);
    } catch (err) {
      toast.error("Failed to accept consultation");
    }
  }

  const handleDeclineDoctorRequest = async () => {
    try {
      await api.put(`/chats/${incomingDoctorRequest._id}/patient-respond`, { status: 'declined' });
      toast("Request declined");
    } catch (err) {}
    setIncomingDoctorRequest(null);
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="patient" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role="patient" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>

      {/* Incoming Doctor Consultation Modal */}
      {incomingDoctorRequest && !pathname.includes(incomingDoctorRequest._id) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 text-center relative border-b border-slate-100">
              <button
                onClick={handleDeclineDoctorRequest}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold transition-all shadow-sm border border-slate-200"
                title="Decline"
              >✕</button>
              
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-teal-200 animate-ping"></div>
                <div className="relative h-20 w-20 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 border-4 border-white">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                   <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Consultation Request</h3>
              <p className="text-teal-700 text-sm mt-2 font-medium">Dr. {incomingDoctorRequest.doctor?.fullName} wants to connect with you</p>
            </div>

            <div className="p-8 space-y-6 bg-white">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl border border-teal-200 shadow-sm">
                  {incomingDoctorRequest.doctor?.fullName?.charAt(0) || 'D'}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Doctor</p>
                  <p className="text-xl font-bold text-slate-900 truncate">Dr. {incomingDoctorRequest.doctor?.fullName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-14 rounded-xl border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm" onClick={handleDeclineDoctorRequest}>
                  Decline
                </Button>
                <Button className="h-14 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-2" onClick={handleAcceptDoctorRequest}>
                  Accept Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Incoming Doctor Follow-up Message Notification */}
      {followUpNotification && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-slate-100">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-8 text-center relative border-b border-slate-100">
              <button
                onClick={() => {
                  notifTimers.current.forEach(t => clearTimeout(t));
                  notifTimers.current = [];
                  setFollowUpNotification(null);
                }}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 font-bold transition-all shadow-sm border border-slate-200"
                title="Dismiss"
              >✕</button>

              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-teal-200 animate-ping"></div>
                <div className="relative h-20 w-20 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 border-4 border-white">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">New Message</h3>
              <p className="text-teal-700 text-sm mt-2 font-medium">
                Dr. {followUpNotification.doctorName} sent you a follow-up
              </p>
            </div>

            <div className="p-8 space-y-6 bg-white">
              {/* Message preview */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-teal-500" /> Message
                </p>
                <p className="text-slate-900 text-sm leading-relaxed line-clamp-3">
                  {followUpNotification.message?.content}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-14 rounded-xl border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                  onClick={() => {
                    notifTimers.current.forEach(t => clearTimeout(t));
                    notifTimers.current = [];
                    setFollowUpNotification(null);
                  }}
                >
                  Dismiss
                </Button>
                <Button
                  className="h-14 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold shadow-lg shadow-teal-600/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
                  onClick={() => {
                    notifTimers.current.forEach(t => clearTimeout(t));
                    notifTimers.current = [];
                    setFollowUpNotification(null);
                    router.push(`/patient/chat?chatId=${followUpNotification.chatId}`);
                  }}
                >
                  View Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Global Incoming Call Modal */}
      {globalSocket && <IncomingCallModal socket={globalSocket} />}
    </div>
  )
}
