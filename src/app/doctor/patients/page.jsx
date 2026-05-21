"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, FolderHeart } from "lucide-react"

export default function DoctorPatients() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Patients</h1>
        <p className="text-slate-500">View and manage your patient records.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients by name or ID..."
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
        />
      </div>

      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl border-dashed">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
          <FolderHeart className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-medium text-slate-900 mb-2">Select a patient</h3>
        <p className="text-slate-500">Search for a patient to view their complete medical history.</p>
      </div>
    </div>
  )
}
