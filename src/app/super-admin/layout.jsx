"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

export default function SuperAdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, token, authLoaded } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (authLoaded) {
      if (!token) {
        router.push('/auth/login?role=super_admin')
      } else if (role !== 'super_admin') {
        const dashPath = role === 'super_admin' ? '/super-admin/dashboard' : `/${role}/dashboard`
        router.push(dashPath)
      } else {
        setIsReady(true)
      }
    }
  }, [authLoaded, token, role, router])

  // Socket.io Setup for Super Admin Notifications
  useEffect(() => {
    let socket;
    if (isReady && role === 'super_admin') {
      console.log(`[Socket] Super Admin socket connecting...`);
      
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiBase.replace('/api', '');

      socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on("connect", () => {
        console.log(`[Socket] Super Admin joined rooms: super_admin, admin`);
        socket.emit("joinRoom", "super_admin");
        socket.emit("joinRoom", "admin");
      });

      socket.on("connect_error", (err) => {
        console.error("[Socket] Super Admin connection error:", err);
      });

      socket.on("emergency_alert", (newEmergency) => {
        console.log(`[Socket] Super Admin received emergency_alert:`, newEmergency);
        
        const isGuest = newEmergency.isGuestSOS || newEmergency.source === 'guest';
        const name = isGuest 
          ? (newEmergency.guestName || 'Guest') 
          : (newEmergency.patient?.fullName || 'Patient');
        
        toast.error(`🚨 ${isGuest ? 'GUEST' : ''} EMERGENCY SOS: ${name}`, { 
          duration: 20000,
          position: "top-center",
          style: { 
            background: '#fef2f2', 
            color: '#991b1b', 
            fontWeight: 'bold', 
            border: '2px solid #ef4444',
            fontSize: '15px'
          }
        });
        
        try {
          if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(
              `${isGuest ? 'Guest' : ''} Emergency SOS alert received from ${name}. Please check the emergency control center immediately.`
            );
            msg.rate = 0.9;
            msg.pitch = 1.1;
            msg.volume = 1;
            window.speechSynthesis.speak(msg);
          }
        } catch (e) {
          console.warn("Speech synthesis failed", e);
        }

        window.dispatchEvent(new CustomEvent("emergency_alert_received", { detail: newEmergency }));
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Super Admin disconnected");
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isReady, role, user]);

  if (!authLoaded || !isReady) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Verifying super admin access...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="super_admin" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role="super_admin" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
