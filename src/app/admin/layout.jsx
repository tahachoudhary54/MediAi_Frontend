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
      } else if (role !== 'admin' && role !== 'super_admin') {
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
      
      const socketUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';

      socket = io(socketUrl, {
        withCredentials: true
      });

      socket.on("connect", () => {
        console.log(`[Socket] Admin joined room: admin_room and admin`);
        socket.emit("joinRoom", "admin_room");
        socket.emit("joinRoom", "admin"); // Join the emergency room
      });

      socket.on("connect_error", (err) => {
        console.error("[Socket] Admin connection error:", err);
      });

      socket.on("emergency_alert", (newEmergency) => {
        console.log(`[Socket] Admin received emergency_alert:`, newEmergency);
        
        toast.error(`🚨 NEW SOS ALERT: ${newEmergency.patient?.fullName || 'Patient'}`, { 
          duration: 15000,
          position: "top-center",
          style: { background: '#fef2f2', color: '#991b1b', fontWeight: 'bold', border: '2px solid #ef4444' }
        });
        
        try {
          if ('speechSynthesis' in window) {
            const patientName = newEmergency.patient?.fullName || 'an unknown patient';
            const msg = new SpeechSynthesisUtterance(`Emergency SOS alert received from ${patientName}. Please check the emergency monitoring page immediately.`);
            msg.rate = 0.9;
            msg.pitch = 1.1;
            msg.volume = 1;
            window.speechSynthesis.speak(msg);
          }
        } catch (e) {
          console.warn("Speech synthesis failed", e);
        }

        // Dispatch event for any local listeners (like the emergency monitoring page)
        window.dispatchEvent(new CustomEvent("emergency_alert_received", { detail: newEmergency }));
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

      socket.on("new_medicine_order", (data) => {
        console.log(`[Socket] Admin received new_medicine_order:`, data);
        toast.success(`💊 New Pharmacy Order from ${data.patientName}`, {
          duration: 8000,
          position: "top-right",
          style: { background: '#f0fdf4', color: '#166534', fontWeight: 'bold', border: '1px solid #22c55e' }
        });
        
        try {
          if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(`New pharmacy order received from ${data.patientName}.`);
            msg.rate = 0.9;
            window.speechSynthesis.speak(msg);
          }
        } catch (e) {
          console.warn("Speech synthesis failed", e);
        }
        // Dispatch custom event to let active sub-pages (like pharmacy orders) hot-reload their list!
        window.dispatchEvent(new CustomEvent("refreshAdminPharmacyOrders"));
      });

      socket.on("orderDeletedAdmin", (orderId) => {
        console.log(`[Socket] Admin received orderDeletedAdmin:`, orderId);
        window.dispatchEvent(new CustomEvent("refreshAdminPharmacyOrders"));
      });

      socket.on("new_appointment_payment", (data) => {
        console.log(`[Socket] Admin received new_appointment_payment:`, data);
        toast.success(`📅 Appointment Paid by ${data.patientName} (₹${data.amount})`, {
          duration: 8000,
          position: "top-right",
          style: { background: '#f0fdf4', color: '#166534', fontWeight: 'bold', border: '1px solid #22c55e' }
        });
        window.dispatchEvent(new CustomEvent("refreshAdminAppointments"));
      });

      socket.on("new_transaction", () => {
        window.dispatchEvent(new CustomEvent("refreshAdminTransactions"));
      });

      socket.on("medicineStockUpdated", () => {
        console.log(`[Socket] Admin received medicineStockUpdated`);
        window.dispatchEvent(new CustomEvent("medicineStockUpdated"));
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
      <Sidebar role={role === 'super_admin' ? 'super_admin' : 'admin'} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar role={role === 'super_admin' ? 'super_admin' : 'admin'} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
