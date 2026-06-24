"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { User, Mail, Phone, Calendar, Droplet, MapPin, Edit3, Upload, MoreVertical, Check, Shield, X, Camera, ShieldAlert, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import api from "@/lib/api"
import { toast } from "react-hot-toast"
import ScannerUI from "@/components/shared/ScannerUI"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

export default function ProfileSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [savedForm, setSavedForm] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [userEmergencies, setUserEmergencies] = useState([])
  const [isEmergenciesLoading, setIsEmergenciesLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    bloodGroup: "",
    address: "",
    sex: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  })

  useEffect(() => {
    const loadProfile = () => {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("user")
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const u = parsed.user || parsed
            const ec = u.emergencyContact || {}
            const initial = {
              fullName: u.fullName || u.name || "",
              email: u.email || "",
              phone: u.phone || "",
              dob: u.dob || "",
              bloodGroup: u.bloodGroup || "",
              address: u.address || "",
              sex: u.sex || "",
              emergencyName: ec.name || "",
              emergencyPhone: ec.phone || "",
              emergencyRelation: ec.relation || "",
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
    };

    loadProfile();
    window.addEventListener("profileUpdated", loadProfile);

    const fetchEmergencies = async () => {
      setIsEmergenciesLoading(true)
      try {
        const res = await api.get('/emergency/patient')
        if (res.data.success) {
          setUserEmergencies(res.data.data)
        }
      } catch (err) {
        console.error("Failed to fetch emergency history", err)
      } finally {
        setIsEmergenciesLoading(false)
      }
    }
    fetchEmergencies()

    return () => window.removeEventListener("profileUpdated", loadProfile);
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
        sex: form.sex,
        address: form.address,
        dob: form.dob,
        bloodGroup: form.bloodGroup,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation,
        },
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
      <span className="text-xs font-medium text-slate-900">{value || "—"}</span>
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
                <h2 className="text-xl font-bold text-slate-900">{form.fullName || "Patient"}</h2>
                <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-800 uppercase tracking-wide">
                  Patient
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-slate-500">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                Online
              </div>

              <div className="mt-8 space-y-1 text-sm text-left">
                <InfoRow icon={Mail} label="Email" value={form.email} />
                <InfoRow icon={Phone} label="Phone" value={form.phone} />
                <InfoRow icon={Calendar} label="Date of Birth" value={form.dob} />
                <InfoRow icon={Droplet} label="Blood Group" value={form.bloodGroup} />
                <InfoRow icon={MapPin} label="Address" value={form.address} />
              </div>

              <Link href="/patient/profile/security" className="block w-full mt-8">
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Shield className="mr-2 h-4 w-4" /> Security Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Edit Form & History ── */}
        <div className="flex-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-50">
              <div>
                <CardTitle className="text-xl text-slate-900">Personal Information</CardTitle>
                <CardDescription className="text-slate-500">
                  {isEditing ? "Make changes and click Save Changes." : "Update your personal details."}
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
                  <Label htmlFor="dob" className="text-slate-700 font-medium text-sm">Date of Birth</Label>
                  <Input id="dob" value={form.dob} onChange={handleChange} disabled={!isEditing} placeholder="DD/MM/YYYY" className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex" className="text-slate-700 font-medium text-sm">Gender</Label>
                  <select
                    id="sex"
                    value={form.sex}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 disabled:text-slate-600 disabled:cursor-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup" className="text-slate-700 font-medium text-sm">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 disabled:text-slate-600 disabled:cursor-default focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-colors"
                  >
                    <option value="">Select blood group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-700 font-medium text-sm">Address</Label>
                  <Input id="address" value={form.address} onChange={handleChange} disabled={!isEditing} className="bg-slate-50/50 border-slate-200 focus:border-teal-500 focus:ring-teal-500 disabled:text-slate-600 disabled:cursor-default" />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-6 bg-slate-50/80 rounded-xl border border-slate-100/60 shadow-sm mt-4">
                <h3 className="text-sm font-semibold text-teal-700 mb-4 tracking-wide">Emergency Contact</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName" className="text-slate-600 text-xs font-medium">Contact Name</Label>
                    <Input id="emergencyName" value={form.emergencyName} onChange={handleChange} disabled={!isEditing} className="bg-white border-slate-200 text-sm h-9 disabled:text-slate-600 disabled:cursor-default" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-slate-600 text-xs font-medium">Phone Number</Label>
                    <Input id="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} disabled={!isEditing} className="bg-white border-slate-200 text-sm h-9 disabled:text-slate-600 disabled:cursor-default" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelation" className="text-slate-600 text-xs font-medium">Relationship</Label>
                    <Input id="emergencyRelation" value={form.emergencyRelation} onChange={handleChange} disabled={!isEditing} className="bg-white border-slate-200 text-sm h-9 disabled:text-slate-600 disabled:cursor-default" />
                  </div>
                </div>
              </div>

              {/* Save / Discard */}
              {isEditing && (
                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={handleDiscard} className="border-slate-200 text-slate-600 hover:bg-slate-50">
                    Discard
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-teal-600 hover:bg-teal-700 px-8 text-white shadow-sm transition-all h-10"
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

          {/* Emergency Opt-In Settings */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" /> Emergency Opt-In
              </CardTitle>
              <CardDescription className="text-slate-500">
                Allow first responders to scan your face and access your emergency contacts and medical profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl mb-6">
                <div>
                  <h4 className="font-medium text-slate-900 text-sm">Face Scan Discovery</h4>
                  <p className="text-xs text-slate-500 mt-1">If enabled, you must provide a clear face photo below.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={async (e) => {
                      const enabled = e.target.checked;
                      try {
                        await api.patch('/auth/emergency-profile', { emergencyEnabled: enabled });
                        toast.success(`Emergency discovery ${enabled ? 'enabled' : 'disabled'}`);
                      } catch (err) {
                        toast.error("Failed to update status");
                        e.target.checked = !enabled; // revert UI
                      }
                    }}
                    // Defaulting to unchecked for now, in a real app we'd load this from `user` state
                    // We can safely assume it's disabled initially or we'd need to add it to the state
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-slate-900 text-sm mb-3">Emergency Facial Recognition Setup</h4>
                <div className="bg-slate-900 p-1 rounded-2xl max-w-sm mx-auto">
                    {/* We lazily import ScannerUI to avoid SSR issues if it uses browser APIs heavily, but we can just require it normally if it's "use client" */}
                    <ScannerUI 
                      buttonText="Register Face"
                      onCapture={async (file) => {
                        const formData = new FormData();
                        formData.append('faceImage', file);
                        try {
                          await api.patch('/auth/emergency-profile', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          toast.success("Facial data secured for emergencies");
                        } catch (err) {
                          toast.error("Failed to register face");
                        }
                      }}
                      onUpload={async (file) => {
                        const formData = new FormData();
                        formData.append('faceImage', file);
                        try {
                          await api.patch('/auth/emergency-profile', formData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          toast.success("Facial data secured for emergencies");
                        } catch (err) {
                          toast.error("Failed to register face");
                        }
                      }}
                    />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency History Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" /> Emergency History
              </CardTitle>
              <CardDescription className="text-slate-500">Your past SOS alerts and their statuses.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isEmergenciesLoading ? (
                <p className="text-slate-500 py-2">Loading emergency history...</p>
              ) : userEmergencies.length === 0 ? (
                <p className="text-slate-500 py-2">No emergency history found.</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1 font-medium">Total SOS Raised</p>
                      <p className="text-2xl font-bold text-slate-900">{userEmergencies.length}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1 font-medium">Resolved</p>
                      <p className="text-2xl font-bold text-emerald-700">{userEmergencies.filter(e => e.status === 'resolved').length}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-600 mb-1 font-medium">Pending/Active</p>
                      <p className="text-2xl font-bold text-amber-700">{userEmergencies.filter(e => e.status !== 'resolved').length}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1 font-medium">Last Emergency</p>
                      <p className="text-sm font-bold text-blue-700 mt-2">{new Date(userEmergencies[0].createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {userEmergencies.map(e => (
                      <div key={e._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={e.status === 'resolved' ? 'success' : 'warning'}>{e.status}</Badge>
                            <Badge variant={e.riskLevel === 'Critical' ? 'destructive' : 'default'} className={e.riskLevel === 'Critical' ? 'bg-red-500' : ''}>{e.riskLevel} Risk</Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{e.symptoms}</p>
                        </div>
                        <div className="sm:text-right text-xs text-slate-500 flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                          <p className="flex items-center justify-end gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(e.createdAt).toLocaleDateString()}</p>
                          <p>{new Date(e.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
