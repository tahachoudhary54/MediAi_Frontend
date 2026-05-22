"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Video, Mic, Activity, FileText, FileClock, History, MessageSquare, Clock, Calendar, Folder, Send, Edit2, CheckCircle, Heart, Thermometer, Weight, Watch, Trash2 } from "lucide-react";
import { ChatWindow } from "@/components/shared/ChatWindow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MediaUploadButton from "@/app/components/MediaUploadButton";

import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"
import { useAuth } from "@/context/AuthContext"

export default function DoctorChatSession() {
  const params = useParams()
  const router = useRouter()
  const chatId = params.id
  const { user } = useAuth()

  const [chat, setChat] = useState(null)
  const [allChats, setAllChats] = useState([])
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [followUpText, setFollowUpText] = useState('')
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false)

  // Vitals State
  const [latestVitals, setLatestVitals] = useState(null)
  const [vitalsLoading, setVitalsLoading] = useState(false)

  // Report state
  const [report, setReport] = useState(null)
  const [isEditingReport, setIsEditingReport] = useState(false)
  const [editedPrescription, setEditedPrescription] = useState('')
  const [editedDoctorNote, setEditedDoctorNote] = useState('')

  // Fetch patient latest vitals
  const fetchPatientVitals = async (patientId) => {
    if (!patientId) return
    setVitalsLoading(true)
    try {
      const res = await api.get(`/patient/vitals/latest?patientId=${patientId}`)
      if (res.data.success) {
        setLatestVitals(res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch patient vitals:", err)
    } finally {
      setVitalsLoading(false)
    }
  }

  // Fetch all chats for doctor list sidebar
  const fetchAllChats = async () => {
    try {
      const res = await api.get('/chats/doctor/all')
      if (res.data.success) {
        setAllChats(res.data.data)
      }
    } catch (err) {
      console.error("Failed to fetch doctor's chats queue:", err)
    }
  }

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/chats/${chatId}`)
        setChat(res.data.data)
        const formatted = res.data.data.messages.map(m => ({
          sender: m.senderModel === 'Doctor' ? 'user' : 'patient',
          content: m.content,
          timestamp: m.timestamp,
          _id: m._id
        }))
        setMessages(formatted)

        // Fetch latest vitals for patient
        const patientId = res.data.data.patient?._id || res.data.data.patient?.id
        if (patientId) {
          fetchPatientVitals(patientId)
        }
      } catch (err) {
        toast.error("Failed to load chat")
      } finally {
        setIsLoading(false)
      }
    }
    if (chatId) {
      fetchChat()
      fetchAllChats()
    }
  }, [chatId])

  // Socket listener for instant consultationEnded notification
  useEffect(() => {
    const doctorId = user?._id || user?.id;
    if (!doctorId) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiBase.replace('/api', '');
    const socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.emit('joinRoom', `doctor_${doctorId}`);
    socket.on('consultationEnded', (data) => {
      if (data.chatId === chatId || data.chatId?.toString() === chatId) {
        toast(`${data.patientName || 'Patient'} has ended the consultation`, { icon: '🔔' });
        // Refresh the chat state
        api.get(`/chats/${chatId}`).then(res => {
          setChat(res.data.data);
          fetchAllChats();
        }).catch(() => { });
      }
    });
    return () => socket.disconnect();
  }, [chatId, user])

  // Real-time chat messages and consultation status via socket
  useEffect(() => {
    if (!chatId || (chat && chat.status === 'ended')) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const socketUrl = apiBase.replace('/api', '');
    const socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });

    socket.emit('joinRoom', `chat_${chatId}`);
    console.log(`[Socket] Doctor joined chat room chat_${chatId}`);

    socket.on('messageReceived', (data) => {
      if (data.chatId === chatId) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, {
            sender: data.message.senderModel === 'Doctor' ? 'user' : 'patient',
            content: data.message.content,
            timestamp: data.message.timestamp,
            _id: data.message._id
          }];
        });
      }
    });

    socket.on('consultationEnded', (data) => {
      if (data.chatId === chatId) {
        // Refresh the chat state and sidebar
        api.get(`/chats/${chatId}`).then(res => {
          setChat(res.data.data);
          fetchAllChats();
        }).catch(() => { });
      }
    });

    return () => {
      console.log(`[Socket] Doctor disconnecting from chat room chat_${chatId}`);
      socket.disconnect();
    };
  }, [chatId, chat?.status]);

  // Automatically reset status to 'available' when leaving the chat page
  useEffect(() => {
    return () => {
      api.patch('/auth/profile', { onlineStatus: 'available' }).then(() => {
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = { ...base, onlineStatus: 'available' }
        sessionStorage.setItem("user", JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      }).catch(() => { })
    }
  }, [])

  // Polling for messages
  useEffect(() => {
    let interval;
    if (chat && chat.status !== 'ended') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/chats/${chatId}`)
          const formatted = res.data.data.messages.map(m => ({
            sender: m.senderModel === 'Doctor' ? 'user' : 'patient',
            content: m.content,
            timestamp: m.timestamp,
            _id: m._id
          }))
          setMessages(formatted)
          if (res.data.data.status === 'ended') {
            setChat(res.data.data)
            clearInterval(interval)
          }
        } catch (err) { }
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [chat, chatId])

  // Fetch report when chat is ended
  useEffect(() => {
    if (chat?.status === 'ended') {
      api.get(`/reports/chat/${chatId}`)
        .then(res => {
          setReport(res.data.data)
          setEditedPrescription(res.data.data.prescription || '')
          setEditedDoctorNote(res.data.data.summary || chat.aiReport?.doctorNote || '')
        })
        .catch(err => console.warn("Failed to fetch report for this chat (expected if report draft is still generating)", err))
    }
  }, [chat?.status, chatId])

  const handleSendMessage = async (content) => {
    try {
      const res = await api.post(`/chats/${chatId}/messages`, { content })
      const formatted = res.data.data.messages.map(m => ({
        sender: m.senderModel === 'Doctor' ? 'user' : 'patient',
        content: m.content,
        timestamp: m.timestamp,
        _id: m._id
      }))
      setMessages(formatted)
    } catch (err) {
      toast.error("Failed to send message")
    }
  }

  // New: handleUpload for media URLs from doctor
  const handleUpload = async (url) => {
    // Send the uploaded image URL as a message from the doctor
    await handleSendMessage(url)
  };

  const handleSendFollowUp = async () => {
    if (!followUpText.trim()) return
    setIsSendingFollowUp(true)
    try {
      const res = await api.post(`/chats/${chatId}/followup`, { content: followUpText.trim() })
      const formatted = res.data.data.messages.map(m => ({
        sender: m.senderModel === 'Doctor' ? 'user' : 'patient',
        content: m.content,
        timestamp: m.timestamp,
        _id: m._id
      }))
      setMessages(formatted)
      setFollowUpText('')
      toast.success('Follow-up message sent to patient')
    } catch (err) {
      toast.error('Failed to send follow-up message')
    } finally {
      setIsSendingFollowUp(false)
    }
  }

  const handleEndConsultation = async () => {
    try {
      await api.put(`/chats/${chatId}/end`)

      // Automatically reset status to available
      try {
        await api.patch('/auth/profile', { onlineStatus: 'available' })
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = { ...base, onlineStatus: 'available' }
        sessionStorage.setItem("user", JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      } catch (statusErr) {
        console.error("Failed to update status to available:", statusErr)
      }

      toast.success("Consultation ended and report drafted.")

      // Refresh current chat state and sidebar list
      const res = await api.get(`/chats/${chatId}`)
      setChat(res.data.data)
      fetchAllChats()
    } catch (err) {
      toast.error("Failed to end consultation")
    }
  }

  const handleDeleteChat = async (chatIdToDelete, e) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this consultation? This action cannot be undone.")) return
    try {
      await api.delete(`/chats/${chatIdToDelete}`)
      toast.success("Consultation deleted")
      // If we deleted the currently open chat, go back to dashboard
      if (chatIdToDelete === chatId) {
        router.push("/doctor/dashboard")
      } else {
        fetchAllChats()
      }
    } catch (err) {
      toast.error("Failed to delete consultation")
    }
  }

  const handleDeleteMessage = async (index) => {
    try {
      const res = await api.delete(`/chats/${chatId}/messages/${index}`)
      const formatted = res.data.data.messages.map(m => ({
        sender: m.senderModel === 'Doctor' ? 'user' : 'patient',
        content: m.content,
        timestamp: m.timestamp,
        _id: m._id
      }))
      setMessages(formatted)
      toast.success("Message deleted")
    } catch (err) {
      toast.error("Failed to delete message")
    }
  }

  const handleSaveReport = async () => {
    if (!report) return
    try {
      const res = await api.put(`/reports/${report._id}`, {
        prescription: editedPrescription,
        summary: editedDoctorNote
      })
      setReport(res.data.data)
      setIsEditingReport(false)
      toast.success("Report updated successfully")
    } catch (err) {
      toast.error("Failed to save report")
    }
  }

  const handleSendToPatient = async () => {
    if (!report) return
    try {
      const res = await api.put(`/reports/${report._id}/status`, { status: 'Sent to Patient' })
      setReport(res.data.data)
      toast.success("Report approved and sent to patient")
    } catch (err) {
      toast.error("Failed to send report")
    }
  }

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center">Loading chat...</div>
  if (!chat) return <div className="p-8 text-center">Chat not found</div>

  if (chat?.status === 'doctor-requested') {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border-teal-100">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
              <span className="text-3xl font-bold text-teal-700">{chat.patient?.fullName?.charAt(0) || 'P'}</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Requesting Consultation</h2>
            <p className="text-slate-500 mt-2">Waiting for {chat.patient?.fullName} to accept your request...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (chat?.status === 'declined') {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border-red-100">
          <div className="h-20 w-20 mx-auto bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <span className="text-2xl font-bold">✕</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Request Declined</h2>
            <p className="text-slate-500 mt-2">The patient declined your chat request.</p>
          </div>
          <Button className="w-full bg-slate-900" onClick={() => router.push('/doctor/patients')}>Go Back</Button>
        </Card>
      </div>
    )
  }

  const activeChats = allChats.filter(c => c.status !== 'ended')
  const endedChats = allChats.filter(c => c.status === 'ended')

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Sidebar Area: Consultations List */}
      <div className="hidden md:flex w-full md:w-3/12 h-full flex-col gap-4 overflow-hidden">
        {/* Active Patient Card */}
        <Card className="bg-slate-900 text-white border-transparent shrink-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-600 flex items-center justify-center font-bold text-base">
                {chat.patient?.fullName?.charAt(0) || 'P'}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-semibold text-sm truncate">{chat.patient?.fullName || 'Patient'}</h3>
                <p className="text-slate-400 text-xs capitalize">{chat.status} Consultation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue/History list */}
        <Card className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white border border-slate-200">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 shrink-0 px-4 pt-4 pb-1">
            <History className="h-4 w-4 text-teal-600" /> Spontaneous Consults
          </h4>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-3">
            {/* Active & Pending Chats */}
            {activeChats.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active & Pending</p>
                {activeChats.map(c => {
                  const isActive = c._id === chatId;
                  return (
                    <div
                      key={c._id}
                      onClick={() => router.push(`/doctor/chat/${c._id}`)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${isActive
                          ? 'bg-teal-50 border-teal-200 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                        }`}
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
                  )
                })}
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
                {endedChats.map(c => {
                  const isActive = c._id === chatId;
                  return (
                    <div
                      key={c._id}
                      onClick={() => router.push(`/doctor/chat/${c._id}`)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${isActive
                          ? 'bg-teal-50/15 border-teal-500 shadow-sm'
                          : 'bg-slate-50/30 hover:bg-slate-50 border-slate-100/70'
                        }`}
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
                  )
                })}
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

      {/* Main Chat Area */}
      <div className="flex flex-col h-full w-full md:w-6/12">
        <ChatWindow
          title={chat.patient?.fullName || "Patient"}
          subtitle={`${chat.status === 'ended' ? 'Consultation Closed' : 'Online Consultation • Active'}`}
          messages={messages}
          onSendMessage={handleSendMessage}
          onDeleteMessage={chat.status !== 'ended' ? handleDeleteMessage : undefined}
          disabled={chat.status === 'ended'}
          headerRight={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-600 bg-slate-100">
                <Video className="h-5 w-5" />
              </Button>
              {chat.status !== 'ended' && (
                <Button variant="danger" size="sm" onClick={handleEndConsultation}>
                  End
                </Button>
              )}
              {/* Media upload button for doctor */}
              <MediaUploadButton onUpload={handleUpload} />
            </div>
          }
        />

        {chat.status !== 'ended' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 py-2 px-4 rounded-full self-center shadow-sm">
            <Activity className="h-4 w-4 text-teal-600 animate-pulse" />
            AI Diagnosis Assistant is listening and drafting clinical notes
          </div>
        )}

        {/* Follow-up composer for ended chats */}
        {chat.status === 'ended' && (
          <div className="mt-3 shrink-0 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-slate-50 p-4 shadow-sm">
            <p className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Send Follow-up Message to Patient
            </p>
            <div className="flex gap-2 items-end">
              <textarea
                value={followUpText}
                onChange={e => setFollowUpText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendFollowUp()
                  }
                }}
                placeholder="Type a follow-up message... (Enter to send)"
                rows={2}
                className="flex-1 resize-none text-sm rounded-xl border border-teal-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-sm"
              />
              <button
                onClick={handleSendFollowUp}
                disabled={isSendingFollowUp || !followUpText.trim()}
                className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md transition-all"
                title="Send follow-up"
              >
                {isSendingFollowUp
                  ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar: AI Diagnosis & Clinical Report */}
      <div className="hidden lg:flex w-full md:w-3/12 h-full flex-col gap-4 overflow-y-auto pr-1">
        {chat.status !== 'ended' ? (
          <>
            {/* Patient Vitals Card */}
            <Card className="border-teal-200 bg-teal-50/40 shadow-sm shrink-0">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-teal-600 animate-pulse" /> Patient Vitals
                  </h4>
                  {latestVitals && (
                    <Badge variant={latestVitals.source === 'smartwatch' ? 'teal' : 'outline'} className="text-[10px] capitalize">
                      {latestVitals.source === 'smartwatch' ? 'Wearable Sync' : 'Manual Entry'}
                    </Badge>
                  )}
                </div>

                {vitalsLoading ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                  </div>
                ) : !latestVitals ? (
                  <div className="text-center py-6 px-3 bg-white rounded-xl border border-teal-100/50">
                    <p className="text-xs text-slate-500 font-medium">No vitals recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Heart Rate */}
                      <div className="p-2 rounded-lg bg-white border border-teal-100/30 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-rose-500 shrink-0 fill-rose-100" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Heart Rate</p>
                          <p className="text-xs font-extrabold text-slate-800">
                            {latestVitals.heartRate ? `${latestVitals.heartRate} bpm` : '--'}
                          </p>
                        </div>
                      </div>

                      {/* Blood Pressure */}
                      <div className="p-2 rounded-lg bg-white border border-teal-100/30 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-teal-600 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Blood Pres.</p>
                          <p className="text-xs font-extrabold text-slate-800 font-sans">
                            {latestVitals.systolicBP && latestVitals.diastolicBP
                              ? `${latestVitals.systolicBP}/${latestVitals.diastolicBP}`
                              : '--'} <span className="text-[8px] font-normal text-slate-500">mmHg</span>
                          </p>
                        </div>
                      </div>

                      {/* Oxygen Level */}
                      <div className="p-2 rounded-lg bg-white border border-teal-100/30 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">SpO2</p>
                          <p className="text-xs font-extrabold text-slate-800">
                            {latestVitals.oxygenLevel ? `${latestVitals.oxygenLevel}%` : '--'}
                          </p>
                        </div>
                      </div>

                      {/* Temperature */}
                      <div className="p-2 rounded-lg bg-white border border-teal-100/30 flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Temp</p>
                          <p className="text-xs font-extrabold text-slate-800">
                            {latestVitals.temperature ? `${latestVitals.temperature}°F` : '--'}
                          </p>
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="p-2 rounded-lg bg-white border border-teal-100/30 flex items-center gap-2">
                        <Weight className="h-4 w-4 text-indigo-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Weight</p>
                          <p className="text-xs font-extrabold text-slate-800 font-sans">
                            {latestVitals.weight ? `${latestVitals.weight} kg` : '--'}
                          </p>
                        </div>
                      </div>

                      {/* Blood Sugar */}
                      <div className="p-2 rounded-lg bg-white border border-teal-100/30 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-500 shrink-0" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Blood Sugar</p>
                          <p className="text-xs font-extrabold text-slate-800 font-sans">
                            {latestVitals.bloodSugar ? `${latestVitals.bloodSugar}` : '--'} <span className="text-[8px] font-normal text-slate-500">mg/dL</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-400 font-medium text-right italic">
                      Recorded: {new Date(latestVitals.recordedAt || latestVitals.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="border-teal-200 bg-teal-50/50 shadow-sm shrink-0">
              <CardContent className="p-4 pt-4 space-y-4">
                <h4 className="font-semibold text-teal-900 text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-teal-600" /> AI Insights (Live)
                </h4>
                <p className="text-xs text-slate-600 italic">AI will analyze the conversation as it progresses.</p>

                <div className="p-3 bg-white rounded-lg border border-teal-100 shadow-sm">
                  <p className="text-xs font-semibold text-teal-700 uppercase mb-1 flex items-center gap-1">
                    <FileClock className="h-3 w-3" /> Draft Note Preview
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {messages.length > 0
                      ? "Consultation actively progressing. AI assistant is compiling symptom profiles."
                      : "Awaiting patient input. AI is initialized and listening..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-slate-200 bg-white shadow-lg flex-1 overflow-hidden flex flex-col min-h-0 relative">
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 shrink-0 flex justify-between items-center gap-2 overflow-hidden rounded-t-[inherit]">
              <h4 className="font-bold text-base flex items-center gap-2 tracking-wide whitespace-nowrap truncate">
                <FileText className="h-4 w-4 text-teal-400 shrink-0" /> <span className="truncate">Clinical Report</span>
              </h4>
              {report && (
                <Badge className={`whitespace-nowrap shrink-0 ${report.status === 'Sent to Patient' ? 'bg-emerald-500 hover:bg-emerald-600 text-[10px] px-2 py-0.5' : 'bg-amber-500 hover:bg-amber-600 text-[10px] px-2 py-0.5'}`}>
                  {report.status}
                </Badge>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-8">
              {!report ? (
                <div className="flex flex-col items-center justify-center h-48 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent mb-2"></div>
                  <p className="text-xs text-slate-500 font-medium">Generating Report Document...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Document Header */}
                  <div className="pb-8 flex flex-col items-center justify-center text-center border-b border-slate-100">
                    <h2 className="text-[22px] font-medium text-slate-800 uppercase tracking-[0.15em] mb-2 leading-tight">Medical<br />Prescription</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">MediAI Digital Health Clinic</p>
                  </div>

                  {/* Patient Info */}
                  <div className="flex flex-col mb-4">
                    <div className="grid grid-cols-2 gap-6 py-6 border-b border-slate-100">
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient Name</p>
                        <p className="text-sm font-medium text-slate-900">{chat.patient?.fullName || "Unknown Patient"}</p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
                        <p className="text-sm font-medium text-slate-900">{new Date(report.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="py-6 border-b border-slate-100 flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doctor</p>
                      <p className="text-sm font-medium text-slate-900">Dr. {user?.fullName || "Unknown Doctor"}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Prescription Section */}
                    <div className="pt-2">
                      <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
                        <span className="text-teal-600 font-serif text-3xl font-bold leading-none">Rx</span>
                        <span className="translate-y-[2px]">Medicines & Directions</span>
                      </h3>
                      {isEditingReport ? (
                        <textarea
                          value={editedPrescription}
                          onChange={(e) => setEditedPrescription(e.target.value)}
                          className="w-full text-sm p-4 sm:p-5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[160px] resize-none leading-relaxed text-slate-700 shadow-sm"
                          placeholder="List medicines and dosages here..."
                        />
                      ) : (
                        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] min-h-[120px]">
                          {report.prescription || "No prescription added."}
                        </div>
                      )}
                    </div>

                    {/* Clinical Summary */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-slate-400" /> <span className="translate-y-[1px]">Clinical Notes</span>
                      </h3>
                      {isEditingReport ? (
                        <textarea
                          value={editedDoctorNote}
                          onChange={(e) => setEditedDoctorNote(e.target.value)}
                          className="w-full text-sm p-4 sm:p-5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent min-h-[120px] resize-none leading-relaxed text-slate-700 shadow-sm"
                          placeholder="Clinical summary and advice..."
                        />
                      ) : (
                        <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] min-h-[100px]">
                          {report.summary || "No clinical notes added."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {report && (
              <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col gap-2 shrink-0">
                {report.status !== 'Sent to Patient' ? (
                  <>
                    {isEditingReport ? (
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 text-xs py-1 h-8" onClick={() => setIsEditingReport(false)}>
                          Cancel
                        </Button>
                        <Button className="flex-1 text-xs py-1 h-8 bg-slate-900 hover:bg-slate-800 text-white gap-1" onClick={handleSaveReport}>
                          <CheckCircle className="h-3.5 w-3.5" /> Save Changes
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full text-xs py-1 h-8 border-slate-300 gap-1 font-semibold" onClick={() => setIsEditingReport(true)}>
                        <Edit2 className="h-3.5 w-3.5" /> Edit Report
                      </Button>
                    )}
                    <Button
                      className="w-full text-xs py-1 h-8 bg-teal-600 hover:bg-teal-700 text-white gap-1 font-bold shadow-sm"
                      onClick={handleSendToPatient}
                      disabled={isEditingReport}
                    >
                      <Send className="h-3.5 w-3.5" /> Send to Patient
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 py-4 w-full">
                    <CheckCircle className="h-5 w-5" /> Finalized & Sent
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
