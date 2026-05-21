
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  source?: 'text' | 'voice';
  feedback?: 'like' | 'dislike';
  isNew?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string; // ISO string
  // FIX: Added optional updated_at property to match backend data and resolve type errors.
  updated_at?: string; // ISO string
}

export interface MoodEntry {
  id:string;
  mood: number; // e.g., 1 to 5
  date: string; // ISO string
  notes?: string;
}

export interface JournalEntry {
  id: string;
  content: string;
  date: string; // ISO string
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  awarded_at?: string;
}

export interface ThoughtRecord {
  id: string;
  date: string; // ISO string
  situation: string;
  automaticThought: string;
  evidenceFor: string;
  evidenceAgainst: string;
  alternativeThought: string;
  outcome: string;
}

export interface AvailabilitySlot {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export interface User {
  id:string;
  username: string;
  email: string;
  // In a real app, this would be a securely hashed password, not plaintext.
  password: string; 
  role: 'patient' | 'psychiatrist' | 'admin';
  status?: 'active' | 'blocked';
  deletion_requested_at?: string | null;
  deletion_request_reason?: string | null;
  
  // Patient specific
  age?: number;
  emergency_contact?: string;
  mental_health_goals?: string;
  background_details?: string;

  // Psychiatrist specific
  qualifications?: string;
  specialization?: string;
  registration_number?: string;
  clinic_details?: string;
  experience?: string;
  availability?: AvailabilitySlot[];
  
  // Motivation stats
  total_points?: number;
  earnedBadges?: Badge[];
}

export type View = 'chat' | 'mood' | 'journal' | 'cbt' | 'profile' | 'messaging' | 'admin-home' | 'appointments' | 'activity-logs' | 'notifications' | 'feedback-dashboard' | 'motivation' | 'forum';

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO string
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
    id: string;
    participantIds: [string, string];
    messages: DirectMessage[];
}

export interface ExerciseStep {
  title: string;
  instruction: string;
  duration: number; // in seconds
}

export interface GuidedExercise {
  id: string;
  title: string;
  description: string;
  category: 'Breathing' | 'Mindfulness' | 'Meditation';
  steps: ExerciseStep[];
}

export interface CompletedExerciseLog {
    exerciseId: string;
    date: string; // ISO string
}

export interface Appointment {
  id: string;
  psychiatristId: string;
  patientId: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM" (24-hour)
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  patientHasSeen: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  activityType: 'login' | 'logout';
  ipAddress: string;
  timestamp: string; // ISO String
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'dm' | 'appointment_new' | 'appointment_reminder';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string; // ISO String
}