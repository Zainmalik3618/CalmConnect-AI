
import React, { useState } from 'react';
import { WarningIcon, CheckCircleIcon } from './Icons';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
    targetId?: string;
}

const ReportIssueModal: React.FC<ReportIssueModalProps> = ({ isOpen, onClose, apiFetch, targetId }) => {
    const [type, setType] = useState('technical');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description) return;

        setIsSubmitting(true);
        try {
            await apiFetch('/reports', {
                method: 'POST',
                body: JSON.stringify({
                    targetId,
                    type,
                    description
                })
            });

            setIsSuccess(true);
            setTimeout(onClose, 2000);
        } catch (err) {
            console.error('Error submitting report:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="view-transition bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Report Submitted</h2>
                    <p className="text-zinc-500 dark:text-zinc-400">Thank you for letting us know. We will review this shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="view-transition bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <WarningIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Report an Issue</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Issue Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        >
                            <option value="technical">Technical Issue / Bug</option>
                            <option value="behavior">Inappropriate Behavior</option>
                            <option value="ai_response">Inappropriate AI Response</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please provide details about the issue..."
                            className="w-full h-32 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                            required
                        />
                    </div>

                    <div className="flex space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 ease-out"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!description || isSubmitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out shadow-lg shadow-red-500/20"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportIssueModal;
