import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Sparkles, Send, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Components
import Header from '../../components/common/Header';
import FacultySidebar from '../../components/faculty/FacultySidebar';
import ChatMessage from '../../components/faculty/ChatMessage';
import CertificatePreview from '../../components/faculty/CertificatePreview';
import ExtractedDataCard from '../../components/faculty/ExtractedDataCard';
import ProgressSteps from '../../components/common/ProgressSteps';
import TypingIndicator from '../../components/common/TypingIndicator';
import {
    getDefaultFacultyNavItems,
    getProfileNavItem,
    getHelpNavItem,
} from '../../utils/facultyNav';

const AIUploadPage = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const navItems = getDefaultFacultyNavItems(navigate, 'ai-upload');
    const profileItem = getProfileNavItem(navigate, false);
    const helpItem = getHelpNavItem(navigate);

    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I'm your AI assistant. Upload any certificate (FDP, Publication, Patent, or Award) and I'll automatically extract the details and fill out your submission form. Just drag and drop or click to upload.",
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const [debugLogs, setDebugLogs] = useState([]);

    // Ref to track processing state inside timeouts
    const isProcessingRef = useRef(false);

    // File and extraction state
    const [uploadedFile, setUploadedFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Processing steps state
    const [processingStep, setProcessingStep] = useState('');

    // Missing data handling state
    const [missingFields, setMissingFields] = useState([]);
    const [waitingForField, setWaitingForField] = useState(null);

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
        onDrop: handleFileUpload,
        disabled: isProcessing,
        noClick: true // Disable click on container (we keep the specific click area)
    });

    // Specific dropzone for the bottom area (allows click)
    const { getRootProps: getClickableRootProps, getInputProps: getClickableInputProps } = useDropzone({
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'], 'application/pdf': ['.pdf'] },
        onDrop: handleFileUpload,
        disabled: isProcessing
    });

    // Required fields configuration
    const REQUIRED_FIELDS = {
        'MOOC': ['course_name', 'duration_weeks', 'academic_year', 'offering_institute'],
        'FDP': ['program_name', 'duration_days', 'academic_year', 'organizer'],
        'RESOURCE_PERSON': ['event_name', 'role', 'academic_year', 'organizer'],
        'MEMBERSHIP': ['society_name', 'academic_year']
    };

    function addMessage(text, isUser) {
        setMessages(prev => [...prev, {
            id: Date.now() + Math.random(),
            text,
            isUser,
            timestamp: new Date()
        }]);
    }

    async function handleFileUpload(acceptedFiles) {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        setUploadedFile(file);
        setDebugLogs([]); // Clear previous logs

        // Use Data URL to avoid Blob URL partitioning issues
        const reader = new FileReader();
        reader.onload = (e) => setFileUrl(e.target.result);
        reader.readAsDataURL(file);

        setCurrentStep(1);

        // Add user message
        addMessage(`I've uploaded my certificate: ${file.name}`, true);

        // Real API processing
        setIsTyping(true);
        setIsProcessing(true);
        setCurrentStep(2); // OCR stage

        // Progress Simulation
        setProcessingStep('Initializing Scanner...');

        const steps = [
            { t: 1000, msg: '🔍 Scanning Document...' },
            { t: 2500, msg: '🧠 Reading Text...' },
            { t: 4000, msg: '🤖 Analyzing Entities...' },
            { t: 5500, msg: '✨ Generating Form Data...' }
        ];

        let timeouts = [];
        steps.forEach(({ t, msg }) => {
            const timeout = setTimeout(() => {
                if (isProcessingRef.current) setProcessingStep(msg);
            }, t);
            timeouts.push(timeout);
        });

        // Use ref to track processing status for timeouts
        isProcessingRef.current = true;

        try {
            setCurrentStep(3); // AI Analysis

            // ---------------------------------------------------------
            // STEP 1: Get Signed URL for Direct Upload
            // ---------------------------------------------------------
            setProcessingStep('Preparing secure upload...');
            const uploadUrlResponse = await axios.get('/api/ai-upload/upload-url', {
                params: {
                    filename: file.name,
                    contentType: file.type || 'application/octet-stream'
                }
            });

            const { uploadUrl, gcsPath } = uploadUrlResponse.data;

            // ---------------------------------------------------------
            // STEP 2: Upload File Directly to Google Cloud Storage
            // ---------------------------------------------------------
            setProcessingStep('Uploading to cloud storage...');

            // Use standard fetch or axios for the PUT request
            await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type || 'application/octet-stream'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProcessingStep(`Uploading... ${percentCompleted}%`);
                }
            });

            // ---------------------------------------------------------
            // STEP 3: Process the File (Server reads from GCS)
            // ---------------------------------------------------------
            setProcessingStep('Processing document with AI...');

            // Send JSON with gcsPath instead of FormData
            const response = await axios.post('/api/ai-upload/process', {
                gcsPath: gcsPath,
                contentType: file.type // Pass content type for correct handling
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.logs) {
                setDebugLogs(response.data.logs);
            }

            if (response.data.success) {
                // Success - show extracted data
                const extractedResult = {
                    certificateType: response.data.certificateType,
                    tableName: response.data.tableName,
                    tableDisplayName: response.data.tableDisplayName,
                    extracted: response.data.extracted,
                    fieldConfidence: response.data.fieldConfidence || {},
                    overallConfidence: response.data.overallConfidence,
                    sectionCode: response.data.sectionCode,
                    filePath: response.data.filePath,
                    reason: response.data.reason,
                    isRecognized: response.data.isRecognized,
                    detectedType: response.data.detectedType,
                    missingRequired: response.data.missingRequired || [],
                    filename: response.data.filename // Capture filename
                };

                // ENFORCE USER NAME LOCK
                // Override extracted name with logged-in user's name to prevent discrepancies
                if (user?.name) {
                    extractedResult.extracted.participant_name = user.name;
                    extractedResult.extracted.faculty_name = user.name; // Just in case
                }

                // CLIENT-SIDE VALIDATION ENFORCEMENT
                // Check if any required fields are actually null/missing in extracted data
                // even if backend didn't flag them
                const typeRequired = REQUIRED_FIELDS[extractedResult.detectedType];
                if (typeRequired) {
                    typeRequired.forEach(field => {
                        // If field is missing in extracted OR is null/empty
                        const value = extractedResult.extracted[field];
                        const isMissing = value === null || value === undefined || value === '';

                        if (isMissing && !extractedResult.missingRequired.includes(field)) {
                            console.log(`Frontend detected missing required field: ${field}`);
                            extractedResult.missingRequired.push(field);
                        }
                    });
                }

                setExtractedData(extractedResult);
                setCurrentStep(4); // Review stage
                setProcessingStep('');

                // Set initial missing fields
                const missing = extractedResult.missingRequired || [];
                setMissingFields(missing);

                setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        setIsTyping(false);
                        const confidencePercent = Math.round(extractedResult.overallConfidence * 100);

                        // Initial Success Message
                        const recognitionWarning = !extractedResult.isRecognized ? ' ⚠️ Type not fully recognized.' : '';
                        addMessage(
                            `✅ Analysis complete! Detected: "${extractedResult.certificateType}". Confidence: ${confidencePercent}%.${recognitionWarning}`,
                            false
                        );

                        // If missing fields, start the interview flow
                        if (missing.length > 0) {
                            setTimeout(() => {
                                setIsTyping(true);
                                setTimeout(() => {
                                    setIsTyping(false);
                                    const firstField = missing[0];
                                    setWaitingForField(firstField);
                                    const fieldName = firstField.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                    addMessage(`⚠️ I couldn't automatically find the **${fieldName}**. Could you please type it for me below?`, false);
                                }, 1000);
                            }, 500);
                        } else {
                            addMessage("Please review the details and click Save if everything looks correct.", false);
                        }
                    }, 800);
                }, 500);
            }

            setIsProcessing(false);
            isProcessingRef.current = false;
        } catch (error) {
            console.error('Upload error:', error);

            if (error.response?.data?.logs) {
                setDebugLogs(error.response.data.logs);
            }

            setCurrentStep(0);
            setIsProcessing(false);
            isProcessingRef.current = false;
            setProcessingStep('');
            setIsTyping(true);

            setTimeout(() => {
                setIsTyping(false);
                const errorMessage = error.response?.data?.error || error.message || 'Processing failed';
                const hint = error.response?.data?.hint || 'Please try again with a different file.';
                addMessage(
                    `Error: ${errorMessage}. ${hint}`,
                    false
                );
            }, 800);
        }
    }

    function handleSendMessage() {
        if (!inputMessage.trim()) return;

        const userMsg = inputMessage;
        setInputMessage('');
        addMessage(userMsg, true);

        // INTERCEPT: If waiting for a missing field
        if (waitingForField) {
            setIsTyping(true);

            // 1. Update the data locally
            const updatedExtracted = { ...extractedData.extracted, [waitingForField]: userMsg };

            // 2. Remove field from missing list
            const remainingMissing = missingFields.filter(f => f !== waitingForField);
            setMissingFields(remainingMissing);

            // 3. Update main extractedData state
            setExtractedData(prev => ({
                ...prev,
                extracted: updatedExtracted,
                missingRequired: remainingMissing // Update this too so validations pass
            }));

            setTimeout(() => {
                setIsTyping(false);

                // 4. Check if more missing fields exist
                if (remainingMissing.length > 0) {
                    const nextField = remainingMissing[0];
                    setWaitingForField(nextField);
                    const fieldName = nextField.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    addMessage(`Thanks! Now, I also need the **${fieldName}**.`, false);
                } else {
                    setWaitingForField(null);
                    addMessage("Great! I've updated the details. You can now save the submission.", false);
                }
            }, 1000);
            return;
        }

        // Standard response (Simulation)
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage("I've received your message. If you need to correct any specific field, you can edit the form directly or re-upload.", false);
        }, 1500);
    }

    const [showSuccess, setShowSuccess] = useState(false);

    async function handleSaveSubmission() {
        // Block save if user is still in the "filling out fields" flow
        if (waitingForField || missingFields.length > 0) {
            addMessage(`⚠️ Please provide the missing **${waitingForField ? waitingForField.replace('_', ' ') : 'fields'}** in the chat before saving.`, false);
            return;
        }

        if (!extractedData || !extractedData.sectionCode) {
            addMessage("⚠️ Cannot save: Missing section code. Please try uploading again.", false);
            return;
        }

        setIsTyping(true);
        addMessage("💾 Saving to database...", false);

        // Enforce user name in payload
        const payload = {
            ...extractedData.extracted,
            participant_name: user?.name || extractedData.extracted.participant_name,
            faculty_name: user?.name || extractedData.extracted.faculty_name
        };

        try {
            const response = await axios.post('/api/ai-upload/confirm', {
                userId: user?.id || 1, // Use actual user ID
                sectionCode: extractedData.sectionCode,
                data: payload,
                filePath: extractedData.filePath,
                originalFilename: extractedData.filename // Send original filename
            });

            if (response.data.success) {
                setCurrentStep(5); // Save complete
                setIsTyping(false);
                addMessage(
                    `🎉 Success! Your "${extractedData.certificateType}" certificate has been saved to the database.`,
                    false
                );

                // Show success animation
                setShowSuccess(true);

                // Clear data after 3 seconds
                setTimeout(() => {
                    setShowSuccess(false);
                    setExtractedData(null);
                    setUploadedFile(null);
                    setFileUrl(null);
                    setCurrentStep(0);
                    setProcessingStep('');
                }, 3000);

            } else {
                throw new Error(response.data.error || 'Save failed');
            }
        } catch (error) {
            console.error('Save error:', error);
            setIsTyping(false);
            addMessage(
                `❌ Error saving: ${error.response?.data?.error || error.message}. Please try again.`,
                false
            );
        }
    }

    function handleStartOver() {
        setUploadedFile(null);
        setFileUrl(null);
        setExtractedData(null);
        setCurrentStep(0);
        setIsProcessing(false);
        setMissingFields([]);
        setWaitingForField(null);
        addMessage("Ready for a new certificate. Upload whenever you're ready!", false);
    }

    function handleReset() {
        setUploadedFile(null);
        setFileUrl(null);
        setExtractedData(null);
        setCurrentStep(0);
        setIsProcessing(false);
        setIsTyping(false);
        setMissingFields([]);
        setWaitingForField(null);
        // Keep chat history for context
    }

    return (
        <div className="h-screen flex overflow-hidden" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #f8f2ff 100%)" }}>
            {/* Sidebar */}
            <FacultySidebar
                navItems={navItems}
                profileItem={profileItem}
                helpItem={helpItem}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-80 h-full overflow-hidden">
                {/* Header */}
                <div className="flex-shrink-0">
                    <Header title="AI Certificate Upload" user={user} onLogout={onLogout} />
                </div>

                {/* Main Area */}
                <main className="flex-1 px-4 sm:px-8 py-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* AI Upload Info */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 mb-8 rounded-xl shadow-md">
                            <div className="flex items-start">
                                <Sparkles className="w-6 h-6 text-green-600 mt-1 mr-4 flex-shrink-0" />
                                <div>
                                    <h3 className="text-base font-bold text-green-900 mb-1">AI-Powered Upload</h3>
                                    <p className="text-base text-green-800 leading-relaxed">
                                        Upload any certificate (FDP, MOOC, Membership, Resource Person) and AI will automatically detect the type and extract all details. No need to rename files - just upload!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Steps */}
                        {currentStep > 0 && !showSuccess && (
                            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-purple-100">
                                <ProgressSteps currentStep={currentStep} />
                            </div>
                        )}

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8" style={{ minHeight: 'calc(100vh - 280px)' }}>
                            {/* Left: AI Chat Interface - ENTIRE AREA IS DROPZONE */}
                            <div
                                {...getRootProps()}
                                className={`flex-1 flex flex-col bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition-all relative ${isDragActive ? 'border-purple-500 ring-4 ring-purple-100 scale-[1.01]' : 'border-white'
                                    }`}
                            >
                                {/* ... existing chat UI ... */}
                                {/* Drag Overlay */}
                                {isDragActive && (
                                    <div className="absolute inset-0 z-50 bg-purple-500/10 backdrop-blur-sm flex items-center justify-center">
                                        <div className="bg-white p-6 rounded-2xl shadow-2xl animate-bounce">
                                            <Upload className="w-12 h-12 text-purple-600 mx-auto" />
                                            <p className="font-bold text-purple-900 mt-2">Drop it here!</p>
                                        </div>
                                    </div>
                                )}

                                {/* Hidden Input for Dropzone */}
                                <input {...getInputProps()} />

                                {/* Chat Header */}
                                <div className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
                                            <p className="text-sm text-purple-100">Ready to help you upload</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-gray-50 to-white">
                                    {messages.map(msg => (
                                        <ChatMessage
                                            key={msg.id}
                                            message={msg.text}
                                            isUser={msg.isUser}
                                            timestamp={msg.timestamp}
                                        />
                                    ))}

                                    {/* Dynamic Processing Indicator */}
                                    {isProcessing && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex items-center space-x-3"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-1.5 shadow-md">
                                                <div className="w-full h-full border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                            </div>
                                            <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl rounded-tl-sm shadow-sm">
                                                <p className="text-sm text-gray-600 font-medium animate-pulse">{processingStep || 'Thinking...'}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {isTyping && !isProcessing && <TypingIndicator />}

                                    {/* Retry/Reset Option */}
                                    {uploadedFile && !isProcessing && !showSuccess && (
                                        <div className="flex justify-center mt-4 pb-4">
                                            <button
                                                onClick={handleReset}
                                                className="flex items-center space-x-2 px-5 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm z-10 relative"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                <span>Start Over / New File</span>
                                            </button>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Upload Zone - Bottom Area (Clickable) */}
                                <div className="p-4 border-t border-gray-200 bg-gray-50">
                                    <div
                                        {...getClickableRootProps()}
                                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ${isProcessing
                                            ? 'opacity-50 cursor-not-allowed border-gray-300'
                                            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                                            }`}
                                    >
                                        <input {...getClickableInputProps()} disabled={isProcessing} />
                                        <div className="flex items-center justify-center space-x-3">
                                            <Upload className="w-6 h-6 text-purple-400" />
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-bold text-gray-800">
                                                    {uploadedFile
                                                        ? 'Drag any file anywhere to replace'
                                                        : 'Drag & drop anywhere or click here'
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    JPG, PNG, PDF (Max 10MB)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Input (when file uploaded) */}
                                {uploadedFile && (
                                    <div className="p-4 bg-white border-t border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="text"
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Type your message..."
                                                className="flex-1 px-5 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                                disabled={isTyping}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!inputMessage.trim() || isTyping}
                                                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Panel - Preview & Extracted Data */}
                            <div className="space-y-8">
                                {/* Success State */}
                                {showSuccess ? (
                                    <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center justify-center h-full min-h-[400px] border border-green-100">
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                            className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6"
                                        >
                                            <CheckCircle className="w-20 h-20 text-green-500" />
                                        </motion.div>
                                        <motion.h3
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-3xl font-bold text-gray-800 mb-2"
                                        >
                                            Submission Saved!
                                        </motion.h3>
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-gray-500 text-lg"
                                        >
                                            Redirecting to new upload...
                                        </motion.p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Certificate Preview */}
                                        {uploadedFile && (
                                            <CertificatePreview file={uploadedFile} fileUrl={fileUrl} />
                                        )}

                                        {/* Extracted Data */}
                                        {extractedData && (
                                            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-100">
                                                {/* Table Name Badge */}
                                                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">TARGET DATABASE TABLE</p>
                                                        {extractedData.sectionCode && (
                                                            <p className="text-lg font-bold text-indigo-900">
                                                                Table No. {extractedData.sectionCode}
                                                            </p>
                                                        )}
                                                        <p className="text-base text-gray-700">
                                                            Database: <span className="font-mono font-semibold text-indigo-800">{extractedData.tableName}</span>
                                                        </p>
                                                        <p className="text-base text-gray-700">
                                                            Type: <span className="font-semibold text-gray-900">{extractedData.certificateType}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3 mb-6">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                                                        <CheckCircle className="w-6 h-6 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900">Extracted Information</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {Object.entries(extractedData.extracted).filter(([key, value]) => {
                                                        // Filter out null values and metadata fields
                                                        return value !== null && key !== 'confidence_scores' && key !== 'certificate_type';
                                                    }).map(([key, value]) => {
                                                        const confidence = extractedData.fieldConfidence?.[key] || 0;
                                                        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                                                        return (
                                                            <ExtractedDataCard
                                                                key={key}
                                                                field={key}
                                                                value={String(value)}
                                                                confidence={confidence}
                                                                label={label}
                                                            />
                                                        );
                                                    })}
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="mt-8 flex space-x-4">
                                                    <button
                                                        onClick={handleSaveSubmission}
                                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 transform hover:scale-105"
                                                    >
                                                        <CheckCircle className="w-6 h-6" />
                                                        <span>Save Submission</span>
                                                    </button>
                                                    <button
                                                        onClick={handleStartOver}
                                                        className="px-8 py-4 border-3 border-gray-300 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-md hover:shadow-lg"
                                                    >
                                                        Start Over
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Empty State - Enhanced */}
                                {!uploadedFile && !showSuccess && (
                                    <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-10 text-center shadow-xl border-2 border-purple-200">
                                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8">
                                            <Sparkles className="w-20 h-20 mx-auto mb-6 text-purple-600 animate-pulse" />
                                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Upload</h3>
                                            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                                                Upload your certificate on the left to see how AI would extract all the details automatically.
                                            </p>
                                            <div className="bg-white rounded-xl p-6 text-left shadow-md">
                                                <p className="text-sm font-bold text-purple-700 mb-3 uppercase tracking-wide">What this demo shows:</p>
                                                <ul className="text-base text-gray-700 space-y-2">
                                                    <li className="flex items-start">
                                                        <span className="text-purple-500 mr-2">•</span>
                                                        <span>ChatGPT-like conversational interface</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-purple-500 mr-2">•</span>
                                                        <span>Automatic data extraction from certificates</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-purple-500 mr-2">•</span>
                                                        <span>Confidence scoring for each field</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <span className="text-purple-500 mr-2">•</span>
                                                        <span>Interactive review before submission</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Debug Logs Box */}
                                {debugLogs.length > 0 && (
                                    <div className="mt-8 bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-700">
                                        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                                <h3 className="text-sm font-mono font-bold text-gray-200">Server Debug Logs</h3>
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono">{debugLogs.length} lines</span>
                                        </div>
                                        <div className="p-4 max-h-60 overflow-y-auto font-mono text-xs text-gray-300 space-y-1">
                                            {debugLogs.map((log, index) => (
                                                <div key={index} className="border-b border-gray-800 pb-1 last:border-0">
                                                    {log}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AIUploadPage;
