"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle, Clock, CheckCircle2, AlertCircle, Trash2, Send } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function PatientSupportTickets() {
  const [tickets, setTickets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

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
        toast.success("Ticket submitted successfully")
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
    if (!confirm("Are you sure you want to delete this ticket?")) return

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return "text-red-600 bg-red-50 border-red-100"
      case 'medium': return "text-amber-600 bg-amber-50 border-amber-100"
      case 'low': return "text-teal-600 bg-teal-50 border-teal-100"
      default: return "text-slate-600 bg-slate-50 border-slate-100"
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Tickets</h1>
          <p className="text-slate-500">Need help? Submit a ticket and our team will assist you.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-teal-600 hover:bg-teal-700"}
        >
          {showForm ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> New Ticket</>}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Submit New Ticket</CardTitle>
            <CardDescription>Provide details about the issue you're facing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief summary of the problem"
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
                    <option value="Billing">Billing & Payments</option>
                    <option value="Appointment">Appointment Related</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={formData.priority === p}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        className="text-teal-600 focus:ring-teal-600"
                      />
                      <span className="text-sm capitalize text-slate-700">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Detailed Message</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[120px] p-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none"
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 min-w-[120px]">
                  {isSubmitting ? "Submitting..." : <><Send className="h-4 w-4 mr-2" /> Submit Ticket</>}
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
          <div className="text-center py-16 bg-white border border-slate-200 border-dashed rounded-xl">
            <MessageCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No tickets found</h3>
            <p className="text-slate-500 mt-1">You haven't submitted any support tickets yet.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket._id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">{ticket.title}</h3>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">ID: #{ticket._id.slice(-6).toUpperCase()} • Submitted on {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={ticket.status === 'resolved' ? 'success' : ticket.status === 'in-progress' ? 'warning' : 'outline'} className="py-1 px-3">
                        <span className="flex items-center gap-1.5 font-medium capitalize">
                          {getStatusIcon(ticket.status)}
                          {ticket.status === 'in-progress' ? 'In Progress' : ticket.status}
                        </span>
                      </Badge>
                      {ticket.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(ticket._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 border border-slate-100">
                    <p className="whitespace-pre-wrap">{ticket.message}</p>
                  </div>

                  {ticket.adminReply && (
                    <div className="mt-4 pl-4 border-l-4 border-teal-500 py-1">
                      <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Admin Response</p>
                      <p className="text-sm text-slate-800 bg-teal-50/30 p-3 rounded-r-lg border border-teal-100/50">{ticket.adminReply}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
