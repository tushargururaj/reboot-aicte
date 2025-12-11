import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => {
    return (
        <div className="flex items-center space-x-2 p-4">
            <div className="flex space-x-1">
                {[0, 1, 2].map((index) => (
                    <motion.div
                        key={index}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: index * 0.15
                        }}
                    />
                ))}
            </div>
            <span className="text-sm text-gray-500">AI is thinking...</span>
        </div>
    );
};

export default TypingIndicator;
