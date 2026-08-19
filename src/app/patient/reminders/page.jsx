"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { Bell, Plus, Check, X, Clock, Settings2, Moon, Sun, Sunrise, Trash2, Edit2 } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function MedicineReminders() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [reminders, setReminders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    medicineName: "",
    time: "",
    period: "Morning",
    instructions: ""
  })

  const fetchReminders = async (isPolling = false) => {
    try {
      if (!isPolling) setIsLoading(true)
      const res = await api.get('/medicines/patient')
      if (res.data.success) {
        setReminders(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch medicine reminders:", err)
    } finally {
      if (!isPolling) setIsLoading(false)
    }
  }

  const [triggeredAlarms, setTriggeredAlarms] = useState(new Set())

  useEffect(() => {
    fetchReminders()
    const interval = setInterval(() => fetchReminders(true), 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  // Alarm checking effect
  useEffect(() => {
    if (!reminders || reminders.length === 0) return;

    const checkAlarms = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      reminders.forEach(reminder => {
        if (reminder.status === 'pending' && reminder.time === currentTime) {
          const alarmKey = `${reminder._id}-${currentTime}`;
          if (!triggeredAlarms.has(alarmKey)) {
            // Mark as triggered in state so it doesn't loop
            setTriggeredAlarms(prev => {
              const next = new Set(prev);
              next.add(alarmKey);
              return next;
            });

            // Visual toast
            toast(`Time to take your medicine: ${reminder.medicineName}`, {
              duration: 10000,
              icon: '🔔',
              style: {
                border: '1px solid #0d9488',
                padding: '16px',
                color: '#0f766e',
                fontWeight: 'bold'
              },
            });

            // Voice alarm
            if ('speechSynthesis' in window) {
              // Cancel any ongoing speech before starting a new one
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(
                `Reminder! It is time to take your medicine: ${reminder.medicineName}. ${reminder.instructions ? reminder.instructions : ''}`
              );
              utterance.rate = 0.9; // Slightly slower for clarity
              window.speechSynthesis.speak(utterance);
            }
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 5000); // Check every 5 seconds
    checkAlarms(); // Run once immediately

    return () => clearInterval(interval);
  }, [reminders, triggeredAlarms]);

  const handleSaveReminder = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, formData)
        toast.success("Reminder updated")
      } else {
        await api.post('/medicines', formData)
        toast.success("Reminder added")
      }
      fetchReminders()
      setIsAddModalOpen(false)
      setEditingId(null)
      setFormData({ medicineName: "", time: "", period: "Morning", instructions: "" })
    } catch (err) {
      console.error("Failed to save reminder:", err)
      toast.error("Failed to save reminder")
    }
  }

  const openEditModal = (reminder) => {
    setEditingId(reminder._id)
    setFormData({
      medicineName: reminder.medicineName,
      time: reminder.time,
      period: reminder.period,
      instructions: reminder.instructions || ""
    })
    setIsAddModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsAddModalOpen(false)
    setEditingId(null)
    setFormData({ medicineName: "", time: "", period: "Morning", instructions: "" })
  }

  const handleDeleteReminder = async (id) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await api.delete(`/medicines/${id}`)
      toast.success("Reminder deleted")
      fetchReminders()
    } catch (err) {
      console.error("Failed to delete reminder:", err)
      toast.error("Failed to delete reminder")
    }
  }

  const toggleStatus = async (id, newStatus) => {
    try {
      // Optimistic update
      setReminders(reminders.map(r => r._id === id ? { ...r, status: newStatus } : r))
      await api.put(`/medicines/${id}/status`, { status: newStatus })
    } catch (err) {
      console.error("Failed to update status:", err)
      // Revert on failure
      fetchReminders()
    }
  }

  const getPeriodIcon = (period) => {
    const p = period.toLowerCase()
    if (p === 'morning') return <Sunrise className="h-5 w-5 text-amber-500" />
    if (p === 'afternoon') return <Sun className="h-5 w-5 text-orange-500" />
    if (p === 'night') return <Moon className="h-5 w-5 text-indigo-500" />
    return <Clock className="h-5 w-5 text-slate-500" />
  }

  const pendingReminders = reminders.filter(r => r.status === 'pending')
  const nextReminder = pendingReminders.length > 0 ? pendingReminders[0] : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medicine Reminders</h1>
          <p className="text-slate-500">Manage your daily medication schedule.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Settings2 className="h-5 w-5 text-slate-600" />
          </Button>
          <Button className="gap-2" onClick={() => {
            setEditingId(null)
            setFormData({ medicineName: "", time: "", period: "Morning", instructions: "" })
            setIsAddModalOpen(true)
          }}>
            <Plus className="h-4 w-4" /> Add Reminder
          </Button>
        </div>
      </div>

      {/* Reminder Notification Banner */}
      {nextReminder && (
        <Card className="border-teal-200 bg-teal-50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center animate-pulse shrink-0">
                <Bell className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="font-semibold text-teal-900">Next medication</p>
                <p className="text-sm text-teal-700 font-medium">{nextReminder.medicineName} • {nextReminder.time}</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="bg-white text-slate-600 border-teal-200 flex-1 sm:flex-none" onClick={() => toggleStatus(nextReminder._id, 'skipped')}>Skip</Button>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white flex-1 sm:flex-none" onClick={() => toggleStatus(nextReminder._id, 'taken')}>Take Now</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule List */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-xl border-dashed">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No active reminders</h3>
            <p className="text-slate-500 mt-1 mb-4">Add your first medicine reminder.</p>
            <Button onClick={() => setIsAddModalOpen(true)}>Add Reminder</Button>
          </div>
        ) : (
          ['Morning', 'Afternoon', 'Night'].map((period) => {
            const periodReminders = reminders.filter(r => r.period.toLowerCase() === period.toLowerCase())
            if (periodReminders.length === 0) return null;

            return (
              <div key={period} className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
                  {getPeriodIcon(period)} {period}
                </h3>
                <div className="grid gap-4">
                  {periodReminders.map((reminder) => (
                    <Card key={reminder._id} className={`group ${reminder.status === 'taken' ? 'opacity-60 bg-slate-50' : ''}`}>
                      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-slate-100 rounded-lg flex flex-col items-center justify-center shrink-0 border border-slate-200">
                            <span className="text-sm font-bold text-slate-900">
                              {reminder.time.includes(' ') ? reminder.time.split(' ')[0] : reminder.time}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase">
                              {reminder.time.includes(' ') ? reminder.time.split(' ')[1] : ''}
                            </span>
                          </div>
                          <div>
                            <h4 className={`text-lg font-semibold ${reminder.status === 'taken' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                              {reminder.medicineName}
                            </h4>
                            <p className="text-sm text-slate-500">{reminder.instructions}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-16 sm:ml-0">
                          {reminder.status === 'taken' ? (
                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-100">
                              <Check className="h-4 w-4" /> Taken
                            </div>
                          ) : reminder.status === 'skipped' ? (
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
                              <X className="h-4 w-4" /> Skipped
                            </div>
                          ) : (
                            <>
                              <Button variant="outline" size="sm" onClick={() => toggleStatus(reminder._id, 'skipped')}>Skip</Button>
                              <Button size="sm" onClick={() => toggleStatus(reminder._id, 'taken')} className="gap-1 bg-teal-600 hover:bg-teal-700">
                                <Check className="h-4 w-4" /> Mark Taken
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => openEditModal(reminder)} className="ml-2" title="Edit">
                            <Edit2 className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteReminder(reminder._id)} title="Delete">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={handleCloseModal} title={editingId ? "Edit Medicine Reminder" : "Add Medicine Reminder"}>
        <form onSubmit={handleSaveReminder} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medName">Medicine Name</Label>
            <Input
              id="medName"
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.medicineName}
              onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <select
                id="period"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instruction">Instructions</Label>
            <Input
              id="instruction"
              placeholder="e.g. After food"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingId ? "Update Reminder" : "Save Reminder"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
