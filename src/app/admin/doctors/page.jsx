"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Search, Plus, Edit2, Trash2, Eye, Filter } from "lucide-react"
import api from "@/lib/api"
import { toast } from "react-hot-toast"

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [specFilter, setSpecFilter] = useState("All")
  const [verifFilter, setVerifFilter] = useState("All")

  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", specialization: "", licenseNumber: "", yearsOfExperience: "", hospitalName: "", clinicAddress: "", verificationStatus: "pending", accountStatus: "active"
  })

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/admin/doctors')
      if (res.data.success) {
        setDoctors(res.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
      }
    } catch (err) {
      console.error("Failed to fetch doctors:", err)
      toast.error(typeof err === 'string' ? err : "Failed to load doctor data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
    const interval = setInterval(fetchDoctors, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const nameMatch = doc.fullName ? doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const specMatch = doc.specialization ? doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) : false;
      const matchesSearch = nameMatch || specMatch;

      const matchesSpec = specFilter === "All" || doc.specialization === specFilter;

      let vStatus = "Pending"
      if (doc.verificationStatus === "approved") vStatus = "Verified"
      else if (doc.verificationStatus === "rejected") vStatus = "Rejected"

      const matchesVerif = verifFilter === "All" || vStatus === verifFilter;
      return matchesSearch && matchesSpec && matchesVerif;
    });
  }, [doctors, searchQuery, specFilter, verifFilter]);

  const specializations = ["All", ...new Set(doctors.map(d => d.specialization).filter(Boolean))];


  const handleOpenEdit = (doctor) => {
    setFormData({
      fullName: doctor.fullName || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      licenseNumber: doctor.licenseNumber || "",
      yearsOfExperience: doctor.yearsOfExperience || "",
      hospitalName: doctor.hospitalName || "",
      clinicAddress: doctor.clinicAddress || "",
      verificationStatus: doctor.verificationStatus || "pending",
      accountStatus: doctor.accountStatus || "active"
    })
    setSelectedDoctor(doctor)
    setIsFormModalOpen(true)
  }

  const handleOpenView = (doctor) => {
    setSelectedDoctor(doctor)
    setIsViewModalOpen(true)
  }

  const handleOpenDelete = (doctor) => {
    setSelectedDoctor(doctor)
    setIsDeleteModalOpen(true)
  }

  const handleSaveDoctor = async (e) => {
    e.preventDefault()
    if (selectedDoctor) {
      try {
        await api.put(`/admin/doctors/${selectedDoctor._id}`, formData)
        toast.success("Doctor details updated")
        fetchDoctors()
        setIsFormModalOpen(false)
      } catch (err) {
        console.error("Failed to update doctor:", err)
        toast.error("Failed to update doctor")
      }
    }
  }

  const handleDeleteDoctor = async () => {
    if (selectedDoctor) {
      try {
        await api.delete(`/admin/doctors/${selectedDoctor._id}`)
        toast.success("Doctor deleted")
        fetchDoctors()
        setIsDeleteModalOpen(false)
      } catch (err) {
        console.error("Failed to delete doctor:", err)
        toast.error("Failed to delete doctor")
      }
    }
  }

  const getStatusBadgeVariant = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "active" || s === "approved" || s === "verified") return "success";
    if (s === "pending") return "warning";
    if (s === "suspended" || s === "rejected") return "destructive";
    return "default";
  }

  const getDisplayStatus = (status) => {
    const s = status ? status.toLowerCase() : "";
    if (s === "approved") return "Verified";
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Doctors</h1>
          <p className="text-slate-500">Manage all doctor accounts and verifications.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or specialization..."
                className="pl-9 text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  value={specFilter}
                  onChange={(e) => setSpecFilter(e.target.value)}
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec === "All" ? "All Specialties" : spec}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  value={verifFilter}
                  onChange={(e) => setVerifFilter(e.target.value)}
                >
                  <option value="All">All Verifications</option>
                  <option value="Verified">Verified</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Loading doctors...
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No doctors found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map(doctor => (
                  <TableRow key={doctor._id}>
                    <TableCell className="font-medium text-slate-900">{doctor.fullName}</TableCell>
                    <TableCell className="text-slate-700">{doctor.specialization}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-900">{doctor.email}</span>
                        <span className="text-xs text-slate-500">{doctor.phone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doctor.verificationStatus)}>{getDisplayStatus(doctor.verificationStatus)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(doctor.accountStatus)}>{getDisplayStatus(doctor.accountStatus)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenView(doctor)} title="View Details">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(doctor)} title="Delete">
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
        title="Edit Doctor"
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-700">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-slate-700">Specialization</Label>
              <Input id="specialization" value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseNumber" className="text-slate-700">License Number</Label>
              <Input id="licenseNumber" value={formData.licenseNumber} onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience" className="text-slate-700">Years of Experience</Label>
              <Input id="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={e => setFormData({ ...formData, yearsOfExperience: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hospitalName" className="text-slate-700">Hospital / Clinic Name</Label>
              <Input id="hospitalName" value={formData.hospitalName} onChange={e => setFormData({ ...formData, hospitalName: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="clinicAddress" className="text-slate-700">Clinic Address</Label>
              <Input id="clinicAddress" value={formData.clinicAddress} onChange={e => setFormData({ ...formData, clinicAddress: e.target.value })} required className="text-slate-900" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="verificationStatus" className="text-slate-700">Verification Status</Label>
              <select
                id="verificationStatus"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                value={formData.verificationStatus}
                onChange={e => setFormData({ ...formData, verificationStatus: e.target.value })}
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountStatus" className="text-slate-700">Account Status</Label>
              <select
                id="accountStatus"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
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
          <p className="text-slate-600">Are you sure you want to delete <span className="font-semibold text-slate-900">{selectedDoctor?.fullName}</span>? This action cannot be undone.</p>
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteDoctor}>Delete Doctor</Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Doctor Details">
        {selectedDoctor && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Full Name</p>
                <p className="font-medium text-slate-900">{selectedDoctor.fullName}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Status / Verification</p>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(selectedDoctor.accountStatus)}>{getDisplayStatus(selectedDoctor.accountStatus)}</Badge>
                  <Badge variant={getStatusBadgeVariant(selectedDoctor.verificationStatus)}>{getDisplayStatus(selectedDoctor.verificationStatus)}</Badge>
                </div>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Specialization</p>
                <p className="font-medium text-slate-900">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">License Number</p>
                <p className="font-medium text-slate-900">{selectedDoctor.licenseNumber}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Email</p>
                <p className="font-medium text-slate-900">{selectedDoctor.email}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Phone</p>
                <p className="font-medium text-slate-900">{selectedDoctor.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Years of Experience</p>
                <p className="font-medium text-slate-900">{selectedDoctor.yearsOfExperience} years</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-4 text-sm">
              <h4 className="font-semibold text-slate-900">Clinic / Hospital Information</h4>
              <div className="grid grid-cols-1 gap-y-4 gap-x-6">
                <div>
                  <p className="text-slate-500 mb-1">Hospital / Clinic Name</p>
                  <p className="font-medium text-slate-900">{selectedDoctor.hospitalName}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Clinic Address</p>
                  <p className="font-medium text-slate-900">{selectedDoctor.clinicAddress}</p>
                </div>
              </div>
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
