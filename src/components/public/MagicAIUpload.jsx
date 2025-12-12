import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Sparkles, X, CheckCircle, AlertCircle, Camera, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const MagicAIUpload = ({ onDataExtracted, onClose }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [error, setError] = useState(null);

    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const onDrop = async (acceptedFiles) => {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        await processFile(file);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        onDrop,
        disabled: isProcessing
    });

    const processFile = async (file) => {
        setIsProcessing(true);
        setError(null);
        setProcessingStep('Initializing...');

        try {
            // 1. Get Signed URL
            setProcessingStep('Preparing secure upload...');
            const uploadUrlResponse = await axios.get('/api/ai-upload/upload-url', {
                params: {
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream'
                }
            });
            const { uploadUrl, gcsPath } = uploadUrlResponse.data;

            // 2. Upload to GCS
            setProcessingStep('Uploading document...');
            await axios.put(uploadUrl, file, {
                headers: { 'Content-Type': file.type || 'application/octet-stream' }
            });

            // 3. Process with AI
            setProcessingStep('Analyzing with AI...');
            const response = await axios.post('/api/ai-upload/process', {
                gcsPath: gcsPath,
                contentType: file.type
            });

            if (response.data.success) {
                setProcessingStep('Extraction complete!');
                // Pass extracted data back to parent
                onDataExtracted(response.data.extracted, response.data.certificateType, file);
            } else {
                throw new Error(response.data.error || 'Extraction failed');
            }

        } catch (err) {
            console.error("AI Processing Error:", err);
            setError(err.response?.data?.error || err.message || "Failed to process document");
            setIsProcessing(false);
        }
    };

    // Camera Logic
    const startCamera = async () => {
        try {
            setCameraError(null);
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            } catch (err) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
            setCameraStream(stream);
            setShowCamera(true);
        } catch (err) {
            setCameraError("Unable to access camera. Please ensure permissions are granted.");
            setShowCamera(true);
        }
    };

    useEffect(() => {
        if (showCamera && cameraStream && videoRef.current) {
            videoRef.current.srcObject = cameraStream;
            videoRef.current.play().catch(e => console.error("Play error:", e));
        }
    }, [showCamera, cameraStream]);

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setShowCamera(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                const file = new File([blob], "scanned_document.jpg", { type: "image/jpeg" });
                processFile(file);
                stopCamera();
            }, 'image/jpeg', 0.95);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border border-indigo-100 overflow-hidden mb-8 animate-fade-in-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg">AI Auto-Fill</h3>
                        <p className="text-indigo-100 text-xs">Upload a certificate to automatically fill the form</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="w-16 h-16 relative">
                            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p className="text-indigo-900 font-medium animate-pulse">{processingStep}</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h4 className="text-red-900 font-bold mb-1">Processing Failed</h4>
                        <p className="text-red-600 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                            <p className="text-gray-700 font-medium">Drag & drop your certificate here</p>
                            <p className="text-gray-500 text-sm mt-1">or click to browse files</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">OR</span>
                            </div>
                        </div>

                        <button
                            onClick={startCamera}
                            className="w-full py-3 bg-white border border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Scan with Camera
                        </button>
                    </div>
                )}
            </div>

            {/* Camera Modal Overlay */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl relative">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-indigo-600" />
                                    Scan Document
                                </h3>
                                <button onClick={stopCamera} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="relative bg-black aspect-[3/4] md:aspect-video flex items-center justify-center overflow-hidden">
                                {cameraError ? (
                                    <div className="text-white text-center p-6">
                                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                                        <p>{cameraError}</p>
                                    </div>
                                ) : (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                        onLoadedMetadata={() => videoRef.current?.play()}
                                    />
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="p-6 bg-gray-50 flex justify-center gap-4">
                                <button onClick={stopCamera} className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100">Cancel</button>
                                {!cameraError && (
                                    <button onClick={captureImage} className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                                        Capture
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MagicAIUpload;
