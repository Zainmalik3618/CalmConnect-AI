
import React, { useState } from 'react';
import type { User, ThoughtRecord, CompletedExerciseLog } from '../types';
import ThoughtRecordsManager from './ThoughtRecordsManager';
import GuidedExercisesView from './GuidedExercisesView';
import { ArrowLeftIcon, BookOpenIcon, MindfulnessIcon } from './Icons';

interface CbtViewProps {
  currentUser: User;
  // FIX: Added props to manage state from App.tsx.
  thoughtRecords: ThoughtRecord[];
  setThoughtRecords: React.Dispatch<React.SetStateAction<ThoughtRecord[]>>;
  completedLogs: CompletedExerciseLog[];
  setCompletedLogs: React.Dispatch<React.SetStateAction<CompletedExerciseLog[]>>;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

type CbtSubView = 'menu' | 'records' | 'exercises';

const CbtView: React.FC<CbtViewProps> = ({ currentUser, thoughtRecords, setThoughtRecords, completedLogs, setCompletedLogs, apiFetch }) => {
  const [activeView, setActiveView] = useState<CbtSubView>('menu');

  const renderContent = () => {
    switch (activeView) {
      case 'records':
        return <ThoughtRecordsManager 
                  currentUser={currentUser} 
                  records={thoughtRecords} 
                  setRecords={setThoughtRecords} 
                  apiFetch={apiFetch} 
                  isLoading={false} 
                />;
      case 'exercises':
        return <GuidedExercisesView 
                  currentUser={currentUser} 
                  completedLogs={completedLogs} 
                  setCompletedLogs={setCompletedLogs} 
                  apiFetch={apiFetch} 
                />;
      case 'menu':
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-4 md:p-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">CBT Toolkit</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                Explore tools based on Cognitive Behavioral Therapy to build self-awareness and develop healthier thinking patterns.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <MenuCard
                icon={<BookOpenIcon />}
                title="Thought Records"
                description="Identify, challenge, and reframe negative automatic thoughts with this structured journal."
                onClick={() => setActiveView('records')}
              />
              <MenuCard
                icon={<MindfulnessIcon />}
                title="Guided Exercises"
                description="Practice mindfulness, meditation, and breathing techniques to calm your mind and body."
                onClick={() => setActiveView('exercises')}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {activeView !== 'menu' && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveView('menu')}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
          >
            <ArrowLeftIcon />
            Back to CBT Toolkit
          </button>
        </div>
      )}
      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

interface MenuCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    className="surface-motion bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg text-left flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
  >
    <div className="text-blue-500 mb-4">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </button>
);


export default CbtView;
