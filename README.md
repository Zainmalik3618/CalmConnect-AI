# CalmConnect AI

CalmConnect AI is a full-stack mental health and wellness platform that combines AI-supported self-care, mood and journal tracking, CBT tools, appointment management, direct messaging, community support, and administrator controls.

The repository is organized as two separate workspaces:

- `Frontend` - React 19, TypeScript, and Vite single-page application.
- `Backend` - Node.js, Express, PostgreSQL, Gemini, authentication, email, and REST API services.

> CalmConnect AI is a support and wellness tool. It is not a substitute for emergency care, diagnosis, or treatment from a qualified mental health professional.

## Features

### Patient Experience

- AI mental health companion powered through Google Gemini.
- Mood tracker with mood history and charting.
- Private journaling and AI-assisted journal prompts.
- CBT thought records for reframing negative thoughts.
- Guided exercises for breathing, mindfulness, and relaxation.
- Appointment tracking with psychiatrists.
- Direct patient-psychiatrist messaging.
- Notifications for messages, appointments, and account events.
- Community forum posts and comments.
- Emergency support banner with Pakistan-focused crisis resources.

### Psychiatrist Experience

- Psychiatrist dashboard.
- Patient profile access.
- Appointment scheduling and status updates.
- Direct messaging with patients.

### Admin Experience

- Admin dashboard.
- User management.
- Psychiatrist onboarding.
- Activity logs.
- Feedback dashboard.
- Report review and status management.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Framer Motion / Motion
- Recharts
- Lucide React
- Axios

### Backend

- Node.js
- Express
- PostgreSQL with `pg`
- JWT authentication
- bcrypt password hashing
- Nodemailer SMTP email
- Google Gemini via `@google/genai`
- Nodemon for development

## Current Directory Structure

```text
CalmConnect AI/
|-- README.md
|-- .gitignore
|-- Backend/
|   |-- package.json
|   |-- package-lock.json
|   |-- schema.sql
|   `-- src/
|       |-- index.js
|       |-- app.js
|       |-- api/
|       |   |-- index.js
|       |   |-- appointmentRoutes.js
|       |   |-- authRoutes.js
|       |   |-- cbtRoutes.js
|       |   |-- chatRoutes.js
|       |   |-- conversationRoutes.js
|       |   |-- feedbackRoutes.js
|       |   |-- forumRoutes.js
|       |   |-- journalRoutes.js
|       |   |-- moodRoutes.js
|       |   |-- motivationRoutes.js
|       |   |-- notificationRoutes.js
|       |   |-- reportRoutes.js
|       |   `-- userRoutes.js
|       |-- controllers/
|       |   |-- appointmentController.js
|       |   |-- authController.js
|       |   |-- cbtController.js
|       |   |-- chatController.js
|       |   |-- conversationController.js
|       |   |-- feedbackController.js
|       |   |-- forumController.js
|       |   |-- journalController.js
|       |   |-- moodController.js
|       |   |-- motivationController.js
|       |   |-- notificationController.js
|       |   |-- reportController.js
|       |   `-- userController.js
|       |-- middleware/
|       |   `-- auth.js
|       `-- services/
|           |-- cryptoService.js
|           |-- db.js
|           |-- emailService.js
|           |-- geminiService.js
|           |-- initDb.js
|           `-- motivationService.js
`-- Frontend/
    |-- package.json
    |-- package-lock.json
    |-- index.html
    |-- index.tsx
    |-- App.tsx
    |-- types.ts
    |-- vite.config.ts
    |-- tsconfig.json
    |-- metadata.json
    |-- public/
    |   `-- logo.svg
    |-- components/
    |   |-- admin/
    |   |-- appointments/
    |   |-- dashboards/
    |   |-- AuthView.tsx
    |   |-- CbtView.tsx
    |   |-- ChatView.tsx
    |   |-- EmergencyBanner.tsx
    |   |-- ForumView.tsx
    |   |-- GuidedExercisesView.tsx
    |   |-- JournalView.tsx
    |   |-- Layout.tsx
    |   |-- MessagingView.tsx
    |   |-- MoodTrackerView.tsx
    |   |-- NotificationsView.tsx
    |   |-- OnboardingView.tsx
    |   |-- ProfileView.tsx
    |   |-- ResetPasswordView.tsx
    |   |-- Sidebar.tsx
    |   |-- ThemeToggle.tsx
    |   `-- VerificationView.tsx
    |-- data/
    |   |-- exercises.ts
    |   `-- seed.ts
    |-- hooks/
    |   |-- useLocalStorage.ts
    |   `-- useTheme.ts
    `-- utils/
        |-- password.ts
        `-- validation.ts
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- Google Gemini API key
- SMTP account for verification, reset, and notification emails

## Backend Setup

Open a terminal in the backend workspace:

```bash
cd "CalmConnect AI/Backend"
npm install
```

Create `Backend/.env`:

```env
PORT=3001
DATABASE_URL="postgresql://user:password@host:5432/calmconnect"

JWT_SECRET="replace_with_a_long_random_secret"
JWT_EXPIRES_IN="15m"

API_KEY="your_google_gemini_api_key"

SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="smtp_username"
SMTP_PASS="smtp_password"
EMAIL_FROM='"CalmConnect AI" <noreply@calmconnect.ai>'

FRONTEND_URL="http://localhost:3000"
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:3001
```

The backend calls `src/services/initDb.js` on startup to initialize required database objects and seed application data.

## Frontend Setup

Open a second terminal in the frontend workspace:

```bash
cd "CalmConnect AI/Frontend"
npm install
```

Create `Frontend/.env` if you want the Vite client to expose a Gemini key through the current Vite config:

```env
GEMINI_API_KEY="your_google_gemini_api_key"
```

Start the frontend:

```bash
npm run dev
```

The Vite app runs at:

```text
http://localhost:3000
```

## Available Scripts

### Backend

```bash
npm run dev     # Start Express with nodemon
npm start       # Start Express with node
```

### Frontend

```bash
npm run dev     # Start Vite development server
npm run build   # Build production assets
npm run preview # Preview the production build
npm run lint    # Run TypeScript checks
```

## API Overview

All backend routes are mounted under `/api`.

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Register, login, refresh token, email verification, password reset, logout |
| `/api/users` | Current user profile, user administration, psychiatrist creation, activity logs |
| `/api/mood` | Mood entry creation and history |
| `/api/journal` | Private journal entries |
| `/api/cbt` | CBT thought records and AI journal prompts |
| `/api/chat` | AI companion chat sessions and messages |
| `/api/conversations` | Direct patient-psychiatrist conversations |
| `/api/appointments` | Appointment creation, cancellation, completion, and seen state |
| `/api/notifications` | Notification listing, read state, and deletion |
| `/api/feedback` | User feedback and admin feedback review |
| `/api/reports` | User reports and admin report status updates |
| `/api/motivation` | Motivational content |
| `/api/forum` | Forum posts and comments |

Authenticated endpoints expect:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Authentication Flow

The backend uses short-lived JWT access tokens and database-backed opaque refresh tokens.

1. User logs in through `/api/auth/login`.
2. Backend returns an access token, refresh token, and user payload.
3. Frontend sends the access token in the `Authorization` header.
4. If the access token expires, `/api/auth/refresh` can exchange a valid refresh token for a new token pair.
5. Refresh tokens are stored in PostgreSQL so sessions can be invalidated when a user logs out, is blocked, or deletes the account.

## Database Notes

The backend uses `DATABASE_URL` through `Backend/src/services/db.js`.

The repository also includes:

```text
Backend/schema.sql
```

Use this file as the manual database reference if you need to inspect or create schema objects outside the automatic initialization flow.

## License

This project is distributed under the MIT License.
