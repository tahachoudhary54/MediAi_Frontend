"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Plus, Edit2, Trash2, Eye, EyeOff, Filter, Users, UserCheck, UserX, UserPlus, Activity, Clock, ShieldAlert } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState(null)
  const [userEmergencies, setUserEmergencies] = useState([])
  const [isEmergenciesLoading, setIsEmergenciesLoading] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", mustChangePassword: false, phone: "", age: "", sex: "male", bloodGroup: "", allergies: "", currentMedications: "", previousDiseaseHistory: "", familyDiseaseHistory: "", emergencyContact: "", accountStatus: "active"
  })

  const [isLoading, setIsLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/admin/users')
      if (res.data.success) {
        setUsers(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error(typeof error === 'string' ? error : "Failed to load user list")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const nameMatch = user.fullName ? user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const emailMatch = user.email ? user.email.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const matchesSearch = nameMatch || emailMatch;

      const status = user.accountStatus === 'suspended' ? 'Suspended' : (user.isActive === false ? 'Pending' : 'Active');
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.accountStatus !== "suspended" && u.isActive !== false).length,
    suspended: users.filter(u => u.accountStatus === "suspended").length,
    newThisMonth: users.filter(u => new Date(u.createdAt) > new Date(new Date().setDate(1))).length
  }

  const handleOpenAdd = () => {
    setFormData({
      fullName: "", email: "", password: "password123", confirmPassword: "password123", mustChangePassword: true, phone: "", age: "", sex: "male",
      bloodGroup: "", allergies: "", currentMedications: "",
      previousDiseaseHistory: "", familyDiseaseHistory: "",
      emergencyContact: "", accountStatus: "active"
    })
    setSelectedUser(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEdit = (user) => {
    // Convert arrays to comma-separated strings for the form
    const formatArray = (arr) => Array.isArray(arr) ? arr.join(', ') : (arr || "");

    // Convert emergencyContact object to string for the form
    const formatEC = (ec) => {
      if (typeof ec === 'object' && ec !== null) {
        return `${ec.name || ""}${ec.phone ? ", " + ec.phone : ""}${ec.relation ? ", " + ec.relation : ""}`;
      }
      return ec || "";
    };

    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      mustChangePassword: user.mustChangePassword || false,
      phone: user.phone || "",
      age: user.age || "",
      sex: user.sex || "male",
      bloodGroup: user.bloodGroup || "",
      allergies: formatArray(user.allergies),
      currentMedications: formatArray(user.currentMedications),
      previousDiseaseHistory: formatArray(user.previousDiseaseHistory),
      familyDiseaseHistory: formatArray(user.familyDiseaseHistory),
      emergencyContact: formatEC(user.emergencyContact),
      accountStatus: user.accountStatus || "active"
    })
    setSelectedUser(user)
    setIsFormModalOpen(true)
  }

  const handleOpenView = async (user) => {
    setSelectedUser(user)
    setIsViewModalOpen(true)
    setUserEmergencies([])
    setIsEmergenciesLoading(true)
    try {
      const res = await api.get('/admin/emergencies')
      if (res.data.success) {
        setUserEmergencies(res.data.data.filter(e => e.patient?._id === user._id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch emergencies", err)
    } finally {
      setIsEmergenciesLoading(false)
    }
  }

  const handleOpenDelete = (user) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleSaveUser = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match")
    }

    if (!selectedUser && formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters")
    }

    try {
      // Process strings back into arrays/objects
      const processArray = (str) => typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(s => s !== "") : str;

      const processedData = {
        ...formData,
        allergies: processArray(formData.allergies),
        currentMedications: processArray(formData.currentMedications),
        previousDiseaseHistory: processArray(formData.previousDiseaseHistory),
        familyDiseaseHistory: processArray(formData.familyDiseaseHistory),
        sex: (formData.sex || "male").toLowerCase(),
      };

      // Process emergency contact (expecting "Name, Phone, Relation")
      if (typeof formData.emergencyContact === 'string' && formData.emergencyContact.includes(',')) {
        const parts = formData.emergencyContact.split(',').map(p => p.trim());
        processedData.emergencyContact = {
          name: parts[0] || "",
          phone: parts[1] || "",
          relation: parts[2] || ""
        };
      } else if (typeof formData.emergencyContact === 'string') {
        processedData.emergencyContact = { name: formData.emergencyContact, phone: "", relation: "" };
      }

      // If editing, remove password if empty
      if (selectedUser && !processedData.password) {
        delete processedData.password;
      }

      if (selectedUser) {
        await api.put(`/admin/users/${selectedUser._id}`, processedData)
      } else {
        await api.post('/admin/users', processedData)
      }

      toast.success(selectedUser ? "User updated" : "User created")
      await fetchUsers()
      setIsFormModalOpen(false)
    } catch (err) {
      console.error("Failed to save user", err)
      const errorMsg = err.response?.data?.message || err.message || "Failed to save user.";
      toast.error(errorMsg)
    }
  }

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/users/${selectedUser._id}`)
      toast.success("User deleted")
      await fetchUsers()
      setIsDeleteModalOpen(false)
    } catch (err) {
      console.error("Failed to delete user", err)
      toast.error("Failed to delete user.")
    }
  }

  const handleToggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`)
      toast.success("Status updated")
      await fetchUsers()
    } catch (err) {
      console.error("Failed to toggle status", err)
      toast.error("Failed to update status")
    }
  }


  const getStatusBadgeVariant = (user) => {
    if (user.accountStatus === 'suspended') return "destructive"
    if (user.isActive === false) return "warning"
    return "success"
  }

  const getStatusText = (user) => {
    if (user.accountStatus === 'suspended') return "Suspended"
    if (user.isActive === false) return "Pending"
    return "Active"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-slate-500">Manage all patient accounts across the platform.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Suspended Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.suspended}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-lg">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">New This Month</p>
              <h3 className="text-2xl font-bold text-slate-900">{stats.newThisMonth}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Demographics</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status & Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">{user.fullName}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">{user.age} yrs • {user.sex}</div>
                      <div className="text-xs text-slate-500">Blood: {user.bloodGroup}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">{user.phone || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant={getStatusBadgeVariant(user)}>{getStatusText(user)}</Badge>
                        <span className="text-xs text-slate-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenView(user)} title="View Details">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleStatus(user)} title={user.accountStatus === "active" ? "Suspend User" : "Activate User"}>
                          {user.accountStatus === "active" ? <UserX className="w-4 h-4 text-amber-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(user)} title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={selectedUser ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="text-slate-900" />
            </div>
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="text-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            {!selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm Password <span className="text-red-500">*</span></Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="text-slate-900"
                />
              </div>
            )}
            {selectedUser && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">New Password (optional)</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="text-slate-900 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}
            {selectedUser && formData.password && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="text-slate-900"
                />
              </div>
            )}
            <div className="space-y-2 py-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="mustChangePassword"
                checked={formData.mustChangePassword}
                onChange={e => setFormData({ ...formData, mustChangePassword: e.target.checked })}
                className="rounded border-slate-300 text-teal-600"
              />
              <Label htmlFor="mustChangePassword" className="text-slate-700 cursor-pointer">Require password change on first login</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-slate-700">Age</Label>
              <Input id="age" type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex" className="text-slate-700">Sex</Label>
              <select
                id="sex"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={formData.sex}
                onChange={e => setFormData({ ...formData, sex: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="text-slate-700">Blood Group</Label>
              <Input id="bloodGroup" value={formData.bloodGroup} onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="allergies" className="text-slate-700">Allergies (comma separated)</Label>
              <Input id="allergies" placeholder="Peanuts, Dust, etc." value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="currentMedications" className="text-slate-700">Current Medications</Label>
              <Input id="currentMedications" value={formData.currentMedications} onChange={e => setFormData({ ...formData, currentMedications: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="previousDiseaseHistory" className="text-slate-700">Previous Disease History</Label>
              <Input id="previousDiseaseHistory" value={formData.previousDiseaseHistory} onChange={e => setFormData({ ...formData, previousDiseaseHistory: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="familyDiseaseHistory" className="text-slate-700">Family Disease History</Label>
              <Input id="familyDiseaseHistory" value={formData.familyDiseaseHistory} onChange={e => setFormData({ ...formData, familyDiseaseHistory: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="text-slate-700">Emergency Contact (Name, Phone, Relation)</Label>
              <Input id="emergencyContact" placeholder="John Doe, 1234567890, Brother" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountStatus" className="text-slate-700">Status</Label>
              <select
                id="accountStatus"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={formData.accountStatus}
                onChange={e => setFormData({ ...formData, accountStatus: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600">Are you sure you want to delete user <span className="font-semibold text-slate-900">{selectedUser?.fullName}</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteUser}>Delete User</Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="User Profile Details">
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Full Name</p>
                <p className="font-medium text-slate-900">{selectedUser.fullName}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(selectedUser)}>{getStatusText(selectedUser)}</Badge>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Phone</p>
                <p className="font-medium text-slate-900">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Age & Sex</p>
                <p className="font-medium text-slate-900">{selectedUser.age || 'N/A'} years, {selectedUser.sex || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Blood Group</p>
                <p className="font-medium text-slate-900">{selectedUser.bloodGroup || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-sm">
              <h4 className="font-semibold text-slate-900">Medical Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-slate-500 mb-1">Allergies</p>
                  <p className="font-medium text-slate-900">{Array.isArray(selectedUser.allergies) ? selectedUser.allergies.join(', ') : (selectedUser.allergies || "None")}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Current Medications</p>
                  <p className="font-medium text-slate-900">{Array.isArray(selectedUser.currentMedications) ? selectedUser.currentMedications.join(', ') : (selectedUser.currentMedications || "None")}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Previous Disease History</p>
                  <p className="font-medium text-slate-900">{Array.isArray(selectedUser.previousDiseaseHistory) ? selectedUser.previousDiseaseHistory.join(', ') : (selectedUser.previousDiseaseHistory || "None")}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Family Disease History</p>
                  <p className="font-medium text-slate-900">{Array.isArray(selectedUser.familyDiseaseHistory) ? selectedUser.familyDiseaseHistory.join(', ') : (selectedUser.familyDiseaseHistory || "None")}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Emergency Contact</p>
                  <p className="font-medium text-slate-900">
                    {typeof selectedUser.emergencyContact === 'object' && selectedUser.emergencyContact !== null 
                      ? `${selectedUser.emergencyContact.name || ""}${selectedUser.emergencyContact.phone ? ", " + selectedUser.emergencyContact.phone : ""}${selectedUser.emergencyContact.relation ? ", " + selectedUser.emergencyContact.relation : ""}` 
                      : (selectedUser.emergencyContact || "None")}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-sm">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500" /> Emergency History</h4>

              {isEmergenciesLoading ? (
                <p className="text-slate-500 py-2">Loading emergency history...</p>
              ) : userEmergencies.length === 0 ? (
                <p className="text-slate-500 py-2">No emergency history found.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Total SOS Raised</p>
                      <p className="text-lg font-bold text-slate-900">{userEmergencies.length}</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <p className="text-xs text-emerald-600 mb-1">Resolved</p>
                      <p className="text-lg font-bold text-emerald-700">{userEmergencies.filter(e => e.status === 'resolved').length}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <p className="text-xs text-amber-600 mb-1">Pending/Active</p>
                      <p className="text-lg font-bold text-amber-700">{userEmergencies.filter(e => e.status !== 'resolved').length}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">Last Emergency</p>
                      <p className="text-sm font-bold text-blue-700 mt-1">{new Date(userEmergencies[0].createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {userEmergencies.map(e => (
                      <div key={e._id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={e.status === 'resolved' ? 'success' : 'warning'}>{e.status}</Badge>
                            <Badge variant={e.riskLevel === 'Critical' ? 'destructive' : 'default'} className={e.riskLevel === 'Critical' ? 'bg-red-500' : ''}>{e.riskLevel} Risk</Badge>
                          </div>
                          <p className="text-sm font-medium text-slate-900">{e.symptoms}</p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p className="flex items-center justify-end gap-1"><Clock className="h-3 w-3" /> {new Date(e.createdAt).toLocaleDateString()}</p>
                          <p>{new Date(e.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end border-t border-slate-100">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
