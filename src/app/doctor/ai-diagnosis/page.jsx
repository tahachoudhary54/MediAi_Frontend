"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Brain, Search, Activity, Stethoscope, AlertTriangle, FileText, Check } from "lucide-react"

export default function AIDiagnosisAssistant() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Diagnosis Assistant</h1>
        <p className="text-slate-500">Analyze symptoms and medical history for clinical decision support.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input placeholder="Search patient ID or name..." className="pl-9" defaultValue="John Doe (JD-2941)" />
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Sex</span>
                  <span className="font-medium text-slate-900">34 / <span className="capitalize">male</span></span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vitals</span>
                  <span className="font-medium text-slate-900">BP 125/82, HR 72</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Known Issues</span>
                  <span className="font-medium text-red-600">Hypertension</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">Reported Symptoms</label>
                <textarea
                  className="w-full h-32 p-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                  defaultValue="Patient complains of chest tightness that started 2 days ago. Pain has somewhat subsided. No shortness of breath currently reported. Pain is localized and does not radiate."
                ></textarea>
              </div>

              <Button className="w-full gap-2">
                <Brain className="h-4 w-4" /> Analyze Case
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-sm text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p><strong>Disclaimer:</strong> This is an AI clinical decision support tool. It provides suggestions based on available data but does not replace professional medical judgment. All diagnoses and treatments must be verified by the attending physician.</p>
          </div>

          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" /> Differential Diagnosis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {/* Match 1 */}
                <div className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Costochondritis</h3>
                      <p className="text-sm text-slate-500">Inflammation of the cartilage that connects a rib to the breastbone.</p>
                    </div>
                    <Badge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-sm py-1">85% Match</Badge>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-slate-200 text-sm">
                      <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><Check className="h-3 w-3 text-emerald-500" /> Supporting Factors</p>
                      <ul className="list-disc pl-4 text-slate-600 space-y-1">
                        <li>Localized chest tightness</li>
                        <li>Pain subsiding without cardiac intervention</li>
                        <li>No shortness of breath</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 text-sm">
                      <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><FileText className="h-3 w-3 text-teal-600" /> Recommended Tests</p>
                      <ul className="list-disc pl-4 text-slate-600 space-y-1">
                        <li>Physical palpation of chest wall</li>
                        <li>Chest X-Ray (to rule out other causes)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800">Select as Primary Diagnosis</Button>
                  </div>
                </div>

                {/* Match 2 */}
                <div className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Angina Pectoris (Stable)</h3>
                      <p className="text-sm text-slate-500">Chest pain or discomfort due to coronary heart disease.</p>
                    </div>
                    <Badge variant="warning" className="text-sm py-1">45% Match</Badge>
                  </div>
                  <div className="mt-4 grid sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-slate-200 text-sm">
                      <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-amber-500" /> Risk Factors</p>
                      <ul className="list-disc pl-4 text-slate-600 space-y-1">
                        <li>History of Hypertension</li>
                        <li>Age and Gender profile</li>
                      </ul>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 text-sm">
                      <p className="font-semibold text-slate-700 mb-1 flex items-center gap-1"><FileText className="h-3 w-3 text-teal-600" /> Recommended Tests</p>
                      <ul className="list-disc pl-4 text-slate-600 space-y-1">
                        <li>12-Lead ECG</li>
                        <li>Troponin levels</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-teal-600" /> Suggested Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 p-4 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none text-slate-900"
                defaultValue="- Prescribe NSAIDs (e.g., Ibuprofen 400mg) for inflammation and pain relief.
- Advise patient to rest and avoid strenuous chest movements.
- Apply a warm compress to the affected area.
- Follow up in 7 days if symptoms persist."
              ></textarea>
              <div className="mt-4 flex justify-end">
                <Button className="gap-2">Copy to Clinical Notes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
