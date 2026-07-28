import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { a as authClient } from "./router-BcNxq6Cj.mjs";
import { a as apiClient } from "./api-client-CbTdHRmP.mjs";
import { B as Button } from "./button-DA2gxxPy.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/posthog-js.mjs";
import "../_libs/seroval.mjs";
import { S as Sparkles, f as CircleCheck, Y as CreditCard, E as Lock, K as LoaderCircle, _ as ShieldCheck } from "../_libs/lucide-react.mjs";
import "../_libs/@opentelemetry/api.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "crypto";
import "async_hooks";
import "util";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./server-CNwFEcD6.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/axios.mjs";
import "../_libs/form-data.mjs";
import "../_libs/combined-stream.mjs";
import "../_libs/delayed-stream.mjs";
import "path";
import "http";
import "https";
import "url";
import "fs";
import "../_libs/mime-types.mjs";
import "../_libs/mime-db.mjs";
import "../_libs/asynckit.mjs";
import "../_libs/es-set-tostringtag.mjs";
import "../_libs/get-intrinsic.mjs";
import "../_libs/es-object-atoms.mjs";
import "../_libs/es-errors.mjs";
import "../_libs/math-intrinsics.mjs";
import "../_libs/gopd.mjs";
import "../_libs/es-define-property.mjs";
import "../_libs/has-symbols.mjs";
import "../_libs/get-proto.mjs";
import "../_libs/dunder-proto.mjs";
import "../_libs/call-bind-apply-helpers.mjs";
import "../_libs/function-bind.mjs";
import "../_libs/hasown.mjs";
import "../_libs/has-tostringtag.mjs";
import "../_libs/proxy-from-env.mjs";
import "../_libs/https-proxy-agent.mjs";
import "net";
import "tls";
import "assert";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/agent-base.mjs";
import "events";
import "http2";
import "../_libs/follow-redirects.mjs";
import "zlib";
import "../_libs/zod.mjs";
import "../_libs/sentry__node.mjs";
import "../_libs/sentry__core.mjs";
import "../_libs/sentry__node-core.mjs";
import "../_libs/sentry__opentelemetry.mjs";
import "../_libs/@opentelemetry/semantic-conventions+[...].mjs";
import "../_libs/opentelemetry__sdk-trace-base.mjs";
import "../_libs/opentelemetry__core.mjs";
import "../_libs/opentelemetry__resources.mjs";
import "node:events";
import "node:diagnostics_channel";
import "node:child_process";
import "node:fs";
import "node:os";
import "node:path";
import "node:util";
import "node:readline";
import "../_libs/opentelemetry__instrumentation.mjs";
import "../_libs/opentelemetry__api-logs.mjs";
import "require-in-the-middle";
import "import-in-the-middle";
import "node:http";
import "node:https";
import "node:worker_threads";
import "diagnostics_channel";
import "worker_threads";
import "node:zlib";
import "node:net";
import "node:tls";
import "module";
import "../_libs/sentry__server-utils.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = reactExports.useState(false);
  const [cardNumber, setCardNumber] = reactExports.useState("");
  const [expiry, setExpiry] = reactExports.useState("");
  const [cvc, setCvc] = reactExports.useState("");
  const [name, setName] = reactExports.useState("");
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number.");
      return;
    }
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
      const {
        data: {
          session
        }
      } = await authClient.auth.getSession();
      if (!session) {
        throw new Error("You must be logged in to upgrade.");
      }
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await apiClient.post("/ai/checkout/upgrade", {
        is_pro: true,
        pro_expires_at: expiresAt.toISOString()
      });
      toast.success("Payment successful! Welcome to DevAI Pro.");
      navigate({
        to: "/dashboard"
      });
    } catch (err) {
      toast.error(err.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleCardNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/(.{4})/g, "$1 ").trim();
    if (val.length <= 16) {
      setCardNumber(formatted);
    }
  };
  const handleExpiryChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) {
      if (val.length > 2) {
        setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
      } else {
        setExpiry(val);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#030712] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider text-primary", children: "Secure Checkout" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black tracking-tight text-slate-900 dark:text-white", children: "Upgrade to Pro" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-slate-600 dark:text-slate-400", children: "You're one step away from unlocking the ultimate developer toolkit." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg mb-4 text-slate-900 dark:text-white", children: "Order Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/[0.05]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-slate-900 dark:text-white", children: "DevAI Pro Plan" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500", children: "Billed monthly" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-lg", children: "$9.00" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4 space-y-3", children: ["100 AI requests/day", "Mock Interviews & AI Copilot", "Portfolio Deploy to Vercel", "Priority AI (Gemini 2.5 Flash)"].map((feature, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-slate-600 dark:text-slate-400", children: feature })
        ] }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.05]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-slate-900 dark:text-white", children: "Total due today" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-black text-slate-900 dark:text-white", children: "$9.00" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-8 shadow-xl relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-5 w-5 text-primary" }),
          "Payment Details"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-slate-500 mt-1", children: "Enter any 16-digit number to simulate a successful payment." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCheckout, className: "space-y-6 relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "Cardholder Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "Jane Doe", className: "h-12 rounded-xl bg-slate-50 dark:bg-white/[0.03]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "Card Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: cardNumber, onChange: handleCardNumberChange, placeholder: "0000 0000 0000 0000", className: "h-12 pl-10 rounded-xl font-mono bg-slate-50 dark:bg-white/[0.03]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "Expiry Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: expiry, onChange: handleExpiryChange, placeholder: "MM/YY", className: "h-12 rounded-xl font-mono bg-slate-50 dark:bg-white/[0.03]" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "CVC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, type: "password", maxLength: 4, value: cvc, onChange: (e) => setCvc(e.target.value.replace(/\D/g, "")), placeholder: "123", className: "h-12 rounded-xl font-mono bg-slate-50 dark:bg-white/[0.03]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loading, className: "w-full h-12 rounded-xl font-bold text-white shadow-lg transition-all", style: {
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
        }, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin mr-2" }),
          "Processing Payment..."
        ] }) : "Pay $9.00" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-1.5 mt-4 text-slate-400 text-xs font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-500" }),
          "Payments are 100% secure and encrypted."
        ] })
      ] })
    ] })
  ] }) });
}
export {
  CheckoutPage as component
};
