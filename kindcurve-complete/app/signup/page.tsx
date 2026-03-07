"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, PageShell } from "@/components/ui/shared";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/onboarding/q1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setError("");
    setLoading(true);
    const supabase = createClient();

    // Pass the next path through to the auth callback
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageShell>
        <div className="min-h-screen flex flex-col items-center justify-center text-center pb-16">
          <KCLogo size={60} className="mb-6" />
          <h1 className="text-2xl font-semibold mb-3">Check your email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs leading-relaxed mb-6">
            We&apos;ve sent a confirmation link to{" "}
            <strong className="text-gray-700 dark:text-gray-200">{email}</strong>.
            Click it to activate your account
            {nextPath !== "/onboarding/q1" && " and continue where you left off"}.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Check your spam folder if you don&apos;t see it within a minute.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center pb-16">
        <KCLogo size={60} className="mb-6" />
        <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          Start your giving journey in seconds
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
              onKeyDown={(e) => e.key === "Enter" && handleSignup()}
              className="w-full px-4 py-3 rounded-2xl border border-[#e8e4da] dark:border-kc-border bg-white dark:bg-kc-card text-base focus:outline-none focus:ring-2 focus:ring-kc-teal/50 transition-all"
              placeholder="Min 6 characters"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <TealButton
            onClick={handleSignup}
            disabled={loading || !email || password.length < 6}
          >
            {loading ? "Creating account…" : "Create account"}
          </TealButton>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{" "}
            <button
              onClick={() =>
                router.push(
                  nextPath !== "/onboarding/q1"
                    ? `/login?next=${encodeURIComponent(nextPath)}`
                    : "/login"
                )
              }
              className="text-kc-teal dark:text-kc-cyan font-medium hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
