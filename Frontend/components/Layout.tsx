import React, { useState } from 'react';
import Sidebar from './Sidebar';
import type { User, View } from '../types';
import type { Theme } from '../hooks/useTheme';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  currentUser: User;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
  totalUnreadCount: number;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  unreadAppointmentsCount?: number;
  unreadNotificationsCount?: number;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, currentUser, onLogout, theme, toggleTheme, totalUnreadCount, apiFetch, unreadAppointmentsCount = 0, unreadNotificationsCount = 0 }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  return (
    <div className="app-shell flex flex-1 bg-gray-100 dark:bg-gray-900">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        totalUnreadCount={totalUnreadCount}
        unreadAppointmentsCount={unreadAppointmentsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        apiFetch={apiFetch}
      />
      <main className="flex-1 flex flex-col overflow-x-auto">
        <div key={currentView} className="view-transition flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
