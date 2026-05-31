"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Activity, ArrowLeft, Mail, CheckCircle2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resetToken, setResetToken] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })
      if (response.data.success) {
        setResetToken(response.data.token || "")
        setIsSubmitted(true)
        toast.success("Reset link generated successfully")
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link")
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center shadow-md border-slate-200">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">Check your email</CardTitle>
              <CardDescription className="text-slate-500">
                A password reset link has been generated for <span className="font-semibold text-slate-900">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                In a production environment, this email would contain a secure token link. For this demo, you can click the button below to reset your password directly:
              </p>
              {resetToken && (
                <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold h-11">
                  <Link href={`/auth/reset-password?token=${resetToken}`}>
                    Reset Password Direct Link
                  </Link>
                </Button>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <Button asChild variant="outline" className="w-full h-11">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MediAI</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot password?</CardTitle>
            <CardDescription>No worries, we'll send you reset instructions.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 p-4">
            <Link href="/auth/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
