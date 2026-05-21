"use client"

import { Suspense } from "react"
import ChangePassword from "@/components/shared/ChangePassword"

export default function DoctorSecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security Settings</h1>
        <p className="text-slate-500">Manage your password and account security.</p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <ChangePassword />
      </Suspense>
    </div>
  )
}
