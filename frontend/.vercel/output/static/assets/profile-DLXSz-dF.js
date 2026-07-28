import{f as A,r as o,t as I,j as e}from"./index-BX_SnE3X.js";import{u as D}from"./useQuery-D1P_b1j3.js";import{u as $}from"./useMutation-D8-lAFzV.js";import{u as T}from"./useServerFn-BbY-O1UG.js";import{g as G,u as U}from"./ai.functions-DYVcuhJ0.js";import{I as h}from"./input-zKjDXulg.js";import{T as q}from"./textarea-CWcYuEJy.js";import{L as _}from"./label-Bb8Xa5pl.js";import{S as B,a as J,b as K,c as Q,d as R}from"./select-Dkw6Tczw.js";import{Z as V}from"./zap-B94KOXkJ.js";import{U as E}from"./user-vGoAQ0FB.js";import{C as L}from"./circle-check-CiKVxrGr.js";import{G as X}from"./github-DqBIeXy4.js";import{T as M}from"./trending-up-kIw5ydEG.js";import{F as W}from"./file-text-DaBTY4eS.js";import{W as Z}from"./wrench-MjOWabVF.js";import{P as H}from"./plus-DiJsxUH-.js";import{X as O}from"./x-DRCVPi8k.js";import{L as ee}from"./loader-circle-EKH5CPFX.js";import{S as ae}from"./sparkles-CTpFh98B.js";import"./utils-SWYxlXfx.js";import"./clsx-B-dksMZM.js";import"./index-CPn1I4ml.js";import"./index-Bv-XA_vo.js";import"./index-B8k91cqS.js";import"./Combination-7VWQhpzB.js";import"./index-DBJp13ox.js";import"./createLucideIcon-BsSxXg-h.js";import"./index-CKdWpUgr.js";import"./chevron-down-DUUfgQ-a.js";import"./chevron-up-Bf696SFV.js";const te=`
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(22px,-16px) scale(1.04); }
    66%      { transform:translate(-12px,12px) scale(0.97); }
  }
  @keyframes fade-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }
  @keyframes card-enter {
    from { opacity:0; transform:translateY(12px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes skill-pop {
    from { opacity:0; transform:scale(0.7) translateY(4px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes success-pop {
    0%   { transform:scale(0.6); opacity:0; }
    70%  { transform:scale(1.15); opacity:1; }
    100% { transform:scale(1); opacity:1; }
  }

  /* Glass panel */
  .glass-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    backdrop-filter: blur(14px);
  }
  :root:not(.dark) .glass-panel {
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(0,0,0,0.08);
  }

  /* Semantic text */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.42); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.42); }
  .t-body { color: rgba(255,255,255,0.65); }
  :root:not(.dark) .t-body { color: rgba(0,0,0,0.65); }

  /* Field inputs */
  .field-input {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: rgba(255,255,255,0.88) !important;
    transition: border-color 0.25s, box-shadow 0.25s !important;
    border-radius: 12px !important;
  }
  :root:not(.dark) .field-input {
    background: rgba(0,0,0,0.03) !important;
    border: 1px solid rgba(0,0,0,0.1) !important;
    color: rgba(0,0,0,0.88) !important;
  }
  .field-input:focus {
    border-color: rgba(99,102,241,0.55) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    outline: none !important;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.22) !important; }
  :root:not(.dark) .field-input::placeholder { color: rgba(0,0,0,0.28) !important; }

  /* Select trigger */
  .select-trigger-custom {
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: rgba(255,255,255,0.88) !important;
    border-radius: 12px !important;
    transition: border-color 0.25s !important;
  }
  :root:not(.dark) .select-trigger-custom {
    background: rgba(0,0,0,0.03) !important;
    border: 1px solid rgba(0,0,0,0.1) !important;
    color: rgba(0,0,0,0.88) !important;
  }
  .select-trigger-custom:focus, .select-trigger-custom[data-state=open] {
    border-color: rgba(99,102,241,0.5) !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
  }

  /* Skill chip */
  .skill-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.22);
    color: #818cf8;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  :root:not(.dark) .skill-chip {
    background: rgba(99,102,241,0.08);
    border-color: rgba(99,102,241,0.2);
  }
  .skill-chip:hover {
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.3);
    color: #f87171;
    box-shadow: 0 0 10px rgba(239,68,68,0.15);
    transform: scale(1.04);
  }
  .skill-chip .chip-x {
    opacity: 0.5;
    transition: opacity 0.2s;
  }
  .skill-chip:hover .chip-x { opacity: 1; }

  /* CTA button */
  .btn-cta {
    background: linear-gradient(135deg,#4f46e5,#7c3aed 60%,#6366f1);
    box-shadow: 0 0 22px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.2);
    transition: box-shadow 0.3s, transform 0.15s, opacity 0.2s;
    color: #fff;
    font-weight: 800;
    border-radius: 12px;
    border: none;
    position: relative;
    overflow: hidden;
  }
  .btn-cta:hover:not(:disabled) {
    box-shadow: 0 0 36px rgba(99,102,241,0.55), 0 6px 20px rgba(0,0,0,0.3);
  }
  .btn-cta:active:not(:disabled) { transform:scale(0.97); }
  .btn-cta:disabled { opacity:0.45; cursor:not-allowed; }

  /* Add skill button */
  .btn-add {
    background: rgba(99,102,241,0.12);
    border: 1px solid rgba(99,102,241,0.25);
    color: #818cf8;
    border-radius: 12px;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    font-weight: 700;
  }
  .btn-add:hover {
    background: rgba(99,102,241,0.2);
    border-color: rgba(99,102,241,0.4);
    box-shadow: 0 0 12px rgba(99,102,241,0.2);
  }
  .btn-add:active { transform:scale(0.96); }

  .divider-line { background: rgba(255,255,255,0.06); }
  :root:not(.dark) .divider-line { background: rgba(0,0,0,0.07); }
`;function re(){return e.jsx("div",{className:"pointer-events-none fixed inset-0 overflow-hidden -z-10","aria-hidden":!0,children:[{c:"#6366f1",s:480,x:"5%",y:"5%",d:"0s",t:"18s"},{c:"#8b5cf6",s:320,x:"75%",y:"10%",d:"7s",t:"22s"},{c:"#10b981",s:260,x:"80%",y:"68%",d:"14s",t:"20s"}].map((t,i)=>e.jsx("div",{className:"absolute rounded-full",style:{width:t.s,height:t.s,left:t.x,top:t.y,background:`radial-gradient(circle,${t.c},transparent 70%)`,opacity:.055,animation:`float-orb ${t.t} ${t.d} ease-in-out infinite`}},i))})}function se({color:t}){return e.jsx("div",{className:"absolute inset-x-0 top-0 h-px pointer-events-none",style:{background:`linear-gradient(90deg,transparent,${t}70,transparent)`}})}function l({icon:t,label:i,hint:d,children:r,delay:p}){return e.jsxs("div",{className:"space-y-2",style:{animation:`fade-up 0.45s ${p}ms ease both`},children:[e.jsxs(_,{className:"flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest t-sub",children:[e.jsx(t,{className:"h-3 w-3"}),i]}),r,d&&e.jsx("p",{className:"text-[11px] t-sub leading-relaxed",children:d})]})}const c=[{value:"junior",label:"Junior",color:"#60a5fa"},{value:"mid",label:"Mid",color:"#34d399"},{value:"senior",label:"Senior",color:"#a78bfa"},{value:"staff",label:"Staff",color:"#fbbf24"}];function De(){const t=T(G),i=T(U),d=A(),{data:r}=D({queryKey:["dashboard"],queryFn:()=>t()}),[p,v]=o.useState(""),[y,j]=o.useState(""),[k,N]=o.useState(""),[m,w]=o.useState("junior"),[s,f]=o.useState([]),[S,C]=o.useState(""),[P,z]=o.useState(!1);o.useEffect(()=>{r?.profile&&(v(r.profile.name??""),j(r.profile.bio??""),N(r.profile.github_username??""),w(r.profile.experience_level??"junior"),f(r.profile.skills??[]))},[r]);const b=$({mutationFn:()=>i({data:{name:p,bio:y,github_username:k,experience_level:m,skills:s}}),onSuccess:()=>{I.success("Profile updated!"),d.invalidateQueries({queryKey:["dashboard"]}),z(!0),setTimeout(()=>z(!1),2200)},onError:a=>I.error(a.message)});function F(){const a=S.trim();a&&!s.includes(a)&&f(n=>[...n,a]),C("")}const x=c.find(a=>a.value===m)??c[0];return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:te}),e.jsx(re,{}),e.jsxs("div",{className:"mx-auto max-w-2xl space-y-8 pb-16",children:[e.jsxs("header",{className:"space-y-4 pt-1",children:[e.jsxs("div",{className:"inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit",style:{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",animation:"fade-up 0.5s 0.05s ease both"},children:[e.jsx(V,{className:"h-3 w-3 text-indigo-400"}),e.jsx("span",{className:"text-[10px] font-black uppercase tracking-widest text-indigo-400",children:"Developer Profile"})]}),e.jsx("div",{style:{animation:"fade-up 0.5s 0.1s ease both"},children:e.jsxs("h1",{className:"text-4xl sm:text-5xl font-black tracking-tight leading-none t-heading",children:["Your",e.jsx("br",{}),e.jsx("span",{className:"bg-clip-text text-transparent",style:{backgroundImage:"linear-gradient(135deg,#818cf8 0%,#a78bfa 45%,#34d399 100%)"},children:"profile"})]})}),e.jsx("p",{className:"text-sm t-sub max-w-sm leading-relaxed",style:{animation:"fade-up 0.5s 0.15s ease both"},children:"Personalize DevAI's suggestions, roadmaps, and health scores for your exact situation."})]}),e.jsxs("form",{onSubmit:a=>{a.preventDefault(),b.mutate()},className:"glass-panel relative rounded-2xl overflow-hidden",style:{animation:"card-enter 0.5s 0.2s cubic-bezier(0.34,1.1,0.64,1) both"},children:[e.jsx(se,{color:"#6366f1"}),e.jsx("div",{className:"absolute -top-16 -left-16 h-40 w-40 rounded-full opacity-20 pointer-events-none",style:{background:"radial-gradient(circle,#6366f1,transparent 70%)"}}),e.jsx("div",{className:"absolute -bottom-16 -right-16 h-32 w-32 rounded-full opacity-10 pointer-events-none",style:{background:"radial-gradient(circle,#8b5cf6,transparent 70%)"}}),e.jsxs("div",{className:"relative flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]",children:[e.jsx("div",{className:"h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0",style:{background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.3)"},children:e.jsx(E,{className:"h-4 w-4 text-indigo-400"})}),e.jsxs("div",{children:[e.jsx("div",{className:"text-sm font-black t-heading",children:"Personal details"}),e.jsx("div",{className:"text-[11px] t-sub mt-0.5",children:"Used to tailor every AI recommendation"})]}),P&&e.jsxs("div",{className:"ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold",style:{background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.25)",color:"#34d399",animation:"success-pop 0.4s ease both"},children:[e.jsx(L,{className:"h-3.5 w-3.5"}),"Saved!"]})]}),e.jsxs("div",{className:"relative px-6 py-6 space-y-6",children:[e.jsx(l,{icon:E,label:"Display name",delay:60,children:e.jsx(h,{className:"field-input h-11",placeholder:"e.g. Alex Johnson",value:p,onChange:a=>v(a.target.value)})}),e.jsx(l,{icon:X,label:"GitHub username",hint:"Used to pull repository activity into your health score.",delay:100,children:e.jsxs("div",{className:"relative",children:[e.jsx("span",{className:"absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold t-sub select-none",children:"github.com/"}),e.jsx(h,{className:"field-input h-11 pl-[90px]",placeholder:"octocat",value:k,onChange:a=>N(a.target.value)})]})}),e.jsx("div",{className:"h-px divider-line"}),e.jsxs(l,{icon:M,label:"Experience level",delay:140,children:[e.jsxs(B,{value:m,onValueChange:w,children:[e.jsx(J,{className:"select-trigger-custom h-11",children:e.jsx(K,{})}),e.jsx(Q,{children:c.map(a=>e.jsx(R,{value:a.value,children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"h-2 w-2 rounded-full",style:{background:a.color}}),a.label]})},a.value))})]}),e.jsxs("div",{className:"flex gap-1.5 mt-2",style:{animation:"fade-in 0.4s ease both"},children:[c.map((a,n)=>{const g=c.findIndex(Y=>Y.value===m),u=n<=g;return e.jsx("div",{className:"h-1 flex-1 rounded-full transition-all duration-500",style:{background:u?x.color:"rgba(255,255,255,0.08)",boxShadow:u?`0 0 6px ${x.color}60`:"none"}},a.value)}),e.jsx("span",{className:"text-[10px] font-black ml-1 transition-colors duration-300",style:{color:x.color},children:x.label})]})]}),e.jsx(l,{icon:W,label:"Bio",hint:"A short summary of your background, goals, and experience.",delay:180,children:e.jsx(q,{className:"field-input resize-none",rows:4,placeholder:"I'm a frontend developer with 3 years of experience, focused on React and TypeScript…",value:y,onChange:a=>j(a.target.value)})}),e.jsx("div",{className:"h-px divider-line"}),e.jsxs(l,{icon:Z,label:"Skills",hint:"Press Enter or click + to add. Click a skill to remove it.",delay:220,children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx(h,{className:"field-input h-11 flex-1",placeholder:"e.g. React, TypeScript, Docker…",value:S,onChange:a=>C(a.target.value),onKeyDown:a=>{a.key==="Enter"&&(a.preventDefault(),F())}}),e.jsx("button",{type:"button",onClick:F,className:"btn-add h-11 w-11 flex items-center justify-center flex-shrink-0",children:e.jsx(H,{className:"h-4 w-4"})})]}),s.length>0&&e.jsx("div",{className:"flex flex-wrap gap-2 pt-1",children:s.map((a,n)=>e.jsxs("button",{type:"button",onClick:()=>f(g=>g.filter(u=>u!==a)),className:"skill-chip",style:{animation:`skill-pop 0.35s ${n*30}ms cubic-bezier(0.34,1.2,0.64,1) both`},title:"Click to remove",children:[a,e.jsx(O,{className:"chip-x h-3 w-3"})]},a))}),s.length===0&&e.jsx("p",{className:"text-[11px] t-sub italic pt-1",style:{animation:"fade-in 0.3s ease both"},children:"No skills added yet."}),s.length>0&&e.jsx("div",{className:"flex items-center justify-end",children:e.jsxs("span",{className:"text-[10px] font-bold px-2 py-0.5 rounded-full",style:{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",color:"#818cf8"},children:[s.length," skill",s.length!==1?"s":""]})})]})]}),e.jsxs("div",{className:"relative px-6 pb-6",style:{animation:"fade-up 0.45s 0.36s ease both"},children:[e.jsx("div",{className:"h-px divider-line mb-5"}),e.jsxs("button",{type:"submit",disabled:b.isPending,className:"btn-cta w-full h-12 flex items-center justify-center gap-2.5 text-sm",children:[e.jsx("div",{className:"absolute inset-0 pointer-events-none -skew-x-12",style:{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)",animation:b.isPending?"none":"shimmer 2.5s ease infinite"}}),b.isPending?e.jsxs(e.Fragment,{children:[e.jsx(ee,{className:"h-4 w-4 animate-spin relative z-10"}),e.jsx("span",{className:"relative z-10",children:"Saving profile…"})]}):P?e.jsxs(e.Fragment,{children:[e.jsx(L,{className:"h-4 w-4 relative z-10"}),e.jsx("span",{className:"relative z-10",children:"Profile saved!"})]}):e.jsxs(e.Fragment,{children:[e.jsx(ae,{className:"h-4 w-4 relative z-10"}),e.jsx("span",{className:"relative z-10",children:"Save profile"})]})]}),e.jsx("p",{className:"text-center text-[11px] t-sub mt-3 leading-relaxed",style:{animation:"fade-in 0.5s 0.5s ease both"},children:"Your profile data powers the AI roadmap, health score, and job match features."})]})]})]})]})}export{De as component};
