import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  ShieldCheck, User, 
  AlertCircle,
  FileText,
  Pill,
  MapPin,
  Printer,
  Download,
  ClipboardList,
  BedDouble,
  Droplets,
  CalendarCheck,
  Check
} from 'lucide-react';

export default function ClinicalReportModal({ isOpen = true, onClose, patient }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md sm:p-6 transition-all duration-300">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-slate-200 scroll-smooth">
        
        {/* 1. Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-100 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 text-teal-600 shadow-sm shadow-teal-100/50">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight">Clinical Medical Report</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 transition-all duration-200 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 sm:p-8 flex flex-col gap-8">
          
          {/* 2. Report Summary Section */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4 flex-1">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Consultation Report</h1>
                <p className="mt-1.5 text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Clock size={15} />
                  Oct 24, 2023 at 10:30 AM
                </p>
              </div>

              {/* Profiles Row */}
              <div className="flex flex-wrap gap-4">
                {/* Doctor Profile Mini Section */}
                <div className="flex items-center gap-4 p-3 border border-slate-100 rounded-2xl bg-gradient-to-r from-slate-50 to-white shadow-sm flex-1 min-w-[240px]">
                  <div className="flex items-center justify-center w-12 h-12 text-blue-600 bg-blue-50 border border-blue-100 rounded-full shrink-0">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">Dr. Sarah Jenkins</p>
                      <ShieldCheck size={16} className="text-teal-500" />
                    </div>
                    <p className="text-sm text-slate-500">General Physician</p>
                  </div>
                </div>

                {/* Patient Profile Section */}
                {patient ? (
                  <div className="flex items-center gap-4 p-3 border border-slate-100 rounded-2xl bg-gradient-to-r from-slate-50 to-white shadow-sm flex-1 min-w-[240px]">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-full shrink-0">
                      <User size={22} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {patient.fullName || patient.name || "Unnamed Patient"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {patient.age ? `${patient.age} yrs` : ""}{patient.age && patient.sex ? " · " : ""}{patient.sex || ""}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-3 border border-slate-100 rounded-2xl bg-slate-50/50 shadow-sm flex-1 min-w-[240px]">
                    <p className="text-sm text-slate-500 font-medium">Patient information not available.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 border border-teal-100/50 rounded-full shadow-sm shrink-0">
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-teal-400"></span>
                <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              </span>
              <span className="text-sm font-bold tracking-wide text-teal-800 uppercase">AI Generated • Doctor Verified ✓</span>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-teal-100 to-transparent"></div>

          {/* 3. AI Conversation Summary */}
          <div className="relative overflow-hidden border border-blue-100/60 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 rounded-3xl p-6 shadow-sm group hover:shadow-md transition-shadow duration-300">
            <div className="absolute top-0 right-0 w-48 h-48 -mr-20 -mt-20 rounded-full bg-blue-300/20 blur-3xl group-hover:bg-blue-400/30 transition-colors duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 -ml-16 -mb-16 rounded-full bg-teal-200/20 blur-3xl"></div>
            
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 relative">
                <div className="absolute inset-0 bg-blue-400 rounded-xl blur-md opacity-30 animate-pulse"></div>
                <div className="relative flex items-center justify-center w-10 h-10 text-blue-600 bg-white shadow-sm border border-blue-50 rounded-xl">
                  <Activity size={20} className="animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xs font-black tracking-widest text-blue-800/80 uppercase mb-2 flex items-center gap-2">
                  AI Conversation Summary
                </h3>
                <p className="text-[15px] leading-relaxed text-slate-700 font-medium">
                  “Patient reported fever and headache for 2 days along with mild cough. 
                  Doctor asked follow-up questions regarding fever severity and respiratory symptoms. 
                  AI generated the report after analyzing the consultation.”
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            <div className="flex flex-col gap-6">
              {/* 4. Observations & Findings */}
              <div className="p-6 transition-all duration-300 bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-3xl">
                <h3 className="mb-5 text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList size={20} className="text-slate-400" />
                  Observations
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500 font-medium">Main Complaint</span>
                    <span className="col-span-2 text-sm text-slate-900 font-semibold">Fever & Headache</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500 font-medium">Symptoms</span>
                    <span className="col-span-2 text-sm text-slate-900 font-semibold">Mild cough, elevated temp</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-50">
                    <span className="text-sm text-slate-500 font-medium">Duration</span>
                    <span className="col-span-2 text-sm text-slate-900 font-semibold">2 days</span>
                  </div>
                  
                  <div className="pt-2">
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-3">
                      <AlertCircle size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Severity Assessment</p>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          Symptoms currently appear mild and stable. No major emergency signs detected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Doctor Notes */}
              <div className="p-5 relative overflow-hidden bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-100/50 rounded-3xl shadow-sm">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                <h3 className="text-xs font-bold tracking-widest text-amber-800/80 uppercase mb-2">Doctor's Note</h3>
                <p className="text-sm text-amber-950/80 font-medium italic leading-relaxed">
                  “Patient advised to monitor symptoms carefully and return for follow-up if condition worsens.”
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* 5. Clinical Assessment */}
              <div className="p-6 transition-all duration-300 bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-3xl">
                <h3 className="mb-4 text-lg font-bold text-slate-800">What this may mean</h3>
                <p className="text-slate-700 font-medium leading-relaxed bg-teal-50/50 p-4 rounded-2xl border border-teal-100/50 text-sm shadow-inner shadow-teal-100/20">
                  This looks like a mild fever or flu-like illness. No serious warning signs were found during consultation.
                </p>
              </div>

              {/* 6. Negative Findings */}
              <div className="p-6 transition-all duration-300 bg-white border border-slate-100 shadow-sm hover:shadow-md rounded-3xl">
                <h3 className="mb-4 text-lg font-bold text-slate-800">Negative Findings</h3>
                <ul className="space-y-3.5">
                  {[
                    "No chest pain reported",
                    "No breathing difficulty reported",
                    "No severe emergency symptoms observed"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                      <div className="mt-0.5 p-1 bg-teal-50/80 border border-teal-100 rounded-full text-teal-600 shadow-sm">
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      </div>
                      <span className="leading-snug pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* 7. Plan & Treatment */}
          <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl shadow-sm">
            <h3 className="mb-5 text-lg font-bold text-slate-800">Plan & Treatment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <BedDouble size={16} />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm mb-1">Rest</h4>
                <p className="text-xs text-slate-500 font-medium">Get plenty of sleep for the next 48 hours.</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                  <Droplets size={16} />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm mb-1">Hydration</h4>
                <p className="text-xs text-slate-500 font-medium">Drink at least 2.5 liters of water daily.</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <CalendarCheck size={16} />
                </div>
                <h4 className="font-semibold text-slate-800 text-sm mb-1">Follow-up</h4>
                <p className="text-xs text-slate-500 font-medium">Return if symptoms worsen after 3 days.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 9. Prescribed Medicines */}
            <div className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="mb-5 text-lg font-bold text-slate-800 flex items-center gap-2">
                <Pill size={20} className="text-blue-500" />
                Prescribed Medicines
              </h3>
              <div className="space-y-4">
                {/* Medicine Card 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-2xl gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">Paracetamol 500mg</h4>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Take after meals</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">Morning</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">Night</span>
                  </div>
                </div>
                {/* Medicine Card 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 bg-slate-50/50 rounded-2xl gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">Vitamin C Supplement</h4>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">Dissolve in water</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">Once daily</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. Nearby Pharmacies */}
            <div className="p-6 bg-gradient-to-b from-slate-50 to-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="mb-5 text-lg font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={20} className="text-teal-500" />
                Nearby Pharmacies
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-teal-50 rounded-xl text-teal-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">City Care Pharmacy</p>
                    <p className="text-xs text-slate-500 mt-0.5">0.8 miles away • Open 24/7</p>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100"></div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 bg-teal-50 rounded-xl text-teal-600">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">HealthPlus Store</p>
                    <p className="text-xs text-slate-500 mt-0.5">1.2 miles away • Closes 10 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* 11. Consultation Timeline */}
          <div className="px-2 py-4">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-8 text-center">Consultation Timeline</h3>
            <div className="relative flex justify-between items-center w-full max-w-2xl mx-auto">
              {/* Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
              {/* Progress Line */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[100%] h-1 bg-teal-400 rounded-full z-0"></div>
              
              {/* Steps */}
              {[
                { title: "Started", time: "10:00 AM" },
                { title: "Completed", time: "10:15 AM" },
                { title: "AI Generated", time: "10:16 AM" },
                { title: "Verified", time: "10:30 AM" }
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div className="w-6 h-6 rounded-full bg-teal-500 border-4 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-110">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                  <div className="text-center absolute top-8 w-24 -ml-9">
                    <p className="text-[11px] font-bold text-slate-700">{step.title}</p>
                    <p className="text-[10px] font-medium text-slate-400">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 12. Footer actions */}
          <div className="flex flex-wrap items-center justify-end pt-8 border-t border-slate-100 gap-3 mt-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold transition-all duration-200 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              Close
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all duration-200 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 active:scale-95">
              <Printer size={16} />
              Print Report
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-slate-900 rounded-xl hover:bg-slate-800 active:scale-95 shadow-md shadow-slate-900/20 hover:shadow-lg hover:shadow-slate-900/30">
              <Download size={16} />
              Download PDF
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
