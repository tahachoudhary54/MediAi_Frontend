"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2, XCircle, MapPin } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorVerification() {
  const [pendingDoctors, setPendingDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPendingDoctors = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/admin/doctors/pending')
      if (res.data.success) {
        setPendingDoctors(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch pending doctors:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingDoctors()
    const interval = setInterval(fetchPendingDoctors, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const handleVerify = async (doctorId, status) => {
    try {
      let rejectionReason = '';

      // If rejecting, ask for reason
      if (status === 'rejected') {
        rejectionReason = prompt('Please provide a reason for rejection:');
        if (!rejectionReason) {
          alert('Rejection reason is required.');
          return;
        }
      }

      // Confirm action
      const confirmMessage = status === 'approved'
        ? 'Are you sure you want to approve this doctor? They will receive an email notification.'
        : `Are you sure you want to reject this doctor?\nReason: ${rejectionReason}`;

      if (!confirm(confirmMessage)) {
        return;
      }

      const payload = { status };
      if (status === 'rejected') {
        payload.rejectionReason = rejectionReason;
      }

      console.log('Verifying doctor:', doctorId, 'with payload:', payload);
      const response = await api.put(`/admin/doctors/${doctorId}/verify`, payload);
      console.log('Verification response:', response.data);

      toast.success(`Doctor ${status === 'approved' ? 'approved' : 'rejected'} successfully! notification sent.`);
      fetchPendingDoctors();
    } catch (err) {
      console.error(`Failed to ${status} doctor:`, err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error occurred';
      toast.error(`Failed to ${status} doctor: ${errorMessage}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctor Verification</h1>
          <p className="text-slate-500">Review and approve new doctor registrations.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-slate-500">Loading pending verifications...</p>
        ) : pendingDoctors.length === 0 ? (
          <p className="text-slate-500">No pending doctors to verify.</p>
        ) : (
          pendingDoctors.map(doc => (
            <Card key={doc._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{doc.fullName}</h3>
                        <p className="text-teal-600 font-medium">{doc.specialization}</p>
                      </div>
                      <Badge variant="warning">Pending Review</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-y-2 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-900">Experience:</span> {doc.yearsOfExperience} Years</p>
                      <p><span className="font-semibold text-slate-900">License:</span> {doc.licenseNumber}</p>
                      <p className="sm:col-span-2 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {doc.hospitalName} - {doc.clinicAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex gap-4">
                    {doc.degreeCertificate ? (
                      <a href={`http://localhost:5001/uploads/${doc.degreeCertificate}`} target="_blank" rel="noreferrer" className="flex-1 p-4 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50">
                        <FileText className="h-8 w-8 text-indigo-500 mb-2" />
                        <span className="text-sm font-medium">View Degree</span>
                      </a>
                    ) : (
                      <div className="flex-1 p-4 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center opacity-50">
                        <FileText className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium">No Degree</span>
                      </div>
                    )}

                    {doc.governmentId ? (
                      <a href={`http://localhost:5001/uploads/${doc.governmentId}`} target="_blank" rel="noreferrer" className="flex-1 p-4 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50">
                        <FileText className="h-8 w-8 text-indigo-500 mb-2" />
                        <span className="text-sm font-medium">View ID</span>
                      </a>
                    ) : (
                      <div className="flex-1 p-4 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center opacity-50">
                        <FileText className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-medium">No ID</span>
                      </div>
                    )}

                    {doc.medicalLicenseProof ? (
                      <a href={`http://localhost:5001/uploads/${doc.medicalLicenseProof}`} target="_blank" rel="noreferrer" className="flex-1 p-4 border border-slate-200 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50">
                        <FileText className="h-8 w-8 text-indigo-500 mb-2" />
                        <span className="text-sm font-medium">View License</span>
                      </a>
                    ) : null}
                  </div>

                  <div className="flex lg:flex-col justify-center gap-2 lg:border-l border-slate-100 lg:pl-6">
                    <Button onClick={() => handleVerify(doc._id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </Button>
                    <Button onClick={() => handleVerify(doc._id, 'rejected')} variant="danger" className="flex-1 bg-white text-red-600 border border-red-200 hover:bg-red-50 gap-2">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
