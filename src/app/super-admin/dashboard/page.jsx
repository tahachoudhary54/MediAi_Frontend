"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Users, Activity, AlertTriangle, ShieldCheck, UserCheck, TrendingUp, CheckCircle, Clock } from "lucide-react"
import { toast } from "react-hot-toast"

export default function SuperAdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const res = await fetch(`${apiBase}/super-admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        } else {
          toast.error(data.message || 'Failed to load stats')
        }
      } catch (error) {
        console.error('Error fetching super admin stats:', error)
        toast.error('Network error loading dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass, trend }) => (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-800">{value}</h3>
          {trend && (
            <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${bgColorClass}`}>
          <Icon className={`h-6 w-6 ${colorClass}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Super Admin global monitoring dashboard.</p>
      </div>

      {stats ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers || 0} 
              icon={Users} 
              colorClass="text-blue-600" 
              bgColorClass="bg-blue-50"
            />
            <StatCard 
              title="Active Doctors" 
              value={stats.activeDoctors || 0} 
              icon={UserCheck} 
              colorClass="text-emerald-600" 
              bgColorClass="bg-emerald-50"
            />
            <StatCard 
              title="Platform Admins" 
              value={stats.totalAdmins || 0} 
              icon={ShieldCheck} 
              colorClass="text-purple-600" 
              bgColorClass="bg-purple-50"
            />
            <StatCard 
              title="Active Emergencies" 
              value={stats.activeEmergencies || 0} 
              icon={AlertTriangle} 
              colorClass="text-red-600" 
              bgColorClass="bg-red-50"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-500" />
                System Health & Activity
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Pending Approvals</span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                    {stats.pendingApprovals || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">Completed Appointments</span>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                    {stats.completedAppointments || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-600 font-medium">System Status</span>
                  <span className="flex items-center text-emerald-600 font-bold text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Operational
                  </span>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-500" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="/super-admin/admins" className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
                  <ShieldCheck className="h-8 w-8 text-indigo-600 mb-2" />
                  <span className="font-medium text-indigo-900">Manage Admins</span>
                </a>
                <a href="/super-admin/emergency-control" className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                  <AlertTriangle className="h-8 w-8 text-red-600 mb-2" />
                  <span className="font-medium text-red-900">Emergency Hub</span>
                </a>
                <a href="/super-admin/analytics" className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-100">
                  <TrendingUp className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="font-medium text-emerald-900">Platform Analytics</span>
                </a>
                <a href="/super-admin/settings" className="flex flex-col items-center justify-center p-4 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200">
                  <Activity className="h-8 w-8 text-slate-600 mb-2" />
                  <span className="font-medium text-slate-900">Global Settings</span>
                </a>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-500">Failed to load platform data.</p>
        </div>
      )}
    </div>
  )
}
