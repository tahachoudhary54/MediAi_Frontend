"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MonitorUp, Settings } from "lucide-react"
import { ChatWindow } from "@/components/shared/ChatWindow"

export default function VideoCallPage() {
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const [messages, setMessages] = useState([
    { sender: "doctor", content: "Hi! Can you hear me clearly?" }
  ])

  const handleSendMessage = (content) => {
    setMessages(prev => [...prev, { sender: "user", content }])
  }

  const handleEndCall = () => {
    router.back()
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Video Area */}
      <div className={`flex-1 flex flex-col bg-slate-900 rounded-2xl overflow-hidden relative shadow-xl transition-all duration-300 ${showChat ? 'md:w-2/3' : 'w-full'}`}>

        {/* Main Video (Doctor) */}
        <div className="flex-1 relative flex items-center justify-center">
          {!isVideoOff ? (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <div className="text-center text-white/50">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Doctor's Camera Feed</p>
              </div>
            </div>
          ) : (
            <div className="h-32 w-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl text-slate-500 font-bold">
              DR
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium">
            Dr. Uzer Kool
          </div>
        </div>

        {/* Self View (Patient) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-slate-800 rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
          {!isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
              Your Camera
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-lg text-slate-400 font-bold">
                Me
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="h-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-4 px-6">
          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            onClick={() => setIsVideoOff(!isVideoOff)}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 rounded-full bg-slate-800 text-white hover:bg-slate-700 hidden sm:flex"
          >
            <MonitorUp className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-12 w-12 rounded-full ${showChat ? 'bg-teal-600 text-white hover:bg-teal-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="danger"
            className="h-12 px-6 rounded-full font-bold ml-4"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-5 w-5 mr-2" /> End Call
          </Button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-1/3 hidden md:flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-8 duration-300">
          <ChatWindow
            title="In-Call Messages"
            subtitle="Messages will disappear after call"
            messages={messages}
            onSendMessage={handleSendMessage}
            headerRight={
              <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => setShowChat(false)}>
                <Settings className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
