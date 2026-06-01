"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import { ArrowLeft, User, Phone, FileText, CarFront } from "lucide-react"

export default function AdminDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const adminId = params.id
  
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
        const res = await fetch(`${apiBase}/super-admin/admins/${adminId}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const result = await res.json()
        if (result.success) {
          setData(result.data)
        } else {
          toast.error(result.message || 'Failed to load admin stats')
          router.push('/super-admin/admins')
        }
      } catch (err) {
        toast.error('Network error loading admin stats')
        router.push('/super-admin/admins')
      } finally {
        setLoading(false)
      }
    }

    if (token && adminId) {
      fetchStats()
    }
  }, [token, adminId, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => router.push('/super-admin/admins')}
          className="p-2 bg-white rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Statistics</h1>
          <p className="text-slate-500 mt-1">Detailed breakdown of resources managed by this admin.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-8">
        <div>
          <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Admin Name</p>
          <p className="text-2xl font-bold text-slate-900">{data.adminName}</p>
          <p className="text-sm text-indigo-600 font-medium mt-1">Region: {data.region}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <p className="text-4xl font-bold text-blue-700">{data.totalDoctors}</p>
            <p className="text-sm font-semibold text-blue-600 mt-2 uppercase tracking-wide">Total Doctors</p>
          </div>
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
            <p className="text-4xl font-bold text-emerald-700">{data.totalPatients}</p>
            <p className="text-sm font-semibold text-emerald-600 mt-2 uppercase tracking-wide">Total Patients</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
            <p className="text-4xl font-bold text-purple-700">{data.totalAmbulances || 0}</p>
            <p className="text-sm font-semibold text-purple-600 mt-2 uppercase tracking-wide">Total Ambulances</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide flex items-center">
              Assigned Doctors 
              <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full">{data.doctors?.length || 0}</span>
            </h4>
            {data.doctors && data.doctors.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {data.doctors.map((doc, idx) => (
                  <li key={idx} className="flex flex-col items-start bg-slate-50 p-4 rounded-lg border border-slate-100 gap-2">
                    <span className="text-slate-900 font-bold line-clamp-1">{doc.fullName}</span>
                    <span className="bg-white px-2 py-1 rounded text-xs font-medium text-slate-500 shadow-sm border border-slate-200 capitalize w-fit">{doc.specialization || 'Unspecified'}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center">No doctors found in this region.</p>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide flex items-center">
              Assigned Patients
              <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full">{data.patients?.length || 0}</span>
            </h4>
            {data.patients && data.patients.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {data.patients.map((pat, idx) => (
                  <li key={idx} className="flex flex-col items-start bg-slate-50 p-4 rounded-lg border border-slate-100 gap-2 w-full overflow-hidden">
                    <span className="text-slate-900 font-bold line-clamp-1">{pat.fullName}</span>
                    <span className="bg-white px-2 py-1 rounded text-xs font-medium text-slate-500 shadow-sm border border-slate-200 truncate w-full" title={pat.email}>{pat.email}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center">No patients found in this region.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wide flex items-center">
              Assigned Ambulances
              <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">{data.ambulances?.length || 0}</span>
            </h4>
            {data.ambulances && data.ambulances.length > 0 ? (
              <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {data.ambulances.map((amb, idx) => (
                  <li key={idx} className="flex flex-col items-start bg-slate-50 p-4 rounded-lg border border-slate-100 gap-3 w-full overflow-hidden">
                    <div className="w-full truncate space-y-2">
                      <div className="flex items-center text-slate-900 font-bold truncate">
                        <User className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{amb.driverName}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-600">
                        <Phone className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                        {amb.phoneNumber}
                      </div>
                      {amb.drivingLicense && (
                        <div className="flex items-center text-xs text-slate-600">
                          <FileText className="w-3.5 h-3.5 mr-2 text-slate-400 flex-shrink-0" />
                          License: {amb.drivingLicense}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center bg-white px-2.5 py-1.5 rounded text-xs font-bold text-slate-700 shadow-sm border border-slate-200 uppercase w-fit">
                      <CarFront className="w-4 h-4 mr-2 text-indigo-500 flex-shrink-0" />
                      {amb.numberPlate}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-lg text-center">No ambulances found in this region.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
