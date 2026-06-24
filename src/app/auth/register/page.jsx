"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Upload, CheckCircle2, Clock, XCircle, AlertCircle, Image as ImageIcon, FileText, Eye, EyeOff, X } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "patient"

  const { token, authLoaded, login } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState(searchParams.get("status") || "Pending")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(60) // Start with 60s cooldown initially when they enter step 3
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", phone: "",
    age: "", sex: "", bloodGroup: "", allergies: "", medications: "", history: "", familyHistory: "", emergencyName: "", emergencyPhone: "",
    specialization: "", experience: "", license: "", clinic: "", clinicAddress: ""
  })

  const [files, setFiles] = useState({
    governmentId: null, degreeCertificate: null, medicalLicenseProof: null, profilePhoto: null
  })

  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [cameraStream, setCameraStream] = useState(null)


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

  // Effect to handle OTP resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error("Could not access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "profile_capture.jpg", { type: "image/jpeg" });
          setFiles({ ...files, profilePhoto: file });
          stopCamera();
        } else {
          toast.error("Failed to capture image. Please try again.");
        }
      }, 'image/jpeg');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value })

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] })
    }
  }

  const clearProfilePhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFiles({ ...files, profilePhoto: null });
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");

    try {
      const payload = {
        email: formData.email,
        role: isDoctor ? 'doctor' : 'patient'
      };
      
      const res = await api.post('/auth/resend-otp', payload);
      
      if (res.data.success) {
        setResendTimer(60); // 60 seconds cooldown
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to resend OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const payload = {
        email: formData.email,
        otp: otp,
        role: isDoctor ? 'doctor' : 'patient'
      }

      const res = await api.post('/auth/verify-otp', payload)

      if (res.data.success) {
        if (isDoctor) {
          sessionStorage.setItem('token', res.data.token)
          sessionStorage.setItem('role', res.data.role)
          sessionStorage.setItem('user', JSON.stringify(res.data))
          setIsSubmitted(true)
          setVerificationStatus(res.data.verificationStatus || "pending")
        } else {
          login(res.data, res.data.token, res.data.role)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "OTP Verification failed. Please try again.")
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

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
          res = await api.put('/auth/doctor/reverify', payload)
        } else {
          // Call register endpoint
          res = await api.post('/auth/doctor/register', payload)
        }

        console.log('Doctor Request Response:', res.data)

        if (res.data.success) {
          if (res.data.requireOtp) {
            setStep(3)
          } else {
            setIsSubmitted(true)
            setVerificationStatus(res.data.verificationStatus || "pending")
            toast.success("Verification request submitted successfully!")
          }
        }
      } else {
        const payload = new FormData();
        payload.append('fullName', fullName);
        payload.append('email', formData.email);
        payload.append('password', formData.password);
        payload.append('age', formData.age);
        payload.append('sex', (formData.sex || "").toLowerCase());
        payload.append('bloodGroup', formData.bloodGroup);
        payload.append('allergies', formData.allergies);
        payload.append('currentMedications', formData.medications);
        payload.append('previousDiseaseHistory', formData.history);
        payload.append('familyDiseaseHistory', formData.familyHistory);
        payload.append('emergencyContact', JSON.stringify({
          name: formData.emergencyName,
          phone: formData.emergencyPhone
        }));

        if (files.profilePhoto) {
          payload.append('profilePhoto', files.profilePhoto);
        }

        const res = await api.post('/auth/register', payload)

        console.log('Patient Registration Response:', res.data)

        if (res.data.success) {
          if (res.data.requireOtp) {
            setStep(3)
          } else {
            console.log('Patient registered, role:', res.data.role)
            login(res.data, res.data.token, res.data.role)
          }
        }
      }
    } catch (err) {
      console.error("Registration error:", err)
      const errorMsg = err.response?.data?.message || err.message || "Registration failed. Please try again."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
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
            <form onSubmit={step === 3 ? handleVerifyOtp : handleRegister} className="space-y-6">
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

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Emergency Contact Name <span className="text-red-500">*</span></Label>
                      <Input id="emergencyName" value={formData.emergencyName} onChange={handleChange} placeholder="e.g. Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone <span className="text-red-500">*</span></Label>
                      <Input id="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} placeholder="e.g. +1 (555) 000-0000" required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-2">
                      <h3 className="text-lg font-semibold text-slate-900">Profile Photo</h3>
                      <p className="text-xs text-slate-500">Personalize your account (Optional).</p>
                    </div>
                    <div className="space-y-2 w-full">
                      {showCamera ? (
                        <div className="border-2 border-slate-200 rounded-lg p-4 flex flex-col items-center">
                          <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-lg object-cover bg-black aspect-video mb-4"></video>
                          <canvas ref={canvasRef} className="hidden"></canvas>
                          <div className="flex gap-4">
                            <Button type="button" onClick={capturePhoto} className="bg-teal-600 hover:bg-teal-700">Capture</Button>
                            <Button type="button" onClick={stopCamera} variant="outline">Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Label htmlFor="file-pho-patient" className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors group">
                          <input type="file" id="file-pho-patient" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                          {files.profilePhoto ? (
                            <div className="flex flex-col items-center relative">
                              <button type="button" onClick={clearProfilePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors z-10">
                                <X className="h-3 w-3" />
                              </button>
                              <img src={URL.createObjectURL(files.profilePhoto)} alt="Preview" className="w-20 h-20 object-cover rounded-full mb-3 border-2 border-teal-500 shadow-md" />
                              <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700 transition-colors">Change Photo</span>
                            </div>
                          ) : (
                            <>
                              <div className="p-2 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-100 transition-colors">
                                <ImageIcon className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                              </div>
                              <span className="text-sm font-medium text-slate-700">Upload Photo</span>
                              <span className="text-xs text-slate-400 mt-1">Clear headshot</span>
                            </>
                          )}
                        </Label>
                      )}
                      
                      {!showCamera && (
                        <div className="text-center mt-2">
                          <Button type="button" variant="ghost" onClick={startCamera} className="text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                            Or take a photo with your camera
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
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
                        {showCamera ? (
                          <div className="border-2 border-slate-200 rounded-lg p-4 flex flex-col items-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full max-w-sm rounded-lg object-cover bg-black aspect-video mb-4"></video>
                            <canvas ref={canvasRef} className="hidden"></canvas>
                            <div className="flex gap-4">
                              <Button type="button" onClick={capturePhoto} className="bg-teal-600 hover:bg-teal-700">Capture</Button>
                              <Button type="button" onClick={stopCamera} variant="outline">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Label htmlFor="file-pho" className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-teal-50 hover:border-teal-200 transition-colors group">
                            <input type="file" id="file-pho" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                            {files.profilePhoto ? (
                              <div className="flex flex-col items-center relative">
                                <button type="button" onClick={clearProfilePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors z-10">
                                  <X className="h-3 w-3" />
                                </button>
                                <img src={URL.createObjectURL(files.profilePhoto)} alt="Preview" className="w-20 h-20 object-cover rounded-full mb-3 border-2 border-teal-500 shadow-md" />
                                <span className="text-sm font-medium text-teal-600 group-hover:text-teal-700 transition-colors">Change Photo</span>
                              </div>
                            ) : (
                              <>
                                <div className="p-2 bg-slate-100 rounded-full mb-2 group-hover:bg-teal-100 transition-colors">
                                  <ImageIcon className="h-5 w-5 text-slate-500 group-hover:text-teal-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Upload Photo</span>
                                <span className="text-xs text-slate-400 mt-1">Clear headshot</span>
                              </>
                            )}
                          </Label>
                        )}
                        {!showCamera && (
                          <div className="text-center mt-2">
                            <Button type="button" variant="ghost" onClick={startCamera} className="text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                              Or take a photo with your camera
                            </Button>
                          </div>
                        )}
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
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        "Submit Verification Request"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* OTP Verification Step */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <div className="mx-auto bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="h-6 w-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Verify your email</h3>
                    <p className="text-sm text-slate-500">We've sent a 6-digit verification code to <br /><span className="font-semibold text-slate-700">{formData.email}</span></p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="text-center block">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="text-center text-2xl tracking-widest h-14"
                        placeholder="000000"
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-lg">Verify & Continue</Button>
                    <div className="text-center pt-2">
                      <p className="text-sm text-slate-500 mb-2">Didn't receive the code?</p>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleResendOtp} 
                        disabled={resendTimer > 0}
                        className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 w-full"
                      >
                        {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : "Resend Verification Code"}
                      </Button>
                    </div>
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
