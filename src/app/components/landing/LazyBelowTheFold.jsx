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
import { SOSAnimatedSection } from "@/app/components/landing/SOSAnimatedSection"
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

export default function LazyBelowTheFold({ activeFAQ, setActiveFAQ, handleScroll }) {
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
    <>
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


    </>
  );
}
