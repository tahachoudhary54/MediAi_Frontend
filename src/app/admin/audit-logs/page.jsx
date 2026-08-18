"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { 
  Search, FileClock, User, Shield, Activity, Calendar, 
  ChevronLeft, ChevronRight, Download, RefreshCw, X, ArrowRight,
  Monitor, MapPin, AlertTriangle, CheckCircle2, XCircle
} from "lucide-react"
import { toast } from "react-hot-toast"

const MOCK_LOGS = [
  {
    _id: "AUD-20260818-000421",
    createdAt: "2026-08-18T10:32:00",
    performedBy: { fullName: "Dr. Ahmed", id: "USR-1024" },
    role: "Doctor Admin",
    organization: "Ahmed Medical Clinic",
    action: "Viewed Medical Report",
    category: "Patient Data",
    target: "Patient #1024",
    ipAddress: "192.168.1.45",
    status: "Successful",
    severity: "Info",
    device: "Chrome / Windows",
    location: "Mumbai, India",
    description: "Medical report for Patient #1024 was viewed.",
    changes: [],
    sessionId: "SES-839201",
    requestId: "REQ-921839"
  },
  {
    _id: "AUD-20260818-000422",
    createdAt: "2026-08-18T10:35:00",
    performedBy: { fullName: "Hospital Admin", id: "USR-0001" },
    role: "Hospital Admin",
    organization: "Apollo City Hospital",
    action: "Added Doctor",
    category: "User Management",
    target: "Dr. Sarah Khan",
    ipAddress: "192.168.1.100",
    status: "Successful",
    severity: "Medium",
    device: "Safari / macOS",
    location: "Delhi, India",
    description: "New doctor profile created for Dr. Sarah Khan.",
    changes: [{ field: "Account Status", previous: "None", new: "Created" }],
    sessionId: "SES-839205",
    requestId: "REQ-921845"
  },
  {
    _id: "AUD-20260818-000423",
    createdAt: "2026-08-18T10:41:00",
    performedBy: { fullName: "Hospital Admin", id: "USR-0001" },
    role: "Hospital Admin",
    organization: "Apollo City Hospital",
    action: "Changed User Role",
    category: "Permissions",
    target: "Dr. Ahmed",
    ipAddress: "192.168.1.100",
    status: "Successful",
    severity: "High",
    device: "Safari / macOS",
    location: "Delhi, India",
    description: "Role updated for Dr. Ahmed.",
    changes: [{ field: "Permission: View Patient Reports", previous: "Disabled", new: "Enabled" }],
    sessionId: "SES-839205",
    requestId: "REQ-921850"
  },
  {
    _id: "AUD-20260818-000424",
    createdAt: "2026-08-18T11:02:00",
    performedBy: { fullName: "Dr. Sarah Khan", id: "USR-1092" },
    role: "Doctor",
    organization: "Apollo City Hospital",
    action: "Uploaded Medical Report",
    category: "Medical Reports",
    target: "Patient #1092",
    ipAddress: "192.168.1.205",
    status: "Successful",
    severity: "Info",
    device: "Chrome / Windows",
    location: "Delhi, India",
    description: "Blood test results uploaded.",
    changes: [],
    sessionId: "SES-839222",
    requestId: "REQ-921865"
  },
  {
    _id: "AUD-20260818-000425",
    createdAt: "2026-08-18T11:15:00",
    performedBy: { fullName: "Unknown User", id: "N/A" },
    role: "Unknown",
    organization: "N/A",
    action: "Failed Login",
    category: "Authentication",
    target: "Admin Account",
    ipAddress: "45.22.109.12",
    status: "Failed",
    severity: "High",
    device: "Unknown Browser / Linux",
    location: "Moscow, Russia",
    description: "5 consecutive failed login attempts detected.",
    changes: [],
    sessionId: "N/A",
    requestId: "REQ-921870"
  },
  {
    _id: "AUD-20260818-000426",
    createdAt: "2026-08-18T11:20:00",
    performedBy: { fullName: "MediAI System", id: "SYS-001" },
    role: "System",
    organization: "MediAI Global",
    action: "AI Analysis Generated",
    category: "AI Activity",
    target: "Patient #1045",
    ipAddress: "System",
    status: "Successful",
    severity: "Info",
    device: "Internal Server",
    location: "AWS ap-south-1",
    description: "AI extraction and analysis of prescription completed.",
    changes: [],
    sessionId: "SYS-CRON-8392",
    requestId: "REQ-921875"
  },
  {
    _id: "AUD-20260818-000427",
    createdAt: "2026-08-18T12:05:00",
    performedBy: { fullName: "Dr. Ahmed", id: "USR-1024" },
    role: "Doctor Admin",
    organization: "Ahmed Medical Clinic",
    action: "Updated Patient Information",
    category: "Patient Data",
    target: "Patient #1024",
    ipAddress: "192.168.1.45",
    status: "Successful",
    severity: "High",
    device: "Chrome / Windows",
    location: "Mumbai, India",
    description: "Blood group information was updated.",
    changes: [{ field: "Blood Group", previous: "B+", new: "O+" }],
    sessionId: "SES-839201",
    requestId: "REQ-921900"
  },
  {
    _id: "AUD-20260818-000428",
    createdAt: "2026-08-18T14:30:00",
    performedBy: { fullName: "Hospital Admin", id: "USR-0001" },
    role: "Hospital Admin",
    organization: "Apollo City Hospital",
    action: "Audit Logs Exported",
    category: "System",
    target: "System Logs",
    ipAddress: "192.168.1.100",
    status: "Successful",
    severity: "Medium",
    device: "Safari / macOS",
    location: "Delhi, India",
    description: "Exported 1,284 records to CSV.",
    changes: [{ field: "Format", previous: "N/A", new: "CSV" }],
    sessionId: "SES-839205",
    requestId: "REQ-921950"
  }
];

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState(MOCK_LOGS)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [severityFilter, setSeverityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Modals
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState("CSV")

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success("Audit logs refreshed")
    }, 800)
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setRoleFilter("All")
    setCategoryFilter("All")
    setSeverityFilter("All")
    setStatusFilter("All")
    setCurrentPage(1)
  }

  const handleExport = () => {
    setIsExportOpen(false)
    toast.success(`Exporting logs as ${exportFormat}...`)
    // Mocking an export event addition
    const newLog = {
      _id: `AUD-${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
      performedBy: { fullName: "Hospital Admin", id: "USR-0001" },
      role: "Hospital Admin",
      organization: "Apollo City Hospital",
      action: "Audit Logs Exported",
      category: "System",
      target: "System Logs",
      ipAddress: "192.168.1.100",
      status: "Successful",
      severity: "Medium",
      device: "Safari / macOS",
      location: "Delhi, India",
      description: `Exported ${filteredLogs.length} records to ${exportFormat}.`,
      changes: [{ field: "Format", previous: "N/A", new: exportFormat }],
      sessionId: "SES-839205",
      requestId: `REQ-${Math.floor(Math.random() * 1000000)}`
    }
    setLogs(prev => [newLog, ...prev])
  }

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        log.performedBy.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log._id.toLowerCase().includes(searchQuery.toLowerCase())

      const matchRole = roleFilter === "All" || log.role === roleFilter
      const matchCategory = categoryFilter === "All" || log.category === categoryFilter
      const matchSeverity = severityFilter === "All" || log.severity === severityFilter
      const matchStatus = statusFilter === "All" || log.status === statusFilter

      return matchSearch && matchRole && matchCategory && matchSeverity && matchStatus
    })
  }, [logs, searchQuery, roleFilter, categoryFilter, severityFilter, statusFilter])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const getSeverityBadge = (severity) => {
    switch(severity) {
      case 'Info': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Info</Badge>
      case 'Low': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low</Badge>
      case 'Medium': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium</Badge>
      case 'High': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High</Badge>
      case 'Critical': return <Badge variant="destructive" className="bg-red-600 text-white border-red-600">Critical</Badge>
      default: return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Successful':
      case 'Success': return <span className="flex items-center text-emerald-600 text-xs font-semibold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Success</span>
      case 'Failed': return <span className="flex items-center text-red-600 text-xs font-semibold"><XCircle className="w-3.5 h-3.5 mr-1" /> Failed</span>
      case 'Blocked': return <span className="flex items-center text-amber-600 text-xs font-semibold"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Blocked</span>
      default: return <span className="text-slate-600 text-xs font-semibold">{status}</span>
    }
  }

  const openDetails = (log) => {
    setSelectedEvent(log)
    setIsDetailsOpen(true)
  }

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor important activity across your MediAI organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-9 w-9 p-0 border-slate-200">
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => setIsExportOpen(true)} className="h-9 gap-2 bg-slate-900 hover:bg-slate-800 text-white">
            <Download className="h-4 w-4" /> Export Logs
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl"><FileClock className="h-5 w-5 text-slate-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-bold text-slate-900">24,892</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl"><Calendar className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Today's Events</p>
              <p className="text-2xl font-bold text-slate-900">1,284</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl"><Shield className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Security Events</p>
              <p className="text-2xl font-bold text-slate-900">18</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50/30 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Critical Events</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
        
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user, patient, action or event ID..."
                className="pl-9 h-10 bg-white border-slate-200 shadow-sm text-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
               {(searchQuery || roleFilter !== 'All' || categoryFilter !== 'All' || severityFilter !== 'All' || statusFilter !== 'All') && (
                 <Button variant="ghost" onClick={handleClearFilters} className="h-10 text-slate-500 hover:text-slate-900 text-sm font-medium">
                   Clear Filters
                 </Button>
               )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className="h-9 text-sm rounded-md border border-slate-200 bg-white px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Roles</option>
              <option value="Hospital Admin">Hospital Admin</option>
              <option value="Doctor Admin">Doctor Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Staff">Staff</option>
              <option value="System">System</option>
            </select>
            
            <select className="h-9 text-sm rounded-md border border-slate-200 bg-white px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Categories</option>
              <option value="Authentication">Authentication</option>
              <option value="User Management">User Management</option>
              <option value="Patient Data">Patient Data</option>
              <option value="Medical Reports">Medical Reports</option>
              <option value="AI Activity">AI Activity</option>
              <option value="Permissions">Permissions</option>
              <option value="System">System</option>
            </select>
            
            <select className="h-9 text-sm rounded-md border border-slate-200 bg-white px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Severities</option>
              <option value="Info">Info</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

            <select className="h-9 text-sm rounded-md border border-slate-200 bg-white px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Statuses</option>
              <option value="Successful">Successful</option>
              <option value="Failed">Failed</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action & Target</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Category</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">IP Address</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Severity</TableHead>
                <TableHead className="py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-24">
                    <div className="flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">No audit events found</h3>
                      <p className="text-sm text-slate-500 mb-4 max-w-sm">Try changing your filters or search criteria to find what you're looking for.</p>
                      <Button variant="outline" onClick={handleClearFilters} className="text-sm font-medium border-slate-200">
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((log) => (
                  <TableRow key={log._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100/60 group">
                    <TableCell className="align-top py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">{log.performedBy.fullName}</span>
                        <span className="text-[11px] text-slate-500 font-medium tracking-tight mt-0.5">{log.role}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-800">{log.action}</span>
                        <span className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{log.target}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-4 hidden lg:table-cell">
                       <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-semibold whitespace-nowrap">
                         {log.category}
                       </span>
                    </TableCell>
                    <TableCell className="align-top py-4 hidden md:table-cell">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{log.ipAddress}</span>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="align-top py-4 text-center">
                      {getSeverityBadge(log.severity)}
                    </TableCell>
                    <TableCell className="align-top py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openDetails(log)} className="h-8 text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-4 gap-4 bg-slate-50/30">
            <div className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900">{indexOfFirstItem + 1}</span> to <span className="text-slate-900">{Math.min(indexOfLastItem, filteredLogs.length)}</span> of <span className="text-slate-900">{filteredLogs.length}</span> entries
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="h-8 border-slate-200">
                <ChevronLeft className="h-4 w-4 text-slate-500 mr-1" /> Previous
              </Button>
              <div className="flex items-center gap-1 hidden sm:flex">
                <Button variant="default" size="sm" className="h-8 min-w-[2rem] px-2 bg-slate-900 hover:bg-slate-800 text-white shadow-none">
                  {currentPage}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="h-8 border-slate-200">
                Next <ChevronRight className="h-4 w-4 text-slate-500 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Slide-over Drawer for Event Details */}
      {isDetailsOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsDetailsOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
            <div className="w-full h-full bg-white shadow-2xl flex flex-col transform transition-transform border-l border-slate-200">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Event Details</h2>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedEvent._id}</p>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
                
                {/* Header Info Block */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedEvent.action}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1">{selectedEvent.description}</p>
                  </div>
                  {getSeverityBadge(selectedEvent.severity)}
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400"/> {new Date(selectedEvent.createdAt).toLocaleDateString()} {new Date(selectedEvent.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target</p>
                    <p className="text-sm font-semibold text-slate-900">{selectedEvent.target}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                    <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">{selectedEvent.category}</span>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* User Info */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-4 h-4 text-teal-600"/> Identity</h4>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 font-medium">User</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedEvent.performedBy.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 font-medium">User ID</span>
                      <span className="text-xs font-mono text-slate-700">{selectedEvent.performedBy.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 font-medium">Role</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedEvent.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 font-medium">Organization</span>
                      <span className="text-sm font-semibold text-slate-900">{selectedEvent.organization}</span>
                    </div>
                  </div>
                </div>

                {/* Changes (If Any) */}
                {selectedEvent.changes && selectedEvent.changes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600"/> Modifications</h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow>
                            <TableHead className="text-xs py-2">Field</TableHead>
                            <TableHead className="text-xs py-2">Previous</TableHead>
                            <TableHead className="text-xs py-2">New</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEvent.changes.map((change, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="text-xs font-medium text-slate-900 py-2">{change.field}</TableCell>
                              <TableCell className="text-xs text-slate-500 py-2 line-through">{change.previous}</TableCell>
                              <TableCell className="text-xs text-emerald-600 font-semibold py-2">{change.new}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Technical Meta */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Monitor className="w-4 h-4 text-purple-600"/> Connection Details</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IP Address</p>
                      <p className="text-xs font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded inline-block">{selectedEvent.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400"/> {selectedEvent.location}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Device/Client</p>
                      <p className="text-sm font-medium text-slate-700">{selectedEvent.device}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Identifiers</p>
                      <div className="flex gap-4 mt-1">
                         <span className="text-xs text-slate-500">Session: <span className="font-mono text-slate-700">{selectedEvent.sessionId}</span></span>
                         <span className="text-xs text-slate-500">Request: <span className="font-mono text-slate-700">{selectedEvent.requestId}</span></span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <Button variant="outline" className="w-full bg-white border-slate-200" onClick={() => setIsDetailsOpen(false)}>Close Details</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Modal */}
      <Modal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} title="Export Audit Logs">
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 leading-relaxed">
              <strong className="block mb-1 font-bold text-amber-950">Security Notice</strong>
              Audit logs may contain sensitive security and medical-access information. By proceeding, you agree to only export data required for legitimate administrative purposes. This action will be logged.
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Select Format</label>
            <div className="grid grid-cols-3 gap-3">
              {['CSV', 'Excel', 'PDF'].map(format => (
                <button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  className={`py-3 px-4 rounded-lg border text-sm font-bold transition-all ${exportFormat === format ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-500' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsExportOpen(false)} className="border-slate-200">Cancel</Button>
            <Button onClick={handleExport} className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm">
              <Download className="h-4 w-4" /> Export {exportFormat}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
