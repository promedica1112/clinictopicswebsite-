"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite px-5">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-white p-8"
      >
        <div className="h-11 w-11 rounded-xl bg-navy text-white flex items-center justify-center mb-5">
          <Lock size={18} />
        </div>
        <h1 className="font-heading font-bold text-xl text-navy mb-1">Admin Sign In</h1>
        <p className="text-sm text-slate mb-6">Clinic Topics content management</p>

        <label className="block text-xs font-semibold text-slate mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-teal"
          autoFocus
        />
        {error && <p className="text-xs text-urgent mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 rounded-full bg-navy text-white font-semibold py-2.5 text-sm hover:bg-teal transition-colors disabled:opacity-50"
        >
          {loading ? "Checking…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
