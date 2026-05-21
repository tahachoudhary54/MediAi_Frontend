"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, XCircle, CalendarCheck, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import api from "@/lib/api"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all") // all, unread, appointment

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

    const handleCancelledEvent = () => {
      console.log("[NotificationsPage] Received appointmentCancelled custom event. Hot-reloading...");
      fetchNotifications()
    }
    window.addEventListener("appointmentCancelled", handleCancelledEvent)

    return () => {
      window.removeEventListener("appointmentCancelled", handleCancelledEvent)
    }
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead)
      await Promise.all(unreadNotifs.map(n => api.put(`/notifications/${n._id}/read`)))
      fetchNotifications()
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.isRead
    if (filter === "appointment") return notif.type?.includes('appointment')
    return true
  })

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_cancel':
        return <XCircle className="h-5 w-5" />
      case 'appointment_update':
        return <CalendarCheck className="h-5 w-5" />
      case 'appointment_confirm':
        return <CheckCircle className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment_cancel':
        return 'bg-red-100 text-red-600'
      case 'appointment_update':
        return 'bg-amber-100 text-amber-600'
      case 'appointment_confirm':
        return 'bg-emerald-100 text-emerald-600'
      default:
        return 'bg-teal-100 text-teal-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="text-slate-500">Stay updated with your appointments and health updates.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg self-start">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === "unread" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
        <button
          onClick={() => setFilter("appointment")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${filter === "appointment" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
        >
          Appointments ({notifications.filter(n => n.type?.includes('appointment')).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading notifications...</div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <Card
              key={notif._id}
              className={`transition-all hover:shadow-md ${!notif.isRead ? 'border-teal-200 bg-teal-50/30' : ''}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${getNotificationColor(notif.type)}`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                      {!notif.isRead && (
                        <Badge variant="teal" className="text-xs flex-shrink-0">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      {notif.type?.includes('appointment') && (
                        <Link href="/patient/appointments" className="text-teal-600 hover:underline font-medium">
                          View Appointments →
                        </Link>
                      )}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="flex-shrink-0"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl border-dashed">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Bell className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
            <p className="text-slate-500 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  )
}
