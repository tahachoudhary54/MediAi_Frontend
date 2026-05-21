"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { User, Mail, Phone, GraduationCap, Award, Building, MapPin, Edit3, Upload, X, Camera, Shield, Check } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

export default function DoctorSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [savedForm, setSavedForm] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    hospitalName: "",
    clinicAddress: "",
    bio: "",
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("user")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const u = parsed.user || parsed
          const initial = {
            fullName: u.fullName || "",
            email: u.email || "",
            phone: u.phone || "",
            specialization: u.specialization || "",
            licenseNumber: u.licenseNumber || "",
            yearsOfExperience: u.yearsOfExperience || "",
            hospitalName: u.hospitalName || "",
            clinicAddress: u.clinicAddress || "",
            bio: u.bio || "",
          }
          setForm(initial)
          setSavedForm(initial)
          // Load avatar
          if (u.avatar) {
            setAvatarPreview(
              u.avatar.startsWith("http") ? u.avatar : `${BACKEND_URL}/uploads/${u.avatar}`
            )
          }
        } catch (e) {
          console.error("Failed to parse session user")
        }
      }
    }
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  const handleDiscard = () => {
    if (savedForm) setForm(savedForm)
    setIsEditing(false)
  }

  // ── Photo upload ──────────────────────────────────────────────
  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate type & size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, etc.)")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB")
      return
    }

    // Instant local preview via FileReader
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)

    // Upload to backend
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append("avatar", file)
      const res = await api.patch("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      if (res.data.success) {
        toast.success("Profile photo updated!")
        // Persist avatar filename in session storage
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        base.avatar = res.data.data.avatar
        sessionStorage.setItem("user", JSON.stringify({ ...stored, ...base }))
        // Trigger AuthContext update in real-time
        window.dispatchEvent(new CustomEvent("profileUpdated"))
        // Update preview to the server URL
        setAvatarPreview(`${BACKEND_URL}/uploads/${res.data.data.avatar}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload photo")
    } finally {
      setIsUploading(false)
      // reset so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // ── Profile save ─────────────────────────────────────────────
  const handleSave = async () => {
    try {
      setIsLoading(true)
      const res = await api.patch("/auth/profile", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        yearsOfExperience: form.yearsOfExperience,
        hospitalName: form.hospitalName,
        clinicAddress: form.clinicAddress,
        bio: form.bio,
      })
      if (res.data.success) {
        toast.success("Profile updated successfully!")
        setSavedForm({ ...form })
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = { ...base, ...res.data.data }
        sessionStorage.setItem("user", JSON.stringify(updated))
        // Trigger AuthContext update in real-time
        window.dispatchEvent(new CustomEvent("profileUpdated"))
        setIsEditing(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-xs font-medium text-slate-900 truncate max-w-[150px]">{value || "—"}</span>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Left: Profile Summary ── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <Card className="overflow-hidden border-slate-200 shadow-sm h-full">
            <div className="h-28 bg-teal-50 border-b border-teal-100"></div>

            {/* Avatar with camera overlay */}
            <div className="relative -mt-14 flex justify-center">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full border-4 border-white bg-teal-100 flex items-center justify-center shadow-sm overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-teal-600" />
                  )}
                </div>
                {/* Camera overlay on hover */}
                <button
                  onClick={handlePhotoClick}
                  disabled={isUploading}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploading ? (
                    <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
              </div>
            </div>

            <CardContent className="pt-4 text-center pb-6 px-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900 truncate max-w-[160px]">{form.fullName || "Doctor"}</h2>
                <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 uppercase tracking-wide">
                  Doctor
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-slate-500">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                Online
              </div>

              <div className="mt-8 space-y-1 text-sm text-left">
                <InfoRow icon={Mail} label="Email" value={form.email} />
                <InfoRow icon={Phone} label="Phone" value={form.phone} />
                <InfoRow icon={GraduationCap} label="Specialization" value={form.specialization} />
                <InfoRow icon={Award} label="License No." value={form.licenseNumber} />
                <InfoRow icon={Building} label="Hospital" value={form.hospitalName} />
                <InfoRow icon={MapPin} label="Clinic Address" value={form.clinicAddress} />
              </div>

              <Link href="/doctor/settings/security" className="block w-full mt-8">
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
                  <Shield className="mr-2 h-4 w-4" /> Security Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Edit Form ── */}
        <div className="flex-1">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-50">
              <div>
                <CardTitle className="text-xl text-slate-900">Professional Information</CardTitle>
                <CardDescription className="text-slate-500">
                  {isEditing ? "Make changes and click Save Changes." : "Update your professional and clinic details."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handlePhotoClick}
                      disabled={isUploading}
                      className="text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100 shadow-sm transition-colors"
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                          Uploading...
                        </span>
                      ) : (
                        <><Upload className="mr-2 h-4 w-4" /> Change Photo</>
                      )}
                    </Button>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
                    >
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDiscard}
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-medium"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pt-8">
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-700 font-medium text-sm">Full Name</Label>
                  <Input id="fullName" value={form.fullName} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email Address</Label>
                  <Input id="email" type="email" value={form.email} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700 font-medium text-sm">Phone Number</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={handleChange} disabled={!isEditing} placeholder="+92 312 3456789" className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization" className="text-slate-700 font-medium text-sm">Specialization</Label>
                  <Input id="specialization" value={form.specialization} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-slate-700 font-medium text-sm">License Number</Label>
                  <Input id="licenseNumber" value={form.licenseNumber} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience" className="text-slate-700 font-medium text-sm">Years of Experience</Label>
                  <Input id="yearsOfExperience" type="number" value={form.yearsOfExperience} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hospitalName" className="text-slate-700 font-medium text-sm">Hospital Affiliation</Label>
                  <Input id="hospitalName" value={form.hospitalName} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicAddress" className="text-slate-700 font-medium text-sm">Clinic Address</Label>
                  <Input id="clinicAddress" value={form.clinicAddress} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2 mt-4">
                <Label htmlFor="bio" className="text-slate-700 font-medium text-sm">Professional Bio</Label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Write a brief professional description about your credentials and specialty..."
                  className="w-full p-3 rounded-md border border-slate-200 text-sm text-slate-900 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 disabled:text-slate-600 disabled:cursor-default resize-none h-28"
                />
              </div>

              {/* Save / Discard */}
              {isEditing && (
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-50">
                  <Button variant="outline" onClick={handleDiscard} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                    Discard
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-teal-600 hover:bg-teal-700 px-8 text-white shadow-sm transition-all h-10 font-medium"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <><Check className="mr-2 h-4 w-4" /> Save Changes</>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
