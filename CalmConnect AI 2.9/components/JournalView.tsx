

import React, { useState, useMemo } from 'react';
// FIX: Removed unused types from import.
import type { JournalEntry, User } from '../types';
// FIX: Removed useLocalStorage import as data is now managed by App.tsx state.
import { PlusIcon, SaveIcon, TrashIcon, LightbulbIcon, SpinnerIcon } from './Icons';
import ConfirmationDialog from './ConfirmationDialog';
import Skeleton from './Skeleton';
// FIX: Removed import from blank local file. AI logic is now on the backend.

// FIX: Added type for PromptTheme directly, as the service file is removed.
type PromptTheme = 'General' | 'Gratitude' | 'Self-Reflection' | 'Processing Difficulties';

interface JournalViewProps {
  currentUser: User;
  // FIX: Added props to manage state from App.tsx.
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  isLoading: boolean;
}

const promptThemes: PromptTheme[] = ['General', 'Gratitude', 'Self-Reflection', 'Processing Difficulties'];

const JournalView: React.FC<JournalViewProps> = ({ currentUser, entries, setEntries, apiFetch, isLoading }) => {
  // FIX: Removed useLocalStorage. State is now managed by props.
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [currentContent, setCurrentContent] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPromptLoading, setIsPromptLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<PromptTheme>('General');

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const handleSelectEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setCurrentContent(entry.content);
  };

  const handleNewEntry = () => {
    setActiveEntry(null);
    setCurrentContent('');
  };

  const handleSave = async () => {
    try {
        if (activeEntry) {
          // Update existing entry
          const updatedEntry = await apiFetch(`/journal/${activeEntry.id}`, {
              method: 'PUT',
              body: JSON.stringify({ content: currentContent }),
          });
          setEntries(entries.map(e => e.id === activeEntry.id ? updatedEntry : e));
        } else {
          // Create new entry
          const newEntry = await apiFetch('/journal', {
              method: 'POST',
              body: JSON.stringify({ content: currentContent }),
          });
          setEntries([newEntry, ...entries]);
          setActiveEntry(newEntry);
        }
    } catch (error) {
        console.error("Failed to save journal entry:", error);
    }
  };

  const handleDelete = () => {
    if (activeEntry) {
        setIsConfirmOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (activeEntry) {
        try {
            await apiFetch(`/journal/${activeEntry.id}`, { method: 'DELETE' });
            setEntries(entries.filter(e => e.id !== activeEntry.id));
            handleNewEntry();
        } catch (error) {
            console.error("Failed to delete journal entry:", error);
        }
    }
    setIsConfirmOpen(false);
  }

  const handleGeneratePrompt = async () => {
    setIsPromptLoading(true);
    try {
      // FIX: Call backend to generate prompt. It has all the necessary context.
      const response = await apiFetch('/cbt/journal-prompt', {
          method: 'POST',
          body: JSON.stringify({ theme: selectedTheme }),
      });
      
      handleNewEntry(); 
      setCurrentContent(response.prompt);

    } catch (error) {
      console.error("Failed to generate prompt:", error);
      // Provide a safe fallback prompt
      setCurrentContent("What is one thing you're grateful for today, no matter how small?");
    } finally {
      setIsPromptLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
        <div className="flex h-full">
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3 flex flex-col p-6 space-y-4">
                <Skeleton className="h-full w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">Your Entries</h3>
          <button onClick={handleNewEntry} className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800" aria-label="New journal entry">
            <PlusIcon />
          </button>
        </div>
        <div className="overflow-y-auto">
          {sortedEntries.map(entry => (
            <button
              key={entry.id}
              onClick={() => handleSelectEntry(entry)}
              className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 ${
                activeEntry?.id === entry.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
              aria-current={activeEntry?.id === entry.id ? 'true' : undefined}
            >
              <p className="font-semibold truncate">{entry.content.split('\n')[0] || 'New Entry'}</p>
              <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col p-6">
        {activeEntry && (
             <div className="flex justify-between items-center mb-4">
                 <p className="text-sm text-gray-500">
                    Last saved: {new Date(activeEntry.date).toLocaleString()}
                 </p>
                <button onClick={handleDelete} className="flex items-center gap-2 p-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800">
                    <TrashIcon/> Delete
                </button>
             </div>
        )}
        <div role="group" aria-labelledby="prompt-theme-label" className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
          <p id="prompt-theme-label" className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Select a prompt theme:</p>
          <div className="flex flex-wrap gap-2">
            {promptThemes.map(theme => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                aria-pressed={selectedTheme === theme}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${
                  selectedTheme === theme
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {theme.replace(/([A-Z])/g, ' $1').trim()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end mb-2">
          <button 
            onClick={handleGeneratePrompt}
            disabled={isPromptLoading}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
          >
            {isPromptLoading ? (
              <>
                <SpinnerIcon className="h-4 w-4" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <LightbulbIcon />
                <span>Generate a prompt</span>
              </>
            )}
          </button>
        </div>
        <label htmlFor="journal-content" className="sr-only">Journal Content</label>
        <textarea
          id="journal-content"
          name="journal-content"
          value={currentContent}
          onChange={(e) => setCurrentContent(e.target.value)}
          placeholder="Start writing your thoughts here..."
          className="flex-grow w-full p-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
        />
        <button
          onClick={handleSave}
          disabled={!currentContent.trim()}
          className="mt-4 flex items-center justify-center gap-2 w-full p-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          <SaveIcon /> {activeEntry ? 'Save Changes' : 'Save Entry'}
        </button>
      </div>
       <ConfirmationDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={confirmDelete}
            title="Delete Journal Entry"
        >
            Are you sure you want to permanently delete this journal entry? This action cannot be undone.
      </ConfirmationDialog>
    </div>
  );
};

export default JournalView;