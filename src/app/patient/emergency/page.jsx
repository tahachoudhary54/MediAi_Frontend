"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, AlertCircle, HeartPulse, ShieldAlert, Navigation, Loader2 } from "lucide-react"
import api from "@/lib/api"

export default function EmergencySOS() {
  const [user, setUser] = useState(null)
  const [isAlerting, setIsAlerting] = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = sessionStorage.getItem('user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed.user || parsed)
        if ((parsed.user || parsed).emergencyLocationEnabled) {
          setLocationEnabled(true)
        }
      }
    }
  }, [])

  const handleToggleLocation = async (enabled) => {
    if (isToggling) return
    setIsToggling(true)

    if (enabled) {
      if (navigator.geolocation) {
        try {
          await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
          });
        } catch (err) {
          alert("Location permission denied. Please allow location from browser settings.")
          setIsToggling(false)
          return
        }
      } else {
        alert("Geolocation is not supported by your browser.")
        setIsToggling(false)
        return
      }
    }

    try {
      const res = await api.patch('/auth/profile', { emergencyLocationEnabled: enabled })
      if (res.data.success) {
        setLocationEnabled(enabled)
        // Update session storage
        const storedUser = JSON.parse(sessionStorage.getItem('user') || "{}")
        const baseUser = storedUser.user || storedUser
        const updatedUser = { ...baseUser, emergencyLocationEnabled: enabled }
        sessionStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        window.dispatchEvent(new CustomEvent('profileUpdated'))
      }
    } catch (err) {
      console.error("Failed to update location preference", err)
      alert("Failed to save preference.")
    } finally {
      setIsToggling(false)
    }
  }

  const handleEmergencyAlert = async () => {
    if (!locationEnabled) {
      alert("Please enable emergency location sharing to send live location to admin.")
      return
    }

    setIsAlerting(true)
    try {
      let latitude = null;
      let longitude = null;
      let accuracy = 0;

      // Try to get actual GPS location
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000
            });
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          accuracy = pos.coords.accuracy;
        } catch (geoErr) {
          console.warn("Could not fetch real GPS coordinates.", geoErr);
          alert("Could not fetch GPS coordinates. Please ensure location is allowed.");
          setIsAlerting(false);
          return;
        }
      }

      const payload = {
        symptoms: "Patient initiated Emergency SOS",
        riskLevel: "High",
        latitude,
        longitude,
        accuracy
      }

      const res = await api.post('/emergency', payload)
      if (res.data.success) {
        alert("Emergency alert sent! Nearby doctors have been notified.")
        if (res.data.mockHospitals) {
          setHospitals(res.data.mockHospitals)
        }
      }
    } catch (err) {
      console.error("Failed to send emergency alert:", err)
      alert("Failed to send emergency alert. Please call 112 directly.")
    } finally {
      setIsAlerting(false)
    }
  }

  const getEmergencyContactName = () => {
    if (!user?.emergencyContact) return "No contact provided"
    if (typeof user.emergencyContact === "string") return user.emergencyContact
    if (typeof user.emergencyContact === "object") {
      const { name, relation } = user.emergencyContact
      const relStr = relation ? ` (${relation})` : ""
      return `${name || ""}${relStr}`.trim() || "No contact provided"
    }
    return "No contact provided"
  }

  const getEmergencyContactInitial = () => {
    if (!user?.emergencyContact) return "EC"
    if (typeof user.emergencyContact === "string") {
      return user.emergencyContact.charAt(0).toUpperCase()
    }
    if (typeof user.emergencyContact === "object" && user.emergencyContact.name) {
      return user.emergencyContact.name.charAt(0).toUpperCase()
    }
    return "EC"
  }

  const getEmergencyPhone = () => {
    if (!user?.emergencyContact) return ""
    if (typeof user.emergencyContact === "string") {
      const match = user.emergencyContact.match(/\+?[0-9\s-]{7,}/)
      return match ? match[0].trim() : ""
    }
    if (typeof user.emergencyContact === "object") {
      return user.emergencyContact.phone || ""
    }
    return ""
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emergency SOS</h1>
        <p className="text-slate-500 mt-2">Immediate assistance and critical information.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Call Ambulance */}
        <Card className="border-red-200 bg-red-50/50 shadow-sm overflow-hidden group">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ambulance</h2>
            <p className="text-slate-600 mb-6">Call national emergency services immediately.</p>
            <a href="tel:112" className="w-full">
              <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white text-lg h-14 shadow-md">
                Call 112 Now
              </Button>
            </a>
            <p className="text-xs text-slate-500 mt-4 hidden sm:block">
              Calling features work best on mobile devices.
            </p>
          </CardContent>
        </Card>

        {/* Nearest Hospital / SOS Alert */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
            <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Medical Alert</h2>
            <p className="text-slate-600 mb-4">Notify nearby doctors and locate hospitals.</p>

            <div className="flex items-center justify-between w-full p-3 bg-slate-50 border border-slate-200 rounded-lg mb-6">
              <span className="text-sm font-medium text-slate-700">Emergency Location Sharing</span>
              <button
                onClick={() => handleToggleLocation(!locationEnabled)}
                disabled={isToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${locationEnabled ? 'bg-teal-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${locationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <Button
              size="lg"
              onClick={handleEmergencyAlert}
              disabled={isAlerting || isToggling}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-lg h-14 shadow-md gap-2"
            >
              {isAlerting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
              {isAlerting ? "Alerting..." : "Send SOS & Locate"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {hospitals.length > 0 && (
        <Card className="border-teal-200 shadow-sm">
          <CardHeader>
            <CardTitle>Nearby Hospitals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hospitals.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
                <div>
                  <p className="font-semibold text-slate-900">{h.name}</p>
                  <p className="text-sm text-slate-500">{h.distance} km away</p>
                </div>
                <a href={`tel:${h.phone}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-red-500" />
            Emergency Contacts
          </CardTitle>
          <CardDescription>People to notify in case of an emergency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="font-semibold text-slate-600">
                  {getEmergencyContactInitial()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">{getEmergencyContactName()}</p>
                <p className="text-sm text-slate-500">Primary Contact</p>
              </div>
            </div>
            <div className="flex gap-2">
              {getEmergencyPhone() ? (
                <a href={`tel:${getEmergencyPhone()}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-4 w-4" /> Call
                  </Button>
                </a>
              ) : (
                <Button variant="outline" size="sm" className="gap-2" disabled>
                  <Phone className="h-4 w-4" /> Call
                </Button>
              )}
              <Button variant="danger" size="sm" className="gap-2">
                <AlertCircle className="h-4 w-4" /> Alert
              </Button>
            </div>
          </div>

          <Button variant="outline" className="w-full border-dashed">
            + Add Emergency Contact
          </Button>
        </CardContent>
      </Card>

      {/* Basic Medical Info */}
      <Card className="bg-slate-900 text-white border-transparent">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Medical ID</h3>
              <p className="text-slate-400 text-sm">Vital information for first responders.</p>
            </div>
            <div className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-sm font-semibold">
              {user?.bloodGroup || "Unknown Blood Type"}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Severe Allergies</p>
              <p className="font-medium text-red-400">{user?.allergies || "None reported"}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Current Medications</p>
              <p className="font-medium">{user?.currentMedications || "None"}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Medical Conditions</p>
              <p className="font-medium">{user?.previousDiseaseHistory || "None"}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Family History</p>
              <p className="font-medium">{user?.familyDiseaseHistory || "None"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
