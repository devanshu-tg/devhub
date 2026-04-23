"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";
import { applyToHost, type ApplyToHostPayload } from "@/lib/api";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Kicker } from "@/components/ui/SectionHeader";

type Intent = ApplyToHostPayload["intent"];

const INTENT_OPTIONS: Array<{ value: Intent; label: string; desc: string }> = [
  { value: "meetup", label: "Host a meetup", desc: "Run a local TigerGraph meetup in your city." },
  { value: "sponsor", label: "Sponsor DevHub", desc: "Support a hackathon, workshop, or event." },
  { value: "both", label: "Both", desc: "Host and help sponsor — let's talk." },
];

export default function ApplyToHostPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [intent, setIntent] = useState<Intent>("meetup");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim() || !email.trim() || !city.trim() || !topic.trim() || !message.trim()) {
      toast.error("Please fill in every field.");
      return;
    }
    setSubmitting(true);
    try {
      await applyToHost({
        name: name.trim(),
        email: email.trim(),
        city: city.trim(),
        intent,
        topic: topic.trim(),
        message: message.trim(),
      });
      toast.success("Thanks — we'll be in touch.");
      setName("");
      setEmail("");
      setCity("");
      setIntent("meetup");
      setTopic("");
      setMessage("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submit failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--paper)] text-[14.5px] text-[color:var(--ink)] placeholder:text-[color:var(--fg-subtle)] focus:outline-none focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition";

  const labelClass = "block font-mono text-[11px] tracking-[0.14em] text-[color:var(--fg-muted)] uppercase mb-2";

  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-[color:var(--border)]">
        <GraphMotif density={0.6} opacity={0.35} seed={23} />
        <div className="relative max-w-[960px] mx-auto px-10 pt-12 pb-10">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-[13px] text-[color:var(--fg-muted)] hover:text-[color:var(--ink)] mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to events
          </Link>
          <Kicker className="mb-3">/ HOST YOUR OWN</Kicker>
          <h1 className="text-[44px] md:text-[52px] font-medium tracking-[-0.034em] leading-[1.05] text-[color:var(--ink)]">
            Apply to <span className="font-serif italic">host.</span>
          </h1>
          <p className="mt-4 text-[15px] text-[color:var(--fg-muted)] leading-[1.55] max-w-[580px]">
            Want to run a meetup in your city or sponsor a TigerGraph event? Fill this in and it lands straight in our inbox.
          </p>
        </div>
      </section>

      <section className="max-w-[720px] mx-auto w-full px-10 py-14">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className={labelClass}>Your name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Jane Doe"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="city" className={labelClass}>City / location</label>
            <input
              id="city"
                type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={inputClass}
              placeholder="Bangalore, India"
              required
            />
          </div>

          <div>
            <span className={labelClass}>What are you applying for?</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {INTENT_OPTIONS.map((opt) => {
                const active = intent === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIntent(opt.value)}
                    className={
                      "text-left p-4 rounded-lg border transition " +
                      (active
                        ? "border-[color:var(--accent)] bg-[color:var(--cream)]"
                        : "border-[color:var(--border)] bg-[color:var(--paper)] hover:border-[color:var(--border-strong)]")
                    }
                    aria-pressed={active}
                  >
                    <div className="font-semibold text-[13.5px] text-[color:var(--ink)] mb-1">{opt.label}</div>
                    <div className="text-[12px] text-[color:var(--fg-muted)] leading-[1.4]">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="topic" className={labelClass}>Topic / meetup theme</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={inputClass}
              placeholder="GraphRAG intro workshop, Fraud detection deep dive, …"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className={labelClass}>Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={inputClass + " min-h-[140px] resize-y"}
              placeholder="Tell us about your community, venue, budget — whatever helps."
              maxLength={2000}
              required
            />
            <div className="mt-1.5 text-right font-mono text-[10.5px] text-[color:var(--fg-subtle)]">
              {message.length} / 2000
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/events"
              className="px-5 py-2.5 rounded-full text-[13px] font-medium text-[color:var(--fg-muted)] hover:text-[color:var(--ink)]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : (<>Send <Send className="w-3.5 h-3.5" /></>)}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
