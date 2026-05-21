"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, XCircle, Clock, Trash2 } from "lucide-react"
import api from "@/lib/api"

export default function PatientMessages() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/notifications')
      if (res.data.success) {
        setNotifications(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'appointment_update': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'appointment_cancel': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-teal-500" />;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Messages & Notifications</h1>
        <p className="text-slate-500">Stay updated on your appointments and health updates.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading messages...</div>
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <Card key={notif._id} className={`overflow-hidden transition-all ${notif.isRead ? 'opacity-75 bg-slate-50' : 'border-l-4 border-l-teal-500 bg-white shadow-sm'}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${notif.isRead ? 'bg-slate-200' : 'bg-teal-50'}`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`font-semibold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h3>
                      <span className="text-xs text-slate-400">{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{notif.message}</p>
                    <div className="flex items-center justify-end gap-2">
                      {!notif.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(notif._id)} className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 h-8">
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl border-dashed">
            <Bell className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No messages yet</h3>
            <p className="text-slate-500 mt-1">We'll notify you here about any updates to your appointments.</p>
          </div>
        )}
      </div>
    </div>
  )
}
