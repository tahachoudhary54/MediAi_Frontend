"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, CreditCard, Lock } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  const amount = searchParams.get('amount')
  const itemName = searchParams.get('name')

  const [isProcessing, setIsProcessing] = useState(false)

  const handleSimulatePayment = async () => {
    setIsProcessing(true)
    try {
      // Simulate API call for webhook success
      const res = await api.post('/payment/simulate-webhook', {
        itemId: id,
        type: type
      })

      if (res.data.success) {
        toast.success("Payment successful!")
        setTimeout(() => {
          router.push(`/payment/success?type=${type}`)
        }, 1500)
      }
    } catch (err) {
      console.error(err)
      toast.error("Payment failed to process")
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        <div className="bg-slate-900 p-6 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-500/20 p-3 rounded-full">
              <ShieldCheck className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">Simulated Checkout</h2>
          <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secure Test Environment
          </p>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="bg-slate-100 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Order Summary</p>
            <h3 className="font-medium text-slate-900">{itemName || 'Unknown Item'}</h3>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
              <span className="font-semibold text-slate-700">Total Due:</span>
              <span className="text-xl font-bold text-slate-900">₹{amount || '0'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg flex items-center gap-2 transition-all"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" /> Pay ₹{amount}
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-12 text-slate-500 hover:bg-slate-100"
              onClick={() => router.back()}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-center text-slate-400">
            This is a simulated payment gateway. No real money will be charged.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}
