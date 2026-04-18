"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plane, Mail, ShieldCheck, KeyRound,
  ArrowLeft, CheckCircle2, RefreshCw, Eye, EyeOff, AlertCircle,
} from "lucide-react";

// ─── Primary color: dark navy (matching login background) ────────────────────
// #1a3557  → primary
// #22426b  → hover
// #1a3557/10 → light tint

type Step = "email" | "otp" | "password" | "done";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── Shared page wrapper ──────────────────────────────────────────────────────
function Wrap({ step, children }: { step: Step; children: React.ReactNode }) {
  const progress =
    step === "email" ? 33 : step === "otp" ? 66 : step === "password" ? 99 : 100;

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: "#1a3557" }}>
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 flex items-center gap-2 text-sm transition-colors w-fit"
          style={{ color: "rgba(255,255,255,0.7)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "#1a3557" }}
            />
          </div>

          {/* Logo */}
          <div className="pt-8 pb-2 flex flex-col items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg mb-3"
              style={{ background: "#1a3557" }}
            >
              <Plane className="h-7 w-7 text-white" />
            </div>
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1a3557" }}>
              SkyLine
            </p>
          </div>

          <div className="px-8 pb-8 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [otpValue, setOtpValue]   = useState(""); // single string 0-6 digits
  const [otpError, setOtpError]   = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [passError, setPassError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [expired, setExpired]     = useState(false); // true when countdown hits 0 after OTP sent

  const otpInputRef    = useRef<HTMLInputElement>(null);
  const newPassRef     = useRef<HTMLInputElement>(null);
  const confirmPassRef = useRef<HTMLInputElement>(null);

  // ── Countdown ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setExpired(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [countdown]);

  // ── Auto-redirect after success ─────────────────────────────────────────
  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(() => router.push("/customer/booking"), 3000);
    return () => clearTimeout(t);
  }, [step, router]);

  // ── focus OTP input when step changes ──────────────────────────────────
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // ── STEP 1: Send OTP ────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    generateOtp(); // simulate — any 6-digit code accepted
    setLoading(false);
    setOtpValue("");
    setOtpError("");
    setExpired(false);
    setCountdown(60);
    setStep("otp");
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = useCallback(() => {
    generateOtp(); // simulate new code
    setOtpValue("");
    setOtpError("");
    setExpired(false);
    setCountdown(60);
    setTimeout(() => otpInputRef.current?.focus(), 50);
  }, []);

  // ── OTP input: digits only, max 6 ──────────────────────────────────────
  const handleOtpInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpValue(raw);
    setOtpError("");
  };

  // ── STEP 2: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    // Frontend simulation: any 6-digit code passes
    setStep("password");
  };

  // ── STEP 3: Set new password ─────────────────────────────────────────────
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) {
      setPassError("Password must be at least 8 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Passwords do not match.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("done");
  };

  // ─── password strength ──────────────────────────────────────────────────
  const strength = !newPass.length ? 0
    : newPass.length < 4 ? 1
    : newPass.length < 6 ? 2
    : newPass.length < 8 ? 3 : 4;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#eab308", "#22c55e"][strength];

  // ─── OTP display boxes ──────────────────────────────────────────────────
  const digits = otpValue.padEnd(6, " ").split("");

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1 — Email
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "email") {
    return (
      <Wrap step="email">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
            style={{ background: "#1a3557/10", backgroundColor: "rgba(26,53,87,0.08)" }}>
            <Mail className="w-6 h-6" style={{ color: "#1a3557" }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your registered email — we'll send a verification code.
          </p>
        </div>

        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fp-email" className="text-gray-700 font-medium">Email Address</Label>
            <Input
              id="fp-email"
              type="email"
              required
              autoFocus
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 font-semibold text-white"
            style={{ background: "#1a3557" }}
          >
            {loading
              ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</span>
              : "Send Verification Code"
            }
          </Button>
        </form>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2 — OTP
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "otp") {
    return (
      <Wrap step="otp">
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
            style={{ backgroundColor: "rgba(26,53,87,0.08)" }}>
            <ShieldCheck className="w-6 h-6" style={{ color: "#1a3557" }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enter Verification Code</h1>
          <p className="text-sm text-gray-500 mt-1">
            A 6-digit code was sent to{" "}
            <span className="font-semibold text-gray-700">{email}</span>.
            <br />Please check your inbox and enter it below.
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-5">
          {/* ── Hidden real input, styled digit boxes on top ── */}
          <div className="relative">
            {/* Invisible input captures all typing */}
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otpValue}
              onChange={handleOtpInput}
              onFocus={() => setOtpError("")}
              maxLength={6}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
              style={{ caretColor: "transparent" }}
              aria-label="Verification code"
            />
            {/* Visual boxes */}
            <div
              className="flex justify-center gap-3 cursor-text"
              onClick={() => otpInputRef.current?.focus()}
            >
              {digits.map((d, i) => {
                const filled = i < otpValue.length;
                const active = i === otpValue.length && otpValue.length < 6;
                return (
                  <div
                    key={i}
                    className="w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-150 select-none"
                    style={{
                      borderColor: otpError
                        ? "#ef4444"
                        : active
                        ? "#1a3557"
                        : filled
                        ? "#1a3557"
                        : "#e5e7eb",
                      background: otpError
                        ? "#fef2f2"
                        : filled
                        ? "rgba(26,53,87,0.06)"
                        : "#fff",
                      color: "#1a3557",
                      boxShadow: active ? "0 0 0 3px rgba(26,53,87,0.15)" : "none",
                    }}
                  >
                    {filled ? d : ""}
                  </div>
                );
              })}
            </div>
          </div>

          {otpError && (
            <p className="text-center text-sm text-red-500 font-medium flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" /> {otpError}
            </p>
          )}

          <Button
            type="submit"
            disabled={otpValue.length < 6}
            className="w-full h-11 font-semibold text-white"
            style={{
              background: otpValue.length < 6 ? "#94a3b8" : "#1a3557",
              cursor: otpValue.length < 6 ? "not-allowed" : "pointer",
            }}
          >
            Verify Code
          </Button>

          {/* ── Countdown / expired prompt ── */}
          <div className="text-center">
            {!expired && countdown > 0 ? (
              <p className="text-sm text-gray-400">
                Resend code in <span className="font-semibold text-gray-600">{countdown}s</span>
              </p>
            ) : expired ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 space-y-2">
                <p className="flex items-center justify-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Haven't received the code?
                </p>
                <p className="text-xs text-amber-700">
                  Please check your spam folder, or resend a new code below.
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 font-semibold text-sm hover:underline"
                  style={{ color: "#1a3557" }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm font-medium hover:underline"
                style={{ color: "#1a3557" }}
              >
                Resend code
              </button>
            )}
          </div>
        </form>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3 — New Password
  // ═══════════════════════════════════════════════════════════════════════════
  if (step === "password") {
    return (
      <Wrap step="password">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
            style={{ backgroundColor: "rgba(26,53,87,0.08)" }}>
            <KeyRound className="w-6 h-6" style={{ color: "#1a3557" }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-5" noValidate>
          {/* New password */}
          <div className="space-y-2">
            <Label htmlFor="new-pass" className="text-gray-700 font-medium">New Password</Label>
            <div className="relative">
              <input
                ref={newPassRef}
                id="new-pass"
                type={showPass ? "text" : "password"}
                required
                placeholder="At least 8 characters"
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setPassError(""); }}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => { e.preventDefault(); setShowPass((v) => !v); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength bar */}
            {newPass.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4].map((lvl) => (
                  <div key={lvl} className="h-1 flex-1 rounded-full transition-colors"
                    style={{ background: strength >= lvl ? strengthColor : "#e5e7eb" }} />
                ))}
                <span className="text-xs ml-1 font-medium" style={{ color: strengthColor }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="conf-pass" className="text-gray-700 font-medium">Confirm Password</Label>
            <div className="relative">
              <input
                ref={confirmPassRef}
                id="conf-pass"
                type={showConf ? "text" : "password"}
                required
                placeholder="Re-enter your password"
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); setPassError(""); }}
                className={`flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10 ${
                  passError ? "border-red-400" : "border-input"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={(e) => { e.preventDefault(); setShowConf((v) => !v); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Match indicator — only show mismatch when something is typed */}
            {confirmPass.length > 0 && (
              <p className={`text-xs font-medium ${newPass === confirmPass ? "text-green-600" : "text-red-500"}`}>
                {newPass === confirmPass ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {passError && (
            <p className="text-sm text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {passError}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || !newPass || !confirmPass}
            className="w-full h-11 font-semibold text-white"
            style={{ background: "#1a3557" }}
          >
            {loading
              ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Updating…</span>
              : "Update Password"
            }
          </Button>
        </form>
      </Wrap>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4 — Done
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Wrap step="done">
      <div className="text-center py-6 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50">
          <CheckCircle2 className="w-9 h-9 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Password Updated!</h1>
        <p className="text-sm text-gray-500">
          Your password has been successfully reset.<br />
          Redirecting you to the home page…
        </p>
        <div className="flex justify-center">
          <div
            className="w-8 h-8 border-4 rounded-full animate-spin"
            style={{ borderColor: "rgba(26,53,87,0.2)", borderTopColor: "#1a3557" }}
          />
        </div>
        <Button
          onClick={() => router.push("/customer/booking")}
          className="w-full h-11 font-semibold text-white"
          style={{ background: "#1a3557" }}
        >
          Go to Home Now
        </Button>
      </div>
    </Wrap>
  );
}
