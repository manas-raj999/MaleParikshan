<div align="center">

# Male Parikshan
**India's first men's health & wellness platform**

[![React](https://img.shields.io/badge/React_18-TypeScript-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

*Built for India Innovates 2026 · KIIT University, Bhubaneswar*

</div>

---

> 72% of suicides in India are male — yet no dedicated digital platform exists for men's health.
> Male Parikshan is a stigma-free, research-backed space for Indian men to track their mood, build wellness habits, and access honest health education.

---

## Features

- **Streak Tracker** — daily check-ins with relapse recovery built in
- **Mood Logger** — 5 male-centric moods: Calm · Confident · Neutral · Low · Angry
- **Knowledge Hub** — 36 flash cards with text-to-speech (`en-IN`)
- **AI Health Chat** — private Q&A on men's health
- **Adult Mode** — age-verified (18+), server-enforced, consent-first
- **Guest Mode** — explore without an account
- **Dual Theme** — one toggle switches the entire app, no reload

---

## Dashboard

| Normal Mode | Adult Mode |
|:-----------:|:----------:|
| ![Dashboard Normal](screenshots/dashboard-normal.png) | ![Dashboard Adult](screenshots/dashboard-adult.png) |

---

## Tech Stack

**Frontend** — React 18, TypeScript, Vite, TailwindCSS, Axios, Recharts, Web Speech API

**Backend** — Node.js, Express, TypeScript, JWT, bcrypt, Zod, Helmet, Rate Limiting

**Database** — PostgreSQL 16, Prisma ORM

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/your-username/male-parikshan.git

# 2. Backend
cd backend && npm install
# create .env → DATABASE_URL, JWT_SECRET, PORT=5000
npx prisma migrate dev --name init
npm run seed
npm run dev

# 3. Frontend
cd ../frontend && npm install
# create .env → VITE_API_URL=http://localhost:5000/api
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables

**`backend/.env`**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/male_parikshan"
JWT_SECRET="your-secret-key"
PORT=5000
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

---

## How the Dual Mode Works

A single `ModeContext` toggle sets a `data-mode` attribute on `<html>`. CSS variables do the rest — orange theme for Normal, red theme for Adult. The switch is instant, no page reload. Adult content is also enforced server-side on every request.

---

*Made at KIIT University for India Innovates 2026*
