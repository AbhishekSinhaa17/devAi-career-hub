import { a as createMiddleware, b as getRequest } from "./server-CNwFEcD6.mjs";
import { a as axios } from "../_libs/axios.mjs";
import { e as env } from "./index.mjs";
function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [key, ...rest] = cookie.split("=");
    if (key) {
      cookies[key.trim()] = rest.join("=").trim();
    }
  });
  return cookies;
}
const requireAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }
    let token;
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
          token
        }
      });
    } catch (e) {
      throw new Error("Unauthorized: Invalid token format");
    }
  }
);
const apiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("devai_jwt");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("devai_jwt");
        localStorage.removeItem("devai_user");
        window.dispatchEvent(new Event("devai_auth_change"));
      }
    }
    return Promise.reject(error);
  }
);
const serverApiClient = axios.create({
  baseURL: env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
export {
  apiClient as a,
  requireAuth as r,
  serverApiClient as s
};
