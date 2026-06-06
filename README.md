<<<<<<< HEAD
# Jobsee


A full-stack production web app connecting college students with part-time jobs and internships nearby.

---

## 📁 VS Code File Structure (Explained)

```
campusgig/                          ← Root project folder
│
├── frontend/                       ← Everything the user SEES (Next.js + React)
│   ├── src/
│   │   ├── app/                    ← Next.js 14 App Router pages (each folder = a URL)
│   │   │   ├── layout.tsx          ← Root HTML shell (wraps every page)
│   │   │   ├── page.tsx            ← Landing page  →  /
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx  ← Login page    →  /auth/login
│   │   │   │   └── register/page.tsx ← Signup      →  /auth/register
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx        ← Dashboard     →  /dashboard
│   │   │   │   └── layout.tsx      ← Dashboard nav wrapper
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx        ← Job listing   →  /jobs
│   │   │   │   └── [id]/page.tsx   ← Single job    →  /jobs/abc123
│   │   │   ├── profile/
│   │   │   │   └── page.tsx        ← Edit profile  →  /profile
│   │   │   └── admin/
│   │   │       └── page.tsx        ← Admin panel   →  /admin
│   │   │
│   │   ├── components/             ← Reusable building blocks
│   │   │   ├── ui/                 ← Generic: Button, Input, Modal, Badge
│   │   │   ├── layout/             ← Navbar, Sidebar, Footer
│   │   │   ├── forms/              ← Login form, Register form, Job post form
│   │   │   ├── jobs/               ← JobCard, JobList, JobFilters
│   │   │   └── auth/               ← Protected route wrapper
│   │   │
│   │   ├── hooks/                  ← Custom React hooks (useJobs, useAuth, etc.)
│   │   ├── lib/                    ← Config: Supabase client, API helpers, utils
│   │   ├── types/                  ← TypeScript types (shared data shapes)
│   │   └── store/                  ← Zustand global state
│   │
│   ├── public/                     ← Static files (images, icons)
│   ├── .env.local                  ← Your secrets (NEVER commit this)
│   ├── .env.example                ← Template (safe to commit)
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                        ← Server (Express API)
│   ├── src/
│   │   ├── routes/                 ← URL endpoints (/api/jobs, /api/users, etc.)
│   │   ├── controllers/            ← Logic for each route
│   │   ├── middleware/             ← Auth check, rate limit, error handler
│   │   ├── services/               ← Database queries (Supabase calls)
│   │   ├── utils/                  ← Helpers (logger, validators)
│   │   └── config/                 ← App config loaded from .env
│   ├── .env                        ← Backend secrets (NEVER commit)
│   ├── .env.example
│   └── package.json
│
├── supabase/                       ← Database setup
│   ├── migrations/                 ← SQL files that CREATE your tables
│   ├── policies/                   ← Row Level Security rules
│   └── functions/                  ← Edge functions (optional)
│
├── docker-compose.yml              ← Run everything with one command
├── README.md                       ← This file
└── .gitignore                      ← Files git should ignore
```

---

## 🚀 Quick Start (Complete Beginner Setup)

### Step 1 — Install Prerequisites
```bash
# Install Node.js (v18+): https://nodejs.org
node --version   # should say v18 or higher

# Install Git: https://git-scm.com
git --version

# Install VS Code: https://code.visualstudio.com
```

### Step 2 — Create Supabase Project
1. Go to https://supabase.com → Sign up free
2. Click "New Project" → name it "campusgig"
3. Save your **database password** somewhere safe
4. Go to Settings → API → copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public key` → this is your `SUPABASE_ANON_KEY`
   - `service_role key` → this is your `SUPABASE_SERVICE_ROLE_KEY`

### Step 3 — Run Database Migrations
1. In Supabase dashboard → go to "SQL Editor"
2. Copy the content of `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"
4. Then run `supabase/migrations/002_rls_policies.sql`

### Step 4 — Set Up Frontend
```bash
cd campusgig/frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase keys
npm run dev
# Open http://localhost:3000
```

### Step 5 — Set Up Backend
```bash
cd campusgig/backend
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev
# API runs at http://localhost:4000
```

---

## 🔑 Environment Variables

### frontend/.env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### backend/.env
```
PORT=4000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
JWT_SECRET=your-64-char-random-secret
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

---

## 🌐 Deployment

### Frontend → Vercel (Free)
1. Push to GitHub
2. Go to vercel.com → Import project
3. Add environment variables from `.env.local`
4. Deploy — it's live!

### Backend → Render (Free)
1. Go to render.com → New Web Service
2. Connect GitHub repo, set root to `/backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

---

## 📚 Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 + React | File-based routing, SSR, great DX |
| Styling | Tailwind CSS | Fast, consistent, responsive |
| State | Zustand | Simple global state |
| Backend | Express.js | Mature, flexible Node.js framework |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one |
| Auth | Supabase Auth + JWT | Secure, handles sessions |
| Uploads | Supabase Storage | Free CDN for resumes/logos |
=======
# hackeuropa
>>>>>>> 1f9b3595f9203191e9449f0f8ccc4006ad5b353b
