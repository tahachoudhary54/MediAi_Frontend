"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle, Trash2, User, Mail, Tag, Send } from "lucide-react"
import { Input, Label } from "@/components/ui/input"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [roleFilter, setRoleFilter] = useState("All")

  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [ticketStatus, setTicketStatus] = useState("")

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/admin/support-tickets')
      if (res.data.success) {
        setTickets(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch admin support tickets:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.createdBy?.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "All" || ticket.status?.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority = priorityFilter === "All" || ticket.priority === priorityFilter
    const matchesRole = roleFilter === "All" || ticket.role === roleFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority && matchesRole
  })

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket)
    setReplyText(ticket.adminReply || "")
    setTicketStatus(ticket.status)
    setIsModalOpen(true)
  }

  const handleUpdateTicket = async (e) => {
    e.preventDefault()
    try {
      const res = await api.patch(`/admin/support-tickets/${selectedTicket._id}`, {
        status: ticketStatus,
        adminReply: replyText
      })
      if (res.data.success) {
        toast.success("Ticket updated successfully")
        fetchTickets()
        setIsModalOpen(false)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update ticket")
    }
  }

  const handleDeleteTicket = async (id) => {
    if (!confirm("Delete this ticket permanently?")) return
    try {
      const res = await api.delete(`/admin/support-tickets/${id}`)
      if (res.data.success) {
        toast.success("Ticket deleted")
        fetchTickets()
      }
    } catch (err) {
      toast.error("Failed to delete ticket")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="border-blue-200 text-blue-600 bg-blue-50">Pending</Badge>
      case 'in-progress': return <Badge variant="warning">In Progress</Badge>
      case 'resolved': return <Badge variant="success">Resolved</Badge>
      default: return <Badge variant="secondary" className="capitalize">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return <Badge className="bg-red-500">High</Badge>
      case 'medium': return <Badge className="bg-amber-500">Medium</Badge>
      case 'low': return <Badge className="bg-teal-500">Low</Badge>
      default: return <Badge variant="secondary">{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Ticket Management</h1>
          <p className="text-slate-500">Review and resolve issues reported by patients and doctors.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-2 border-slate-200">
            <Clock className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><AlertCircle className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Tickets</p>
              <h3 className="text-2xl font-bold text-slate-900">{tickets.filter(t => t.status === 'pending').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <h3 className="text-2xl font-bold text-slate-900">{tickets.filter(t => t.status === 'in-progress').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-lg"><CheckCircle2 className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resolved Today</p>
              <h3 className="text-2xl font-bold text-slate-900">{tickets.filter(t => t.status === 'resolved' && new Date(t.updatedAt).toDateString() === new Date().toDateString()).length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value)}
              >
                <option value="All">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Title & Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-sm text-slate-500">Loading support tickets...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No tickets found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket._id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="text-sm text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase",
                          ticket.role === 'doctor' ? "bg-blue-600" : "bg-teal-600"
                        )}>
                          {ticket.role.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{ticket.createdBy?.fullName || "User"}</div>
                          <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                            {ticket.role === 'doctor' ? <Stethoscope className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                            {ticket.role}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800 line-clamp-1">{ticket.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {ticket.category}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenTicket(ticket)} className="text-slate-500 hover:text-teal-600">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTicket(ticket._id)} className="text-slate-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticket Management Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Manage Support Ticket"
        className="max-w-2xl"
      >
        {selectedTicket && (
          <form onSubmit={handleUpdateTicket} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reporter</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.createdBy?.fullName} <Badge variant="secondary" className="ml-2 text-[10px] uppercase py-0">{selectedTicket.role}</Badge></p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="h-3 w-3" /> {selectedTicket.createdBy?.email}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category & Priority</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.category} • {getPriorityBadge(selectedTicket.priority)}</p>
                <p className="text-xs text-slate-500">Submitted on {new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">{selectedTicket.title}</h3>
              <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed shadow-inner">
                {selectedTicket.message}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-status">Update Status</Label>
                <select
                  id="ticket-status"
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  value={ticketStatus}
                  onChange={e => setTicketStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-reply">Admin Response</Label>
              <textarea
                id="admin-reply"
                className="w-full min-h-[120px] p-3 rounded-md border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none shadow-sm"
                placeholder="Type your response here..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 gap-2">
                <Send className="h-4 w-4" /> Save Changes & Update
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}

// Minimal Stethoscope icon if missing from previous views
function Stethoscope(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  )
}
