# CalmConnect AI - Full-Stack Mental Health Companion

CalmConnect AI is an empathetic, enterprise-grade, full-stack mental health and wellness platform designed to bridge the gap between AI-driven self-care and professional clinical support. The platform provides patients with real-time AI counseling, structured wellness tracking, and secure direct consultation channels with licensed psychiatrists, all backed by an administrative auditing dashboard.

---

## ✨ Core Platforms & Capabilites

### 1. Patient Wellness Engine
*   **Empathetic AI Companion**: A conversational assistant powered by the official `@google/genai` SDK. Supports continuous dialogue, context-aware advice, and cognitive-behavioral insights.
*   **Mood Journal & Analytics**: Log daily emotional spectrums (1-5 scale) with details, mapping progression trends over time with visual chart widgets built using `Recharts`.
*   **CBT Toolkit (Cognitive Behavioral Therapy)**:
    *   **Thought Records**: A guided, multi-step structural framework to challenge, reframe, and deconstruct negative automatic patterns.
    *   **Interactive Exercises**: A multimedia guided library for deep breathing, muscle relaxation, and mindfulness, complete with a countdown player.
    *   **AI-Generated Prompts**: Real-time personalized reflection cues synthesized by Google Gemini based on the user's ongoing conversation logs and mood records.
*   **Streaks & Achievements**: Tracks consistent engagement with an automatic daily streak engine, awarding special recognition badges (e.g. *Wellness Pioneer*, *Reflection Master*).
*   **Community Forums**: Secure, optional anonymous forums where users can share wellness questions, answer posts, and read supportive comments.
*   **Transactional Notifications**: Alerts for messaging receipts, appointment statuses, and daily wellness notifications.
*   **Crisis Safety Railings**: A persistent, highly visible emergency banner rendering immediate national hotline resources and local clinical coordinates.

### 2. Psychiatrist Clinical Hub
*   **Relationship Directory**: An intuitive interface listing assigned patient clinical profiles and logs.
*   **Calendar & Appointment Scheduling**: Manage patient consultations, request appointments, list pending check-ins, and mark diagnostic sessions as completed or canceled.
*   **Outbound Messaging Gateways**: Initiate secure direct messaging threads with active individuals.

### 3. Administrative Control Panel
*   **Practitioner Registry**: Secure onboarding procedures to verify, register, and activate licensed psychiatrists.
*   **Site Telemetry Logs**: Historical security audits displaying system access milestones, such as successful authorizations and logs of user activities.
*   **User State Administration**: Access to block, unblock, or review pending accounts.
*   **Report & Feedback Triage**: View feedback submissions, review user safety alerts or reports, and change their statuses (e.g. *resolved*, *pending*).
*   **Secure Account Purging**: Execute patient-initiated account deletion protocols after reviewing background details.

---

## 🚀 Technical Stack & Architecture

### Frontend
*   **Runtime Environment**: React 19 with Vite
*   **Type Safety**: TypeScript 5+
*   **Visual Styling**: Tailwind CSS (Utility-first, fluid layout)
*   **Interactive Transitions**: Framer Motion (Micro-interactions, staggered fade-in animations)
*   **Data Visualization**: Recharts (Modern SVG-rendered mood analytics)
*   **Asset Icons**: Lucide React

### Backend
*   **Server Framework**: Node.js & Express
*   **Persistent Storage**: PostgreSQL (Configured with connection pool capabilities via `pg`)
*   **Authentication & Security**: Stateful JSON Web Tokens (JWT) & bcrypt.js cryptography
*   **AI Integrations**: Server-side Google Gemini models (`gemini-2.5-flash`) for chat, feedback assessment, and personalized prompt generation.
*   **Transactional Emailing**: Nodemailer with SMTP integration for confirmation codes, password resets, and appointment updates.

---

## 📂 Repository File Tree

```
├── /                       # Client-side SPA Workspace
│   ├── src/
│   │   ├── components/     # Modulized UI assets and components
│   │   │   ├── admin/      # Activity auditing, User management, Feedback widgets
│   │   │   ├── appointments/# Consultation organizers & Modals
│   │   │   ├── dashboards/ # Custom Patient, Specialist, and Admin views
│   │   │   └── ...         # Shell architecture and features
│   │   ├── data/           # Offline datasets (breathing exercises)
│   │   ├── hooks/          # Domain hooks (theme switching, local storage)
│   │   ├── types.ts        # Shared TypeScript interfaces & types
│   │   ├── App.tsx         # Main router and controller wrapper
│   │   └── index.tsx       # Entry point
│   ├── package.json        
│   └── vite.config.ts      
│
└── /backend                # Express API Backend Workspace
    ├── src/
    │   ├── api/            # Router configurations and endpoint divisions
    │   ├── controllers/    # API controllers
    │   ├── middleware/     # JWT Authorization protocols
    │   ├── services/       # Core business logic (Gemini, Mail, Postgres setup)
    │   └── index.js        # Main startup script
    └── package.json        
```

---

## 🏁 Installation & Development Build Setup

### Prerequisites
*   **Node.js**: `v18.0.0` or higher
*   **npm**: `v9.0.0` or higher
*   **PostgreSQL**: A running instance (local, Docker, or managed cloud instance)

---

### Step 1: Backend Database & Environment Configuration

Navigate to the `/backend` directory and install the server-side dependencies:
```bash
cd backend
npm install
```

Configure your environment. Create a `.env` file within the `/backend` folder using the model below:

```env
# Server Ingress Port
PORT=3001

# PostgreSQL Storage Connection String
DATABASE_URL="postgresql://user:password@host:5432/calmconnect"

# Cryptographic Token Signer
JWT_SECRET="generate_a_secure_long_random_string_here"
JWT_EXPIRES_IN="7d"

# Google Gemini API Credentials
API_KEY="AIzaSyYourGeminiApiKeyHere"

# Nodemailer Outbound SMTP Settings (Verification & Password Resets)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="smtp_username_here"
SMTP_PASS="smtp_password_here"
EMAIL_FROM='"CalmConnect AI" <noreply@calmconnect.ai>'

# Core Frontend Address (used in registration email verification hyperlinks)
FRONTEND_URL="http://localhost:3000"
```

#### Self-Initializing Database Schema
The SQL database is configured to **initialize and update automatically** when the backend starts.
Upon server boot, `/backend/src/services/initDb.js` runs queries to:
1. Generate key tables if they do not yet exist (`user_streaks`, `badges`, `user_badges`, `daily_quotes`, `feedback`, `reports`, `forum_posts`, `forum_comments`, etc.).
2. Inject system badges such as `First Reflection` (`first_journal`), `Consistency Starter` (`streak_3`), `Week of Wellness` (`streak_7`), and *Mindful Navigator* (`cbt_master`).
3. Seed daily wisdom and motivational quotes automatically.
4. Dynamically append user profile adjustments (age, emergency contact fields, specialization tags, qualifications).

To start the backend development server with hot-reloading:
```bash
npm run dev
```
The server will bind to `http://localhost:3001`.

---

### Step 2: Frontend Client Configuration

Return to the root workspace directory and install the React packages:
```bash
cd ..
npm install
```

You do not need many configurations for the client; the application relies on the backend route proxy for secret management. Create an environmental config file `.env` in the root folder to supply client-specific values:

```env
# Exposed client keys (Optional client-direct fallback configurations)
VITE_GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

Start the Vite client development engine:
```bash
npm run dev
```
The frontend is built to run on `http://localhost:3000`.

---

## 📖 Complete API Route Index

All REST routes are prefixed by `/api`. Headers must submit a valid `Authorization: Bearer <JWT_TOKEN>` header once logged in.

### 🔑 Authorization (`/api/auth`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `POST` | `/register` | Public | Submits entry form parameters to register a patient. Writes database profile and fires confirmation email. |
| `POST` | `/login` | Public | Validates login and hands back a session JWT. |
| `POST` | `/refresh` | Public | Exchanges a valid, unexpired database-stored refresh token for a newly-minted JWT access token. |
| `GET` | `/verify-email` | Public | Validates a verification token and activates the account. |
| `POST` | `/resend-verification` | Public | Regenerates and resends user activation links. |
| `POST` | `/forgot-password` | Public | Sends a secure password recovery message. |
| `POST` | `/reset-password` | Public | Sets a new secure user password based on a recovery token. |
| `POST` | `/logout` | Auth | Securely ends active user sessions. |

### 👤 User Services (`/api/users`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/` | Auth | Recovers active database directory lists. |
| `GET` | `/me` | Auth | Fetches full info of the active user profile. |
| `PUT` | `/me` | Auth | Modifies settings, details, or password credentials. |
| `POST` | `/me/request-deletion` | Auth | Requests permanent profile deletion and queues for review. |
| `POST` | `/psychiatrist` | Admin | Onboards a qualified practitioner. |
| `PUT` | `/:id/status` | Admin | Restricts or reactivates specific accounts. |
| `DELETE` | `/:id` | Admin | Purges user database records entirely. |
| `GET` | `/activity-logs` | Admin | Fetches administrative login and audit trails. |

### 💬 AI Companion Chat (`/api/chat`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/sessions` | Auth (Patient) | Returns historic AI conversation lists. |
| `POST` | `/sessions` | Auth (Patient) | Instantiates a conversation and fetches the initial AI response. |
| `PUT` | `/sessions/:sessionId` | Auth (Patient) | Renames an existing chat session. |
| `DELETE` | `/sessions/:sessionId` | Auth (Patient) | Deletes a conversation session. |
| `POST` | `/sessions/:sessionId/messages` | Auth (Patient) | Appends messages to a conversation and queries Gemini. |
| `PUT` | `/messages/:messageId/feedback` | Auth (Patient) | Submits feedback on AI answers (likes/dislikes). |

### 📅 Consultation Management (`/api/appointments`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/` | Auth | Retrieves scheduled consulting history. |
| `POST` | `/` | Psychiatrist | Coordinates and schedules consult sessions. |
| `PUT` | `/:id/cancel` | Auth (Participants) | Cancels upcoming consultations. |
| `PUT` | `/:id/complete` | Auth (Participants) | Marks an appointment as completed. |
| `PUT` | `/seen` | Auth (Patient) | Clears new appointment alerts. |

### 🔔 Notifications Panel (`/api/notifications`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/` | Auth | Fetches inbox reminders and receipts. |
| `POST` | `/:id/read` | Auth | Marks a specific notification as read. |
| `POST` | `/read-all` | Auth | Marks all notifications as read. |
| `DELETE` | `/:id` | Auth | Deletes a notification. |

### ✉️ Direct Messages (`/api/conversations`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/` | Auth | Lists all current direct consultations. |
| `POST` | `/messages` | Auth | Dispatches messages to clinicians or patients. |
| `PUT` | `/:conversationId/read` | Auth | Updates message thread receipts. |

### 🛠️ Wellness Toolkit (`/api/mood`, `/api/journal`, `/api/cbt`, `/api/feedback`, `/api/reports`)
| Method | Route | Access | Purpose |
|:---|:---|:---|:---|
| `GET` | `/mood` | Auth | Fetches emotional logs. |
| `POST` | `/mood` | Auth | Inserts current mood registers. |
| `GET` | `/journal` | Auth | Retrieves private journal logs. |
| `POST` | `/journal` | Auth | Inserts new diary notes. |
| `PUT` | `/journal/:id` | Auth | Updates past entries. |
| `DELETE` | `/journal/:id` | Auth | Deletes journal articles. |
| `GET` | `/cbt/thoughts` | Auth | Fetches completed CBT thought records. |
| `POST` | `/cbt/thoughts` | Auth | Inserts a new thought Challenger loop record. |
| `PUT` | `/cbt/thoughts/:id` | Auth | Modifies existing CBT reports. |
| `DELETE` | `/cbt/thoughts/:id` | Auth | Deletes a CBT entry. |
| `POST` | `/cbt/journal-prompt` | Auth | Generates a custom writing prompt with Gemini. |
| `POST` | `/feedback` | Auth | Submits system feedback logs. |
| `GET` | `/feedback` | Admin | Fetches user satisfaction inputs. |
| `POST` | `/reports` | Auth | Files support warnings or system issues. |
| `GET` | `/reports` | Admin | Audits unresolved report tickets. |
| `PUT` | `/reports/:id/status` | Admin | Resolves filed tickets. |



---

## 🔐 Access Token & Refresh Token Flow

This application is equipped with a highly secure status-aware Token Rotation refresh mechanism:
- **Access Tokens (JWT)**: Short-lived tokens (expires in `15m` by default, customizable via `JWT_EXPIRES_IN`) stored in the client's `localStorage` for authenticating daily API transactions.
- **Refresh Tokens (Opaque Cryptographic)**: Long-lived tokens (valid for `7 days` / 168 hours) stored securely in the PostgreSQL database within the `calmconnect.refresh_tokens` table. They are exchanged seamlessly under the hood when access tokens expire.

### 🛡️ Why we do NOT need an Environment Variable for the Refresh Token
A typical environment variable like `JWT_SECRET` is used for **stateless signing & verification** of JWT access tokens. However, **Refresh Tokens** do not need a cryptographic environment signature key because:
1. They are generated as **opaque, highly secure, cryptographically random strings** (`crypto.randomBytes(40).toString('hex')`) instead of JWT structures.
2. They are verified through **database lookups** rather than cryptographic signatures.
3. This is **immensely more secure**: If a user is blocked or deletes their account, the server can instantly delete their refresh tokens from the database, immediately invalidating any malicious session—a feat impossible with stateless signed tokens.

---

### 🗄️ Database Schema: Creating the `refresh_tokens` Table
To instantiate the required table under the `calmconnect` schema manually, run the following SQL query:

```sql
-- Schema Scope: calmconnect
CREATE TABLE IF NOT EXISTS calmconnect.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES calmconnect.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> 💡 **Note**: In development mode or fresh database initializations, the application's self-bootstrapping database service (`/backend/src/services/initDb.js`) will automatically provision this SQL schema if it doesn't already exist.

---

### ⚙️ Environment Variables `.env` Setup
Ensure your `/backend/.env` contains the access token expiration flag:

```env
# Cryptographic Token Signer
JWT_SECRET="generate_a_secure_long_random_string_here"
JWT_EXPIRES_IN="15m"                           # Access Token (short-lived, stored in localStorage)
```

---

### 🔄 How Authenticated Requests Work (Step-by-Step)

Here is exactly how the access and refresh token logic coordinates under the hood:

```
[ Frontend Client ]                                             [ Express API & DB ]
        |                                                                |
        |--- (1) POST /api/auth/login ---------------------------------->|
        |<-- (2) JSON: { token (15m), refreshToken (7d), user } ---------|  <-- Inserts Refresh Token in DB
        |                                                                |
        |--- (3) GET /api/mood (with Authorization: Bearer token) ------>|
        |<-- (4) HTTP 200: Mood Logs ------------------------------------|  <-- Valid access token
        |                                                                |
 [15 minutes pass...]                                                    |
        |                                                                |
        |--- (5) GET /api/mood (with Authorization: Bearer token) ------>|
        |<-- (6) HTTP 401: Unauthorized/Expired -------------------------|  <-- Token rejected
        |                                                                |
        |--- (7) POST /api/auth/refresh (Body: { refreshToken }) ------->|  <-- Automatically intercept 401
        |                                                                |   * database lookup & validity verify
        |                                                                |   * account blocked state validation
        |                                                                |   * rotate & invalidate old token
        |<-- (8) HTTP 200: { token (new 15m), refreshToken (new 7d) } ---|  <-- Registers new tokens
        |                                                                |
        |--- (9) Retry: GET /api/mood (with new token) ----------------->|
        |<-- (10) HTTP 200: Mood Logs -----------------------------------|  <-- Transparent to the end-user!
```

1. **User Login**: The user authenticates at `/api/auth/login`. The server verifies user credentials, generates a new JWT token valid for 15 minutes, creates a cryptographically secure random 40-byte hex refresh token valid for 7 days, stores the refresh token alongside the `user_id` inside PostgreSQL, and delivers everything to the frontend.
2. **Local Storage Persistence**: The frontend client receives the package and securely holds both tokens in standard browser `localStorage`.
3. **Daily Requests**: For every API call, the client's `apiFetch` helper injects the JWT access token in the standard HTTP `Authorization` header.
4. **Expirations**: If an API call comes back with a `401 Unauthorized` response due to an expired access token, the client's network layer automatically intercepts the error.
5. **Background Token Refresh**: The client executes a background POST request to `/api/auth/refresh` submitting the stored `refreshToken`.
6. **Token Verification & Rotation (Replay Attack Prevention)**: 
   * The server queries the database for the submitted token.
   * If found and unexpired, the server verifies that the associated user's account status is currently active (not blocked).
   * To prevent any prospective replay attacks, **Token Rotation** is performed: the old refresh token is physically deleted, a fresh 7-day refresh token is written to PostgreSQL, a fresh 15-minute access token is minted, and both are sent back to the client.
7. **Transparent Resilience**: The client stores the updated credentials in `localStorage` and retries the original failed user request instantly. Perfect security, Zero user friction!
8. **Logout**: When the user explicitly logs out, both client-side storage keys are cleared and the backend promptly purges the refresh token record from the database to ensure session termination.

### ⏱️ Token Lifespan Overview
| Token Type | Value Style | Kept In | Lifespan | Verification Mode | Revocation Speed |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Access Token** | JWT | Local Storage | **15 Minutes** | Cryptographic signature decryption checking | Instant once expired (15 min) |
| **Refresh Token** | Opaque Hex | DB & Local Storage | **7 Days** | Full database lookup & expiry stamp calculation | **Immediate (Real-Time)** on backend delete |

---

## 🛡️ Trust & Verification Loops

CalmConnect AI treats user safety and mental privacy with great care. All patient registration entries require validation through Nodemailer token verification endpoints (`/verify-email`) before profile features are unlocked. The built-in emergency mechanics feature automated warning panels with accessible safety lines that are easy to consult during times of crisis.

---

## 📄 License

This repository is distributed under the guidelines of the **MIT License**.
