--
-- PostgreSQL database dump
--

\restrict eCKQTqHRg4BfO1fcmL6j0v6rqNwJexgxuiLUyE1ZRz6xZF8IszQPdZ467BGh4Ln

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-05-21 16:16:19

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 6 (class 2615 OID 16742)
-- Name: calmconnect; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA calmconnect;


ALTER SCHEMA calmconnect OWNER TO pg_database_owner;

--
-- TOC entry 5256 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA calmconnect; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA calmconnect IS 'schema for CalmConnect AI';


--
-- TOC entry 875 (class 1247 OID 16744)
-- Name: appointment_status; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.appointment_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled'
);


ALTER TYPE calmconnect.appointment_status OWNER TO postgres;

--
-- TOC entry 878 (class 1247 OID 16752)
-- Name: dm_status; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.dm_status AS ENUM (
    'sent',
    'delivered',
    'read'
);


ALTER TYPE calmconnect.dm_status OWNER TO postgres;

--
-- TOC entry 881 (class 1247 OID 16760)
-- Name: message_feedback; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.message_feedback AS ENUM (
    'like',
    'dislike'
);


ALTER TYPE calmconnect.message_feedback OWNER TO postgres;

--
-- TOC entry 884 (class 1247 OID 16766)
-- Name: message_sender; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.message_sender AS ENUM (
    'user',
    'ai'
);


ALTER TYPE calmconnect.message_sender OWNER TO postgres;

--
-- TOC entry 887 (class 1247 OID 16772)
-- Name: message_source; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.message_source AS ENUM (
    'text',
    'voice'
);


ALTER TYPE calmconnect.message_source OWNER TO postgres;

--
-- TOC entry 890 (class 1247 OID 16778)
-- Name: user_role; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.user_role AS ENUM (
    'patient',
    'psychiatrist',
    'admin'
);


ALTER TYPE calmconnect.user_role OWNER TO postgres;

--
-- TOC entry 893 (class 1247 OID 16786)
-- Name: user_status; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.user_status AS ENUM (
    'active',
    'blocked'
);


ALTER TYPE calmconnect.user_status OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16791)
-- Name: appointments; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    psychiatrist_id uuid NOT NULL,
    patient_id uuid NOT NULL,
    date date NOT NULL,
    "time" time without time zone NOT NULL,
    status calmconnect.appointment_status DEFAULT 'scheduled'::calmconnect.appointment_status NOT NULL,
    notes text,
    patient_has_seen boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_distinct_parties CHECK ((psychiatrist_id <> patient_id))
);


ALTER TABLE calmconnect.appointments OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 25073)
-- Name: badges; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.badges (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    icon_name character varying(50) NOT NULL,
    category character varying(50) NOT NULL
);


ALTER TABLE calmconnect.badges OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16809)
-- Name: chat_messages; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    sender calmconnect.message_sender NOT NULL,
    text text NOT NULL,
    source calmconnect.message_source DEFAULT 'text'::calmconnect.message_source NOT NULL,
    feedback calmconnect.message_feedback,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.chat_messages OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16823)
-- Name: chat_sessions; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.chat_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.chat_sessions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16834)
-- Name: completed_exercises; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.completed_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    exercise_id character varying(50) NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.completed_exercises OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16843)
-- Name: conversation_participants; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.conversation_participants (
    conversation_id uuid NOT NULL,
    user_id uuid NOT NULL
);


ALTER TABLE calmconnect.conversation_participants OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16848)
-- Name: conversations; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.conversations OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 25104)
-- Name: daily_quotes; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.daily_quotes (
    id integer NOT NULL,
    text text NOT NULL,
    author character varying(100),
    category character varying(50)
);


ALTER TABLE calmconnect.daily_quotes OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 25103)
-- Name: daily_quotes_id_seq; Type: SEQUENCE; Schema: calmconnect; Owner: postgres
--

CREATE SEQUENCE calmconnect.daily_quotes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE calmconnect.daily_quotes_id_seq OWNER TO postgres;

--
-- TOC entry 5257 (class 0 OID 0)
-- Dependencies: 239
-- Name: daily_quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: calmconnect; Owner: postgres
--

ALTER SEQUENCE calmconnect.daily_quotes_id_seq OWNED BY calmconnect.daily_quotes.id;


--
-- TOC entry 226 (class 1259 OID 16855)
-- Name: direct_messages; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.direct_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    text text NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    status calmconnect.dm_status DEFAULT 'sent'::calmconnect.dm_status NOT NULL
);


ALTER TABLE calmconnect.direct_messages OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 24992)
-- Name: feedback; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    appointment_id uuid,
    target_id uuid,
    type character varying(50) NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE calmconnect.feedback OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 25143)
-- Name: forum_comments; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.forum_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid,
    content text NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.forum_comments OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 25124)
-- Name: forum_posts; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.forum_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.forum_posts OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16869)
-- Name: journal_entries; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.journal_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.journal_entries OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16880)
-- Name: mood_entries; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.mood_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mood integer NOT NULL,
    notes text,
    date timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mood_entries_mood_check CHECK (((mood >= 1) AND (mood <= 5)))
);


ALTER TABLE calmconnect.mood_entries OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 24970)
-- Name: notifications; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    link character varying(255),
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.notifications OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 25039)
-- Name: psychiatrist_availability; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.psychiatrist_availability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    psychiatrist_id uuid,
    day character varying(15) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


ALTER TABLE calmconnect.psychiatrist_availability OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25018)
-- Name: reports; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    target_id uuid,
    type character varying(50) NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.reports OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16892)
-- Name: thought_records; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.thought_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    situation text NOT NULL,
    automatic_thought text NOT NULL,
    evidence_for text NOT NULL,
    evidence_against text NOT NULL,
    alternative_thought text NOT NULL,
    outcome text NOT NULL,
    date timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.thought_records OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16908)
-- Name: user_activity_logs; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.user_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    activity_type character varying(50) NOT NULL,
    ip_address character varying(50),
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE calmconnect.user_activity_logs OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 25085)
-- Name: user_badges; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.user_badges (
    user_id uuid NOT NULL,
    badge_id character varying(50) NOT NULL,
    awarded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.user_badges OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 25058)
-- Name: user_streaks; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.user_streaks (
    user_id uuid NOT NULL,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_activity_date date,
    total_points integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.user_streaks OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16917)
-- Name: users; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role calmconnect.user_role DEFAULT 'patient'::calmconnect.user_role NOT NULL,
    status calmconnect.user_status DEFAULT 'active'::calmconnect.user_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    password_reset_token text,
    password_reset_expires timestamp with time zone,
    is_verified boolean DEFAULT false NOT NULL,
    verification_token character varying(255),
    verification_token_expires timestamp with time zone,
    deletion_requested_at timestamp with time zone,
    deletion_request_reason text,
    age integer,
    emergency_contact text,
    mental_health_goals text,
    background_details text,
    qualifications text,
    specialization text,
    registration_number text,
    clinic_details text,
    experience text
);


ALTER TABLE calmconnect.users OWNER TO postgres;

--
-- TOC entry 5006 (class 2604 OID 25107)
-- Name: daily_quotes id; Type: DEFAULT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.daily_quotes ALTER COLUMN id SET DEFAULT nextval('calmconnect.daily_quotes_id_seq'::regclass);


--
-- TOC entry 5017 (class 2606 OID 16936)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 25084)
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 16938)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 16940)
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5023 (class 2606 OID 16942)
-- Name: completed_exercises completed_exercises_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.completed_exercises
    ADD CONSTRAINT completed_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 16944)
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- TOC entry 5029 (class 2606 OID 16946)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 25113)
-- Name: daily_quotes daily_quotes_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.daily_quotes
    ADD CONSTRAINT daily_quotes_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 16948)
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 25005)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 5077 (class 2606 OID 25156)
-- Name: forum_comments forum_comments_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_comments
    ADD CONSTRAINT forum_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 25137)
-- Name: forum_posts forum_posts_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_posts
    ADD CONSTRAINT forum_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5033 (class 2606 OID 16950)
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 16952)
-- Name: mood_entries mood_entries_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.mood_entries
    ADD CONSTRAINT mood_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5051 (class 2606 OID 24984)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5062 (class 2606 OID 25048)
-- Name: psychiatrist_availability psychiatrist_availability_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.psychiatrist_availability
    ADD CONSTRAINT psychiatrist_availability_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 25050)
-- Name: psychiatrist_availability psychiatrist_availability_psychiatrist_id_day_start_time_en_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.psychiatrist_availability
    ADD CONSTRAINT psychiatrist_availability_psychiatrist_id_day_start_time_en_key UNIQUE (psychiatrist_id, day, start_time, end_time);


--
-- TOC entry 5059 (class 2606 OID 25031)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 16954)
-- Name: thought_records thought_records_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.thought_records
    ADD CONSTRAINT thought_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 16956)
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 25092)
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_id);


--
-- TOC entry 5066 (class 2606 OID 25067)
-- Name: user_streaks user_streaks_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_streaks
    ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5043 (class 2606 OID 16958)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5045 (class 2606 OID 16960)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 16962)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5026 (class 1259 OID 16963)
-- Name: idx_conv_participants_convo; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_conv_participants_convo ON calmconnect.conversation_participants USING btree (conversation_id);


--
-- TOC entry 5027 (class 1259 OID 16964)
-- Name: idx_conv_participants_user; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_conv_participants_user ON calmconnect.conversation_participants USING btree (user_id);


--
-- TOC entry 5054 (class 1259 OID 25016)
-- Name: idx_feedback_type; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_feedback_type ON calmconnect.feedback USING btree (type);


--
-- TOC entry 5055 (class 1259 OID 25017)
-- Name: idx_feedback_user; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_feedback_user ON calmconnect.feedback USING btree (user_id);


--
-- TOC entry 5078 (class 1259 OID 25168)
-- Name: idx_forum_comments_post_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_forum_comments_post_id ON calmconnect.forum_comments USING btree (post_id);


--
-- TOC entry 5079 (class 1259 OID 25169)
-- Name: idx_forum_comments_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_forum_comments_user_id ON calmconnect.forum_comments USING btree (user_id);


--
-- TOC entry 5075 (class 1259 OID 25167)
-- Name: idx_forum_posts_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_forum_posts_user_id ON calmconnect.forum_posts USING btree (user_id);


--
-- TOC entry 5048 (class 1259 OID 24991)
-- Name: idx_notifications_unread; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_notifications_unread ON calmconnect.notifications USING btree (user_id) WHERE (is_read = false);


--
-- TOC entry 5049 (class 1259 OID 24990)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON calmconnect.notifications USING btree (user_id);


--
-- TOC entry 5060 (class 1259 OID 25056)
-- Name: idx_psychiatrist_availability_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_psychiatrist_availability_id ON calmconnect.psychiatrist_availability USING btree (psychiatrist_id);


--
-- TOC entry 5056 (class 1259 OID 25037)
-- Name: idx_reports_status; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_reports_status ON calmconnect.reports USING btree (status);


--
-- TOC entry 5057 (class 1259 OID 25038)
-- Name: idx_reports_type; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_reports_type ON calmconnect.reports USING btree (type);


--
-- TOC entry 5038 (class 1259 OID 16965)
-- Name: idx_user_activity_logs_timestamp; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_timestamp ON calmconnect.user_activity_logs USING btree ("timestamp");


--
-- TOC entry 5039 (class 1259 OID 16966)
-- Name: idx_user_activity_logs_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_user_id ON calmconnect.user_activity_logs USING btree (user_id);


--
-- TOC entry 5080 (class 2606 OID 16967)
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5081 (class 2606 OID 16972)
-- Name: appointments appointments_psychiatrist_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.appointments
    ADD CONSTRAINT appointments_psychiatrist_id_fkey FOREIGN KEY (psychiatrist_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5082 (class 2606 OID 16977)
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES calmconnect.chat_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 16982)
-- Name: chat_sessions chat_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_sessions
    ADD CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5084 (class 2606 OID 16987)
-- Name: completed_exercises completed_exercises_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.completed_exercises
    ADD CONSTRAINT completed_exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5085 (class 2606 OID 16992)
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES calmconnect.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5086 (class 2606 OID 16997)
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5087 (class 2606 OID 17002)
-- Name: direct_messages direct_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.direct_messages
    ADD CONSTRAINT direct_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES calmconnect.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5088 (class 2606 OID 17007)
-- Name: direct_messages direct_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.direct_messages
    ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 25011)
-- Name: feedback fk_feedback_appointment; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.feedback
    ADD CONSTRAINT fk_feedback_appointment FOREIGN KEY (appointment_id) REFERENCES calmconnect.appointments(id) ON DELETE SET NULL;


--
-- TOC entry 5095 (class 2606 OID 25006)
-- Name: feedback fk_feedback_user; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.feedback
    ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5096 (class 2606 OID 25032)
-- Name: reports fk_reports_user; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.reports
    ADD CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5102 (class 2606 OID 25157)
-- Name: forum_comments forum_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_comments
    ADD CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES calmconnect.forum_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5103 (class 2606 OID 25162)
-- Name: forum_comments forum_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_comments
    ADD CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5101 (class 2606 OID 25138)
-- Name: forum_posts forum_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_posts
    ADD CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5089 (class 2606 OID 17012)
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5090 (class 2606 OID 17017)
-- Name: mood_entries mood_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.mood_entries
    ADD CONSTRAINT mood_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5093 (class 2606 OID 24985)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 25051)
-- Name: psychiatrist_availability psychiatrist_availability_psychiatrist_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.psychiatrist_availability
    ADD CONSTRAINT psychiatrist_availability_psychiatrist_id_fkey FOREIGN KEY (psychiatrist_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5091 (class 2606 OID 17022)
-- Name: thought_records thought_records_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.thought_records
    ADD CONSTRAINT thought_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5092 (class 2606 OID 17027)
-- Name: user_activity_logs user_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_activity_logs
    ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5099 (class 2606 OID 25098)
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES calmconnect.badges(id) ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 25093)
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 25068)
-- Name: user_streaks user_streaks_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_streaks
    ADD CONSTRAINT user_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


-- Completed on 2026-05-21 16:16:19

--
-- PostgreSQL database dump complete
--

\unrestrict eCKQTqHRg4BfO1fcmL6j0v6rqNwJexgxuiLUyE1ZRz6xZF8IszQPdZ467BGh4Ln

