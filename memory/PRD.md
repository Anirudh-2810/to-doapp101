# Velocity-One - Cognitive Task Engine PRD

## Problem Statement
Build a productivity app with cognitive load management, AI-powered task optimization, and delegation intelligence.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **AI**: OpenAI GPT-4.1-mini via Emergent LLM Key
- **Auth**: JWT with httpOnly cookies, bcrypt password hashing
- **Design**: Dark theme (#0A0A0A bg, #FF5500 primary, Manrope/IBM Plex Sans/JetBrains Mono)

## User Personas
1. Knowledge workers managing complex task loads
2. Team leads needing delegation intelligence
3. Developers/creatives tracking deep work streaks

## Core Requirements
- JWT auth (register, login, logout, refresh, brute force protection)
- Task CRUD with parent/child hierarchy support
- Priority Algorithm: S = (U×0.5) + (I×0.3) - (D×0.2) + cognitive load matching
- Behavioral telemetry: velocity score, deep work streak, cognitive match rate
- AI insights: GPT-powered task recommendations and delegation suggestions
- Category velocity tracking for predictive delegation
- Energy slider for cognitive load matching
- Google Calendar integration (stub - ready for credentials)

## What's Been Implemented (2026-03-31)
- Full JWT auth system with register/login/logout/refresh/brute-force
- Task CRUD with priority scoring algorithm
- Behavioral telemetry tracking (streak, velocity, cognitive match)
- AI insights via OpenAI GPT-4.1-mini (Emergent LLM Key)
- Category velocity tracking with delegation alerts
- Energy slider with real-time task re-scoring
- Dark theme dashboard with Shadcn UI components
- Admin seeding on startup

## Prioritized Backlog
### P0 (Critical)
- All core features implemented ✅

### P1 (Important)
- Google Calendar OAuth integration (needs GOOGLE_CLIENT_ID & SECRET)
- Task editing inline
- Subtask/parent-child task UI

### P2 (Nice to Have)
- Time-series analysis for peak focus hour recommendations
- Multi-device sync via MongoDB
- Task templates and recurring tasks
- Export/import functionality
- Dark/light theme toggle

## Next Tasks
1. Google Calendar integration (when user provides credentials)
2. Task edit functionality
3. Subtask hierarchy UI
4. Peak hours visualization chart
5. Recurring task support
