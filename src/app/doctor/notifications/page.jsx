"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, AlertTriangle, Calendar, CheckCircle2, MessageSquare, Trash2, CreditCard } from "lucide-react"
import api from "@/lib/api"

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        if (res.data.success) {
          setNotifications(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-teal-600" />;
      case 'verification': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'message': return <MessageSquare className="h-5 w-5 text-indigo-600" />;
      default: return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'emergency': return 'bg-red-50 border-red-100';
      case 'appointment': return 'bg-teal-50 border-teal-100';
      case 'payment': return 'bg-green-50 border-green-100';
      default: return 'bg-white border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading notifications...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="text-slate-500">Your recent alerts and system messages.</p>
      </div>
      
      <div className="space-y-4 max-w-3xl">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <div key={note._id} className={`flex items-start gap-4 p-4 border rounded-xl transition-shadow hover:shadow-sm ${getBgColor(note.type)}`}>
              <div className="p-2 bg-white rounded-full shadow-sm border border-slate-100">{getIcon(note.type)}</div>
              <div className="flex-1">
                <h4 className={`font-semibold ${note.type === 'emergency' ? 'text-red-900' : note.type === 'payment' ? 'text-green-900' : 'text-slate-900'}`}>{note.title}{note.type === 'payment' && note.amount ? ` – ₹${note.amount}` : ''}</h4>
                <p className={`text-sm mt-1 ${note.type === 'emergency' ? 'text-red-700' : note.type === 'payment' ? 'text-green-700' : 'text-slate-600'}`}>{note.message}</p>
                <p className="text-[10px] text-slate-500 mt-2 font-medium uppercase tracking-wider">{new Date(note.createdAt).toLocaleString()}</p>
              </div>
              {!note.read && <div className="h-2 w-2 rounded-full bg-teal-500 mt-2"></div>}
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl border-dashed">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
              <Bell className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">No new notifications</h3>
            <p className="text-slate-500">We'll alert you when something important happens.</p>
          </div>
        )}
      </div>
    </div>
  )
}
