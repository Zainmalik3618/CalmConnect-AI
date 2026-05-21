import React, { useState, useEffect } from 'react';
import type { ThoughtRecord } from '../types';
import { SaveIcon, TrashIcon } from './Icons';
import ConfirmationDialog from './ConfirmationDialog';

interface ThoughtRecordFormProps {
    record?: ThoughtRecord;
    onSave: (recordData: Omit<ThoughtRecord, 'id' | 'date'>) => void;
    onDelete: (id: string) => void;
    onCancel: () => void;
}

const steps = [
    { key: 'situation', title: 'The Situation', prompt: 'Describe the event that led to the unpleasant emotion. What happened? Who was there?' },
    { key: 'automaticThought', title: 'Automatic Thought(s)', prompt: 'What thoughts or images went through your mind? Rate how much you believe this thought (0-100%).' },
    { key: 'evidenceFor', title: 'Evidence For the Thought', prompt: 'What facts or experiences support this automatic thought?' },
    { key: 'evidenceAgainst', title: 'Evidence Against the Thought', prompt: 'What facts or experiences contradict this automatic thought?' },
    { key: 'alternativeThought', title: 'Alternative / Balanced Thought', prompt: 'Based on the evidence, what is a more realistic and balanced way of looking at the situation? Rate how much you believe this new thought (0-100%).' },
    { key: 'outcome', title: 'Outcome', prompt: 'How do you feel now? Rate your current emotions (e.g., Sadness 20%, Anxiety 10%).' },
];

type FormData = Omit<ThoughtRecord, 'id' | 'date'>;

const ThoughtRecordForm: React.FC<ThoughtRecordFormProps> = ({ record, onSave, onDelete, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        situation: '',
        automaticThought: '',
        evidenceFor: '',
        evidenceAgainst: '',
        alternativeThought: '',
        outcome: '',
    });

    useEffect(() => {
        if (record) {
            setFormData({
                situation: record.situation,
                automaticThought: record.automaticThought,
                evidenceFor: record.evidenceFor,
                evidenceAgainst: record.evidenceAgainst,
                alternativeThought: record.alternativeThought,
                outcome: record.outcome,
            });
            setCurrentStep(0);
        } else {
             setFormData({
                situation: '',
                automaticThought: '',
                evidenceFor: '',
                evidenceAgainst: '',
                alternativeThought: '',
                outcome: '',
            });
            setCurrentStep(0);
        }
    }, [record]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleSave = () => {
        onSave(formData);
    };

    const handleDelete = () => {
        if (record) {
            setIsConfirmOpen(true);
        }
    };

    const confirmDelete = () => {
        if (record) {
            onDelete(record.id);
        }
        setIsConfirmOpen(false);
    }

    const currentStepData = steps[currentStep];

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{record ? 'Edit Thought Record' : 'New Thought Record'}</h2>
                 {record && (
                    <button onClick={handleDelete} className="flex items-center gap-2 p-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800">
                        <TrashIcon/> Delete
                    </button>
                 )}
            </div>
             <div className="mb-4">
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"></div>
                    </div>
                </div>
                <p className="text-sm text-gray-500 text-right">Step {currentStep + 1} of {steps.length}</p>
            </div>
            <div className="flex-grow flex flex-col">
                <label htmlFor={`thought-record-step-${currentStepData.key}`} className="cursor-text">
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">{currentStepData.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{currentStepData.prompt}</p>
                </label>
                <textarea
                    id={`thought-record-step-${currentStepData.key}`}
                    name={currentStepData.key}
                    value={formData[currentStepData.key as keyof FormData]}
                    onChange={handleChange}
                    className="flex-grow w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
                    rows={8}
                />
            </div>
            <div className="mt-6 flex justify-between items-center">
                <div>
                     <button onClick={onCancel} className="py-2 px-4 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                        Cancel
                    </button>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleBack} disabled={currentStep === 0} className="py-2 px-4 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                        Back
                    </button>
                     {currentStep === steps.length - 1 ? (
                         <button onClick={handleSave} className="flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                             <SaveIcon /> {record ? 'Save Changes' : 'Save Record'}
                         </button>
                     ) : (
                         <button onClick={handleNext} className="py-2 px-4 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                             Next
                         </button>
                     )}
                </div>
            </div>
            <ConfirmationDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Thought Record"
            >
                Are you sure you want to permanently delete this record? This action cannot be undone.
            </ConfirmationDialog>
        </div>
    );
};

export default ThoughtRecordForm;