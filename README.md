<div align="center">

# 🧭 StudyCompass

**One workspace for planning study abroad** — match universities, find scholarships,
budget the real cost, track every deadline, and prep your visa.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

</div>

---

Studying abroad is a sprawling, high-stakes process that most people run out of a
spreadsheet that grows a tab a week. StudyCompass turns it into one plan built
around a student's profile: grades, budget, and goals in — a ranked shortlist and
a clear next step out.

<!-- Add screenshots here: drop images in docs/ and reference them. -->

## ✨ Features

| | Tool | What it does |
|---|---|---|
| 🎯 | **Readiness scorecard** | Tier-by-tier score (top / mid / accessible) from academics, English, research, experience, and budget |
| 🎓 | **University matching** | Programs sorted into **safe / target / reach** against real requirements |
| 🌍 | **Country decision** | Side-by-side comparison on cost, work rights, visa difficulty, and post-study options |
| 💰 | **Scholarship eligibility** | Matches against real awards, saves the ones worth chasing, tracks their deadlines |
| 🧮 | **Cost of degree** | Tuition, living, visa, insurance, flights, and an emergency fund as one honest total — plus the funding gap |
| 🗺️ | **Application strategy** | Turns a shortlist into a balanced plan with a clear order of priority |
| 📄 | **Document checklist** | Every document each program needs, tracked from pending to submitted |
| ⏰ | **Deadline & requirement monitor** | Application, scholarship, and visa dates on one timeline, with alerts for changed requirements |
| 🛂 | **Visa preparation hub** | Country-specific requirements, proof-of-funds, embassy links, timelines, and common mistakes |
| 🤖 | **AI advisor** | Answers grounded in the student's own profile and target countries *(optional — needs an xAI key)* |
| 📡 | **Opportunity feed** | Personalised surface of new scholarships, matches, and upcoming deadlines |

The UI has a warm paper-and-ink design system with a single amber accent, a full
shadcn-style component library, light/dark themes, and motion that respects
`prefers-reduced-motion`.

## 🛠️ Tech

| Layer | Stack |
|---|---|
| 🖥️ **Web** | React 18 · Vite 5 · React Router 6 · Tailwind CSS 3 · Radix UI · `lucide-react` · `sonner` |
| 🔌 **API** | Express · Prisma 5 · `zod` · `jsonwebtoken` · `bcryptjs` |
| 🗄️ **Data** | PostgreSQL — Prisma schema, migrations, and seed |
| 🧠 **AI** | xAI Grok (`grok-2-latest`), optional |
| 📦 **Repo** | npm-workspaces monorepo, TypeScript throughout |

## 🚀 Getting started

**Prerequisites:** Node 20+, npm 10+, and a PostgreSQL 14+ instance.

```bash
# 1 · Install
npm install

# 2 · Configure — set DATABASE_URL and a JWT_SECRET
cp .env.example .env

# 3 · Database — client, migrations, reference data
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# 4 · Run both apps
npm run dev
```

| | URL |
|---|---|
| 🌐 Web | <http://localhost:5173> |
| ❤️ API health | <http://localhost:4000/api/health> |

> Need a database fast?
> `docker run -d --name studycompass-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=study_abroad -p 5432:5432 postgres:16`

## 🔑 Demo accounts

Created by the seed:

| Email | Password | Role |
|---|---|---|
| `student@example.com` | `Student@123` | 🎓 Student |
| `manager@example.com` | `Manager@123` | 🧑‍💼 Manager |
| `admin@example.com` | `Admin@123` | 🛡️ Admin |

## 🗂️ Project layout

```
studyCompass/
├── apps/
│   ├── web/                      React + Vite frontend
│   │   └── src/
│   │       ├── components/
│   │       │   └── ui/           shadcn-style component library
│   │       ├── pages/            one file per feature
│   │       ├── lib/              cn(), formatters, hooks
│   │       └── state/            auth + theme context
│   └── api/                      Express + Prisma REST API
│       └── src/
│           ├── routes/           thin route handlers
│           └── services/         business logic
├── packages/
│   └── shared/                   types + zod schemas shared by web & api
└── prisma/
    ├── schema.prisma             data model
    ├── migrations/               versioned migrations
    └── seed.ts                   reference data + demo users
```

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run API and web together (builds `shared` first) |
| `npm run dev:api` · `npm run dev:web` | Run one side only |
| `npm run build` | Production build of every workspace |
| `npm run typecheck` | Type-check every workspace |
| `npm run prisma:migrate` | Create / apply a migration |
| `npm run prisma:seed` | Re-seed the database |

## ⚙️ Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing secret for auth tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Allowed web origin (default `http://localhost:5173`) |
| `VITE_API_URL` | API base URL the web app calls |
| `GROK_API_KEY` *(or `XAI_API_KEY`)* | Enables the AI advisor; the app runs fine without it |

## 📄 License

Not yet licensed — all rights reserved. Add a `LICENSE` file to make the terms explicit.
