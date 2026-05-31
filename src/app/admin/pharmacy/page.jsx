"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Truck, Clock, CheckCircle, Package, XCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function AdminPharmacy() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/medicine-orders')
      if (res.data.success) {
        setOrders(res.data.data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch pharmacy orders")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    const handleRefreshOrders = () => {
      console.log("[AdminPharmacy] Received refreshAdminPharmacyOrders custom event. Hot-reloading...");
      fetchOrders()
    }

    window.addEventListener("refreshAdminPharmacyOrders", handleRefreshOrders)

    return () => {
      window.removeEventListener("refreshAdminPharmacyOrders", handleRefreshOrders)
    }
  }, [])

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/medicine-orders/${id}/status`, { status: newStatus })
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`)
        fetchOrders()
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to update status")
    }
  }

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this order?")) return;
    try {
      const res = await api.delete(`/medicine-orders/${id}`)
      if (res.data.success) {
        toast.success("Order deleted successfully")
        fetchOrders()
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to delete order")
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>
      case 'confirmed': return <Badge variant="default" className="bg-blue-500">Confirmed</Badge>
      case 'out_for_delivery': return <Badge variant="default" className="bg-indigo-500">Out for Delivery</Badge>
      case 'delivered': return <Badge variant="success">Delivered</Badge>
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.patient?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order._id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || order.status === statusFilter.toLowerCase().replace(/ /g, '_')
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pharmacy Orders</h1>
        <p className="text-slate-500">Manage and fulfill medicine delivery requests.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by patient name, email, or order ID..."
                className="pl-9 text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                className="flex h-10 w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID & Date</TableHead>
                <TableHead>Patient Details</TableHead>
                <TableHead>Medicines</TableHead>
                <TableHead>Status & Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Loading orders...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">No pharmacy orders found.</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">#{order._id.substring(order._id.length - 8).toUpperCase()}</div>
                      <div className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-900">{order.patient?.fullName || 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{order.patient?.phone || order.patient?.email}</div>
                      <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate" title={order.deliveryAddress}>
                        {order.deliveryAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-h-24 overflow-y-auto pr-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-xs flex justify-between gap-4 mb-1">
                            <span className="text-slate-700 truncate max-w-[150px]">{item.medicineName}</span>
                            <span className="text-slate-500 font-medium">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 items-start">
                        {getStatusBadge(order.status)}
                        {order.paymentStatus === 'paid' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Paid ₹{order.totalAmount || 0}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Payment Pending</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="text-xs border border-slate-200 rounded p-1.5 bg-slate-50 text-slate-700 font-medium cursor-pointer hover:border-teal-400 focus:outline-none"
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                        <button 
                          onClick={() => handleDeleteOrder(order._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Order"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
