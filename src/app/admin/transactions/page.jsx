"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, FileSpreadsheet, DollarSign, Clock, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/admin/transactions')
      if (res.data.success) {
        setTransactions(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
    
    const handleRefresh = () => fetchTransactions()
    window.addEventListener("refreshAdminTransactions", handleRefresh)
    return () => window.removeEventListener("refreshAdminTransactions", handleRefresh)
  }, [])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const patientName = t.patient?.fullName || ""
      const doctorName = t.doctor?.fullName || ""
      const matchesSearch = patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "All" || t.status === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [transactions, searchQuery, statusFilter])

  const stats = {
    total: transactions.reduce((acc, t) => t.status === 'completed' ? acc + t.amount : acc, 0),
    pending: transactions.filter(t => t.status === 'pending').length,
    completed: transactions.filter(t => t.status === 'completed').length,
    failed: transactions.filter(t => t.status === 'failed').length
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="success">Completed</Badge>
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'failed': return <Badge variant="destructive">Failed</Badge>
      case 'refunded': return <Badge variant="default">Refunded</Badge>
      default: return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-slate-500">View and manage all payment records across the platform.</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">${stats.total.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Payments</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.completed}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Failed</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.failed}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient or doctor..."
                className="pl-9 bg-white text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center">
                        <DollarSign className="h-12 w-12 text-slate-200 mb-3" />
                        <p className="text-lg font-semibold text-slate-900">No transactions found</p>
                        <p className="text-slate-500">Try adjusting your search or filters.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell className="font-mono text-xs text-slate-500">{t._id.substring(0, 10)}...</TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">{t.patient?.fullName || "Deleted User"}</p>
                        <p className="text-xs text-slate-500">{t.patient?.email}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900">{t.doctor?.fullName || "MediAI"}</p>
                        <p className="text-xs text-slate-500">{t.doctor?.specialization || "System"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          {t.status === 'completed' ? <ArrowDownRight className="w-3 h-3 text-emerald-500" /> : <ArrowUpRight className="w-3 h-3 text-slate-400" />}
                          ${t.amount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] bg-slate-50">
                          {t.paymentMethod?.replace('_', ' ') || 'card'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(t.status)}</TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}<br />
                        <span className="text-[10px]">{new Date(t.createdAt).toLocaleTimeString()}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
