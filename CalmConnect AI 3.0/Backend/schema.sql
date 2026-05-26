-- =========================================
-- CalmConnect AI Database Schema
-- PostgreSQL
-- =========================================

CREATE SCHEMA IF NOT EXISTS calmconnect;

-- =========================================
-- ENUM TYPES
-- =========================================

CREATE TYPE calmconnect.appointment_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled'
);

CREATE TYPE calmconnect.dm_status AS ENUM (
    'sent',
    'delivered',
    'read'
);

CREATE TYPE calmconnect.message_feedback AS ENUM (
    'like',
    'dislike'
);

CREATE TYPE calmconnect.message_sender AS ENUM (
    'user',
    'ai'
);

CREATE TYPE calmconnect.message_source AS ENUM (
    'text',
    'voice'
);

CREATE TYPE calmconnect.user_role AS ENUM (
    'patient',
    'psychiatrist',
    'admin'
);

CREATE TYPE calmconnect.user_status AS ENUM (
    'active',
    'blocked'
);

-- =========================================
-- USERS
-- =========================================

CREATE TABLE calmconnect.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role calmconnect.user_role NOT NULL DEFAULT 'patient',
    status calmconnect.user_status NOT NULL DEFAULT 'active',

    is_verified BOOLEAN NOT NULL DEFAULT false,

    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMPTZ,

    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,

    deletion_requested_at TIMESTAMPTZ,
    deletion_request_reason TEXT,

    age INTEGER,
    emergency_contact TEXT,
    mental_health_goals TEXT,
    background_details TEXT,

    qualifications TEXT,
    specialization TEXT,
    registration_number TEXT,
    clinic_details TEXT,
    experience TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- APPOINTMENTS
-- =========================================

CREATE TABLE calmconnect.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    psychiatrist_id UUID NOT NULL,
    patient_id UUID NOT NULL,

    date DATE NOT NULL,
    time TIME NOT NULL,

    status calmconnect.appointment_status NOT NULL DEFAULT 'scheduled',

    notes TEXT,
    patient_has_seen BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_distinct_parties
        CHECK (psychiatrist_id <> patient_id)
);

-- =========================================
-- CHAT SYSTEM
-- =========================================

CREATE TABLE calmconnect.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE calmconnect.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id UUID NOT NULL,

    sender calmconnect.message_sender NOT NULL,
    source calmconnect.message_source NOT NULL DEFAULT 'text',

    text TEXT NOT NULL,
    feedback calmconnect.message_feedback,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- JOURNAL & MOOD TRACKING
-- =========================================

CREATE TABLE calmconnect.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    content TEXT NOT NULL,

    date TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE calmconnect.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    mood INTEGER NOT NULL
        CHECK (mood >= 1 AND mood <= 5),

    notes TEXT,

    date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- CBT THOUGHT RECORDS
-- =========================================

CREATE TABLE calmconnect.thought_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    situation TEXT NOT NULL,
    automatic_thought TEXT NOT NULL,
    evidence_for TEXT NOT NULL,
    evidence_against TEXT NOT NULL,
    alternative_thought TEXT NOT NULL,
    outcome TEXT NOT NULL,

    date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- DIRECT MESSAGING
-- =========================================

CREATE TABLE calmconnect.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE calmconnect.conversation_participants (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL
);

CREATE TABLE calmconnect.direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,

    text TEXT NOT NULL,

    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

    status calmconnect.dm_status NOT NULL DEFAULT 'sent'
);

-- =========================================
-- NOTIFICATIONS
-- =========================================

CREATE TABLE calmconnect.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    link VARCHAR(255),

    is_read BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- FEEDBACK & REPORTS
-- =========================================

CREATE TABLE calmconnect.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    appointment_id UUID,
    target_id UUID,

    type VARCHAR(50) NOT NULL,

    rating INTEGER NOT NULL
        CHECK (rating >= 1 AND rating <= 5),

    comment TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calmconnect.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,
    target_id UUID,

    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,

    status VARCHAR(20) DEFAULT 'pending',

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- USER ACTIVITY
-- =========================================

CREATE TABLE calmconnect.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    activity_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(50),

    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- PSYCHIATRIST AVAILABILITY
-- =========================================

CREATE TABLE calmconnect.psychiatrist_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    psychiatrist_id UUID,

    day VARCHAR(15) NOT NULL,

    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- =========================================
-- BADGES & STREAKS
-- =========================================

CREATE TABLE calmconnect.badges (
    id VARCHAR(50) PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,

    icon_name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE calmconnect.user_badges (
    user_id UUID NOT NULL,
    badge_id VARCHAR(50) NOT NULL,

    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calmconnect.user_streaks (
    user_id UUID PRIMARY KEY,

    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    last_activity_date DATE,

    total_points INTEGER DEFAULT 0,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- CBT EXERCISES
-- =========================================

CREATE TABLE calmconnect.completed_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    exercise_id VARCHAR(50) NOT NULL,

    date TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================
-- DAILY QUOTES
-- =========================================

CREATE TABLE calmconnect.daily_quotes (
    id SERIAL PRIMARY KEY,

    text TEXT NOT NULL,
    author VARCHAR(100),
    category VARCHAR(50)
);

-- =========================================
-- FORUM SYSTEM
-- =========================================

CREATE TABLE calmconnect.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID,

    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,

    is_anonymous BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calmconnect.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL,
    user_id UUID,

    content TEXT NOT NULL,

    is_anonymous BOOLEAN NOT NULL DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- REFRESH TOKENS
-- =========================================

CREATE TABLE calmconnect.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token TEXT NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);