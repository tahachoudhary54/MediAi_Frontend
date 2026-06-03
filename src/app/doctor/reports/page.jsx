"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { FileText, Eye, Download, Search, CheckCircle2, Trash2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import { jsPDF } from "jspdf"

export default function DoctorReports() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Report Edit Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [editForm, setEditForm] = useState({ summary: "", prescription: "" })

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/doctor')
      if (res.data.success) {
        setReports(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch doctor reports:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setEditForm({
      summary: report.summary || "",
      prescription: report.prescription || ""
    })
    setIsReportModalOpen(true)
  }

  const handleDownloadPDF = (report) => {
    try {
      const doc = new jsPDF();

      // Basic styling
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 118, 110);
      doc.text("MediAI Healthcare - Clinical Report", 14, 20);

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Official Electronic Medical Record", 14, 28);

      doc.setLineWidth(0.5);
      doc.setDrawColor(15, 118, 110);
      doc.line(14, 32, 196, 32);

      // Meta info
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(`Report Title: ${report.title || 'Consultation Report'}`, 14, 42);
      doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 14, 48);
      doc.text(`Patient: ${report.patient?.fullName || 'N/A'}`, 14, 54);
      doc.text(`Consulting Physician: Dr. ${report.doctor?.fullName || 'N/A'}`, 14, 60);

      let yPos = 72;

      const addSection = (title, content) => {
        if (!content) return;

        // Check page break for section title
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 118, 110);
        doc.text(title, 14, yPos);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);

        const lines = doc.splitTextToSize(content, 180);

        // Render lines with page break checking
        for (let i = 0; i < lines.length; i++) {
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(lines[i], 14, yPos);
          yPos += 6;
        }

        yPos += 8; // Add space after section
      }

      if (report.content || report.assessment || report.plan) {
        if (report.content) addSection("Observations & Findings", report.content);
        if (report.assessment) addSection("Clinical Assessment", report.assessment);
        if (report.plan) addSection("Plan & Treatment", report.plan);
      } else {
        addSection("Clinical Notes & Summary", report.summary || 'No summary available.');
      }

      if (report.prescription) {
        addSection("Prescription & Medical Instructions", report.prescription);
      }

      // Footer on the last page
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text("This is a secure, system-generated medical report verified by MediAI Healthcare.", 14, 290);

      doc.save(`MediAI_Report_${report.patient?.fullName || report._id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  }

  const handleSaveEdits = async () => {
    try {
      await api.put(`/reports/${selectedReport._id}`, editForm)
      toast.success("Draft saved successfully")
      fetchReports()
      setIsReportModalOpen(false)
    } catch (err) {
      toast.error("Failed to save report")
    }
  }

  const handleApproveReport = async () => {
    try {
      // First save any pending edits
      await api.put(`/reports/${selectedReport._id}`, editForm)
      // Then approve and send to patient
      await api.put(`/reports/${selectedReport._id}/status`, { status: 'Sent to Patient' })
      toast.success("Report approved and sent to patient!")
      fetchReports()
      setIsReportModalOpen(false)
    } catch (err) {
      toast.error("Failed to approve report")
    }
  }

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report? This cannot be undone.")) return;
    try {
      await api.delete(`/reports/${reportId}`);
      toast.success("Report deleted successfully");
      fetchReports();
    } catch (err) {
      toast.error("Failed to delete report");
    }
  }


  const filteredReports = reports.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading reports archive...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports Archive</h1>
          <p className="text-slate-500">Access and manage all patient clinical notes and lab reports.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient or report..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full sm:w-64 rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0 flex flex-col sm:flex-row">
                <div className="p-6 flex-1 flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                    <FileText className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{report.title || 'Medical Report'}</h3>
                      <Badge variant={
                        report.status === 'Approved' || report.status === 'Sent to Patient' ? 'success' :
                          report.status === 'Draft by AI' ? 'warning' : 'secondary'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 mt-2">
                      <span className="font-medium text-slate-700">Patient: {report.patient?.fullName || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:w-48 flex flex-row sm:flex-col items-center justify-center gap-2 bg-slate-50 border-t sm:border-t-0 sm:border-l border-slate-100">
                  <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200" onClick={() => handleViewReport(report)}>
                    <Eye className="h-4 w-4" /> View / Edit
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200" disabled={report.status === 'Draft by AI'} onClick={() => handleDownloadPDF(report)}>
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={() => handleDeleteReport(report._id)}>
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl border-dashed">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">No reports found</h3>
            <p className="text-slate-500">
              {searchQuery ? "No reports match your search criteria." : "You haven't generated or verified any reports yet."}
            </p>
          </div>
        )}
      </div>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={selectedReport?.status === 'Draft by AI' ? "Review AI Draft Report" : "Report Details"}>
        {selectedReport && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
              <p className="text-sm text-slate-500 font-medium uppercase mb-1">Patient</p>
              <p className="text-lg font-bold text-slate-900">{selectedReport.patient?.fullName}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Clinical Summary & Diagnosis</label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-900"
                value={editForm.summary}
                onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                disabled={selectedReport.status === 'Approved' || selectedReport.status === 'Sent to Patient'}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Recommended Prescription / Actions</label>
              <textarea
                className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-900"
                value={editForm.prescription}
                onChange={(e) => setEditForm({ ...editForm, prescription: e.target.value })}
                disabled={selectedReport.status === 'Approved' || selectedReport.status === 'Sent to Patient'}
              />
            </div>

            {(selectedReport.status !== 'Approved' && selectedReport.status !== 'Sent to Patient') ? (
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <Button variant="outline" onClick={() => handleSaveEdits()}>Save Draft</Button>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => handleApproveReport()}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Send to Patient
                </Button>
              </div>
            ) : (
              <div className="pt-4 flex justify-end border-t border-slate-100">
                <Button onClick={() => setIsReportModalOpen(false)}>Close</Button>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  )
}

