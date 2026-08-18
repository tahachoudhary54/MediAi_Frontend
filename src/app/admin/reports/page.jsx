"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, FileText, Eye, Download, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import api from "@/lib/api"
import jsPDF from "jspdf"
import { toast } from "react-hot-toast"

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [selectedReport, setSelectedReport] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports')
        if (res.data.success) {
          setReports(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
      } catch (err) {
        console.error("Failed to fetch admin reports:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReports()
  }, [])

  const handleDownload = (report) => {
    try {
      const doc = new jsPDF()

      doc.setFontSize(22)
      doc.setTextColor(13, 148, 136) // teal-600
      doc.text("MediAI Consultation Report", 20, 20)

      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139) // slate-500
      doc.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, 20, 30)

      doc.setTextColor(15, 23, 42) // slate-900
      doc.setFontSize(14)
      doc.text("Patient Information", 20, 45)
      doc.setFontSize(11)
      doc.text(`Name: ${report.patient?.fullName || "N/A"}`, 20, 55)

      doc.setFontSize(14)
      doc.text("Doctor Information", 120, 45)
      doc.setFontSize(11)
      doc.text(`Name: Dr. ${report.doctor?.fullName || "N/A"}`, 120, 55)
      doc.text(`Specialization: ${report.doctor?.specialization || "N/A"}`, 120, 62)

      doc.line(20, 70, 190, 70)

      doc.setFontSize(14)
      doc.text("Clinical Summary", 20, 85)
      doc.setFontSize(11)
      const summaryLines = doc.splitTextToSize(report.summary || "No summary provided.", 170)
      doc.text(summaryLines, 20, 95)

      let nextY = 95 + (summaryLines.length * 7) + 10

      doc.setFontSize(14)
      doc.text("Prescription & Recommendations", 20, nextY)
      doc.setFontSize(11)
      const rxLines = doc.splitTextToSize(report.prescription || "No prescriptions provided.", 170)
      doc.text(rxLines, 20, nextY + 10)

      doc.save(`MediAI_Report_${report.patient?.fullName?.replace(/\s+/g, '_') || 'Patient'}_${new Date(report.createdAt).toISOString().split('T')[0]}.pdf`)
      toast.success("Report downloaded successfully!")
    } catch (err) {
      console.error(err)
      toast.error("Failed to generate PDF")
    }
  }

  const handleView = (report) => {
    setSelectedReport(report)
    setIsViewModalOpen(true)
  }

  const filteredReports = reports.filter(r =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.doctor?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentReports = filteredReports.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const getPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medical Reports</h1>
          <p className="text-slate-500">Monitor and manage all medical reports across the platform.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search report, patient, or doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full sm:w-64 rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Details</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">Loading reports...</TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">No reports found.</TableCell>
                </TableRow>
              ) : (
                currentReports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-teal-600" />
                        <span className="font-medium text-slate-900">{report.title || "Untitled Report"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{report.patient?.fullName || "N/A"}</TableCell>
                    <TableCell className="text-slate-700">{report.doctor?.fullName || "N/A"}</TableCell>
                    <TableCell className="text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'Approved' || report.status === 'Sent to Patient' ? 'success' : 'warning'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" title="View" onClick={() => handleView(report)}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownload(report)}>
                          <Download className="h-4 w-4 text-slate-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {filteredReports.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-4 gap-4">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{indexOfFirstItem + 1}</span> to <span className="font-medium text-slate-900">{Math.min(indexOfLastItem, filteredReports.length)}</span> of <span className="font-medium text-slate-900">{filteredReports.length}</span> entries
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="flex items-center gap-1 hidden md:flex">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-[2rem] px-2 ${currentPage === page ? "bg-teal-600 text-white hover:bg-teal-700" : "text-slate-600"}`}
                    >
                      {page}
                    </Button>
                  )
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 gap-1 pr-2.5"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="View Medical Report">
        {selectedReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Patient</p>
                <p className="font-medium text-slate-900">{selectedReport.patient?.fullName || "Unknown"}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor</p>
                <p className="font-medium text-slate-900">Dr. {selectedReport.doctor?.fullName || "Unknown"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Clinical Summary</label>
                <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap min-h-[100px]">
                  {selectedReport.summary || "No summary provided."}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-900 block mb-2">Prescription & Recommendations</label>
                <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap min-h-[100px]">
                  {selectedReport.prescription || "No prescription provided."}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
