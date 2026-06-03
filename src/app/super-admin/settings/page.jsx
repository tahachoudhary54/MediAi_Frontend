"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Bell, Shield, Globe, Mail, Smartphone, Activity, Save, ToggleLeft, ToggleRight } from "lucide-react"
import { toast } from "react-hot-toast"

const Toggle = ({ enabled, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative shrink-0 flex items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${enabled ? 'bg-teal-600' : 'bg-slate-200'}`}
      style={{
        width: '52px',
        height: '28px',
        padding: '0 4px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
      <span
        className={`bg-white shadow-md rounded-full transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-[24px]' : 'translate-x-0'}`}
        style={{
          width: '20px',
          height: '20px',
          display: 'block',
          flexShrink: 0
        }}
      />
    </button>
  </div>
)

export default function SuperAdminSettings() {
  const [saved, setSaved] = useState(false)

  // Platform Settings
  const [platformName, setPlatformName] = useState("MediAI Ecosystem")
  const [supportEmail, setSupportEmail] = useState("support@mediai.com")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [registrationOpen, setRegistrationOpen] = useState(true)

  // Notification Settings
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [smsNotifs, setSmsNotifs] = useState(false)
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [appointmentReminders, setAppointmentReminders] = useState(true)

  // Security Settings
  const [requireEmailVerification, setRequireEmailVerification] = useState(true)
  const [autoSuspendInactive, setAutoSuspendInactive] = useState(false)
  const [twoFactorAdmin, setTwoFactorAdmin] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("60")

  // AI Settings
  const [aiDiagnostics, setAiDiagnostics] = useState(true)
  const [aiRiskScoring, setAiRiskScoring] = useState(true)
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState("75")

  const handleSave = () => {
    toast.success("Settings saved successfully!")
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global System Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings and behaviour.</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all text-white w-auto shrink-0"
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save className="h-4 w-4 shrink-0" />
          <span>{saved ? "Saved!" : "Save Changes"}</span>
        </Button>
      </div>

      {/* Platform Settings */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Globe className="h-5 w-5 text-teal-600" />
            Platform Settings
          </CardTitle>
          <CardDescription className="text-sm">General platform identity and access controls.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-700">Platform Name</label>
              <input
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all bg-slate-50 hover:bg-white focus:bg-white"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium text-slate-700">Support Email</label>
              <input
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all bg-slate-50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Maintenance Mode</p>
                <p className="text-xs text-slate-500 mt-0.5">Temporarily disable the platform for all users except admins.</p>
              </div>
              <Toggle enabled={maintenanceMode} onChange={setMaintenanceMode} />
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Open Registration</p>
                <p className="text-xs text-slate-500 mt-0.5">Allow new patients and doctors to register on the platform.</p>
              </div>
              <Toggle enabled={registrationOpen} onChange={setRegistrationOpen} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Bell className="h-5 w-5 text-teal-600" />
            Notification Settings
          </CardTitle>
          <CardDescription className="text-sm">Control how alerts and reminders are delivered platform-wide.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 shrink-0">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Email Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Send appointment updates and reports via email.</p>
              </div>
            </div>
            <Toggle enabled={emailNotifs} onChange={setEmailNotifs} />
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 shrink-0">
                <Smartphone className="h-5 w-5 text-slate-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">SMS Notifications</p>
                <p className="text-xs text-slate-500 mt-0.5">Send SMS alerts for critical events (requires SMS gateway).</p>
              </div>
            </div>
            <Toggle enabled={smsNotifs} onChange={setSmsNotifs} />
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-50 shrink-0">
                <Bell className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Emergency SOS Alerts</p>
                <p className="text-xs text-slate-500 mt-0.5">Immediately notify admins and nearby doctors of SOS triggers.</p>
              </div>
            </div>
            <Toggle enabled={emergencyAlerts} onChange={setEmergencyAlerts} />
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 shrink-0">
                <Bell className="h-5 w-5 text-slate-500" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Appointment Reminders</p>
                <p className="text-xs text-slate-500 mt-0.5">Send 24h reminders to patients before their appointments.</p>
              </div>
            </div>
            <Toggle enabled={appointmentReminders} onChange={setAppointmentReminders} />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Shield className="h-5 w-5 text-teal-600" />
            Security Settings
          </CardTitle>
          <CardDescription className="text-sm">Manage authentication rules and account protection policies.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Require Email Verification</p>
                <p className="text-xs text-slate-500 mt-0.5">New accounts must verify their email before accessing the platform.</p>
              </div>
              <Toggle enabled={requireEmailVerification} onChange={setRequireEmailVerification} />
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Auto-Suspend Inactive Accounts</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically suspend accounts with no activity for 90+ days.</p>
              </div>
              <Toggle enabled={autoSuspendInactive} onChange={setAutoSuspendInactive} />
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">Two-Factor Auth for Admins</p>
                <p className="text-xs text-slate-500 mt-0.5">Require 2FA for all admin logins (requires TOTP setup).</p>
              </div>
              <Toggle enabled={twoFactorAdmin} onChange={setTwoFactorAdmin} />
            </div>
          </div>
          <div className="flex flex-col space-y-2 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <label className="text-sm font-medium text-slate-700">Session Timeout (minutes)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
                className="h-11 w-48 rounded-lg border border-slate-200 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all bg-white"
              />
              <p className="text-xs text-slate-500">Users will be logged out after this period of inactivity.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card className="shadow-sm border border-slate-200 rounded-2xl overflow-hidden bg-white transition-all hover:shadow-md">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80 p-5">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Activity className="h-5 w-5 text-teal-600" />
            AI Engine Settings
          </CardTitle>
          <CardDescription className="text-sm">Control AI diagnostic features and confidence thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">AI Symptom Diagnostics</p>
                <p className="text-xs text-slate-500 mt-0.5">Enable AI-powered symptom checking for patients.</p>
              </div>
              <Toggle enabled={aiDiagnostics} onChange={setAiDiagnostics} />
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-900">AI Emergency Risk Scoring</p>
                <p className="text-xs text-slate-500 mt-0.5">Use AI to auto-classify SOS cases as Low / Medium / High / Critical.</p>
              </div>
              <Toggle enabled={aiRiskScoring} onChange={setAiRiskScoring} />
            </div>
          </div>
          <div className="flex flex-col space-y-2 bg-teal-50/50 p-5 rounded-xl border border-teal-100/50">
            <label className="text-sm font-medium text-slate-700">AI Confidence Threshold (%)</label>
            <div className="flex items-center gap-5 mt-1">
              <input
                type="range"
                min="50"
                max="99"
                value={aiConfidenceThreshold}
                onChange={e => setAiConfidenceThreshold(e.target.value)}
                className="flex-1 accent-teal-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold text-teal-700 w-12 shrink-0 bg-white px-2 py-1 rounded-md text-center shadow-sm border border-teal-100">{aiConfidenceThreshold}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">AI will only surface diagnoses above this confidence level.</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Footer */}
      <div className="flex justify-end pt-2 pb-6">
        <Button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 rounded-xl text-base font-medium shadow-md hover:shadow-lg transition-all text-white w-auto shrink-0"
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Save className="h-5 w-5 shrink-0" />
          <span>{saved ? "✓ Saved!" : "Save All Changes"}</span>
        </Button>
      </div>
    </div>
  )
}
