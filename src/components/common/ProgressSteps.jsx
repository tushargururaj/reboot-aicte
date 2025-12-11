import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

const ProgressSteps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Upload' },
        { id: 2, label: 'OCR' },
        { id: 3, label: 'AI Analysis' },
        { id: 4, label: 'Review' },
        { id: 5, label: 'Save' }
    ];

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${currentStep > step.id
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : currentStep === step.id
                                        ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                                        : 'bg-white border-gray-300 text-gray-400'
                                }`}>
                                {currentStep > step.id ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-semibold">{step.id}</span>
                                )}
                            </div>
                            <span className={`mt-2 text-xs font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                }`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ProgressSteps;
