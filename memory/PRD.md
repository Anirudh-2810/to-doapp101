# Velocity-One - Cognitive Task Engine PRD

## Problem Statement
Build a productivity app with cognitive load management, AI-powered task optimization, delegation intelligence, and light/dark mode toggle.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **AI**: OpenAI GPT-4.1-mini via Emergent LLM Key
- **Auth**: JWT with httpOnly cookies, bcrypt password hashing
- **Design**: Light/Dark mode toggle, Teal primary (#14B8A6), Manrope/IBM Plex Sans/JetBrains Mono

## What's Been Implemented (2026-03-31)
- Full JWT auth system with register/login/logout/refresh/brute-force
- Task CRUD with priority scoring algorithm S=(U×0.5)+(I×0.3)−(D×0.2)
- Behavioral telemetry tracking (streak, velocity, cognitive match)
- AI insights via OpenAI GPT-4.1-mini (Emergent LLM Key)
- Category velocity tracking with delegation alerts
- Energy slider with real-time task re-scoring
- **Light/Dark mode toggle** with localStorage persistence
- Summary stat cards (Active Tasks, Completed, Velocity, Streak)
- Color-coded priority borders (rose=high, amber=medium, teal=low)
- Responsive card-based dashboard inspired by modern task management UIs

## Testing Results
- Backend: 100% (15/15 API endpoints)
- Frontend: 98% (all major functionality, minor dropdown timing)

## Prioritized Backlog
### P1
- Google Calendar OAuth integration (needs credentials)
- Task editing inline
- Subtask/parent-child task UI

### P2
- Peak hours visualization chart
- Multi-device sync
- Task templates and recurring tasks
- Export/import functionality
