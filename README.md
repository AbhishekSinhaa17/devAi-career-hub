# DevAI — AI-Powered Developer Career Platform

> **AccioBuild 2026 Hackathon Submission**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](YOUR_LIVE_URL_HERE)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black)](YOUR_GITHUB_URL_HERE)

DevAI is a full-stack AI-powered career platform built for developers. Analyze your GitHub profile, build ATS-optimized resumes, generate and deploy portfolio sites, practice mock interviews, and get personalized career roadmaps — all in one intelligent platform.

## Demo Video
[Watch Demo →](YOUR_DEMO_VIDEO_URL_HERE)

## Live Link
[Open App →](YOUR_LIVE_URL_HERE)

## Features

| Feature | Description |
|---|---|
| 🔍 GitHub Analyzer | AI analysis of your GitHub profile — score, strengths, weaknesses |
| 📄 Resume Builder | ATS-optimized resume with AI scoring and suggestions |
| 🌐 Portfolio Generator | Generate and 1-click deploy portfolio to Vercel from GitHub |
| 🤖 AI Career Copilot | Persistent chat assistant with full context of your career data |
| 🎤 Mock Interviews | AI-powered interview practice with scoring and feedback |
| 🗺️ Career Roadmap | Personalized learning roadmap based on your goals |
| 💼 Job Match | Upload JD + resume, get ATS score and hiring probability |
| 💻 Code Reviewer | AI code review with best practices and suggestions |
| 📊 Developer Health Score | Composite career readiness score across all features |
| 🏆 Developer Score | Detailed profile scoring with certifications and job role suggestions |
| 🧑‍💼 Admin Dashboard | Usage analytics, AI cost tracking, CSV export |

## Tech Stack

- **Frontend:** React 19, TanStack Start, TanStack Router, TanStack Query
- **Backend:** TanStack Start Server Functions (SSR)
- **Database:** Supabase (PostgreSQL + Row Level Security + Auth)
- **AI:** Google Gemini 2.5 Flash (primary) + Groq LLaMA 3.3 70B (fallback)
- **Deployment:** Vercel
- **UI:** Tailwind CSS v4, shadcn/ui, Radix UI, Recharts
- **AI Tools Used:** Claude, Cursor, Gemini

## AI Tools Used
This project was built using AI development tools including Claude, Gemini, and Cursor — as permitted by AccioBuild 2026 rules.

## Setup

```bash
# Clone the repo
git clone YOUR_GITHUB_URL_HERE
cd devai-career-hub

# Install dependencies
bun install

# Copy env file and fill in values
cp .env.example .env

# Run dev server
bun dev
```

### Environment Variables
See `.env.example` for all required variables. You need:
- Supabase project URL + keys
- Gemini API key (or Groq API key)
- Vercel API token (for portfolio deployment feature)

### Database Setup
Run `combined_schema.sql` in your Supabase SQL Editor to create all required tables.

## Project Structure

```
src/
├── routes/           # TanStack Router file-based routes
│   ├── _authenticated/  # Protected routes (all app features)
│   └── index.tsx     # Landing page
├── lib/              # Server functions & AI logic
│   ├── ai.functions.ts      # All AI features
│   ├── ai-gateway.server.ts # AI provider abstraction (Gemini + Groq)
│   ├── rate-limiter.server.ts
│   └── github-client.server.ts
├── components/       # React components
│   ├── landing/      # Landing page sections
│   └── ui/           # shadcn/ui components
└── integrations/supabase/  # Supabase client + auth middleware
```
