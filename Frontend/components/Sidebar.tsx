
import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatIcon, ChartBarIcon, BookOpenIcon, LogoIcon, ChecklistIcon, LogoutIcon, UserIcon, UsersIcon, ChevronLeftIcon, CogIcon, CalendarIcon, ClockIcon, BellIcon, AlertCircleIcon, StarIcon } from './Icons';
import type { User, View } from '../types';
import type { Theme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import ConfirmationDialog from './ConfirmationDialog';
import ReportIssueModal from './ReportIssueModal';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
  totalUnreadCount: number;
  unreadAppointmentsCount: number;
  unreadNotificationsCount: number;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
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


const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, currentUser, onLogout, theme, toggleTheme, isCollapsed, onToggle, totalUnreadCount, unreadAppointmentsCount, unreadNotificationsCount, apiFetch }) => {
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const navItemConfig = [
        // Group 1: Core Tools
        { id: 'chat', name: 'AI Chat', icon: <ChatIcon />, roles: ['patient'] },
        { id: 'motivation', name: 'Motivation Center', icon: <StarIcon />, roles: ['patient'] },
        { id: 'mood', name: 'Mood Tracker', icon: <ChartBarIcon />, roles: ['patient'] },
        { id: 'journal', name: 'Journal', icon: <BookOpenIcon />, roles: ['patient'] },
        { id: 'cbt', name: 'CBT Exercises', icon: <ChecklistIcon />, roles: ['patient'] },
        { id: 'admin-home', name: 'User Management', icon: <CogIcon />, roles: ['admin'] },
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
    <aside className={`relative bg-white dark:bg-gray-800 p-4 flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
       <button 
        onClick={onToggle} 
        className="absolute -right-3 top-9 z-10 p-1 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ease-out"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeftIcon className={`transition-transform duration-300 ease-out ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      <div className={`flex items-center mb-8 transition-all duration-300 ease-out ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
        <LogoIcon />
        <h1 className={`text-xl font-semibold ml-2 text-gray-800 dark:text-white overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>CalmConnect AI</h1>
      </div>
      
      <nav className="flex-grow flex flex-col">
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
      
      <div className="mt-auto flex flex-col space-y-1 border-t border-gray-200 dark:border-gray-700 pt-4">
        <button
          onClick={() => setCurrentView('profile')}
          title={isCollapsed ? currentUser.username : undefined}
          className={`flex w-full items-center p-3 rounded-lg transition-all duration-200 ease-out text-left ${
            currentView === 'profile'
              ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:translate-x-0.5'
          } ${isCollapsed ? 'justify-center' : ''} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              currentView === 'profile' 
              ? 'bg-blue-400 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'
            }`}>
                <UserIcon/>
            </div>
            <span className={`ml-3 text-sm font-medium truncate overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{currentUser.username}</span>
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} isCollapsed={isCollapsed} />
        <button
          onClick={() => setIsReportModalOpen(true)}
          title={isCollapsed ? "Report Issue" : undefined}
          className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-out text-left text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:translate-x-0.5 ${isCollapsed ? 'justify-center' : ''} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
        >
          <AlertCircleIcon />
          <span className={`ml-3 overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Report Issue</span>
        </button>
        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          title={isCollapsed ? "Logout" : undefined}
          className={`flex items-center p-3 rounded-lg transition-all duration-200 ease-out text-left text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:translate-x-0.5 ${isCollapsed ? 'justify-center' : ''} focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
        >
          <LogoutIcon />
          <span className={`ml-3 overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Logout</span>
        </button>
        <div className={`text-center text-xs text-gray-400 dark:text-gray-500 pt-2 overflow-hidden transition-all duration-300 ease-out whitespace-nowrap ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
          <p>&copy; 2026 CalmConnect AI</p>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={onLogout}
        title="Confirm Logout"
        confirmText="Log Out"
      >
        Are you sure you want to log out of your account?
      </ConfirmationDialog>

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        apiFetch={apiFetch}
      />
    </aside>
  );
};

export default Sidebar;
