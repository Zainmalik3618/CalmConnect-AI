
import React from 'react';
import { AppNotification } from '../types';
import { BellIcon, TrashIcon, CheckCircleIcon, ClockIcon, ChatIcon, CalendarIcon } from './Icons';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationsViewProps {
    notifications: AppNotification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onDelete: (id: string) => void;
    onNavigate: (link: string) => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onNavigate
}) => {
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'dm':
                return <ChatIcon />;
            case 'appointment_new':
                return <CalendarIcon />;
            case 'appointment_reminder':
                return <ClockIcon />;
            default:
                return <BellIcon />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'dm':
                return 'Message';
            case 'appointment_new':
                return 'Appointment';
            case 'appointment_reminder':
                return 'Reminder';
            default:
                return 'Notification';
        }
    };

    return (
        <div className="p-6 md:p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <BellIcon className="h-8 w-8 text-blue-500" />
                        Notifications
                    </h1>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                        Stay updated with your latest activity.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        <CheckCircleIcon className="h-5 w-5" />
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                    <BellIcon className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl">
                    <AnimatePresence initial={false}>
                        {notifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={`relative group p-4 rounded-xl border transition-all ${
                                    notification.is_read
                                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm'
                                }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        notification.is_read
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                            : 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {getTypeLabel(notification.type)}
                                            </span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className={`text-base font-semibold mb-1 ${
                                            notification.is_read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-900 dark:text-white'
                                        }`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            {notification.link && (
                                                <button
                                                    onClick={() => {
                                                        if (!notification.is_read) onMarkAsRead(notification.id);
                                                        onNavigate(notification.link!);
                                                    }}
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    View Details
                                                </button>
                                            )}
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => onMarkAsRead(notification.id)}
                                                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDelete(notification.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                                        title="Delete notification"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {!notification.is_read && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default NotificationsView;
