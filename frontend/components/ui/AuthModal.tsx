"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  // Portal target only exists after mount (SSR safety).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setSuccess(null);
  };

  const handleTabChange = (tab: "login" | "signup") => {
    setActiveTab(tab);
    resetForm();
  };

  // Close on Escape + lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (activeTab === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
          resetForm();
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (error) {
          setError(error.message);
        } else {
          setSuccess("Account created! Please check your email to verify your account.");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px] cursor-default"
      />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] bg-[color:var(--paper)] border border-[color:var(--border)] rounded-[16px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-[color:var(--fg-subtle)] hover:text-[color:var(--ink)] hover:bg-[color:var(--bg-hover)] transition z-10"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        {/* Header */}
        <div className="px-7 pt-7 pb-4">
          <h2
            id="auth-modal-title"
            className="text-[24px] font-medium tracking-[-0.02em] text-[color:var(--ink)] leading-[1.2]"
          >
            {activeTab === "login" ? (
              <>
                Welcome <span className="font-serif italic">back.</span>
              </>
            ) : (
              <>
                Create an <span className="font-serif italic">account.</span>
              </>
            )}
          </h2>
          <p className="mt-1.5 text-[13.5px] text-[color:var(--fg-muted)] leading-[1.5]">
            {activeTab === "login"
              ? "Sign in to access your bookmarks, saved paths, and progress."
              : "Join DevHub to track learning, save resources, and join events."}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[color:var(--border)] mx-7">
          <button
            type="button"
            onClick={() => handleTabChange("login")}
            className={`flex-1 py-2.5 text-[13px] font-mono tracking-[0.08em] transition relative ${
              activeTab === "login"
                ? "text-[color:var(--ink)]"
                : "text-[color:var(--fg-subtle)] hover:text-[color:var(--fg-muted)]"
            }`}
          >
            SIGN IN
            {activeTab === "login" && (
              <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-[color:var(--accent)]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("signup")}
            className={`flex-1 py-2.5 text-[13px] font-mono tracking-[0.08em] transition relative ${
              activeTab === "signup"
                ? "text-[color:var(--ink)]"
                : "text-[color:var(--fg-subtle)] hover:text-[color:var(--fg-muted)]"
            }`}
          >
            SIGN UP
            {activeTab === "signup" && (
              <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-[color:var(--accent)]" />
            )}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-[12.5px] leading-[1.45]">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-[2px]" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[12.5px] leading-[1.45]">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-[2px]" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === "signup" && (
            <Field
              label="Display name"
              icon={<User className="w-4 h-4" />}
              type="text"
              value={displayName}
              onChange={setDisplayName}
              placeholder="Your name"
            />
          )}

          <Field
            label="Email"
            icon={<Mail className="w-4 h-4" />}
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />

          <Field
            label="Password"
            icon={<Lock className="w-4 h-4" />}
            type="password"
            value={password}
            onChange={setPassword}
            placeholder={activeTab === "signup" ? "Min. 6 characters" : "Your password"}
            required
            minLength={activeTab === "signup" ? 6 : undefined}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13.5px] font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {activeTab === "login" ? "Signing in…" : "Creating account…"}
              </>
            ) : activeTab === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-[12.5px] text-[color:var(--fg-muted)] text-center pt-1">
            {activeTab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("signup")}
                  className="text-[color:var(--accent)] hover:underline font-semibold"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleTabChange("login")}
                  className="text-[color:var(--accent)] hover:underline font-semibold"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );

  // Portal escapes any ancestor with `transform` / `filter` / `perspective`
  // (e.g. the sticky navbar) that would otherwise trap `position: fixed`.
  return createPortal(modal, document.body);
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11.5px] font-mono tracking-[0.08em] text-[color:var(--fg-subtle)]">
        {label.toUpperCase()}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--fg-subtle)] pointer-events-none">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full pl-11 pr-4 py-2.5 rounded-[10px] bg-[color:var(--bg-elev)] border border-[color:var(--border)] text-[14px] text-[color:var(--ink)] placeholder:text-[color:var(--fg-subtle)] focus:outline-none focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/15 transition"
        />
      </div>
    </div>
  );
}
