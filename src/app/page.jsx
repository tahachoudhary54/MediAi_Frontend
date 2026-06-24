"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Activity, Shield, Clock, Check, Users, Sparkles,
  Heart, UserPlus, ScanText, Bell, Lock, FileText, Star, Quote, ChevronRight,
  MessageSquare, Brain, UserCheck, Download, Play, Video, Phone, MapPin,
  HeartPulse, Plus, Menu, X, HelpCircle, FileCheck, CheckCircle2, ChevronDown,
  ArrowUpRight, AlertTriangle, Stethoscope, RefreshCw, Calendar, TrendingUp, ShieldAlert
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GuestSOSModal } from "@/components/GuestSOSModal"
import { FloatingEmergencyScanButton } from "@/components/FloatingEmergencyScanButton"

// Section 2: Trust Card Items
const trustCards = [
  {
    title: "Emergency Response",
    description: "Instant sub-5 second SOS location sharing and ambulance routing.",
    icon: AlertTriangle,
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-500"
  },
  {
    title: "AI Health Analysis",
    description: "Symptom check cross-referenced with 100K+ verified clinical cases.",
    icon: Brain,
    color: "from-teal-500/20 to-emerald-500/20",
    iconColor: "text-teal-500"
  },
  {
    title: "Verified Doctors",
    description: "Connect with board-certified healthcare specialists in minutes.",
    icon: Stethoscope,
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-500"
  },
  {
    title: "Secure Medical Records",
    description: "AES-256 encrypted, decentralized HIPAA-compliant digital vault.",
    icon: Shield,
    color: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-500"
  }
]

// Section 9: FAQ Items
const faqItems = [
  {
    question: "How accurate is the AI Symptom Checker?",
    answer: "Our AI model achieves a 99.4% diagnostic reference accuracy based on extensive training across certified clinical trials and thousands of medical journals. It performs a comprehensive preliminary match, which is then cleanly packaged for prompt verification by a certified specialist doctor."
  },
  {
    question: "How does the emergency SOS broadcast work?",
    answer: "When you trigger the emergency SOS, the platform immediately retrieves your device's high-precision GPS coordinates (subject to permission) and broadcasts a secure alert package containing your contact information, location details, and basic health metrics to local emergency dispatchers and nearby on-duty doctors."
  },
  {
    question: "Are my medical records safe and HIPAA compliant?",
    answer: "Absolutely. Security is our absolute priority. All medical histories, prescription scans, and diagnostic reports are fully encrypted in transit and at rest using banking-grade AES-256 standards. Our systems are audited regularly to guarantee strict adherence to HIPAA and global healthcare privacy regulations."
  },
  {
    question: "How are the doctors on the platform verified?",
    answer: "Every doctor on MediAI undergoes a multi-phase credential verification process. We cross-reference medical board databases, verify professional certifications, review clinical experience history, and execute regular peer reviews to ensure that you receive nothing but the highest standard of care."
  },
  {
    question: "Can the Prescription Scanner read handwritten scripts?",
    answer: "Yes, our advanced OCR (Optical Character Recognition) engine is specifically optimized for medical handwriting. It parses doctors' handwritten prescriptions with high precision, automatically extracts drug names and dosages, converts them to clear digital cards, and sets up smart alarm lists for you."
  },
  {
    question: "Can I sync my smartwatch with the MediAI health tracker?",
    answer: "Yes! MediAI seamlessly integrates with popular smartwatches and wearables (including Apple Health, Google Fit, and Garmin). It automatically pulls active telemetry—like resting heart rate, oxygen saturation, and sleep cycles—to provide real-time updates and trigger proactive health alerts."
  },
  {
    question: "Is MediAI a replacement for primary clinical care?",
    answer: "MediAI acts as an intelligent assistant to streamline, speed up, and organize your healthcare journey. It does not replace emergency 911 rooms or in-person emergency hospital surgeries. Rather, it equips you with immediate diagnostics and gets you connected to certified doctors 10x faster."
  },
  {
    question: "What are the subscription models and is there a free tier?",
    answer: "MediAI offers a generous free tier that includes basic AI Symptom Analysis, primary medical record uploads, and emergency SOS access. Our premium tiers unlock instant teleconsultations with top specialists, advanced smart device syncs, unlimited OCR scanning, and family healthcare profiles."
  }
]

export default function RedesignedLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState(null)

  // Section 5 SOS Showcase interactive sequence state
  const [sosStep, setSosStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSosStep((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleScroll = (e, id) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Programmatic event trigger to open the real SOS modal
  const triggerSOSModal = () => {
    window.dispatchEvent(new CustomEvent('trigger-open-sos'))
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-teal-500 selection:text-white font-sans antialiased scroll-smooth">

      {/* ==================================
          HEADER NAVIGATION
          ================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1400px] flex h-20 items-center justify-between px-6 sm:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">MediAI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: "Features", id: "features" },
              { label: "How It Works", id: "how-it-works" },
              { label: "SOS System", id: "sos-showcase" },
              { label: "Ecosystem", id: "ecosystem" },
              { label: "Why MediAI", id: "why-mediai" },
              { label: "FAQ", id: "faq" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleScroll(e, item.id)}
                className="text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors duration-200 relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-teal-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/emergency-scan" className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5 group relative py-1">
              <ShieldAlert size={16} className="animate-pulse" />
              Emergency Scan
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-red-500 transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors group relative py-1">
              Login
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-teal-500 transition-all duration-300 group-hover:w-full" />
            </Link>
            <Link href="/register">
              <Button className="bg-[#0F172A] hover:bg-teal-600 text-white font-bold px-6 py-5 rounded-full text-sm tracking-wide transition-all duration-300 shadow-lg shadow-slate-900/10 hover:shadow-teal-500/20 cursor-pointer">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburguer */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-teal-600 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-100 bg-white"
            >
              <div className="px-6 py-6 space-y-4 flex flex-col">
                {[
                  { label: "Features", id: "features" },
                  { label: "How It Works", id: "how-it-works" },
                  { label: "SOS System", id: "sos-showcase" },
                  { label: "Ecosystem", id: "ecosystem" },
                  { label: "Why MediAI", id: "why-mediai" },
                  { label: "FAQ", id: "faq" }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => handleScroll(e, item.id)}
                    className="text-base font-bold text-slate-600 hover:text-teal-600 py-2 border-b border-slate-50 block transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-4 flex flex-col gap-4">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center font-bold text-slate-700 hover:text-teal-600 py-2">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#0F172A] hover:bg-teal-600 text-white font-bold py-5 rounded-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">

        {/* ==================================
            SECTION 1 — HERO SECTION
            ================================== */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden py-16 bg-white max-w-[1400px] mx-auto px-6 sm:px-12">
          {/* Subtle glowing radial mesh backgrounds */}
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-16 items-center w-full">
            {/* Left Side Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="lg:col-span-6 flex flex-col space-y-8"
            >
              {/* Small Badge */}
              <motion.div variants={fadeInUp} className="inline-flex items-self-start">
                <span className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/50 rounded-full px-4.5 py-1.5 text-teal-600 text-sm font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  AI-Powered Healthcare Ecosystem
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-[56px] font-black text-slate-900 leading-[1.1] tracking-tight">
                Healthcare Assistance When You <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600 drop-shadow-sm font-black">
                  Need It Most
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                AI-powered symptom analysis, emergency assistance, appointment booking, prescription scanning, and doctor connectivity — all in one platform.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div variants={fadeInUp} className="flex flex-wrap items-center gap-5 pt-2">
                <Link href="/register">
                  <Button className="bg-teal-500 hover:bg-teal-600 text-white font-extrabold px-8 py-7 rounded-full text-base tracking-wide shadow-xl shadow-teal-500/25 hover:shadow-teal-600/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                    Get Started Free
                  </Button>
                </Link>
                <a href="#how-it-works" onClick={(e) => handleScroll(e, "how-it-works")}>
                  <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold px-8 py-7 rounded-full text-base tracking-wide shadow-sm hover:border-slate-300 transition-all flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                      <Play size={10} className="fill-slate-700 ml-0.5" />
                    </div>
                    Watch Demo
                  </Button>
                </a>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={fadeInUp}
                className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100"
              >
                {[
                  "AI Health Assistant",
                  "Emergency SOS",
                  "Verified Doctors",
                  "Secure Records"
                ].map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    {indicator}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side: Premium Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative flex items-center justify-center"
            >
              {/* Floating element icons */}
              <div className="absolute top-1/10 left-1/10 animate-float-1 z-20 pointer-events-none bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                <HeartPulse className="h-6 w-6 text-red-500" />
              </div>
              <div className="absolute top-1/2 right-1/12 animate-float-2 z-20 pointer-events-none bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                <Plus className="h-6 w-6 text-teal-500" />
              </div>
              <div className="absolute bottom-1/5 left-1/12 animate-float-3 z-20 pointer-events-none bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                <MapPin className="h-6 w-6 text-teal-600" />
              </div>
              <div className="absolute top-1/10 right-1/4 animate-float-4 z-20 pointer-events-none bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>

              {/* Main Dashboard Panel */}
              <div className="w-full max-w-[540px] bg-slate-900 border border-slate-800 rounded-[28px] p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
                {/* Dashboard top window header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                    <span className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-full px-3 py-1 text-xs text-slate-400 font-semibold border border-slate-700/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    mediai.health/dashboard
                  </div>
                  <div className="w-8" />
                </div>

                {/* Grid elements simulating dashboard widgets */}
                <div className="grid grid-cols-2 gap-4">

                  {/* AI Chat Assistant Widget (Spans columns) */}
                  <div className="col-span-2 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4.5 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-md bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px]">AI</div>
                        <span className="text-xs font-bold text-white">Symptom Checker</span>
                      </div>
                      <span className="text-[10px] text-teal-400 font-bold bg-teal-950 px-2 py-0.5 rounded-full">ACTIVE</span>
                    </div>

                    <div className="flex flex-col gap-2.5 max-h-[140px] overflow-hidden text-xs">
                      <div className="self-end bg-slate-800 text-slate-100 rounded-2xl rounded-tr-none px-3.5 py-2.5 max-w-[85%] font-medium leading-relaxed">
                        I have a dull chest discomfort after jogging.
                      </div>
                      <div className="self-start bg-teal-950/40 border border-teal-900/60 text-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[85%] font-medium leading-relaxed">
                        <div className="flex items-center gap-1.5 text-teal-400 font-black mb-1 text-[11px]">
                          <Brain size={12} /> MediAI Response:
                        </div>
                        Cardiological indicators match a mild post-stress feedback. Flagged for verification. I recommend contacting Dr. Vance.
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-900 rounded-lg p-2 text-slate-500 text-[10px]">
                      <span>Ask clinical assistant...</span>
                      <ArrowRight size={12} className="text-teal-400" />
                    </div>
                  </div>

                  {/* Appointment Card Widget */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between min-h-[120px]">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Appointment</span>
                        <span className="text-xs font-bold text-white mt-1">Dr. Olivia Vance</span>
                        <span className="text-[10px] text-slate-400">Cardiology Specialist</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between bg-slate-900/80 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px]">
                      <span className="font-semibold text-teal-400">2:30 PM Today</span>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Health Summary Card Widget */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between min-h-[120px]">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Health Vitals</span>
                      <div className="flex items-baseline gap-1.5 mt-2">
                        <span className="text-2xl font-black text-white">72</span>
                        <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wide">BPM</span>
                      </div>
                    </div>
                    {/* SVG ECG graph drawing */}
                    <div className="h-8 w-full mt-2 overflow-hidden opacity-80">
                      <svg viewBox="0 0 100 30" className="w-full h-full text-teal-500 stroke-current stroke-2 fill-none">
                        <path d="M0,15 L20,15 L25,5 L30,25 L35,15 L50,15 L53,10 L56,20 L60,15 L80,15 L83,5 L87,25 L90,15 L100,15" className="animate-pulse" />
                      </svg>
                    </div>
                  </div>

                  {/* Emergency SOS Button Widget */}
                  <div
                    onClick={triggerSOSModal}
                    className="bg-red-950/20 hover:bg-red-950/30 cursor-pointer rounded-2xl border border-red-900/40 p-4 flex flex-col justify-between items-center text-center min-h-[120px] transition-colors"
                  >
                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Active dispatch</span>
                    <div className="relative flex items-center justify-center my-1">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-600 opacity-60"></span>
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white font-black text-xs shadow-lg shadow-red-600/30">
                        SOS
                      </div>
                    </div>
                    <span className="text-[9px] text-red-300 font-semibold uppercase">Trigger Emergency</span>
                  </div>

                  {/* Prescription Scanner Card Widget */}
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between min-h-[120px] relative overflow-hidden">
                    {/* Glowing scanning bar */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-teal-400 shadow-md shadow-teal-400 animate-bounce" />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <ScanText size={12} className="text-teal-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OCR Scanner</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-300 mt-2 block leading-snug">
                        Rx: Amoxicillin 500mg<br />
                        Qty: 30 Capsules
                      </span>
                    </div>

                    <span className="text-[8px] font-bold bg-teal-950 text-teal-400 px-2 py-0.5 rounded self-start mt-2">PARSED</span>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ==================================
            EMERGENCY SCAN FEATURE BLOCK (NEW)
            ================================== */}
        <section className="py-20 bg-slate-900 relative overflow-hidden">
          {/* Background gradients for warning/emergency theme */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-600/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>

          <div className="mx-auto max-w-[1400px] px-6 sm:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Side: Text and CTAs */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <span className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm mb-4">
                    <ShieldAlert size={18} className="animate-pulse" />
                    Life-Saving Feature
                  </span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
                    🚨 Emergency Scan – Identify Patients Instantly
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                    Use AI to identify registered patients in emergency situations and get life-saving contact information within seconds.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    "Instant Face Recognition for Emergency Situations",
                    "Works even in low-light or accident environments",
                    "Shows only emergency contact & essential info",
                    "Secure & opt-in based system",
                    "Doctor mode available for full medical access"
                  ].map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="font-medium text-slate-200">{point}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="/emergency-scan" className="w-full sm:w-auto">
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-lg shadow-red-600/25 transition-all">
                      Start Emergency Scan
                    </Button>
                  </Link>
                  <Link href="#how-it-works" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white font-bold px-8 py-6 rounded-xl text-lg transition-all">
                      Learn How It Works
                    </Button>
                  </Link>
                </div>

                <p className="text-slate-500 text-xs flex items-start gap-2 max-w-md pt-2">
                  <Lock size={14} className="flex-shrink-0 mt-0.5" />
                  Only registered and opted-in users are discoverable. Sensitive medical data is protected and role-based.
                </p>
              </motion.div>

              {/* Right Side: Visual Scan Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative lg:h-[500px] flex items-center justify-center mt-10 lg:mt-0"
              >
                {/* Glowing border container */}
                <div className="relative w-full max-w-[360px] aspect-[3/4] bg-slate-950 rounded-[32px] border-4 border-slate-800 shadow-2xl shadow-red-900/20 overflow-hidden">
                  
                  {/* Fake UI Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900">
                    <span className="text-red-400 font-bold tracking-widest text-xs uppercase">Emergency Mode</span>
                    <ShieldAlert size={18} className="text-red-500 animate-pulse" />
                  </div>

                  {/* Camera Viewport Simulation */}
                  <div className="relative w-full h-[calc(100%-3.5rem)] bg-slate-900 overflow-hidden flex flex-col items-center justify-center">
                    
                    {/* Dummy Face Outline */}
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                    
                    <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 text-slate-700/50 mb-10">
                      <path d="M50 10 C30 10 20 30 20 50 C20 75 35 90 50 90 C65 90 80 75 80 50 C80 30 70 10 50 10 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5 5" />
                      {/* Eyes */}
                      <circle cx="35" cy="45" r="4" fill="currentColor" />
                      <circle cx="65" cy="45" r="4" fill="currentColor" />
                      {/* Mouth */}
                      <path d="M40 70 Q50 80 60 70" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>

                    {/* Scanning Line Animation */}
                    <motion.div 
                      className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_20px_5px_rgba(45,212,191,0.5)]"
                      animate={{ y: [0, 400, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Floating Info Boxes simulating recognition process */}
                    <motion.div 
                      className="absolute top-10 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg p-2.5 flex items-center gap-2 shadow-xl"
                      animate={{ opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
                    >
                      <ScanText size={14} className="text-teal-400" />
                      <span className="text-xs text-slate-300 font-mono">Extracting 128-pt facial map...</span>
                    </motion.div>
                    
                    <motion.div 
                      className="absolute bottom-16 right-4 bg-emerald-950/80 backdrop-blur border border-emerald-900/50 rounded-lg p-3 flex items-center gap-2 shadow-xl"
                      animate={{ opacity: [0, 0, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, times: [0, 0.6, 0.8, 1] }}
                    >
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span className="text-sm text-emerald-300 font-bold">Patient Identified</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ==================================
            SECTION 2 — TRUST SECTION
            ================================== */}
        <section className="py-24 bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-12 text-center">

            {/* Title & Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto mb-16 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full">
                PLATFORM VETTING
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Trusted Healthcare Technology
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed text-base sm:text-lg">
                Delivering lightning-fast diagnostic verification and instant dispatch routing built upon clinically verified healthcare architectures.
              </p>
            </motion.div>

            {/* 4 Cards Grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {trustCards.map((card, idx) => {
                const CardIcon = card.icon
                return (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group bg-white border border-slate-100 rounded-3xl p-8 text-left shadow-sm hover:shadow-xl hover:border-teal-500/25 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                  >
                    <div>
                      {/* Gradient icon background container */}
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6`}>
                        <CardIcon className={`h-5 w-5 ${card.iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight mb-3">
                        {card.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                        {card.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </section>

        {/* ==================================
            SECTION 3 — HOW IT WORKS
            ================================== */}
        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-12">

            {/* Header info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mb-20 space-y-3"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full inline-block">
                STREAMLINED WORKFLOW
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                From Symptoms To Care In Minutes
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg">
                Your medical journey simplified into five intuitive checkpoints, eliminating traditional diagnostic barriers.
              </p>
            </motion.div>

            {/* Horizontal timeline container */}
            <div className="relative">

              {/* Connector line for large screens */}
              <div className="hidden lg:block absolute top-[45px] left-[5%] right-[5%] h-[2px] bg-slate-100 -z-0" />

              {/* Timeline Steps Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 relative z-10">
                {[
                  {
                    step: "01",
                    title: "Create Account",
                    description: "Set up your secure, encrypted bio-profile in seconds.",
                    widget: (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5 text-[11px] w-full max-w-[210px] mx-auto mt-4 text-left">
                        <span className="text-[8.5px] text-slate-500 font-bold block">ENCRYPTED INPUT</span>
                        <div className="h-7 bg-slate-800 rounded-lg border border-slate-700 px-2.5 flex items-center text-slate-400">email@example.com</div>
                        <div className="h-7 bg-slate-800 rounded-lg border border-slate-700 px-2.5 flex items-center text-teal-400 justify-between">
                          <span>••••••••</span>
                          <Lock size={10} />
                        </div>
                        <span className="text-[8.5px] bg-teal-950 text-teal-400 px-2 py-0.5 rounded self-end font-bold">SECURE SSL</span>
                      </div>
                    )
                  },
                  {
                    step: "02",
                    title: "Complete Health Profile",
                    description: "Log vitals, medical history, and sync your smartwatch.",
                    widget: (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5 text-[11px] w-full max-w-[210px] mx-auto mt-4 text-left">
                        <span className="text-[8.5px] text-slate-500 font-bold">BIOMETRIC SYNC</span>
                        <div className="flex justify-between items-center bg-slate-800 px-2.5 py-1.5 rounded-lg">
                          <span className="text-slate-300 font-medium">Heart Rate</span>
                          <span className="text-teal-400 font-bold">72 BPM</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800 px-2.5 py-1.5 rounded-lg">
                          <span className="text-slate-300 font-medium">Blood Type</span>
                          <span className="text-teal-400 font-bold">O Positive</span>
                        </div>
                      </div>
                    )
                  },
                  {
                    step: "03",
                    title: "Connect With Doctors",
                    description: "Unlock immediate verified physician channels 24/7.",
                    widget: (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5 text-[11px] w-full max-w-[210px] mx-auto mt-4 text-left">
                        <span className="text-[8.5px] text-slate-500 font-bold">MD AVAILABILITY</span>
                        <div className="flex items-center gap-3 bg-slate-800 px-2.5 py-1.5 rounded-lg">
                          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold">Dr. Olivia Vance</span>
                            <span className="text-[8px] text-slate-400">Cardiology</span>
                          </div>
                        </div>
                      </div>
                    )
                  },
                  {
                    step: "04",
                    title: "Get AI Assistance",
                    description: "Describe symptoms and generate diagnostics instantly.",
                    widget: (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5 text-[11px] w-full max-w-[210px] mx-auto mt-4 text-left">
                        <span className="text-[8.5px] text-slate-500 font-bold">AI REFERENCE</span>
                        <div className="bg-teal-950/40 border border-teal-900/60 p-2.5 rounded-lg text-teal-300 leading-normal">
                          Analyzed symptoms match exercise stress. report compiled.
                        </div>
                      </div>
                    )
                  },
                  {
                    step: "05",
                    title: "Receive Healthcare Support",
                    description: "Retrieve care plans, digital prescriptions, and direct guidance.",
                    widget: (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col gap-2.5 text-[11px] w-full max-w-[210px] mx-auto mt-4 text-left">
                        <span className="text-[8.5px] text-slate-500 font-bold">CARE ACTIVE</span>
                        <div className="flex items-center gap-2.5 bg-slate-800 p-2 rounded-lg">
                          <FileCheck size={13} className="text-teal-400" />
                          <div className="flex flex-col">
                            <span className="text-white font-bold">Digital Rx Active</span>
                            <span className="text-[8px] text-slate-400">1 Refill Available</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                ].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.6 } }
                    }}
                    whileHover={{ y: -6 }}
                    className="flex flex-col items-center text-center group cursor-default"
                  >
                    {/* Number Pin Circle */}
                    <div className="h-22 w-22 rounded-full border-4 border-white bg-slate-100 text-slate-500 font-black text-xl flex items-center justify-center mb-6 shadow-md group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300">
                      {step.step}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-2 px-2">
                      {step.title}
                    </h3>

                    <p className="text-slate-500 text-xs px-3 font-semibold leading-relaxed max-w-[220px]">
                      {step.description}
                    </p>

                    {/* Step Micro-Widget illustration */}
                    <div className="opacity-80 group-hover:opacity-100 transition-opacity duration-300 w-full">
                      {step.widget}
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ==================================
            SECTION 4 — CORE FEATURES
            ================================== */}
        <section id="features" className="py-24 bg-[#F8FAFC] border-t border-b border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-12 space-y-32">

            {/* Centered Global Header */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-center space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full">
                CORE FEATURES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Everything You Need, In One Hub
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg leading-relaxed">
                Unlock advanced tools optimized to streamline diagnosis, secure your logs, and connect you with verified medical providers.
              </p>
            </motion.div>

            {/* Feature 1: AI Symptom Checker */}
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Graphic (Left) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 flex justify-center"
              >
                <div className="w-full max-w-[480px] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[8px]">AI</div>
                      <span className="text-xs font-bold text-white">Symptom Checker V2</span>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                  </div>

                  <div className="space-y-3.5 text-xs text-left">
                    <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tr-none p-3 max-w-[85%] self-end ml-auto">
                      "I've got a persistent dry cough and fatigue for three days."
                    </div>

                    <div className="bg-teal-950/40 border border-teal-900/60 text-slate-200 rounded-2xl rounded-tl-none p-3.5 max-w-[85%]">
                      <div className="flex items-center gap-1.5 text-teal-400 font-black mb-1.5 text-[10px]">
                        <Brain size={12} /> CLINICAL PRE-ASSESSMENT
                      </div>
                      <p className="leading-relaxed mb-2 text-slate-300">
                        Based on your inputs, symptom profile indicates respiratory fatigue.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded text-[10px] font-bold">Dry Cough Match</span>
                        <span className="bg-teal-900/60 text-teal-300 px-2 py-0.5 rounded text-[10px] font-bold">Fatigue Index</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-[10px] text-slate-400">
                      <span>Analyzing symptoms...</span>
                      <RefreshCw size={10} className="animate-spin text-teal-400" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Copy (Right) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 flex flex-col space-y-6"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">01</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AI Symptom Checker</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Tell us what you're experiencing in plain, conversational language. Our clinical-grade AI analyzes your symptoms against deep medical databases in real time, outlining possible causes and preparing verified pre-diagnostic summaries.
                </p>
                <ul className="space-y-3 font-semibold text-slate-700 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> 99.4% reference diagnostic accuracy</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Prepares draft charts ready for MD validation</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Fully secure, anonymous chat routing</li>
                </ul>
              </motion.div>
            </div>

            {/* Feature 2: Prescription OCR Scanner */}
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Copy (Left on large screens, swap layout) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 lg:order-1 flex flex-col space-y-6"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">02</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Prescription OCR Scanner</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Instantly digitize doctor prescriptions. Simply snap a photo, and our high-accuracy optical character recognition (OCR) engine parses handwriting, extracts drug names, identifies dosage schedules, and automatically populates your digital health calendar.
                </p>
                <ul className="space-y-3 font-semibold text-slate-700 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Auto-extracts dosages and drug names</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> One-click prescription refill requests</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Smart medical handwriting resolution</li>
                </ul>
              </motion.div>

              {/* Graphic (Right on large screens, order 2) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 lg:order-2 flex justify-center"
              >
                <div className="w-full max-w-[480px] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden text-left">
                  {/* Scanner line */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-teal-400 shadow shadow-teal-400 animate-bounce" />

                  <div className="pb-3 border-b border-slate-850 flex justify-between items-center text-xs mb-4">
                    <span className="font-bold text-slate-400">Rx_Prescription_Scan_104</span>
                    <span className="text-teal-400 font-bold text-[9px] bg-teal-950 px-2 py-0.5 rounded">PARSING...</span>
                  </div>

                  <div className="font-mono text-xs text-slate-300 space-y-2 mb-4 leading-relaxed">
                    <span className="text-[10px] text-slate-500 font-bold block">INPUT FILE:</span>
                    <p className="italic text-slate-400">"Take Amoxicillin 500mg, three times a day after meals. Refills: 2."</p>
                  </div>

                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 space-y-2">
                    <span className="text-[8px] text-teal-400 font-black block tracking-wider uppercase">Extracted Entities</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                        <span className="text-slate-500 block">DRUG</span>
                        <span className="text-white font-bold">Amoxicillin</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded">
                        <span className="text-slate-500 block">DOSAGE</span>
                        <span className="text-white font-bold">500mg</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded col-span-2">
                        <span className="text-slate-500 block">SCHEDULE</span>
                        <span className="text-teal-400 font-bold">3x Daily (Post-Meals)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Feature 3: Doctor Appointment Booking */}
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Graphic (Left) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 flex justify-center"
              >
                <div className="w-full max-w-[480px] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <span className="text-xs font-bold text-white">Find Specialists</span>
                    <span className="text-[10px] text-slate-400">Cardiology</span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Doctor Card */}
                    <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center font-black text-white text-xs">OV</div>
                        <div className="flex flex-col text-xs">
                          <span className="text-white font-bold">Dr. Olivia Vance</span>
                          <span className="text-slate-500">St. Luke's Hospital</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-full font-bold">ONLINE</span>
                    </div>

                    {/* Slots grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {["09:00 AM", "11:30 AM", "02:30 PM"].map((slot, i) => (
                        <div key={i} className={`p-2 rounded-lg border text-center text-[10px] font-bold cursor-pointer ${i === 2 ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-800 hover:border-slate-700 text-slate-400'}`}>
                          {slot}
                        </div>
                      ))}
                    </div>

                    <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded-lg text-xs">
                      Confirm Appointment Booking
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Copy (Right) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 flex flex-col space-y-6"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">03</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Doctor Appointment Booking</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Secure video consults or chats with board-certified specialists in minutes. No crowded waiting rooms or 2-week delays. Filter by clinical specialty, location, or ratings to request immediate secure clinical appointments.
                </p>
                <ul className="space-y-3 font-semibold text-slate-700 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Direct same-day specialist consultations</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Integrated, HIPAA-compliant HD video</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Digital sick leave certificates</li>
                </ul>
              </motion.div>
            </div>


            {/* Feature 4: Emergency SOS Assistance */}
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Graphic (Left) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 flex justify-center"
              >
                <div
                  onClick={triggerSOSModal}
                  className="w-full max-w-[480px] bg-red-950/10 border border-red-900/40 rounded-3xl p-5 shadow-xl text-left cursor-pointer hover:bg-red-950/20 transition-colors"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-red-900/40 mb-4">
                    <span className="text-xs font-black text-red-500 flex items-center gap-1.5">
                      <AlertTriangle size={14} /> LIVE DISPATCH SYSTEM
                    </span>
                    <span className="animate-pulse h-2 w-2 rounded-full bg-red-500" />
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 flex justify-between items-center">
                      <span className="text-slate-400">GPS Coordinates:</span>
                      <span className="text-white font-mono font-bold">40.7128° N, 74.0060° W</span>
                    </div>

                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-850 space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Hospital Routing Status</span>
                        <span className="text-red-400 font-bold">ALERTER ROAD ROUTE</span>
                      </div>
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-red-500" />
                      </div>
                    </div>

                    <div className="bg-red-900 text-white font-black py-2 rounded-lg text-center shadow-lg shadow-red-900/20">
                      AMBULANCE ROUTED — 4 MIN AWAY
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Copy (Right) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 flex flex-col space-y-6"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">04</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Emergency SOS Assistance</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  In emergency events, milliseconds matter. Our active emergency SOS protocol instantly retrieves your high-precision location coordinates, binds it with basic health data, and routes dispatch coordinates to medical teams in less than five seconds.
                </p>
                <ul className="space-y-3 font-semibold text-slate-700 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Under 5-second emergency dispatch</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Live GPS ambulance telemetry tracking</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Automatic alerts routed to family circles</li>
                </ul>
              </motion.div>
            </div>

            {/* Feature 5: Medicine Reminder System */}
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              {/* Copy (Left) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 lg:order-1 flex flex-col space-y-6"
              >
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">05</div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Medicine Reminder System</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Never miss a medication dosage. Set up custom dosage intake alarms, keep track of daily adherence streaks, and configure alerts to trigger notifications on smart devices, and alert family members if an essential dose is skipped.
                </p>
                <ul className="space-y-3 font-semibold text-slate-700 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Custom scheduling for multiple pills</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Syncs alerts with smartwatch notification</li>
                  <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-teal-500" /> Adherence tracker & health-streak logging</li>
                </ul>
              </motion.div>

              {/* Graphic (Right) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeInUp}
                className="lg:col-span-6 lg:order-2 flex justify-center"
              >
                <div className="w-full max-w-[480px] bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-left text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <span className="font-bold text-white">Daily Medication Intake</span>
                    <span className="text-[10px] text-teal-400 font-bold bg-teal-950 px-2 py-0.5 rounded">90% STREAK</span>
                  </div>

                  <div className="space-y-3">
                    {/* Pill 1 */}
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                          <Bell size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold">Amoxicillin</span>
                          <span className="text-slate-500 text-[9px]">Post-Meal dosage</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-900 px-2 py-1 rounded">08:00 AM</span>
                    </div>

                    {/* Pill 2 */}
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5 opacity-60">
                        <div className="h-7 w-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 font-bold">Multivitamins</span>
                          <span className="text-slate-600 text-[9px]">Completed dosage</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-teal-400 font-bold bg-teal-950/40 border border-teal-900/40 px-2.5 py-1 rounded">TAKEN</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ==================================
            SECTION 5 — SOS EMERGENCY SHOWCASE
            ================================== */}
        <section id="sos-showcase" className="py-28 bg-[#0F172A] text-white relative overflow-hidden">
          {/* Pulsing deep orange glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="mx-auto max-w-[1400px] px-6 sm:px-12 text-center flex flex-col items-center">

            {/* Title Info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mb-16 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-950/60 border border-red-900/50 px-4 py-1.5 rounded-full inline-block">
                WARNING SYSTEM ACTIVE
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Emergency Help In Seconds
              </h2>
              <p className="text-slate-400 font-medium text-base sm:text-lg leading-relaxed">
                Clicking the SOS below triggers immediate location coordinates mapping and broadcasts alert requests to the nearest hospital emergency teams.
              </p>
            </motion.div>

            {/* Glowing Big SOS Button */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100 }}
              className="relative flex items-center justify-center mb-20"
            >
              {/* Ripple circles */}
              <span className="animate-ping absolute inline-flex h-36 w-36 rounded-full bg-red-650 opacity-40"></span>
              <span className="animate-ping absolute inline-flex h-44 w-44 rounded-full bg-red-650 opacity-20"></span>
              <span className="animate-ping absolute inline-flex h-56 w-56 rounded-full bg-red-650 opacity-10"></span>

              <button
                onClick={triggerSOSModal}
                className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white font-black text-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] ring-8 ring-slate-900 transition-all hover:scale-105 active:scale-95 duration-350 cursor-pointer"
              >
                SOS
              </button>
            </motion.div>

            {/* SOS flow path */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { label: "1. User Clicks SOS", desc: "Instantly alerts critical servers." },
                { label: "2. Location Shared", desc: "High-precision GPS telemetry syncs." },
                { label: "3. Nearest Doctor Found", desc: "Routes emergency requests in seconds." },
                { label: "4. Support Activated", desc: "Ambulance dispatched & active doctor verification." }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center relative text-center">

                  {/* Glowing Connection Light line between flow boxes on tablet+ */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-6 left-[60%] right-[-40%] h-[3px] bg-slate-800 -z-0">
                      <div className={`h-full bg-red-500 transition-all duration-1000 ${sosStep === idx ? 'w-full opacity-100 shadow-[0_0_8px_#ef4444]' : 'w-0 opacity-0'}`} />
                    </div>
                  )}

                  {/* Flow Icon badge */}
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm mb-4 transition-all duration-500 ${sosStep === idx ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/30' : 'bg-slate-800 text-slate-400'}`}>
                    {idx + 1}
                  </div>

                  <h4 className={`text-base font-bold transition-colors duration-500 ${sosStep === idx ? 'text-red-400' : 'text-slate-200'}`}>
                    {step.label}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1.5 font-semibold leading-relaxed px-4">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ==================================
            SECTION 6 — DOCTOR + PATIENT ECOSYSTEM
            ================================== */}
        <section id="ecosystem" className="py-28 bg-white relative overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-12">

            {/* Centered Heading */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-3xl mx-auto text-center mb-20 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full">
                INTEGRATED NETWORK
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Connecting Patients, Doctors and Healthcare Services Through AI
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg">
                MediAI binds patients and clinical professionals into one streamlined, HIPAA-compliant communication loop to speed up evaluations and minimize friction.
              </p>
            </motion.div>

            {/* Split layout Dashboards */}
            <div className="grid lg:grid-cols-2 gap-16 relative items-center">

              {/* Laser line effect in middle */}
              <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[80%] bg-slate-100 z-0">
                {/* Moving light dot */}
                <div className="w-[6px] h-6 bg-teal-400 rounded-full absolute left-[-2px] animate-bounce shadow-md shadow-teal-500" />
              </div>

              {/* Patient Dashboard Preview (Left) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-slate-950 border border-slate-850 rounded-[24px] p-6 shadow-xl text-left text-xs z-10"
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-850 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    <span className="font-bold text-white">Patient Hub</span>
                  </div>
                  <span className="text-[10px] text-slate-500">ID: PT-39402</span>
                </div>

                <div className="space-y-4">
                  {/* Biometrics row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Vital saturation</span>
                      <span className="text-lg font-black text-white mt-1 block">98% O₂</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Activity log</span>
                      <span className="text-lg font-black text-white mt-1 block">8,490 Steps</span>
                    </div>
                  </div>

                  {/* Consultation card */}
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold">Consultation Report</span>
                      <span className="text-teal-400 font-bold bg-teal-950 px-2 py-0.5 rounded">READY</span>
                    </div>
                    <p className="text-slate-400 leading-normal text-[11px]">
                      "AI symptom checker pre-assessment successfully submitted to clinic queue."
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Doctor Dashboard Preview (Right) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-slate-950 border border-slate-850 rounded-[24px] p-6 shadow-xl text-left text-xs z-10"
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-850 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    <span className="font-bold text-white">Clinical Board</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Dr. Olivia Vance</span>
                </div>

                <div className="space-y-4">
                  {/* Pending Queue */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Incoming Evaluators</span>
                    <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-6 w-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[9px]">PT</div>
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-[11px]">Johnathan Doe</span>
                          <span className="text-slate-500 text-[8px]">Stress Symptoms</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-teal-400 font-bold bg-teal-950/40 border border-teal-900/40 px-2.5 py-1 rounded">VERIFY</span>
                    </div>
                  </div>

                  {/* Actions summary */}
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Total verified today:</span>
                    <span className="text-white font-black">14 Patients</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ==================================
            SECTION 7 — WHY MEDIAI
            ================================== */}
        <section id="why-mediai" className="py-24 bg-[#F8FAFC] border-t border-b border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-12">

            {/* Header info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-center mb-16 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full">
                COMPARATIVE PERFORMANCE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Traditional Healthcare vs MediAI
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg">
                See how our AI-driven network delivers speeds and levels of accuracy that leave legacy setups behind.
              </p>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="overflow-x-auto rounded-[24px] border border-slate-200/60 bg-white shadow-xl max-w-5xl mx-auto"
            >
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-black text-sm uppercase tracking-wider">
                    <th className="p-6">Healthcare Feature</th>
                    <th className="p-6 border-l border-slate-800">Traditional Healthcare</th>
                    <th className="p-6 border-l border-slate-800 text-teal-400">MediAI Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold text-xs sm:text-sm">
                  {[
                    { feature: "Appointment Booking", traditional: "2 to 3 weeks waiting list", mediai: "Instant matching & same-day video" },
                    { feature: "Emergency Access", traditional: "Standard 112 queues, manual details", mediai: "Under 5s GPS telemetry dispatch" },
                    { feature: "Medical Records", traditional: "Scattered files, paper folders", mediai: "AES-256 encrypted, unified history" },
                    { feature: "AI Assistance", traditional: "None — must wait for initial consult", mediai: "24/7 reference-verified diagnostics" },
                    { feature: "Prescription Analysis", traditional: "Hard-to-read handwritten pages", mediai: "OCR scanning, digital alarm reminders" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors duration-250">
                      <td className="p-6 font-bold text-slate-900">{row.feature}</td>
                      <td className="p-6 text-slate-400 font-medium border-l border-slate-100">{row.traditional}</td>
                      <td className="p-6 text-teal-600 font-black border-l border-slate-100 bg-teal-50/20">{row.mediai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

          </div>
        </section>

        {/* ==================================
            SECTION 8 — TESTIMONIALS
            ================================== */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 h-40 bg-gradient-to-r from-teal-500/5 to-transparent pointer-events-none" />

          <div className="mx-auto max-w-[1400px] px-6 sm:px-12">

            {/* Header info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-center mb-20 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full">
                USER REVIEWS
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Trusted Globally By Patients & Doctors
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg">
                Hear from patients, specialists, and professionals managing healthcare with MediAI.
              </p>
            </motion.div>

            {/* Testimonials Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  quote: "MediAI completely transformed how I manage my diabetic checkups. The smart reminders are a lifesaver, and the OCR scan parsed my prescriptions beautifully.",
                  name: "Sarah Jenkins",
                  role: "Chronic Patient",
                  stars: 5,
                  initials: "SJ",
                  color: "from-teal-400 to-teal-500"
                },
                {
                  quote: "As a cardiologist, patient history scattering is a massive headache. MediAI's secure unified profile enables immediate clinical triage and saves hours of paperwork.",
                  name: "Dr. Olivia Vance",
                  role: "Certified Cardiologist",
                  stars: 5,
                  initials: "OV",
                  color: "from-blue-400 to-indigo-500"
                },
                {
                  quote: "The sub-5s emergency SOS location routing works like magic. Our dispatch medical teams received precise GPS coords and basic vital logs before we even pulled out.",
                  name: "Marcus Sterling",
                  role: "Emergency EMT Specialist",
                  stars: 5,
                  initials: "MS",
                  color: "from-emerald-400 to-teal-600"
                }
              ].map((t, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1, duration: 0.6 } }
                  }}
                  whileHover={{ y: -6 }}
                  className="bg-white/45 backdrop-blur-md border border-slate-200/50 shadow-xl rounded-3xl p-8 flex flex-col justify-between min-h-[300px] hover:border-teal-500/20 hover:shadow-2xl transition-all duration-350 relative overflow-hidden"
                >
                  <Quote className="absolute top-6 right-6 h-12 w-12 text-slate-100/50 z-0" />

                  <div className="relative z-10 space-y-4">
                    {/* Stars */}
                    <div className="flex gap-1.5 text-amber-400">
                      {[...Array(t.stars)].map((_, i) => (
                        <Star key={i} size={14} className="fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-slate-700 italic text-sm font-semibold leading-relaxed">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 relative z-10 pt-6 border-t border-slate-100 mt-6">
                    <div className={`h-11 w-11 rounded-full bg-gradient-to-tr ${t.color} text-white font-black text-sm flex items-center justify-center`}>
                      {t.initials}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                      <span className="text-xs text-slate-500 font-semibold">{t.role}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ==================================
            SECTION 9 — FAQ
            ================================== */}
        <section id="faq" className="py-24 bg-[#F8FAFC]">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-12">

            {/* Header info */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-center mb-16 space-y-4"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3.5 py-1 rounded-full">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg">
                Find answers regarding platform accuracy, security compliance, emergency guidelines, and credential reviews.
              </p>
            </motion.div>

            {/* Accordions */}
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              {faqItems.map((item, idx) => {
                const isActive = activeFAQ === idx
                return (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 hover:border-teal-500/20"
                  >
                    <button
                      onClick={() => setActiveFAQ(isActive ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-teal-600 transition-colors text-base"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        size={18}
                        className={`text-slate-400 transition-transform duration-300 ${isActive ? 'rotate-180 text-teal-500' : ''}`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="p-6 pt-0 text-slate-500 text-sm font-semibold leading-relaxed border-t border-slate-50">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>

          </div>
        </section>

        {/* ==================================
            SECTION 10 — FINAL CTA
            ================================== */}
        <section className="py-32 bg-white relative overflow-hidden flex items-center justify-center">
          {/* Radial teal mesh glow backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#14B8A6_0%,transparent_60%)] opacity-10 pointer-events-none" />

          <div className="mx-auto max-w-[1400px] px-6 sm:px-12 text-center relative z-10 w-full">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="max-w-3xl mx-auto space-y-8"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-slate-900 tracking-tight leading-none">
                Healthcare Support <br />At Your Fingertips
              </h2>
              <p className="text-slate-500 font-medium text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
                Join the future of healthcare powered by secure, reliable artificial intelligence models.
              </p>

              <div className="flex flex-wrap gap-5 justify-center pt-4">
                <Link href="/register">
                  <Button className="bg-[#0F172A] hover:bg-teal-600 text-white font-extrabold px-8 py-7 rounded-full text-base tracking-wide shadow-xl shadow-slate-950/15 hover:shadow-teal-500/25 transition-all duration-350 cursor-pointer">
                    Get Started Free
                  </Button>
                </Link>
                <a href="#features" onClick={(e) => handleScroll(e, "features")}>
                  <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold px-8 py-7 rounded-full text-base tracking-wide transition-all shadow-sm hover:border-slate-350">
                    Learn More
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* ==================================
          FOOTER SECTION
          ================================== */}
      <footer className="bg-[#060D18] text-slate-400 relative z-10 pt-24 pb-12 border-t border-slate-900">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-12">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            {/* Column 1 Brand Info */}
            <div className="lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">MediAI</span>
              </Link>
              <p className="text-slate-400 leading-relaxed font-semibold max-w-sm text-sm">
                Revolutionizing medical support with clinical-grade AI symptom checker modules, handwriting OCR engines, secure specialist appointment booking and sub-5s emergency SOS broadcast channels.
              </p>

              {/* Social micro icon buttons */}
              <div className="flex gap-4">
                <a href="#" aria-label="Twitter" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
                </a>
                <a href="#" aria-label="Facebook" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" aria-label="Instagram" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" aria-label="YouTube" className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-teal-400 hover:border-teal-500/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path><path d="m10 15 5-3-5-3z"></path></svg>
                </a>
              </div>
            </div>

            {/* Column 2 Product Links */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm tracking-wider uppercase">Product</h4>
              <ul className="space-y-3 font-semibold text-xs text-slate-400">
                <li><a href="#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-teal-400 transition-colors">Symptom Analyser</a></li>
                <li><a href="#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-teal-400 transition-colors">Prescription Scan</a></li>
                <li><a href="#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-teal-400 transition-colors">Doctor Appointment</a></li>
                <li><a href="#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-teal-400 transition-colors">Report Reader</a></li>
              </ul>
            </div>

            {/* Column 3 Features & Pages */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm tracking-wider uppercase">Features</h4>
              <ul className="space-y-3 font-semibold text-xs text-slate-400">
                <li><a href="#sos-showcase" onClick={(e) => handleScroll(e, "sos-showcase")} className="hover:text-teal-400 transition-colors">Emergency SOS</a></li>
                <li><a href="#ecosystem" onClick={(e) => handleScroll(e, "ecosystem")} className="hover:text-teal-400 transition-colors">Ecosystem Hub</a></li>
                <li><a href="#why-mediai" onClick={(e) => handleScroll(e, "why-mediai")} className="hover:text-teal-400 transition-colors">Comparison Analysis</a></li>
                <li><a href="#faq" onClick={(e) => handleScroll(e, "faq")} className="hover:text-teal-400 transition-colors">Vetting FAQ</a></li>
              </ul>
            </div>

            {/* Column 4 Company Info */}
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm tracking-wider uppercase">Company</h4>
              <ul className="space-y-3 font-semibold text-xs text-slate-400">
                <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Privacy Policy</span></li>
                <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Terms of Service</span></li>
                <li><span className="hover:text-teal-400 cursor-pointer transition-colors">HIPAA Vetting</span></li>
                <li><span className="hover:text-teal-400 cursor-pointer transition-colors">Clinical Security</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-500 font-semibold text-xs sm:text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} MediAI Ecosystem. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer font-bold">
                <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                support@mediai.health
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-black">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
                <span className="text-slate-300">Live clinical channels online</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Actual Functional Emergency SOS Modal binding */}
      <GuestSOSModal />
      <FloatingEmergencyScanButton />
    </div>
  )
}
