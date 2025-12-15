import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Edit2, AlertTriangle, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Single Field Component
const FieldItem = ({ field, value, confidence, isMissing, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value || '');

    const label = field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // Confidence handling
    const confScore = confidence ? Math.round(confidence * 100) : 0;

    const getStatusColor = () => {
        if (isMissing) return 'from-red-500 to-red-600';
        if (confScore >= 80) return 'from-green-500 to-emerald-600';
        if (confScore >= 50) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-600';
    };

    const getBgColor = () => {
        if (isMissing) return 'bg-red-50 border-red-200';
        if (confScore >= 80) return 'bg-green-50 border-green-200';
        if (confScore >= 50) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const handleSave = () => {
        onUpdate(field, editValue);
        setIsEditing(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl border-2 ${getBgColor()} transition-all hover:shadow-md relative group`}
        >
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
                    {!isMissing && (
                        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${getStatusColor()} text-white text-[10px] font-bold`}>
                            {confScore >= 80 ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            <span>{confScore}%</span>
                        </div>
                    )}
                    {isMissing && (
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            <span>MISSING</span>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="flex items-center space-x-2 mt-1">
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 text-sm border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 p-1"
                        />
                        <button onClick={handleSave} className="text-green-600 hover:bg-green-100 p-1 rounded"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setIsEditing(false)} className="text-red-500 hover:bg-red-100 p-1 rounded"><X className="w-4 h-4" /></button>
                    </div>
                ) : (
                    <div className="flex justify-between items-end group">
                        <p className={`text-base font-semibold ${!value ? 'text-gray-400 italic' : 'text-gray-800'} break-words`}>
                            {value || 'Not detected'}
                        </p>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-600 transition-opacity p-1"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Main Grid Component
const ExtractedDataCard = ({ data, confidence, missingFields, onUpdate }) => {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(data).map(([key, value]) => (
                <FieldItem
                    key={key}
                    field={key}
                    value={value}
                    confidence={confidence ? confidence[key] : 0}
                    isMissing={missingFields ? missingFields.includes(key) : false}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    );
};

export default ExtractedDataCard;
