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

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsOtp, setNeedsOtp] = useState(false)
  const [otp, setOtp] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()



  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = { email, password }
      console.log("[LoginPage] Submitting login");

      const response = await api.post('/auth/login', payload)
      console.log("[LoginPage] Response received:", response.data);

      if (response.data.success) {
        login(response.data, response.data.token, response.data.role, rememberMe)
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
        otp
      }

      const res = await api.post('/auth/verify-otp', payload)

      if (res.data.success) {
        // After verifying OTP, auto-login with credentials to get token
        const loginPayload = { email, password }
        const loginRes = await api.post('/auth/login', loginPayload)
        if (loginRes.data.success) {
          login(loginRes.data, loginRes.data.token, loginRes.data.role, rememberMe)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left side - Brand/Hero (Hidden on smaller screens) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between bg-slate-900 p-12 text-white overflow-hidden">
        {/* Background gradient/image effect */}
        <div className="absolute inset-0 bg-linear-to-br from-teal-900 via-slate-900 to-emerald-900 z-0" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-teal-400 via-transparent to-transparent z-0" />
        
        {/* Top Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-emerald-500 shadow-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">MediAI</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
            Next generation <br/>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-400 to-emerald-400">healthcare management</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Streamline your practice, empower your patients, and manage everything from a single, intelligent platform.
          </p>
        </div>

        {/* Bottom Footer or Trust Badge */}
        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} MediAI Technologies. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 h-full overflow-y-auto bg-white">
        <div className="w-full max-w-sm flex flex-col justify-center">
          
          {/* Mobile Header (Only visible on small screens) */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-600 shadow-md">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">MediAI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
              <p>{error}</p>
            </div>
          )}

          {needsOtp ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 mb-2">
                <Label htmlFor="otp" className="font-medium text-slate-700">Verification Code</Label>
                <p className="text-xs text-slate-500 mb-2">Enter the 6-digit code sent to <span className="font-medium text-slate-700">{email}</span></p>
                <Input
                  id="otp"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="text-center text-3xl tracking-[0.5em] h-14 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all font-mono"
                  placeholder="000000"
                />
              </div>
              <div className="space-y-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all" 
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setNeedsOtp(false); setOtp(""); setError(""); }} 
                  className="w-full h-11 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-slate-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all bg-white"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium text-slate-700">Password</Label>
                  <Link href="/auth/forgot-password" size="sm" className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline transition-colors">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-12 h-12 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 transition-colors" 
                />
                <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition-all duration-300" 
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link href={`/auth/register`} className="text-teal-600 font-semibold hover:text-teal-700 hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </div>
          
        </div>
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
