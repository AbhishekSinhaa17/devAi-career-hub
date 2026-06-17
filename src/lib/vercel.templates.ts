export function generatePortfolioFiles(resumeData: any) {
  const { fullName, title, summary, skills, projects, github_username } = resumeData;

  const packageJson = {
    name: `portfolio-${fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
      "lucide-react": "^0.368.0",
    },
    devDependencies: {
      "@types/react": "^18.2.66",
      "@types/react-dom": "^18.2.22",
      "@vitejs/plugin-react": "^4.2.1",
      autoprefixer: "^10.4.19",
      postcss: "^8.4.38",
      tailwindcss: "^3.4.3",
      typescript: "^5.2.2",
      vite: "^5.2.0",
    },
  };

  const viteConfig = `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;

  const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;

  const postcssConfig = `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  const indexHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${fullName} - ${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#0a0a0a] text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-white;
  }
}
`;

  const mainTsx = `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

  const appTsx = `
import React from 'react';
import { Github, Code2, ExternalLink, Layers } from 'lucide-react';

const resume = ${JSON.stringify(resumeData, null, 2)};

export default function App() {
  return (
    <div className="min-h-screen font-sans">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Available for opportunities
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
            Hi, I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">{resume.fullName}</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl leading-relaxed mb-10">
            {resume.title}
          </p>
          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
            {resume.summary}
          </p>
          
          <div className="mt-12 flex gap-4">
            <a href={\`https://github.com/\${resume.github_username || ''}\`} target="_blank" rel="noreferrer" className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors">
              <Github className="h-5 w-5" /> GitHub Profile
            </a>
            <a href="#projects" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
              View Work
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-24 space-y-32">
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Code2 className="h-6 w-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Technical Skills</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {resume.skills?.map((skill: string, i: number) => (
              <div key={i} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold hover:bg-white/10 transition-all cursor-default">
                {skill}
              </div>
            ))}
          </div>
        </section>

        <section id="projects">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers className="h-6 w-6 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">Featured Projects</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {resume.projects?.map((proj: any, i: number) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                  <ExternalLink className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors">{proj.name || proj.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-6">{proj.description}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.technologies?.slice(0, 4).map((tech: string, j: number) => (
                    <span key={j} className="text-xs font-bold px-3 py-1 rounded-lg bg-black/40 text-slate-300 border border-white/5">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-white/10 py-12 mt-24 text-center text-slate-500 font-medium">
        <p>Built dynamically with AI</p>
      </footer>
    </div>
  );
}
`;

  return [
    { file: "package.json", data: JSON.stringify(packageJson, null, 2) },
    { file: "vite.config.ts", data: viteConfig },
    { file: "tailwind.config.js", data: tailwindConfig },
    { file: "postcss.config.js", data: postcssConfig },
    { file: "index.html", data: indexHtml },
    { file: "src/index.css", data: indexCss },
    { file: "src/main.tsx", data: mainTsx },
    { file: "src/App.tsx", data: appTsx },
  ];
}
