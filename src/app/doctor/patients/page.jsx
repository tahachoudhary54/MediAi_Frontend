"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Users, Search, Calendar, FileText, Activity, HeartPulse, AlertTriangle, User, Phone, Droplet, ShieldAlert, FileClock, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function DoctorPatients() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch patient list
  const fetchPatients = async () => {
    try {
      const res = await api.get('/appointments/doctor/patients');
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patients', err);
      toast.error('Unable to load patients');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch individual patient detail
  const fetchPatientDetail = async (patientId) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/appointments/doctor/patient/${patientId}`);
      if (res.data.success) {
        setDetail(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load patient detail', err);
      toast.error('Unable to load patient details');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // When a patient is selected, load detail
  useEffect(() => {
    if (selected) {
      fetchPatientDetail(selected._id);
    } else {
      setDetail(null);
    }
  }, [selected]);

  const filteredPatients = patients.filter(p => {
    const term = search.toLowerCase();
    return (p.fullName && p.fullName.toLowerCase().includes(term)) || (p.email && p.email.toLowerCase().includes(term));
  });

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[82vh]">
      {/* Sidebar patient list */}
      <aside className="w-full md:w-80 bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col h-[75vh] shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl h-10 text-sm"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="h-6 w-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs">Loading patients…</p>
            </div>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map(p => {
              const isSelected = selected && selected._id === p._id;
              const initials = (p.fullName || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              return (
                <button
                  key={p._id}
                  onClick={() => setSelected(p)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-teal-50/60 border-teal-100 shadow-sm text-teal-900'
                      : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-100 text-slate-700'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs shrink-0 ${
                    isSelected
                      ? 'bg-teal-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">{p.fullName || 'Unnamed'}</span>
                    <span className="text-xs text-slate-400 truncate mt-0.5">{p.email}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-medium">No patients found</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main detail view */}
      <section className="flex-1 min-w-0">
        {selected ? (
          loadingDetail ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200/80 rounded-2xl shadow-sm h-full">
              <div className="h-8 w-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium text-slate-500">Loading patient dossier...</p>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-teal-500 text-white font-bold text-lg shadow-inner">
                    {(detail.patient?.fullName || 'P').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{detail.patient?.fullName || 'Patient'}</h1>
                    <p className="text-sm text-slate-300 font-medium mt-0.5">{detail.patient?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 self-start sm:self-auto">
                  {detail.patient?.age && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold border border-white/10">
                      <Activity className="h-4 w-4 text-teal-400 animate-pulse" />
                      <span>{detail.patient?.age} yrs</span>
                    </div>
                  )}
                  <Button 
                    onClick={async () => {
                      try {
                        const res = await api.post('/chats/doctor-request', { patientId: detail.patient._id });
                        if (res.data.success) {
                          toast.success("Chat request sent to patient");
                          router.push(`/doctor/chat/${res.data.data._id}`);
                        }
                      } catch (err) {
                        toast.error("Failed to start chat with patient");
                      }
                    }}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold shadow-lg shadow-teal-500/20 rounded-xl px-4 py-2 flex items-center gap-2 transition-all"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Start Chat
                  </Button>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="overview" className="w-full">
                <TabList className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl gap-1">
                  <Tab value="overview" className="text-xs sm:text-sm">Overview</Tab>
                  <Tab value="vitals" className="text-xs sm:text-sm">Vitals</Tab>
                  <Tab value="reports" className="text-xs sm:text-sm">Reports</Tab>
                  <Tab value="appointments" className="text-xs sm:text-sm">Appointments</Tab>
                </TabList>

                {/* Overview Panel */}
                <TabPanel value="overview">
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader className="border-b border-slate-50 pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <User className="h-5 w-5 text-teal-500" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                      <div className="flex flex-col gap-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Phone
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{detail.patient?.phone || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <User className="h-3 w-3" /> Gender
                        </span>
                        <span className="text-sm font-semibold text-slate-800 capitalize">{detail.patient?.sex || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Droplet className="h-3 w-3 text-red-500" /> Blood Group
                        </span>
                        <span className="text-sm font-bold text-red-600">{detail.patient?.bloodGroup || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3 text-amber-500" /> Allergies
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {detail.patient?.allergies && detail.patient?.allergies.length > 0 
                            ? detail.patient?.allergies.join(', ') 
                            : 'None'}
                        </span>
                      </div>
                      <div className="col-span-1 md:col-span-2 flex flex-col gap-2 p-4 bg-amber-50/40 rounded-xl border border-amber-100/50">
                        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Medical History</span>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed">
                          {detail.patient?.previousDiseaseHistory || 'No previous medical history recorded.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabPanel>

                {/* Vitals Panel */}
                <TabPanel value="vitals">
                  {detail.vitals?.length > 0 ? (
                    <Card className="border-slate-200/80 shadow-sm overflow-hidden">
                      <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <HeartPulse className="h-5 w-5 text-red-500" />
                          Recent Vitals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Recorded At</TableHead>
                              <TableHead>HR (bpm)</TableHead>
                              <TableHead>BP (mmHg)</TableHead>
                              <TableHead>Temp (°F)</TableHead>
                              <TableHead>O₂ (%)</TableHead>
                              <TableHead>Weight (kg)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detail.vitals.map(v => (
                              <TableRow key={v._id} className="hover:bg-slate-50/60">
                                <TableCell className="font-medium text-slate-650">
                                  {new Date(v.recordedAt || v.createdAt).toLocaleString()}
                                </TableCell>
                                <TableCell>{v.heartRate || '—'}</TableCell>
                                <TableCell>{v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : '—'}</TableCell>
                                <TableCell>{v.temperature || '—'}</TableCell>
                                <TableCell>{v.oxygenLevel || '—'}</TableCell>
                                <TableCell>{v.weight || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200/80 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <HeartPulse className="h-12 w-12 text-slate-350 mb-3" />
                        <p className="text-sm font-semibold text-slate-400">No vitals data recorded yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabPanel>

                {/* Reports Panel */}
                <TabPanel value="reports">
                  {detail.reports?.length > 0 ? (
                    <Card className="border-slate-200/80 shadow-sm overflow-hidden">
                      <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          Diagnostic Reports
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Report Title</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detail.reports.map(r => (
                              <TableRow key={r._id} className="hover:bg-slate-50/60">
                                <TableCell className="font-semibold text-slate-850">{r.title}</TableCell>
                                <TableCell>
                                  <Badge className="font-semibold px-2 py-0.5 rounded-full" variant={r.status === 'verified' ? 'teal' : 'warning'}>
                                    {r.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-500">
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200/80 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileClock className="h-12 w-12 text-slate-350 mb-3" />
                        <p className="text-sm font-semibold text-slate-400">No diagnostic reports found</p>
                      </CardContent>
                    </Card>
                  )}
                </TabPanel>

                {/* Appointments Panel */}
                <TabPanel value="appointments">
                  {detail.appointments?.length > 0 ? (
                    <Card className="border-slate-200/80 shadow-sm overflow-hidden">
                      <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-violet-500" />
                          Appointment History
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50">
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time</TableHead>
                              <TableHead>Reason</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {detail.appointments.map(a => (
                              <TableRow key={a._id} className="hover:bg-slate-50/60">
                                <TableCell className="font-medium text-slate-700">
                                  {new Date(a.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-slate-650">{a.time}</TableCell>
                                <TableCell className="max-w-xs truncate text-slate-800">{a.reason}</TableCell>
                                <TableCell>
                                  <Badge className="font-semibold px-2 py-0.5 rounded-full capitalize" variant={a.status === 'completed' ? 'success' : a.status === 'pending' ? 'warning' : 'default'}>
                                    {a.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-slate-200/80 shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <Calendar className="h-12 w-12 text-slate-350 mb-3" />
                        <p className="text-sm font-semibold text-slate-400">No appointments scheduled</p>
                      </CardContent>
                    </Card>
                  )}
                </TabPanel>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm h-[75vh]">
              <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Unable to load patient record details.</p>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl h-[75vh]">
            <Users className="h-12 w-12 text-slate-355 mb-3" />
            <p className="text-sm font-bold text-slate-400">Select a patient from the list to view their record</p>
          </div>
        )}
      </section>
    </div>
  );
}
