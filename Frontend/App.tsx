
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import AuthView from './components/AuthView';
import OnboardingView from './components/OnboardingView';
import PatientDashboard from './components/dashboards/PatientDashboard';
import PsychiatristDashboard from './components/dashboards/PsychiatristDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import { SpinnerIcon } from './components/Icons';
import useTheme from './hooks/useTheme';
// FIX: Added imports for all data types that will be fetched from the backend.
import type { User, Conversation, Appointment, ChatSession, MoodEntry, JournalEntry, ThoughtRecord, CompletedExerciseLog, AppNotification } from './types';
import ResetPasswordView from './components/ResetPasswordView';
// FIX: Added import for the new VerificationView component.
import VerificationView from './components/VerificationView';
import { API_URL } from './config/api';


const App: React.FC = () => {
  const [theme, toggleTheme, isThemeLoading] = useTheme();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // FIX: Added state for data previously stored in localStorage.
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([]);
  const [completedLogs, setCompletedLogs] = useState<CompletedExerciseLog[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  // Simple routing based on path
  if (window.location.pathname === '/reset-password') {
    return <ResetPasswordView theme={theme} toggleTheme={toggleTheme} />;
  }
  // FIX: Added routing for the email verification page.
  if (window.location.pathname === '/verify-email') {
    return <VerificationView theme={theme} toggleTheme={toggleTheme} />;
  }

  const isRefreshingRef = useRef<Promise<string | null> | null>(null);

  const handleLogout = useCallback(async () => {
    try {
        const currentRefreshToken = localStorage.getItem('refreshToken');
        const currentToken = localStorage.getItem('token');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }
        await fetch(`${API_URL}/auth/logout`, { 
            method: 'POST', 
            headers,
            body: JSON.stringify({ refreshToken: currentRefreshToken })
        });
    } catch (error) {
        console.error("Failed to log logout event on server:", error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setCurrentUser(null);
        setUsers([]);
        setConversations([]);
        setAppointments([]);
        setChatSessions([]);
        setMoodHistory([]);
        setJournalEntries([]);
        setThoughtRecords([]);
        setCompletedLogs([]);
        setNotifications([]);
    }
  }, []);

  const refreshAuthToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current) {
      return isRefreshingRef.current;
    }

    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
      return null;
    }

    const refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          setToken(data.token);
          return data.token;
        }
        return null;
      } catch (err) {
        console.error('Error refreshing token:', err);
        return null;
      } finally {
        isRefreshingRef.current = null;
      }
    })();

    isRefreshingRef.current = refreshPromise;
    return refreshPromise;
  }, []);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    // FIX: Correctly handle `options.headers`. The `Headers` constructor gracefully
    // handles all `HeadersInit` types (object, array, Headers object), preventing
    // the type error from spreading a non-object.
    const headers = new Headers(options.headers);

    // Set a default Content-Type if one isn't already specified in the options.
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      headers.set('Authorization', `Bearer ${currentToken}`);
    }

    let response = await fetch(`${API_URL}${url}`, { ...options, headers });

    if (response.status === 401) {
      if (url === '/auth/login' || url === '/auth/refresh') {
        throw new Error('Unauthorized');
      }

      const refreshedToken = await refreshAuthToken();
      if (refreshedToken) {
        headers.set('Authorization', `Bearer ${refreshedToken}`);
        response = await fetch(`${API_URL}${url}`, { ...options, headers });
      } else {
        handleLogout();
        throw new Error('Unauthorized');
      }
    }
    
    if (response.status === 401) {
      handleLogout();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) { // Handle No Content response
        return null;
    }

    return response.json();
  }, [token, refreshAuthToken, handleLogout]);

  // Effect to verify token and fetch initial data on app load
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const userData = await apiFetch('/users/me');
          setCurrentUser(userData);
          // FIX: Fetch all other necessary data after user is verified, including data previously from localStorage.
        const [
            allUsersData, convosData, apptsData, 
            chatSessionsData, moodData, journalData, thoughtData, exerciseData
          ] = await Promise.all([
            apiFetch('/users'),
            apiFetch('/conversations'),
            apiFetch('/appointments'),
            userData.role === 'patient' ? apiFetch('/chat/sessions') : Promise.resolve([]),
            userData.role === 'patient' ? apiFetch('/mood') : Promise.resolve([]),
            userData.role === 'patient' ? apiFetch('/journal') : Promise.resolve([]),
            userData.role === 'patient' ? apiFetch('/cbt/thoughts') : Promise.resolve([]),
            userData.role === 'patient' ? apiFetch('/cbt/exercises') : Promise.resolve([]),
          ]);
          
          // Check for reminders before fetching notifications to ensure they are included
          try {
            await apiFetch('/notifications/check-reminders', { method: 'POST' });
          } catch (err) {
            console.error("Reminder check failed:", err);
          }
          
          const notificationsData = await apiFetch('/notifications');
          
          setUsers(allUsersData);
          setConversations(convosData);
          setNotifications(notificationsData);
          
          // Map backend snake_case to frontend camelCase for appointments
          const formattedAppointments = apptsData.map((a: any) => {
              // Create a date object from the ISO string from the server.
              // This correctly interprets the timezone information.
              const appointmentDate = new Date(a.date);
              
              // Format the date into YYYY-MM-DD based on the browser's local timezone,
              // which correctly reflects the intended date regardless of where the server is.
              const year = appointmentDate.getFullYear();
              const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
              const day = String(appointmentDate.getDate()).padStart(2, '0');
              const datePart = `${year}-${month}-${day}`;

              // The 'time' column might include seconds, we only want HH:MM.
              const timePart = a.time.substring(0, 5);
              
              return {
                id: a.id,
                psychiatristId: a.psychiatrist_id,
                patientId: a.patient_id,
                date: datePart,
                time: timePart,
                status: a.status,
                notes: a.notes,
                patientHasSeen: a.patient_has_seen,
              };
          });
          setAppointments(formattedAppointments);
          
          if (userData.role === 'patient') {
            setChatSessions(chatSessionsData);
            setMoodHistory(moodData);
            setJournalEntries(journalData);
            
            // Map backend snake_case to frontend camelCase
            setThoughtRecords(thoughtData.map((r: any) => ({
                id: r.id, date: r.date, situation: r.situation,
                automaticThought: r.automatic_thought,
                evidenceFor: r.evidence_for,
                evidenceAgainst: r.evidence_against,
                alternativeThought: r.alternative_thought,
                outcome: r.outcome,
            })));
            setCompletedLogs(exerciseData.map((l: any) => ({
                exerciseId: l.exercise_id,
                date: l.date,
            })));
          }

        } catch (error) {
          console.error("Session verification failed:", error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    verifyUser();
  }, [token, apiFetch]);

  const totalUnreadCount = useMemo(() => {
      if (!currentUser || !conversations) return 0;
      return conversations.reduce((count, convo) => {
          if ((convo.participantIds as unknown as string[]).includes(currentUser.id)) {
              const unreadInConvo = convo.messages.filter(
                  msg => msg.senderId !== currentUser.id && msg.status !== 'read'
              ).length;
              return count + unreadInConvo;
          }
          return count;
      }, 0);
  }, [currentUser, conversations]);
  
  const unreadAppointmentsCount = useMemo(() => {
    if (currentUser?.role !== 'patient' || !appointments) return 0;
    // This is now a pure calculation. The side effect to mark appointments as seen
    // has been moved to the AppointmentsView component, which is the correct place
    // as "seen" means the user has actually navigated to that view.
    return appointments.filter(a => a.patientId === currentUser.id && !a.patientHasSeen).length;
  }, [currentUser, appointments]);

  const unreadNotificationsCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter(n => !n.is_read).length;
  }, [notifications]);

  const handleAuthSuccess = (data: { token: string; refreshToken?: string; user: User }, isNewUser: boolean) => {
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setToken(data.token);
    setCurrentUser(data.user);

    if (isNewUser) {
        const hasCompletedOnboarding = window.localStorage.getItem(`onboardingCompleted_${data.user.id}`);
        if (!hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    }
    setIsLoading(false);
  };

  const handleOnboardingComplete = () => {
      if (currentUser) {
          window.localStorage.setItem(`onboardingCompleted_${currentUser.id}`, 'true');
      }
      setShowOnboarding(false);
  }
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
      setUsers(updatedUsers);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }

  const renderDashboard = () => {
    if (!currentUser) return null;

    const dashboardProps = {
      currentUser,
      users,
      onLogout: handleLogout,
      onUpdateUser: handleUpdateUser,
      theme,
      toggleTheme,
      conversations,
      setConversations,
      totalUnreadCount,
      appointments,
      setAppointments,
      unreadAppointmentsCount,
      // FIX: Pass new state and setters to dashboards
      chatSessions,
      setChatSessions,
      moodHistory,
      setMoodHistory,
      journalEntries,
      // FIX: Renamed `setJournalEntries` prop to `setEntries` to match PatientDashboardProps.
      setEntries: setJournalEntries,
      thoughtRecords,
      setThoughtRecords,
      completedLogs,
      setCompletedLogs,
      notifications,
      setNotifications,
      unreadNotificationsCount,
      apiFetch
    };

    switch (currentUser.role) {
      case 'patient':
        return <PatientDashboard {...dashboardProps} />;
      case 'psychiatrist':
        return <PsychiatristDashboard {...dashboardProps} />;
      case 'admin':
        return <AdminDashboard {...dashboardProps} onUpdateUsers={handleUpdateUsers} />;
      default:
        return <AuthView onAuthSuccess={handleAuthSuccess} theme={theme} toggleTheme={toggleTheme} />;
    }
  };

  if (isLoading || isThemeLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <SpinnerIcon className="h-12 w-12 text-blue-500" />
      </div>
    );
  }

  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (showOnboarding) {
      return <OnboardingView user={currentUser} onComplete={handleOnboardingComplete} />;
  }

  return renderDashboard();
};

export default App;
