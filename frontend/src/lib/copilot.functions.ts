import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-middleware";
import { serverApiClient } from "@/lib/api-client";

export const getContextSnapshot = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/copilot/snapshot", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data; // backend returns { status: "success", data: snapshot }
  });

export const startCopilotConversation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ title: z.string().optional() }).parse(d))
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.post("/copilot/conversation", input, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const getCopilotHistory = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data } = await serverApiClient.get("/copilot/conversations", {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const getCopilotMessages = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ conversationId: z.string() }).parse(d)) // Relaxed uuid() validation since we use MongoDB ObjectIds now
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.get(`/copilot/conversations/${input.conversationId}/messages`, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });

export const sendCopilotMessage = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) =>
    z
      .object({
        conversationId: z.string(), // Relaxed uuid() for MongoDB ObjectIds
        message: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.post(
      `/copilot/conversations/${input.conversationId}/messages`, 
      { message: input.message },
      { headers: { Authorization: `Bearer ${context.token}` } }
    );
    return data.data;
  });

export const deleteCopilotConversation = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((d: unknown) => z.object({ conversationId: z.string() }).parse(d))
  .handler(async ({ data: input, context }) => {
    const { data } = await serverApiClient.delete(`/copilot/conversations/${input.conversationId}`, {
      headers: { Authorization: `Bearer ${context.token}` }
    });
    return data.data;
  });
