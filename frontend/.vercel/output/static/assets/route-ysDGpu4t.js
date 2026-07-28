import{u as B,c as F,d as P,e as q,f as E,a as w,b as Q,r as g,j as e,L as u,t as G,O as V}from"./index-BX_SnE3X.js";import{u as N}from"./useQuery-D1P_b1j3.js";import{u as K}from"./useServerFn-BbY-O1UG.js";import{i as U}from"./admin.functions-Dn0dLmcJ.js";import{T as h}from"./ThemeToggle-Dq1JKPTj.js";import{S as W}from"./shield-DR5OVjAz.js";import{M as Z}from"./menu-Bbgtww-D.js";import{S as T}from"./sparkles-CTpFh98B.js";import{X as J}from"./x-DRCVPi8k.js";import{c as X}from"./createLucideIcon-BsSxXg-h.js";import{B as $}from"./briefcase-CeGeeMS6.js";import{B as L}from"./bot-tq4TBui7.js";import{A as v}from"./activity-BpoDB7bt.js";import{U as R}from"./user-vGoAQ0FB.js";import{H as ee}from"./house-DgGFKr5-.js";import{G as S}from"./github-DqBIeXy4.js";import{F as ae}from"./file-text-DaBTY4eS.js";import{C as re}from"./code-xml-DzJv0O1F.js";import{M as A}from"./message-square-Dxlk7QST.js";import{M as te}from"./map-DXgXVqlU.js";import{T as oe}from"./trophy-CdP9pEwo.js";import{Z as se}from"./zap-B94KOXkJ.js";import{C as ie}from"./chevron-right-CZzCo2Ft.js";import"./button-DRMr1fbf.js";import"./index-Bv-XA_vo.js";import"./index-B8k91cqS.js";import"./clsx-B-dksMZM.js";import"./utils-SWYxlXfx.js";import"./Combination-7VWQhpzB.js";import"./index-CPn1I4ml.js";import"./index-DBJp13ox.js";import"./index-CKdWpUgr.js";function ne(a){const r=B({warn:a?.router===void 0}),i=a?.router||r;return F(i.stores.__store,P(a,i))}const le=[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]],Y=X("layout-dashboard",le);const ce=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],de=X("log-out",ce),be=`
  @keyframes float-orb {
    0%,100% { transform:translate(0,0) scale(1); }
    33%      { transform:translate(14px,-10px) scale(1.03); }
    66%      { transform:translate(-8px,8px) scale(0.98); }
  }
  @keyframes logo-enter {
    from { opacity:0; transform:translateY(-8px) scale(0.95); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }
  @keyframes nav-item-enter {
    from { opacity:0; transform:translateX(-14px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes footer-enter {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes shimmer {
    from { transform:translateX(-100%); }
    to   { transform:translateX(100%); }
  }
  @keyframes active-glow-pulse {
    0%,100% { opacity:0.6; }
    50%      { opacity:1; }
  }
  @keyframes mobile-slide-up {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes drawer-slide-in {
    from { opacity:0; transform:translateX(-100%); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fade-in {
    from { opacity:0; }
    to   { opacity:1; }
  }

  /* ── Sidebar shell ── */
  .sidebar-shell {
    background: rgba(8, 8, 16, 0.55);
    backdrop-filter: blur(28px) saturate(180%);
    border-right: 1px solid rgba(255,255,255,0.07);
  }
  :root:not(.dark) .sidebar-shell {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(28px) saturate(180%);
    border-right: 1px solid rgba(0,0,0,0.07);
  }

  /* ── Mobile header ── */
  .mobile-header {
    background: rgba(8,8,16,0.7);
    backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  :root:not(.dark) .mobile-header {
    background: rgba(255,255,255,0.8);
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  /* ── Mobile bottom bar ── */
  .mobile-bottom {
    background: rgba(8,8,16,0.8);
    backdrop-filter: blur(24px);
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  :root:not(.dark) .mobile-bottom {
    background: rgba(255,255,255,0.9);
    border-top: 1px solid rgba(0,0,0,0.07);
  }

  /* ── Mobile drawer overlay ── */
  .drawer-overlay {
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    animation: fade-in 0.25s ease both;
  }
  .drawer-panel {
    background: rgba(8,8,16,0.95);
    backdrop-filter: blur(32px);
    border-right: 1px solid rgba(255,255,255,0.08);
    animation: drawer-slide-in 0.35s cubic-bezier(0.34,1.1,0.64,1) both;
    width: 280px;
  }
  :root:not(.dark) .drawer-panel {
    background: rgba(255,255,255,0.97);
    border-right: 1px solid rgba(0,0,0,0.08);
  }

  /* ── Logo box ── */
  .logo-box {
    background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
    border: 1px solid rgba(139,92,246,0.3);
    box-shadow: 0 0 18px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.08);
    position: relative;
    overflow: hidden;
  }
  .logo-box::after {
    content:'';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent, rgba(255,255,255,0.06), transparent);
    animation: shimmer 3s ease infinite;
  }

  /* ── Nav items ── */
  .nav-item {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    transition: background 0.25s ease, transform 0.25s cubic-bezier(0.34,1.1,0.64,1), box-shadow 0.25s ease;
  }
  .nav-item:hover {
    background: rgba(255,255,255,0.05);
    transform: translateX(3px);
  }
  :root:not(.dark) .nav-item:hover {
    background: rgba(0,0,0,0.04);
  }

  /* Active indicator bar */
  .nav-item::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 3px; height: 60%;
    background: linear-gradient(180deg, #6366f1, #a78bfa, #34d399);
    border-radius: 0 4px 4px 0;
    transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1);
  }
  .nav-item.active::before { transform: translateY(-50%) scaleY(1); }

  /* Active background + glow */
  .nav-item.active {
    background: rgba(99,102,241,0.1);
    box-shadow: inset 0 0 24px rgba(99,102,241,0.06), 0 1px 0 rgba(99,102,241,0.08);
  }
  :root:not(.dark) .nav-item.active {
    background: rgba(99,102,241,0.08);
  }

  /* Shimmer sweep on hover */
  .nav-item::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
    transform: translateX(-100%);
    transition: transform 0s;
  }
  .nav-item:hover::after {
    transform: translateX(100%);
    transition: transform 0.5s ease;
  }

  /* ── Section labels ── */
  .nav-section-label {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.2);
    padding: 0 14px;
    margin-bottom: 4px;
    margin-top: 16px;
  }
  :root:not(.dark) .nav-section-label { color: rgba(0,0,0,0.25); }

  /* ── Sign-out button ── */
  .signout-btn {
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
    color: rgba(255,255,255,0.35);
  }
  :root:not(.dark) .signout-btn {
    border-color: rgba(0,0,0,0.07);
    color: rgba(0,0,0,0.38);
  }
  .signout-btn:hover {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.22);
    color: #f87171;
    transform: translateX(2px);
  }

  /* ── Semantic text ── */
  .t-heading { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .t-heading { color: rgba(0,0,0,0.88); }
  .t-sub { color: rgba(255,255,255,0.38); }
  :root:not(.dark) .t-sub { color: rgba(0,0,0,0.38); }

  /* ── Mobile nav dot indicator ── */
  .mobile-nav-dot {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #818cf8;
    box-shadow: 0 0 6px #818cf8;
  }

  /* ── Theme Adaptations ── */
  .nav-icon-badge {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.07);
  }
  :root:not(.dark) .nav-icon-badge {
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.08);
  }
  .nav-icon-badge.active {
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.35);
  }

  .nav-icon { color: rgba(255,255,255,0.4); }
  :root:not(.dark) .nav-icon { color: rgba(0,0,0,0.45); }
  .nav-icon.active { color: #818cf8; }

  .nav-label { color: rgba(255,255,255,0.45); }
  :root:not(.dark) .nav-label { color: rgba(0,0,0,0.55); }
  .nav-label.active { color: rgba(255,255,255,0.92); }
  :root:not(.dark) .nav-label.active { color: rgba(0,0,0,0.9); }

  .mobile-icon-badge {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
  }
  :root:not(.dark) .mobile-icon-badge {
    background: rgba(0,0,0,0.04);
    border: 1px solid rgba(0,0,0,0.08);
  }
  .mobile-icon-badge.active {
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.3);
    box-shadow: 0 0 10px rgba(99,102,241,0.25);
  }

  .mobile-icon { color: rgba(255,255,255,0.35); }
  :root:not(.dark) .mobile-icon { color: rgba(0,0,0,0.45); }
  .mobile-icon.active { color: #818cf8; }

  .mobile-label { color: rgba(255,255,255,0.3); }
  :root:not(.dark) .mobile-label { color: rgba(0,0,0,0.4); }
  .mobile-label.active { color: #818cf8; }

  .footer-badge {
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.15);
  }
  :root:not(.dark) .footer-badge {
    background: rgba(99,102,241,0.04);
    border: 1px solid rgba(99,102,241,0.1);
  }

  /* ── Menu button ── */
  .menu-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    transition: background 0.2s, border-color 0.2s;
  }
  :root:not(.dark) .menu-btn {
    background: rgba(0,0,0,0.04);
    border-color: rgba(0,0,0,0.08);
  }
  .menu-btn:hover {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.25);
  }

  /* ── Scrollbar ── */
  .sidebar-scroll::-webkit-scrollbar { width: 4px; }
  .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
  }
  :root:not(.dark) .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
  }
`,H=[{label:"Overview",items:[{to:"/",icon:ee,label:"Home"},{to:"/dashboard",icon:Y,label:"Dashboard"},{to:"/copilot",icon:L,label:"AI Copilot"}]},{label:"Tools",items:[{to:"/github",icon:S,label:"GitHub Analyzer"},{to:"/github-resume",icon:S,label:"GitHub Resume"},{to:"/resume",icon:ae,label:"Resume Builder"},{to:"/code-review",icon:re,label:"Code Reviewer"},{to:"/mock-interview",icon:A,label:"Mock Interviews"},{to:"/interview",icon:A,label:"Interview Hub"}]},{label:"Career",items:[{to:"/roadmap",icon:te,label:"Roadmap"},{to:"/job-match",icon:$,label:"Job Match"},{to:"/developer-score",icon:v,label:"Developer Score"},{to:"/health-score",icon:v,label:"Health Score"},{to:"/leaderboard",icon:oe,label:"Leaderboard"}]},{label:"Account",items:[{to:"/profile",icon:R,label:"Profile"}]}],C=H.flatMap(a=>a.items);function z(){return e.jsx("div",{className:"pointer-events-none absolute inset-0 overflow-hidden","aria-hidden":!0,children:[{c:"#6366f1",s:180,x:"-20%",y:"5%",t:"18s",d:"0s"},{c:"#8b5cf6",s:140,x:"40%",y:"45%",t:"22s",d:"8s"},{c:"#10b981",s:100,x:"-10%",y:"82%",t:"20s",d:"14s"}].map((a,r)=>e.jsx("div",{className:"absolute rounded-full",style:{width:a.s,height:a.s,left:a.x,top:a.y,background:`radial-gradient(circle,${a.c},transparent 70%)`,opacity:.07,animation:`float-orb ${a.t} ${a.d} ease-in-out infinite`}},r))})}function _({animate:a,isPro:r}){return e.jsxs("div",{className:"flex items-center gap-3",style:{animation:a?"logo-enter 0.5s cubic-bezier(0.34,1.1,0.64,1) both":"none"},children:[e.jsx("div",{className:"logo-box h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",children:e.jsx(T,{className:"h-4.5 w-4.5 text-indigo-400 relative z-10",style:{width:18,height:18}})}),e.jsxs("div",{children:[e.jsxs("div",{className:"text-lg font-black tracking-tight leading-none t-heading flex items-center gap-2",children:["DevAI",r&&e.jsx("span",{className:"px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-500",children:"PRO"})]}),e.jsx("div",{className:"text-[9px] font-black uppercase tracking-[0.15em] t-sub mt-0.5",children:"Career Hub"})]})]})}function me({item:a,active:r,delay:i,animate:d,onClick:n}){const x=a.icon;return e.jsxs(u,{to:a.to,onClick:n,style:{animation:d?`nav-item-enter 0.4s ${i}ms cubic-bezier(0.34,1.1,0.64,1) both`:"none"},className:`nav-item flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold w-full ${r?"active":""}`,children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`nav-icon-badge h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${r?"active":""}`,children:e.jsx(x,{className:`nav-icon h-3.5 w-3.5 transition-colors duration-300 ${r?"active":""}`})}),e.jsx("span",{className:`nav-label transition-colors duration-300 text-[13px] ${r?"active":""}`,children:a.label})]}),r&&e.jsx(ie,{className:"h-3 w-3 flex-shrink-0",style:{color:"#818cf8",opacity:.6}})]})}function M({items:a,pathname:r,animate:i,onItemClick:d}){const n=a.find(t=>t.to==="/admin"),p=H.map(t=>({...t,items:t.items})).map(t=>t.label==="Account"&&n?{...t,items:[...t.items,n]}:t);let l=0;return e.jsx("div",{className:"space-y-0.5",children:p.map(t=>e.jsxs("div",{children:[e.jsx("div",{className:"nav-section-label",children:t.label}),t.items.map(b=>{const c=r===b.to||r.startsWith(b.to+"/");return l+=28,e.jsx(me,{item:b,active:c,delay:l,animate:i,onClick:d},b.to)})]},t.label))})}function I({onSignOut:a,animate:r}){return e.jsxs("button",{onClick:a,className:"signout-btn flex w-full items-center gap-3 px-4 py-3 text-[13px] font-bold",style:{animation:r?"footer-enter 0.5s 0.4s ease both":"none"},children:[e.jsx("div",{className:"h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0",style:{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.15)"},children:e.jsx(de,{className:"h-3.5 w-3.5 text-red-400/70"})}),"Sign out"]})}function O({animate:a}){return e.jsxs("div",{className:"footer-badge mx-2 mb-3 px-3 py-2.5 rounded-xl overflow-hidden relative",style:{animation:a?"footer-enter 0.5s 0.3s ease both":"none"},children:[e.jsx("div",{className:"absolute inset-0 pointer-events-none",style:{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.03),transparent)",animation:"shimmer 4s ease infinite"}}),e.jsxs("div",{className:"flex items-center gap-2.5 relative",children:[e.jsx("div",{className:"h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0",style:{background:"linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.25))",border:"1px solid rgba(99,102,241,0.3)"},children:e.jsx(se,{className:"h-3.5 w-3.5 text-indigo-400"})}),e.jsxs("div",{children:[e.jsx("div",{className:"text-[11px] font-black t-heading leading-none",children:"AI-Powered"}),e.jsx("div",{className:"text-[9px] t-sub mt-0.5 font-semibold",children:"All features active"})]}),e.jsx("div",{className:"ml-auto h-2 w-2 rounded-full flex-shrink-0",style:{background:"#34d399",boxShadow:"0 0 6px #34d399",animation:"active-glow-pulse 2s ease infinite"}})]})]})}function xe({children:a}){const r=ne({select:o=>o.location.pathname}),i=q(),d=E(),n=K(U),x=N({queryKey:["admin-access"],queryFn:()=>n()}),p=N({queryKey:["user-is-pro"],queryFn:async()=>{const{data:{session:o}}=await w.auth.getSession();if(!o)return{is_pro:!1};try{if((await n())?.isAdmin)return{is_pro:!0}}catch{}const{data:m}=await Q.get("/auth/me");let s=!1;return m?.is_pro&&(m.pro_expires_at?s=new Date(m.pro_expires_at)>new Date:s=!0),{is_pro:s}}}),[l,t]=g.useState(!1),[b,c]=g.useState(!1);g.useEffect(()=>{const o=setTimeout(()=>t(!0),60);return()=>clearTimeout(o)},[]),g.useEffect(()=>{c(!1)},[r]);const k=x.data?.isAdmin?{to:"/admin",icon:W,label:"Admin"}:void 0,y=k?[...C,k]:C;async function j(){await d.cancelQueries(),d.clear(),await w.auth.signOut(),G.success("Signed out"),i({to:"/login",replace:!0})}const D=[{to:"/dashboard",icon:Y,label:"Dashboard"},{to:"/github",icon:$,label:"Tools"},{to:"/copilot",icon:L,label:"Copilot"},{to:"/developer-score",icon:v,label:"Analytics"},{to:"/profile",icon:R,label:"Profile"}];return e.jsxs("div",{className:"flex min-h-screen bg-background text-foreground selection:bg-primary/20",children:[e.jsx("style",{children:be}),e.jsxs("aside",{className:"sidebar-shell sticky top-0 hidden h-screen w-64 flex-col md:flex z-40 flex-shrink-0 relative overflow-hidden",children:[e.jsx(z,{}),e.jsxs("div",{className:"flex h-[72px] items-center justify-between px-5 flex-shrink-0 relative z-10 w-full",children:[e.jsx(u,{to:"/dashboard",className:"flex items-center",children:e.jsx(_,{animate:l,isPro:p.data?.is_pro})}),e.jsx(h,{})]}),e.jsx("div",{className:"absolute inset-x-0 top-[72px] h-px",style:{background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)"}}),e.jsx("div",{className:"flex-1 overflow-y-auto sidebar-scroll px-3 py-3 relative z-10",children:e.jsx(M,{items:y,pathname:r,animate:l})}),e.jsx("div",{className:"h-px mx-3",style:{background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)"}}),e.jsxs("div",{className:"flex-shrink-0 py-3 relative z-10",children:[e.jsx(O,{animate:l}),e.jsx("div",{className:"px-2",children:e.jsx(I,{onSignOut:j,animate:l})})]})]}),e.jsxs("header",{className:"mobile-header fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between px-4 md:hidden",children:[e.jsx("button",{onClick:()=>c(!0),className:"menu-btn h-9 w-9 flex items-center justify-center","aria-label":"Open menu",children:e.jsx(Z,{className:"h-4 w-4 t-heading"})}),e.jsxs(u,{to:"/dashboard",className:"flex items-center gap-2",children:[e.jsx("div",{className:"logo-box h-8 w-8 rounded-xl flex items-center justify-center",children:e.jsx(T,{className:"h-3.5 w-3.5 text-indigo-400 relative z-10"})}),e.jsx("span",{className:"font-black text-base tracking-tight t-heading",children:"DevAI"})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(h,{}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx("div",{className:"h-2 w-2 rounded-full",style:{background:"#34d399",boxShadow:"0 0 6px #34d399"}}),e.jsx("span",{className:"text-[10px] font-black uppercase tracking-widest t-sub hidden xs:block",children:"Live"})]})]})]}),b&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"drawer-overlay fixed inset-0 z-50 md:hidden",onClick:()=>c(!1)}),e.jsxs("div",{className:"drawer-panel fixed inset-y-0 left-0 z-50 flex flex-col md:hidden overflow-hidden",children:[e.jsx(z,{}),e.jsxs("div",{className:"flex items-center justify-between px-5 h-14 flex-shrink-0 relative z-10",children:[e.jsx(_,{animate:!1,isPro:p.data?.is_pro}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(h,{}),e.jsx("button",{onClick:()=>c(!1),className:"menu-btn h-8 w-8 flex items-center justify-center","aria-label":"Close menu",children:e.jsx(J,{className:"h-4 w-4 t-heading"})})]})]}),e.jsx("div",{className:"h-px mx-4",style:{background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.3),transparent)"}}),e.jsx("div",{className:"flex-1 overflow-y-auto sidebar-scroll px-3 py-3 relative z-10",children:e.jsx(M,{items:y,pathname:r,animate:!1,onItemClick:()=>c(!1)})}),e.jsx("div",{className:"h-px mx-4",style:{background:"rgba(255,255,255,0.05)"}}),e.jsxs("div",{className:"flex-shrink-0 py-3 relative z-10",children:[e.jsx(O,{animate:!1}),e.jsx("div",{className:"px-2",children:e.jsx(I,{onSignOut:j,animate:!1})})]})]})]}),e.jsx("main",{className:"flex-1 w-full min-w-0 pt-14 pb-20 md:pt-0 md:pb-0",children:e.jsx("div",{className:"mx-auto max-w-7xl px-4 py-8 md:px-10 md:py-12",children:a})}),e.jsx("nav",{className:"mobile-bottom fixed inset-x-0 bottom-0 z-40 flex justify-around px-2 py-2 md:hidden",children:D.map((o,m)=>{const s=r===o.to||r.startsWith(o.to+"/"),f=o.icon;return e.jsxs(u,{to:o.to,className:"relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] gap-1 px-1 py-1.5 rounded-xl transition-all duration-200",style:{animation:`mobile-slide-up 0.4s ${m*50}ms ease both`,background:s?"rgba(99,102,241,0.1)":"transparent"},children:[e.jsx("div",{className:`mobile-icon-badge h-7 w-7 rounded-xl flex items-center justify-center transition-all duration-300 ${s?"active":""}`,children:e.jsx(f,{className:`mobile-icon h-3.5 w-3.5 transition-colors duration-300 ${s?"active":""}`})}),e.jsx("span",{className:`mobile-label text-[9px] font-black uppercase tracking-wide transition-colors duration-300 ${s?"active":""}`,children:o.label.split(" ")[0]}),s&&e.jsx("span",{className:"mobile-nav-dot"})]},o.to)})})]})}const Qe=()=>e.jsx(xe,{children:e.jsx(V,{})});export{Qe as component};
