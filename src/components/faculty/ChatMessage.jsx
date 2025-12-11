import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message, isUser, timestamp }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
        >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-md'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-md'
                }`}>
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`px-5 py-3 rounded-2xl shadow-md ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                    }`}>
                    <p className="text-base leading-relaxed whitespace-pre-wrap">{message}</p>
                </div>
                {timestamp && (
                    <span className="text-xs text-gray-400 mt-1 px-2">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default ChatMessage;
