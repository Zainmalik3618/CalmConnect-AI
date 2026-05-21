

import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { LogoIcon, ChatIcon, ChartBarIcon, BookOpenIcon, ChecklistIcon, ShieldCheckIcon } from './Icons';

interface OnboardingViewProps {
  user: User;
  onComplete: () => void;
}

// Renamed to avoid confusion with the SparklesIcon from Icons.tsx and potential global conflicts
const OnboardingCheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

const onboardingSteps = [
    {
        icon: <LogoIcon />,
        title: (name: string) => `Welcome to CalmConnect, ${name}!`,
        text: "We're happy to have you here. Let's take a quick tour to help you get started on your mental wellness journey.",
    },
    {
        icon: <ChatIcon />,
        title: () => "Your Personal AI Companion",
        text: "Our friendly AI chat is here to listen anytime you need to talk. It's a safe, non-judgmental space to explore your thoughts and feelings.",
    },
    {
        icon: <div className="flex gap-4 text-blue-500"><ChartBarIcon /><BookOpenIcon /><ChecklistIcon /></div>,
        title: () => "Your Wellness Toolkit",
        text: "Track your mood, write in your journal, and practice CBT exercises. These tools are designed to help you build self-awareness and resilience.",
    },
     {
        icon: <ShieldCheckIcon />,
        title: () => "Your Privacy Matters",
        text: "Your data, including journal entries and mood logs, is stored securely on your device. We are committed to protecting your privacy.",
    },
    {
        icon: <OnboardingCheckCircleIcon />,
        title: () => "You're All Set!",
        text: "You're ready to begin. Remember, this is your space to grow and reflect. We're here to support you every step of the way.",
    }
];

const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    const currentStep = onboardingSteps[step];

    useEffect(() => {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        firstElement?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            }
             if (e.key === 'Escape') {
                onComplete();
            }
        };

        const modal = modalRef.current;
        modal?.addEventListener('keydown', handleKeyDown);

        return () => {
            modal?.removeEventListener('keydown', handleKeyDown);
        };
    }, [step, onComplete]);

    const handleNext = () => {
        if (step < onboardingSteps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };
    
    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
            aria-describedby="onboarding-description"
        >
            <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100 p-8 text-center flex flex-col items-center">
                <div className="mb-6 text-blue-500">
                    {currentStep.icon}
                </div>
                <h2 id="onboarding-title" className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    {currentStep.title(user.username)}
                </h2>
                <p id="onboarding-description" className="text-gray-600 dark:text-gray-300 mb-8 px-4">
                    {currentStep.text}
                </p>

                <div className="flex justify-center items-center gap-3 mb-8">
                    {onboardingSteps.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${step === index ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        />
                    ))}
                </div>

                <div className="flex justify-between w-full">
                    {step > 0 ? (
                        <button 
                            onClick={handleBack}
                            className="py-2 px-6 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                        >
                            Back
                        </button>
                    ) : <div/>}
                    <button 
                        onClick={handleNext}
                        className="py-2 px-6 text-sm font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                    >
                        {step === onboardingSteps.length - 1 ? "Get Started" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingView;