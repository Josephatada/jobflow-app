"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LoginForm({ next }: { next: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<"password" | "magic" | null>(null);

  async function signInWithPassword() {
    setLoading("password");
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else window.location.href = next;
    setLoading(null);
  }

  async function signInWithMagicLink() {
    setLoading("magic");
    setMessage("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setMessage(error ? error.message : "Check your email for a sign-in link.");
    setLoading(null);
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-[#a8a49e]">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-lg border border-[#2d2b27] bg-[#252320] px-3 text-sm text-[#f0ede8] outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/30"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>
      <label className="block text-xs font-medium text-[#a8a49e]">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-lg border border-[#2d2b27] bg-[#252320] px-3 text-sm text-[#f0ede8] outline-none focus:border-orange-600/50 focus:ring-2 focus:ring-orange-600/30"
          placeholder="Password"
          autoComplete="current-password"
        />
      </label>
      {message && <p className="text-xs text-[#a8a49e] leading-relaxed">{message}</p>}
      <Button
        className="w-full h-11 justify-center"
        disabled={!email || !password || loading !== null}
        onClick={signInWithPassword}
      >
        {loading === "password" ? "Signing in..." : "Sign in"}
      </Button>
      <button
        type="button"
        disabled={!email || loading !== null}
        onClick={signInWithMagicLink}
        className="w-full h-11 rounded-lg border border-[#2d2b27] bg-[#252320] text-sm font-semibold text-[#a8a49e] hover:bg-[#2d2b27] disabled:opacity-50"
      >
        {loading === "magic" ? "Sending link..." : "Email me a magic link"}
      </button>
    </div>
  );
}
