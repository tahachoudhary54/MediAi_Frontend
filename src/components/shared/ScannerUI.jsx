"use client";
import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle2, Scan } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ScannerUI({ onCapture, onUpload, buttonText = "Scan Face", theme = "dark" }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraActive, stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
            setIsCameraActive(true);
            setCapturedImage(null);
        } catch (error) {
            console.error("Error accessing camera:", error);
            toast.error("Could not access the camera. Please allow permissions or upload a photo instead.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            setIsScanning(true);
            // Simulate a scan delay
            setTimeout(() => {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Get the blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        toast.error("Failed to capture image. Please try again.");
                        setIsScanning(false);
                        return;
                    }
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    setCapturedImage(URL.createObjectURL(blob));
                    stopCamera();
                    setIsScanning(false);
                    if (onCapture) onCapture(file);
                }, 'image/jpeg');
            }, 1000);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCapturedImage(URL.createObjectURL(file));
            stopCamera();
            if (onUpload) onUpload(file);
        }
    };

    const resetCapture = () => {
        setCapturedImage(null);
    };

    const isLight = theme === 'light';

    return (
        <div className={`w-full max-w-md mx-auto overflow-hidden rounded-2xl ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10 backdrop-blur-md'} border shadow-2xl p-6 relative`}>
            
            {/* Header */}
            <div className="text-center mb-6">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${isLight ? 'bg-teal-100 text-teal-600' : 'bg-teal-500/20 text-teal-400'} mb-4`}>
                    <Scan className="w-6 h-6" />
                </div>
                <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Emergency Face Scan</h3>
                <p className={`text-sm mt-2 ${isLight ? 'text-slate-500' : 'text-navy-300'}`}>Center the face inside the frame to begin identification.</p>
            </div>

            {/* Viewfinder Area */}
            <div className="relative aspect-[4/3] w-full bg-navy-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-navy-600 mb-6 group">
                
                {/* 1. Camera View */}
                {isCameraActive && !capturedImage && (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Target reticle overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={`w-48 h-56 border-2 border-teal-400/50 rounded-full transition-all duration-300 ${isScanning ? 'scale-110 border-teal-400 bg-teal-400/10' : ''}`}></div>
                        </div>
                        {/* Scanning Line Animation */}
                        {isScanning && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-teal-400 shadow-[0_0_15px_3px_rgba(45,212,191,0.6)] animate-[bounce_2s_ease-in-out_infinite]"></div>
                        )}
                    </>
                )}

                {/* 2. Captured Image View */}
                {capturedImage && (
                    <div className="absolute inset-0 w-full h-full">
                        <img src={capturedImage} alt="Captured face" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent opacity-80"></div>
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-sm border border-teal-500/30 backdrop-blur-md">
                                <CheckCircle2 className="w-4 h-4" /> Ready for processing
                            </span>
                        </div>
                    </div>
                )}

                {/* 3. Idle State */}
                {!isCameraActive && !capturedImage && (
                    <div className="text-center p-6">
                        <Camera className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-400 text-sm">Camera is inactive</p>
                    </div>
                )}
                
                {/* Hidden canvas for capturing */}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>

            {/* Controls */}
            <div className="space-y-3">
                {capturedImage ? (
                    <button 
                        onClick={resetCapture}
                        className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-white bg-navy-700 hover:bg-navy-600 transition-colors border border-white/5"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retake Photo
                    </button>
                ) : isCameraActive ? (
                    <button 
                        onClick={capturePhoto}
                        disabled={isScanning}
                        className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 text-navy-900 transition-all ${isScanning ? 'bg-teal-600 cursor-not-allowed' : 'bg-teal-400 hover:bg-teal-300 hover:shadow-[0_0_20px_rgba(45,212,191,0.4)]'}`}
                    >
                        <Camera className="w-5 h-5" />
                        {isScanning ? 'Scanning...' : buttonText}
                    </button>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={startCamera}
                            className="py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-white bg-teal-600 hover:bg-teal-500 transition-colors"
                        >
                            <Camera className="w-4 h-4" />
                            Use Camera
                        </button>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-white bg-navy-700 hover:bg-navy-600 transition-colors border border-white/5"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Photo
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
