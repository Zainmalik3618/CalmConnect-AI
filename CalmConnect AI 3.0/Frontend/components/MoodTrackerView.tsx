
import React, { useState, useEffect, useRef } from 'react';
import type { MoodEntry, User } from '../types';
// FIX: Removed useLocalStorage import as data is now managed by App.tsx state via props.
import MoodChart from './MoodChart';
import Skeleton from './Skeleton';
import { BookOpenIcon } from './Icons';

interface MoodTrackerViewProps {
  currentUser: User;
  // FIX: Added props to manage state from App.tsx.
  moodHistory: MoodEntry[];
  setMoodHistory: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  isLoading: boolean;
}

const moodOptions = [
  { level: 1, emoji: '😔', label: 'Very Sad' },
  { level: 2, emoji: '😟', label: 'Sad' },
  { level: 3, emoji: '😐', label: 'Neutral' },
  { level: 4, emoji: '🙂', label: 'Happy' },
  { level: 5, emoji: '😄', label: 'Very Happy' },
];

const MoodTrackerView: React.FC<MoodTrackerViewProps> = ({ currentUser, moodHistory, setMoodHistory, apiFetch, isLoading }) => {
  // FIX: Removed useLocalStorage. State is now managed by props.
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNoteModalOpen) {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        const textarea = modalRef.current?.querySelector('textarea');
        textarea?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCloseModal();
                return;
            }
            if (e.key === 'Tab') {
                if (e.shiftKey) { 
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            }
        };

        const modal = modalRef.current;
        modal?.addEventListener('keydown', handleKeyDown);

        return () => {
            modal?.removeEventListener('keydown', handleKeyDown);
        };
    }
  }, [isNoteModalOpen]);

  const handleMoodSelect = (moodLevel: number) => {
    setSelectedMood(moodLevel);
    setIsNoteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNoteModalOpen(false);
    setTimeout(() => {
        setSelectedMood(null);
        setNote('');
    }, 300); 
  };
  
  const handleSaveMood = async () => {
    if (selectedMood === null) return;
    
    const moodData = {
      mood: selectedMood,
      notes: note.trim() === '' ? undefined : note.trim(),
    };
    
    try {
        const newEntry = await apiFetch('/mood', {
            method: 'POST',
            body: JSON.stringify(moodData),
        });
        setMoodHistory([...moodHistory, newEntry]);
        handleCloseModal();
    } catch (error) {
        console.error("Failed to save mood entry:", error);
        // Optionally, show an error to the user
    }
  };

  const today = new Date().toDateString();
  const hasLoggedToday = moodHistory.some(entry => new Date(entry.date).toDateString() === today);
  const selectedMoodOption = moodOptions.find(opt => opt.level === selectedMood);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 h-full">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Mood Tracker</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
          <Skeleton className="h-7 w-3/4 mb-4" />
          <div className="flex justify-around items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <Skeleton className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <Skeleton className="h-7 w-1/2 mb-4" />
          <div className="h-80 w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Mood Tracker</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">How are you feeling right now?</h3>
        {hasLoggedToday ? (
           <p className="text-center text-green-600 dark:text-green-400 p-4 bg-green-50 dark:bg-green-900/50 rounded-lg">
             You've already logged your mood for today. Great job!
           </p>
        ) : (
          <div className="flex justify-around items-center">
            {moodOptions.map(({ level, emoji, label }) => (
              <button
                key={level}
                onClick={() => handleMoodSelect(level)}
                className="flex flex-col items-center group space-y-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-transform duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2"
                aria-label={label}
              >
                <span className="text-4xl md:text-5xl group-hover:animate-bounce" aria-hidden="true">{emoji}</span>
                <span className="text-xs md:text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Your Mood History</h3>
        {moodHistory.length > 0 ? (
          <div className="h-80 w-full">
            <MoodChart data={moodHistory} />
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            You haven't logged any moods yet. Start tracking to see your history here.
          </p>
        )}
      </div>

      {moodHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Recent Logs</h3>
            <ul className="space-y-4">
            {[...moodHistory].reverse().slice(0, 5).map(entry => {
                const moodOption = moodOptions.find(opt => opt.level === entry.mood);
                return (
                <li key={entry.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{moodOption?.emoji}</span>
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{moodOption?.label}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(entry.date).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    {entry.notes && (
                        <div className="mt-3 pl-10 flex items-start gap-3 text-gray-600 dark:text-gray-300">
                           <BookOpenIcon />
                           <p className="text-sm italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md w-full">{entry.notes}</p>
                        </div>
                    )}
                </li>
                );
            })}
            </ul>
        </div>
      )}

      {isNoteModalOpen && selectedMoodOption && (
        <div
          ref={modalRef}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="note-modal-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all duration-300 scale-100 p-6">
            <div className="text-center">
              <span className="text-6xl mb-2">{selectedMoodOption.emoji}</span>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2" id="note-modal-title">
                You're feeling <span className="text-blue-500">{selectedMoodOption.label.toLowerCase()}</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Would you like to add a note about what's on your mind?
              </p>
              <textarea
                id="mood-note"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional: What's happening? Any specific thoughts or events?"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="button"
                onClick={handleSaveMood}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
              >
                Save Mood
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTrackerView;