"use client";

import { useState, Suspense } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plane, Eye, EyeOff, User, Briefcase, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@/lib/types";

// Demo accounts for testing
const demoAccounts = [
  {
    role: "customer" as UserRole,
    name: "John Smith",
    email: "john@example.com",
    icon: User,
    redirect: "/customer/booking",
    description: "Book flights, manage tickets",
  },
  {
    role: "employee" as UserRole,
    name: "Sarah Johnson",
    email: "sarah@skyline.com",
    icon: Briefcase,
    redirect: "/employee/booking",
    description: "Manage bookings, view statistics",
  },
  {
    role: "manager" as UserRole,
    name: "Michael Chen",
    email: "michael@skyline.com",
    icon: Shield,
    redirect: "/manager/employees",
    description: "Full system access, approvals",
  },
];

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleDemoLogin = async (account: (typeof demoAccounts)[0]) => {
    setDemoLoading(account.role);
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.setItem("userRole", account.role);
    localStorage.setItem("userEmail", account.email);
    localStorage.setItem("userName", account.name);
    // If user came from search/guest booking with a returnUrl, redirect there
    if (returnUrl && account.role === "customer") {
      router.push(returnUrl);
      return;
    }
    // If user came from guest booking, redirect back there
    const pendingBooking = localStorage.getItem("pendingGuestBooking");
    if (pendingBooking && account.role === "customer") {
      router.push("/customer/booking?resumeGuest=1");
    } else {
      router.push(account.redirect);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);
    // If user came from search/guest booking with a returnUrl, redirect there
    if (returnUrl && role === "customer") {
      router.push(returnUrl);
      return;
    }
    // Check for pending guest booking
    const pendingBooking = localStorage.getItem("pendingGuestBooking");
    if (pendingBooking && role === "customer") {
      router.push("/customer/booking?resumeGuest=1");
      return;
    }
    switch (role) {
      case "customer":  router.push("/customer/booking");  break;
      case "employee":  router.push("/employee/booking");  break;
      case "manager":   router.push("/manager/employees"); break;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a3557] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mx-auto mb-4 flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your SkyLine account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Login as (Demo)</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select a role to explore different dashboards
              </p>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded border-input" />
                Remember me
              </label>
              {role === "customer" && (
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
