"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, FileClock, User, Shield, Activity, Calendar } from "lucide-react"
import api from "@/lib/api"

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [actionFilter, setActionFilter] = useState("All")
  const [roleFilter, setRoleFilter] = useState("All")

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs')
      if (res.data.success) {
        setLogs(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const actionTypes = ["All", ...new Set(logs.map(log => log.action))];

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const performedBy = log.performedBy?.fullName || ""
      const action = log.action || ""
      const target = log.target || ""
      
      const matchesSearch = performedBy.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           target.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesAction = actionFilter === "All" || log.action === actionFilter
      const matchesRole = roleFilter === "All" || log.role === roleFilter.toLowerCase()
      
      return matchesSearch && matchesAction && matchesRole
    })
  }, [logs, searchQuery, actionFilter, roleFilter])

  const getActionBadge = (action) => {
    if (action.includes('CREATED')) return <Badge variant="success" className="text-[10px]">{action}</Badge>
    if (action.includes('DELETED')) return <Badge variant="destructive" className="text-[10px]">{action}</Badge>
    if (action.includes('UPDATED')) return <Badge variant="info" className="text-[10px] bg-blue-100 text-blue-700 border-blue-200">{action}</Badge>
    if (action.includes('APPROVED')) return <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">{action}</Badge>
    return <Badge variant="default" className="text-[10px]">{action}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="text-slate-500">Security event history and administrative actions.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search logs by user, action or target..."
                className="pl-9 bg-white text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Activity className="w-4 h-4 text-slate-500" />
                <select 
                  className="flex h-10 w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  {actionTypes.map(type => (
                    <option key={type} value={type}>{type === "All" ? "All Actions" : type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Shield className="w-4 h-4 text-slate-500" />
                <select 
                  className="flex h-10 w-full sm:w-36 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center">
                        <FileClock className="h-12 w-12 text-slate-200 mb-3" />
                        <p className="text-lg font-semibold text-slate-900">No logs found</p>
                        <p className="text-slate-500">No activity matching your criteria was recorded.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3 text-slate-400" /> {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{log.performedBy?.fullName || "System"}</p>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter py-0 h-4">{log.role}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700">{log.target}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.targetId ? `ID: ${log.targetId.substring(0, 8)}...` : ""}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-[260px] h-[76px]">
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col justify-center gap-2 shadow-sm w-full h-full overflow-hidden">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2 text-xs leading-tight shrink-0">
                                  <span className="font-medium text-slate-700 capitalize whitespace-nowrap">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="text-slate-600 break-words truncate">
                                    {typeof value === 'object' && value !== null 
                                      ? Array.isArray(value) 
                                        ? value.join(', ') 
                                        : Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')
                                      : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center w-full h-full px-3 text-xs text-slate-400 italic">
                              No additional details
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
