

import React, { useState, useEffect, useMemo } from 'react';
import type { ActivityLog } from '../../types';
import { ClockIcon } from '../Icons';
import Skeleton from '../Skeleton';

interface ActivityLogViewProps {
    apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const ActivityLogView: React.FC<ActivityLogViewProps> = ({ apiFetch }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'login' | 'logout'>('all');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await apiFetch('/users/activity-logs');
                // Map backend snake_case to frontend camelCase
                const formattedData = data.map((log: any) => ({
                    id: log.id,
                    userId: log.user_id,
                    username: log.username,
                    activityType: log.activity_type,
                    ipAddress: log.ip_address,
                    timestamp: log.timestamp,
                }));
                setLogs(formattedData);
            } catch (err: any) {
                setError('Failed to fetch activity logs. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, [apiFetch]);
    
    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => {
                if (filterType === 'all') return true;
                return log.activityType === filterType;
            })
            .filter(log => {
                const term = searchTerm.toLowerCase();
                return log.username.toLowerCase().includes(term) || (log.ipAddress && log.ipAddress.toLowerCase().includes(term));
            });
    }, [logs, filterType, searchTerm]);

    const renderSkeleton = () => (
        <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                </tr>
            ))}
        </tbody>
    );

    return (
        <div className="p-6 md:p-8 h-full overflow-y-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Activity Logs</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Track user login and logout events.</p>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 rounded-r-lg" role="alert">
                    <p>{error}</p>
                </div>
            )}
            
             <div className="mb-4 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    id="log-search"
                    name="log-search"
                    placeholder="Search by username or IP..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                    <button onClick={() => setFilterType('all')} className={`px-4 py-2 text-sm rounded-md ${filterType === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>All</button>
                    <button onClick={() => setFilterType('login')} className={`px-4 py-2 text-sm rounded-md ${filterType === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Logins</button>
                    <button onClick={() => setFilterType('logout')} className={`px-4 py-2 text-sm rounded-md ${filterType === 'logout' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Logouts</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Activity</th>
                            <th scope="col" className="px-6 py-3">IP Address</th>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                        </tr>
                    </thead>
                    {isLoading ? renderSkeleton() : (
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                            log.activityType === 'login' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                        }`}>
                                            {log.activityType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.ipAddress}</td>
                                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
                 {!isLoading && filteredLogs.length === 0 && (
                    <div className="text-center py-16 flex flex-col items-center text-gray-500 dark:text-gray-400">
                         <ClockIcon />
                         <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No Activity Logs Found</h3>
                         <p className="mt-1 text-sm">No user activity matches your current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogView;