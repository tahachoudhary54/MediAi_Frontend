"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function ChangePassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mustChange = searchParams.get("mustChange") === "true"

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      return toast.error("New passwords do not match")
    }

    if (formData.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters")
    }

    setLoading(true)
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      if (response.data.success) {
        toast.success("Password updated successfully")

        // Update local storage user object
        const stored = sessionStorage.getItem('user')
        if (stored) {
          const user = JSON.parse(stored)
          if (user.user) user.user.mustChangePassword = false
          else user.mustChangePassword = false
          sessionStorage.setItem('user', JSON.stringify(user))
        }

        if (mustChange) {
          toast.success("You can now access your dashboard")
          // Redirect to dashboard based on role
          const role = sessionStorage.getItem('role')
          router.push(`/${role}/dashboard`)
        } else {
          setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>
          {mustChange
            ? "You are required to change your password before continuing."
            : "Update your password to keep your account secure."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {mustChange && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Action Required</p>
              <p>For security reasons, your administrator requires you to set a new password upon your first login.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Min 6 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 min-w-[150px]" disabled={loading}>
              {loading ? "Updating..." : <><CheckCircle2 className="mr-2 h-4 w-4" /> Update Password</>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
