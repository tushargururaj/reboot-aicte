import React, { useState } from 'react';
import { ZoomIn, ZoomOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CertificatePreview = ({ file, fileUrl }) => {
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const isPDF = file?.type === 'application/pdf';

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Certificate Preview</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleZoomOut}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-xs text-gray-500 min-w-[3rem] text-center">{zoom}%</span>
                    <button
                        onClick={handleZoomIn}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <div className="overflow-auto max-h-[400px] flex items-center justify-center p-4">
                    {isPDF ? (
                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">PDF Preview</p>
                            <p className="text-xs text-gray-500">{file.name}</p>
                            <embed
                                src={fileUrl}
                                type="application/pdf"
                                width="100%"
                                height="400px"
                                className="mt-2"
                            />
                        </div>
                    ) : (
                        <img
                            src={fileUrl}
                            alt="Certificate"
                            style={{ transform: `scale(${zoom / 100})` }}
                            className="transition-transform duration-200 cursor-pointer"
                            onClick={() => setIsFullscreen(true)}
                        />
                    )}
                </div>
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && !isPDF && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300"
                            onClick={() => setIsFullscreen(false)}
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={fileUrl}
                            alt="Certificate Fullscreen"
                            className="max-w-full max-h-full object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CertificatePreview;
