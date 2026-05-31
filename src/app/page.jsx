"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, Activity, Shield, Clock, Check, Users, Sparkles, 
  Heart, UserPlus, ScanText, Bell, Lock, FileText, Star, Quote, ChevronRight, 
  MessageSquare, Brain, UserCheck, Download, Play, Video
} from "lucide-react"
import { motion } from "framer-motion"
import { GuestSOSModal } from "@/components/GuestSOSModal"

const featureCards = [
  {
    title: "AI Symptom Checker",
    description: "Describe your symptoms in plain language. Our AI cross-references thousands of medical cases to give you an instant preliminary assessment.",
    icon: Activity,
    href: "/patient/symptom-checker"
  },
  {
    title: "Doctor Consultation",
    description: "Connect with board-certified specialists via secure video or chat. Same-day appointments, no waiting rooms.",
    icon: Video,
    href: "/patient/doctor-recommendation"
  },
  {
    title: "Prescription Scanner",
    description: "Photograph any prescription and our OCR engine digitizes it instantly — ready to track, manage, and refill.",
    icon: ScanText,
    href: "/patient/prescription-ocr"
  },
  {
    title: "Medical Reports",
    description: "Your complete health history organized in one place. Download or share lab results and diagnoses with any provider.",
    icon: FileText,
    href: "/patient/reports"
  },
  {
    title: "Medicine Reminders",
    description: "Smart, adaptive reminders that fit your schedule. Never miss a dose and track your medication adherence over time.",
    icon: Bell,
    href: "/patient/reminders"
  },
  {
    title: "Secure Health Records",
    description: "AES-256 encrypted, HIPAA-compliant storage for every record, prescription, and consultation note you generate.",
    icon: Shield,
    href: "/patient/records"
  }
]

const processSteps = [
  {
    number: "01",
    title: "Describe Symptoms",
    description: "Tell us what you're feeling in plain language — no medical jargon needed.",
    icon: MessageSquare
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Our AI model processes your input against a vast medical knowledge base instantly.",
    icon: Brain
  },
  {
    number: "03",
    title: "Doctor Verification",
    description: "A certified physician reviews the AI findings and crafts your personal care plan.",
    icon: UserCheck
  },
  {
    number: "04",
    title: "Get Your Report",
    description: "Download a detailed medical report shareable with any healthcare provider worldwide.",
    icon: Download
  }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    content: "MediAI changed the way I manage my health. The AI symptom checker is incredibly fast, and the smart reminders ensure I never miss a dose.",
    rating: 5,
    initials: "SJ",
    color: "bg-teal-100 text-teal-700"
  },
  {
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    content: "The report verification platform saves me hours of paperwork every single day. I can review AI findings and authorize reports in seconds.",
    rating: 5,
    initials: "MC",
    color: "bg-slate-100 text-slate-700"
  },
  {
    name: "Emma Williams",
    role: "Patient",
    content: "The interface is exceptionally polished. Getting my printed prescriptions digitized automatically via OCR feels like pure magic.",
    rating: 5,
    initials: "EW",
    color: "bg-teal-100 text-teal-700"
  }
]

export default function LandingPage() {
  
  const handleScroll = (e, id) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-teal-500 selection:text-white font-sans antialiased">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-md shadow-teal-500/10">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">MediAI</span>
          </Link>
          
          {/* Middle Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            <a 
              href="#features" 
              onClick={(e) => handleScroll(e, "features")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleScroll(e, "how-it-works")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#doctors" 
              onClick={(e) => handleScroll(e, "doctors")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Doctors
            </a>
            <a 
              href="#testimonials" 
              onClick={(e) => handleScroll(e, "testimonials")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Testimonials
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => handleScroll(e, "pricing")}
              className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Pricing
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-6">
            <motion.div whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
              <Link href="/login" className="relative text-sm font-bold text-slate-700 hover:text-teal-600 transition-colors duration-200 group">
                Login
                <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-teal-500 rounded-full transition-all duration-300 group-hover:w-full" />
              </Link>
            </motion.div>
            <Link href="/register">
              <Button className="bg-[#0D1E22] hover:bg-[#1A3338] text-white font-bold px-6 py-5 rounded-full text-sm tracking-wide transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Section */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section 
          className="relative min-h-[640px] sm:min-h-[720px] bg-slate-900 flex items-center overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url('/hero_doctor.png')` }}
        >
          {/* Elegant Dark Overlay to dim the brightness and ensure text readability */}
          <div className="absolute inset-0 bg-slate-950/75 z-0 pointer-events-none" />
          
          <div className="container mx-auto px-4 sm:px-8 relative z-10 py-20 flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 bg-[#142B2F] border border-teal-500/30 rounded-full px-4.5 py-1.5 mb-8 text-teal-400 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-teal-400"></span>
                AI-Powered Healthcare Platform
              </div>
              
              {/* Large Headings */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                Healthcare,<br />
                <span className="text-[#10B981] drop-shadow-sm">Reimagined</span><br />
                with AI.
              </h1>
              
              {/* Subtitle */}
              <p className="mt-8 text-lg sm:text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
                Instant symptom analysis, certified doctor consultations, and smart prescription management — all in one secure platform.
              </p>
              
              {/* Buttons */}
              <div className="mt-12 flex flex-wrap items-center gap-5">
                <Link href="/register">
                  <Button size="lg" className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold px-8 py-7 rounded-full text-base tracking-wide shadow-lg shadow-teal-500/10 transition-all flex items-center gap-2 cursor-pointer">
                    Get Started Free <ArrowRight size={18} />
                  </Button>
                </Link>
                <button 
                  onClick={(e) => handleScroll(e, "how-it-works")} 
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-bold px-8 py-4.5 rounded-full text-base tracking-wide transition-all backdrop-blur-sm cursor-pointer"
                >
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Play size={14} className="fill-white ml-0.5" />
                  </div>
                  Watch Demo
                </button>
              </div>

              {/* Bottom Hero Stats exactly matching screenshot */}
              <div className="mt-16 pt-8 border-t border-white/15 flex flex-wrap items-center gap-x-12 gap-y-4">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white">99.4%</span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">AI Diagnostic Accuracy</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white">10,000+</span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Patient Consultations</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white">500+</span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Verified Specialists</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-white">24/7</span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Always-On Care</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>




        {/* 4. Features Section */}
        <section id="features" className="py-24 sm:py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-8">
            
            {/* Features Title Info */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] block mb-3">
                  PLATFORM FEATURES
                </span>
                <h2 className="text-4xl sm:text-5xl font-black text-[#0D1E22] tracking-tight">
                  Everything in one place.
                </h2>
              </div>
              <p className="text-slate-500 font-medium text-base sm:text-lg max-w-sm leading-relaxed">
                A complete healthcare platform built for patients who want fast, reliable, and secure care.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 border border-slate-100 rounded-3xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {featureCards.map((feat, idx) => {
                const Icon = feat.icon
                return (
                  <Link href={feat.href} key={idx}>
                    <motion.div 
                      whileHover={{ y: -4 }}
                      className="group p-10 sm:p-12 bg-white hover:bg-slate-50/50 transition-all duration-300 cursor-pointer flex flex-col justify-between h-full min-h-[300px]"
                    >
                      <div>
                        {/* Icon Mint Background */}
                        <div className="h-12 w-12 rounded-xl bg-[#E6F4F1] flex items-center justify-center text-teal-600 mb-8 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">
                          {feat.title}
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed text-sm">
                          {feat.description}
                        </p>
                      </div>
                      <div className="mt-8 inline-flex items-center gap-1.5 text-teal-600 font-bold text-sm">
                        Learn more <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>

          </div>
        </section>

        {/* 5. Simple Process (How It Works) */}
        <section id="how-it-works" className="bg-[#0A1224] py-24 sm:py-32 text-white relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-8">
            
            {/* Header info */}
            <div className="text-left mb-20 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] block mb-3">
                SIMPLE PROCESS
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                From symptoms to answers <br />
                <span className="text-[#10B981]">in minutes.</span>
              </h2>
            </div>

            {/* Enclosed Steps Section Card */}
            <div className="bg-[#0e1b2f]/30 border border-slate-800/50 rounded-[2.5rem] p-10 sm:p-14 md:p-16 shadow-2xl relative overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/5 to-transparent pointer-events-none" />
              
              {/* Steps Row */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
                {processSteps.map((step, idx) => {
                  const StepIcon = step.icon
                  return (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative flex flex-col justify-between h-full cursor-pointer group"
                    >
                      {/* Thin Divider Lines */}
                      {idx < 3 && (
                        <div className="hidden lg:block absolute top-12 right-0 left-[85%] h-[1px] bg-slate-800/50 pointer-events-none" />
                      )}
                      
                      <div>
                        {/* Step Number Badge */}
                        <span className="text-5xl font-black text-[#132A2E] block mb-6 tracking-tight transition-colors group-hover:text-[#10B981]/50">
                          {step.number}
                        </span>
                        {/* Icon */}
                        <div className="h-10 w-10 rounded-full bg-teal-500 text-white flex items-center justify-center mb-6 transition-all group-hover:scale-110 group-hover:bg-[#10B981]">
                          <StepIcon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3 transition-colors group-hover:text-[#10B981]">
                          {step.title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium transition-colors group-hover:text-slate-300">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

          </div>
        </section>

        {/* 6. Doctors Section (SOS Banner) */}
        <section id="doctors" className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-teal-900 to-teal-950 rounded-[2.5rem] shadow-2xl p-8 sm:p-16 border border-teal-800/50 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#10b981/15_0%,transparent_60%)] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#10B981] animate-ping mr-2"></span>
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-widest">Active System SOS Dispatch</span>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-6 leading-tight">
                  Need Immediate Medical Guidance?
                </h2>
                <p className="text-slate-300 font-medium text-base mb-10 max-w-xl mx-auto leading-relaxed">
                  Our verify-consult network routes you to active cardiologists, general practitioners, and emergency clinics in real-time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold px-8 py-6 rounded-full cursor-pointer shadow-lg shadow-teal-500/20">
                      Find Available Doctors
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/30 rounded-full font-bold px-8 py-6">
                      Existing Patient Access
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Testimonials Section */}
        <section id="testimonials" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] block mb-3">
                TRUSTED WORLDWIDE
              </span>
              <h2 className="text-4xl font-black text-[#0D1E22] tracking-tight">What our users say</h2>
              <p className="mt-3 text-slate-500 font-medium max-w-lg mx-auto">Hear how doctors and patients alike verify care efficiency using MediAI.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((t, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="relative bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col justify-between"
                >
                  <Quote className="absolute top-6 right-8 h-12 w-12 text-slate-100 -z-0" />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 italic mb-8 leading-relaxed text-sm font-medium">
                      "{t.content}"
                    </p>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Pricing Section (Premium CTA) */}
        <section id="pricing" className="pt-32 pb-44 bg-[#0A1224] text-white text-center border-t border-slate-800/40 relative">
          {/* Gradient fade at the bottom to transition into footer */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#060d18] pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] block mb-3">
              FLEXIBLE ACCESS PLANS
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">Choose Health, Made Simple.</h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto font-medium leading-relaxed">Get active clinical access, smartwatch integration, prescription OCR scanning, and emergency dispatch all-in-one platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold px-8 py-6 rounded-full cursor-pointer shadow-lg shadow-teal-500/20">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/20 text-white bg-transparent hover:bg-white hover:text-slate-950 font-bold px-8 py-6 rounded-full transition-all">
                  Existing Portal Access
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Spacer between Pricing CTA and Footer */}
      <div className="bg-white h-20" />

      {/* 9. Footer Section */}
      <footer className="bg-[#060d18] text-slate-400 relative z-10 pt-20 pb-8">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-12">
            
            {/* Brand & Description (spans 2 cols on lg) */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 shadow-md shadow-teal-500/20">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">MediAI</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-sm font-medium">
                Revolutionizing healthcare access with AI-driven diagnostics, seamless doctor consultations, and secure medical record management. Your health, simplified.
              </p>
            </div>

            {/* Links Group 1 */}
            <div>
              <h3 className="text-white font-semibold mb-4 tracking-wide">Platform</h3>
              <ul className="space-y-3">
                <li><a href="#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-teal-400 transition-colors font-medium">Features</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleScroll(e, "how-it-works")} className="hover:text-teal-400 transition-colors font-medium">How It Works</a></li>
                <li><a href="#testimonials" onClick={(e) => handleScroll(e, "testimonials")} className="hover:text-teal-400 transition-colors font-medium">Testimonials</a></li>
                <li><Link href="/register" className="hover:text-teal-400 transition-colors font-medium">Get Started</Link></li>
              </ul>
            </div>

            {/* Links Group 2 */}
            <div>
              <h3 className="text-white font-semibold mb-4 tracking-wide">Portals</h3>
              <ul className="space-y-3">
                <li><Link href="/login" className="hover:text-teal-400 transition-colors font-medium">Patient Login</Link></li>
                <li><Link href="/login?role=doctor" className="hover:text-teal-400 transition-colors font-medium">Doctor Portal</Link></li>
                <li><Link href="/register" className="hover:text-teal-400 transition-colors font-medium">Create Account</Link></li>
                <li><Link href="/login?role=admin" className="hover:text-teal-400 transition-colors font-medium">Admin Access</Link></li>
              </ul>
            </div>

            {/* Links Group 3 */}
            <div>
              <h3 className="text-white font-semibold mb-4 tracking-wide">Legal</h3>
              <ul className="space-y-3">
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer font-medium">Privacy Policy</span></li>
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer font-medium">Terms of Service</span></li>
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer font-medium">Cookie Policy</span></li>
                <li><span className="hover:text-teal-400 transition-colors cursor-pointer font-medium">HIPAA Compliance</span></li>
              </ul>
            </div>
            
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 font-medium text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} MediAI. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors cursor-pointer font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                support@mediai.health
              </div>
              <div className="flex items-center gap-1.5 bg-[#091517] border border-slate-800 px-3 py-1.5 rounded-full text-xs">
                <span className="inline-flex h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-slate-400 font-semibold">Systems active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <GuestSOSModal />
    </div>
  )
}
