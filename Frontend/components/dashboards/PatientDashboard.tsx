


import React, { useState } from 'react';
// FIX: Added imports for all data types that will be passed as props.
import type { User, View, Conversation, Appointment, ChatSession, MoodEntry, JournalEntry, ThoughtRecord, CompletedExerciseLog, AppNotification } from '../../types';
import Layout from '../Layout';
import ChatView from '../ChatView';
import MoodTrackerView from '../MoodTrackerView';
import JournalView from '../JournalView';
import CbtView from '../CbtView';
import ProfileView from '../ProfileView';
import MessagingView from '../MessagingView';
import AppointmentsView from '../appointments/AppointmentsView';
import NotificationsView from '../NotificationsView';
import MotivationView from '../MotivationView';
import ForumView from '../ForumView';
import type { Theme } from '../../hooks/useTheme';

interface PatientDashboardProps {
  currentUser: User;
  users: User[];
  onLogout: () => void;
  onUpdateUser: (updatedUser: User) => void;
  theme: Theme;
  toggleTheme: () => void;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  totalUnreadCount: number;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  unreadAppointmentsCount: number;
  // FIX: Added props for data previously managed in localStorage.
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  moodHistory: MoodEntry[];
  setMoodHistory: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
  journalEntries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  thoughtRecords: ThoughtRecord[];
  setThoughtRecords: React.Dispatch<React.SetStateAction<ThoughtRecord[]>>;
  completedLogs: CompletedExerciseLog[];
  setCompletedLogs: React.Dispatch<React.SetStateAction<CompletedExerciseLog[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  unreadNotificationsCount: number;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ 
    currentUser, 
    users, 
    onLogout, 
    onUpdateUser, 
    theme, 
    toggleTheme, 
    conversations, 
    setConversations, 
    totalUnreadCount,
    appointments,
    setAppointments,
    unreadAppointmentsCount,
    // FIX: Destructure new props.
    chatSessions,
    setChatSessions,
    moodHistory,
    setMoodHistory,
    journalEntries,
    // FIX: Destructured `setEntries` prop instead of `setJournalEntries` to match the props interface.
    setEntries,
    thoughtRecords,
    setThoughtRecords,
    completedLogs,
    setCompletedLogs,
    notifications,
    setNotifications,
    unreadNotificationsCount,
    apiFetch
}) => {
  const [currentView, setCurrentView] = useState<View>('chat');

  const renderView = () => {
    switch (currentView) {
      case 'mood':
        // FIX: Pass props to MoodTrackerView.
        return <MoodTrackerView currentUser={currentUser} moodHistory={moodHistory} setMoodHistory={setMoodHistory} apiFetch={apiFetch} isLoading={false} />;
      case 'journal':
        // FIX: Pass props to JournalView.
        // FIX: Passed the correctly named `setEntries` prop to JournalView.
        return <JournalView currentUser={currentUser} entries={journalEntries} setEntries={setEntries} apiFetch={apiFetch} isLoading={false} />;
      case 'cbt':
        // FIX: Pass props to CbtView and its children.
        return <CbtView 
                  currentUser={currentUser} 
                  thoughtRecords={thoughtRecords} 
                  setThoughtRecords={setThoughtRecords}
                  completedLogs={completedLogs}
                  setCompletedLogs={setCompletedLogs}
                  apiFetch={apiFetch}
                />;
      case 'messaging':
        return <MessagingView currentUser={currentUser} users={users} conversations={conversations} setConversations={setConversations} apiFetch={apiFetch} />;
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
              // Extract view from link (e.g., "/appointments" -> "appointments")
              const view = link.replace('/', '') as View;
              setCurrentView(view);
            }}
          />
        );
      case 'profile':
        return <ProfileView currentUser={currentUser} users={users} onUpdateUser={onUpdateUser} apiFetch={apiFetch} />;
      case 'motivation':
        return <MotivationView apiFetch={apiFetch} />;
      case 'forum':
        return <ForumView currentUser={currentUser} apiFetch={apiFetch} />;
      case 'chat':
      default:
        // FIX: Pass props to ChatView.
        return <ChatView key={currentUser.id} currentUser={currentUser} chatSessions={chatSessions} setChatSessions={setChatSessions} apiFetch={apiFetch} />;
    }
  };

  return (
    <div className="role-theme role-patient-theme flex flex-col min-h-screen font-sans antialiased text-gray-800 dark:text-gray-200">
      <Layout
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={onLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        totalUnreadCount={totalUnreadCount}
        unreadAppointmentsCount={unreadAppointmentsCount}
        unreadNotificationsCount={unreadNotificationsCount}
        apiFetch={apiFetch}
      >
        {renderView()}
      </Layout>
    </div>
  );
};

export default PatientDashboard;
