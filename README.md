<div align="center">

<img src="screenshots/logo.png" alt="Male Parikshan Logo" width="120" height="120" />

# 🔵 Male Parikshan
### *India's First Dedicated Men's Health & Wellness Platform*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Built for India Innovates 2026 · KIIT University, Bhubaneswar**

[Features](#-features) · [Screenshots](#-screenshots) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API Docs](#-api-reference) · [Research Basis](#-research-basis)

---

> *72% of suicides in India are male — yet men are the least likely to seek help.*
> **Male Parikshan** breaks the silence. A stigma-free, research-backed digital space for Indian men to track their mood, build wellness habits, and access honest health education.

</div>

---

## 🧭 Table of Contents

- [Why Male Parikshan?](#-why-male-parikshan)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Dual Mode System](#-dual-mode-system)
- [Research Basis](#-research-basis)
- [Team](#-team)

---

## 💡 Why Male Parikshan?

Indian men face a unique mental health crisis — one that is largely invisible:

- **NCRB 2022**: 72.5% of all suicide victims in India are male
- **Restrictive Emotionality**: The cultural "man up" mindset actively discourages men from expressing or seeking help for emotional pain
- **Zero dedicated platforms**: Every existing mental health app in India is either gender-neutral or targeted at women
- **Privacy gap**: Men report extreme reluctance to seek help in person — a private digital space is the only viable entry point

**Male Parikshan** is designed from the ground up around how Indian men actually think, feel, and communicate — with male-centric vocabulary, streak-based habit formation, and a consent-first approach to sensitive education.

---

## ✨ Features

### 🔐 Authentication & Onboarding
- JWT-based stateless authentication (login / register)
- Guest Mode — zero friction, no account required to explore
- Onboarding health profile: age, height, weight, fitness goal, health conditions
- `bcrypt` password hashing · `ProtectedRoute` guards on all sensitive pages

### 📊 Dashboard
- Personalized greeting with streak status
- Live mood trend chart (Recharts bar graph — last 7 days)
- Mood distribution pie chart
- Quick-action cards to all modules
- At-a-glance health stats from onboarding profile

### 🔥 Streak Tracker
- Daily wellness check-in with a single tap
- 4 check-in options: `completed` · `partial` · `rest_day` · `missed`
- Visual streak calendar — colour-coded by day type
- **Relapse recovery built in** — the streak doesn't punish you, it recovers with you
- Longest streak record · current streak counter

### 🧠 Mood Logger
- 5 male-centric mood types: **Calm · Confident · Neutral · Low · Angry**
- Daily mood log with optional notes
- 7-day history view with intensity indicators
- Mood trend visualization feeding into Dashboard charts

### 📚 Knowledge Hub (Flash Cards)
- **36 research-backed modules** — swipeable flash card format
- Organized categories: Mental Health · Physical Health · Sexual Health · Relationships · Consent
- **Text-to-Speech** on every card (Web Speech API, `en-IN` locale)
- Mark as Read · Save to Favourites
- Module progress tracking per user

### 💬 AI Health Chat
- Real-time Q&A on men's health topics
- Context-aware responses grounded in the module knowledge base
- Private and non-judgmental — no data shared externally

### 🔞 Adult Mode *(Age 18+ · Consent-Required)*
- Consent gate with explicit age verification (18+) on every session
- Server-side enforcement: `adultModeEnabled` + `consentAccepted` checked on every Adult route
- 18 additional modules covering sexual health, consent, and relationships — frankly and responsibly
- Entire app theme shifts to a distinct red palette (CSS variable switch) to clearly signal the mode change

---

## 📸 Screenshots

> 📌 *Replace placeholder paths below with actual screenshots from your running app.*

### Landing & Authentication

| Login | Register |
|-------|----------|
| ![Login Page](screenshots/login.png) | ![Register Page](screenshots/register.png) |

### Onboarding

| Step 1 — Basic Info | Step 2 — Health Profile |
|---------------------|------------------------|
| ![Onboarding Step 1](screenshots/onboarding-1.png) | ![Onboarding Step 2](screenshots/onboarding-2.png) |

### Dashboard

| Normal Mode | Adult Mode (Red Theme) |
|-------------|----------------------|
| ![Dashboard Normal](screenshots/dashboard-normal.png) | ![Dashboard Adult](screenshots/dashboard-adult.png) |

### Streak Tracker

| Streak Calendar | Check-in Modal |
|-----------------|----------------|
| ![Streak Page](screenshots/streak.png) | ![Streak Check-in](screenshots/streak-checkin.png) |

### Mood Logger

| Log Mood | Mood History |
|----------|-------------|
| ![Mood Logger](screenshots/mood-log.png) | ![Mood History](screenshots/mood-history.png) |

### Knowledge Hub

| Module Grid | Flash Card View | Card with TTS Active |
|-------------|-----------------|----------------------|
| ![Modules](screenshots/modules-grid.png) | ![Flash Card](screenshots/flashcard.png) | ![TTS Active](screenshots/flashcard-tts.png) |

### AI Chat

| Chat Interface |
|----------------|
| ![AI Chat](screenshots/chat.png) |

### Adult Mode — Consent Gate

| Consent Screen | Adult Modules |
|----------------|---------------|
| ![Consent Gate](screenshots/adult-consent.png) | ![Adult Modules](screenshots/adult-modules.png) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        WEB BROWSER                              │
│              React 18 SPA · TypeScript · Vite                   │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTP / Axios
┌────────────────────────▼────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  AuthContext · ModeContext · React Router v6 · TailwindCSS      │
│  CSS Variable theme switch · Recharts · Web Speech API          │
│                                                                 │
│  Pages: Dashboard · Modules · Streak · Mood · Chat · Onboarding │
└────────────────────────┬────────────────────────────────────────┘
                         │  Axios (JSON)  ·  res.data.data envelope
┌────────────────────────▼────────────────────────────────────────┐
│                    BACKEND LAYER                                │
│         Node.js + Express + TypeScript  (18 endpoints)          │
│                                                                 │
│  JWT Middleware → Zod Validation → Controller → Prisma Client   │
│  Helmet · CORS · Rate Limiting (100 req / 15 min)               │
│                                                                 │
│  Controllers: Auth · Profile · Streak · Mood · Modules · Chat   │
│               Adult · Dashboard                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │  Prisma ORM (type-safe queries)
┌────────────────────────▼────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│              PostgreSQL 16  ·  Prisma ORM                       │
│                                                                 │
│  User · HealthProfile · Streak · StreakCheckin                  │
│  MoodLog · Module · ModuleProgress · ChatLog                    │
│                                                                 │
│  UUID primary keys · Migration-managed schema · Cascade deletes │
└─────────────────────────────────────────────────────────────────┘

DATA FLOW:
USER → React UI → Axios → Express → Zod → Prisma → PostgreSQL → JSON → UI Update
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | Component UI with full type safety |
| Vite | Lightning-fast dev server + optimized builds |
| TailwindCSS + CSS Variables | Responsive styling + global dual-theme system |
| React Router v6 | Client-side routing + protected routes |
| Axios | HTTP service layer (all API calls) |
| Recharts | Mood bar charts and distribution pie charts |
| Web Speech API | Browser-native TTS for flash cards (`en-IN`) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18+ + Express | REST API server |
| TypeScript 5 | End-to-end type safety |
| JWT + bcrypt | Stateless auth + secure password storage |
| Zod | Runtime schema validation on all request bodies |
| Helmet | HTTP security headers |
| CORS | Cross-origin request control |
| Rate Limiting | 100 requests per 15 minutes per IP |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL 16 | Relational database |
| Prisma ORM | Type-safe schema + migrations + client |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16 (running locally)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/your-username/male-parikshan.git
cd male-parikshan
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/male_parikshan"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

Run database migrations and seed:

```bash
npx prisma migrate dev --name init
npm run seed
```

> **Seed data**: Creates 18 standard modules + 18 adult modules (36 total) with full content.

Start the backend server:

```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
# App running on http://localhost:5173
```

### 4. Open in browser

Navigate to `http://localhost:5173` — you'll land on the login page.

**Quick start**: Click **"Continue as Guest"** to explore without an account, or register a new account to unlock full features including streak tracking and mood logging.

---

## 📁 Project Structure

```
male-parikshan/
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # JWT auth state + login/logout
│   │   │   └── ModeContext.tsx       # Normal/Adult mode toggle (global)
│   │   ├── routes/
│   │   │   ├── Dashboard.tsx         # Home with charts + streak summary
│   │   │   ├── ModulesPage.tsx       # Flash card knowledge hub
│   │   │   ├── StreakPage.tsx        # Daily check-in + streak calendar
│   │   │   ├── MoodPage.tsx          # Mood logging + 7-day history
│   │   │   ├── ChatPage.tsx          # AI health chat interface
│   │   │   └── OnboardingPage.tsx    # Health profile setup wizard
│   │   ├── services/
│   │   │   ├── auth.ts               # Login, register, guest APIs
│   │   │   ├── streak.ts             # Streak + check-in APIs
│   │   │   ├── mood.ts               # Mood log APIs
│   │   │   ├── modules.ts            # Flash card + progress APIs
│   │   │   └── chat.ts               # AI chat APIs
│   │   ├── components/
│   │   │   ├── AppLayout.tsx         # Sidebar nav + mode toggle
│   │   │   └── AppRouter.tsx         # Route config + ProtectedRoute
│   │   ├── index.css                 # CSS variables (normal + adult themes)
│   │   └── main.tsx                  # Provider hierarchy
│   └── tailwind.config.js            # Custom design tokens
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts     # Register, login, guest
│   │   │   ├── streakController.ts   # Streak + check-in CRUD
│   │   │   ├── moodController.ts     # Mood log CRUD
│   │   │   ├── modulesController.ts  # Flash cards + progress
│   │   │   ├── chatController.ts     # AI chat handling
│   │   │   ├── adultController.ts    # Adult mode consent + modules
│   │   │   ├── dashboardController.ts# Aggregated stats
│   │   │   └── profileController.ts  # Health profile CRUD
│   │   ├── middleware/
│   │   │   ├── auth.ts               # JWT verification middleware
│   │   │   └── validate.ts           # Zod request validator
│   │   ├── routes/                   # Express route definitions
│   │   └── index.ts                  # Server entry + middleware setup
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (8 models)
│   │   └── seed.ts                   # Seeds 36 modules + sample data
│   └── .env                          # Environment config (not committed)
│
└── README.md
```

---

## 📡 API Reference

All responses follow a standard envelope:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

> On the frontend, response data is accessed via `res.data.data`.

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Create new account |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `POST` | `/api/auth/guest` | ❌ | Create guest session |
| `GET` | `/api/auth/me` | ✅ | Get current user |

### Health Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/profile` | ✅ | Create/update health profile |
| `GET` | `/api/profile` | ✅ | Get health profile |

### Streak

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/streak` | ✅ | Get streak + checkin history |
| `POST` | `/api/streak/checkin` | ✅ | Submit daily check-in |

**Check-in body:**
```json
{
  "option": "completed"   // "completed" | "partial" | "rest_day" | "missed"
}
```

### Mood

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/mood` | ✅ | Log today's mood |
| `GET` | `/api/mood` | ✅ | Get mood history (7 days) |
| `GET` | `/api/mood/distribution` | ✅ | Mood distribution for pie chart |

**Mood types:** `calm` · `confident` · `neutral` · `low` · `angry`

### Modules (Flash Cards)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/modules` | ✅ | Get all standard modules |
| `GET` | `/api/modules/:id` | ✅ | Get single module |
| `POST` | `/api/modules/:id/progress` | ✅ | Mark module read/saved |

### Adult Mode

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/adult/enable` | ✅ | Enable adult mode (age + consent check) |
| `GET` | `/api/adult/modules` | ✅ | Get adult modules (requires consent) |
| `POST` | `/api/adult/disable` | ✅ | Disable adult mode |

### Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dashboard` | ✅ | Aggregated stats + recent activity |

### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/chat` | ✅ | Send message, get AI response |
| `GET` | `/api/chat/history` | ✅ | Get chat history |

---

## 🎨 Dual Mode System

One of Male Parikshan's signature features — the entire app switches theme with a single toggle, **without a page reload**.

### How it works

```
ModeContext (React Context)
        │
        ▼
document.documentElement.setAttribute('data-mode', 'adult')
        │
        ▼
CSS: [data-mode="adult"] { --accent: #EF4444; --accent-dim: #B91C1C; ... }
[data-mode="normal"]     { --accent: #E86C2F; --accent-dim: #C2500A; ... }
        │
        ▼
All components use var(--accent), var(--surface), var(--border) etc.
Result: 400ms smooth CSS transition, zero JavaScript DOM manipulation
```

### Theme Tokens

| Token | Normal Mode | Adult Mode |
|-------|-------------|-----------|
| `--accent` | `#E86C2F` (Orange) | `#EF4444` (Red) |
| `--accent-dim` | `#C2500A` | `#B91C1C` |
| `--surface` | `#1A1A2E` | `#1A0A0A` |
| `--border` | `#2A2A4A` | `#3A1A1A` |

### Server-Side Enforcement

Adult mode is not just cosmetic — it is enforced at the API level:

```typescript
// Every /api/adult/* route checks:
if (!user.adultModeEnabled || !user.consentAccepted) {
  return res.status(403).json({ success: false, message: "Adult mode not enabled" });
}
if (user.age < 18) {
  return res.status(403).json({ success: false, message: "Age restriction: 18+" });
}
```

---

## 📚 Research Basis

Male Parikshan is grounded in peer-reviewed research on men's mental health:

**Singh, A. (2022)**
*Accidental Deaths and Suicides in India.* NCRB, Ministry of Home Affairs.
→ Source for the 72% male suicide statistic. Informed the urgency and framing of the platform.

**Jacobson, C.M., Muehlenkamp, J.J., Miller, A.L., & Turner, J.B. (2010)**
*Psychiatric impairment among adolescents engaging in different types of deliberate self-harm.*
Journal of Clinical Child & Adolescent Psychology.
→ Informed the mood tracking design and the importance of low-friction daily check-ins.

**Restrictive Emotionality Theory (O'Neil, 1981 → present)**
The well-documented phenomenon where masculine socialization restricts emotional expression, leading to internalized distress. This theory directly shaped the male-centric mood vocabulary (`calm`, `confident`, `neutral`, `low`, `angry`) — words men are more comfortable identifying with than clinical terms.

---

## 🔒 Security

| Layer | Implementation |
|-------|----------------|
| Password storage | `bcrypt` (12 rounds) — never stored in plaintext |
| Authentication | Stateless JWT — no session storage required |
| Request validation | Zod schemas on every POST/PATCH endpoint |
| HTTP headers | Helmet.js (HSTS, XSS protection, CSP, etc.) |
| Rate limiting | 100 requests per 15 minutes per IP address |
| CORS | Strict origin allowlist |
| Adult content | Server-enforced age + consent check on every request |
| Guest mode | Read-only access — no personal data required |

---

## 🧪 Running Tests

```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

---

## 🌱 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/male_parikshan"
JWT_SECRET="change-this-to-a-long-random-string-in-production"
PORT=5000
NODE_ENV=development
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🗃 Database Schema Overview

```prisma
model User {
  id              String          @id @default(uuid())
  email           String          @unique
  passwordHash    String
  isGuest         Boolean         @default(false)
  adultModeEnabled Boolean        @default(false)
  consentAccepted Boolean         @default(false)
  age             Int?
  profile         HealthProfile?
  streaks         Streak[]
  moodLogs        MoodLog[]
  moduleProgress  ModuleProgress[]
  chatLogs        ChatLog[]
  createdAt       DateTime        @default(now())
}

model Streak {
  id           String         @id @default(uuid())
  userId       String
  currentStreak Int           @default(0)
  longestStreak Int           @default(0)
  checkins     StreakCheckin[]
}

model MoodLog {
  id        String   @id @default(uuid())
  userId    String
  mood      String   // calm | confident | neutral | low | angry
  notes     String?
  loggedAt  DateTime @default(now())
}

model Module {
  id          String           @id @default(uuid())
  title       String
  content     String
  category    String
  isAdultOnly Boolean          @default(false)
  progress    ModuleProgress[]
}
```

Full schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add: your feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your code follows the existing TypeScript conventions and all Zod schemas are updated for any new API endpoints.

---

## 👥 Team

**Male Parikshan** — Built at KIIT University, Bhubaneswar for **India Innovates 2026**

| Name | Role |
|------|------|
| *(Your Name)* | Full Stack Developer |
| *(Team Member 2)* | Backend & Database |
| *(Team Member 3)* | Frontend & UI/UX |
| *(Team Member 4)* | Research & Content |

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ for Indian men who deserve a safe space**

*"Strength isn't silence. Real men seek help."*

[![KIIT University](https://img.shields.io/badge/KIIT-University-blue?style=flat-square)](https://kiit.ac.in)
[![India Innovates](https://img.shields.io/badge/India%20Innovates-2026-orange?style=flat-square)](#)

</div>
