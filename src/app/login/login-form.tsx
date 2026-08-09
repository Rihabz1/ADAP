"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [username, setUsername] = useState("analyst");
  const [password, setPassword] = useState("adap123");
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
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold">
        Username
        <input
          className="field mt-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm font-semibold">
        Password
        <input
          className="field mt-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <button className="btn-primary w-full py-3" disabled={busy}>
        {busy ? (
          "Signing in…"
        ) : (
          <>
            Open dashboard <ArrowRight size={17} />
          </>
        )}
      </button>
      <div className="flex gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
        <LockKeyhole size={16} className="mt-0.5 shrink-0" />
        <p>
          This gate is for demonstration only and is not production
          authentication.
        </p>
      </div>
    </form>
  );
}
