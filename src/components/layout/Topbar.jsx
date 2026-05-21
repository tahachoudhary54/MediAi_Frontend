"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, User, LogOut, Check, CheckCheck, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import api from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

export function Topbar({ role: propsRole }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, logout } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showBreakModal, setShowBreakModal] = useState(false)
  const notificationRef = useRef(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000) // Poll every 15s

    // Click outside handler
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      clearInterval(interval)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      if (res.data.success) {
        setNotifications(res.data.data)
        const unread = res.data.data.filter(n => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    }
  }

  const markAsRead = async (id, route) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      fetchNotifications()
      if (route) {
        setShowNotifications(false)
        router.push(route)
      }
    } catch (err) {
      console.error("Failed to mark as read")
    }
  }

  const handleSetBreak = async (duration) => {
    try {
      const res = await api.patch('/auth/profile', {
        onlineStatus: 'break',
        breakDuration: duration
      })
      if (res.data.success) {
        const stored = JSON.parse(sessionStorage.getItem("user") || "{}")
        const base = stored.user || stored
        const updated = {
          ...base,
          onlineStatus: 'break',
          breakExpiresAt: res.data.data.breakExpiresAt
        }
        sessionStorage.setItem("user", JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent("profileUpdated"))
      }
    } catch (err) {
      console.error("Failed to set break:", err)
    } finally {
      setShowBreakModal(false)
    }
  }

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      fetchNotifications()
    } catch (err) {
      console.error("Failed to mark all as read")
    }
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search dashboard..."
            className="pl-9 bg-slate-50 border-transparent focus-visible:ring-slate-300 focus-visible:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 sm:hidden ml-10"></div>

      <div className="flex items-center gap-4">
        {/* Notifications Dropdown Container */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-slate-100 text-teal-600' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 ring-2 ring-white flex items-center justify-center text-[8px] font-bold text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[320px] sm:w-[380px] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  Notifications
                  {unreadCount > 0 && <span className="bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                </h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-8 w-8 mx-auto text-slate-200 mb-2" />
                    <p className="text-sm text-slate-500">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id, notif.route)}
                        className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 ${!notif.isRead ? 'bg-teal-50/30' : ''}`}
                      >
                        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${!notif.isRead ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Bell className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <p className={`text-sm font-semibold truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                              {notif.title}
                            </p>
                            {!notif.isRead && <div className="h-2 w-2 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-1.5">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock className="h-3 w-3" /> {getTimeAgo(notif.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-medium">Click on a notification to view details</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block" />

        <div className="flex items-center gap-3">
          {role === 'doctor' && (
            <div className="mr-2">
              <div
                className="text-xs font-bold rounded-full px-3 py-1.5 border select-none transition-all duration-300"
                style={{
                  color: (user?.onlineStatus === 'available' || !user?.onlineStatus) ? '#10b981' : user?.onlineStatus === 'busy' ? '#ef4444' : '#f97316',
                  borderColor: (user?.onlineStatus === 'available' || !user?.onlineStatus) ? '#a7f3d0' : user?.onlineStatus === 'busy' ? '#fecaca' : '#fed7aa',
                  backgroundColor: (user?.onlineStatus === 'available' || !user?.onlineStatus) ? '#ecfdf5' : user?.onlineStatus === 'busy' ? '#fef2f2' : '#fff7ed'
                }}
              >
                {(() => {
                  const formatTime12 = (t) => {
                    if (!t) return '';
                    const [h, m] = t.split(':');
                    const hours = parseInt(h, 10);
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
                    return `${formattedHours}:${m} ${ampm}`;
                  };
                  return user?.onlineStatus === 'busy'
                    ? '🔴 Busy (In Chat)'
                    : user?.onlineStatus === 'break'
                      ? user?.breakExpiresAt
                        ? `🟠 On Break (until ${new Date(user.breakExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                        : user?.dailyBreak?.enabled
                          ? `🟠 Scheduled Break (${formatTime12(user.dailyBreak.startTime)} - ${formatTime12(user.dailyBreak.endTime)})`
                          : '🟠 On Break'
                      : '🟢 Active';
                })()}
              </div>
            </div>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-none">{user?.fullName || user?.name || "User"}</p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{role}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm">
            {user?.avatar ? (
              <img
                src={user.avatar.startsWith("http") ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}/uploads/${user.avatar}`}
                alt={user.fullName || user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-teal-600" />
            )}
          </div>
          <button
            onClick={logout}
            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-full"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Break Duration Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col gap-6 transform scale-100 transition-all duration-300">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-2">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Set Break Duration</h3>
              <p className="text-sm text-slate-500">How long will you be away? Your status will automatically reset to Available after the break ends.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '15 Mins', value: '15' },
                { label: '30 Mins', value: '30' },
                { label: '1 Hour', value: '60' },
                { label: '2 Hours', value: '120' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSetBreak(opt.value)}
                  className="py-3 px-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 text-slate-700 font-semibold text-sm transition-all duration-200"
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSetBreak('indefinite')}
              className="py-3 px-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-all duration-200 animate-pulse"
            >
              Indefinite (Until manually changed)
            </button>

            <div className="flex gap-3 justify-end border-t pt-4">
              <button
                onClick={() => setShowBreakModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
