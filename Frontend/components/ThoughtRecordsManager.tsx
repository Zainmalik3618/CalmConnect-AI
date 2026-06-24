

import React, { useState, useMemo } from 'react';
import type { ThoughtRecord, User } from '../types';
// FIX: Removed useLocalStorage import as data is now managed by App.tsx state.
import { PlusIcon, SpinnerIcon } from './Icons';
import ThoughtRecordForm from './ThoughtRecordForm';
import Skeleton from './Skeleton';

interface ThoughtRecordsManagerProps {
  currentUser: User;
  // FIX: Added props to manage state from App.tsx.
  records: ThoughtRecord[];
  setRecords: React.Dispatch<React.SetStateAction<ThoughtRecord[]>>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  isLoading: boolean;
}

const ThoughtRecordsManager: React.FC<ThoughtRecordsManagerProps> = ({ currentUser, records, setRecords, apiFetch, isLoading }) => {
  // FIX: Removed useLocalStorage. State is now managed by props.
  const [activeRecord, setActiveRecord] = useState<ThoughtRecord | 'new' | null>(null);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const handleSelectRecord = (record: ThoughtRecord) => {
    setActiveRecord(record);
  };

  const handleNewRecord = () => {
    setActiveRecord('new');
  };

  const handleSave = async (recordToSave: Omit<ThoughtRecord, 'id' | 'date'>) => {
    // FIX: Map frontend camelCase to backend snake_case
    const payload = {
      situation: recordToSave.situation,
      automatic_thought: recordToSave.automaticThought,
      evidence_for: recordToSave.evidenceFor,
      evidence_against: recordToSave.evidenceAgainst,
      alternative_thought: recordToSave.alternativeThought,
      outcome: recordToSave.outcome,
    };

    try {
        if (activeRecord && activeRecord !== 'new' && 'id' in activeRecord) {
            // Update existing record
            const updatedRecord = await apiFetch(`/cbt/thoughts/${activeRecord.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            const mappedRecord = { ...recordToSave, id: updatedRecord.id, date: updatedRecord.date };
            setRecords(records.map(r => r.id === activeRecord.id ? mappedRecord : r));
            setActiveRecord(mappedRecord);
        } else {
            // Create new record
            const newRecord = await apiFetch('/cbt/thoughts', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            const mappedRecord = { ...recordToSave, id: newRecord.id, date: newRecord.date };
            setRecords([mappedRecord, ...records]);
            setActiveRecord(mappedRecord);
        }
    } catch(error) {
        console.error("Failed to save thought record:", error);
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
        await apiFetch(`/cbt/thoughts/${recordId}`, { method: 'DELETE' });
        setRecords(records.filter(r => r.id !== recordId));
        setActiveRecord(null);
    } catch (error) {
        console.error("Failed to delete thought record:", error);
    }
  };

  const handleCancel = () => {
      setActiveRecord(null);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <Skeleton className="h-7 w-40" />
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
        <div className="w-2/3 flex flex-col p-6 items-center justify-center">
          <SpinnerIcon className="h-12 w-12 text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold">Thought Records</h3>
          <button onClick={handleNewRecord} className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800" aria-label="New thought record">
            <PlusIcon />
          </button>
        </div>
        <div className="overflow-y-auto">
          {sortedRecords.map(record => (
            <button
              key={record.id}
              onClick={() => handleSelectRecord(record)}
              aria-current={activeRecord && activeRecord !== 'new' && activeRecord.id === record.id ? 'true' : undefined}
              className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 ${
                activeRecord && activeRecord !== 'new' && activeRecord.id === record.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
            >
              <p className="font-semibold truncate">{record.situation || 'New Record'}</p>
              <p className="text-sm text-gray-500">{formatDate(record.date)}</p>
            </button>
          ))}
          {sortedRecords.length === 0 && (
              <div className="m-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center dark:border-gray-700 dark:bg-gray-800/50">
                <p className="font-semibold text-gray-800 dark:text-gray-100">No thought records yet.</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start one when a thought feels worth unpacking.</p>
              </div>
          )}
        </div>
      </div>
      <div className="w-2/3 flex flex-col p-6 overflow-y-auto">
        {activeRecord ? (
            <ThoughtRecordForm 
                record={activeRecord === 'new' ? undefined : activeRecord}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={handleCancel}
            />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Welcome to the Thought Record Journal</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-prose">
                        This is a Cognitive Behavioral Therapy (CBT) tool to help you identify, challenge, and reframe negative automatic thoughts. By examining your thoughts, you can develop more balanced perspectives and improve your emotional well-being.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Select a record from the list or click the '+' button to start a new one.
                    </p>
                    {sortedRecords.length === 0 && (
                      <button onClick={handleNewRecord} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <PlusIcon /> Start your first record
                      </button>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ThoughtRecordsManager;
