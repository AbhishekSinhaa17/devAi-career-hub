import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [key, ...rest] = cookie.split("=");
    if (key) {
      cookies[key.trim()] = rest.join("=").trim();
    }
  });
  return cookies;
}

export const requireAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    let token: string | undefined;

    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    }

    if (!token) {
      const cookieHeader = request.headers.get("cookie") || "";
      const cookies = parseCookies(cookieHeader);
      token = cookies["devai_jwt"];
    }

    if (!token) {
      throw new Error("Unauthorized: No authorization token found");
    }

    try {
      const payloadBase64 = token.split(".")[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
      
      if (!payload.id) {
        throw new Error("Unauthorized: No user ID found in token");
      }

      return next({
        context: {
          userId: payload.id,
          token: token,
        },
      });
    } catch (e) {
      throw new Error("Unauthorized: Invalid token format");
    }
  },
);
