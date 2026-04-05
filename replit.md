# BPUT Feedback Manager

## Project Overview

Full-stack feedback management system for Biju Patnaik University of Technology (BPUT), Odisha. Handles student feedback submission, faculty/course analytics, department-wise performance comparison, and admin feedback window management.

## Architecture

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

### Packages
- `artifacts/api-server` — Express 5 REST API (port via `$PORT`)
- `artifacts/bput-feedback` — React + Vite frontend (main web app at `/`)
- `lib/db` — Drizzle ORM schema + migrations
- `lib/api-spec` — OpenAPI spec (openapi.yaml)
- `lib/api-client-react` — Generated React Query hooks (via Orval)

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

Seeded data: 6 departments, 8 faculty, 9 courses, 2 feedback windows, ~72 feedback entries

### Feedback Rating Parameters (all 1–5)
- `rating_course_content`, `rating_teaching_quality`, `rating_lab_facilities`, `rating_study_material`, `rating_overall`

### Feedback Types
`semester_end` | `mid_semester` | `event_based` | `placement`

### Reference ID Format
`BPUT-{randomChars}` — generated on submission, returned to user

## Frontend Pages (artifacts/bput-feedback/src/pages/)
- `Home.tsx` — Role selection + active feedback windows
- `Dashboard.tsx` — Stats, rating breakdown, recent feedback, top-rated faculty/courses
- `Analytics.tsx` — Line chart trends, radar chart, department comparison table
- `Departments.tsx` — Department grid with rating badges
- `DepartmentDetails.tsx` — Per-department faculty performance + courses
- `FacultyList.tsx` — Searchable/filterable faculty directory
- `FacultyDetails.tsx` — Per-faculty breakdown with recent comments
- `Courses.tsx` — Course listing with dept/semester filters
- `FeedbackList.tsx` — All feedback with filters (dept/type/semester)
- `SubmitFeedback.tsx` — 5-parameter star rating form, anon toggle, success state
- `Windows.tsx` — CRUD for feedback windows, activate/deactivate

## Backend Routes (artifacts/api-server/src/routes/)
- `departments.ts` — List departments with aggregated ratings
- `faculty.ts` — List/get faculty with analytics
- `courses.ts` — List/get courses with filters
- `feedback.ts` — Submit, list, get feedback
- `windows.ts` — CRUD for feedback windows
- `analytics.ts` — Dashboard summary, top rated, trends, faculty/dept analytics

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Design

Deep navy/teal institutional color palette (`--sidebar: 200 80% 15%`, `--primary: 200 80% 30%`). Clean card-based layout with rating bars, star displays, and color-coded rating badges (green ≥4, amber ≥3, red <3).
