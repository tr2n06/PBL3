"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plane } from "lucide-react";
import { resendRegisterOtp, verifyRegisterOtp } from "@/lib/signup-api";

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!email) {
      router.push("/signup");
      return;
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await verifyRegisterOtp({
        email,
        code,
        reason: "register",
      });

      sessionStorage.removeItem("pendingRegister");
      alert("Email verified successfully");
      router.push("/login");
    } catch (error) {
      console.error("Verify register OTP failed:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Verify code failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage("");

    try {
      await resendRegisterOtp({
        email,
        reason: "register",
      });
      setCountdown(30);
    } catch (error) {
      console.error("Resend register OTP failed:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Resend code failed",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl">Verify Email</CardTitle>
          <CardDescription>
            Enter the verification code sent to {email}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleVerify}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter OTP code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="text-sm text-muted-foreground">
              {countdown > 0
                ? `Resend available in ${countdown}s`
                : "You can resend the code now"}
            </div>

            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={countdown > 0 || isResending}
              onClick={handleResend}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </Button>

            <Link href="/signup" className="text-sm text-primary hover:underline">
              Back to sign up
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}