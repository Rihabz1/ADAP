"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("adap123");
  const [showPassword, setShowPassword] = useState(false);
  const [securityConfirmed, setSecurityConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      setError("Invalid credentials.");
      setBusy(false);
      return;
    }
    const next = search.get("next");
    router.push(next?.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-xs font-semibold text-[#0B2A55]">
        Username
        <input
          className="mt-2 h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-normal text-[#0B2A55] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          placeholder="Enter your username"
          required
          spellCheck={false}
        />
      </label>

      <label className="block text-xs font-semibold text-[#0B2A55]">
        Password
        <span className="relative mt-2 block">
          <input
            className="h-[52px] w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm font-normal text-[#0B2A55] outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#0B2A55]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600">
        <input
          type="checkbox"
          checked={securityConfirmed}
          onChange={(e) => setSecurityConfirmed(e.target.checked)}
          className="mt-1 size-4 shrink-0 cursor-pointer accent-[#03809A]"
          required
        />
        <span>
          আমি নিশ্চিত করছি যে, এই সিস্টেম ব্যবহারের জন্য আমি অনুমোদিত এবং
          প্রাপ্ত তথ্যের গোপনীয়তা ও নিরাপত্তা বজায় রাখব।
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <motion.button
        className="group flex h-14 w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#002556] to-[#03809A] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(3,128,154,0.22)] transition-shadow hover:shadow-[0_16px_34px_rgba(3,128,154,0.32)] disabled:pointer-events-none disabled:opacity-60"
        disabled={busy || !securityConfirmed}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
      >
        {busy ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Open Dashboard
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </>
        )}
      </motion.button>
    </form>
  );
}
