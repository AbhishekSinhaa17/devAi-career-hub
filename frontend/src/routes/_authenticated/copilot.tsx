import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  startCopilotConversation,
  getCopilotHistory,
  getCopilotMessages,
  sendCopilotMessage,
  deleteCopilotConversation,
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
  Menu,
  Trash2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/_authenticated/copilot")({
  head: () => ({ meta: [{ title: "AI Career Copilot — DevAI" }] }),
  component: CopilotPage,
});

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-indigo-500/70 dark:bg-indigo-400/70 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg, index }: { msg: any; index: number }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex gap-4 items-end animate-in fade-in slide-in-from-bottom-3 duration-500 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      style={{ animationDelay: `${Math.min(index * 30, 150)}ms` }}
    >
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-md ${
          isUser
            ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
            : "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/25"
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      <div
        className={`relative max-w-[85%] md:max-w-[75%] group ${isUser ? "items-end" : "items-start"} flex flex-col`}
      >
        <div
          className={`px-5 py-4 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm backdrop-blur-sm ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/20"
              : "bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-slate-200 rounded-bl-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-2 prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-indigo-50 dark:prose-code:bg-indigo-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-medium prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 dark:prose-pre:bg-black/50 prose-pre:border prose-pre:border-slate-800 dark:prose-pre:border-white/10 prose-pre:shadow-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  prompt,
  color,
  onClick,
  delay = 0,
  disabled = false,
}: {
  icon: any;
  title: string;
  description: string;
  prompt: string;
  color: string;
  onClick: (p: string) => void;
  delay?: number;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => onClick(prompt)}
      disabled={disabled}
      className={`group relative p-4 md:p-5 rounded-3xl text-left transition-all duration-500 ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-indigo-500/10"
      } animate-in fade-in slide-in-from-bottom-4 overflow-hidden
        bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl
        border border-slate-200/50 dark:border-white/5
        hover:border-indigo-300 dark:hover:border-indigo-500/40`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 rounded-3xl"
        style={{ background: `radial-gradient(circle at 100% 100%, ${color}, transparent 70%)` }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-sm flex-shrink-0"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-[13px] flex-1 truncate">
            {title}
          </h3>
          <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0" style={{ color }} />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex-1 line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
}

function ConvItem({
  conv,
  isActive,
  onClick,
  onDelete,
}: {
  conv: any;
  isActive: boolean;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 group relative overflow-hidden ${
        isActive
          ? "bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 shadow-sm"
          : "hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent"
      }`}
    >
      <div
        className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          isActive
            ? "bg-indigo-500 shadow-sm shadow-indigo-500/20 text-white"
            : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 text-slate-500 dark:text-slate-400"
        }`}
      >
        <MessageSquare className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <p
          className={`text-sm font-semibold truncate transition-colors ${isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-200"}`}
        >
          {conv.title}
        </p>
        {conv.created_at && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(conv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>
      {onDelete && (
        <div
          className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
        >
          <div className="h-8 w-8 rounded-xl flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors bg-white dark:bg-slate-900 shadow-sm">
            <Trash2 className="h-4 w-4" />
          </div>
        </div>
      )}
    </button>
  );
}

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
  const deleteFn = useServerFn(deleteCopilotConversation);

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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["copilotHistory"] });
      setActiveConvId(data.id);
    },
  });

  const sendMut = useMutation({
    mutationFn: ({ msg, convId }: { msg: string; convId: string }) =>
      sendFn({ data: { conversationId: convId, message: msg } }),
    onSuccess: (data, variables) => {
      setOptimisticMsgs((prev) => [...prev, data]);
      queryClient.invalidateQueries({ queryKey: ["copilotMsgs", variables.convId] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { conversationId: id } }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["copilotHistory"] });
      if (activeConvId === id) {
        setActiveConvId(null);
        setOptimisticMsgs([]);
      }
    },
  });

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [inputMsg]);

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
    if (
      !displayMsgs.find(
        (m) => m.id === opt.id || (m.role === opt.role && m.content === opt.content),
      )
    ) {
      displayMsgs.push(opt);
    }
  });

  const isPending = sendMut.isPending || startMut.isPending;

  const handleSend = useCallback(() => {
    const msg = inputMsg.trim();
    if (!msg || isPending) return;

    setOptimisticMsgs((prev) => [...prev, { id: `opt-${Date.now()}`, role: "user", content: msg }]);
    setInputMsg("");

    if (!activeConvId) {
      startMut.mutate("Career Discussion", {
        onSuccess: (conv) => sendMut.mutate({ msg, convId: conv.id }),
      });
    } else {
      sendMut.mutate({ msg, convId: activeConvId });
    }
  }, [inputMsg, activeConvId, isPending, startMut, sendMut]);

  const handleQuickAction = useCallback(
    (prompt: string) => {
      if (isPending) return;

      setOptimisticMsgs((prev) => [
        ...prev,
        { id: `opt-${Date.now()}`, role: "user", content: prompt },
      ]);
      setInputMsg("");

      if (!activeConvId) {
        startMut.mutate(prompt, {
          onSuccess: (conv) => sendMut.mutate({ msg: prompt, convId: conv.id }),
        });
      } else {
        sendMut.mutate({ msg: prompt, convId: activeConvId });
      }
    },
    [activeConvId, isPending, startMut, sendMut],
  );

  const quickActions = [
    {
      icon: FileText,
      title: "Review My Resume",
      description: "Get specific improvements based on your target role and industry standards.",
      prompt: "Can you review my latest resume and suggest specific improvements based on my target job role?",
      color: "#f59e0b",
    },
    {
      icon: Github,
      title: "Analyse GitHub",
      description: "Discover which repositories to build next to level up your score.",
      prompt: "Look at my GitHub profile insights. What repositories should I build next to improve my score?",
      color: "#6366f1",
    },
    {
      icon: Map,
      title: "Build a Roadmap",
      description: "Get a personalised 3-month learning path tailored to your goals.",
      prompt: "Based on my current skills, can you generate a 3-month roadmap to become a Senior DevOps Engineer?",
      color: "#10b981",
    },
    {
      icon: UserCheck,
      title: "Interview Prep",
      description: "Practice with a live AI interviewer based on your real feedback history.",
      prompt: "Review my last mock interview feedback. Can you act as a technical interviewer and ask me a follow-up question?",
      color: "#ec4899",
    },
  ];

  const hasMessages = displayMsgs.length > 0;

  return (
    <div className="flex h-[calc(100dvh-130px)] md:h-[calc(100dvh-64px)] overflow-hidden bg-slate-50/50 dark:bg-transparent font-sans">
      
      {/* Sidebar */}
      <aside className="hidden md:flex w-[320px] flex-col border-r border-slate-200/60 dark:border-white/5 bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl flex-shrink-0 z-20">
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 blur-md"></div>
              <Bot className="h-5 w-5 text-white relative z-10" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">AI Copilot</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Ready to help
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveConvId(null);
              setOptimisticMsgs([]);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5
              bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          {isHistoryLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-300 dark:text-slate-700" />
            </div>
          ) : !history?.length ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-70">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-slate-400 dark:text-slate-600" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 text-center font-medium">
                No history yet.<br/>Start chatting below!
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 pb-2 pt-2">
                Recent Chats
              </p>
              {history.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeConvId === conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    setOptimisticMsgs([]);
                  }}
                  onDelete={() => deleteMut.mutate(conv.id)}
                />
              ))}
            </>
          )}
        </div>

        <div className="p-5 border-t border-slate-200/60 dark:border-white/5">
          <div className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100/50 dark:border-indigo-500/20 transition-all duration-300 hover:shadow-md cursor-help">
            <div className="h-8 w-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium leading-snug">
              Copilot uses deep context from your DevAI profile & repos.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">AI Copilot</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-10 w-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0 border-r border-slate-200 dark:border-white/5">
              {/* Similar sidebar content for mobile */}
              <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                <div className="p-5 border-b border-slate-200 dark:border-white/5">
                  <button
                    onClick={() => {
                      setActiveConvId(null);
                      setOptimisticMsgs([]);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    New Conversation
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                  {!history?.length ? (
                    <p className="text-sm text-center mt-10 text-slate-400">
                      No conversations yet.
                    </p>
                  ) : (
                    history.map((conv) => (
                      <ConvItem
                        key={conv.id}
                        conv={conv}
                        isActive={activeConvId === conv.id}
                        onClick={() => {
                          setActiveConvId(conv.id);
                          setOptimisticMsgs([]);
                        }}
                        onDelete={() => deleteMut.mutate(conv.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Dynamic Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>

        {!hasMessages ? (
          <div className="flex-1 overflow-hidden flex flex-col relative z-10 p-4">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center h-full pb-[100px] md:pb-[80px]">
              
              {/* Premium Hero Avatar */}
              <div className="relative group mb-4 animate-in fade-in zoom-in duration-700 shrink-0">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative h-16 w-16 rounded-[1rem] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-[1rem]"></div>
                  <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400 drop-shadow-md" />
                  
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                  </div>
                </div>
              </div>

              <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 shrink-0">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white mb-2 drop-shadow-sm">
                  DevAI Copilot
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-lg mx-auto font-medium hidden sm:block">
                  I'm your intelligent career assistant. I can review your resume, analyze your GitHub, prepare you for interviews, and map out your next big career move.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 w-full shrink">
                {quickActions.map((action, i) => (
                  <QuickActionCard
                    key={action.title}
                    {...action}
                    onClick={handleQuickAction}
                    delay={200 + i * 100}
                    disabled={isPending}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8 pb-40">
              {displayMsgs.map((msg, i) => (
                <MessageBubble key={msg.id || i} msg={msg} index={i} />
              ))}

              {isPending && (
                <div className="flex gap-4 items-end animate-in fade-in duration-300">
                  <div className="flex-shrink-0 h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="px-5 py-4 rounded-3xl rounded-bl-sm bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-white/10 shadow-sm backdrop-blur-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="absolute bottom-6 left-0 right-0 z-30 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div
              className="relative flex items-end gap-3 p-2 md:p-3 rounded-[2rem] transition-all duration-300
                bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl
                border border-slate-200/60 dark:border-white/10
                shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.3)]
                focus-within:border-indigo-400 dark:focus-within:border-indigo-500/50
                focus-within:shadow-[0_12px_50px_-12px_rgba(99,102,241,0.2)] dark:focus-within:shadow-[0_12px_50px_-12px_rgba(99,102,241,0.2)]"
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
                placeholder="Ask Copilot anything..."
                className="flex-1 bg-transparent resize-none text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none pl-5 py-3 md:py-4 min-h-[52px] md:min-h-[60px] max-h-[200px] overflow-y-auto leading-relaxed scrollbar-thin"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!inputMsg.trim() || isPending}
                className="flex-shrink-0 h-12 w-12 md:h-14 md:w-14 rounded-2xl md:rounded-[1.25rem] flex items-center justify-center transition-all duration-300
                    bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200
                    hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-500 dark:hover:to-purple-500
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                    shadow-lg shadow-slate-900/10 dark:shadow-white/10 hover:shadow-indigo-500/30
                    hover:scale-[1.05] active:scale-95 text-white dark:text-slate-900 dark:hover:text-white"
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 md:h-6 md:w-6 translate-x-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
