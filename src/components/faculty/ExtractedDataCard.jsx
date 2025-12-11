import React from 'react';
import { CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ExtractedDataCard = ({ field, value, confidence, label, onEdit }) => {
    const getConfidenceColor = (conf) => {
        if (conf >= 0.8) return 'from-green-500 to-emerald-600';
        if (conf >= 0.5) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-600';
    };

    const getConfidenceIcon = (conf) => {
        if (conf >= 0.8) return <CheckCircle className="w-5 h-5" />;
        return <AlertCircle className="w-5 h-5" />;
    };

    const getConfidenceBg = (conf) => {
        if (conf >= 0.8) return 'bg-green-50 border-green-200';
        if (conf >= 0.5) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl border-2 ${getConfidenceBg(confidence)} transition-all hover:shadow-md`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getConfidenceColor(confidence)} text-white text-xs font-bold`}>
                            {getConfidenceIcon(confidence)}
                            <span>{Math.round(confidence * 100)}%</span>
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{value || 'N/A'}</p>
                </div>
                {onEdit && (
                    <button
                        onClick={() => onEdit(field)}
                        className="ml-3 p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ExtractedDataCard;
