"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Clock, CalendarDays, Check } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorSchedule() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingBreak, setIsSavingBreak] = useState(false)
  const [dailyBreak, setDailyBreak] = useState({
    enabled: false,
    startTime: '13:00',
    endTime: '14:00'
  })
  const [availability, setAvailability] = useState([
    { day: 'Monday', available: true, startTime: '09:00', endTime: '17:00', type: 'Both' },
    { day: 'Tuesday', available: true, startTime: '09:00', endTime: '17:00', type: 'Both' },
    { day: 'Wednesday', available: true, startTime: '09:00', endTime: '17:00', type: 'Both' },
    { day: 'Thursday', available: true, startTime: '09:00', endTime: '17:00', type: 'Both' },
    { day: 'Friday', available: true, startTime: '09:00', endTime: '17:00', type: 'Both' },
    { day: 'Saturday', available: false, startTime: '09:00', endTime: '17:00', type: 'Both' },
    { day: 'Sunday', available: false, startTime: '09:00', endTime: '17:00', type: 'Both' }
  ])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const stored = sessionStorage.getItem("user")
        if (stored) {
          const parsed = JSON.parse(stored)
          const u = parsed.user || parsed
          if (u.weeklyAvailability && u.weeklyAvailability.length > 0) {
            setAvailability(u.weeklyAvailability)
          }
          if (u.dailyBreak) {
            setDailyBreak(u.dailyBreak)
          }
        }
      } catch (err) {
        console.error("Failed to load schedule from session storage")
      }
    }
    fetchProfile()
  }, [])

  const handleCheckboxChange = (index, checked) => {
    const updated = [...availability]
    updated[index].available = checked
    setAvailability(updated)
  }

  const handleTimeChange = (index, field, value) => {
    const updated = [...availability]
    updated[index][field] = value
    setAvailability(updated)
  }

  const handleTypeChange = (index, value) => {
    const updated = [...availability]
    updated[index].type = value
    setAvailability(updated)
  }

  const updateDailyBreakSetting = async (updatedFields) => {
    const updatedBreak = { ...dailyBreak, ...updatedFields }
    setDailyBreak(updatedBreak)

    try {
      setIsSavingBreak(true)
      const res = await api.patch("/auth/profile", {
        dailyBreak: updatedBreak
      })
      if (res.data.success) {
        // Persist in session storage
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = {
          ...base,
          ...res.data.data
        }
        sessionStorage.setItem("user", JSON.stringify(updated))
        // Trigger sync
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      }
    } catch (err) {
      toast.error("Failed to auto-save break settings")
    } finally {
      setIsSavingBreak(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      const res = await api.patch("/auth/profile", {
        weeklyAvailability: availability,
        dailyBreak: dailyBreak
      })
      if (res.data.success) {
        toast.success("Schedule saved successfully!")

        // Persist in session storage
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = {
          ...base,
          ...res.data.data
        }
        sessionStorage.setItem("user", JSON.stringify(updated))
        // Trigger sync
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save schedule settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Schedule Settings</h1>
        <p className="text-slate-500">Configure your availability for online and offline consultations.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CalendarDays className="h-5 w-5 text-teal-600" /> Weekly Availability
          </CardTitle>
          <CardDescription className="text-slate-500">Set your standard working hours and active days.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {availability.map((item, i) => (
            <div key={item.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 gap-4">
              <div className="flex items-center gap-4 w-40">
                <input
                  type="checkbox"
                  id={`day-${i}`}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer"
                  checked={item.available}
                  onChange={(e) => handleCheckboxChange(i, e.target.checked)}
                />
                <label htmlFor={`day-${i}`} className="font-semibold text-slate-700 cursor-pointer text-sm">{item.day}</label>
              </div>

              <div className={`flex items-center gap-2 flex-1 ${!item.available ? 'opacity-40 pointer-events-none' : ''}`}>
                <Input
                  type="time"
                  value={item.startTime || "09:00"}
                  onChange={(e) => handleTimeChange(i, 'startTime', e.target.value)}
                  className="w-32 bg-white text-slate-900 border-slate-200"
                />
                <span className="text-slate-400 text-sm font-medium">to</span>
                <Input
                  type="time"
                  value={item.endTime || "17:00"}
                  onChange={(e) => handleTimeChange(i, 'endTime', e.target.value)}
                  className="w-32 bg-white text-slate-900 border-slate-200"
                />
              </div>

              <div className={`flex gap-2 ${!item.available ? 'opacity-40 pointer-events-none' : ''}`}>
                <select
                  value={item.type || "Both"}
                  onChange={(e) => handleTypeChange(i, e.target.value)}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 font-medium"
                >
                  <option value="Both">Both</option>
                  <option value="Online Only">Online Only</option>
                  <option value="Offline Only">Offline Only</option>
                </select>
              </div>
            </div>
          ))}
          <div className="pt-4 flex justify-end border-t border-slate-50 mt-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm px-8"
            >
              {isLoading ? "Saving..." : <><Check className="mr-2 h-4 w-4" /> Save Schedule</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coffee / Lunch Break Settings */}
      <Card className="border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="flex items-center justify-between gap-2 text-slate-900 w-full">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                <Clock className="h-4.5 w-4.5" />
              </div>
              Coffee / Lunch Break Settings
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-slate-100/80 border border-slate-200/50">
              {isSavingBreak ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-slate-500">Saving...</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Auto-saved</span>
                </>
              )}
            </div>
          </CardTitle>
          <CardDescription className="text-slate-500">
            Configure your standard daily break hours to block patient consultations during these times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-orange-50/10">
            <div className="space-y-1">
              <span className="font-semibold text-slate-800 text-sm block">Enable Standard Break</span>
              <span className="text-xs text-slate-400">Patients will not be able to book consultations during your daily break hours.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={dailyBreak.enabled}
                onChange={(e) => updateDailyBreakSetting({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div className={`grid sm:grid-cols-2 gap-6 transition-all duration-300 ${!dailyBreak.enabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm">Break Start Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={dailyBreak.startTime}
                  onChange={(e) => updateDailyBreakSetting({ startTime: e.target.value })}
                  className="bg-white text-slate-900 border-slate-200 pl-10"
                />
                <Clock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm">Break End Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  value={dailyBreak.endTime}
                  onChange={(e) => updateDailyBreakSetting({ endTime: e.target.value })}
                  className="bg-white text-slate-900 border-slate-200 pl-10"
                />
                <Clock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-50">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Clock className="h-5 w-5 text-teal-600" /> Slot Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm">Consultation Duration</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 font-medium">
                <option>15 Minutes</option>
                <option defaultValue="30 Minutes">30 Minutes</option>
                <option>45 Minutes</option>
                <option>60 Minutes</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium text-sm">Buffer Time Between Slots</Label>
              <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 font-medium">
                <option>None</option>
                <option>5 Minutes</option>
                <option defaultValue="10 Minutes">10 Minutes</option>
                <option>15 Minutes</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
