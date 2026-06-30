
import React from 'react';
import { Home, MessageSquare } from 'lucide-react';
import { ChatIcon, ChartBarIcon, BookOpenIcon, ChecklistIcon, UsersIcon, ChevronLeftIcon, CogIcon, CalendarIcon, ClockIcon, BellIcon, StarIcon } from './Icons';
import type { User, View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User;
  isCollapsed: boolean;
  onToggle: () => void;
  totalUnreadCount: number;
  unreadAppointmentsCount: number;
  unreadNotificationsCount: number;
}

const NavButton: React.FC<{
    item: { id: View; name: string; icon: React.ReactElement, notificationCount?: number };
    currentView: View;
    isCollapsed: boolean;
    onClick: () => void;
}> = ({ item, currentView, isCollapsed, onClick }) => (
    <button
        onClick={onClick}
        title={isCollapsed ? item.name : undefined}
        className={`group flex items-center p-3 rounded-lg transition-all duration-200 ease-out text-left w-full ${
        currentView === item.id
            ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:translate-x-0.5'
        } ${isCollapsed ? 'justify-center' : ''} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
    >
        {item.icon}
        <span className={`ml-3 overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
        {item.notificationCount != null && item.notificationCount > 0 && !isCollapsed && (
        <span className="ml-auto bg-blue-600 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            {item.notificationCount}
        </span>
        )}
    </button>
);


const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser, isCollapsed, onToggle, totalUnreadCount, unreadAppointmentsCount, unreadNotificationsCount }) => {
    const navItemConfig = [
        // Group 1: Core Tools
        { id: 'patient-home', name: 'Wellness Home', icon: <Home className="h-6 w-6 min-w-5 flex-shrink-0" />, roles: ['patient'] },
        { id: 'chat', name: 'AI Chat', icon: <ChatIcon />, roles: ['patient'] },
        { id: 'motivation', name: 'Motivation Center', icon: <StarIcon />, roles: ['patient'] },
        { id: 'mood', name: 'Mood Tracker', icon: <ChartBarIcon />, roles: ['patient'] },
        { id: 'journal', name: 'Journal', icon: <BookOpenIcon />, roles: ['patient'] },
        { id: 'cbt', name: 'CBT Exercises', icon: <ChecklistIcon />, roles: ['patient'] },
        { id: 'psychiatrist-home', name: 'Clinical Overview', icon: <ChartBarIcon />, roles: ['psychiatrist'] },
        { id: 'admin-home', name: 'Overview', icon: <ChartBarIcon />, roles: ['admin'] },
        { id: 'user-management', name: 'User Management', icon: <CogIcon />, roles: ['admin'] },
        { id: 'feedback-dashboard', name: 'Feedback & Reports', icon: <StarIcon />, roles: ['admin'] },
        { id: 'activity-logs', name: 'Activity Logs', icon: <ClockIcon />, roles: ['admin'] },
        
        // Divider
        { type: 'divider', roles: ['patient', 'psychiatrist', 'admin'] },

        // Group 2: Communication
        { id: 'notifications', name: 'Notifications', icon: <BellIcon />, notificationCount: unreadNotificationsCount, roles: ['patient', 'psychiatrist', 'admin'] },
        { id: 'appointments', name: 'Appointments', icon: <CalendarIcon />, notificationCount: unreadAppointmentsCount, roles: ['patient', 'psychiatrist', 'admin'] },
        { id: 'messaging', name: 'Direct Messages', icon: <UsersIcon />, notificationCount: totalUnreadCount, roles: ['patient', 'psychiatrist', 'admin'] },
        { id: 'forum', name: 'Community Forum', icon: <MessageSquare className="h-6 w-6 min-w-5 flex-shrink-0" />, roles: ['patient', 'psychiatrist', 'admin'] },
    ];

    const visibleNavItems = navItemConfig.filter(item => item.roles.includes(currentUser.role));
  
  return (
    <aside className={`role-app-sidebar relative z-20 flex flex-shrink-0 flex-col overflow-visible border-r border-gray-200 bg-white p-4 transition-all duration-300 ease-out dark:border-gray-700 dark:bg-gray-800 ${isCollapsed ? 'w-20' : 'w-64'}`}>
       <button 
        onClick={onToggle} 
        className="absolute right-0 top-5 z-40 flex h-8 w-8 translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all duration-200 ease-out hover:bg-gray-100 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeftIcon className={`transition-transform duration-300 ease-out ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>
      <nav className="flex-grow overflow-y-auto pr-1 flex flex-col">
          <div className="space-y-1">
            {visibleNavItems.map((item, index) => {
                if (item.type === 'divider') {
                    // Cleaner divider rendering logic
                    const prevItemExists = visibleNavItems[index - 1] && visibleNavItems[index - 1].type !== 'divider';
                    const nextItemExists = visibleNavItems[index + 1] && visibleNavItems[index + 1].type !== 'divider';
                    if (prevItemExists && nextItemExists) {
                        return <hr key={`divider-${index}`} className={`my-2 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out ${isCollapsed ? 'mx-auto w-8' : 'mx-2'}`} />;
                    }
                    return null;
                }
                return (
                    <NavButton
                        key={item.id}
                        item={item as any}
                        currentView={currentView}
                        isCollapsed={isCollapsed}
                        onClick={() => setCurrentView(item.id as View)}
                    />
                );
            })}
          </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
