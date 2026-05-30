import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Video, PhoneOff } from "lucide-react";

export function IncomingCallModal({ socket }) {
    const router = useRouter();
    const pathname = usePathname();
    const [incomingCall, setIncomingCall] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleCallUser = (data) => {
            console.log("[WebRTC] Received incoming call:", data);
            setIncomingCall(data);
            
            // Try to play ringtone
            if (!audioRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioContext();
                let intervalId;
                
                const createBeep = (freq, startTime, duration) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = freq;
                    
                    gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
                    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + 0.02);
                    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + startTime + duration - 0.02);
                    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + startTime + duration);
                    
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + startTime);
                    osc.stop(ctx.currentTime + startTime + duration);
                };

                const playRing = () => {
                    if (ctx.state === 'suspended') ctx.resume();
                    // Modern clean double-beep
                    createBeep(880, 0, 0.15);
                    createBeep(880, 0.25, 0.15);
                };

                audioRef.current = {
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
            audioRef.current.play().catch(e => console.log("Audio play prevented by browser", e));
        };

        const handleCallEnded = () => {
            console.log("[WebRTC] Call was ended/cancelled by caller");
            setIncomingCall(null);
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };

        socket.on('callUser', handleCallUser);
        socket.on('callEnded', handleCallEnded);

        return () => {
            socket.off('callUser', handleCallUser);
            socket.off('callEnded', handleCallEnded);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [socket]);

    const handleAccept = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        const { from, isVideo, chatId, name } = incomingCall;
        const role = pathname.includes('/doctor') ? 'doctor' : 'patient';
        
        // Store incoming call data in sessionStorage to pass it to the video-call page
        sessionStorage.setItem('incomingCall', JSON.stringify(incomingCall));

        setIncomingCall(null);
        router.push(`/${role}/video-call?chatId=${chatId}&receiving=true&callerId=${from}&callerName=${encodeURIComponent(name)}&isVideo=${isVideo}`);
    };

    const handleReject = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (incomingCall) {
            socket.emit('rejectCall', { to: incomingCall.from });
        }
        setIncomingCall(null);
    };

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center bg-gradient-to-b from-teal-50 to-white">
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-teal-200 animate-ping opacity-75"></div>
                        <div className="absolute inset-0 rounded-full bg-teal-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            <span className="text-3xl font-extrabold text-teal-600">
                                {incomingCall.name ? incomingCall.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                        {incomingCall.name || 'Unknown Caller'}
                    </h2>
                    <p className="text-slate-500 font-medium flex items-center justify-center gap-2 mb-8">
                        {incomingCall.isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                        Incoming {incomingCall.isVideo ? 'Video' : 'Voice'} Call...
                    </p>

                    <div className="flex items-center justify-center gap-6">
                        <button 
                            onClick={handleReject}
                            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <PhoneOff className="h-7 w-7" />
                        </button>
                        
                        <button 
                            onClick={handleAccept}
                            className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-pulse"
                        >
                            {incomingCall.isVideo ? <Video className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
