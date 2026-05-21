import React from 'react'
import { cn } from "@/lib/utils"

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center min-h-[300px] border border-dashed border-slate-200 rounded-xl bg-slate-50/50", className)}>
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
          <Icon className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  )
}
