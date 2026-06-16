

import React, { useState, useMemo } from 'react';
import type { User, GuidedExercise, CompletedExerciseLog } from '../types';
import { exercises } from '../data/exercises';
import ExercisePlayer from './ExercisePlayer';
// FIX: Removed useLocalStorage import as data is now managed by App.tsx state.
import { CheckCircleIcon } from './Icons';

interface GuidedExercisesViewProps {
  currentUser: User;
  // FIX: Added props to manage state from App.tsx.
  completedLogs: CompletedExerciseLog[];
  setCompletedLogs: React.Dispatch<React.SetStateAction<CompletedExerciseLog[]>>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const GuidedExercisesView: React.FC<GuidedExercisesViewProps> = ({ currentUser, completedLogs, setCompletedLogs, apiFetch }) => {
  const [selectedExercise, setSelectedExercise] = useState<GuidedExercise | null>(null);
  // FIX: Removed useLocalStorage. State is now managed by props.
  
  const exercisesByCategory = useMemo(() => {
    return exercises.reduce((acc, exercise) => {
      if (!acc[exercise.category]) {
        acc[exercise.category] = [];
      }
      acc[exercise.category].push(exercise);
      return acc;
    }, {} as Record<GuidedExercise['category'], GuidedExercise[]>);
  }, []);

  const handleComplete = async (exerciseId: string) => {
    const newLog: CompletedExerciseLog = {
      exerciseId,
      date: new Date().toISOString(),
    };
    try {
        await apiFetch('/cbt/exercises', {
            method: 'POST',
            body: JSON.stringify({ exercise_id: exerciseId }),
        });
        setCompletedLogs(prevLogs => [...(prevLogs || []), newLog]);
    } catch (error) {
        console.error("Failed to save completed exercise:", error);
    }
  };

  const completedExerciseIds = useMemo(() => {
      // FIX: Add null check to prevent runtime error if localStorage value is null.
      return new Set((completedLogs || []).map(log => log.exerciseId));
  }, [completedLogs]);

  if (selectedExercise) {
    return (
      <ExercisePlayer
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Guided Exercises</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
          Select an exercise to begin your practice.
        </p>
      </div>
      
      <div className="space-y-10">
        {Object.entries(exercisesByCategory).map(([category, exercisesInCategory]) => {
          // FIX: Add a type guard to ensure exercisesInCategory is an array.
          // This prevents a "Property 'map' does not exist on type 'unknown'" error that can occur
          // if TypeScript fails to correctly infer the type from Object.entries.
          if (!Array.isArray(exercisesInCategory)) {
            return null;
          }
          return (
            <section key={category}>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercisesInCategory.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => setSelectedExercise(exercise)}
                    className="surface-motion bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{exercise.title}</h4>
                      {completedExerciseIds.has(exercise.id) && (
                          <div className="flex-shrink-0 text-green-500" title="Completed">
                              <span className="sr-only">Completed</span>
                              <CheckCircleIcon />
                          </div>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{exercise.description}</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default GuidedExercisesView;
