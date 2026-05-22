"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Users, History, Trash2, Clock, Calendar, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorChatDashboard() {
  const router = useRouter()
  const [allChats, setAllChats] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllChats = async () => {
      try {
        const res = await api.get('/chats/doctor/all')
        if (res.data.success) {
          setAllChats(res.data.data)
        }
      } catch (err) {
        toast.error("Failed to load consultations")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllChats()
  }, [])

  const handleDeleteChat = async (chatIdToDelete, e) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this consultation? This action cannot be undone.")) return
    try {
      await api.delete(`/chats/${chatIdToDelete}`)
      toast.success("Consultation deleted")
      setAllChats(prev => prev.filter(c => c._id !== chatIdToDelete))
    } catch (err) {
      toast.error("Failed to delete consultation")
    }
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium">Loading consultations...</p>
      </div>
    )
  }

  const activeChats = allChats.filter(c => c.status !== 'ended')
  const endedChats = allChats.filter(c => c.status === 'ended')

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar Area: Consultations List */}
      <div className="hidden md:flex w-full md:w-3/12 h-full flex-col gap-4 overflow-hidden">
        {/* Queue/History list */}
        <Card className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white border border-slate-200 rounded-2xl">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 shrink-0 px-4 pt-4 pb-1">
            <History className="h-4 w-4 text-teal-600" /> Spontaneous Consults
          </h4>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-3">
            {/* Active & Pending Chats */}
            {activeChats.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active & Pending</p>
                {activeChats.map(c => (
                  <div
                    key={c._id}
                    onClick={() => router.push(`/doctor/chat/${c._id}`)}
                    className="p-3 rounded-xl border cursor-pointer transition-all group relative bg-slate-50 hover:bg-slate-100 border-slate-100"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-800 truncate pr-1">{c.patient?.fullName}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="bg-emerald-500 text-white text-[9px] px-2.5 py-0.5 rounded-full font-bold capitalize shadow-sm">
                          {c.status}
                        </span>
                        <button
                          onClick={(e) => handleDeleteChat(c._id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-100 text-red-400 hover:text-red-600"
                          title="Delete consultation"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400/80" />
                        {c.messages?.length || 0} messages
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400/80" />
                        {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-slate-150 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">No active chats</p>
              </div>
            )}

            {/* Ended Chats */}
            {endedChats.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ended History</p>
                {endedChats.map(c => (
                  <div
                    key={c._id}
                    onClick={() => router.push(`/doctor/chat/${c._id}`)}
                    className="p-3 rounded-xl border cursor-pointer transition-all group relative bg-slate-50/30 hover:bg-slate-50 border-slate-100/70"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-800 truncate">{c.patient?.fullName}</p>
                      <button
                        onClick={(e) => handleDeleteChat(c._id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-100 text-red-400 hover:text-red-600 shrink-0"
                        title="Delete consultation"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-[10px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400/80" />
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      <span>{c.messages?.length || 0} msgs</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 pb-4 pt-1 shrink-0 bg-white">
            <Button variant="outline" className="w-full text-xs py-2.5 border-slate-200 rounded-xl flex items-center justify-center gap-2 font-semibold text-slate-700 hover:bg-slate-50 shadow-sm" onClick={() => router.push(`/doctor/patients`)}>
              <Folder className="h-4 w-4 text-teal-600" /> View Patient Records
            </Button>
          </div>
        </Card>
      </div>

      {/* Main Chat Area Placeholder */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 p-8 text-center h-full">
        <div className="h-24 w-24 bg-teal-50/80 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-teal-100 rotate-3 transition-transform hover:rotate-6">
          <MessageSquare className="h-10 w-10 text-teal-600" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800 mb-3">Patient Consultations</h2>
        <p className="text-slate-500 font-medium max-w-md leading-relaxed mb-8">
          Select a patient from the spontaneous consults list to view their vitals, active chat session, and use the AI Diagnosis Assistant.
        </p>
        <div className="flex gap-4 opacity-70">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
             <div className="h-2 w-2 rounded-full bg-emerald-500"></div> Active
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
             <div className="h-2 w-2 rounded-full bg-amber-500"></div> Pending
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
             <div className="h-2 w-2 rounded-full bg-slate-400"></div> Ended
           </div>
        </div>
      </div>
    </div>
  )
}
