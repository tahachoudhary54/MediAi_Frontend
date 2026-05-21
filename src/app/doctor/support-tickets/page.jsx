"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle, Clock, CheckCircle2, AlertCircle, Trash2, Send, LifeBuoy } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DoctorSupportTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "Technical",
    priority: "low",
    message: ""
  })

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(fetchTickets, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support-tickets/my')
      if (res.data.success) {
        setTickets(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await api.post('/support-tickets', formData)
      if (res.data.success) {
        toast.success("Support ticket submitted")
        setFormData({ title: "", category: "Technical", priority: "low", message: "" })
        setShowForm(false)
        fetchTickets()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit ticket")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this ticket?")) return

    try {
      const res = await api.delete(`/support-tickets/${id}`)
      if (res.data.success) {
        toast.success("Ticket deleted")
        fetchTickets()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete ticket")
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <MessageCircle className="h-4 w-4" />
      case 'in-progress': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support & Assistance</h1>
          <p className="text-slate-500">Report platform issues or request assistance from the administration team.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-teal-600 hover:bg-teal-700"}
        >
          {showForm ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Submit Ticket</>}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-in fade-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
            <CardDescription>Our technical team will review your request shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Summary</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of the issue"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Technical">Technical Issue</option>
                    <option value="Patient Records">Patient Records</option>
                    <option value="Earnings/Payments">Earnings & Payments</option>
                    <option value="System Feedback">System Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Urgency</Label>
                <div className="flex gap-6">
                  {['low', 'medium', 'high'].map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={formData.priority === p}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        className="text-teal-600 focus:ring-teal-600"
                      />
                      <span className="text-sm capitalize text-slate-700 group-hover:text-teal-600 transition-colors">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Details</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[120px] p-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                  placeholder="Explain the problem or request..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                  {isSubmitting ? "Submitting..." : <><Send className="h-4 w-4 mr-2" /> Send Request</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-xl shadow-sm">
            <LifeBuoy className="h-12 w-12 mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No support requests</h3>
            <p className="text-slate-500 mt-1">If you encounter any issues, our team is here to help.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket._id} className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{ticket.title}</h3>
                      <Badge variant="outline" className={cn(
                        "font-medium",
                        ticket.priority === 'high' ? "border-red-200 text-red-600 bg-red-50" :
                          ticket.priority === 'medium' ? "border-amber-200 text-amber-600 bg-amber-50" :
                            "border-teal-200 text-teal-600 bg-teal-50"
                      )}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">REF: {ticket._id.toUpperCase()} • {new Date(ticket.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ticket.status === 'resolved' ? 'success' : ticket.status === 'in-progress' ? 'warning' : 'outline'} className="py-1 px-3">
                      <span className="flex items-center gap-1.5 capitalize font-medium">
                        {getStatusIcon(ticket.status)}
                        {ticket.status === 'in-progress' ? 'In Progress' : ticket.status}
                      </span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-teal-600 transition-colors"
                      onClick={() => handleOpenTicket(ticket)}
                      title="View Details"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    {ticket.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 transition-colors"
                        onClick={() => handleDelete(ticket._id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-lg p-4 text-sm text-slate-700 border border-slate-100 italic">
                  "{ticket.message}"
                </div>

                {ticket.adminReply && (
                  <div className="mt-5 p-4 bg-teal-50/30 rounded-lg border border-teal-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-tighter">Official Response</span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">{ticket.adminReply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ticket Details"
        className="max-w-2xl"
      >
        {selectedTicket && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                <p className="text-sm font-semibold text-slate-900">{selectedTicket.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority & ID</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    "font-medium py-0 text-[10px] h-5",
                    selectedTicket.priority === 'high' ? "border-red-200 text-red-600 bg-red-50" :
                      selectedTicket.priority === 'medium' ? "border-amber-200 text-amber-600 bg-amber-50" :
                        "border-teal-200 text-teal-600 bg-teal-50"
                  )}>
                    {selectedTicket.priority}
                  </Badge>
                  <span className="text-xs text-slate-500 font-mono">#{selectedTicket._id.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted Date</p>
                <p className="text-xs text-slate-600">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                <Badge variant={selectedTicket.status === 'resolved' ? 'success' : selectedTicket.status === 'in-progress' ? 'warning' : 'outline'} className="capitalize">
                  {selectedTicket.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">{selectedTicket.title}</h3>
              <div className="p-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 leading-relaxed shadow-inner italic">
                "{selectedTicket.message}"
              </div>
            </div>

            {selectedTicket.adminReply ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs font-bold text-teal-700 uppercase tracking-tighter">Official Admin Response</span>
                </div>
                <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100 text-sm text-slate-800 leading-relaxed">
                  {selectedTicket.adminReply}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-center">
                <p className="text-sm text-slate-500 italic flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" /> Waiting for administrator review...
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button onClick={() => setIsModalOpen(false)} className="bg-slate-900 hover:bg-slate-800">Close Details</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function cn(...inputs) {
  return inputs.filter(Boolean).join(" ")
}
