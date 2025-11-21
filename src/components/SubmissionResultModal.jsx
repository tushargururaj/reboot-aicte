// src/components/SubmissionResultModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Backdrop = ({ onClick }) => (
  <div
    onClick={onClick}
    className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
  />
);

/**
 * SubmissionResultModal
 * props:
 * - open (bool)
 * - type: "success" | "error" | "info"
 * - title: string
 * - message: string
 * - onClose: fn
 */
export default function SubmissionResultModal({ open, type = "success", title, message, onClose }) {
  const navigate = useNavigate();
  // State for the countdown timer
  const [countdown, setCountdown] = useState(5); 

  const isSuccess = type === "success";
  const isError = type === "error";

  // --- Timer Logic ---
  useEffect(() => {
    if (!open || !isSuccess) return; // Only run timer on open success modal

    setCountdown(5); // Reset timer on open

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // FIXED: Redirect automatically to My Submissions when timer hits zero
          navigate("/faculty-submissions", { replace: true });
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function to clear the interval
    return () => clearInterval(timer);
  }, [open, isSuccess, navigate, onClose]);


  if (!open) return null;

  const handleDoneClick = () => {
    // FIXED: Redirect immediately to My Submissions page
    navigate("/faculty-submissions", { replace: true });
    onClose();
  };

  return (
    <>
      <Backdrop onClick={isError ? onClose : handleDoneClick} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 flex flex-col items-center gap-4">
            
            {/* Animated circle with tick or cross */}
            <div className="w-28 h-28 flex items-center justify-center">
              {isSuccess ? <AnimatedTick /> : <AnimatedX />}
            </div>

            <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 text-center">{message}</p>

            <div className="pt-3">
              {isSuccess ? (
                <button
                  onClick={handleDoneClick}
                  className="relative px-6 py-2 rounded-lg font-medium transition bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg"
                >
                  Done (Redirecting in {countdown}s)
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg font-medium transition bg-red-600 text-white hover:bg-red-500 shadow-lg"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Animated tick using SVG stroke-dashoffset animation */
function AnimatedTick() {
  return (
    <svg width="112" height="112" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>

      <circle cx="60" cy="60" r="48" stroke="url(#g1)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="circle-anim" />
      <path d="M40 62 L54 76 L81 48" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="tick-anim" fill="none" />
      <style>{`
        .circle-anim {
          stroke-dasharray: 302;
          stroke-dashoffset: 302;
          transform-origin: 60px 60px;
          animation: circleDraw 700ms ease-out forwards;
        }
        .tick-anim {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: tickDraw 400ms 600ms ease-out forwards;
        }
        @keyframes circleDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes tickDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  );
}

/* Animated X (error) */
function AnimatedX() {
  return (
    <svg width="112" height="112" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="48" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="circle-err" fill="none"/>
      <g stroke="#fff" strokeWidth="6" strokeLinecap="round">
        <path d="M40 40 L80 80" className="x-1" />
        <path d="M80 40 L40 80" className="x-2" />
      </g>
      <style>{`
        .circle-err { stroke-dasharray: 302; stroke-dashoffset: 302; animation: circleErr 600ms ease-out forwards; }
        .x-1 { stroke-dasharray: 56; stroke-dashoffset: 56; animation: x1 300ms 420ms ease-out forwards; }
        .x-2 { stroke-dasharray: 56; stroke-dashoffset: 56; animation: x2 300ms 520ms ease-out forwards; }
        @keyframes circleErr { to { stroke-dashoffset: 0; } }
        @keyframes x1 { to { stroke-dashoffset: 0; } }
        @keyframes x2 { to { stroke-dashoffset: 0; } }
      `}</style>
    </svg>
  );
}