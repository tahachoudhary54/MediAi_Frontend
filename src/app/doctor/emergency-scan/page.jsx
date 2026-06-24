"use client";
import { useState, useEffect } from 'react';
import ScannerUI from '@/components/shared/ScannerUI';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Phone, HeartPulse, FileText, AlertCircle, CheckCircle2, FileSpreadsheet, Stethoscope, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DoctorEmergencyScanPage() {
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
    const [result, setResult] = useState(null);

    useEffect(() => {
        // AI model loading is now handled completely by the backend server
    }, []);

    const handleProcessImage = async (file) => {
        setScanStatus('scanning');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            // Send the raw image to the backend. The server will run the AI model, 
            // completely avoiding browser freezes on older devices.
            const response = await api.post('/emergency/emergency-scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status === 'match_found') {
                setResult(response.data);
                setScanStatus('success');
                toast.success('Patient identified successfully.');
            } else if (response.data.status === 'possible_matches') {
                setScanStatus('error');
                toast.error('Medium confidence: Multiple matches found. Please check manually.');
            } else {
                setScanStatus('error');
                toast.error(response.data.message || 'No match found.');
            }
        } catch (error) {
            console.error(error);
            setScanStatus('error');
            if (error.response?.status === 404) {
                toast.error('No registered emergency profile found.');
            } else {
                toast.error('Failed to process the scan. Please try again.');
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emergency Scanner</h1>
                <p className="text-slate-500 mt-2">
                    Quickly identify patients and retrieve critical medical data using facial recognition.
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[600px]">
                
                {scanStatus === 'idle' || scanStatus === 'scanning' ? (
                    <div className="w-full max-w-lg">
                        <ScannerUI 
                            onCapture={handleProcessImage} 
                            onUpload={handleProcessImage} 
                            buttonText="Identify Patient"
                            theme="light"
                        />
                        {scanStatus === 'scanning' && (
                            <div className="mt-6 text-center animate-pulse">
                                <p className="text-teal-600 font-medium text-lg">Analyzing facial data...</p>
                                <p className="text-slate-500 text-sm mt-1">Cross-referencing with emergency database</p>
                            </div>
                        )}
                    </div>
                ) : scanStatus === 'success' && result ? (
                    <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-500">
                        <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Patient Identified</h2>
                                <p className="text-slate-500">Medical records retrieved successfully.</p>
                            </div>
                        </div>

                        {/* Doctor View (Full Info) */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {result.name && (
                                <div className="col-span-2 md:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 text-slate-500 mb-2">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Name</span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">{result.name}</p>
                                </div>
                            )}

                            {result.blood_group && (
                                <div className="bg-red-50 rounded-2xl p-5 border border-red-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-red-500 mb-2">
                                        <Droplet className="w-4 h-4" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Blood Group</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600">{result.blood_group}</p>
                                </div>
                            )}

                            {/* Medical Records (Only returned for verified doctors) */}
                            {(() => {
                                const validAllergies = result.allergies?.filter(a => a && a.trim().length > 0) || [];
                                const showMedicalHistory = validAllergies.length > 0 || result.medications !== undefined || result.conditions !== undefined;
                                
                                if (!showMedicalHistory) return null;

                                return (
                                    <div className="col-span-2 space-y-4 mt-2">
                                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-amber-500" />
                                            Critical Medical History
                                        </h3>
                                        
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {(validAllergies.length > 0 || result.medications !== undefined) && (
                                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                                                    <span className="text-sm font-bold text-amber-800 block mb-3">Allergies</span>
                                                    {validAllergies.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {validAllergies.map((item, i) => (
                                                                <span key={i} className="px-3 py-1 bg-amber-200 text-amber-900 text-sm font-medium rounded-lg">{item}</span>
                                                            ))}
                                                        </div>
                                                    ) : <span className="text-amber-700/60 font-medium italic">None recorded</span>}
                                                </div>
                                            )}
                                        
                                        {result.medications !== undefined && (
                                            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                                                <span className="text-sm font-bold text-blue-800 block mb-3">Current Medications</span>
                                                {result.medications?.length > 0 ? (
                                                    <ul className="list-disc list-inside text-blue-900 text-base font-medium space-y-1.5">
                                                        {result.medications.map((item, i) => <li key={i}>{item}</li>)}
                                                    </ul>
                                                ) : <span className="text-blue-700/60 font-medium italic">None recorded</span>}
                                            </div>
                                        )}
                                        
                                        {result.conditions !== undefined && (
                                            <div className="col-span-2 bg-red-50 rounded-xl p-5 border border-red-100 shadow-sm">
                                                <span className="text-sm font-bold text-red-800 block mb-3">Pre-existing Conditions</span>
                                                {result.conditions?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.conditions.map((item, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-red-200 text-red-900 text-sm font-bold rounded-lg shadow-sm border border-red-300">{item}</span>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-red-700/60 font-medium italic">None recorded</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                );
                            })()}

                            <div className="col-span-2 bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm mt-4">
                                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                                    <Phone className="w-5 h-5" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Emergency Contacts</span>
                                </div>
                                <div className="space-y-3">
                                    {result.emergency_contact ? (
                                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100/50">
                                            <span className="text-emerald-800 font-medium">Primary Contact</span>
                                            <a href={`tel:${result.emergency_contact}`} className="text-emerald-600 font-bold hover:text-emerald-700 text-lg">{result.emergency_contact}</a>
                                        </div>
                                    ) : (
                                        <p className="text-emerald-700/60 italic font-medium">No primary contact provided.</p>
                                    )}
                                    {result.family_contact && (
                                        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100/50">
                                            <span className="text-emerald-800 font-medium">Family Contact</span>
                                            <a href={`tel:${result.family_contact}`} className="text-emerald-600 font-bold hover:text-emerald-700 text-lg">{result.family_contact}</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button 
                                onClick={() => setScanStatus('idle')}
                                className="px-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-md transition-all"
                            >
                                Perform Another Scan
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-10 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
                        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200">
                            <AlertCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Patient Not Found</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
                            This person may not be registered in the system or has not opted into emergency facial discovery.
                        </p>
                        <Button 
                            onClick={() => setScanStatus('idle')}
                            className="px-8 py-6 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-md transition-all"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
