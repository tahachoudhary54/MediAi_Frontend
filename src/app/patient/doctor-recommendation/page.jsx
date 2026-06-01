"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Phone, Activity, FileText, CheckCircle2, Clock, Calendar, History, Stethoscope, MessageSquare, Trash2, Camera, Search, MapPin, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const CONSULTATION_PRICES = { chat: 99, voice: 199, video: 299 };
// Utility to calculate total price with discount
const calculateTotal = (features) => {
  const sum = features.reduce((total, f) => total + CONSULTATION_PRICES[f], 0);
  const allFeatures = ['chat', 'voice', 'video'];
  const hasAll = allFeatures.every((f) => features.includes(f));
  return hasAll ? Math.round(sum * 0.9) : sum;
};
export default function DoctorRecommendation() {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("All");
  const router = useRouter();
  const { user } = useAuth();

  // Step 1 modal – choose consultation type
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [pendingDoctorId, setPendingDoctorId] = useState(null);
  const [isWaitingForDoctor, setIsWaitingForDoctor] = useState(false);
  const [pendingChatId, setPendingChatId] = useState(null);

  // Step 2 modal – simulated checkout
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingFeatures, setPendingFeatures] = useState([]);
  const [selectedFeaturesModal1, setSelectedFeaturesModal1] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const openConsultationModal = (doctorId) => {
    setPendingDoctorId(doctorId);
    setSelectedFeaturesModal1(['chat']);
    setConsultationModalOpen(true);
  };

  const ensurePayment = async (featuresArray, doctorId, chatId) => {
    try {
      const { data } = await api.post("/payment/consultation", { features: featuresArray, doctorId, chatId });
      if (data.success) {
        console.log(`✅ Payment successful – ₹${data.amount}`);
        return true;
      }
    } catch (err) {
      console.error("Payment error:", err);
    }
    return false;
  };

  const fileInputRef = useRef(null);

  const handleAddImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Placeholder: you can integrate upload API here
    console.log('Selected image file:', file);
    // TODO: send image as a chat message
  };

  // User picks features → Send request to Doctor
  const handleRequestConsultation = async () => {
    setPendingFeatures(selectedFeaturesModal1);
    setIsWaitingForDoctor(true);
    try {
      const res = await api.post("/chats/request", { doctorId: pendingDoctorId, features: selectedFeaturesModal1 });
      if (res.data.success) {
        setPendingChatId(res.data.data._id);
      }
    } catch (err) {
      console.error("Failed to request chat", err);
      setIsWaitingForDoctor(false);
    }
  };

  // User confirms payment in checkout modal
  const handleConfirmPayment = async () => {
    setIsProcessingPayment(true);
    const paid = await ensurePayment(pendingFeatures, pendingDoctorId, pendingChatId);
    
    setIsProcessingPayment(false);
    
    if (paid) {
      router.push(`/patient/chat?doctorId=${pendingDoctorId}&chatId=${pendingChatId}`);
    } else {
      alert("Payment failed. Please try again.");
    }
  };

  const handleStartChat = (doctorId) => {
    openConsultationModal(doctorId);
  };

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctors");
        if (res.data.success) setDoctors(res.data.data);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Socket for live doctor status and chat acceptance
  useEffect(() => {
    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");
    const socket = io(socketUrl, { withCredentials: true, transports: ["websocket", "polling"] });
    
    socket.on("connect", () => {
      if (user?._id || user?.id) {
        socket.emit("joinRoom", `patient_${user._id || user.id}`);
      }
    });

    socket.on("doctorStatusChanged", (data) => {
      setDoctors((prev) =>
        prev.map((doc) => (doc._id === data.doctorId ? { ...doc, onlineStatus: data.status, breakExpiresAt: data.breakExpiresAt } : doc))
      );
    });

    socket.on("consultationResponded", (chat) => {
      if (chat.status === 'accepted') {
        setConsultationModalOpen(false);
        setIsWaitingForDoctor(false);
        setPaymentModalOpen(true);
      } else if (chat.status === 'ended' || chat.status === 'rescheduled') {
        setIsWaitingForDoctor(false);
        setConsultationModalOpen(false);
        alert("The doctor could not accept your request at this time.");
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specialization === "All" || doc.specialization === specialization;
    return matchesSearch && matchesSpec;
  });

  const uniqueSpecializations = ["All", ...new Set(doctors.map((d) => d.specialization).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Finding the best doctors for you...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recommended Doctors</h1>
        <p className="text-slate-500">Based on your recent symptom check and medical history.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search doctors, specialties, or clinics..."
            className="pl-10 text-slate-900 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            {uniqueSpecializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec === "All" ? "All Specialties" : spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <Card key={doctor._id} className="overflow-hidden hover:border-teal-200 transition-all hover:shadow-md group">
              <CardContent className="p-0 sm:flex">
                <div className="bg-slate-50 w-full sm:w-48 flex flex-col items-center justify-center p-6 border-r border-slate-100">
                  <div className="h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border-4 border-white shadow-sm">
                    <span className="text-2xl font-bold text-teal-700">{doctor.fullName?.charAt(0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    4.9
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Dr. {doctor.fullName}</h3>
                        <p className="text-teal-600 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Stethoscope className="h-4 w-4" /> {doctor.specialization}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          className="font-extrabold text-[9px] uppercase px-2 py-0.5 border shadow-sm"
                          style={{
                            color: doctor.onlineStatus === "available" || !doctor.onlineStatus ? "#10b981" : doctor.onlineStatus === "busy" ? "#ef4444" : "#f97316",
                            borderColor: doctor.onlineStatus === "available" || !doctor.onlineStatus ? "#a7f3d0" : doctor.onlineStatus === "busy" ? "#fecaca" : "#fed7aa",
                            backgroundColor: doctor.onlineStatus === "available" || !doctor.onlineStatus ? "#ecfdf5" : doctor.onlineStatus === "busy" ? "#fef2f2" : "#fff7ed",
                          }}
                        >
                          {(() => {
                            const formatTime12 = (t) => {
                              if (!t) return "";
                              const [h, m] = t.split(":");
                              const hours = parseInt(h, 10);
                              const ampm = hours >= 12 ? "PM" : "AM";
                              return `${(hours % 12 || 12).toString().padStart(2, "0")}:${m} ${ampm}`;
                            };
                            return doctor.onlineStatus === "available" || !doctor.onlineStatus
                              ? "🟢 Available"
                              : doctor.onlineStatus === "busy"
                              ? "🔴 Busy (In Chat)"
                              : doctor.breakExpiresAt
                              ? `🟠 On Break (until ${new Date(doctor.breakExpiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
                              : doctor.dailyBreak?.enabled
                              ? `🟠 Scheduled Break (${formatTime12(doctor.dailyBreak.startTime)} - ${formatTime12(doctor.dailyBreak.endTime)})`
                              : "🟠 On Break";
                          })()}
                        </Badge>
                        <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600 mt-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" /> {doctor.yearsOfExperience || 5}+ yrs Exp.
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" /> {doctor.hospitalName || "MediAI Clinic"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-slate-100">
                    <Link href="/patient/appointments" className="flex-1 sm:flex-none">
                      <Button className="w-full gap-2 bg-teal-600 hover:bg-teal-700 shadow-sm">
                        <Calendar className="h-4 w-4" /> Book Appointment
                      </Button>
                    </Link>
                    <Button
                      className="flex-1 sm:flex-none w-full gap-2 text-teal-600 border-teal-200 hover:bg-teal-50"
                      variant="outline"
                      onClick={() => handleStartChat(doctor._id)}
                    >
                      <MessageSquare className="h-4 w-4" /> Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search filters or specialization.</p>
          </div>
        )}
      </div>

      {/* ── Step 1: Select consultation type ── */}
      {consultationModalOpen && (
        <Modal isOpen={consultationModalOpen} onClose={() => {
            setConsultationModalOpen(false);
            setIsWaitingForDoctor(false);
        }} title="Consultation">
          {isWaitingForDoctor ? (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
              <p className="text-slate-700 font-medium text-center">Waiting for the doctor to accept your request...</p>
              <p className="text-sm text-slate-500 text-center">You will be prompted to pay once accepted.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 p-4">
              <div className="space-y-3">
                <div 
                  className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setSelectedFeaturesModal1(prev => prev.includes('chat') ? prev.filter(f => f !== 'chat') : [...prev, 'chat'])}
                >
                  <input type="checkbox" checked={selectedFeaturesModal1.includes('chat')} readOnly className="h-5 w-5 text-teal-600 rounded pointer-events-none" />
                      <div className="flex-1">
                        <span className="font-bold text-slate-800 block">Chat</span>
                        <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Add Chat Consultation</span>
                      </div>
                      <span className="font-extrabold text-teal-700">₹{CONSULTATION_PRICES.chat}</span>
                </div>

                <div 
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                  onClick={() => setSelectedFeaturesModal1(prev => prev.includes('voice') ? prev.filter(f => f !== 'voice') : [...prev, 'voice'])}
                >
                  <input type="checkbox" checked={selectedFeaturesModal1.includes('voice')} readOnly className="h-5 w-5 text-teal-600 rounded pointer-events-none" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block">Voice Call</span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Add Voice Consultation</span>
                  </div>
                  <span className="font-extrabold text-teal-700">+₹{CONSULTATION_PRICES.voice}</span>
                </div>

                <div 
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
                  onClick={() => setSelectedFeaturesModal1(prev => prev.includes('video') ? prev.filter(f => f !== 'video') : [...prev, 'video'])}
                >
                  <input type="checkbox" checked={selectedFeaturesModal1.includes('video')} readOnly className="h-5 w-5 text-teal-600 rounded pointer-events-none" />
                  <div className="flex-1">
                    <span className="font-bold text-slate-800 block">Video Call</span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Add Video Consultation</span>
                  </div>
                  <span className="font-extrabold text-teal-700">+₹{CONSULTATION_PRICES.video}</span>
                </div>
              </div>

              {/* Note about discount */}
<p className="text-sm text-slate-600 mb-2 bg-amber-100 font-medium rounded-sm p-1">Select all three features (Chat, Voice Call, Video Call) to receive a 10% discount.</p>
<div className="pt-4 border-t border-slate-100 flex flex-col items-start space-y-2">
                <div className="flex justify-between items-center w-full">
                  <span className="font-bold text-slate-600">Total Selection:</span>
                  <span className="text-2xl font-black text-slate-900">₹{calculateTotal(selectedFeaturesModal1)}</span>
                </div>
                {selectedFeaturesModal1.length===3 && (
                  <p className="text-sm text-teal-600">🎉 You get a 10% discount!</p>
                )}
              </div>

              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-base py-6 font-bold rounded-xl shadow-md" onClick={handleRequestConsultation}>
                Request Consultation
              </Button>
            </div>
          )}
        </Modal>
      )}

      {/* ── Step 2: Simulated Checkout ── */}
      {paymentModalOpen && pendingFeatures && pendingFeatures.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden shadow-2xl">
            {/* Dark header */}
            <div className="bg-[#0f172a] px-8 pt-8 pb-6 flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mb-4">
                <svg className="h-7 w-7 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Simulated Checkout</h2>
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure Test Environment
              </p>
            </div>

            {/* White body */}
            <div className="bg-white px-6 py-6 space-y-5">
              {/* Order summary card */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Summary</p>
                <div className="border-b border-slate-200 pb-3">
                  <p className="font-semibold text-slate-800">
                    {pendingFeatures.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' + ')} Consultation
                    {" #"}
                    {Math.random().toString(16).slice(2, 10).toUpperCase()}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-600 font-medium">Total Due:</span>
                  <span className="text-2xl font-bold text-slate-900">₹{calculateTotal(pendingFeatures)}</span>
                </div>
              </div>

              {/* Pay button */}
              <button
                onClick={handleConfirmPayment}
                disabled={isProcessingPayment}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-base shadow-md shadow-indigo-200"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay ₹{calculateTotal(pendingFeatures)}
                  </>
                )}
              </button>

              {/* Cancel → go back to step 1 */}
              <button
                onClick={() => {
                  setPaymentModalOpen(false);
                  setConsultationModalOpen(true);
                }}
                disabled={isProcessingPayment}
                className="w-full text-slate-500 hover:text-slate-700 font-medium py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm disabled:opacity-40"
              >
                Cancel
              </button>

              <p className="text-center text-[11px] text-slate-400">
                This is a simulated payment gateway. No real money will be charged.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
