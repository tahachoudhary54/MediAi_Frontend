"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type')

  const returnUrl = type === 'appointment' ? '/patient/appointments' : '/patient/pharmacy'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
        <div className="bg-emerald-500 p-8 text-center text-white">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Payment Successful!</h2>
          <p className="text-emerald-100 font-medium text-sm">
            Thank you. Your transaction was completed securely.
          </p>
        </div>
        
        <CardContent className="p-8 space-y-6 text-center">
          <p className="text-slate-600">
            We've sent a receipt to your email address. You can now track your order from your dashboard.
          </p>

          <Button 
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold"
            onClick={() => router.push(returnUrl)}
          >
            Return to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
