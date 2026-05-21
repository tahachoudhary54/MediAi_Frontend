"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"

let patientSocket = null;

export default function PatientLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, token, authLoaded } = useAuth()
  const [isReady, setIsReady] = useState(false)
  const patientId = user?._id || user?.id;

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

      // Remove duplicate socket listeners before adding
      patientSocket.off("connect");
      patientSocket.off("connect_error");
      patientSocket.off("appointmentCancelled");
      patientSocket.off("disconnect");

      patientSocket.on("connect", () => {
        console.log(`[Socket] Patient socket connected with patientId: ${patientId}`);
        patientSocket.emit("joinRoom", `patient_${patientId}`);
      });

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
    </div>
  )
}
