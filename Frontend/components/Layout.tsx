import React, { useState } from 'react';
import Sidebar from './Sidebar';
import type { User, View } from '../types';
import type { Theme } from '../hooks/useTheme';
import DashboardHeader from './DashboardHeader';

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
    <div className="app-shell flex min-h-screen flex-1 flex-col bg-gray-100 dark:bg-gray-900">
      <DashboardHeader
        currentUser={currentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        apiFetch={apiFetch}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentUser={currentUser}
          isCollapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}
          totalUnreadCount={totalUnreadCount}
          unreadAppointmentsCount={unreadAppointmentsCount}
          unreadNotificationsCount={unreadNotificationsCount}
        />
        <main className="flex min-w-0 flex-1 flex-col overflow-x-auto">
          <div key={currentView} className="view-transition flex min-w-0 flex-1 flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
