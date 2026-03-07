"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, PageShell } from "@/components/ui/shared";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/onboarding/q1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Login doesn't need email confirmation — redirect directly
      router.push(nextPath);
      router.refresh();
    }
  };

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center pb-16">
        <KCLogo size={60} className="mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Log in to manage your Kind Curve
        </p>

        <div className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#e8e4da] dark:border-kc-border bg-white dark:bg-kc-card text-base focus:outline-none focus:ring-2 focus:ring-kc-teal/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-600 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 rounded-2xl border border-[#e8e4da] dark:border-kc-border bg-white dark:bg-kc-card text-base focus:outline-none focus:ring-2 focus:ring-kc-teal/50 transition-all"
              placeholder="Your password"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <TealButton
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Logging in…" : "Log in"}
          </TealButton>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Don&apos;t have an account?{" "}
            <button
              onClick={() =>
                router.push(
                  nextPath !== "/onboarding/q1"
                    ? `/signup?next=${encodeURIComponent(nextPath)}`
                    : "/signup"
                )
              }
              className="text-kc-teal dark:text-kc-cyan font-medium hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
