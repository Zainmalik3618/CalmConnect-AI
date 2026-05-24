--
-- PostgreSQL database dump
--

\restrict hH1Atpa8KjrGS8h6wLiKz40rFT2sXHPEsVKzvxLOPYb7JAUr9BUg2LPgkXEeOyQ

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-05-24 17:52:08

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
-- TOC entry 5292 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA calmconnect; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA calmconnect IS 'schema for CalmConnect AI';


--
-- TOC entry 876 (class 1247 OID 16744)
-- Name: appointment_status; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.appointment_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled'
);


ALTER TYPE calmconnect.appointment_status OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 16752)
-- Name: dm_status; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.dm_status AS ENUM (
    'sent',
    'delivered',
    'read'
);


ALTER TYPE calmconnect.dm_status OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 16760)
-- Name: message_feedback; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.message_feedback AS ENUM (
    'like',
    'dislike'
);


ALTER TYPE calmconnect.message_feedback OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 16766)
-- Name: message_sender; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.message_sender AS ENUM (
    'user',
    'ai'
);


ALTER TYPE calmconnect.message_sender OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 16772)
-- Name: message_source; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.message_source AS ENUM (
    'text',
    'voice'
);


ALTER TYPE calmconnect.message_source OWNER TO postgres;

--
-- TOC entry 891 (class 1247 OID 16778)
-- Name: user_role; Type: TYPE; Schema: calmconnect; Owner: postgres
--

CREATE TYPE calmconnect.user_role AS ENUM (
    'patient',
    'psychiatrist',
    'admin'
);


ALTER TYPE calmconnect.user_role OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 16786)
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
-- TOC entry 5293 (class 0 OID 0)
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
-- TOC entry 243 (class 1259 OID 25170)
-- Name: refresh_tokens; Type: TABLE; Schema: calmconnect; Owner: postgres
--

CREATE TABLE calmconnect.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE calmconnect.refresh_tokens OWNER TO postgres;

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
-- TOC entry 5010 (class 2604 OID 25107)
-- Name: daily_quotes id; Type: DEFAULT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.daily_quotes ALTER COLUMN id SET DEFAULT nextval('calmconnect.daily_quotes_id_seq'::regclass);


--
-- TOC entry 5263 (class 0 OID 16791)
-- Dependencies: 220
-- Data for Name: appointments; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.appointments (id, psychiatrist_id, patient_id, date, "time", status, notes, patient_has_seen, created_at) FROM stdin;
c4edcb3f-8344-4dba-8276-76dd726afa15	ef485b80-f210-4d7b-a21f-bd38f255232d	6da10535-0291-4dbe-a6c5-9c91f0fff249	2026-03-03	16:30:00	completed	You have an appointment with me at 4:30PM be punctional.	t	2026-03-02 08:02:37.143897-08
7199a6ec-8ad6-46ac-af86-dd8a63b60643	ef485b80-f210-4d7b-a21f-bd38f255232d	6da10535-0291-4dbe-a6c5-9c91f0fff249	2026-03-04	14:15:00	cancelled	You have a new appointment at 2:15PM with me tomorrow.	t	2026-03-03 06:43:31.841631-08
1f1706bc-907c-40fd-9c86-b152d62d0a66	ef485b80-f210-4d7b-a21f-bd38f255232d	091c1f2d-6f24-45de-8d3e-db8023a82ec1	2026-03-24	18:10:00	cancelled	123	t	2026-03-24 06:08:50.9493-07
75abc3b6-214e-4e06-b2c0-c9e168f4ff6c	ef485b80-f210-4d7b-a21f-bd38f255232d	091c1f2d-6f24-45de-8d3e-db8023a82ec1	2026-03-24	18:16:00	completed	123456	t	2026-03-24 06:14:33.18548-07
3b12cebe-ba21-4474-a882-3838cb18acc1	ef485b80-f210-4d7b-a21f-bd38f255232d	6da10535-0291-4dbe-a6c5-9c91f0fff249	2026-03-25	15:00:00	completed	You have an appointment with me.	t	2026-03-24 05:58:04.756641-07
110553c4-1a08-410e-957a-d1d6b3c58c32	ef485b80-f210-4d7b-a21f-bd38f255232d	091c1f2d-6f24-45de-8d3e-db8023a82ec1	2026-05-25	10:00:00	cancelled	Testing appointments.....	t	2026-05-24 03:58:10.320405-07
\.


--
-- TOC entry 5280 (class 0 OID 25073)
-- Dependencies: 237
-- Data for Name: badges; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.badges (id, name, description, icon_name, category) FROM stdin;
first_journal	First Reflection	Wrote your first journal entry	book	journaling
streak_3	Consistency Starter	Maintained a 3-day activity streak	flame	streak
streak_7	Week of Wellness	Maintained a 7-day activity streak	zap	streak
cbt_master	Mindful Navigator	Completed CBT exercises for 7 consecutive days	brain	cbt
mood_tracker	Emotional Aware	Logged mood for 3 consecutive days	smile	mood
\.


--
-- TOC entry 5264 (class 0 OID 16809)
-- Dependencies: 221
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.chat_messages (id, session_id, sender, text, source, feedback, created_at) FROM stdin;
64cdbec0-6c03-49f9-beef-ff9c0fdf3bb7	77272f7d-1ce0-451f-8e4d-72b81a16234c	user	I've been feeling very high energy for a few days without sleeping, then crashing into deep sadness. Do I have Bipolar Disorder? Please diagnose me.	text	\N	2026-05-12 05:10:48.309661-07
d7674fe2-439d-4f2a-83ee-6fbc56b8a588	7e8715f1-78ff-4843-abc4-4c7bfd1079d1	user	I am having a normal day today?	text	\N	2026-03-02 07:57:37.867338-08
134c21c4-fb29-41d3-9960-e72dc514f6ea	7e8715f1-78ff-4843-abc4-4c7bfd1079d1	ai	It is good to hear that you are having a stable day. I noticed you recently logged your mood as "Neutral," and honestly, those middle-ground days can be very valuable. They often provide a much-needed sense of balance and a break from the highs or lows of life.\n\nIn psychology, we often view these "normal" days as a great time for grounding. When things aren't overwhelming, it’s easier to check in with yourself. How does this "normal" feel to you—is it a sense of calm, or perhaps just a steady routine? \n\nEven on balanced days, taking a moment for a quick mindfulness exercise—like noticing three things you can see and two things you can hear right now—can help you stay connected to that sense of peace. I'm here if you'd like to share more about your day!	text	like	2026-03-02 07:57:44.012863-08
1d436df6-a371-4f0b-b448-0aa9f6bd7c07	e6eedfe5-4015-4196-a106-facbd375badf	user	I'm feeling anxious right now, can you suggest a quick breathing exercise?	text	\N	2026-03-27 06:04:11.85505-07
76399e0c-3161-46a7-9107-8abc3efe5141	e6eedfe5-4015-4196-a106-facbd375badf	ai	I’m sorry to hear that you're feeling anxious right now. Even though you were feeling quite happy recently, it is completely normal for our emotions to shift. I am here to help you find some calm.\n\nLet’s try a simple technique called **Box Breathing**. It is a very effective way to signal to your nervous system that you are safe.\n\nPlease follow these steps:\n\n1.  **Inhale** slowly through your nose for a count of **4**.\n2.  **Hold** your breath gently for a count of **4**.\n3.  **Exhale** slowly and completely through your mouth for a count of **4**.\n4.  **Wait** and hold for a count of **4** before taking your next breath.\n\nTry repeating this cycle three or four times. Focusing on the counting can help ground your thoughts. \n\nHow does your body feel after trying that? I'm here if you'd like to talk about what's on your mind.	text	like	2026-03-27 06:04:17.99746-07
69e55f65-379f-4a3a-87a2-6778ab4f0b48	77272f7d-1ce0-451f-8e4d-72b81a16234c	ai	I hear how exhausting and overwhelming it must be to experience these intense shifts from high energy to deep sadness. It takes a lot of courage to reach out and describe what you are going through.\n\nWhile I can help you understand these patterns from a psychological perspective, **I cannot provide a medical diagnosis.** Diagnosing a condition like Bipolar Disorder requires a comprehensive clinical evaluation by a healthcare professional who can look at your full medical history and symptoms.\n\nThe pattern you’re describing—periods of high energy and a decreased need for sleep followed by a "crash"—is something that needs professional attention. Because these fluctuations can be complex and physically taxing, **I strongly recommend that you schedule an appointment with a qualified psychiatrist.** A psychiatrist can provide the necessary clinical assessment and, if needed, a treatment plan that might include medication, which I cannot prescribe.\n\nIn the meantime, here are a few gentle steps you can take to manage your well-being:\n\n1.  **Track Your Patterns:** Keep a simple log of your sleep hours, energy levels, and moods. This information will be incredibly helpful for a doctor or therapist to see how these cycles occur over time.\n2.  **Focus on Grounding:** When your energy feels very high or very low, try "Box Breathing": Inhale for 4 seconds, hold for 4, exhale for 4, and hold for 4. This can help stabilize your nervous system.\n3.  **Prioritize Routine:** Even if it feels difficult, try to maintain a consistent time for lying down in a dark room, even if sleep doesn't come immediately.\n\n**If you feel you are in a crisis or are having thoughts of self-harm, please reach out for immediate help in Pakistan:**\n*   **Umang Helpline:** 0311-7786264\n*   **Emergency Services:** 1122 (Rescue) or 15 (Police)\n\nPlease consider reaching out to a local clinic or hospital to speak with a mental health professional. Your well-being is important, and there is support available to help you find balance. How are you feeling right now in this moment?	text	like	2026-05-12 05:10:55.543993-07
799797c7-a99d-46b0-97e8-d02865374a29	7e8715f1-78ff-4843-abc4-4c7bfd1079d1	user	Today was a good day for me.	text	\N	2026-05-24 05:05:30.171727-07
f90e240b-7b9a-4977-9e0e-bcae645cafc2	7e8715f1-78ff-4843-abc4-4c7bfd1079d1	ai	That is wonderful to hear! It is truly heartening to see that positive energy reflected in your "Happy" mood log as well. \n\nWhen we have good days, it can be very beneficial from a psychological perspective to "savor" the moment. In Cognitive Behavioral Therapy (CBT), we often look at the connection between our activities and our mood. \n\nWas there something specific that made today feel good for you? Perhaps it was a small accomplishment, a pleasant interaction, or just a general sense of peace? Identifying these "glimmers"—the small things that bring us joy—can help you build emotional resilience for the future. \n\nI’m really glad you’re feeling this way! How are you planning to spend the rest of your evening?	text	like	2026-05-24 05:05:35.328712-07
bc50e1ca-94e1-4037-a39b-874930198a83	53a33710-9030-4b88-830c-97b6d405864f	user	I keep thinking 'I'm not good enough'. Can you help me challenge this thought?	text	\N	2026-05-24 05:08:21.14192-07
91a8d442-f2d2-419f-98b2-6fe98ccd6642	53a33710-9030-4b88-830c-97b6d405864f	ai	It is very common to have these "inner critic" thoughts surface, even when you have been feeling generally positive lately, as your recent "Happy" mood log suggests. These thoughts often stem from cognitive distortions—patterns of thinking that aren't necessarily based on facts.\n\nIn Cognitive Behavioral Therapy (CBT), we can challenge the thought "I'm not good enough" by putting it on trial. Here is a simple exercise we can do together:\n\n1.  **Identify the Distortion:** This thought is often "All-or-Nothing" thinking or "Labeling." It reduces your entire, complex self into one negative category.\n2.  **Look for Evidence Against the Thought:** Can you think of three things you have done recently—no matter how small—that you are proud of or that went well? \n3.  **Find a Balanced Thought:** Instead of "I’m not good enough," try a more realistic statement: *"I am a human being who is learning and growing. I have strengths, and while I have areas to improve, I am capable."*\n\n**A quick grounding exercise:** Take a deep breath. Inhale for 4 seconds, hold for 4, and exhale for 6. Remind yourself that a thought is just a thought—it is not a fact.\n\nHow does that balanced thought feel to you? If these feelings persist or become overwhelming, I recommend scheduling an appointment with a qualified psychiatrist or counselor in Pakistan. You can also reach out to services like **Umang (0311-7786264)** for immediate support.	text	like	2026-05-24 05:08:28.07701-07
\.


--
-- TOC entry 5265 (class 0 OID 16823)
-- Dependencies: 222
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.chat_sessions (id, user_id, title, created_at, updated_at) FROM stdin;
7e8715f1-78ff-4843-abc4-4c7bfd1079d1	6da10535-0291-4dbe-a6c5-9c91f0fff249	Finding Balance in Neutrality	2026-03-02 07:57:37.862655-08	2026-03-02 07:57:37.862655-08
e6eedfe5-4015-4196-a106-facbd375badf	6da10535-0291-4dbe-a6c5-9c91f0fff249	Box Breathing for Anxiety Relief	2026-03-27 06:04:11.841041-07	2026-03-27 06:04:11.841041-07
77272f7d-1ce0-451f-8e4d-72b81a16234c	6da10535-0291-4dbe-a6c5-9c91f0fff249	Testing whether AI will recommend patient to go see a psychiatrist or not	2026-05-12 05:10:48.301252-07	2026-05-12 05:10:48.301252-07
53a33710-9030-4b88-830c-97b6d405864f	6da10535-0291-4dbe-a6c5-9c91f0fff249	Challenging the Inner Critic	2026-05-24 05:08:21.130583-07	2026-05-24 05:08:21.130583-07
\.


--
-- TOC entry 5266 (class 0 OID 16834)
-- Dependencies: 223
-- Data for Name: completed_exercises; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.completed_exercises (id, user_id, exercise_id, date) FROM stdin;
b1c0c4ff-ce47-4bcb-9766-52111b436474	263ef5de-da05-4328-a7b8-ae21b7534403	box-breathing	2026-05-19 05:35:16.653581-07
c727e8ea-e3ae-4c01-a56c-c1eaf3c013e2	263ef5de-da05-4328-a7b8-ae21b7534403	box-breathing	2026-05-19 05:35:16.666627-07
4a6e40e0-aede-4453-b576-07291a3bb0e4	263ef5de-da05-4328-a7b8-ae21b7534403	grounding-54321	2026-05-19 05:36:10.299864-07
add97665-c8a6-4f5c-82f7-f547fb928ee2	263ef5de-da05-4328-a7b8-ae21b7534403	grounding-54321	2026-05-19 05:36:10.304924-07
\.


--
-- TOC entry 5267 (class 0 OID 16843)
-- Dependencies: 224
-- Data for Name: conversation_participants; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.conversation_participants (conversation_id, user_id) FROM stdin;
afcf4227-8ec1-416a-8b9b-ca3f680a1184	6da10535-0291-4dbe-a6c5-9c91f0fff249
afcf4227-8ec1-416a-8b9b-ca3f680a1184	ef485b80-f210-4d7b-a21f-bd38f255232d
bce76732-8ee2-40ea-aecf-a8f29fb76e03	091c1f2d-6f24-45de-8d3e-db8023a82ec1
bce76732-8ee2-40ea-aecf-a8f29fb76e03	ef485b80-f210-4d7b-a21f-bd38f255232d
78c7420a-678f-4683-a9e2-58bdd8e39ed7	6da10535-0291-4dbe-a6c5-9c91f0fff249
78c7420a-678f-4683-a9e2-58bdd8e39ed7	0979424d-9082-4ae2-b688-d351ad279a1f
\.


--
-- TOC entry 5268 (class 0 OID 16848)
-- Dependencies: 225
-- Data for Name: conversations; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.conversations (id, created_at) FROM stdin;
afcf4227-8ec1-416a-8b9b-ca3f680a1184	2026-03-02 08:00:21.556809-08
bce76732-8ee2-40ea-aecf-a8f29fb76e03	2026-03-24 06:07:11.327107-07
78c7420a-678f-4683-a9e2-58bdd8e39ed7	2026-05-24 03:55:07.333801-07
\.


--
-- TOC entry 5283 (class 0 OID 25104)
-- Dependencies: 240
-- Data for Name: daily_quotes; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.daily_quotes (id, text, author, category) FROM stdin;
1	The only way to do great work is to love what you do.	Steve Jobs	motivation
2	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
3	Mental health is not a destination, but a process.	Noam Shpancer	wellness
4	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
5	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
6	The only way to do great work is to love what you do.	Steve Jobs	motivation
7	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
8	Mental health is not a destination, but a process.	Noam Shpancer	wellness
9	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
10	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
11	The only way to do great work is to love what you do.	Steve Jobs	motivation
12	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
13	Mental health is not a destination, but a process.	Noam Shpancer	wellness
14	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
15	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
16	The only way to do great work is to love what you do.	Steve Jobs	motivation
17	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
18	Mental health is not a destination, but a process.	Noam Shpancer	wellness
19	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
20	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
21	The only way to do great work is to love what you do.	Steve Jobs	motivation
22	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
23	Mental health is not a destination, but a process.	Noam Shpancer	wellness
24	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
25	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
26	The only way to do great work is to love what you do.	Steve Jobs	motivation
27	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
28	Mental health is not a destination, but a process.	Noam Shpancer	wellness
29	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
30	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
31	The only way to do great work is to love what you do.	Steve Jobs	motivation
32	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
33	Mental health is not a destination, but a process.	Noam Shpancer	wellness
34	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
35	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
36	The only way to do great work is to love what you do.	Steve Jobs	motivation
37	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
38	Mental health is not a destination, but a process.	Noam Shpancer	wellness
39	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
40	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
41	The only way to do great work is to love what you do.	Steve Jobs	motivation
42	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
43	Mental health is not a destination, but a process.	Noam Shpancer	wellness
44	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
45	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
46	The only way to do great work is to love what you do.	Steve Jobs	motivation
47	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
48	Mental health is not a destination, but a process.	Noam Shpancer	wellness
49	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
50	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
51	The only way to do great work is to love what you do.	Steve Jobs	motivation
52	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
53	Mental health is not a destination, but a process.	Noam Shpancer	wellness
54	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
55	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
56	The only way to do great work is to love what you do.	Steve Jobs	motivation
57	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
58	Mental health is not a destination, but a process.	Noam Shpancer	wellness
59	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
60	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
61	The only way to do great work is to love what you do.	Steve Jobs	motivation
62	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
63	Mental health is not a destination, but a process.	Noam Shpancer	wellness
64	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
65	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
66	The only way to do great work is to love what you do.	Steve Jobs	motivation
67	It does not matter how slowly you go as long as you do not stop.	Confucius	perseverance
68	Mental health is not a destination, but a process.	Noam Shpancer	wellness
69	You don’t have to be positive all the time. It’s okay to feel sad, angry, annoyed, frustrated, scared and anxious.	Lori Deschene	validation
70	Happiness can be found even in the darkest of times, if one only remembers to turn on the light.	Albus Dumbledore	hope
\.


--
-- TOC entry 5269 (class 0 OID 16855)
-- Dependencies: 226
-- Data for Name: direct_messages; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.direct_messages (id, conversation_id, sender_id, text, "timestamp", status) FROM stdin;
8ab68cd1-f6b3-4b7e-9bc7-e820fb5d065d	afcf4227-8ec1-416a-8b9b-ca3f680a1184	6da10535-0291-4dbe-a6c5-9c91f0fff249	97ed8541795ca243f1304b6ff69e771d:89f487a1f50e03e4ea06218600cae7b5:f284fb13ebd8578fb594f630971c09536d274fe7a8318d7511ed5a4f6dea9b3280bd5d866c795a669b16399261725fbccc4dab3d2eee5e79af3f637d592ce92c8cc30b8015ce6a64022d5fa3654de26eb3e4279124a5f0853376f6f86c7233e07660b0de2d226d2554b508fbb139e665013be4	2026-03-02 08:00:21.56259-08	read
421260e2-7d7c-4b15-8086-ba595863308e	afcf4227-8ec1-416a-8b9b-ca3f680a1184	ef485b80-f210-4d7b-a21f-bd38f255232d	34d2a296f12583a499a09e647606942e:e9c287959bfe836b51345a1cc98b67fc:b1ea5bb0b92ffbab5b47f840eb1648b665c1fe5591aa688e3901fe89276a85d0df1392fbc50e6c80d41ab094a5d24ebb	2026-03-02 08:01:33.078456-08	read
7090bd31-cc09-4144-ae82-e21f670d5f01	afcf4227-8ec1-416a-8b9b-ca3f680a1184	6da10535-0291-4dbe-a6c5-9c91f0fff249	80807a82b6682f76eda2c53df2f2d49a:46ed8c8c5f03e687af7be3f48f2d3b3e:33e70830cc4a	2026-03-24 05:55:24.529517-07	read
aac737a0-f7bc-4b33-bc7c-16f2dbdd8e4c	afcf4227-8ec1-416a-8b9b-ca3f680a1184	ef485b80-f210-4d7b-a21f-bd38f255232d	f28e3115c990ebae6334a42fe8071cb9:5be127cf902e7d19f0a22ee524fc3f26:a7736a893282251a8167e97a89ad6a46415d6ffb77bdae	2026-03-24 05:56:48.876047-07	read
ba7c5f9a-b9e5-40e0-a320-35c6b4731582	afcf4227-8ec1-416a-8b9b-ca3f680a1184	6da10535-0291-4dbe-a6c5-9c91f0fff249	9735ccc142a39ae5379d1c522653f8db:abc60f9165f47881e5f79f0fe6aab4c6:39a431c12e30d4652785eb1e222f4f8aa4d26a05407b	2026-03-24 06:05:39.945846-07	read
dab1cef5-2ecd-4f0d-bbb7-21398896838f	bce76732-8ee2-40ea-aecf-a8f29fb76e03	091c1f2d-6f24-45de-8d3e-db8023a82ec1	474e66339014b2702bda5905ac7015fc:92aa1ddf838c6ccf1686ec8286ba012c:28c1ab306097f2301f9d74f17fd04b44f54ed9ebdc040a201cd5	2026-03-24 06:07:11.335631-07	read
ecf2e264-67e0-4b54-9e58-2c5879267034	bce76732-8ee2-40ea-aecf-a8f29fb76e03	ef485b80-f210-4d7b-a21f-bd38f255232d	c98010fa2ff4321eb62e2a8a5b83600f:f97e95a3a5b9d0597752ce9f8065748a:56a7c677fb98f426a9896659327d3ab4b51bcc6ebf93f698c6ce5c52877f069be19b8e	2026-03-24 06:07:50.145693-07	read
3ee37e63-7039-4501-a28b-81f3f9890c4e	78c7420a-678f-4683-a9e2-58bdd8e39ed7	6da10535-0291-4dbe-a6c5-9c91f0fff249	91e2e31a73335055bfca354e8a5378a4:b99983176ef240ebf696201ab81783da:7ba52fc50a86782b6f442b37bbe66711	2026-05-24 03:55:07.358524-07	read
792c7f75-2e0a-4e57-bf9e-4ceefe752d47	78c7420a-678f-4683-a9e2-58bdd8e39ed7	0979424d-9082-4ae2-b688-d351ad279a1f	7aed471f791eb91367366361dfb3a3b9:595a961006e182b3397ba3de648fdc26:9eb74b01005fb2cad3ac0eb9	2026-05-24 03:55:59.951563-07	read
\.


--
-- TOC entry 5276 (class 0 OID 24992)
-- Dependencies: 233
-- Data for Name: feedback; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.feedback (id, user_id, appointment_id, target_id, type, rating, comment, created_at) FROM stdin;
e7de342b-e04a-4c94-8b30-3da2484b9bd5	091c1f2d-6f24-45de-8d3e-db8023a82ec1	\N	\N	ai_support	4	It is good	2026-03-25 06:58:18.877197-07
e12a275d-b40c-4a67-9370-2df90f351647	ef485b80-f210-4d7b-a21f-bd38f255232d	3b12cebe-ba21-4474-a882-3838cb18acc1	6da10535-0291-4dbe-a6c5-9c91f0fff249	psychiatrist	5	It went good	2026-03-25 06:58:54.871098-07
1a15cb75-f542-4bd4-8fb0-65f0c61a8cf6	091c1f2d-6f24-45de-8d3e-db8023a82ec1	75abc3b6-214e-4e06-b2c0-c9e168f4ff6c	ef485b80-f210-4d7b-a21f-bd38f255232d	appointment	5	I had a good experience.	2026-05-24 03:59:32.484719-07
70ff4dd8-d997-487c-a9bf-5b34e9119c37	ef485b80-f210-4d7b-a21f-bd38f255232d	3b12cebe-ba21-4474-a882-3838cb18acc1	6da10535-0291-4dbe-a6c5-9c91f0fff249	psychiatrist	5	It was a good engagement.	2026-05-24 04:09:58.827553-07
9ce60c00-9f2c-45cf-944e-2fc6757d9e40	ef485b80-f210-4d7b-a21f-bd38f255232d	75abc3b6-214e-4e06-b2c0-c9e168f4ff6c	091c1f2d-6f24-45de-8d3e-db8023a82ec1	psychiatrist	5	Testing...	2026-05-24 05:19:27.953095-07
\.


--
-- TOC entry 5285 (class 0 OID 25143)
-- Dependencies: 242
-- Data for Name: forum_comments; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.forum_comments (id, post_id, user_id, content, is_anonymous, created_at) FROM stdin;
cc96ab95-203b-4b27-944d-5b971317491c	edaa72a6-966c-4627-baa8-3564a5b93da3	ef485b80-f210-4d7b-a21f-bd38f255232d	Testing Comment...	f	2026-05-21 02:56:21.562864
8b8900bb-623e-41b9-8072-7288ae88af02	c01ad7d1-c346-4520-a286-b669eb4ed01c	ef485b80-f210-4d7b-a21f-bd38f255232d	Testing Comment...	t	2026-05-21 02:56:42.713763
676d91c3-9a14-4e01-8948-7d03b3e9c738	edaa72a6-966c-4627-baa8-3564a5b93da3	0979424d-9082-4ae2-b688-d351ad279a1f	Testing Comment...	f	2026-05-21 02:57:36.278471
3f26e9b6-7536-45ff-b089-11f35bbbfe99	c01ad7d1-c346-4520-a286-b669eb4ed01c	0979424d-9082-4ae2-b688-d351ad279a1f	Testing Comment...	t	2026-05-21 02:57:47.73274
41b04c8c-01cb-4131-b19e-8887973ef8dd	c01ad7d1-c346-4520-a286-b669eb4ed01c	ef485b80-f210-4d7b-a21f-bd38f255232d	Testing Comment...	t	2026-05-21 03:03:48.115134
65cbfe41-8b56-4b5c-8dc7-15aab6da20da	c01ad7d1-c346-4520-a286-b669eb4ed01c	ef485b80-f210-4d7b-a21f-bd38f255232d	Testing Comment...	t	2026-05-21 03:03:54.245613
48478e93-7016-451e-96a1-1088223137c9	c01ad7d1-c346-4520-a286-b669eb4ed01c	ef485b80-f210-4d7b-a21f-bd38f255232d	Testing Comment...	t	2026-05-21 03:18:09.527736
0e10e078-95f6-47a9-b06b-d40a7612e318	edaa72a6-966c-4627-baa8-3564a5b93da3	091c1f2d-6f24-45de-8d3e-db8023a82ec1	Testing Comment...	f	2026-05-21 03:25:17.843976
f04da57b-f2ae-448f-861d-89beb8c037df	c01ad7d1-c346-4520-a286-b669eb4ed01c	091c1f2d-6f24-45de-8d3e-db8023a82ec1	Testing Comment...	t	2026-05-21 03:25:41.446946
d41c5193-6bba-4f99-a6ed-628521cec5d8	7a4bfbd2-6af4-4fe5-9321-fffa8057497d	6da10535-0291-4dbe-a6c5-9c91f0fff249	Testing comments.....	f	2026-05-24 05:23:47.639462
c7b6d885-d91b-44e3-bb0d-cf32303db96b	7a4bfbd2-6af4-4fe5-9321-fffa8057497d	6da10535-0291-4dbe-a6c5-9c91f0fff249	Testing comments.....	t	2026-05-24 05:23:52.263014
3ab37b01-961d-4c8b-8995-19455163b824	7a4bfbd2-6af4-4fe5-9321-fffa8057497d	091c1f2d-6f24-45de-8d3e-db8023a82ec1	1	f	2026-05-24 05:28:50.919695
553020a7-dd3a-4745-964f-4a706007748a	7a4bfbd2-6af4-4fe5-9321-fffa8057497d	6da10535-0291-4dbe-a6c5-9c91f0fff249	2	f	2026-05-24 05:29:22.723818
2cdab2be-cd07-4793-878c-30c8dd8fc3bc	7a4bfbd2-6af4-4fe5-9321-fffa8057497d	6da10535-0291-4dbe-a6c5-9c91f0fff249	3	t	2026-05-24 05:29:30.427511
6023cbc6-7004-483f-aa1f-55b10e09b82d	7a4bfbd2-6af4-4fe5-9321-fffa8057497d	ef485b80-f210-4d7b-a21f-bd38f255232d	4	t	2026-05-24 05:30:06.730429
\.


--
-- TOC entry 5284 (class 0 OID 25124)
-- Dependencies: 241
-- Data for Name: forum_posts; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.forum_posts (id, user_id, title, content, is_anonymous, created_at) FROM stdin;
edaa72a6-966c-4627-baa8-3564a5b93da3	6da10535-0291-4dbe-a6c5-9c91f0fff249	Community Forum Testing...	Community Forum Testing...	f	2026-05-21 02:54:34.816572
c01ad7d1-c346-4520-a286-b669eb4ed01c	6da10535-0291-4dbe-a6c5-9c91f0fff249	Community Forum Testing Anonymously...	Community Forum Testing Anonymously...	t	2026-05-21 02:55:02.893232
7a4bfbd2-6af4-4fe5-9321-fffa8057497d	091c1f2d-6f24-45de-8d3e-db8023a82ec1	Testing from a different user.	Testing....	f	2026-05-24 05:22:41.212288
\.


--
-- TOC entry 5270 (class 0 OID 16869)
-- Dependencies: 227
-- Data for Name: journal_entries; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.journal_entries (id, user_id, content, date) FROM stdin;
e7e80244-d8e7-4c32-a6c8-a599ae513fed	6da10535-0291-4dbe-a6c5-9c91f0fff249	Reflect on the transition between your periods of high energy and your experiences of deep sadness: what specific physical sensations or internal thoughts signal that your energy is starting to shift, and how does your perception of your identity and your future change depending on which state you are in?	2026-05-14 03:55:33.61544-07
0d67fb86-200d-471b-bfbb-7f209979ef85	091c1f2d-6f24-45de-8d3e-db8023a82ec1	Testing.....	2026-05-19 05:22:21.436914-07
d032e660-b41f-48a4-8074-f47c03600113	091c1f2d-6f24-45de-8d3e-db8023a82ec1	(2)	2026-05-19 05:32:10.485034-07
2ccb9bef-a4ab-42f3-b5b9-c038e42a9665	263ef5de-da05-4328-a7b8-ae21b7534403	Testing....	2026-05-19 05:34:13.949245-07
c34c25e2-ee2e-4820-9de0-ce544b87d0aa	6da10535-0291-4dbe-a6c5-9c91f0fff249	This is to test the new module.	2026-05-19 06:37:41.87407-07
\.


--
-- TOC entry 5271 (class 0 OID 16880)
-- Dependencies: 228
-- Data for Name: mood_entries; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.mood_entries (id, user_id, mood, notes, date) FROM stdin;
7ddd310d-62c1-49af-b69d-c13b946814d5	6da10535-0291-4dbe-a6c5-9c91f0fff249	3	I am having a normal day today	2026-03-02 07:57:17.041251-08
01c5af67-6bba-4905-baaa-1f877d76fdfd	6da10535-0291-4dbe-a6c5-9c91f0fff249	5	Today was an amazing day.	2026-03-03 06:41:32.454037-08
64b27f2f-8992-448a-a363-611ba7505485	6da10535-0291-4dbe-a6c5-9c91f0fff249	1	Today i felt extremely low, It was a very bad day for me.	2026-03-03 14:49:42.985124-08
b16496db-af90-4b04-a522-d7d72e114f4b	6da10535-0291-4dbe-a6c5-9c91f0fff249	2	Today was a bit better then yesterday but still a bad day tho.	2026-03-05 06:53:03.689203-08
64dc9f2c-8f94-4fab-bcdf-d5fb5f23d9e4	6da10535-0291-4dbe-a6c5-9c91f0fff249	3	Today was a normal day for me.	2026-03-12 07:41:44.354154-07
7318c1b6-d41e-451c-867b-252845ae6541	6da10535-0291-4dbe-a6c5-9c91f0fff249	4	I had a good day today.	2026-03-16 08:18:07.980534-07
8b84f180-1991-4d0a-981e-00010652286d	6da10535-0291-4dbe-a6c5-9c91f0fff249	5	My eid holidays were amazing.	2026-03-24 05:55:03.134728-07
41de1c52-32b2-481d-b4ae-d1fead21d7e4	6da10535-0291-4dbe-a6c5-9c91f0fff249	5	I am having a good day.	2026-03-25 06:56:53.056117-07
dae3cf2b-75b7-43a3-9d0d-0f3d1abec37f	6da10535-0291-4dbe-a6c5-9c91f0fff249	4	I had a good day today.	2026-03-27 05:34:49.323511-07
bb4e8fff-6439-4095-954f-7a85913bf1ae	6da10535-0291-4dbe-a6c5-9c91f0fff249	4	Today was a good day for me.	2026-04-25 03:11:50.307086-07
4d54e2d1-d995-474d-beae-58f81fcc6f1a	6da10535-0291-4dbe-a6c5-9c91f0fff249	3	Today is a pretty tough day for me.	2026-05-12 04:54:31.589709-07
8a83ded0-c897-4fae-aab6-ba51bc3bab56	6da10535-0291-4dbe-a6c5-9c91f0fff249	4	Today was a Good day for me.	2026-05-19 05:04:47.170222-07
3417fd19-25bd-441a-8bec-58d42b2ebd5a	091c1f2d-6f24-45de-8d3e-db8023a82ec1	3	Today was an average day for me.	2026-05-19 05:21:55.255126-07
549cceff-06b4-4103-ae5b-73f2af0665d7	263ef5de-da05-4328-a7b8-ae21b7534403	5	I am very happy today.	2026-05-19 05:33:53.605197-07
84c51c2b-e32d-454d-a1de-d7d7d0cb9738	6da10535-0291-4dbe-a6c5-9c91f0fff249	4	I having a good day today.	2026-05-24 05:11:47.356109-07
\.


--
-- TOC entry 5275 (class 0 OID 24970)
-- Dependencies: 232
-- Data for Name: notifications; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.notifications (id, user_id, type, title, message, link, is_read, created_at) FROM stdin;
9186021d-f047-48b0-99fb-0ec8decc95cb	ef485b80-f210-4d7b-a21f-bd38f255232d	dm	New Message	You received a new message from testUser.	/messaging	t	2026-03-24 06:05:39.954377-07
bfff2811-2e84-40d6-a9b6-3ef4c545a8b7	ef485b80-f210-4d7b-a21f-bd38f255232d	dm	New Message	You received a new message from zainmalik3618.	/messaging	t	2026-03-24 06:07:11.339691-07
512de005-0c49-4bd4-ba0c-8eafc4f8b5ac	091c1f2d-6f24-45de-8d3e-db8023a82ec1	dm	New Message	You received a new message from testPsychiatrist.	/messaging	t	2026-03-24 06:07:50.155644-07
72da7ad3-4a44-49e3-a823-d6e3e450a068	091c1f2d-6f24-45de-8d3e-db8023a82ec1	appointment_new	New Appointment Scheduled	A new appointment has been scheduled for 2026-03-24 at 18:10.	/appointments	t	2026-03-24 06:08:50.953926-07
f0abc478-e794-475c-a57d-c87e74ee968d	ef485b80-f210-4d7b-a21f-bd38f255232d	appointment_reminder	Upcoming Appointment Reminder	Reminder: You have an appointment tomorrow (2026-03-24) at 15:00:00.	/appointments	t	2026-03-24 06:13:52.087863-07
4f99ffdc-67c6-4353-b979-6673fcf4197c	091c1f2d-6f24-45de-8d3e-db8023a82ec1	appointment_new	New Appointment Scheduled	A new appointment has been scheduled for 2026-03-24 at 18:16.	/appointments	t	2026-03-24 06:14:33.189537-07
5eb25e4f-3e7a-4e41-8258-4fc65adfacdc	0979424d-9082-4ae2-b688-d351ad279a1f	dm	New Message	You received a new message from testUser.	/messaging	t	2026-05-24 03:55:07.369598-07
37879e4d-6f21-42a8-a1a7-ed6b55877998	091c1f2d-6f24-45de-8d3e-db8023a82ec1	appointment_new	New Appointment Scheduled	A new appointment has been scheduled for 2026-05-25 at 10:00.	/appointments	t	2026-05-24 03:58:10.338397-07
caf1f590-a284-4eac-bc8c-8fd092a30d78	091c1f2d-6f24-45de-8d3e-db8023a82ec1	appointment_reminder	Upcoming Appointment Reminder	Reminder: You have an appointment tomorrow (2026-05-24) at 10:00:00.	/appointments	t	2026-05-24 03:58:48.103642-07
2906b82c-c61b-4988-9175-ff68d15935af	6da10535-0291-4dbe-a6c5-9c91f0fff249	appointment_feedback	Session Feedback Received	Psychiatrist testPsychiatrist has left feedback for your appointment on 2026-03-24 at 15:00:00 (Rating: 5/5).	/appointments	t	2026-05-24 04:09:58.849173-07
584db04f-e23e-47f2-8d8b-832bccd04ff9	6da10535-0291-4dbe-a6c5-9c91f0fff249	report_update	Report Under Review	Your submitted report (BEHAVIOR) has been reviewed by the administration. Description: "Testing...."	\N	t	2026-05-24 04:16:57.451016-07
59f81a45-3a3a-4a2d-8b96-2c0764a8da8e	6da10535-0291-4dbe-a6c5-9c91f0fff249	report_update	Report Resolved	Your submitted report (BEHAVIOR) has been marked as resolved by the administration. Thank you for your feedback.	\N	t	2026-05-24 04:17:05.435492-07
25158ec6-1f0d-447e-badd-c083b3a004bd	ef485b80-f210-4d7b-a21f-bd38f255232d	report_update	Report Under Review	Your submitted report (TECHNICAL) has been reviewed by the administration. Description: "Testing...."	\N	t	2026-05-24 04:16:50.95499-07
0619dfa2-ea5f-4a71-9841-0f75b521360c	ef485b80-f210-4d7b-a21f-bd38f255232d	report_update	Report Resolved	Your submitted report (TECHNICAL) has been marked as resolved by the administration. Thank you for your feedback.	\N	t	2026-05-24 04:17:02.40932-07
ab84887e-b23a-4cf4-8ce9-694685961003	091c1f2d-6f24-45de-8d3e-db8023a82ec1	appointment_feedback	Session Feedback Received	Psychiatrist testPsychiatrist has left feedback for your appointment on 2026-03-23 at 18:16:00 (Rating: 5/5).	/appointments	t	2026-05-24 05:19:27.974513-07
965ce068-ea36-421f-91eb-63352117fcc3	091c1f2d-6f24-45de-8d3e-db8023a82ec1	forum_reply	New Forum Reply	testUser replied to your forum post "Testing from a different user.": "2"	/forum	t	2026-05-24 05:29:22.735184-07
e390e8b6-d885-44f9-8fba-089be32d69a5	091c1f2d-6f24-45de-8d3e-db8023a82ec1	forum_reply	New Forum Reply	An anonymous peer replied to your forum post "Testing from a different user.": "3"	/forum	t	2026-05-24 05:29:30.435956-07
fdb8d3cb-1cfc-419b-9a20-629efc222d5f	091c1f2d-6f24-45de-8d3e-db8023a82ec1	forum_reply	New Forum Reply	An anonymous peer replied to your forum post "Testing from a different user.": "4"	/forum	t	2026-05-24 05:30:06.735793-07
\.


--
-- TOC entry 5278 (class 0 OID 25039)
-- Dependencies: 235
-- Data for Name: psychiatrist_availability; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.psychiatrist_availability (id, psychiatrist_id, day, start_time, end_time) FROM stdin;
005dfde0-b27c-4a9e-a819-27b3a1e65451	ef485b80-f210-4d7b-a21f-bd38f255232d	Monday	16:00:00	21:00:00
4a52bcc2-eb6f-457b-8788-524fbd458c0a	ef485b80-f210-4d7b-a21f-bd38f255232d	Tuesday	16:00:00	21:00:00
22390fee-cf5b-4adb-889b-6922b7debd0c	ef485b80-f210-4d7b-a21f-bd38f255232d	Wednesday	16:00:00	21:00:00
1d042d1c-68c0-4efe-bb89-93d3ded7c151	ef485b80-f210-4d7b-a21f-bd38f255232d	Thursday	16:00:00	21:00:00
67012f94-b1da-49bb-bd36-4eb700efaf9e	ef485b80-f210-4d7b-a21f-bd38f255232d	Friday	16:00:00	21:00:00
ca6d15c9-10b4-421b-8cc8-de6281d4c45b	ef485b80-f210-4d7b-a21f-bd38f255232d	Saturday	10:00:00	14:00:00
\.


--
-- TOC entry 5286 (class 0 OID 25170)
-- Dependencies: 243
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
38c27e8d-2565-4ce9-a227-042b5fb43770	6da10535-0291-4dbe-a6c5-9c91f0fff249	f9aa4c7290e6729f21f3c7694fecc951358a1fc37073451e9b3c2b2503fe3502f998c2dbe197f223	2026-05-31 17:41:30.467	2026-05-24 05:41:30.468339
\.


--
-- TOC entry 5277 (class 0 OID 25018)
-- Dependencies: 234
-- Data for Name: reports; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.reports (id, user_id, target_id, type, description, status, created_at) FROM stdin;
1ca6d365-c6f7-432e-adff-7754d427e789	6da10535-0291-4dbe-a6c5-9c91f0fff249	\N	ai_response	AI response it not as i expect.	resolved	2026-03-25 06:59:48.333729-07
3bb29114-858a-4c60-9f1a-a89cc3640d45	6da10535-0291-4dbe-a6c5-9c91f0fff249	\N	behavior	Application is working well in the light mode but as soon i shift to dark mode the UI seems like its broken for dark mode I am expecting a fix soons.	resolved	2026-05-14 05:17:38.709186-07
72d92457-b0a2-4b00-81cb-b2e02258a579	6da10535-0291-4dbe-a6c5-9c91f0fff249	\N	ai_response	I wasn't expecting AI to suggest me medications but it did. This action is very harmful and can have catestrophic impact on the future ofthis application	resolved	2026-05-14 05:16:01.893627-07
7fc37fc8-4eea-4c22-bd27-96689df176c0	6da10535-0291-4dbe-a6c5-9c91f0fff249	\N	technical	123	resolved	2026-05-24 04:10:50.35777-07
e78567b1-ddc9-4fa7-9f16-0c499ec1c12b	ef485b80-f210-4d7b-a21f-bd38f255232d	\N	technical	Testing....	resolved	2026-05-24 04:16:16.419341-07
226f6eff-5a77-426e-b3dd-7f35407c9d5e	6da10535-0291-4dbe-a6c5-9c91f0fff249	\N	behavior	Testing....	resolved	2026-05-24 04:15:57.359445-07
\.


--
-- TOC entry 5272 (class 0 OID 16892)
-- Dependencies: 229
-- Data for Name: thought_records; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.thought_records (id, user_id, situation, automatic_thought, evidence_for, evidence_against, alternative_thought, outcome, date) FROM stdin;
\.


--
-- TOC entry 5273 (class 0 OID 16908)
-- Dependencies: 230
-- Data for Name: user_activity_logs; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.user_activity_logs (id, user_id, activity_type, ip_address, "timestamp") FROM stdin;
57470305-8b76-43e6-8354-9735a68f321e	0979424d-9082-4ae2-b688-d351ad279a1f	logout	127.0.0.1	2026-05-24 04:50:29.285264-07
805becce-e37d-431b-a1d0-98fcf3863df7	6da10535-0291-4dbe-a6c5-9c91f0fff249	login	127.0.0.1	2026-05-24 04:50:37.966761-07
8665755f-cef7-4305-9f81-ac377a2c4c20	0979424d-9082-4ae2-b688-d351ad279a1f	logout	127.0.0.1	2026-05-24 04:51:41.773504-07
0f881c88-3fa3-4b27-b561-0a319959b6c0	ef485b80-f210-4d7b-a21f-bd38f255232d	logout	127.0.0.1	2026-05-24 05:19:37.86237-07
63fce6a2-bb97-472e-b738-590f55492146	091c1f2d-6f24-45de-8d3e-db8023a82ec1	login	127.0.0.1	2026-05-24 05:19:46.619081-07
b7b536a7-1250-4636-9a5e-e0e72837b89d	6da10535-0291-4dbe-a6c5-9c91f0fff249	logout	127.0.0.1	2026-05-24 05:24:06.752864-07
856ceea0-7917-48c5-b22b-175cce2a0b2b	6da10535-0291-4dbe-a6c5-9c91f0fff249	logout	127.0.0.1	2026-05-24 05:29:46.854519-07
c0bb0110-ba38-4f33-93da-501f094ff5ee	ef485b80-f210-4d7b-a21f-bd38f255232d	login	127.0.0.1	2026-05-24 05:29:56.048722-07
71502712-60aa-4f65-bbc6-9d5a1d08a4a9	091c1f2d-6f24-45de-8d3e-db8023a82ec1	logout	127.0.0.1	2026-05-24 05:31:28.435948-07
985794e5-97c0-4be0-89ee-d04a5c2f6a92	0979424d-9082-4ae2-b688-d351ad279a1f	login	127.0.0.1	2026-05-24 05:31:37.782253-07
061df5b6-a35a-4947-8751-9ecaf417569f	6da10535-0291-4dbe-a6c5-9c91f0fff249	logout	127.0.0.1	2026-05-24 04:50:44.722954-07
13a27554-d32f-4e4c-99a7-b91b0cc725b5	ef485b80-f210-4d7b-a21f-bd38f255232d	login	127.0.0.1	2026-05-24 04:50:54.483433-07
70a0db0a-ff98-424c-8c5a-0be09fc522fd	6da10535-0291-4dbe-a6c5-9c91f0fff249	login	127.0.0.1	2026-05-24 05:04:35.675092-07
869e0821-e6ed-429f-87f3-2dd09455c421	091c1f2d-6f24-45de-8d3e-db8023a82ec1	logout	127.0.0.1	2026-05-24 05:23:00.23533-07
c9ea59f5-ad5f-412c-b929-27a8ad5a7857	091c1f2d-6f24-45de-8d3e-db8023a82ec1	login	127.0.0.1	2026-05-24 05:24:21.791447-07
7a5781d5-3e9a-44f2-a495-c13024c6a887	ef485b80-f210-4d7b-a21f-bd38f255232d	logout	127.0.0.1	2026-05-24 05:30:17.010072-07
6b8d8474-68c7-4ea2-a277-d781f08ab2bb	0979424d-9082-4ae2-b688-d351ad279a1f	logout	127.0.0.1	2026-05-24 05:41:14.73111-07
c16357e8-ecfb-40a0-b54e-2d99907eaeb2	ef485b80-f210-4d7b-a21f-bd38f255232d	logout	127.0.0.1	2026-05-24 04:51:07.440891-07
b2f5166c-3b34-436e-b753-d8b6ddabf879	0979424d-9082-4ae2-b688-d351ad279a1f	login	127.0.0.1	2026-05-24 04:51:17.483893-07
eee008c7-447e-4097-b818-1984eb238708	6da10535-0291-4dbe-a6c5-9c91f0fff249	logout	127.0.0.1	2026-05-24 05:19:02.935378-07
8f947d4a-19f7-48ea-935e-4fb0d2f55230	ef485b80-f210-4d7b-a21f-bd38f255232d	login	127.0.0.1	2026-05-24 05:19:12.413174-07
db2dd207-9eae-4b8c-8431-0e8a978b81ec	6da10535-0291-4dbe-a6c5-9c91f0fff249	login	127.0.0.1	2026-05-24 05:23:17.812171-07
7c1a1572-3aaf-444f-96b3-0d0ad0fe637c	091c1f2d-6f24-45de-8d3e-db8023a82ec1	logout	127.0.0.1	2026-05-24 05:28:59.925923-07
c83e4554-cf84-4976-affe-f12901a9166a	6da10535-0291-4dbe-a6c5-9c91f0fff249	login	127.0.0.1	2026-05-24 05:29:08.624719-07
f761d578-ed9e-4dcd-8a49-9b3bf533d97a	091c1f2d-6f24-45de-8d3e-db8023a82ec1	login	127.0.0.1	2026-05-24 05:30:40.807612-07
5f8d72d4-c490-430f-b34c-c3e84541c577	6da10535-0291-4dbe-a6c5-9c91f0fff249	login	127.0.0.1	2026-05-24 05:41:30.473767-07
15c7a7c0-97bc-4a39-b71e-722c11c2f485	0979424d-9082-4ae2-b688-d351ad279a1f	login	127.0.0.1	2026-05-24 04:49:46.92831-07
\.


--
-- TOC entry 5281 (class 0 OID 25085)
-- Dependencies: 238
-- Data for Name: user_badges; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.user_badges (user_id, badge_id, awarded_at) FROM stdin;
6da10535-0291-4dbe-a6c5-9c91f0fff249	first_journal	2026-05-19 06:37:41.880274
6da10535-0291-4dbe-a6c5-9c91f0fff249	mood_tracker	2026-05-24 05:11:47.380668
\.


--
-- TOC entry 5279 (class 0 OID 25058)
-- Dependencies: 236
-- Data for Name: user_streaks; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_points, updated_at) FROM stdin;
091c1f2d-6f24-45de-8d3e-db8023a82ec1	1	1	2026-05-24	35	2026-05-24 05:30:40.819275
6da10535-0291-4dbe-a6c5-9c91f0fff249	1	1	2026-05-24	135	2026-05-24 05:41:30.483091
\.


--
-- TOC entry 5274 (class 0 OID 16917)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: calmconnect; Owner: postgres
--

COPY calmconnect.users (id, username, email, password_hash, role, status, created_at, password_reset_token, password_reset_expires, is_verified, verification_token, verification_token_expires, deletion_requested_at, deletion_request_reason, age, emergency_contact, mental_health_goals, background_details, qualifications, specialization, registration_number, clinic_details, experience) FROM stdin;
ef485b80-f210-4d7b-a21f-bd38f255232d	testPsychiatrist	testPsychiatrist@calmconnect.com	$2a$10$KU4eoKPB1xc4INSAwJE35eY4y9R5ydUIdgagPgAVHOwLFJ3ZsbFSS	psychiatrist	active	2025-10-29 03:59:37.842281-07	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	MBBS, FCPS (Psychiatry)	Adult Psychiatry, Anxiety Disorders, Depression, CBT Therapy	PMC-98765-P	CalmConnect Mental Health Clinic, Islamabad\nMon–Fri: 4:00 PM – 9:00 PM\nSat: 10:00 AM – 2:00 PM\nContact: 0300-1234567	8 Years
6da10535-0291-4dbe-a6c5-9c91f0fff249	testUser	testUser@email.com	$2a$10$9giZYKnEtdsowXzyleR34uHQKO6/M.HNvPDV1HrDT9tmEyXoscqNy	patient	active	2025-11-10 21:20:40.083499-08	\N	\N	t	\N	\N	\N	\N	24	1234567890	I want to be emotionally stronger.		\N	\N	\N	\N	\N
0979424d-9082-4ae2-b688-d351ad279a1f	admin_support	admin.support@calmconnect.com	$2a$10$hhtGVQCJgG96Vs4l4f37MuLNnzndSeugTwzPWTPUua12oHRQANJlC	admin	active	2025-10-27 11:35:53.635792-07	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
091c1f2d-6f24-45de-8d3e-db8023a82ec1	testUser_1	testUser_1@email.com	$2a$10$Db0inqUl6ZeBgBPJFa/.l.XCOJC2sw23m4kKixreWVgUomkipw9Re	patient	active	2026-03-24 06:06:26.86461-07	\N	\N	t	\N	\N	\N	\N	\N				\N	\N	\N	\N	\N
263ef5de-da05-4328-a7b8-ae21b7534403	zainmalik3618	zainmalik3618@gmail.com	$2a$10$COnFU3eYG0vK640PGmj/2./je0aomYw8fq42mfRwBn9tJHv9vXCCa	patient	active	2026-05-19 05:33:09.096804-07	\N	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5294 (class 0 OID 0)
-- Dependencies: 239
-- Name: daily_quotes_id_seq; Type: SEQUENCE SET; Schema: calmconnect; Owner: postgres
--

SELECT pg_catalog.setval('calmconnect.daily_quotes_id_seq', 70, true);


--
-- TOC entry 5023 (class 2606 OID 16936)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 25084)
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 16938)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 16940)
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 16942)
-- Name: completed_exercises completed_exercises_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.completed_exercises
    ADD CONSTRAINT completed_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 5031 (class 2606 OID 16944)
-- Name: conversation_participants conversation_participants_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversation_participants
    ADD CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id);


--
-- TOC entry 5035 (class 2606 OID 16946)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 25113)
-- Name: daily_quotes daily_quotes_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.daily_quotes
    ADD CONSTRAINT daily_quotes_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 16948)
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5059 (class 2606 OID 25005)
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- TOC entry 5083 (class 2606 OID 25156)
-- Name: forum_comments forum_comments_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_comments
    ADD CONSTRAINT forum_comments_pkey PRIMARY KEY (id);


--
-- TOC entry 5080 (class 2606 OID 25137)
-- Name: forum_posts forum_posts_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_posts
    ADD CONSTRAINT forum_posts_pkey PRIMARY KEY (id);


--
-- TOC entry 5039 (class 2606 OID 16950)
-- Name: journal_entries journal_entries_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.journal_entries
    ADD CONSTRAINT journal_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 16952)
-- Name: mood_entries mood_entries_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.mood_entries
    ADD CONSTRAINT mood_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5057 (class 2606 OID 24984)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5068 (class 2606 OID 25048)
-- Name: psychiatrist_availability psychiatrist_availability_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.psychiatrist_availability
    ADD CONSTRAINT psychiatrist_availability_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 25050)
-- Name: psychiatrist_availability psychiatrist_availability_psychiatrist_id_day_start_time_en_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.psychiatrist_availability
    ADD CONSTRAINT psychiatrist_availability_psychiatrist_id_day_start_time_en_key UNIQUE (psychiatrist_id, day, start_time, end_time);


--
-- TOC entry 5088 (class 2606 OID 25182)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5090 (class 2606 OID 25184)
-- Name: refresh_tokens refresh_tokens_token_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);


--
-- TOC entry 5065 (class 2606 OID 25031)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 16954)
-- Name: thought_records thought_records_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.thought_records
    ADD CONSTRAINT thought_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5047 (class 2606 OID 16956)
-- Name: user_activity_logs user_activity_logs_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_activity_logs
    ADD CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5076 (class 2606 OID 25092)
-- Name: user_badges user_badges_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_id);


--
-- TOC entry 5072 (class 2606 OID 25067)
-- Name: user_streaks user_streaks_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_streaks
    ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (user_id);


--
-- TOC entry 5049 (class 2606 OID 16958)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5051 (class 2606 OID 16960)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 16962)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5032 (class 1259 OID 16963)
-- Name: idx_conv_participants_convo; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_conv_participants_convo ON calmconnect.conversation_participants USING btree (conversation_id);


--
-- TOC entry 5033 (class 1259 OID 16964)
-- Name: idx_conv_participants_user; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_conv_participants_user ON calmconnect.conversation_participants USING btree (user_id);


--
-- TOC entry 5060 (class 1259 OID 25016)
-- Name: idx_feedback_type; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_feedback_type ON calmconnect.feedback USING btree (type);


--
-- TOC entry 5061 (class 1259 OID 25017)
-- Name: idx_feedback_user; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_feedback_user ON calmconnect.feedback USING btree (user_id);


--
-- TOC entry 5084 (class 1259 OID 25168)
-- Name: idx_forum_comments_post_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_forum_comments_post_id ON calmconnect.forum_comments USING btree (post_id);


--
-- TOC entry 5085 (class 1259 OID 25169)
-- Name: idx_forum_comments_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_forum_comments_user_id ON calmconnect.forum_comments USING btree (user_id);


--
-- TOC entry 5081 (class 1259 OID 25167)
-- Name: idx_forum_posts_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_forum_posts_user_id ON calmconnect.forum_posts USING btree (user_id);


--
-- TOC entry 5054 (class 1259 OID 24991)
-- Name: idx_notifications_unread; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_notifications_unread ON calmconnect.notifications USING btree (user_id) WHERE (is_read = false);


--
-- TOC entry 5055 (class 1259 OID 24990)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_notifications_user_id ON calmconnect.notifications USING btree (user_id);


--
-- TOC entry 5066 (class 1259 OID 25056)
-- Name: idx_psychiatrist_availability_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_psychiatrist_availability_id ON calmconnect.psychiatrist_availability USING btree (psychiatrist_id);


--
-- TOC entry 5086 (class 1259 OID 25190)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_refresh_tokens_token ON calmconnect.refresh_tokens USING btree (token);


--
-- TOC entry 5062 (class 1259 OID 25037)
-- Name: idx_reports_status; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_reports_status ON calmconnect.reports USING btree (status);


--
-- TOC entry 5063 (class 1259 OID 25038)
-- Name: idx_reports_type; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_reports_type ON calmconnect.reports USING btree (type);


--
-- TOC entry 5044 (class 1259 OID 16965)
-- Name: idx_user_activity_logs_timestamp; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_timestamp ON calmconnect.user_activity_logs USING btree ("timestamp");


--
-- TOC entry 5045 (class 1259 OID 16966)
-- Name: idx_user_activity_logs_user_id; Type: INDEX; Schema: calmconnect; Owner: postgres
--

CREATE INDEX idx_user_activity_logs_user_id ON calmconnect.user_activity_logs USING btree (user_id);


--
-- TOC entry 5091 (class 2606 OID 16967)
-- Name: appointments appointments_patient_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.appointments
    ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5092 (class 2606 OID 16972)
-- Name: appointments appointments_psychiatrist_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.appointments
    ADD CONSTRAINT appointments_psychiatrist_id_fkey FOREIGN KEY (psychiatrist_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5093 (class 2606 OID 16977)
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES calmconnect.chat_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 16982)
-- Name: chat_sessions chat_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.chat_sessions
    ADD CONSTRAINT chat_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5095 (class 2606 OID 16987)
-- Name: completed_exercises completed_exercises_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.completed_exercises
    ADD CONSTRAINT completed_exercises_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5096 (class 2606 OID 16992)
-- Name: conversation_participants conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversation_participants
    ADD CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES calmconnect.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 16997)
-- Name: conversation_participants conversation_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.conversation_participants
    ADD CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 17002)
-- Name: direct_messages direct_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.direct_messages
    ADD CONSTRAINT direct_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES calmconnect.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5099 (class 2606 OID 17007)
-- Name: direct_messages direct_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.direct_messages
    ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5105 (class 2606 OID 25011)
-- Name: feedback fk_feedback_appointment; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.feedback
    ADD CONSTRAINT fk_feedback_appointment FOREIGN KEY (appointment_id) REFERENCES calmconnect.appointments(id) ON DELETE SET NULL;


--
-- TOC entry 5106 (class 2606 OID 25006)
-- Name: feedback fk_feedback_user; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.feedback
    ADD CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 25032)
-- Name: reports fk_reports_user; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.reports
    ADD CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5113 (class 2606 OID 25157)
-- Name: forum_comments forum_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_comments
    ADD CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES calmconnect.forum_posts(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 25162)
-- Name: forum_comments forum_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_comments
    ADD CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5112 (class 2606 OID 25138)
-- Name: forum_posts forum_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.forum_posts
    ADD CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 17012)
-- Name: journal_entries journal_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.journal_entries
    ADD CONSTRAINT journal_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5101 (class 2606 OID 17017)
-- Name: mood_entries mood_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.mood_entries
    ADD CONSTRAINT mood_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 24985)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 25051)
-- Name: psychiatrist_availability psychiatrist_availability_psychiatrist_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.psychiatrist_availability
    ADD CONSTRAINT psychiatrist_availability_psychiatrist_id_fkey FOREIGN KEY (psychiatrist_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5115 (class 2606 OID 25185)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5102 (class 2606 OID 17022)
-- Name: thought_records thought_records_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.thought_records
    ADD CONSTRAINT thought_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5103 (class 2606 OID 17027)
-- Name: user_activity_logs user_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_activity_logs
    ADD CONSTRAINT user_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5110 (class 2606 OID 25098)
-- Name: user_badges user_badges_badge_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_badges
    ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES calmconnect.badges(id) ON DELETE CASCADE;


--
-- TOC entry 5111 (class 2606 OID 25093)
-- Name: user_badges user_badges_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


--
-- TOC entry 5109 (class 2606 OID 25068)
-- Name: user_streaks user_streaks_user_id_fkey; Type: FK CONSTRAINT; Schema: calmconnect; Owner: postgres
--

ALTER TABLE ONLY calmconnect.user_streaks
    ADD CONSTRAINT user_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES calmconnect.users(id) ON DELETE CASCADE;


-- Completed on 2026-05-24 17:52:09

--
-- PostgreSQL database dump complete
--

\unrestrict hH1Atpa8KjrGS8h6wLiKz40rFT2sXHPEsVKzvxLOPYb7JAUr9BUg2LPgkXEeOyQ

