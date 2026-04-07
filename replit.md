# CUPGS Feedback Manager

## Project Overview

Full-stack feedback management system for Centre for UG & PG Studies (CUPGS), the in-campus college of BPUT, Rourkela, Odisha. Handles student feedback submission (anonymous), faculty/course analytics, department-wise performance comparison, admin feedback window management, and role-based access control.

## Architecture

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

### Packages
- `artifacts/api-server` — Express 5 REST API (port via `$PORT`, default 8080)
- `artifacts/bput-feedback` — React + Vite frontend (main web app at `/`)
- `lib/db` — Drizzle ORM schema + migrations
- `lib/api-spec` — OpenAPI spec (openapi.yaml)
- `lib/api-client-react` — Generated React Query hooks (via Orval)
- `lib/api-zod` — Zod validation schemas (generated)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Pino logger
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec → React Query hooks)
- **Charts**: Recharts (LineChart, RadarChart)
- **Build**: esbuild (CJS bundle)

## Database Schema

Tables: `departments`, `faculty`, `courses`, `feedback`, `feedback_windows`, `form_templates`

### Current Seed Data (Real CUPGS data)
- **7 departments**: CSE (id=7), ECE (id=8), EE (id=9), ME (id=10), CE (id=11), IT (id=12), ChE (id=13)
  - CUPGS actively uses 5 departments: CSE, ECE, EE, ME, CE
- **18 faculty**: Real CUPGS faculty scraped from bput.ac.in, employee IDs (`CUPGS/DEPT/NUM`), PIN format `CUPGS_{DEPT}_{NNN}#` (e.g. `CUPGS_CSE_001#`)
  - HOD logins: PIN format `HOD_{DEPT}_@2025#` (e.g. `HOD_CSE_@2025#`), Employee ID `HOD/DEPT/001`
- Real HODs: CSE=Dr. Debashreet Das, ECE=Dr. Prakash Kumar Panda, EE=Dr. Manas Ranjan Nayak, ME=Dr. Atal Bihari Harichandan, CE=Dr. Bibhuti Bhusan Mukharjee
- **40 courses**: Realistic BPUT curriculum, Semesters 5 & 6, academic year 2024-25
- **2 feedback windows**: 1 active (Even Sem End 2024-25), 1 closed
- **126+ feedback entries**: Seeded across 12 courses

### Feedback Rating Parameters (0.5–5.0, stored as REAL)
- `rating_course_content`, `rating_teaching_quality`, `rating_lab_facilities`, `rating_study_material`, `rating_overall`
- Supports half-star precision (0.5 increments via drag/touch/keyboard on frontend)

### Feedback Types
`semester_end` | `mid_semester` | `event_based` | `placement`

### Reference ID Format
`BPUT-{randomChars}` — generated on submission, returned to user

## HOD Credentials (All 7 Branches)

| Department | HOD Name | Employee ID | PIN |
|---|---|---|---|
| CSE | Dr. Srikanta Patnaik | `HOD/CSE/001` | `HOD_CSE_@2025#` |
| ECE | Dr. Pradipta Kumar Sahu | `HOD/ECE/001` | `HOD_ECE_@2025#` |
| EE | Dr. Rabi Narayan Mahapatra | `HOD/EE/001` | `HOD_EE_@2025#` |
| ME | Prof. Srihari Rath | `HOD/ME/001` | `HOD_ME_@2025#` |
| CE | Prof. Subhendu Sekhar Dey | `HOD/CE/001` | `HOD_CE_@2025#` |
| IT | Prof. Binod Kumar Pattanayak | `HOD/IT/001` | `HOD_IT_@2025#` |
| ChE | Prof. Sarat Kumar Patel | `HOD/CHE/001` | `HOD_CHE_@2025#` |

## Role-Based Access Control

Three distinct roles managed via `RoleContext` (localStorage-persisted session):

| Role | Access | Login Method |
|------|--------|-------------|
| **Guest** | Home + Submit Feedback | No login |
| **Student** | Home + Submit Feedback (with roll number) | Enter roll number on home screen |
| **Faculty** | Home + My Dashboard (own courses' feedback only) | Employee ID + 6-digit PIN |
| **HOD** | Department dashboard, feedback mgmt, PDF reports | Employee ID + HOD PIN |
| **Admin** | Full access to all pages | Admin password (env var `ADMIN_PASSWORD`) |

### Auth API Endpoints
- `POST /api/auth/faculty-login` — `{ employeeId, pin }` → faculty object with courses + stats
- `POST /api/auth/admin-login` — `{ password }` → `{ success: true, role: "admin" }`
- `GET /api/faculty/:id/my-feedback` — Faculty portal data (courses with feedback breakdown)

## Frontend Pages (artifacts/bput-feedback/src/pages/)
- `Home.tsx` — Three-panel role selection with modal dialogs for each role
- `FacultyPortal.tsx` — Faculty-only view: their courses + star ratings + comment viewer
- `Dashboard.tsx` — Admin stats, rating breakdown, recent feedback, top-rated faculty/courses
- `Analytics.tsx` — Line chart trends, radar chart, department comparison table
- `Departments.tsx` — Department grid with rating badges
- `DepartmentDetails.tsx` — Per-department stats + faculty + course breakdown
- `FacultyList.tsx` — Faculty directory with rating cards
- `FacultyDetails.tsx` — Per-faculty analytics with course breakdown
- `Courses.tsx` — Course list with filters
- `FeedbackList.tsx` — Paginated feedback with filters
- `Windows.tsx` — Admin: create/edit/toggle feedback windows

## Frontend Components
- `AppLayout.tsx` — Sidebar navigation (role-aware: changes nav items per role, shows logout)
- `RoleContext.tsx` — React context for role state (persisted in localStorage key `bput_session`)

## API Routes (artifacts/api-server/src/routes/)
- `health.ts` — GET /api/health
- `auth.ts` — Faculty/admin login, faculty portal data endpoint
- `departments.ts` — CRUD for departments
- `faculty.ts` — GET /faculty, POST /faculty, GET /faculty/:id, PATCH /faculty/:id, DELETE /faculty/:id (blocked if has feedback; auto-unassigns from courses)
- `courses.ts` — GET /courses, POST /courses, GET /courses/:id, PATCH /courses/:id (incl. facultyId assignment), DELETE /courses/:id (blocked if has feedback)
- `feedback.ts` — Submit + list feedback
- `windows.ts` — CRUD for feedback windows (PATCH toggles active/inactive)
- `analytics.ts` — Dashboard summary, department/faculty analytics, trends, top-rated

### Faculty API Fields (PATCH-able)
name, email, designation, employeeId, loginPin, qualification, specialization

### Course API Fields (PATCH-able)
code, name, semester, academicYear, credits, facultyId (null to unassign)

## HOD Dashboard (6 Tabs)
- **Analytics**: Summary cards, rating bars (5 params), faculty accordion, course-wise table, recent comments, PDF download
- **Feedback**: View all student feedback for department; delete individual feedback entries with HOD PIN verification (DELETE /api/feedback/:id/hod-delete)
- **Faculty Management**: Add/Edit/Delete faculty (full form: name, designation, employeeId, loginPin, email, qualification, specialization); view assigned courses; delete protection with 409 if feedback exists
- **Course Management**: Add/Edit/Delete courses grouped by semester; assign faculty dropdown; unassigned warning; delete protection
- **Feedback Windows**: Create/toggle active/inactive windows; progress bar for running windows; status badges
- **Form Builder**: Customize feedback forms per department

## Recent Features Added
- **IP Address Tracking**: Feedback submissions capture client IP internally (for abuse prevention only), never exposed in API responses, receipts, or admin views
- **Serial Number**: Each feedback gets a serial number in format `CUPGS/FB/00001`
- **Thank You Receipt**: After submission, students see a detailed receipt with download button (downloads as styled HTML file with all submission details)
- **Feedback Tracking**: Students can track their feedback status using Reference ID on the home page. Backend: `GET /api/feedback/track/:referenceId`
- **Admin HOD Management**: Dashboard includes HOD management section where admin can edit HOD name, employee ID, and PIN for each department. Backend: `PATCH /api/departments/:id`
- **Faculty Photos**: All 18 faculty have AI-generated portrait photos at `/faculty-photos/faculty_{dept}_{num}.png`
- **Instagram-style Top Teachers**: Home page shows top 3 teachers with photos, like/heart button, star ratings, and detailed modal with AI analysis
- **Complaint Box**: Students can submit complaints (anonymous or named); HODs see department-specific complaints; Admin sees all; real-time SSE notifications
- **Multilingual Profanity Filter**: Filters profanity in English, Hindi, Odia, Bengali, Tamil, Telugu with leetspeak bypass detection; applied to both feedback comments and complaint submissions
- **AI Faculty Analytics**: Click "AI Performance Analysis" button on top-3 teacher detail modal to get OpenAI-powered sentiment analysis, strengths/weaknesses, and recommendations based on anonymous feedback data. Endpoint: `GET /api/faculty/:id/ai-analysis` (rate-limited, cached 10 min)
- **100% Anonymity**: No student name, roll number, or IP address is ever exposed in API responses, admin views, or receipts. Anonymous complaints store "Anonymous" for name/roll. SSE notifications also mask anonymous student identity.
- **Liquid Glass Mode**: Toggle between classic and liquid glass visual modes via Droplets/Glasses icon button in sidebar + home header. Persisted in localStorage key `cupgs-glass-mode`. Context: `GlassModeContext.tsx` (`useGlassMode()` hook). SVG filters: `LiquidGlassFilters.tsx`. CSS uses `.liquid-glass` class on `<html>` with CSS custom properties `--lg-blur`, `--lg-saturation`, `--lg-border`. Uses transparent backgrounds with backdrop-filter blur + saturate — no white overlay, background colors show through like real liquid glass.
- **Glass Settings Panel**: When liquid glass mode is active, a sliders icon appears next to the glass toggle. Click to open a dropdown with 3 adjustable sliders: Blur (0–40px, default 12px), Saturation (1x–3x, default 1.4x), Border (0–100%, default 0% = borderless). Settings persisted in localStorage key `cupgs-glass-settings`. Component: `GlassSettingsPanel.tsx`. Reset button restores defaults.

## Key Conventions
- API base URL: relative (`""`) — Replit proxy routes `/api/*` to the API server
- Faculty employee ID format: `CUPGS/DEPT/NUM` (e.g. `CUPGS/CSE/001`)
- Faculty PIN format: `CUPGS_{DEPT}_{NNN}#` (e.g. `CUPGS_CSE_001#`)
- HOD PIN format: `HOD_{DEPT}_@2025#` (e.g. `HOD_CSE_@2025#`)
- Admin password: via env var `ADMIN_PASSWORD` (stored in session after login for API auth headers)
- Security: API responses strip `loginPin` from faculty, `hodPin` from departments, and `ipAddress` from all feedback/complaint responses
- All feedback is anonymous by default
- OpenAI integration: Uses `@workspace/integrations-openai-ai-server` package (env vars: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`)
