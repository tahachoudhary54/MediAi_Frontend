"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/shared/StatCard"
import { DollarSign, TrendingUp, CreditCard, Download, Clock, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"

export default function DoctorEarnings() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        // In a real app, we'd have a /doctor/transactions or /doctor/earnings endpoint
        // For now, we'll try to fetch and handle the "no data" case gracefully
        const res = await api.get('/doctor/transactions').catch(() => ({ data: { success: true, data: [] } }))
        if (res.data.success) {
          setTransactions((res.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
        }
      } catch (err) {
        console.error("Failed to fetch earnings:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchEarnings()
    const interval = setInterval(fetchEarnings, 60000) // Poll every 60s
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading your earnings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Earnings</h1>
          <p className="text-slate-500">Track your consultation revenue and transactions.</p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Earnings" value="$0.00" icon={DollarSign} trend="stable" trendValue="0% this month" className="bg-teal-50 border-teal-100" />
        <StatCard title="Available Balance" value="$0.00" icon={Wallet} description="Ready for withdrawal" />
        <StatCard title="Consultations" value="0" icon={TrendingUp} description="Completed sessions" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id || tx._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-white">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{tx.user?.fullName || "Patient"}</p>
                      <p className="text-sm text-slate-500">{new Date(tx.date || tx.createdAt).toLocaleDateString()} • {tx.type || "Consultation"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${tx.amount?.toFixed(2)}</p>
                    <p className={`text-xs font-medium ${tx.status === 'Success' || tx.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-3">
                  <Wallet className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">No transactions yet</h4>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">Complete your first consultation to start seeing earnings here.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
