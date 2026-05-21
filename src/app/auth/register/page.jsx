"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Upload, CheckCircle2, Clock, XCircle, AlertCircle, Image as ImageIcon, FileText, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "patient"

  const { token, authLoaded } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(searchParams.get("status") || "Pending")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "",
    age: "", sex: "", bloodGroup: "", allergies: "", medications: "", history: "", familyHistory: "", emergency: "",
    specialization: "", experience: "", license: "", clinic: "", clinicAddress: ""
  })

  const [files, setFiles] = useState({
    governmentId: null, degreeCertificate: null, medicalLicenseProof: null, profilePhoto: null
  })

  const isPatient = role === "patient"
  const isDoctor = role === "doctor"
  const currentStatus = searchParams.get("status")
  const isReverifying = isDoctor && !!currentStatus

  // If already pending/rejected and not in the "success" state yet, show success state initially for pending
  useEffect(() => {
    if (isDoctor && (currentStatus === "pending" || currentStatus === "Pending") && !isSubmitted) {
      setIsSubmitted(true)
    }
  }, [isDoctor, currentStatus, isSubmitted])

  // Pre-fill email and name if available in sessionStorage (since they just logged in)
  useEffect(() => {
    if (isReverifying && authLoaded) {
      const storedUser = sessionStorage.getItem('user')
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser)
          const u = parsed.user || parsed
          setFormData(prev => ({
            ...prev,
            firstName: u.fullName?.split(' ')[0] || "",
            lastName: u.fullName?.split(' ').slice(1).join(' ') || "",
            email: u.email || ""
          }))
        } catch (e) { }
      }
    }
  }, [isReverifying, authLoaded])

  // Fix React warning: Move navigation side-effect to useEffect
  useEffect(() => {
    if (role === "admin") {
      router.push("/auth/login?role=admin")
    }
  }, [role, router])

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value })

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim()

      if (isDoctor) {
        const payload = new FormData()
        payload.append('fullName', fullName)
        payload.append('email', formData.email)
        // Only send password if NOT reverifying
        if (!isReverifying) {
          payload.append('password', formData.password)
        }
        payload.append('phone', formData.phone)
        payload.append('specialization', formData.specialization)
        payload.append('yearsOfExperience', formData.experience)
        payload.append('licenseNumber', formData.license)
        payload.append('hospitalName', formData.clinic)
        payload.append('clinicAddress', formData.clinicAddress)

        if (files.governmentId) payload.append('governmentId', files.governmentId)
        if (files.degreeCertificate) payload.append('degreeCertificate', files.degreeCertificate)
        if (files.medicalLicenseProof) payload.append('medicalLicenseProof', files.medicalLicenseProof)
        if (files.profilePhoto) payload.append('profilePhoto', files.profilePhoto)

        let res;
        if (isReverifying) {
          // Call reverify endpoint
          res = await api.put('/auth/doctor/reverify', payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        } else {
          // Call register endpoint
          res = await api.post('/auth/doctor/register', payload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }

        console.log('Doctor Request Response:', res.data)

        if (res.data.success) {
          setIsSubmitted(true)
          setVerificationStatus(res.data.verificationStatus || "pending")
        }
      } else {
        const payload = {
          fullName,
          email: formData.email,
          password: formData.password,
          age: formData.age,
          sex: (formData.sex || "").toLowerCase(),
          bloodGroup: formData.bloodGroup,
          allergies: formData.allergies,
          currentMedications: formData.medications,
          previousDiseaseHistory: formData.history,
          familyDiseaseHistory: formData.familyHistory,
          emergencyContact: formData.emergency
        }

        const res = await api.post('/auth/register', payload)

        console.log('Patient Registration Response:', res.data)

        if (res.data.success) {
          console.log('Patient registered, role:', res.data.role)
          sessionStorage.setItem('token', res.data.token)
          sessionStorage.setItem('role', res.data.role)
          sessionStorage.setItem('user', JSON.stringify(res.data))

          console.log('Stored role in sessionStorage:', sessionStorage.getItem('role'))
          console.log('Redirecting to:', `/${res.data.role}/dashboard`)

          router.push(`/${res.data.role}/dashboard`)
        }
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    }
  }

  // Prevent rendering if role is admin (will be redirected by useEffect)
  if (role === "admin") {
    return null;
  }

  // Render Success State for Doctor
  if (isSubmitted && isDoctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full">
          <Card className="text-center shadow-md border-slate-200">
            <CardContent className="p-8 flex flex-col items-center">
              {verificationStatus === "pending" || verificationStatus === "Pending" ? (
                <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                  <Clock className="h-10 w-10 text-amber-500" />
                </div>
              ) : verificationStatus === "approved" || verificationStatus === "Approved" ? (
                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
              ) : (
                <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              )}

              <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Request Submitted</h2>

              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-medium text-slate-500">Status:</span>
                <Badge variant={
                  (verificationStatus === "pending" || verificationStatus === "Pending") ? "warning" :
                    (verificationStatus === "approved" || verificationStatus === "Approved") ? "success" : "destructive"
                }>
                  {(verificationStatus === "pending" || verificationStatus === "Pending") && "Pending Admin Approval"}
                  {(verificationStatus === "approved" || verificationStatus === "Approved") && "Approved"}
                  {(verificationStatus === "rejected" || verificationStatus === "Rejected") && "Rejected"}
                </Badge>
              </div>

              {(verificationStatus === "pending" || verificationStatus === "Pending") && (
                <p className="text-slate-600 text-sm mb-8">
                  Your profile is under admin review. Once verified, you will receive an email and gain access to your dashboard.
                </p>
              )}

              {(verificationStatus === "rejected" || verificationStatus === "Rejected") && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-sm text-left w-full mb-8">
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <AlertCircle className="h-4 w-4" /> Rejection Reason
                  </div>
                  <p>Please re-upload your documents and ensure they are clear.</p>
                </div>
              )}

              <div className="w-full flex flex-col gap-3">
                {(verificationStatus === "rejected" || verificationStatus === "Rejected") ? (
                  <Button onClick={() => setIsSubmitted(false)} className="w-full">Update Details</Button>
                ) : (verificationStatus === "approved" || verificationStatus === "Approved") ? (
                  <Button onClick={() => router.push("/doctor/dashboard")} className="w-full bg-teal-600 hover:bg-teal-700">Go to Dashboard</Button>
                ) : (
                  <div className="space-y-4 w-full">
                    <Button onClick={() => router.push("/")} variant="outline" className="w-full">Return to Home</Button>
                    <p className="text-[10px] text-slate-400">Status is updated automatically every 10 seconds</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Effect to poll for verification status changes while on success screen
  useEffect(() => {
    let interval;
    if (isSubmitted && isDoctor && (verificationStatus === "pending" || verificationStatus === "Pending")) {
      interval = setInterval(async () => {
        try {
          const res = await api.get('/auth/me')
          if (res.data.success) {
            const status = res.data.verificationStatus || res.data.data?.verificationStatus
            if (status && status !== verificationStatus) {
              setVerificationStatus(status)
              // Update session storage too
              const stored = sessionStorage.getItem('user')
              if (stored) {
                const parsed = JSON.parse(stored)
                if (parsed.user) parsed.user.verificationStatus = status
                else parsed.verificationStatus = status
                sessionStorage.setItem('user', JSON.stringify(parsed))
              }
            }
          }
        } catch (e) { }
      }, 10000) // Poll every 10s
    }
    return () => clearInterval(interval)
  }, [isSubmitted, isDoctor, verificationStatus])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MediAI</span>
          </Link>
        </div>

        <Card className="w-full shadow-sm">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>
              Registering as a <span className="font-semibold text-teal-600 capitalize">{role}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Basic Details - Both Roles */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  {!isReverifying && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}
                  <Button type="button" className="w-full" onClick={() => setStep(2)}>Continue</Button>
                </div>
              )}

              {/* Patient Specific Details */}
              {isPatient && step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" type="number" min="0" max="120" value={formData.age} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex</Label>
                      <select id="sex" value={formData.sex} onChange={handleChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <select id="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (if any)</Label>
                    <Input id="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Penicillin" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Current Medications</Label>
                    <Input id="medications" value={formData.medications} onChange={handleChange} placeholder="e.g. Metformin 500mg" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="history">Previous Disease History</Label>
                    <Input id="history" value={formData.history} onChange={handleChange} placeholder="e.g. Asthma, Hypertension" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyHistory">Family Disease History</Label>
                    <Input id="familyHistory" value={formData.familyHistory} onChange={handleChange} placeholder="e.g. Diabetes in mother" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input id="emergency" value={formData.emergency} onChange={handleChange} placeholder="Name and Phone Number" required />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" className="w-full">Create Account</Button>
                  </div>
                </div>
              )}

              {/* Doctor Specific Details */}
              {isDoctor && step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  {/* Professional Details Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-semibold text-slate-900">Professional Details</h3>
                      <p className="text-xs text-slate-500">Provide your medical qualifications.</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="specialization">Specialization <span className="text-red-500">*</span></Label>
                        <select id="specialization" value={formData.specialization} onChange={handleChange} required className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600">
                          <option value="">Select Speciality</option>
                          <option value="cardiology">Cardiology</option>
                          <option value="dermatology">Dermatology</option>
                          <option value="general">General Practice</option>
                          <option value="neurology">Neurology</option>
                          <option value="pediatrics">Pediatrics</option>
                          <option value="psychiatry">Psychiatry</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience <span className="text-red-500">*</span></Label>
                        <Input id="experience" type="number" value={formData.experience} onChange={handleChange} min="0" required placeholder="e.g. 10" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="license">Medical License Number <span className="text-red-500">*</span></Label>
                        <Input id="license" value={formData.license} onChange={handleChange} required placeholder="License number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                        <Input id="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. +1 (555) 000-0000" />
                      </div>
                    </div>
                  </div>

                  {/* Clinic Details Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-semibold text-slate-900">Clinic Details</h3>
                      <p className="text-xs text-slate-500">Where do you currently practice?</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clinic">Hospital / Clinic Name <span className="text-red-500">*</span></Label>
                      <Input id="clinic" value={formData.clinic} onChange={handleChange} required placeholder="e.g. City General Hospital" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clinicAddress">Clinic Address <span className="text-red-500">*</span></Label>
                      <Input id="clinicAddress" value={formData.clinicAddress} onChange={handleChange} required placeholder="Full address" />
                    </div>
                  </div>

                  {/* Document Uploads Section */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-semibold text-slate-900">Verification Documents</h3>
                      <p className="text-xs text-slate-500">Securely upload documents for admin verification (PDF/JPG/PNG).</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Government ID */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Government ID <span className="text-red-500">*</span></Label>
                        <Label htmlFor="file-gov" className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors group">
                          <input type="file" id="file-gov" className="hidden" onChange={(e) => handleFileChange(e, 'governmentId')} />
                          <div className="p-2 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-100 transition-colors">
                            <Upload className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{files.governmentId ? files.governmentId.name : 'Upload ID Proof'}</span>
                          <span className="text-xs text-slate-400 mt-1">Max file size: 5MB</span>
                        </Label>
                      </div>

                      {/* Medical Degree */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Medical Degree <span className="text-red-500">*</span></Label>
                        <Label htmlFor="file-deg" className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors group">
                          <input type="file" id="file-deg" className="hidden" onChange={(e) => handleFileChange(e, 'degreeCertificate')} />
                          <div className="p-2 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-100 transition-colors">
                            <FileText className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{files.degreeCertificate ? files.degreeCertificate.name : 'Upload Certificate'}</span>
                          <span className="text-xs text-slate-400 mt-1">Max file size: 5MB</span>
                        </Label>
                      </div>

                      {/* Medical License */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Medical License Proof <span className="text-red-500">*</span></Label>
                        <Label htmlFor="file-lic" className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors group">
                          <input type="file" id="file-lic" className="hidden" onChange={(e) => handleFileChange(e, 'medicalLicenseProof')} />
                          <div className="p-2 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-100 transition-colors">
                            <FileText className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{files.medicalLicenseProof ? files.medicalLicenseProof.name : 'Upload License'}</span>
                          <span className="text-xs text-slate-400 mt-1">Valid registration proof</span>
                        </Label>
                      </div>

                      {/* Profile Photo */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Profile Photo <span className="text-slate-400 font-normal">(Optional)</span></Label>
                        <Label htmlFor="file-pho" className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors group">
                          <input type="file" id="file-pho" className="hidden" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                          <div className="p-2 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-100 transition-colors">
                            <ImageIcon className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{files.profilePhoto ? files.profilePhoto.name : 'Upload Photo'}</span>
                          <span className="text-xs text-slate-400 mt-1">Clear headshot</span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                      <strong>Important:</strong> Doctors must be verified by admin before accessing consultations. This process typically takes 1-2 business days.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>Back</Button>
                    <Button type="submit" className="w-full">Submit Verification Request</Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 p-4">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href={`/auth/login?role=${role}`} className="text-teal-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
