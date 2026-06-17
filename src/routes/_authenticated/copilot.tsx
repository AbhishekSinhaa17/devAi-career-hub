import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  startCopilotConversation,
  getCopilotHistory,
  getCopilotMessages,
  sendCopilotMessage,
} from "@/lib/copilot.functions";
import {
  Bot,
  User,
  Send,
  Plus,
  MessageSquare,
  Loader2,
  FileText,
  Github,
  Map,
  UserCheck,
  Sparkles,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_authenticated/copilot")({
  head: () => ({ meta: [{ title: "AI Career Copilot — DevAI" }] }),
  component: CopilotPage,
});

// ── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-400 dark:bg-indigo-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, index }: { msg: any; index: number }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-3 items-end animate-in fade-in slide-in-from-bottom-3 duration-300 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 h-8 w-8 rounded-2xl flex items-center justify-center shadow-sm ${
          isUser
            ? "bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30"
            : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/25 shadow-lg"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`relative max-w-[78%] group ${isUser ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-indigo-600 dark:bg-indigo-600 text-white rounded-br-sm"
              : "bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/8 text-slate-700 dark:text-slate-200 rounded-bl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1.5 prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-code:text-indigo-600 dark:prose-code:text-indigo-300 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-pre:bg-slate-900 dark:prose-pre:bg-black/40 prose-pre:border prose-pre:border-slate-700 dark:prose-pre:border-white/10">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Quick action card ───────────────────────────────────────────────────────
function QuickActionCard({
  icon: Icon,
  title,
  description,
  prompt,
  color,
  onClick,
  delay = 0,
}: {
  icon: any;
  title: string;
  description: string;
  prompt: string;
  color: string;
  onClick: (p: string) => void;
  delay?: number;
}) {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="group relative p-5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden
        bg-white dark:bg-white/[0.03]
        border border-slate-200 dark:border-white/8
        hover:border-slate-300 dark:hover:border-white/15
        shadow-sm dark:shadow-none"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        style={{ background: `radial-gradient(circle at top left, ${color}08, transparent 60%)` }}
      />

      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed line-clamp-2">
        {description}
      </p>

      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-0.5">
        <span className="text-xs font-semibold" style={{ color }}>
          Ask now
        </span>
        <ChevronRight className="h-3 w-3" style={{ color }} />
      </div>
    </button>
  );
}

// ── Sidebar conversation item ───────────────────────────────────────────────
function ConvItem({
  conv,
  isActive,
  onClick,
}: {
  conv: any;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-200 group ${
        isActive
          ? "bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20"
          : "hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
      }`}
    >
      <div
        className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
          isActive
            ? "bg-indigo-100 dark:bg-indigo-500/20"
            : "bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10"
        }`}
      >
        <MessageSquare
          className={`h-3.5 w-3.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"}`}
        >
          {conv.title}
        </p>
        {conv.created_at && (
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {new Date(conv.created_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </button>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
function CopilotPage() {
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [optimisticMsgs, setOptimisticMsgs] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const historyFn = useServerFn(getCopilotHistory);
  const startFn = useServerFn(startCopilotConversation);
  const msgsFn = useServerFn(getCopilotMessages);
  const sendFn = useServerFn(sendCopilotMessage);

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["copilotHistory"],
    queryFn: () => historyFn(),
  });

  const { data: serverMsgs } = useQuery({
    queryKey: ["copilotMsgs", activeConvId],
    queryFn: () => msgsFn({ data: { conversationId: activeConvId! } }),
    enabled: !!activeConvId,
  });

  const startMut = useMutation({
    mutationFn: (title?: string) => startFn({ data: { title: title || "New Conversation" } }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["copilotHistory"] });
      setActiveConvId(data.id);
      setOptimisticMsgs([]);
    },
  });

  const sendMut = useMutation({
    mutationFn: (msg: string) => sendFn({ data: { conversationId: activeConvId!, message: msg } }),
    onMutate: (msg) => {
      setOptimisticMsgs((prev) => [
        ...prev,
        { id: `opt-${Date.now()}`, role: "user", content: msg },
      ]);
      setInputMsg("");
    },
    onSuccess: (data: any) => {
      setOptimisticMsgs((prev) => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ["copilotMsgs", activeConvId] });
    },
  });

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [inputMsg]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [serverMsgs, optimisticMsgs, sendMut.isPending]);

  const displayMsgs = serverMsgs ? [...serverMsgs] : [];
  optimisticMsgs.forEach((opt) => {
    if (!displayMsgs.find((m) => m.id === opt.id)) displayMsgs.push(opt);
  });

  const handleSend = useCallback(() => {
    const msg = inputMsg.trim();
    if (!msg) return;
    if (!activeConvId) {
      startMut.mutate("Career Discussion", {
        onSuccess: (conv: any) => {
          sendFn({ data: { conversationId: conv.id, message: msg } }).then((data: any) => {
            setOptimisticMsgs([{ id: "opt-user-1", role: "user", content: msg }, data]);
            queryClient.invalidateQueries({
              queryKey: ["copilotMsgs", conv.id],
            });
          });
          setInputMsg("");
        },
      });
    } else {
      sendMut.mutate(msg);
    }
  }, [inputMsg, activeConvId, startMut, sendMut, sendFn, queryClient]);

  const handleQuickAction = useCallback(
    (prompt: string) => {
      if (!activeConvId) {
        startMut.mutate(prompt, {
          onSuccess: (conv: any) => {
            sendFn({ data: { conversationId: conv.id, message: prompt } }).then((data: any) => {
              setOptimisticMsgs([{ id: "opt-user-1", role: "user", content: prompt }, data]);
              queryClient.invalidateQueries({
                queryKey: ["copilotMsgs", conv.id],
              });
            });
          },
        });
      } else {
        setInputMsg(prompt);
        setTimeout(() => sendMut.mutate(prompt), 50);
      }
    },
    [activeConvId, startMut, sendMut, sendFn, queryClient],
  );

  const quickActions = [
    {
      icon: FileText,
      title: "Review My Resume",
      description: "Get specific improvements based on your target role and industry standards.",
      prompt:
        "Can you review my latest resume and suggest specific improvements based on my target job role?",
      color: "#f59e0b",
    },
    {
      icon: Github,
      title: "Analyse GitHub",
      description: "Discover which repositories to build next to level up your score.",
      prompt:
        "Look at my GitHub profile insights. What repositories should I build next to improve my score?",
      color: "#6366f1",
    },
    {
      icon: Map,
      title: "Build a Roadmap",
      description: "Get a personalised 3-month learning path tailored to your goals.",
      prompt:
        "Based on my current skills, can you generate a 3-month roadmap to become a Senior DevOps Engineer?",
      color: "#10b981",
    },
    {
      icon: UserCheck,
      title: "Interview Prep",
      description: "Practice with a live AI interviewer based on your real feedback history.",
      prompt:
        "Review my last mock interview feedback. Can you act as a technical interviewer and ask me a follow-up question?",
      color: "#ec4899",
    },
  ];

  const isPending = sendMut.isPending || startMut.isPending;
  const hasMessages = displayMsgs.length > 0;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-transparent">
      {/* ── Sidebar ── */}
      <aside className="hidden md:flex w-72 flex-col border-r border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] flex-shrink-0">
        {/* Sidebar header */}
        <div className="p-4 border-b border-slate-200 dark:border-white/8">
          <div className="flex items-center gap-2.5 mb-4 px-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">AI Copilot</p>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Online
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveConvId(null);
              setOptimisticMsgs([]);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/15 hover:-translate-y-px
              bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500
              text-white"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isHistoryLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400 dark:text-slate-600" />
            </div>
          ) : !history?.length ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700" />
              <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
                No conversations yet.
                <br />
                Start one below!
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 pb-1 pt-2">
                Recent
              </p>
              {history.map((conv: any) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConvId === conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setOptimisticMsgs([]);
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/8">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/8 border border-indigo-100 dark:border-indigo-500/15">
            <Zap className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium leading-snug">
              Full context from your DevAI profile
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main chat ── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Ambient backgrounds (dark only) */}
        <div className="fixed inset-0 pointer-events-none -z-10 hidden dark:block">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px]" />
        </div>

        {!hasMessages ? (
          /* ── Welcome screen ── */
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-2xl mx-auto">
              {/* Hero */}
              <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative inline-flex mb-6">
                  <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                  AI Career Copilot
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-lg mx-auto">
                  I have deep context on your DevAI profile, GitHub repos, interview history, and
                  job matches. Let's accelerate your career.
                </p>
              </div>

              {/* Quick action grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {quickActions.map((action, i) => (
                  <QuickActionCard
                    key={action.title}
                    {...action}
                    onClick={handleQuickAction}
                    delay={i * 80}
                  />
                ))}
              </div>

              {/* Hint */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-600 animate-in fade-in duration-700 delay-500">
                Or type your own question below ↓
              </p>
            </div>
          </div>
        ) : (
          /* ── Messages ── */
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6 pb-36">
              {displayMsgs.map((msg, i) => (
                <MessageBubble key={msg.id || i} msg={msg} index={i} />
              ))}

              {/* Typing indicator */}
              {isPending && (
                <div className="flex gap-3 items-end animate-in fade-in duration-200">
                  <div className="flex-shrink-0 h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/8 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div className="pointer-events-auto bg-gradient-to-t from-slate-50 dark:from-[#080810] via-slate-50/95 dark:via-[#080810]/95 to-transparent pt-8 pb-5 px-4">
            <div className="max-w-3xl mx-auto">
              <div
                className="relative flex items-end gap-3 p-2 rounded-2xl border shadow-lg transition-all duration-200
                bg-white dark:bg-white/[0.04]
                border-slate-200 dark:border-white/10
                shadow-slate-200/50 dark:shadow-black/20
                focus-within:border-indigo-300 dark:focus-within:border-indigo-500/40
                focus-within:shadow-indigo-100 dark:focus-within:shadow-indigo-500/10
                focus-within:shadow-xl"
              >
                <textarea
                  ref={textareaRef}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything about your career…"
                  className="flex-1 bg-transparent resize-none text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none pl-3 py-2 min-h-[40px] max-h-[180px] overflow-y-auto leading-relaxed"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputMsg.trim() || isPending}
                  className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200
                    bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:shadow-lg hover:shadow-indigo-500/25
                    hover:scale-[1.05] active:scale-95"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Send className="h-4 w-4 text-white translate-x-px" />
                  )}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-3">
                Copilot uses your personal DevAI context. AI responses may not always be accurate.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
