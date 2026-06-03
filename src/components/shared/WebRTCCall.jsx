"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, MessageSquare } from "lucide-react"
import { io } from "socket.io-client"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

export function WebRTCCall({ role }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const chatId = searchParams.get('chatId')
  const isVideoStr = searchParams.get('isVideo')
  const isVideo = isVideoStr === 'true'
  const isReceiving = searchParams.get('receiving') === 'true'
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(!isVideo)
  const [callStatus, setCallStatus] = useState('Connecting...')
  const [remoteName, setRemoteName] = useState(searchParams.get('callerName') || (role === 'doctor' ? 'Patient' : 'Doctor'))

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const peerConnectionRef = useRef(null)
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)
  const iceCandidateQueue = useRef([])
  const hasRemoteDesc = useRef(false)
  const outgoingAudioRef = useRef(null)
  const ringTimeoutRef = useRef(null)
  const outgoingIceQueue = useRef([])
  const isConnected = useRef(false)
  const callStartTimeRef = useRef(null)

  useEffect(() => {
    if (!chatId || !user) return

    let isMounted = true
    let incomingCallTimeout;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
    const socketUrl = apiBase.replace('/api', '')
    const socket = io(socketUrl, { withCredentials: true, transports: ['websocket', 'polling'] })
    socketRef.current = socket

    // Always rejoin the room on connect/reconnect to prevent lost signals
    socket.on('connect', () => {
      socket.emit('joinRoom', `chat_${chatId}`)
    })

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }]
    })
    peerConnectionRef.current = pc


    // Setup local media with strict audio constraints for professional voice quality and echo cancellation
    const getMedia = async () => {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };
      try {
        return await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: audioConstraints });
      } catch (err) {
        console.warn("[WebRTC] Failed to get requested media, trying audio only...", err);
        if (isVideo) {
          try {
             const stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: audioConstraints });
             setIsVideoOff(true); // Force video off in UI since camera failed
             return stream;
          } catch (audioErr) {
             console.warn("[WebRTC] Failed to get audio as well.", audioErr);
             throw audioErr;
          }
        }
        throw err;
      }
    };

    getMedia()
      .then((stream) => {
        if (!isMounted || pc.signalingState === 'closed') {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        // Bypass React Strict Mode double-mounting by delaying execution
        setTimeout(() => {
          if (!isMounted || pc.signalingState === 'closed') return;
          if (isReceiving) {
            incomingCallTimeout = setTimeout(() => {
              if (isMounted) handleIncomingCall()
            }, 300)
          } else {
            setTimeout(() => {
              if (isMounted) initiateCall()
            }, 300)
          }
        }, 300)
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to get local stream", err)
        setCallStatus("Error accessing camera/microphone")
        
        // Notify other party of failure
        if (isReceiving) {
          socket.emit('rejectCall', { to: `chat_${chatId}` })
        } else {
          socket.emit('endCall', { to: `chat_${chatId}` })
        }
      })

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (isConnected.current || isReceiving) {
          // Send candidate to the remote peer
          const targetRoom = `chat_${chatId}`
          socket.emit('iceCandidate', {
            to: targetRoom,
            candidate: event.candidate
          })
        } else {
          // Queue candidates because the remote peer hasn't joined the signaling room yet
          outgoingIceQueue.current.push(event.candidate)
        }
      }
    }

    // Handle remote stream with a bulletproof track adder
    pc.ontrack = (event) => {
      console.log("[WebRTC] Track received:", event.track.kind);
      if (remoteVideoRef.current) {
        let stream = remoteVideoRef.current.srcObject;
        if (!stream) {
          stream = new MediaStream();
          remoteVideoRef.current.srcObject = stream;
        }
        
        // Add track if not already in the stream
        if (!stream.getTracks().find(t => t.id === event.track.id)) {
          stream.addTrack(event.track);
        }
        
        // Force the video element to play to ensure the new track is processed
        remoteVideoRef.current.play().catch(err => console.error("[WebRTC] Video Play failed:", err));
        
        // Use a dedicated raw JS audio object as a bulletproof fallback for audio rendering
        if (event.track.kind === 'audio') {
          // Pure JS Audio instantiation guarantees routing
          const audioEl = new window.Audio();
          audioEl.srcObject = stream;
          audioEl.play().catch(err => console.error("[WebRTC] Pure JS Audio Play failed:", err));
          window.__webrtc_active_audio = audioEl;
          
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = stream;
            remoteAudioRef.current.play().catch(err => console.error("[WebRTC] React Audio Play failed:", err));
          }
        }
      }
    }

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        handleEndCall(false) // remote ended
      } else if (pc.iceConnectionState === 'connected') {
        setCallStatus('Connected')
        if (!callStartTimeRef.current) callStartTimeRef.current = Date.now();
      }
    }

    let answerProcessed = false;

    // Socket listeners
    socket.on('callAccepted', async (signal) => {
      if (answerProcessed) return;
      answerProcessed = true;

      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      setCallStatus('Connected')
      isConnected.current = true;
      if (!callStartTimeRef.current) callStartTimeRef.current = Date.now();
      
      if (outgoingAudioRef.current) {
        outgoingAudioRef.current.pause();
        outgoingAudioRef.current.currentTime = 0;
      }
      try {
        if (pc.signalingState !== 'have-local-offer') {
          console.log('Ignoring callAccepted because state is not have-local-offer. Current state:', pc.signalingState);
          return;
        }
        
        await pc.setRemoteDescription(new RTCSessionDescription(signal))
        hasRemoteDesc.current = true;
        
        // Process any queued incoming ICE candidates
        iceCandidateQueue.current.forEach(candidate => {
          pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e))
        })
        iceCandidateQueue.current = []

        // Flush any queued outgoing ICE candidates now that the peer is ready
        outgoingIceQueue.current.forEach(candidate => {
          socket.emit('iceCandidate', {
            to: `chat_${chatId}`,
            candidate: candidate
          })
        })
        outgoingIceQueue.current = []
        
      } catch (err) {
        console.error("Error setting remote desc on answer", err)
      }
    })

    socket.on('callRejected', () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      setCallStatus('Call rejected')
      setTimeout(() => handleEndCall(false), 2000)
    })

    socket.on('iceCandidate', async (candidate) => {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } else {
          iceCandidateQueue.current.push(candidate)
        }
      } catch (err) {
        console.error("Error adding ICE candidate", err)
      }
    })

    socket.on('callEnded', () => {
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      console.log("[WebRTC] Call ended by remote peer");
      handleEndCall(false)
    })

    const initiateCall = async () => {
      setCallStatus('Ringing...')
      if (!outgoingAudioRef.current) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        let intervalId;
        
        const createBeep = (freq, startTime, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + startTime + 0.02); // Quieter for outgoing
            gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + startTime + duration - 0.02);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        };

        const playRing = () => {
            if (ctx.state === 'suspended') ctx.resume();
            createBeep(880, 0, 0.15);
            createBeep(880, 0.25, 0.15);
        };

        outgoingAudioRef.current = {
            play: () => {
                clearInterval(intervalId); // Prevent interval leaks
                if (ctx.state === 'suspended') ctx.resume();
                playRing();
                intervalId = setInterval(playRing, 2000);
                return Promise.resolve();
            },
            pause: () => {
                clearInterval(intervalId);
                if (ctx.state !== 'closed') {
                    ctx.close().catch(e => console.log(e));
                }
            },
            currentTime: 0
        };
      }
      outgoingAudioRef.current.play().catch(e => console.log("Audio play prevented", e));
      
      // Add 30 second timeout for unanswered calls
      ringTimeoutRef.current = setTimeout(() => {
         setCallStatus("No answer");
         handleEndCall(true);
      }, 30000);

      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        socket.emit('callUser', {
          roomToCall: `chat_${chatId}`,
          signalData: offer,
          from: socket.id,
          name: user.fullName || (role === 'doctor' ? 'Doctor' : 'Patient'),
          isVideo: isVideo,
          callerModel: role === 'doctor' ? 'Doctor' : 'User',
          callerId: user._id || user.id,
          chatId: chatId
        })
      } catch (err) {
        console.error("Error creating offer", err)
      }
    }

    const handleIncomingCall = async () => {
      setCallStatus('Connecting...')
      try {
        const incomingCallDataStr = sessionStorage.getItem('incomingCall')
        if (!incomingCallDataStr) {
          setCallStatus("Call data lost")
          return
        }
        const incomingCall = JSON.parse(incomingCallDataStr)
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal))
        hasRemoteDesc.current = true
        iceCandidateQueue.current.forEach(candidate => pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error(e)))
        iceCandidateQueue.current = []
        
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        // Robust signaling: Re-emit answerCall until the connection successfully establishes
        // This guarantees connection even if the backend server restarts or drops websocket packets
        const sendAnswerRobustly = () => {
          if (!isMounted || pc.signalingState === 'closed' || pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') return;
          
          socket.emit('answerCall', {
            to: `chat_${chatId}`, 
            callerSocketId: incomingCall.from, 
            signal: answer
          });
          
          // Try again in 1.5 seconds if still not connected
          setTimeout(sendAnswerRobustly, 1500);
        };
        
        sendAnswerRobustly();
      } catch (err) {
        console.error("Error handling incoming call", err)
      }
    }

    return () => {
      isMounted = false;
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      if (typeof incomingCallTimeout !== 'undefined') clearTimeout(incomingCallTimeout);
      socket.disconnect()
      pc.close()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (outgoingAudioRef.current) {
        outgoingAudioRef.current.pause()
        outgoingAudioRef.current.currentTime = 0
      }
      if (window.__webrtc_active_audio) {
        window.__webrtc_active_audio.pause()
        window.__webrtc_active_audio.srcObject = null
        window.__webrtc_active_audio = null
      }
    }
  }, [chatId, user?._id]) // Depend on user._id to prevent tear-down when user object reference changes from polling

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const handleEndCall = async (emitEvent = true) => {
      if (outgoingAudioRef.current) {
        outgoingAudioRef.current.pause()
        outgoingAudioRef.current.currentTime = 0
      }
    if (emitEvent && socketRef.current) {
      socketRef.current.emit('endCall', { to: `chat_${chatId}` })
    }
    
    // Save call history to chat DB ONLY if we are the caller (prevents duplicates)
    if (!isReceiving && callStartTimeRef.current) {
       const durationMs = Date.now() - callStartTimeRef.current;
       const minutes = Math.floor(durationMs / 60000);
       const seconds = Math.floor((durationMs % 60000) / 1000);
       const durationStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
       const callType = isVideo ? "Video Call" : "Voice Call";
       
       try {
         await api.post(`/chats/${chatId}/messages`, {
            content: `📞 ${callType} Ended (Duration: ${durationStr})`
         });
       } catch (err) {
         console.error("Failed to save call history", err);
       }
    } else if (!isReceiving && !callStartTimeRef.current) {
       // Call was missed or rejected
       const callType = isVideo ? "Video Call" : "Voice Call";
       try {
         await api.post(`/chats/${chatId}/messages`, {
            content: `📞 Missed ${callType}`
         });
       } catch (err) {
         console.error("Failed to save missed call history", err);
       }
    }
    
    if (peerConnectionRef.current) peerConnectionRef.current.close()
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop())
    if (socketRef.current) socketRef.current.disconnect()
    
    // Automatically formally end the consultation when a video call ends!
    try {
      await api.put(`/chats/${chatId}/end`)
    } catch (err) {
      console.log('Consultation already ended or failed to end auto', err)
    }
    
    // Check if we are in doctor panel or patient panel, go back to chat
      if (role === 'doctor') {
        router.push(`/doctor/chat/${chatId}`)
      } else {
        router.push(`/patient/appointments`)
      }
  }

  // Render a dedicated professional voice call UI if isVideo is false
  if (!isVideo) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-slate-950 w-full p-4 relative overflow-hidden rounded-3xl shadow-2xl">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Status Bar */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full text-white font-medium flex items-center gap-3 shadow-lg">
            <span className={`h-3 w-3 rounded-full ${callStatus === 'Connected' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse' : 'bg-amber-500'}`}></span>
            {callStatus}
          </div>
        </div>

        {/* Voice Call Centerpiece */}
        <div className="relative flex flex-col items-center justify-center z-10 flex-1 w-full mt-10">
          {/* Avatar with pulsing rings */}
          <div className="relative mb-10">
             {callStatus === 'Connected' && (
                <>
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-[-20px] rounded-full border border-emerald-500/30 animate-pulse"></div>
                  <div className="absolute inset-[-40px] rounded-full border border-emerald-500/10 animate-pulse" style={{ animationDelay: '500ms' }}></div>
                </>
             )}
             <div className="h-36 w-36 md:h-48 md:w-48 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl md:text-7xl text-white font-bold shadow-2xl border-4 border-slate-700 relative z-10">
                {remoteName.charAt(0).toUpperCase()}
             </div>
          </div>
          
          <h2 className="text-white text-3xl md:text-4xl font-bold tracking-wide">{remoteName}</h2>
          <p className="text-slate-400 mt-4 text-lg md:text-xl font-medium">{callStatus === 'Connected' ? 'Voice Call in progress' : callStatus}</p>
        </div>

        {/* Hidden Elements to process streams without showing video */}
        <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="hidden" />
        <audio ref={remoteAudioRef} autoPlay playsInline muted={false} className="hidden" />
        <video ref={localVideoRef} autoPlay playsInline muted className="hidden" />

        {/* Controls Bar */}
        <div className="h-32 w-full flex items-center justify-center gap-6 sm:gap-8 z-20 pb-4">
          <Button
            variant="ghost"
            size="icon"
            className={`h-16 w-16 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg border ${isMuted ? 'bg-red-500/90 border-red-400 text-white hover:bg-red-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </Button>

          <Button
            variant="danger"
            className="h-16 px-10 rounded-full font-bold shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:-translate-y-1 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white border-2 border-red-400/50 flex items-center justify-center"
            onClick={() => handleEndCall(true)}
          >
            <PhoneOff className="h-6 w-6 mr-3" /> <span className="text-lg">End Call</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4 w-full p-4">
      {/* Video Area */}
      <div className="flex-1 flex flex-col bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl w-full">

        {/* Top Status Bar */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white font-medium flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${callStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            {callStatus}
          </div>
        </div>

        {/* Main Video (Remote) */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-800">
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline
            muted={false}
            onLoadedMetadata={(e) => {
                e.target.play().catch(err => console.error("AutoPlay failed:", err));
            }}
            className={`w-full h-full object-cover ${callStatus !== 'Connected' ? 'opacity-0' : 'opacity-100'}`}
          />
          <audio ref={remoteAudioRef} autoPlay playsInline muted={false} className="hidden" />
          
          {callStatus !== 'Connected' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-slate-700/50 flex items-center justify-center text-4xl text-white font-bold mb-4 shadow-lg border-2 border-slate-600">
                {remoteName.charAt(0).toUpperCase()}
              </div>
              <p className="text-white text-xl font-bold">{remoteName}</p>
              <p className="text-slate-400 mt-2">{callStatus}</p>
            </div>
          )}

          <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg">
            {remoteName}
          </div>
        </div>

        {/* Self View (Local) */}
        <div className="absolute top-6 right-6 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-20">
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          {isVideoOff && (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                <User className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="h-24 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 w-full flex items-center justify-center gap-4 sm:gap-6 px-6 pb-6 pt-10">
          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full backdrop-blur-md transition-all duration-300 ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`h-14 w-14 rounded-full backdrop-blur-md transition-all duration-300 ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/20 text-white hover:bg-white/30'}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
          </Button>

          <Button
            variant="danger"
            className="h-14 px-8 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white ml-2 sm:ml-4"
            onClick={() => handleEndCall(true)}
          >
            <PhoneOff className="h-6 w-6 mr-2" /> End Call
          </Button>
        </div>
      </div>
    </div>
  )
}
