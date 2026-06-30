
import React, { useState, useEffect } from 'react';
import { StarIcon, WarningIcon, CheckCircleIcon } from '../Icons';
import Skeleton from '../Skeleton';

interface Feedback {
    id: string;
    user_id: string;
    reporter_name: string;
    target_id?: string;
    target_name?: string;
    type: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface Report {
    id: string;
    user_id: string;
    reporter_name: string;
    target_id?: string;
    target_name?: string;
    type: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
}

interface FeedbackDashboardProps {
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const FeedbackDashboard: React.FC<FeedbackDashboardProps> = ({ apiFetch }) => {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'feedback' | 'reports'>('feedback');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feedbackData, reportsData] = await Promise.all([
                apiFetch('/feedback'),
                apiFetch('/reports')
            ]);
            setFeedback(feedbackData);
            setReports(reportsData);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateReportStatus = async (id: string, status: string) => {
        try {
            await apiFetch(`/reports/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            setReports(reports.map(r => r.id === id ? { ...r, status: status as any } : r));
        } catch (err) {
            console.error('Error updating report status:', err);
        }
    };

    if (loading) {
        return (
            <div className="space-y-5 p-6 md:p-8" role="status" aria-label="Loading feedback">
                <div className="flex items-center justify-between"><Skeleton className="h-8 w-56" /><Skeleton className="h-11 w-64 rounded-xl" /></div>
                {[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-28 rounded-xl" />)}
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 h-full overflow-y-auto">
            <div className="p-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Feedback & Reports</h2>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'feedback'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        Feedback ({feedback.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'reports'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        Reports ({reports.length})
                    </button>
                </div>
            </div>

            {activeTab === 'feedback' ? (
                <div className="grid gap-4">
                    {feedback.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 dark:text-zinc-400">No feedback submitted yet.</p>
                        </div>
                    ) : (
                        feedback.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-zinc-900 dark:text-white">{item.reporter_name}</span>
                                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                item.type === 'appointment' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                item.type === 'psychiatrist' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {item.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                            {item.target_name && (
                                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    Target: <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.target_name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                className={`h-5 w-5 ${
                                                    item.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-200 dark:text-zinc-800'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {item.comment && (
                                    <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 italic">
                                        "{item.comment}"
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-500 dark:text-zinc-400">No reports submitted yet.</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-bold text-zinc-900 dark:text-white">{report.reporter_name}</span>
                                            <span className="text-zinc-400 dark:text-zinc-600">•</span>
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                report.type === 'behavior' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                report.type === 'technical' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                                            }`}>
                                                {report.type.toUpperCase()}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                report.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                report.status === 'reviewed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            }`}>
                                                {report.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {report.status !== 'resolved' && (
                                            <button
                                                onClick={() => handleUpdateReportStatus(report.id, report.status === 'pending' ? 'reviewed' : 'resolved')}
                                                className="p-2 text-zinc-500 hover:text-blue-600 transition-colors"
                                                title={report.status === 'pending' ? 'Mark as Reviewed' : 'Mark as Resolved'}
                                            >
                                                <CheckCircleIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    {report.description}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedbackDashboard;
