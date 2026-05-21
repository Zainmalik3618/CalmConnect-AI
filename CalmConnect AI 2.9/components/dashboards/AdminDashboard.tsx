
import React, { useState } from 'react';
import type { User, View, Conversation, Appointment, AppNotification } from '../../types';
import Layout from '../Layout';
import ProfileView from '../ProfileView';
import MessagingView from '../MessagingView';
import UserManagementView from '../admin/UserManagementView';
import ForumView from '../ForumView';
import type { Theme } from '../../hooks/useTheme';
import ActivityLogView from '../admin/ActivityLogView';
import AppointmentsView from '../appointments/AppointmentsView';
import NotificationsView from '../NotificationsView';
import FeedbackDashboard from '../admin/FeedbackDashboard';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  onUpdateUsers: (users: User[]) => void;
  theme: Theme;
  toggleTheme: () => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  totalUnreadCount: number;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  unreadNotificationsCount: number;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, users, onLogout, onUpdateUser, onUpdateUsers, theme, toggleTheme, conversations, setConversations, totalUnreadCount, appointments, setAppointments, notifications, setNotifications, unreadNotificationsCount, apiFetch }) => {
  const [currentView, setCurrentView] = useState<View>('admin-home');

  const renderView = () => {
    switch (currentView) {
      case 'profile':
        return <ProfileView currentUser={currentUser} users={users} onUpdateUser={onUpdateUser} apiFetch={apiFetch} />;
      case 'forum':
        return <ForumView currentUser={currentUser} apiFetch={apiFetch} />;
      case 'messaging':
        return <MessagingView currentUser={currentUser} users={users} conversations={conversations} setConversations={setConversations} apiFetch={apiFetch} />;
      case 'activity-logs':
        return <ActivityLogView apiFetch={apiFetch} />;
      case 'appointments':
        return <AppointmentsView currentUser={currentUser} users={users} appointments={appointments} setAppointments={setAppointments} conversations={conversations} apiFetch={apiFetch} />;
      case 'notifications':
        return (
          <NotificationsView
            notifications={notifications}
            onMarkAsRead={async (id) => {
              try {
                await apiFetch(`/notifications/${id}/read`, { method: 'POST' });
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
              } catch (error) {
                console.error('Failed to mark notification as read:', error);
              }
            }}
            onMarkAllAsRead={async () => {
              try {
                await apiFetch('/notifications/read-all', { method: 'POST' });
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
              } catch (error) {
                console.error('Failed to mark all notifications as read:', error);
              }
            }}
            onDelete={async (id) => {
              try {
                await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
                setNotifications(prev => prev.filter(n => n.id !== id));
              } catch (error) {
                console.error('Failed to delete notification:', error);
              }
            }}
            onNavigate={(link) => {
              const view = link.replace('/', '') as View;
              setCurrentView(view);
            }}
          />
        );
      case 'feedback-dashboard':
        return <FeedbackDashboard apiFetch={apiFetch} />;
      case 'admin-home':
      default:
        return <UserManagementView currentUser={currentUser} users={users} onUpdateUsers={onUpdateUsers} apiFetch={apiFetch} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans antialiased text-gray-800 dark:text-gray-200">
      <Layout
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        totalUnreadCount={totalUnreadCount}
        unreadAppointmentsCount={0}
        unreadNotificationsCount={unreadNotificationsCount}
        apiFetch={apiFetch}
      >
        {renderView()}
      </Layout>
    </div>
  );
};

export default AdminDashboard;