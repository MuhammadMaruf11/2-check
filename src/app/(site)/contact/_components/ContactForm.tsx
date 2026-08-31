"use client";

import { useState } from "react";
import { apiClient } from "@/lib/axios";
import Reveal from "@/components/site/Reveal";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      await apiClient.post("/contact", form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(error?.response?.data?.error || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Reveal>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Get in Touch</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-ink">Contact Us</h1>
        <p className="mt-3 text-foreground-muted">
          Questions, tips, or a product you think we should review? We&apos;d love to hear from you.
        </p>
      </Reveal>

      <Reveal delay={100}>
        {status === "success" ? (
          <div className="mt-10 rounded-lg border border-accent bg-accent-soft p-6 text-center">
            <p className="font-display text-lg font-semibold text-accent-strong">Message sent!</p>
            <p className="mt-2 text-sm text-accent-strong">We&apos;ll get back to you as soon as we can.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Subject (optional)</label>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-md border border-border px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            {status === "error" && <p className="text-sm text-danger">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-white hover:bg-ink-soft transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
      </Reveal>
    </div>
  );
}
