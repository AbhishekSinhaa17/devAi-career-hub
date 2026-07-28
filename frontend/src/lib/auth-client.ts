import { apiClient } from "./api-client";
import { env } from "../env";

// Custom Auth Client mimicking the subset of Supabase Auth API used in the frontend

type Session = {
  user: any;
  access_token: string;
};

// Event listeners for auth state changes
const listeners: Set<(event: string, session: { user: any } | null) => void> = new Set();

// Listen to the custom event dispatched by api-client on 401s
if (typeof window !== "undefined") {
  window.addEventListener("devai_auth_change", () => {
    notifyListeners("SIGNED_OUT", null);
  });
}

function notifyListeners(event: string, session: { user: any } | null) {
  listeners.forEach((listener) => listener(event, session));
}

// Helper to set a cookie accessible by TanStack Start server functions
function setTokenCookie(token: string) {
  document.cookie = `devai_jwt=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = "devai_jwt=; path=/; max-age=0; SameSite=Lax";
}

function storeAuth(token: string, user: any) {
  localStorage.setItem("devai_jwt", token);
  localStorage.setItem("devai_user", JSON.stringify(user));
  setTokenCookie(token);
}

function clearAuth() {
  localStorage.removeItem("devai_jwt");
  localStorage.removeItem("devai_user");
  clearTokenCookie();
}

export const authClient = {
  auth: {
    async getSession() {
      const token = localStorage.getItem("devai_jwt");
      const userStr = localStorage.getItem("devai_user");
      
      if (!token || !userStr) {
        return { data: { session: null }, error: null };
      }
      
      try {
        const user = JSON.parse(userStr);
        return { data: { session: { user, access_token: token } }, error: null };
      } catch (e) {
        return { data: { session: null }, error: null };
      }
    },
    
    async getUser() {
      const { data: { session } } = await this.getSession();
      return { data: { user: session?.user || null }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            }
          }
        }
      };
    },

    async signInWithPassword({ email, password }: any) {
      try {
        const res = await apiClient.post("/auth/login", { email, password });
        const { token, user } = res.data.data || res.data;
        
        storeAuth(token, user);
        
        notifyListeners("SIGNED_IN", { user });
        return { data: { user, session: { access_token: token } }, error: null };
      } catch (error: any) {
        return { data: null, error: new Error(error.response?.data?.message || "Login failed") };
      }
    },

    async signUp({ email, password, options }: any) {
      try {
        const res = await apiClient.post("/auth/register", {
          email,
          password,
          full_name: options?.data?.full_name,
        });
        const { token, user } = res.data.data || res.data;
        
        storeAuth(token, user);
        
        notifyListeners("SIGNED_IN", { user });
        return { data: { user, session: { access_token: token } }, error: null };
      } catch (error: any) {
        return { data: null, error: new Error(error.response?.data?.message || "Registration failed") };
      }
    },

    async signInWithOAuth({ provider }: any): Promise<{ data: any, error: any }> {
      if (provider === "google") {
        const backendUrl = env.VITE_API_URL;
        window.location.href = `${backendUrl}/auth/google`;
        return { data: { url: `${backendUrl}/auth/google` }, error: null };
      }
      return { data: null, error: new Error(`${provider} OAuth is not supported.`) };
    },

    async exchangeGoogleCode(code: string) {
      try {
        const res = await apiClient.post("/auth/google/exchange", { code });
        const { token, user } = res.data.data || res.data;
        
        storeAuth(token, user);
        
        notifyListeners("SIGNED_IN", { user });
        return { data: { user, session: { access_token: token } }, error: null };
      } catch (error: any) {
        return { data: null, error: new Error(error.response?.data?.message || "Google OAuth exchange failed") };
      }
    },

    async signOut() {
      clearAuth();
      notifyListeners("SIGNED_OUT", null);
      return { error: null };
    }
  },
};
