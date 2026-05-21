"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorChatDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const res = await api.get('/chats/doctor/all')
        if (res.data.success && res.data.data.length > 0) {
          const chats = res.data.data
          // Find first active/requested chat, otherwise first ended chat
          const activeChat = chats.find(c => c.status !== 'ended')
          if (activeChat) {
            router.push(`/doctor/chat/${activeChat._id}`)
          } else {
            router.push(`/doctor/chat/${chats[0]._id}`)
          }
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        toast.error("Failed to load consultations")
        setIsLoading(false)
      }
    }
    fetchAndRedirect()
  }, [router])

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Loading consultations...</p>
      </div>
    )
  }

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 border border-teal-100">
        <MessageSquare className="h-8 w-8 text-teal-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">No Consultations Yet</h3>
      <p className="text-slate-500 text-sm max-w-sm text-center mb-6">
        You don't have any active or previous spontaneous chats with patients.
      </p>
    </div>
  )
}
