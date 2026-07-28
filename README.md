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
- **Routing & State:** TanStack Router, TanStack Query, Zustand
- **Backend:** Node.js, Express (REST API)
- **Database:** MongoDB (via Mongoose)
- **Authentication:** Custom JWT-based Auth
- **AI Integration:** Google Gemini 2.5 Flash (primary) + Groq LLaMA 3.3 70B (fallback)
- **Deployment:** Vercel (both application hosting and dynamic portfolio deployments)
- **Styling:** Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion

## Local Setup

The project uses a split architecture with a React frontend and an Node.js/Express backend.

```bash
# Clone the repository
git clone https://github.com/AbhishekSinhaa17/devAi-career-hub.git
cd devAi-career-hub

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..

# Run the development servers using concurrently
npm run dev
```

### Environment Variables

You will need to set up two `.env` files.

**1. Frontend (`.env` in the root directory)**
```env
VITE_API_URL=http://localhost:5000/api
```

**2. Backend (`backend/.env`)**
See `backend/.env.example` for all required variables. You will need:
- `MONGO_URI=mongodb://localhost:27017/devai_career_hub`
- `JWT_SECRET=your_jwt_secret`
- `GEMINI_API_KEY=` or `GROQ_API_KEY=`
- `DEPLOY_VERCEL_TOKEN=` (required for the 1-click portfolio deployment feature)

## Project Structure

```text
/                       # Frontend React Application
├── src/
│   ├── routes/         # TanStack Router file-based routes
│   ├── lib/            # Frontend API clients and auth logic
│   ├── components/     # Reusable React components (shadcn/ui)
│   └── store/          # Zustand state management
│
backend/                # Backend Express Application
├── src/
│   ├── controllers/    # API endpoint logic (auth, ai, github, resumes, etc.)
│   ├── models/         # Mongoose database schemas
│   ├── routes/         # Express routers
│   ├── middlewares/    # JWT auth and rate-limiting
│   └── services/       # AI provider integration (Gemini + Groq)
```

## Migration Notice

**Supabase has been fully decommissioned as of July 22, 2026.** 
The architecture has been migrated from Supabase (PostgreSQL + Auth + Server Functions) to a dedicated MongoDB + Express stack to better support long-term scalability and AI unstructured data. 

*Note: A final backup of the Postgres database was exported and archived before the Supabase project was safely paused.*
