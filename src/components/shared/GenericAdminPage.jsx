"use client"

export default function GenericAdminPage({ title, description, icon: Icon }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="text-slate-500">{description}</p>
      </div>
      <div className="text-center py-20 bg-white border border-slate-200 rounded-xl border-dashed">
        {Icon && <Icon className="h-16 w-16 mx-auto text-slate-200 mb-6" />}
        <h3 className="text-xl font-bold text-slate-900">No data to show</h3>
        <p className="text-slate-500 mt-2 max-w-xs mx-auto">This section currently has no records to display. Check back later or try refreshing.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
