"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChatWindow } from "@/components/shared/ChatWindow"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Video, Phone, Activity, FileText, CheckCircle2, Clock, Calendar, History, Stethoscope, MessageSquare, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { io } from "socket.io-client"
import { IncomingCallModal } from "@/components/shared/IncomingCallModal"

export default function DoctorChat() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const doctorId = searchParams.get('doctorId')
  const chatIdParam = searchParams.get('chatId')

  const [doctor, setDoctor] = useState(null)
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [consultationEnded, setConsultationEnded] = useState(false)
  const [reportReady, setReportReady] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [selectedHistoryChat, setSelectedHistoryChat] = useState(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [chatSocket, setChatSocket] = useState(null)

  // Patient Chat History Dashboard States
  const [patientChats, setPatientChats] = useState([])
  const [filterStatus, setFilterStatus] = useState("all")

  const handleDeleteChat = async (chatId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this consultation history?")
      if (!confirmDelete) return

      const res = await api.delete(`/chats/${chatId}`)
      if (res.data.success) {
        toast.success("Consultation history deleted successfully")
        setPatientChats(prev => prev.filter(c => c._id !== chatId))
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete consultation history")
    }
  }

  // One-time chat initialization when doctorId changes
  useEffect(() => {
    if (!doctorId) return

    const initializeChat = async () => {
      try {
        setIsLoading(true)
        const docRes = await api.get(`/doctors/${doctorId}`)
        setDoctor(docRes.data.data)

        // Request or get existing chat (ONLY ONCE!)
        const isResuming = searchParams.get('resume') === 'true'
        console.log(`[Chat Request] patient clicked Start Chat with doctorId: ${doctorId}, resume: ${isResuming}`)
        const chatRes = await api.post('/chats/request', { doctorId, resume: isResuming })
        const chatData = chatRes.data.data

        setChat(chatData)
        const formatted = (chatData.messages || []).map(m => ({
          sender: m.senderModel === 'Doctor' ? 'doctor' : 'user',
          content: m.content,
          timestamp: m.timestamp,
          _id: m._id
        }))
        setMessages(formatted)

        if (chatData.status === 'ended') setConsultationEnded(true)

        // Fetch chat history with this doctor
        try {
          const historyRes = await api.get(`/chats/patient/history/${doctorId}`)
          if (historyRes.data.success) {
            setChatHistory(historyRes.data.data)
          }
        } catch (historyErr) {
          console.error("Failed to fetch chat history:", historyErr)
        }
      } catch (err) {
        toast.error("Failed to initialize chat")
      } finally {
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [doctorId, searchParams])

  // Auto-open history modal when chatId param is present (e.g. from follow-up notification) or redirect to active chat
  useEffect(() => {
    if (!chatIdParam || doctorId) return;
    const fetchAndOpenChat = async () => {
      try {
        const res = await api.get(`/chats/${chatIdParam}`);
        if (res.data.success) {
          const chatData = res.data.data;
          
          // If the chat is not ended, ALWAYS redirect to the live chat window!
          if (chatData.status !== 'ended') {
            const docId = chatData.doctor?._id || chatData.doctor;
            router.replace(`/patient/chat?doctorId=${docId}&resume=true`);
            return;
          }

          // Only show past consultation modal if chat is actually ended
          setSelectedHistoryChat(chatData);
          setIsHistoryModalOpen(true);
        }
      } catch (err) {
        console.error('[Follow-up] Failed to load chat:', err);
      }
    };
    fetchAndOpenChat();
  }, [chatIdParam, doctorId, router]);

  // Recurring polling for status, availability, and doctor list updates
  useEffect(() => {
    let interval
    const pollData = async () => {
      if (!doctorId) {
        try {
          const res = await api.get('/chats/patient/all')
          if (res.data.success) {
            setPatientChats(res.data.data)
          }
        } catch (err) {
          console.error("Failed to poll conversations:", err)
        }
      } else {
        try {
          // Only poll doctor details to update their real-time availability/break status
          const docRes = await api.get(`/doctors/${doctorId}`)
          setDoctor(docRes.data.data)
        } catch (err) {
          console.error("Failed to poll doctor details:", err)
        }
      }
    }

    // Initial fetch for patient list if no doctorId
    if (!doctorId) {
      const fetchListOnMount = async () => {
        try {
          setIsLoading(true)
          const res = await api.get('/chats/patient/all')
          if (res.data.success) {
            setPatientChats(res.data.data)
          }
        } catch (err) {
          toast.error("Failed to load your conversations")
        } finally {
          setIsLoading(false)
        }
      }
      fetchListOnMount()
    }

    // Poll every 10 seconds for real-time updates
    interval = setInterval(pollData, 10000)

    return () => clearInterval(interval)
  }, [doctorId])

  // Real-time doctor status via socket
  useEffect(() => {
    if (!doctorId) return;
    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
    socket.on('doctorStatusChanged', (data) => {
      if (data.doctorId?.toString() === doctorId) {
        setDoctor(prev => prev ? { ...prev, onlineStatus: data.status, breakExpiresAt: data.breakExpiresAt } : prev);
      }
    });
    return () => socket.disconnect();
  }, [doctorId]);

  // Real-time chat messages and consultation status via socket
  useEffect(() => {
    // Don't setup socket if no chat yet or already ended
    if (!chat || !chat._id) return;
    // Don't reconnect if chat is ended — no more events needed
    if (chat.status === 'ended') return;

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] });
    setChatSocket(socket);

    socket.on('connect', () => {
      socket.emit('joinRoom', `chat_${chat._id}`);
      console.log(`[Socket] Patient joined chat room chat_${chat._id}`);
    });

    socket.on('messageReceived', (data) => {
      if (data.chatId === chat._id) {
        setMessages(prev => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, {
            sender: data.message.senderModel === 'Doctor' ? 'doctor' : 'user',
            content: data.message.content,
            timestamp: data.message.timestamp,
            _id: data.message._id
          }];
        });
      }
    });

    socket.on('consultationEnded', (data) => {
      if (data.chatId === chat._id) {
        toast("Consultation has been ended by the doctor", { icon: '🔔' });
        setConsultationEnded(true);
        setChat(prev => prev ? { ...prev, status: 'ended' } : prev);
      }
    });

    // Instant update when doctor accepts or declines — no polling needed
    socket.on('consultationResponded', (updatedChat) => {
      console.log('[Socket] Patient received consultationResponded:', updatedChat.status);
      if (updatedChat._id === chat._id) {
        setChat(updatedChat);
        if (updatedChat.status === 'ended') {
          setConsultationEnded(true);
        }
      }
    });

    return () => {
      console.log(`[Socket] Patient disconnecting from chat room chat_${chat._id}`);
      socket.disconnect();
      setChatSocket(null);
    };
  // IMPORTANT: Only depend on chat._id, NOT chat.status.
  // If we depend on chat.status, the socket disconnects and reconnects every time the
  // doctor responds, creating a race condition where we miss the consultationResponded event.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?._id]);

  // Track the currently active chat globally to suppress global popups for this chat
  useEffect(() => {
    if (chat?._id) {
      window.currentActiveChatId = chat._id;
      return () => { window.currentActiveChatId = null; };
    }
  }, [chat?._id]);

  // Polling for chat status and messages (fallback if socket misses an event)
  useEffect(() => {
    let interval;
    if (chat && chat.status !== 'ended') {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/chats/${chat._id}`)
          const updatedChat = res.data.data
          // Only update if status actually changed to avoid unnecessary re-renders
          setChat(prev => {
            if (prev?.status === updatedChat.status) return prev;
            return updatedChat;
          })

          // Map backend message format to frontend
          const formattedMessages = updatedChat.messages.map(m => ({
            sender: m.senderModel === 'Doctor' ? 'doctor' : 'user',
            content: m.content,
            timestamp: m.timestamp,
            _id: m._id
          }))
          setMessages(formattedMessages)

          if (updatedChat.status === 'ended') {
            setConsultationEnded(true)
            clearInterval(interval)
          }
        } catch (err) { }
      }, 3000) // Poll every 3s — faster fallback for status changes
    }
    return () => clearInterval(interval)
  }, [chat?._id, chat?.status])

  // Poll for report status once consultation ended
  useEffect(() => {
    let interval;
    if (consultationEnded) {
      const checkReport = async () => {
        try {
          const res = await api.get('/reports/patient')
          if (res.data.success) {
            const hasReport = res.data.data.some(r =>
              (chat && chat.appointment && r.appointment === chat.appointment) ||
              (r.doctor?._id === doctorId || r.doctor === doctorId)
            )
            if (hasReport) {
              setReportReady(true)
              clearInterval(interval)
            }
          }
        } catch (err) {
          console.error("Failed to check report status:", err)
        }
      }
      checkReport()
      interval = setInterval(checkReport, 8000) // Poll every 8s
    }
    return () => clearInterval(interval)
  }, [consultationEnded, chat, doctorId])

  const handleSendMessage = async (content) => {
    if (!chat) return
    try {
      const res = await api.post(`/chats/${chat._id}/messages`, { content })
      // Backend returns updated chat
      const formattedMessages = res.data.data.messages.map(m => ({
        sender: m.senderModel === 'Doctor' ? 'doctor' : 'user',
        content: m.content,
        timestamp: m.timestamp,
        _id: m._id
      }))
      setMessages(formattedMessages)
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send message"
      toast.error(errMsg)
    }
  }

  const handleEndConsultation = async () => {
    if (!chat) return
    try {
      await api.put(`/chats/${chat._id}/end`)
      setConsultationEnded(true)
      setChat(prev => ({ ...prev, status: 'ended' }))
      toast.success("Consultation ended")
    } catch (err) {
      toast.error("Failed to end consultation")
    }
  }

  const handleDeleteMessage = async (index) => {
    if (!chat) return
    try {
      const res = await api.delete(`/chats/${chat._id}/messages/${index}`)
      const formatted = res.data.data.messages.map(m => ({
        sender: m.senderModel === 'Doctor' ? 'doctor' : 'user',
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

  if (isLoading) {
    return <div className="h-[60vh] flex items-center justify-center">Loading consultation...</div>
  }

  if (!doctorId) {
    const filteredChats = patientChats.filter(c => {
      if (filterStatus === "all") return true;
      if (filterStatus === "active") return ['active', 'rescheduled'].includes(c.status);
      if (filterStatus === "requested") return c.status === 'requested';
      if (filterStatus === "ended") return c.status === 'ended';
      return true;
    });

    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-teal-600 text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Consultations</h1>
            <p className="text-teal-50 text-sm max-w-xl">
              View your past medical consultations history, check chat transcripts, or resume active conversations with your recommended doctors.
            </p>
          </div>
          <Button
            onClick={() => router.push('/patient/doctor-recommendation')}
            className="shrink-0 bg-white text-teal-700 hover:bg-teal-50 font-bold px-6 py-3 rounded-xl shadow-md border border-white/20 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <Stethoscope className="h-5 w-5" /> Start New Chat
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {["all", "active", "requested", "ended"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize ${filterStatus === tab
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
                }`}
            >
              {tab === "all" ? "All Chats" : tab === "active" ? "Active Chats" : tab === "requested" ? "Pending Requests" : "Past Consultations"}
            </button>
          ))}
        </div>

        {/* Conversations Grid */}
        {filteredChats.length === 0 ? (
          <Card className="border-slate-100 shadow-sm py-16 text-center">
            <CardContent className="space-y-4">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">No conversations found</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  {filterStatus === "all"
                    ? "You haven't initiated any consultations yet. Start one today!"
                    : `You don't have any conversations in the "${filterStatus}" filter.`}
                </p>
              </div>
              {filterStatus === "all" && (
                <Button
                  onClick={() => router.push('/patient/doctor-recommendation')}
                  className="bg-teal-600 hover:bg-teal-700 font-bold px-6 rounded-xl"
                >
                  Find a Doctor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {filteredChats.map((c) => {
              const docName = c.doctor?.fullName || "Doctor";
              const spec = c.doctor?.specialization || "General Medicine";
              const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;

              // Status Styling
              let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
              let badgeText = c.status;
              if (c.status === 'active') {
                badgeColor = "bg-emerald-100 text-emerald-700 border-emerald-200";
                badgeText = "Active Consultation";
              } else if (c.status === 'requested') {
                badgeColor = "bg-amber-100 text-amber-700 border-amber-200 animate-pulse";
                badgeText = "Waiting for Response";
              } else if (c.status === 'rescheduled') {
                badgeColor = "bg-sky-100 text-sky-700 border-sky-200";
                badgeText = "Rescheduled Time";
              } else if (c.status === 'ended') {
                badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
                badgeText = "Completed Session";
              }

              return (
                <Card
                  key={c._id}
                  className="h-full bg-white transition-all duration-300 rounded-[18px] flex flex-col justify-between shadow-sm hover:shadow-md border-0"
                  style={{
                    border: c.status === 'active' ? '1px solid #99f6e4' : '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
                  }}
                >
                  <CardContent className="flex-1 flex flex-col justify-start" style={{ padding: '28px', gap: '24px' }}>
                    {/* Doctor Info Block */}
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        {/* 52px x 52px Circular Avatar */}
                        <div
                          className="relative rounded-full bg-teal-50 border-2 border-white shadow-sm flex-shrink-0"
                          style={{ width: '52px', height: '52px', minWidth: '52px', minHeight: '52px' }}
                        >
                          {/* Perfectly Centered Doctor Initial */}
                          <div className="absolute inset-0 flex items-center justify-center text-teal-700 font-extrabold text-xl leading-none">
                            {docName.charAt(0)}
                          </div>

                          {/* Bottom-Right Status Indicator Dot */}
                          <span
                            className="rounded-full border-2 border-white shadow-sm transition-colors duration-300"
                            style={{
                              position: 'absolute',
                              bottom: '-1px',
                              right: '-1px',
                              width: '14px',
                              height: '14px',
                              backgroundColor: c.status === 'ended'
                                ? '#94a3b8'
                                : c.doctor?.onlineStatus === 'busy'
                                  ? '#ef4444'
                                  : c.doctor?.onlineStatus === 'break'
                                    ? '#f97316'
                                    : '#10b981'
                            }}
                            title={(() => {
                              const formatTime12 = (t) => {
                                if (!t) return '';
                                const [h, m] = t.split(':');
                                const hours = parseInt(h, 10);
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
                                return `${formattedHours}:${m} ${ampm}`;
                              };
                              return c.status === 'ended'
                                ? 'Offline / Completed Session'
                                : c.doctor?.onlineStatus === 'break'
                                  ? c.doctor?.breakExpiresAt
                                    ? `On Break (until ${new Date(c.doctor.breakExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                                    : c.doctor?.dailyBreak?.enabled
                                      ? `Scheduled Break (${formatTime12(c.doctor.dailyBreak.startTime)} - ${formatTime12(c.doctor.dailyBreak.endTime)})`
                                      : 'On Break'
                                  : 'Active / Available';
                            })()}
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <h3 className="font-bold text-slate-800 text-base leading-tight">Dr. {docName}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{spec}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${badgeColor} py-1 px-3 text-[9px] uppercase font-extrabold tracking-widest rounded-full border shadow-sm flex-shrink-0 self-center`}>
                        {badgeText}
                      </Badge>
                    </div>

                    {/* Last Message Snippet */}
                    <div
                      className="p-4 rounded-2xl text-xs text-slate-600 leading-relaxed min-h-[56px] flex items-center"
                      style={{ backgroundColor: '#f8fafc', border: '1px solid #e5e7eb' }}
                    >
                      <span className="line-clamp-2 w-full font-medium">
                        {lastMsg
                          ? `${lastMsg.senderModel === 'Doctor' ? `Dr. ${docName}` : 'You'}: "${lastMsg.content}"`
                          : "No messages in this chat session yet."}
                      </span>
                    </div>

                    {/* Footer Details & CTAs */}
                    <div
                      className="flex flex-col gap-3 pt-4 mt-auto w-full"
                      style={{ borderTop: '1px solid #e5e7eb' }}
                    >
                      {/* Row 1: Date & Time */}
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 flex-shrink-0">
                          <Calendar className="h-4 w-4 text-teal-500" />
                          {new Date(c.updatedAt).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Row 2: CTA Buttons */}
                      <div className="flex flex-wrap items-center justify-end w-full" style={{ gap: '12px' }}>
                        {c.status === 'ended' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedHistoryChat(c)
                                setIsHistoryModalOpen(true)
                              }}
                              className="text-xs border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 hover:text-teal-800 font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm h-9 flex items-center justify-center flex-shrink-0"
                            >
                              <History className="h-3.5 w-3.5 mr-1" /> History
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => router.push(`/patient/chat?doctorId=${c.doctor?._id || c.doctor}`)}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all duration-200 shadow-sm h-9 flex items-center justify-center min-w-[130px] flex-shrink-0"
                            >
                              Consult Again
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteChat(c._id)}
                              className="border-red-200 text-red-500 bg-red-50/50 hover:bg-red-50 hover:text-red-600 font-bold px-3 rounded-xl transition-all duration-200 shadow-sm h-9 flex items-center justify-center flex-shrink-0"
                              title="Delete Consultation History"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => router.push(`/patient/chat?doctorId=${c.doctor?._id || c.doctor}&resume=true`)}
                            className="bg-teal-600 hover:bg-teal-700 font-bold text-white text-xs shadow-md shadow-teal-100/50 px-5 py-2 rounded-xl transition-all duration-200 h-9 flex items-center justify-center min-w-[150px] flex-shrink-0"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Resume Chat
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Previous Consultation History Modal (Rendered from our shared modal state) */}
        {isHistoryModalOpen && selectedHistoryChat && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
              <div className="bg-teal-600 p-5 text-white flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-lg font-bold">Past Consultation</h3>
                  <p className="text-teal-100 text-xs mt-0.5">
                    {new Date(selectedHistoryChat.createdAt).toLocaleString()} with Dr. {selectedHistoryChat.doctor?.fullName || "Doctor"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsHistoryModalOpen(false)
                    setSelectedHistoryChat(null)
                    // Remove chatId from URL so it doesn't pop up again on refresh
                    router.replace('/patient/chat')
                  }}
                  className="text-white hover:text-teal-100 text-sm font-bold bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chat Transcript</p>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto">
                    {selectedHistoryChat.messages && selectedHistoryChat.messages.length > 0 ? (
                      selectedHistoryChat.messages.map((m, idx) => {
                        const isDoctor = m.senderModel === 'Doctor';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isDoctor ? 'items-start' : 'items-end'}`}
                          >
                            <span className="text-[10px] text-slate-400 mb-0.5 font-medium">
                              {isDoctor ? `Dr. ${selectedHistoryChat.doctor?.fullName || 'Doctor'}` : 'You'}
                            </span>
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${isDoctor
                                  ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                  : 'bg-teal-600 text-white rounded-tr-none'
                                }`}
                            >
                              <div>{m.content}</div>
                              {m.timestamp && (
                                <div className={`text-[9px] mt-1 text-right leading-none ${isDoctor ? 'text-slate-400' : 'text-teal-200'
                                  }`}>
                                  {new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-slate-400 italic text-center py-4">No messages in this session.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <Button
                  onClick={() => {
                    setIsHistoryModalOpen(false)
                    setSelectedHistoryChat(null)
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 rounded-xl font-bold"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!doctor) return null

  // If status is "requested", show waiting screen
  if (chat?.status === 'requested') {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border-teal-100">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
            <div className="absolute inset-2 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
              <span className="text-3xl font-bold text-teal-700">{doctor.fullName.charAt(0)}</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Requesting Consultation</h2>
            <p className="text-slate-500 mt-2">Waiting for Dr. {doctor.fullName} to accept your request...</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Doctor Availability</p>
            {doctor.onlineStatus === 'busy' ? (
              <div className="flex items-center justify-center gap-2 text-red-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Doctor is busy in another consultation
              </div>
            ) : doctor.onlineStatus === 'break' ? (
              <div className="flex items-center justify-center gap-2 text-orange-600 font-bold">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Doctor is currently on break
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Doctor is online
              </div>
            )}
          </div>
          {(() => {
            const handleCancelRequest = async () => {
              if (!chat) return
              try {
                await api.put(`/chats/${chat._id}/cancel`)
                toast.success("Request cancelled successfully")
                router.push('/patient/doctor-recommendation')
              } catch (err) {
                toast.error("Failed to cancel request")
              }
            }

            return (
              <Button variant="outline" className="w-full" onClick={handleCancelRequest}>
                Cancel Request
              </Button>
            )
          })()}
        </Card>
      </div>
    )
  }

  // If status is "rescheduled"
  if (chat?.status === 'rescheduled') {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border-amber-100">
          <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Doctor is Busy</h2>
            <p className="text-slate-500 mt-2">Dr. {doctor.fullName} has rescheduled your consultation.</p>
          </div>
          <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 text-left">
            <p className="text-xs text-amber-600 uppercase font-bold mb-3">New Appointment Time</p>
            <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
              {chat.scheduledTime || "To be confirmed"}
            </div>
          </div>
          <p className="text-sm text-slate-500">A notification has been sent to your dashboard.</p>
          <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={() => router.push('/patient/appointments')}>View Appointments</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Main Chat Area */}
      <div className="flex flex-col h-full w-full md:w-8/12">
        {doctor?.onlineStatus === 'break' && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3 text-orange-800 text-sm font-semibold shadow-sm animate-in slide-in-from-top duration-300 shrink-0">
            <Clock className="h-5 w-5 text-orange-500 animate-pulse" />
            <span>Dr. {doctor.fullName} is currently on break. You can compose messages, but they will not be sent until the break ends.</span>
          </div>
        )}
        <ChatWindow
          title={`Consultation with Dr. ${doctor.fullName}`}
          subtitle={(() => {
            const formatTime12 = (t) => {
              if (!t) return '';
              const [h, m] = t.split(':');
              const hours = parseInt(h, 10);
              const ampm = hours >= 12 ? 'PM' : 'AM';
              const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
              return `${formattedHours}:${m} ${ampm}`;
            };
            return `${doctor.specialization} \u2022 ${(doctor.onlineStatus === 'available' || !doctor.onlineStatus)
                ? 'Available'
                : doctor.onlineStatus === 'busy'
                  ? 'Busy (In Consultation)'
                  : doctor.breakExpiresAt
                    ? `On Break (until ${new Date(doctor.breakExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                    : doctor.dailyBreak?.enabled
                      ? `Scheduled Break (${formatTime12(doctor.dailyBreak.startTime)} - ${formatTime12(doctor.dailyBreak.endTime)})`
                      : 'On Break'
              }`;
          })()}
          messages={messages}
          onSendMessage={handleSendMessage}
          onDeleteMessage={!consultationEnded ? handleDeleteMessage : undefined}
          disabled={consultationEnded || chat?.status !== 'active'}
          headerRight={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-600" onClick={() => router.push(`/patient/video-call?chatId=${chat._id}&isVideo=false`)}>
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-600 bg-slate-100" onClick={() => router.push(`/patient/video-call?chatId=${chat._id}&isVideo=true`)}>
                <Video className="h-5 w-5" />
              </Button>
              {!consultationEnded && (
                <Button variant="danger" size="sm" onClick={handleEndConsultation}>
                  End
                </Button>
              )}
            </div>
          }
        />

        {!consultationEnded && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-white border border-slate-200 py-2 px-4 rounded-full self-center shadow-sm">
            <Activity className="h-4 w-4 text-teal-500 animate-pulse" />
            AI is silently taking clinical notes
          </div>
        )}
      </div>

      {/* Sidebar Area */}
      <div className="w-full md:w-4/12 h-full overflow-y-auto space-y-4">
        {consultationEnded ? (
          <Card className="border-teal-200 bg-teal-50">
            <CardContent className="p-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Consultation Ended</h3>
              <p className="text-sm text-slate-600 mb-4">Thank you for your time.</p>

              {!reportReady ? (
                <div className="p-3 bg-white rounded-lg border border-teal-100 text-sm flex items-center justify-center gap-2 text-teal-700 font-medium">
                  <Activity className="h-4 w-4 animate-spin" />
                  AI drafting report for doctor review...
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in">
                  <div className="p-3 bg-white rounded-lg border border-teal-100 text-sm flex items-center justify-between">
                    <span className="font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600" /> Medical Report
                    </span>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <Button className="w-full" onClick={() => router.push('/patient/reports')}>View Final Report</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-teal-50 flex items-center justify-center overflow-hidden mb-4 border-2 border-white shadow-sm">
                <span className="text-3xl font-bold text-teal-600">{doctor.fullName.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Dr. {doctor.fullName}</h3>
              <p className="text-sm text-slate-500 mb-2">{doctor.specialization}</p>
              <Badge
                className="font-extrabold text-[9px] uppercase px-2.5 py-0.5 border shadow-sm"
                style={{
                  color: (doctor.onlineStatus === 'available' || !doctor.onlineStatus) ? '#10b981' : doctor.onlineStatus === 'busy' ? '#ef4444' : '#f97316',
                  borderColor: (doctor.onlineStatus === 'available' || !doctor.onlineStatus) ? '#a7f3d0' : doctor.onlineStatus === 'busy' ? '#fecaca' : '#fed7aa',
                  backgroundColor: (doctor.onlineStatus === 'available' || !doctor.onlineStatus) ? '#ecfdf5' : doctor.onlineStatus === 'busy' ? '#fef2f2' : '#fff7ed'
                }}
              >
                {(() => {
                  const formatTime12 = (t) => {
                    if (!t) return '';
                    const [h, m] = t.split(':');
                    const hours = parseInt(h, 10);
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
                    return `${formattedHours}:${m} ${ampm}`;
                  };
                  return (doctor.onlineStatus === 'available' || !doctor.onlineStatus)
                    ? '🟢 Available'
                    : doctor.onlineStatus === 'busy'
                      ? '🔴 Busy (In Chat)'
                      : doctor.breakExpiresAt
                        ? `🟠 On Break (until ${new Date(doctor.breakExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                        : doctor.dailyBreak?.enabled
                          ? `🟠 Scheduled Break (${formatTime12(doctor.dailyBreak.startTime)} - ${formatTime12(doctor.dailyBreak.endTime)})`
                          : '🟠 On Break';
                })()}
              </Badge>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-5">
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">Patient Context</h4>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1 text-[10px]">Medical History Summary</p>
                <p className="text-sm text-slate-700">Detailed AI analysis will appear here as you chat.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {chatHistory.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h4 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-1.5">
                <History className="h-4 w-4 text-teal-600" />
                Previous Consultations
              </h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {chatHistory.map((pastChat) => (
                  <div
                    key={pastChat._id}
                    className="p-3 bg-slate-50 hover:bg-teal-50/50 rounded-lg border border-slate-100 cursor-pointer transition-all flex justify-between items-center"
                    onClick={() => {
                      setSelectedHistoryChat(pastChat)
                      setIsHistoryModalOpen(true)
                    }}
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {new Date(pastChat.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {pastChat.messages?.length || 0} messages
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-teal-600 hover:text-teal-700 font-medium px-2.5 hover:bg-teal-50 rounded-lg">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Previous Consultation History Modal */}
      {isHistoryModalOpen && selectedHistoryChat && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="bg-teal-600 p-5 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-bold">Past Consultation</h3>
                <p className="text-teal-100 text-xs mt-0.5">
                  {new Date(selectedHistoryChat.createdAt).toLocaleString()} with Dr. {doctor.fullName}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  setSelectedHistoryChat(null)
                }}
                className="text-white hover:text-teal-100 text-sm font-bold bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chat Transcript</p>
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-[300px] overflow-y-auto">
                  {selectedHistoryChat.messages && selectedHistoryChat.messages.length > 0 ? (
                    selectedHistoryChat.messages.map((m, idx) => {
                      const isDoctor = m.senderModel === 'Doctor';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isDoctor ? 'items-start' : 'items-end'}`}
                        >
                          <span className="text-[10px] text-slate-400 mb-0.5 font-medium">
                            {isDoctor ? `Dr. ${doctor.fullName}` : 'You'}
                          </span>
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative ${isDoctor
                                ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                : 'bg-teal-600 text-white rounded-tr-none'
                              }`}
                          >
                            <div>{m.content}</div>
                            {m.timestamp && (
                              <div className={`text-[9px] mt-1 text-right leading-none ${isDoctor ? 'text-slate-400' : 'text-teal-200'
                                }`}>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-slate-400 italic text-center py-4">No messages in this session.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
              <Button
                onClick={() => {
                  setIsHistoryModalOpen(false)
                  setSelectedHistoryChat(null)
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Incoming Call Modal */}
      <IncomingCallModal socket={chatSocket} />
    </div>
  )
}
