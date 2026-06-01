"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Plus, Trash2, Clock, CheckCircle, Truck, Package, XCircle, Search } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function PatientPharmacy() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [cart, setCart] = useState([{ medicineId: "", medicineName: "", quantity: 1, maxQty: 1, price: 0 }])
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [availableMedicines, setAvailableMedicines] = useState([])

  const fetchOrdersAndStock = async () => {
    try {
      setIsLoading(true)
      const [ordersRes, stockRes] = await Promise.all([
        api.get('/medicine-orders/patient'),
        api.get('/medicine-stock')
      ])
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data)
      }
      if (stockRes.data.success) {
        setAvailableMedicines(stockRes.data.data.filter(m => m.quantity > 0 && m.isActive !== false))
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrdersAndStock()

    const handleOrderUpdate = () => {
      fetchOrdersAndStock()
    }

    const handleStockUpdate = () => {
      fetchOrdersAndStock()
    }

    window.addEventListener("orderStatusUpdated", handleOrderUpdate)
    window.addEventListener("medicineStockUpdated", handleStockUpdate)

    return () => {
      window.removeEventListener("orderStatusUpdated", handleOrderUpdate)
      window.removeEventListener("medicineStockUpdated", handleStockUpdate)
    }
  }, [])

  const handleAddToCart = () => {
    setCart([...cart, { medicineId: "", medicineName: "", quantity: 1, maxQty: 1, price: 0 }])
  }

  const handleRemoveFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const handleMedicineSelect = (index, medicineId) => {
    const med = availableMedicines.find(m => m._id === medicineId)
    const newCart = [...cart]
    if (med) {
      const discount = med.discount || 0;
      const discountedPrice = Math.round(med.price * (1 - discount / 100));
      newCart[index] = { ...newCart[index], medicineId: med._id, medicineName: med.name, maxQty: med.quantity, price: discountedPrice, originalPrice: med.price, discount: med.discount, quantity: 1 }
    } else {
      newCart[index] = { medicineId: "", medicineName: "", quantity: 1, maxQty: 1, price: 0 }
    }
    setCart(newCart)
  }

  const handleCartChange = (index, field, value) => {
    const newCart = [...cart]
    newCart[index][field] = value
    setCart(newCart)
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    // Validate
    const validItems = cart.filter(item => item.medicineId)
    if (validItems.length === 0) {
      return toast.error("Please add at least one medicine")
    }
    if (!deliveryAddress.trim()) {
      return toast.error("Please provide a delivery address")
    }

    try {
      setIsSubmitting(true)
      const res = await api.post('/medicine-orders', {
        items: validItems,
        deliveryAddress
      })
      if (res.data.success) {
        toast.success("Order placed, redirecting to payment...")
        const orderId = res.data.data._id
        
        // Call payment checkout endpoint
        const paymentRes = await api.post('/payment/checkout', {
          itemId: orderId,
          type: 'medicine_order'
        })

        if (paymentRes.data.success) {
          router.push(paymentRes.data.data.url)
        } else {
          toast.error("Failed to initiate payment")
        }
      }
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message || error)
      toast.error(error.response?.data?.message || "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and delete this order?")) return;
    try {
      const res = await api.delete(`/medicine-orders/${id}`)
      if (res.data.success) {
        toast.success("Order deleted successfully")
        fetchOrdersAndStock()
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to delete order")
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'out_for_delivery': return <Truck className="w-5 h-5 text-indigo-500" />
      case 'delivered': return <Package className="w-5 h-5 text-emerald-500" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-slate-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <Badge variant="warning">Pending Approval</Badge>
      case 'confirmed': return <Badge variant="default" className="bg-blue-500">Confirmed</Badge>
      case 'out_for_delivery': return <Badge variant="default" className="bg-indigo-500">Out for Delivery</Badge>
      case 'delivered': return <Badge variant="success">Delivered</Badge>
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pharmacy Delivery</h1>
        <p className="text-slate-500">Order medicines directly to your doorstep.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Order Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingBag className="w-5 h-5 text-teal-600" /> Place New Order
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <div className="space-y-4">
                  <Label>Medicines Required</Label>
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex-1 space-y-3">
                        <select
                          className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                          value={item.medicineId}
                          onChange={(e) => handleMedicineSelect(index, e.target.value)}
                        >
                          <option value="">Select a medicine...</option>
                          {availableMedicines.map(med => {
                            const discount = med.discount || 0;
                            const discountedPrice = Math.round(med.price * (1 - discount / 100));
                            return (
                              <option key={med._id} value={med._id}>
                                {med.name} {med.mg ? `(${med.mg}mg)` : ""} - ₹{discountedPrice} {discount > 0 ? `(${discount}% OFF)` : ""} (In stock: {med.quantity})
                              </option>
                            )
                          })}
                        </select>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-slate-500">Qty:</Label>
                          <Input 
                            type="number" 
                            min="1" 
                            max={item.maxQty || 1}
                            className="w-20 h-8 bg-white" 
                            value={item.quantity}
                            onChange={(e) => handleCartChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            disabled={!item.medicineId}
                          />
                          {item.medicineId && (
                            <span className="text-sm font-semibold text-slate-700 ml-auto">
                              ₹{item.price * item.quantity}
                            </span>
                          )}
                        </div>
                      </div>
                      {cart.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 -mt-1 -mr-1"
                          onClick={() => handleRemoveFromCart(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-teal-600 border-teal-200 hover:bg-teal-50"
                    onClick={handleAddToCart}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Another Medicine
                  </Button>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-slate-100">
                  <span className="text-slate-700 font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-teal-600">₹{cartTotal}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <textarea 
                    id="address"
                    rows="3"
                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your full home address..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Placing Order..." : "Confirm Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            Your Orders
          </h3>
          
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <Card className="border-dashed bg-slate-50/50">
              <CardContent className="py-12 flex flex-col items-center text-center">
                <Package className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No Orders Yet</h3>
                <p className="text-slate-500 mt-1">You haven't placed any medicine orders.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order._id} className="overflow-hidden transition-all hover:shadow-md border-slate-200">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Order ID: {order._id.substring(order._id.length - 8).toUpperCase()}</p>
                      <p className="text-sm font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex flex-col gap-1 items-end mr-2">
                        {getStatusBadge(order.status)}
                        {order.paymentStatus === 'paid' ? (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Paid ₹{order.totalAmount || 0}</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending Payment</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 ml-2"
                        onClick={() => handleDeleteOrder(order._id)}
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Items</h4>
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-slate-700 font-medium">{item.medicineName}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">Qty: {item.quantity}</span>
                                {item.price > 0 && <span className="text-slate-900 font-semibold text-sm w-12 text-right">₹{item.price * item.quantity}</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-2">Delivery Details</h4>
                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
                          {order.deliveryAddress}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
