"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, ScanLine, FileText, CheckCircle2, Clock, AlertCircle, AlertTriangle, Edit2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function PrescriptionOCR() {
  const [uploadState, setUploadState] = useState("idle") // idle, scanning, complete
  const [previewUrl, setPreviewUrl] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Please upload an image or PDF")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    // Set preview
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target.result)
    reader.readAsDataURL(file)

    setUploadState("scanning")

    try {
      const formData = new FormData()
      formData.append("prescription", file)

      const res = await api.post("/ai/prescription-ocr", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data.success) {
        setExtractedData(res.data.data)
        setUploadState("complete")
        
        const hasUncertainMeds = res.data.data.medicines?.some(m => m.uncertain);
        // If confidence is low or Vision AI flagged uncertain handwriting, trigger editing mode automatically
        if (res.data.data.confidence < 85 || hasUncertainMeds) {
            setIsEditing(true)
            toast.error("Low confidence on handwriting. Please verify the highlighted fields manually.", { duration: 6000 })
        } else {
            setIsEditing(false)
            toast.success("Prescription analyzed successfully")
        }
      } else {
        throw new Error("Failed to extract data")
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || "Failed to analyze prescription")
      setUploadState("idle")
      setPreviewUrl(null)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset input
      }
    }
  }

  const handleScanAnother = () => {
    setUploadState("idle")
    setPreviewUrl(null)
    setExtractedData(null)
    setIsEditing(false)
  }

  const handleMedicineChange = (index, field, value) => {
    const newMeds = [...extractedData.medicines];
    newMeds[index][field] = value;
    setExtractedData({...extractedData, medicines: newMeds});
  }

  const medicines = extractedData?.medicines || []
  const confidence = extractedData?.confidence || 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prescription Scanner</h1>
        <p className="text-slate-500">Advanced OCR with AI Fallback. Extracts structured data even from messy handwriting.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Prescription</CardTitle>
            <CardDescription>Supported formats: JPG, PNG, PDF</CardDescription>
          </CardHeader>
          <CardContent>
            {uploadState === "idle" && (
              <div
                className="border-2 border-dashed border-teal-200 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50/50 transition-colors bg-slate-50 min-h-[300px]"
                onClick={handleUploadClick}
              >
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <Upload className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Click to upload</h3>
                <p className="text-sm text-slate-500">or drag and drop your file here</p>
              </div>
            )}

            {uploadState === "scanning" && (
              <div className="border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 min-h-[300px]">
                <ScanLine className="h-12 w-12 text-teal-500 mb-4 animate-pulse" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Preprocessing & Analyzing</h3>
                <p className="text-sm text-slate-500 max-w-xs">Enhancing contrast, correcting orientation, and extracting text...</p>
                <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-teal-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}

            {uploadState === "complete" && previewUrl && (
              <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 relative overflow-hidden group min-h-[300px] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Prescription Scan"
                  className="w-full h-auto max-h-[400px] object-contain rounded-lg opacity-80"
                />
                <div className="absolute inset-0 bg-teal-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="default" className="bg-white text-teal-900 hover:bg-slate-100" onClick={handleScanAnother}>
                    Scan Another Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-4">
          <Card className={`h-full ${uploadState !== 'complete' ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg whitespace-nowrap">Extracted Medications</CardTitle>
                {uploadState === 'complete' && (
                  <div className="flex flex-wrap justify-end items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${confidence >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {confidence >= 70 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {confidence}%
                    </span>
                    <span className="text-xs font-semibold bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                      {medicines.length} Found
                    </span>
                  </div>
                )}
              </div>
              {uploadState === 'complete' && extractedData?.doctor && (
                <div className="text-sm text-slate-500 mt-2">
                    <strong>Doctor:</strong> {extractedData.doctor}
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
              {uploadState !== 'complete' ? (
                <div className="p-8 flex flex-col items-center justify-center text-center h-[300px]">
                  <FileText className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-500">Upload a prescription to see extracted medications here.</p>
                </div>
              ) : medicines.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {medicines.map((med, i) => (
                    <div key={i} className={`p-4 transition-colors relative ${med.uncertain ? 'bg-amber-50/40 border-x-2 border-x-amber-400' : (isEditing ? 'bg-teal-50/30' : 'hover:bg-slate-50')}`}>
                      
                      {med.uncertain && (
                        <div className="absolute top-2 right-4 flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" /> Review Needed
                        </div>
                      )}

                      {isEditing ? (
                        <div className="space-y-3 mt-1">
                            <div>
                                <label className="text-xs text-slate-500">Medicine Name</label>
                                <Input value={med.name || ''} onChange={(e) => handleMedicineChange(i, 'name', e.target.value)} className="h-8 mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-slate-500">Dosage</label>
                                    <Input value={med.dosage || ''} onChange={(e) => handleMedicineChange(i, 'dosage', e.target.value)} className="h-8 mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Frequency</label>
                                    <Input value={med.frequency || ''} onChange={(e) => handleMedicineChange(i, 'frequency', e.target.value)} className="h-8 mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Duration</label>
                                    <Input value={med.duration || ''} onChange={(e) => handleMedicineChange(i, 'duration', e.target.value)} className="h-8 mt-1" />
                                </div>
                            </div>
                        </div>
                      ) : (
                        <>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-slate-900">{med.name || 'Unknown Medicine'}</h4>
                                {med.duration && (
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{med.duration}</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3">
                                <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-slate-500 text-xs block">Dosage</span>
                                    <span className="text-slate-700 font-medium">{med.dosage || 'N/A'}</span>
                                </div>
                                </div>
                                <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-teal-600 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-slate-500 text-xs block">Frequency</span>
                                    <span className="text-slate-700 font-medium">{med.frequency || 'N/A'}</span>
                                </div>
                                </div>
                            </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center h-[300px]">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <p className="text-slate-700 font-medium mb-1">Low Confidence Extraction</p>
                  <p className="text-slate-500 text-sm">No valid medications could be parsed. The image might be too messy or rotated heavily.</p>
                </div>
              )}
            </CardContent>
            {uploadState === 'complete' && medicines.length > 0 && (
              <CardFooter className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex gap-3">
                <Button className="w-full gap-2 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => toast.success("Saved to Reminders!")}>
                  <CheckCircle2 className="h-4 w-4" /> Save Verified Prescription
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
