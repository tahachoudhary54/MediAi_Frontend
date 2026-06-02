"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Activity, Eye, EyeOff } from "lucide-react"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") || "patient"

  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [adminAccessCode, setAdminAccessCode] = useState("")
  const [showAdminCode, setShowAdminCode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsOtp, setNeedsOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const { login } = useAuth()

  const handleDemoLogin = async (selectedRole) => {
    setLoading(true)
    setError("")
    try {
      const demoCredentials = {
        patient: { email: 'patient@example.com', password: 'password123', role: 'patient' },
        doctor: { email: 'doctor@example.com', password: 'password123', role: 'doctor' },
        admin: { email: 'admin@example.com', password: 'password123', adminAccessCode: 'super', role: 'admin' },
        super_admin: { email: 'superadmin@gmail.com', password: 'superadmin123', adminAccessCode: 'master', role: 'super_admin' }
      }

      const credentials = demoCredentials[selectedRole]
      const response = await api.post('/auth/login', credentials)

      if (response.data.success) {
        login(response.data, response.data.token, response.data.role)
      }
    } catch (err) {
      setError("Demo accounts are currently unavailable.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = { email, password, role }
      console.log("[LoginPage] Submitting login with role:", role);

      if (role === "admin" || role === "super_admin") {
        payload.adminAccessCode = adminAccessCode
      }

      const response = await api.post('/auth/login', payload)
      console.log("[LoginPage] Response received:", response.data);

      if (response.data.success) {
        login(response.data, response.data.token, response.data.role)
      }
    } catch (err) {
      console.error("[LoginPage] Login error:", err);
      
      // Handle the case where the doctor is approved but needs to enter OTP
      if (err.response?.status === 401 && err.response?.data?.requireOtp) {
        setNeedsOtp(true)
        setError(err.response.data.message)
      } else {
        setError(err.response?.data?.message || "Failed to login.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        email,
        otp,
        role: "doctor"
      }

      const res = await api.post('/auth/verify-otp', payload)

      if (res.data.success) {
        // After verifying OTP, auto-login with credentials to get token
        const loginPayload = { email, password, role: "doctor" }
        const loginRes = await api.post('/auth/login', loginPayload)
        if (loginRes.data.success) {
          login(loginRes.data, loginRes.data.token, loginRes.data.role)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
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

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => { setRole("patient"); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "patient" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                Patient
              </button>
              <button
                onClick={() => { setRole("doctor"); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "doctor" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                Doctor
              </button>
              <button
                onClick={() => { setRole("admin"); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                Admin
              </button>
              <button
                onClick={() => { setRole("super_admin"); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === "super_admin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
              >
                Super Admin
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            {needsOtp ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-2 mb-4">
                  <div className="mx-auto bg-teal-50 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                    <Activity className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Verify Account</h3>
                  <p className="text-sm text-slate-500">Enter the 6-digit code sent to <br/><span className="font-medium text-slate-700">{email}</span></p>
                </div>
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
                <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setNeedsOtp(false); setOtp(""); setError(""); }} 
                  className="w-full text-sm text-slate-500 hover:text-slate-700"
                >
                  Back to Login
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" size="sm" className="text-xs text-teal-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              { (role === "admin" || role === "super_admin") && (
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Admin Access Code</Label>
                  <div className="relative">
                    <Input
                      id="accessCode"
                      type={showAdminCode ? "text" : "password"}
                      value={adminAccessCode}
                      onChange={(e) => setAdminAccessCode(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminCode(!showAdminCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                    >
                      {showAdminCode ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="rounded border-slate-300 text-teal-600 focus:ring-teal-600" />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-slate-700">
                  Remember me
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            )}

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or use demo accounts</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('patient')} className="text-xs">
                Demo Patient
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('doctor')} className="text-xs">
                Demo Doctor
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')} className="text-xs">
                Demo Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDemoLogin('super_admin')} className="text-xs">
                Demo SA
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 p-4">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href={`/auth/register?role=${role}`} className="text-teal-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
