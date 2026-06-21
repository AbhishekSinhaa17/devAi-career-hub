# DevAI — AI-Powered Developer Career Platform

[![GitHub](https://img.shields.io/badge/GitHub-Repo-black)](https://github.com/AbhishekSinhaa17/devAi-career-hub)

DevAI is a full-stack, AI-powered career platform built exclusively for developers. Elevate your career with tools to analyze your GitHub profile, build ATS-optimized resumes, generate and deploy portfolio sites, practice mock interviews, and get personalized career roadmaps — all seamlessly integrated into one intelligent platform.

## Features

| Feature                       | Description                                                                              |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| 🔍 **GitHub Analyzer**        | Deep AI analysis of your GitHub profile — get a score, strengths, and weaknesses.        |
| 📄 **Resume Builder**         | Create ATS-optimized resumes with real-time AI scoring and targeted suggestions.         |
| 🌐 **Portfolio Generator**    | Generate and 1-click deploy a beautiful portfolio directly to Vercel.                    |
| 🤖 **AI Career Copilot**      | Persistent chat assistant with full context of your career history and data.             |
| 🎤 **Mock Interviews**        | AI-powered voice interview practice with real-time scoring and comprehensive feedback.   |
| 🗺️ **Career Roadmap**         | Personalized learning roadmaps (max 12 months) based on your specific goals.             |
| 💼 **Job Match**              | Upload a Job Description + resume to get an ATS score and hiring probability.            |
| 💻 **Code Reviewer**          | Intelligent AI code review enforcing best practices and optimization suggestions.        |
| 📊 **Developer Health Score** | A composite career readiness score aggregated across all your platform activities.       |
| 🏆 **Developer Score**        | Detailed profile scoring with certifications and suggested job roles.                    |
| 🧑‍💼 **Admin Dashboard**        | Full usage analytics, AI cost tracking, and CSV export capabilities for platform admins. |

## Tech Stack

- **Frontend:** React 19, Vite
- **Routing & State:** TanStack Router, TanStack Query
- **Backend:** TanStack Start Server Functions (SSR)
- **Database:** Supabase (PostgreSQL + Row Level Security + Auth)
- **AI Integration:** Google Gemini 2.5 Flash (primary) + Groq LLaMA 3.3 70B (fallback)
- **Deployment:** Vercel (both application hosting and dynamic portfolio deployments)
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion
- **Tooling:** ESLint, Prettier

## Local Setup

```bash
# Clone the repository
git clone https://github.com/AbhishekSinhaa17/devAi-career-hub.git
cd devAi-career-hub

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Run the development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables. You will need:

- **Supabase:** Project URL and anon/service keys.
- **AI Providers:** Gemini API key (primary) or Groq API key (fallback).
- **Vercel:** Vercel API token (required for the 1-click portfolio deployment feature).

### Database Setup

Run the `combined_schema.sql` file in your Supabase SQL Editor to instantly create all required tables, Row Level Security (RLS) policies, and database functions.

## Project Structure

```text
src/
├── routes/                 # TanStack Router file-based routes
│   ├── _authenticated/     # Protected routes (all core app features)
│   └── index.tsx           # Landing page
├── lib/                    # Server functions & core AI logic
│   ├── ai.functions.ts     # All AI interaction logic
│   ├── ai-gateway.server.ts# AI provider routing (Gemini + Groq)
│   └── vercel.functions.ts # Vercel deployment orchestration
├── components/             # Reusable React components
│   ├── landing/            # Landing page sections
│   └── ui/                 # shadcn/ui foundational components
└── integrations/supabase/  # Supabase client initialization + auth hooks
```
