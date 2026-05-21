"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Activity, Droplet, AlertTriangle, FileText, Download, User, Calendar } from "lucide-react"

export default function HealthRecords() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = sessionStorage.getItem('user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        setUser(parsed.user || parsed)
      }
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium">Loading your health profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-900">User Profile Not Found</h3>
        <p className="text-slate-500 mt-2">Please login to view your health records.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Health Records</h1>
          <p className="text-slate-500">Your complete medical history and vitals.</p>
        </div>
        <Button variant="outline" className="gap-2 border-slate-200 text-slate-700">
          <Download className="h-4 w-4" /> Export All
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Vitals & Basic Info */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                Physical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500"><Activity className="h-4 w-4" /></div>
                  <span className="text-sm font-medium text-slate-700">Age / Sex</span>
                </div>
                <span className="font-semibold text-slate-900">{user.age || 'N/A'} yrs • <span className="capitalize">{user.sex || 'N/A'}</span></span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500"><Heart className="h-4 w-4" /></div>
                  <span className="text-sm font-medium text-slate-700">Height / Weight</span>
                </div>
                <span className="font-semibold text-slate-900">{user.height || 'N/A'} / {user.weight || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100 shadow-sm shadow-red-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-red-500"><Droplet className="h-4 w-4" /></div>
                  <span className="text-sm font-medium text-red-900">Blood Group</span>
                </div>
                <span className="font-bold text-red-700 text-lg">{user.bloodGroup || 'N/A'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {user.allergies && user.allergies.length > 0 ? (
                  user.allergies.map((allergy, i) => (
                    <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors">
                      {allergy}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No allergies reported.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right Column: History */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <span className="h-1 w-4 bg-teal-500 rounded-full"></span>
                  Previous Conditions
                </h4>
                <div className="space-y-4">
                  {user.previousDiseaseHistory && user.previousDiseaseHistory.length > 0 ? (
                    user.previousDiseaseHistory.map((disease, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                        <p className="font-medium text-slate-900">{disease}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-500">No medical history on record.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <span className="h-1 w-4 bg-indigo-500 rounded-full"></span>
                  Family Health History
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.familyDiseaseHistory && user.familyDiseaseHistory.length > 0 ? (
                    user.familyDiseaseHistory.map((history, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100">
                        <div className="h-2 w-2 rounded-full bg-indigo-400" />
                        <span className="text-sm font-medium text-indigo-900">{history}</span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 border border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-500">No family medical history reported.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 border-b border-slate-100 py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Medical Documents
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-teal-600 hover:bg-teal-50 font-semibold">Upload New</Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-3">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">No documents uploaded</h4>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">Keep your prescriptions and test results organized in one place.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
