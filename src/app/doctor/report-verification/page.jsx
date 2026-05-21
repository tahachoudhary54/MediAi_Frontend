"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, XCircle, PenTool, AlertCircle, Clock, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function ReportVerification() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    assessment: "",
    plan: "",
    prescription: ""
  })

  useEffect(() => {
    const fetchPendingReports = async () => {
      try {
        const res = await api.get('/reports/doctor')
        if (res.data.success) {
          const pending = res.data.data.filter(r => r.status === 'pending' || r.status === 'Under Doctor Review' || r.status === 'Draft by AI').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setReports(pending)
          if (!selectedReport && pending.length > 0) {
            handleSelectReport(pending[0])
          }
        }
      } catch (err) {
        console.error("Failed to fetch pending reports:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPendingReports()
    const interval = setInterval(fetchPendingReports, 10000)
    return () => clearInterval(interval)
  }, [selectedReport])

  const handleSelectReport = (report) => {
    setSelectedReport(report)
    setFormData({
      title: report.title || "",
      content: report.content || "",
      assessment: report.assessment || "",
      plan: report.plan || "",
      prescription: report.prescription || ""
    })
  }

  const handleDeleteReport = async (reportId, e) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this report draft?")) return
    try {
      const res = await api.delete(`/reports/${reportId}`)
      if (res.data.success) {
        toast.success("Report draft deleted successfully")
        const updatedReports = reports.filter(r => r._id !== reportId)
        setReports(updatedReports)
        if (selectedReport?._id === reportId) {
          if (updatedReports.length > 0) {
            handleSelectReport(updatedReports[0])
          } else {
            setSelectedReport(null)
            setFormData({
              title: "",
              content: "",
              assessment: "",
              plan: "",
              prescription: ""
            })
          }
        }
      }
    } catch (err) {
      console.error("Failed to delete report:", err)
      toast.error("Failed to delete report draft")
    }
  }

  const handleAction = async (actionType) => {
    if (!selectedReport) return

    try {
      setIsSubmitting(true)
      // 1. Sync and save the fields to the database first
      const summaryText = formData.assessment
        ? `${formData.assessment}\n\n${formData.content}`
        : formData.content || "Clinical Consultation Notes";

      await api.put(`/reports/${selectedReport._id}`, {
        ...formData,
        summary: summaryText
      })

      // 2. Perform the status update using /status endpoint so it actually publishes to the patient
      const statusToSet = actionType === 'approve' ? 'Sent to Patient' : 'Draft by AI';
      const res = await api.put(`/reports/${selectedReport._id}/status`, { status: statusToSet })

      if (res.data.success) {
        toast.success(`Report ${actionType === 'approve' ? 'approved & sent to patient' : 'returned to draft'} successfully`)
        const updatedReports = reports.filter(r => r._id !== selectedReport._id)
        setReports(updatedReports)
        if (updatedReports.length > 0) {
          handleSelectReport(updatedReports[0])
        } else {
          setSelectedReport(null)
        }
      }
    } catch (err) {
      console.error("Failed to update report status:", err)
      toast.error("Failed to update report")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading pending verifications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Report Verification</h1>
          <p className="text-slate-500">Review and digitally sign AI-generated clinical notes before sending to patients.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-white py-1.5 px-3 border-teal-200 text-teal-700">
            <Clock className="h-4 w-4 mr-2" /> {reports.length} Pending
          </Badge>
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending List Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {reports.map((report) => (
              <div
                key={report._id}
                onClick={() => handleSelectReport(report)}
                className={`group p-4 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden ${selectedReport?._id === report._id
                    ? 'bg-white border-teal-600 shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
              >
                {selectedReport?._id === report._id && <div className="absolute top-0 left-0 w-1 h-full bg-teal-600"></div>}

                <button
                  onClick={(e) => handleDeleteReport(report._id, e)}
                  className="absolute top-3 right-3 h-7 w-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 z-10"
                  title="Delete Draft"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <h3 className="font-semibold text-slate-900 mb-1 pr-8">{report.patient?.fullName || "Unknown Patient"}</h3>
                <p className="text-xs font-medium text-slate-500 mb-3">Created: {new Date(report.createdAt).toLocaleDateString()}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{report.reportType || "Clinical Note"}</Badge>
                  <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1 uppercase">
                    <FileText className="h-3 w-3" /> Draft Ready
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col shadow-md border-slate-200">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                    <PenTool className="h-5 w-5 text-teal-600" />
                    Reviewing: {formData.title || "Clinical Note"}
                  </CardTitle>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">AI Assisted</Badge>
                </div>
                <CardDescription className="flex gap-4 text-sm font-medium">
                  <span>Patient: <span className="text-slate-900">{selectedReport?.patient?.fullName}</span></span>
                  <span>Date: <span className="text-slate-900">{new Date(selectedReport?.createdAt).toLocaleDateString()}</span></span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-6 space-y-6 bg-white">
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100 text-sm text-teal-800 flex gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>Please verify all clinical facts and medication dosages before signing. AI drafts may require adjustments.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report Title</label>
                  <input
                    className="w-full p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 outline-none text-slate-900"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observations / Findings</label>
                  <textarea
                    className="w-full p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 outline-none h-32 text-slate-800"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment</label>
                    <textarea
                      className="w-full p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 outline-none h-24 text-slate-800"
                      value={formData.assessment}
                      onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan / Treatment</label>
                    <textarea
                      className="w-full p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 outline-none h-24 text-slate-800"
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prescribed Medicines & Nearby Medical Shops</label>
                  <textarea
                    className="w-full p-3 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-teal-600 outline-none h-28 text-slate-800 font-medium"
                    placeholder="List required medicines, dosages, and nearby shops where they can buy them..."
                    value={formData.prescription}
                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <input type="checkbox" id="sign" className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-600 cursor-pointer" />
                    <label htmlFor="sign" className="text-sm font-medium text-slate-700 cursor-pointer">
                      I verify that I have reviewed this document and apply my digital signature.
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 border-t border-slate-200 p-4 flex justify-between gap-4">
                <Button
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleAction('reject')}
                  className="text-red-600 border-red-200 hover:bg-red-50 gap-2 flex-1 sm:flex-none"
                >
                  <XCircle className="h-4 w-4" /> Reject Draft
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={() => handleAction('approve')}
                  className="bg-teal-600 hover:bg-teal-700 gap-2 px-8 flex-1 sm:flex-none text-white"
                >
                  <CheckCircle2 className="h-4 w-4" /> {isSubmitting ? "Processing..." : "Approve & Send"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-2xl border-dashed">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4 text-slate-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">All Caught Up!</h3>
          <p className="text-slate-500">There are no reports pending your verification at this time.</p>
        </div>
      )}
    </div>
  )
}
