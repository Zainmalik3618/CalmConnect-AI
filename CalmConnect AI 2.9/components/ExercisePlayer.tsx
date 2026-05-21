import React, { useState, useEffect, useRef } from 'react';
import type { GuidedExercise } from '../types';
import { PlayIcon, PauseIcon, ArrowLeftIcon, ForwardIcon, BackwardIcon, CheckCircleIcon } from './Icons';

interface ExercisePlayerProps {
  exercise: GuidedExercise;
  onClose: () => void;
  onComplete: (exerciseId: string) => void;
}

const BreathingAnimator: React.FC<{ instruction: string; duration: number; isPaused: boolean }> = ({ instruction, duration, isPaused }) => {
    const animationName = instruction.toLowerCase().includes('in') ? 'inhale' :
                        instruction.toLowerCase().includes('out') ? 'exhale' : 'hold';
    
    return (
        <div className="relative w-48 h-48 flex items-center justify-center">
            <style>
                {`
                @keyframes inhale {
                    from { transform: scale(0.8); opacity: 0.8; }
                    to { transform: scale(1.2); opacity: 1; }
                }
                @keyframes exhale {
                    from { transform: scale(1.2); opacity: 1; }
                    to { transform: scale(0.8); opacity: 0.8; }
                }
                `}
            </style>
            <div className={`absolute w-full h-full bg-blue-500 rounded-full transition-all duration-500 ${animationName !== 'hold' ? 'animate-pulse' : ''}`}
                 style={{
                     animationName: animationName,
                     animationDuration: `${duration}s`,
                     animationIterationCount: 'infinite',
                     animationDirection: 'alternate',
                     animationPlayState: isPaused ? 'paused' : 'running',
                     animationTimingFunction: 'ease-in-out',
                 }}
            />
            <div className="absolute w-full h-full bg-blue-400 rounded-full opacity-50"
                 style={{
                     animationName: animationName,
                     animationDuration: `${duration}s`,
                     animationIterationCount: 'infinite',
                     animationDirection: 'alternate-reverse',
                     animationDelay: '0.5s',
                     animationPlayState: isPaused ? 'paused' : 'running',
                     animationTimingFunction: 'ease-in-out',
                 }}
            />
            <span className="relative text-white font-bold text-lg z-10">{instruction}</span>
        </div>
    );
};


const ExercisePlayer: React.FC<ExercisePlayerProps> = ({ exercise, onClose, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercise.steps[0].duration);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentStep = exercise.steps[currentStepIndex];

  useEffect(() => {
    if (isPaused || isCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (currentStepIndex < exercise.steps.length - 1) {
            setCurrentStepIndex(i => i + 1);
          } else {
            // End of exercise
            setIsCompleted(true);
            onComplete(exercise.id);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStepIndex, isPaused, exercise, onComplete, isCompleted]);
  
  useEffect(() => {
      setTimeLeft(exercise.steps[currentStepIndex].duration);
  }, [currentStepIndex, exercise.steps]);

  const progress = (currentStep.duration - timeLeft) / currentStep.duration;

  const handleNext = () => {
      if(currentStepIndex < exercise.steps.length - 1) {
          setCurrentStepIndex(i => i + 1);
      }
  }

  const handleBack = () => {
      if(currentStepIndex > 0) {
          setCurrentStepIndex(i => i - 1);
      }
  }

  if (isCompleted) {
    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-white p-4">
             <CheckCircleIcon className="h-16 w-16 text-green-500" />
             <h2 className="text-3xl font-bold mt-4 mb-2">Well Done!</h2>
             <p className="text-lg text-gray-300 mb-8">You have completed the {exercise.title} exercise.</p>
             <button
                onClick={onClose}
                className="py-2 px-6 font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
              >
                Return to Library
             </button>
        </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col items-center justify-between text-gray-800 dark:text-white p-4 md:p-8">
      <header className="w-full flex justify-between items-center">
        <button onClick={onClose} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <ArrowLeftIcon />
            <span className="hidden md:inline">Exit</span>
        </button>
        <h2 className="text-xl md:text-2xl font-bold">{exercise.title}</h2>
        <div className="text-sm text-gray-500">Step {currentStepIndex + 1} / {exercise.steps.length}</div>
      </header>

      <main className="flex flex-col items-center justify-center text-center flex-grow">
        <h3 className="text-3xl md:text-4xl font-bold mb-4">{currentStep.title}</h3>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-lg mb-8">{currentStep.instruction}</p>
        
        <div className="relative w-48 h-48 flex items-center justify-center">
            {exercise.category === 'Breathing' ? (
                <BreathingAnimator instruction={currentStep.title} duration={currentStep.duration} isPaused={isPaused} />
            ) : (
                <>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-gray-200 dark:text-gray-700" strokeWidth="5" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                        <circle
                        className="text-blue-500"
                        strokeWidth="5"
                        strokeDasharray={2 * Math.PI * 45}
                        strokeDashoffset={(2 * Math.PI * 45) * (1 - progress)}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <span className="absolute text-4xl font-bold">{timeLeft}</span>
                </>
            )}
        </div>
      </main>

      <footer className="w-full max-w-sm flex items-center justify-center gap-8">
        <button onClick={handleBack} disabled={currentStepIndex === 0} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Previous step">
            <BackwardIcon />
        </button>
        <button onClick={() => setIsPaused(!isPaused)} className="p-2 rounded-full text-blue-500 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 ring-offset-2 dark:ring-offset-gray-900 focus:ring-blue-500" aria-label={isPaused ? 'Play exercise' : 'Pause exercise'}>
          {isPaused ? <PlayIcon /> : <PauseIcon />}
        </button>
         <button onClick={handleNext} disabled={currentStepIndex === exercise.steps.length - 1} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Next step">
            <ForwardIcon />
        </button>
      </footer>
    </div>
  );
};

export default ExercisePlayer;