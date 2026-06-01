"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, MapPin, X, Phone, User, Activity, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export function GuestSOSModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("idle") // idle, requesting_location, submitting, success

  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true)
      setStatus("idle")
    }
    window.addEventListener('trigger-open-sos', handleTrigger)
    return () => window.removeEventListener('trigger-open-sos', handleTrigger)
  }, [])
  
  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    emergencyType: "other",
    description: "",
    latitude: null,
    longitude: null,
    accuracy: null
  })

  const handleOpen = () => {
    setIsOpen(true)
    setStatus("idle")
  }

  const handleClose = () => {
    if (loading) return
    setIsOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.guestName) {
      toast.error("Full name is required")
      return
    }

    if (!formData.guestPhone) {
      toast.error("Phone number is required")
      return
    }

    setLoading(true)
    setStatus("requesting_location")

    // Get location
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      setLoading(false)
      setStatus("idle")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const payload = {
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        
        setStatus("submitting")

        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
          const res = await fetch(`${apiBase}/emergency/guest-sos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          
          const data = await res.json()
          
          if (data.success) {
            setStatus("success")
            toast.success("Emergency SOS sent successfully! Help is on the way.")
            setTimeout(() => {
              setIsOpen(false)
              setFormData({
                guestName: "", guestPhone: "", emergencyType: "other", description: "", latitude: null, longitude: null, accuracy: null
              })
            }, 3000)
          } else {
            toast.error(data.message || "Failed to send SOS")
            setStatus("idle")
          }
        } catch (error) {
          console.error(error)
          toast.error("Network error. Please try calling emergency services directly (911).")
          setStatus("idle")
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        console.error("Location error:", error)
        toast.error("Please allow location access to send an SOS")
        setLoading(false)
        setStatus("idle")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/30 ring-4 ring-white transition-all focus:outline-none focus:ring-red-400"
      >
        <AlertTriangle className="h-7 w-7" />
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold ring-2 ring-white">
          SOS
        </span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <AlertTriangle className="mr-2 h-6 w-6" />
                  Emergency SOS
                </h3>
                <button 
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-full bg-red-500/50 p-1 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {status === "success" ? (
                <div className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <Activity className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-slate-900">SOS Sent Successfully</h4>
                  <p className="text-slate-600 mb-6">
                    Your emergency request and exact location have been broadcasted to all nearby hospitals and doctors.
                  </p>
                  <p className="text-sm font-semibold text-red-600">Please stay where you are. Help is on the way.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6">
                  <p className="text-sm text-slate-600 mb-5">
                    Triggering this SOS will immediately alert emergency services with your GPS location. Please only use in real emergencies.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number (Required)</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="tel" 
                          required
                          value={formData.guestPhone}
                          onChange={e => setFormData({...formData, guestPhone: e.target.value})}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Full Name (Required)</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                          type="text"
                          required
                          value={formData.guestName}
                          onChange={e => setFormData({...formData, guestName: e.target.value})}
                          placeholder="Your Name"
                          className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Emergency Type</label>
                      <select 
                        value={formData.emergencyType}
                        onChange={e => setFormData({...formData, emergencyType: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="cardiac">Cardiac / Heart Attack</option>
                        <option value="accident">Accident</option>
                        <option value="breathing">Breathing Difficulty</option>
                        <option value="stroke">Stroke</option>
                        <option value="bleeding">Severe Bleeding</option>
                        <option value="burn">Severe Burn</option>
                        <option value="poisoning">Poisoning</option>
                        <option value="other">Other / General Medical</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleClose}
                      disabled={loading}
                      className="flex-1 rounded-lg border border-slate-300 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 rounded-lg bg-red-600 py-2.5 font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700 disabled:opacity-70 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {status === 'requesting_location' ? 'Locating...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Send SOS
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
