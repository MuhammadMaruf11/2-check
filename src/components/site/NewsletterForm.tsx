"use client";

import { useState } from "react";
import { apiClient } from "@/lib/axios";

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await apiClient.post("/newsletter", { email });
      setStatus("success");
      setEmail("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(error?.response?.data?.error || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className={dark ? "text-sm text-white/80" : "text-sm text-foreground-muted"}>
        You&apos;re on the list. Watch your inbox for our next verdict.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={
          dark
            ? "flex-1 rounded-md border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-accent"
            : "flex-1 rounded-md border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent"
        }
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-strong transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
      {status === "error" && <p className="text-xs text-danger sm:absolute sm:mt-10">{errorMsg}</p>}
    </form>
  );
}
