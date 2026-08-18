"use client";
import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/shared/ChatWindow";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Plus, AlertCircle, Stethoscope, Calendar, MessageSquare, History, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import api from "@/lib/api";
import { Modal } from "@/components/ui/modal";

export default function SymptomChecker() {
  const initialMessages = [
    {
      sender: "ai",
      content: "Hello! I'm your MediAI medical assistant. Please describe the symptoms you're experiencing, and I'll help you assess them.",
      options: ["I have a headache", "My stomach hurts", "I have a fever and cough"]
    }
  ];

  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState("");
  const [showChoiceButtons, setShowChoiceButtons] = useState(false);
  const [showDoctorCards, setShowDoctorCards] = useState(false);
  const [continueMode, setContinueMode] = useState(false);
  const [isFindingDoctors, setIsFindingDoctors] = useState(false);
  const [fetchedDoctors, setFetchedDoctors] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadKey, setUploadKey] = useState(0);

  // Chat History States
  const [sessionId, setSessionId] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    setSessionId(Date.now().toString());
    const savedHistory = localStorage.getItem("ai_symptom_sessions");
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 && sessionId) {
      setChatHistory(prev => {
        const existingSessionIndex = prev.findIndex(s => s.id === sessionId);
        const firstUserMessage = messages.find(m => m.sender === 'user')?.content || "Symptom check";
        const title = firstUserMessage.length > 40 ? firstUserMessage.substring(0, 40) + "..." : firstUserMessage;

        const updatedSession = {
          id: sessionId,
          title,
          date: new Date().toISOString(),
          messages,
          analysisData,
          showAnalysis,
          continueMode,
          showChoiceButtons
        };

        let newHistory;
        if (existingSessionIndex >= 0) {
          newHistory = [...prev];
          newHistory[existingSessionIndex] = updatedSession;
        } else {
          newHistory = [updatedSession, ...prev];
        }

        localStorage.setItem("ai_symptom_sessions", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [messages, analysisData, showAnalysis, continueMode, showChoiceButtons, sessionId]);

  const loadSession = (session) => {
    setMessages(session.messages);
    setAnalysisData(session.analysisData);
    setShowAnalysis(session.showAnalysis);
    setContinueMode(session.continueMode);
    setShowChoiceButtons(session.showChoiceButtons);
    setSessionId(session.id);
    setIsHistoryOpen(false);
  };

  const deleteSession = (id, e) => {
    e.stopPropagation();
    setChatHistory(prev => {
      const newHistory = prev.filter(s => s.id !== id);
      localStorage.setItem("ai_symptom_sessions", JSON.stringify(newHistory));
      return newHistory;
    });
    if (sessionId === id) {
      startNewChat();
    }
  };

  const handleConsultDoctor = async (buttonText = "I'd like to consult a doctor", forcedSpecialization = null) => {
    setShowChoiceButtons(false);
    setMessages(prev => [...prev, { sender: "user", content: buttonText }]);
    setIsFindingDoctors(true);
    try {
      const spec = forcedSpecialization || analysisData?.recommendedSpecialization || 'General Physician';
      const res = await api.get(`/doctors?specialization=${spec}`);
      if (res.data.success) {
        setFetchedDoctors(res.data.data);
        setShowDoctorCards(true);
        setMessages(prev => [...prev, { sender: "ai", content: `Great choice! Here are the recommended ${spec} doctors available on our platform. You can book an appointment or start a chat directly.` }]);
      } else {
        throw new Error(res.data.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setMessages(prev => [...prev, { sender: "ai", content: "Sorry, I couldn't load the doctors right now. Please try again later." }]);
    } finally {
      setIsFindingDoctors(false);
    }
  };

  const handleSendMessage = async (content, imageFile) => {
    setError("");
    const lowerContent = content.toLowerCase();
    const triggerWords = ["consult", "doctor", "appointment", "find a doctor", "book"];
    // If they mention consulting or doctors after an assessment is ready
    const hasTriggerWord = (lowerContent.includes("consult") && lowerContent.includes("doctor")) || 
                           lowerContent.includes("book appointment") || 
                           lowerContent.includes("find a doctor");
    if (hasTriggerWord && analysisData?.recommendedSpecialization) {
      handleConsultDoctor(content);
      return;
    }

    setIsTyping(true);
    let imageUrl = uploadedImageUrl;

    // If a new image file was passed, upload it first
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);
      try {
        const uploadRes = await api.post(`/ai/upload-symptom-image`, formData);
        if (uploadRes.data.success) {
          imageUrl = uploadRes.data.data.url;
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        console.error("Upload Error:", err);
        setError("Image upload failed. Please try again.");
        setIsTyping(false);
        return;
      }
    }

    setUploadedImageUrl(null);
    setUploadKey(prev => prev + 1);

    // Build user message — show image preview bubble if image attached
    const userMsg = imageUrl
      ? { sender: "user", content, imageUrl }
      : { sender: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const previousMessages = messages.map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));
    try {
      const res = await api.post('/ai/symptom-check', {
        symptoms: content,
        previousMessages,
        mode: continueMode ? 'continue_ai' : 'assess',
        ...(imageUrl ? { imageUrl } : {})
      });
      if (res.data.success && res.data.data) {
        const aiResponse = res.data.data;
        if (continueMode) {
          if (aiResponse.urgentDoctorNeeded) {
            const urgentMsg = aiResponse.emergencyWarning
              ? `⚠️ ${aiResponse.emergencyWarning}`
              : "⚠️ Based on your symptoms, I strongly recommend seeking urgent medical help immediately. Please do not delay medical care.";
            setMessages(prev => [...prev, { sender: "ai", content: urgentMsg }]);
            if (aiResponse.recommendedSpecialization) {
              setAnalysisData(prev => ({ ...prev, recommendedSpecialization: aiResponse.recommendedSpecialization }));
              handleConsultDoctor("I need urgent medical care", aiResponse.recommendedSpecialization);
            }
          } else {
            setMessages(prev => [...prev, { sender: "ai", content: aiResponse.followUpQuestion || "I'm here to help. Please feel free to ask any health-related questions." }]);
          }
          return;
        }
        if (aiResponse.followUpQuestion) {
          setMessages(prev => [...prev, { sender: "ai", content: aiResponse.followUpQuestion }]);
        } else {
          setAnalysisData(aiResponse);
          setShowAnalysis(true);
          const choiceMsg = aiResponse.riskLevel === 'High' || aiResponse.riskLevel === 'Critical'
            ? `Based on your symptoms, I've identified a possible condition with ${aiResponse.riskLevel} risk. Given the severity, I strongly recommend consulting a doctor. However, you can also continue with AI guidance — but please do not delay professional medical care.\n\nWould you like to consult a doctor on the platform, or continue with AI guidance for now?`
            : `Thank you for the details. Based on your symptoms, I've generated an initial assessment (see the panel on the right).\n\nWould you like to consult a doctor on the platform, or continue with AI guidance for now?`;
          setMessages(prev => [...prev, { sender: "ai", content: choiceMsg }]);
          setShowChoiceButtons(true);
        }
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setMessages(prev => [...prev, { sender: "ai", content: `Error: ${errorMessage}. Please check your AI API key or connection.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleContinueAI = () => {
    setShowChoiceButtons(false);
    setContinueMode(true);
    setShowDoctorCards(false);
    const isHighRisk = analysisData?.riskLevel === 'High' || analysisData?.riskLevel === 'Critical';
    const continueMsg = isHighRisk
      ? "I understand you'd like to continue with AI guidance. I'll do my best to help, but because your symptoms may be serious, I strongly recommend you do not delay seeking professional medical care.\n\nHow can I help you further? Feel free to ask questions about your symptoms, what to monitor, or general care advice."
      : "Sure! I'll continue to guide you. You can ask me about your symptoms, what to watch for, general care tips, or any health-related questions.\n\nRemember, if your symptoms worsen or new concerning symptoms appear, please consult a doctor promptly.\n\nWhat would you like to know?";
    setMessages(prev => [...prev,
    { sender: "user", content: "Continue with AI guidance" },
    { sender: "ai", content: continueMsg }
    ]);
  };

  const startNewChat = () => {
    setMessages(initialMessages);
    setShowAnalysis(false);
    setAnalysisData(null);
    setError("");
    setShowChoiceButtons(false);
    setShowDoctorCards(false);
    setContinueMode(false);
    setIsFindingDoctors(false);
    setFetchedDoctors([]);
    setUploadedImageUrl(null);
    setUploadKey(prev => prev + 1);
    setSessionId(Date.now().toString());
  };

  // Receives real Cloudinary URL from MediaUploadButton after successful backend upload
  const handleUpload = (url) => {
    setUploadedImageUrl(url);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Main Chat Area */}
      <div className={`flex flex-col h-full transition-all duration-300 ${showAnalysis ? 'w-full md:w-7/12 lg:w-8/12' : 'w-full'}`}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        <ChatWindow
          title="AI Symptom Checker"
          subtitle="Get an initial assessment based on your symptoms"
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          disabled={showChoiceButtons}
          headerRight={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)} className="gap-2">
                <History className="h-4 w-4" /> History
              </Button>
              <Button variant="outline" size="sm" onClick={startNewChat} className="gap-2">
                <Plus className="h-4 w-4" /> New Chat
              </Button>
            </div>
          }
        />
        {/* Choice Buttons */}
        {showChoiceButtons && (
          <div className="flex gap-2 mt-3 px-4 animate-in slide-in-from-bottom-2 duration-300 flex-wrap">
            <Button
              className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-2 shadow-lg shadow-teal-100 min-w-[140px]"
              onClick={() => handleConsultDoctor("Find Doctors")}
            >
              <Stethoscope className="h-5 w-5" /> Find Doctors
            </Button>
            <Button
              className="flex-1 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-2 shadow-lg shadow-teal-100 min-w-[140px]"
              onClick={() => handleConsultDoctor("Book Appointment")}
            >
              <Calendar className="h-5 w-5" /> Book Appointment
            </Button>
            <Button variant="outline" className="flex-1 h-12 border-slate-200 text-slate-700 font-semibold gap-2 hover:bg-slate-50 min-w-[160px]" onClick={handleContinueAI}>
              <MessageSquare className="h-5 w-5" /> Continue with AI
            </Button>
          </div>
        )}
      </div>

      {/* Right Panel */}
      {(showAnalysis || showDoctorCards) && (
        <div className="w-full md:w-5/12 lg:w-4/12 h-full overflow-y-auto space-y-4 animate-in slide-in-from-right fade-in pb-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200">

          {/* Analysis View */}
          {showAnalysis && analysisData && !showDoctorCards && (
            <div className="space-y-4">
              <Card className={`border-${analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical' ? 'red' : 'amber'}-200 bg-${analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical' ? 'red' : 'amber'}-50 shadow-sm`}>
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className={`h-5 w-5 text-${analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical' ? 'red' : 'amber'}-600 shrink-0 mt-0.5`} />
                  <div>
                    <h3 className={`font-semibold text-${analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical' ? 'red' : 'amber'}-900 text-sm`}>Initial Assessment (Risk: {analysisData.riskLevel})</h3>
                    <p className={`text-xs text-${analysisData.riskLevel === 'High' || analysisData.riskLevel === 'Critical' ? 'red' : 'amber'}-800 mt-1`}>This is an AI-generated assessment and not a definitive medical diagnosis. Please consult a doctor for confirmation.</p>
                    {analysisData.emergencyWarning && (
                      <p className="text-xs font-bold text-red-700 mt-2 bg-red-100 p-2 rounded border border-red-200">WARNING: {analysisData.emergencyWarning}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-1.5">
                      <Activity className="h-4 w-4 text-teal-600" />
                      Possible Condition
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      {analysisData.possibleCondition || "Analysis not completed"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-1.5">
                      <Stethoscope className="h-4 w-4 text-teal-600" />
                      Recommended Specialist
                    </h4>
                    <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-medium px-2.5 py-0.5">
                      {analysisData.recommendedSpecialization || "General Physician"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-1.5">
                      <MessageSquare className="h-4 w-4 text-teal-600" />
                      Prevention & Advice
                    </h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                      {analysisData.preventionAdvice || "No specific advice provided."}
                    </p>
                  </div>

                  {analysisData.suggestedPrescriptions && analysisData.suggestedPrescriptions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-teal-600" />
                        Over-the-Counter (OTC) Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {analysisData.suggestedPrescriptions.map((rx, idx) => (
                          <li key={idx} className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                              <strong className="text-slate-800">{rx.name}</strong>
                              <Badge variant="secondary" className="text-[10px] h-5 bg-slate-200 text-slate-600">OTC</Badge>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{rx.dosage} • {rx.duration}</span>
                            {rx.notes && <span className="text-xs text-slate-500 mt-1">{rx.notes}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Doctor Cards View */}
          {showDoctorCards && (
            <div className="space-y-3 pb-2">
              <div className="sticky top-0 bg-[#FAFAFA] z-10 py-2 border-b border-slate-200 mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" /> Recommended Doctors
                </h3>
              </div>

              {fetchedDoctors.length === 0 && !isFindingDoctors && (
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500">No doctors found for this specialization at the moment.</p>
                </div>
              )}

              {fetchedDoctors.map(doctor => (
                <Card key={doctor._id} className="overflow-hidden hover:border-teal-300 transition-colors shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={doctor.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0D8ABC&color=fff`}
                        alt={doctor.fullName}
                        className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-sm truncate">Dr. {doctor.fullName}</h4>
                        <p className="text-xs text-slate-500 truncate">{doctor.specialization} • {doctor.experience} yrs exp</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-medium text-amber-600 flex items-center bg-amber-50 px-1.5 py-0.5 rounded">
                            ★ {doctor.rating || '4.5'}
                          </span>
                          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">
                            ₹{doctor.consultationFee}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Button asChild variant="outline" className="flex-1 h-9 text-xs border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800">
                        <Link href={`/patient/doctors/${doctor._id}`}>View Profile</Link>
                      </Button>
                      <Button asChild className="flex-1 h-9 text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm">
                        <Link href={`/patient/chat/${doctor._id}`}>Message</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="ghost"
                className="w-full mt-4 text-slate-500 hover:text-teal-600 text-sm"
                onClick={() => { setShowDoctorCards(false); setShowAnalysis(true); }}
              >
                Back to Analysis Report
              </Button>
            </div>
          )}

        </div>
      )}

      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Chat History">
        {chatHistory.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No past chats found.</p>
        ) : (
          <div className="space-y-3">
            {chatHistory.map(session => (
              <div
                key={session.id}
                onClick={() => loadSession(session)}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors flex justify-between items-start gap-4 ${session.id === sessionId ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200'}`}
              >
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-semibold text-slate-800 truncate">{session.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{new Date(session.date).toLocaleString()}</p>
                </div>
                <button
                  onClick={(e) => deleteSession(session.id, e)}
                  className="text-slate-400 hover:text-red-500 shrink-0 p-1 rounded hover:bg-red-50"
                  title="Delete chat"
                >
                  <span className="sr-only">Delete</span>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
