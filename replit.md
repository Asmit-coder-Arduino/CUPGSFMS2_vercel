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

Tables: `departments`, `faculty`, `courses`, `feedback`, `feedback_windows`

### Current Seed Data (Real CUPGS data)
- **7 departments**: CSE (id=7), ECE (id=8), EE (id=9), ME (id=10), CE (id=11), IT (id=12), ChE (id=13)
  - CUPGS actively uses 5 departments: CSE, ECE, EE, ME, CE
- **18 faculty**: Real CUPGS faculty scraped from bput.ac.in, employee IDs (`CUPGS/DEPT/NUM`), PIN `1234` for all
  - HOD logins: PIN format `DEPT@2025` (e.g. `CSE@2025`), Employee ID `HOD/DEPT/001`
- Real HODs: CSE=Dr. Debashreet Das, ECE=Dr. Prakash Kumar Panda, EE=Dr. Manas Ranjan Nayak, ME=Dr. Atal Bihari Harichandan, CE=Dr. Bibhuti Bhusan Mukharjee
- **40 courses**: Realistic BPUT curriculum, Semesters 5 & 6, academic year 2024-25
- **2 feedback windows**: 1 active (Even Sem End 2024-25), 1 closed
- **126+ feedback entries**: Seeded across 12 courses

### Feedback Rating Parameters (all 1–5)
- `rating_course_content`, `rating_teaching_quality`, `rating_lab_facilities`, `rating_study_material`, `rating_overall`

### Feedback Types
`semester_end` | `mid_semester` | `event_based` | `placement`

### Reference ID Format
`BPUT-{randomChars}` — generated on submission, returned to user

## HOD Credentials (All 7 Branches)

| Department | HOD Name | Employee ID | PIN |
|---|---|---|---|
| CSE | Dr. Srikanta Patnaik | `HOD/CSE/001` | `CSE@2025` |
| ECE | Dr. Pradipta Kumar Sahu | `HOD/ECE/001` | `ECE@2025` |
| EE | Dr. Rabi Narayan Mahapatra | `HOD/EE/001` | `EEE@2025` |
| ME | Prof. Srihari Rath | `HOD/ME/001` | `MECH@2025` |
| CE | Prof. Subhendu Sekhar Dey | `HOD/CE/001` | `CIVIL@2025` |
| IT | Prof. Binod Kumar Pattanayak | `HOD/IT/001` | `IT@2025` |
| ChE | Prof. Sarat Kumar Patel | `HOD/CHE/001` | `CHEM@2025` |

## Role-Based Access Control

Three distinct roles managed via `RoleContext` (localStorage-persisted session):

| Role | Access | Login Method |
|------|--------|-------------|
| **Guest** | Home + Submit Feedback | No login |
| **Student** | Home + Submit Feedback (with roll number) | Enter roll number on home screen |
| **Faculty** | Home + My Dashboard (own courses' feedback only) | Employee ID + 6-digit PIN |
| **Admin** | Full access to all pages | Admin password (`bput@admin2025`) |

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

## HOD Dashboard (4 Tabs)
- **Analytics**: Summary cards, rating bars (5 params), faculty accordion, course-wise table, recent comments, PDF download
- **Faculty Management**: Add/Edit/Delete faculty (full form: name, designation, employeeId, loginPin, email, qualification, specialization); view assigned courses; delete protection with 409 if feedback exists
- **Course Management**: Add/Edit/Delete courses grouped by semester; assign faculty dropdown; unassigned warning; delete protection
- **Feedback Windows**: Create/toggle active/inactive windows; progress bar for running windows; status badges

## Key Conventions
- API base URL: relative (`""`) — Replit proxy routes `/api/*` to the API server
- Faculty employee ID format: `BPUT/DEPT/YEAR/NUM` (e.g. `BPUT/CSE/2005/001`)
- Faculty PIN format: 6-digit numeric string (e.g. `112233`)
- Admin password: `bput@admin2025` (env var `ADMIN_PASSWORD` overrides)
- All feedback is anonymous by default
