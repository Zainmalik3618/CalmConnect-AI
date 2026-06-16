
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Quote, Trophy, TrendingUp, Calendar, Zap, Brain, Smile, Book } from 'lucide-react';
import axios from 'axios';

interface StreakData {
    current_streak: number;
    longest_streak: number;
    total_points: number;
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon_name: string;
    category: string;
    awarded_at?: string;
}

interface QuoteData {
    text: string;
    author: string;
}

const getIcon = (name: string, className?: string) => {
    switch (name) {
        case 'flame': return <Flame className={className} />;
        case 'zap': return <Zap className={className} />;
        case 'brain': return <Brain className={className} />;
        case 'book': return <Book className={className} />;
        case 'smile': return <Smile className={className} />;
        default: return <Award className={className} />;
    }
};

interface MotivationViewProps {
    apiFetch?: (url: string, options?: RequestInit) => Promise<any>;
}

const MotivationView: React.FC<MotivationViewProps> = ({ apiFetch }) => {
    const [stats, setStats] = useState<{ streak: StreakData; earnedBadges: Badge[]; availableBadgesCount: number } | null>(null);
    const [quote, setQuote] = useState<QuoteData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (apiFetch) {
                    const data = await apiFetch('/motivation/dashboard');
                    setStats(data.stats);
                    setQuote(data.quote);
                } else {
                    // Fallback for isolated testing/dev
                    const token = localStorage.getItem('token');
                    const response = await axios.get('http://localhost:3001/api/motivation/dashboard', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setStats(response.data.stats);
                    setQuote(response.data.quote);
                }
            } catch (err) {
                console.error('Error fetching motivation data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [apiFetch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Rewards & Motivation</h2>
                    <p className="text-gray-500 dark:text-gray-400">Track your progress and celebrate your mental wellness journey.</p>
                </div>
                <div className="surface-motion flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                        <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Points</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.streak.total_points || 0}</p>
                    </div>
                </div>
            </header>

            {/* Daily Quote Section */}
            {quote && (
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-8 text-white shadow-xl"
                >
                    <div className="relative z-10">
                        <Quote className="w-12 h-12 text-indigo-200/50 mb-4" />
                        <blockquote className="text-2xl font-medium leading-relaxed mb-6">
                            "{quote.text}"
                        </blockquote>
                        <cite className="not-italic text-indigo-100/80">— {quote.author || 'Anonymous'}</cite>
                    </div>
                    <div className="absolute right-[-20px] top-[-20px] opacity-10">
                        <Quote className="w-64 h-64" />
                    </div>
                </motion.section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Streak Card */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="surface-motion lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center justify-between"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center justify-center p-6 bg-orange-50 dark:bg-orange-900/30 rounded-full mb-4">
                            <Flame className={`w-16 h-16 ${stats?.streak.current_streak ? 'text-orange-600 dark:text-orange-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        </div>
                        <h3 className="text-5xl font-semibold text-gray-900 dark:text-white">
                            {stats?.streak.current_streak || 0}
                        </h3>
                        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Day Streak</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Keep up the great momentum! Each day counts.</p>
                    </div>
                    
                    <div className="w-full mt-8 pt-8 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                        <div className="text-left">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Longest Streak</p>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                <span className="font-bold text-gray-900 dark:text-white">{stats?.streak.longest_streak || 0} Days</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Next Milestone</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="font-bold text-gray-900 dark:text-white">Level Up!</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Badges Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements & Badges</h3>
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {stats?.earnedBadges.length || 0} / {stats?.availableBadgesCount || 5} Earned
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {stats?.earnedBadges.map((badge, idx) => (
                            <motion.div 
                                key={badge.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + idx * 0.05 }}
                                className="surface-motion bg-white dark:bg-gray-800 p-6 rounded-xl border border-indigo-50 dark:border-indigo-900/30 flex flex-col items-center text-center gap-3 hover:shadow-md"
                            >
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                    {getIcon(badge.icon_name, "w-8 h-8 text-indigo-600 dark:text-indigo-400")}
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{badge.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{badge.description}</p>
                                <div className="mt-2 text-[10px] text-indigo-500 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                                    Earned {badge.awarded_at ? new Date(badge.awarded_at).toLocaleDateString() : 'Today'}
                                </div>
                            </motion.div>
                        ))}
                        
                        {/* Placeholder for locked badges */}
                        {Array.from({ length: Math.max(0, (stats?.availableBadgesCount || 5) - (stats?.earnedBadges.length || 0)) }).map((_, i) => (
                            <div key={`locked-${i}`} className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-dashed border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-3 opacity-60">
                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                    <Award className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                </div>
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MotivationView;
