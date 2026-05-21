"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, token, authLoaded } = useAuth()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (authLoaded) {
      if (!token) {
        router.push('/auth/login?role=admin')
      } else if (role !== 'admin') {
        // Redirect to the correct dashboard for the user's role
        router.push(`/${role}/dashboard`)
      } else {
        setIsReady(true)
      }
    }
  }, [authLoaded, token, role, router])

  // Socket.io Setup for Admin Notifications
  useEffect(() => {
    let socket;
    if (isReady && role === 'admin') {
      console.log(`[Socket] Admin socket connecting...`);
      
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const socketUrl = apiBase.replace('/api', '');

      socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on("connect", () => {
        console.log(`[Socket] Admin joined room: admin_room`);
        socket.emit("joinRoom", "admin_room");
      });

      socket.on("connect_error", (err) => {
        console.error("[Socket] Admin connection error:", err);
      });

      socket.on("appointmentCancelledAdmin", (data) => {
        console.log(`[Socket] Admin received appointmentCancelledAdmin event:`, data);
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
        // Dispatch custom event to let active sub-pages (like appointments) hot-reload their list!
        window.dispatchEvent(new CustomEvent("appointmentCancelledAdmin", { detail: data }));
      });

      socket.on("disconnect", () => {
        console.log("[Socket] Admin disconnected");
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
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">Verifying admin access...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role="admin" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
