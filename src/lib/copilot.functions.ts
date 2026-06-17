import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi } from "./ai-gateway.server";

export const getContextSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    const db = context.supabase;

    // Fetch the most recent data from all relevant tables
    const [ghRes, resumeRes, jobMatchRes, scoresRes, mockIntRes, portfolioRes] = await Promise.all([
      db.from("github_resumes").select("developer_type, insights, resume_data").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("resumes").select("title, score, ai_suggestions").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("job_matches").select("job_role, ats_score, analysis").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("developer_scores").select("overall_score").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("mock_interviews").select("job_role, overall_score, feedback").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      db.from("portfolio_deployments").select("provider, status, deployment_url").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    return {
      github_inferred_profile: ghRes.data || null,
      latest_resume: resumeRes.data || null,
      latest_job_match: jobMatchRes.data || null,
      developer_health_score: scoresRes.data?.overall_score || null,
      latest_mock_interview: mockIntRes.data || null,
      portfolio_deployment: portfolioRes.data || null,
    };
  });

export const startCopilotConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ title: z.string().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    // 1. Get Snapshot
    const snapshot = await getContextSnapshot();

    // 2. Create Conversation
    const { data: convData, error } = await context.supabase
      .from("copilot_conversations")
      .insert({
        user_id: context.userId,
        title: data.title || "Career Discussion",
        context_snapshot: snapshot as any,
      }).select()
      .single();

    if (error) throw new Error("Failed to start conversation");
    return convData;
  });

export const getCopilotHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("copilot_conversations")
      .select("id, title, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data as any as { id: string; title: string; created_at: string }[];
  });

export const getCopilotMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: msgs, error } = await context.supabase
      .from("copilot_messages")
      .select("id, role, content, created_at")
      .eq("conversation_id", data.conversationId)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return msgs as any as { id: string; role: string; content: string; created_at: string }[];
  });

export const sendCopilotMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ 
    conversationId: z.string().uuid(),
    message: z.string().min(1)
  }).parse(d))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const userId = context.userId;

    // 1. Verify and fetch conversation
    const { data: conv, error: convErr } = await db
      .from("copilot_conversations")
      .select("context_snapshot")
      .eq("id", data.conversationId)
      .eq("user_id", userId)
      .single();

    if (convErr || !conv) throw new Error("Conversation not found");

    // 2. Save User Message
    await db.from("copilot_messages").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "user",
      content: data.message
    });

    // 3. Fetch past messages (limit to last 10 to save tokens)
    const { data: pastMsgs } = await db
      .from("copilot_messages")
      .select("role, content")
      .eq("conversation_id", data.conversationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const history = (pastMsgs || []).reverse().map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    // 4. Construct AI Context
    const systemPrompt = `You are the DevAI Career Copilot, an expert software engineering mentor and career coach.
You have access to the user's latest platform data. Use it to provide highly personalized, specific, and actionable advice.
DO NOT give generic advice if the data provides specific context. Always reference their actual skills, scores, and projects when relevant.

USER DATA SNAPSHOT:
${JSON.stringify(conv.context_snapshot, null, 2)}
`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...history
    ];

    // 5. Call AI
    const responseText = await callAi({
      messages: aiMessages as any,
      log: { endpoint: "copilotChat", userId }
    });

    // 6. Save Assistant Message
    const { data: savedMsg } = await db.from("copilot_messages").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: "assistant",
      content: responseText
    }).select().single();

    // Log the usage to analytics happens inside callAi automatically if log is provided.

    return savedMsg;
  });
