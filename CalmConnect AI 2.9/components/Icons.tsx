
import React from 'react';

export const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// Helper to generate unique IDs for SVG gradients.
// This prevents conflicts when multiple instances of the same SVG icon are rendered on a page.
const uniqueId = () => `grad_${Math.random().toString(36).substring(2, 9)}`;

export const LogoIcon = ({ className }: { className?: string }) => {
    // Each instance of the logo gets unique IDs for its gradients.
    const sageGradientId = uniqueId();
    const blueGradientId = uniqueId();

    return (
        <svg
          className={className || "h-8 w-8"}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={sageGradientId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#A3B18A" />
                <stop offset="100%" stopColor="#849868" />
            </linearGradient>
            <linearGradient id={blueGradientId} x1="1" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#A8DADC" />
                <stop offset="100%" stopColor="#81C6C8" />
            </linearGradient>
          </defs>

          {/* Sage Leaf - back */}
          <path
            d="M50 95 C 10 70, 20 30, 50 5 C 80 30, 90 70, 50 95 Z"
            fill={`url(#${sageGradientId})`}
            transform="rotate(-15 50 50) translate(-10, 0)"
          />

          {/* Blue Leaf - front */}
          <path
            d="M50 95 C 10 70, 20 30, 50 5 C 80 30, 90 70, 50 95 Z"
            fill={`url(#${blueGradientId})`}
            transform="rotate(15 50 50) translate(10, -5)"
            opacity="0.85"
          />
        </svg>
    );
};


export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

export const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

export const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.707 1.707a1 1 0 001.414 1.414L5 6.414V8a1 1 0 002 0V6.414l1.293 1.293a1 1 0 001.414-1.414L8 4.586V3a1 1 0 00-1-1H5zM2 12a1 1 0 011-1h1.586l1.707-1.707a1 1 0 011.414 1.414L6.414 12H8a1 1 0 010 2H6.414l-1.293 1.293a1 1 0 01-1.414-1.414L5.414 13H4a1 1 0 01-1-1zM15 2a1 1 0 00-1 1v1.586l-1.707 1.707a1 1 0 001.414 1.414L15 6.414V8a1 1 0 002 0V6.414l1.293 1.293a1 1 0 001.414-1.414L18 4.586V3a1 1 0 00-1-1h-2zM12 12a1 1 0 011-1h1.586l1.707-1.707a1 1 0 011.414 1.414L16.414 12H18a1 1 0 010 2h-1.586l-1.293 1.293a1 1 0 01-1.414-1.414L15.414 13H14a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

export const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

export const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const AlertCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 min-w-5 flex-shrink-0"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ChecklistIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

export const CognitiveDistortionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8l-1 1 2 2-2 2 1 1" />
  </svg>
);

export const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const SpinnerIcon = ({ className }: { className?: string }) => (
    <svg className={`animate-spin ${className || 'h-5 w-5'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

export const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);

export const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 019-2.607 11.955 11.955 0 019 2.607c.317-2.52-.5-5.051-2.382-6.938a12.02 12.02 0 00-2.382-2.958z" />
    </svg>
);

export const WarningIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 text-red-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

export const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

export const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

export const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const MindfulnessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export const XCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

export const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm3 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" />
  </svg>
);

export const ForwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

export const BackwardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
);

// FIX: Added optional 'title' prop to CheckIcon component for accessibility.
export const CheckIcon = ({ className, title }: { className?: string; title?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

// FIX: Added optional 'title' prop to DoubleCheckIcon component for accessibility.
export const DoubleCheckIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5l4 4L16 8.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 13.5l4 4L21 8.5" />
  </svg>
);

export const MicrophoneIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" />
    </svg>
);

export const StopIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
    </svg>
);

export const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 min-w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

export const ThumbsUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.333a2 2 0 001.92-2.56l-1.333-5.333a2 2 0 00-1.92-1.44H9.5a1 1 0 01-1-1v-4a1 1 0 00-1-1H7a2 2 0 00-2 2v5.333z" />
  </svg>
);

export const ThumbsDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667V3a1 1 0 00-1-1H6.667a2 2 0 00-1.92 2.56l1.333 5.333a2 2 0 001.92 1.44H10.5a1 1 0 011 1v4a1 1 0 001 1h.5a2 2 0 002-2V9.667z" />
  </svg>
);

export const PencilIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

export const BanIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
);

export const UnlockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path d="M7 11V7a5 5 0 0110 0v4m-5 4v3m4 0H8" />
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    </svg>
);


export const UserPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

export const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 min-w-5 flex-shrink-0"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

export const StarIcon = ({ className, ...props }: { className?: string; [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 min-w-5 flex-shrink-0"} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 min-w-5 flex-shrink-0"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// FIX: Updated ClockIcon to accept a className prop to allow for custom styling.
export const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 min-w-5 flex-shrink-0"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true" focusable="false">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
