import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Mock form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number.");
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("You must be logged in to upgrade.");
      }

      // Update the user's profile to mark them as Pro
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from("profiles")
        .update({
          is_pro: true,
          pro_expires_at: expiresAt.toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Payment successful! Welcome to DevAI Pro.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple formatter for card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const formatted = val.replace(/(.{4})/g, "$1 ").trim();
    if (val.length <= 16) {
      setCardNumber(formatted);
    }
  };

  // Simple formatter for expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 4) {
      if (val.length > 2) {
        setExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
      } else {
        setExpiry(val);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-[#030712] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left Side - Order Summary */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 mb-4">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                Secure Checkout
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Upgrade to Pro
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              You're one step away from unlocking the ultimate developer toolkit.
            </p>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Order Summary</h3>
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">DevAI Pro Plan</p>
                  <p className="text-xs text-slate-500">Billed monthly</p>
                </div>
              </div>
              <p className="font-bold text-lg">$9.00</p>
            </div>

            <div className="py-4 space-y-3">
              {[
                "100 AI requests/day",
                "Mock Interviews & AI Copilot",
                "Portfolio Deploy to Vercel",
                "Priority AI (Gemini 2.5 Flash)",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.05]">
              <p className="font-bold text-slate-900 dark:text-white">Total due today</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">$9.00</p>
            </div>
          </div>
        </div>

        {/* Right Side - Payment Form */}
        <div className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-white/[0.08] rounded-3xl p-8 shadow-xl relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Details
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter any 16-digit number to simulate a successful payment.
            </p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Cardholder Name
              </Label>
              <Input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="h-12 rounded-xl bg-slate-50 dark:bg-white/[0.03]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Card Number
              </Label>
              <div className="relative">
                <Input
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="0000 0000 0000 0000"
                  className="h-12 pl-10 rounded-xl font-mono bg-slate-50 dark:bg-white/[0.03]"
                />
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expiry Date
                </Label>
                <Input
                  required
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="h-12 rounded-xl font-mono bg-slate-50 dark:bg-white/[0.03]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  CVC
                </Label>
                <div className="relative">
                  <Input
                    required
                    type="password"
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    className="h-12 rounded-xl font-mono bg-slate-50 dark:bg-white/[0.03]"
                  />
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-white shadow-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                "Pay $9.00"
              )}
            </Button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-slate-400 text-xs font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Payments are 100% secure and encrypted.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
