"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Plane, User, ChevronDown, LogOut, Ticket, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser } from "@/lib/profile-api";

function clearStoredAuth() {
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("vflight_user_points");
}

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Search booking state
  const [searchRef, setSearchRef] = useState("");

  const handleSearchBooking = () => {
    if (!searchRef.trim()) return;
    router.push(`/search-booking?code=${searchRef.trim().toUpperCase()}`);
    setSearchRef("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchBooking();
    }
  };

  // Auth state from localStorage
  const [userName, setUserName]   = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole]   = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number | null>(null);

  const handleLogout = () => {
    clearStoredAuth();
    setUserName(null);
    setUserEmail(null);
    setUserRole(null);
    setUserPoints(null);
    router.push("/login");
  };

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const role  = localStorage.getItem("userRole");
    if (!email || !role) {
      clearStoredAuth();
      setUserEmail(null);
      setUserRole(null);
      return;
    }

    setUserEmail(email);
    setUserRole(role);
    getCurrentUser()
      .then((me) => {
        setUserName(me.fullName);
        if (me.availablePoints !== undefined) {
          setUserPoints(me.availablePoints);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user profile in header:", err);
        clearStoredAuth();
        setUserName(null);
        setUserEmail(null);
        setUserRole(null);
        setUserPoints(null);
      });
  }, []);

  const dashboardHref =
    userRole === "employee" ? "/employee/booking"
    : userRole === "manager" ? "/manager/employees"
    : "/customer/booking";

  const navLinks = [
    { href: "/#destinations", label: "Destinations" },
    { href: "/#deals",        label: "Hot Deals"     },
    { href: "/#deals",        label: "Book Flight", highlight: true },
    { href: "/faq",           label: "FAQ"            },
    { href: "/#contact",      label: "Contact"        },
  ];

  const isLoggedIn = !!userRole;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo1.png" alt="SkyLine logo" width={44} height={44} className="h-11 w-auto object-contain" priority />
          <span className="text-xl font-bold text-foreground">SkyLine</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) =>
            link.highlight ? (
              <Link key={link.label} href={link.href}
                className="rounded-lg bg-[#0b5c66] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#094a52] flex items-center gap-1.5">
                ✈ {link.label}
              </Link>
            ) : (
              <Link key={link.label} href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                {link.label}
              </Link>
            )
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              {userRole !== "customer" && (
                <Button variant="ghost" asChild>
                  <Link href={dashboardHref}>
                    <Plane className="mr-1.5 h-4 w-4" /> Dashboard
                  </Link>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 px-3 border-gray-200">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {(userName ?? userEmail ?? "U")[0].toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate text-sm font-semibold">{userName ?? userEmail}</span>
                    
                    {userPoints !== null && (
                      <>
                        <div className="h-4 w-[1px] bg-gray-300 mx-1" />
                        <span className="flex items-center gap-1.5 text-sm font-bold text-[#0b5c66]">
                          <span className="text-[10px] leading-none mb-0.5 mt-0">🎟️</span>
                          {new Intl.NumberFormat("vi-VN").format(userPoints)} pts
                        </span>
                      </>
                    )}
                    
                    <ChevronDown className="h-3 w-3 opacity-60 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>
                    <p className="font-semibold">{userName ?? "User"}</p>
                    <p className="text-xs font-normal text-muted-foreground truncate">{userEmail}</p>
                    <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary capitalize">{userRole}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userRole === "customer" && (
                    <DropdownMenuItem asChild>
                      <Link href="/customer/my-tickets" className="gap-2 cursor-pointer">
                        <Ticket className="h-4 w-4" /> My Tickets
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userRole !== "customer" && (
                    <DropdownMenuItem asChild>
                      <Link href={dashboardHref} className="gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 mr-2 relative">
                <Input
                  placeholder="Mã đặt chỗ..."
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-36 h-9 text-xs pr-7 border-gray-200"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSearchBooking}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-[#0b5c66] hover:bg-transparent"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" asChild><Link href="/login">Log In</Link></Button>
              <Button asChild><Link href="/signup">Sign Up</Link></Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col gap-6 pt-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                <Image src="/logo1.png" alt="SkyLine logo" width={44} height={44} className="h-11 w-auto object-contain" priority />
                <span className="text-xl font-bold">SkyLine</span>
              </Link>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.label} href={link.href}
                    className={`text-lg font-medium transition-colors hover:text-foreground ${link.highlight ? "text-[#0b5c66] font-bold" : "text-muted-foreground"}`}
                    onClick={() => setIsOpen(false)}>
                    {link.highlight ? `✈ ${link.label}` : link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t">
                {isLoggedIn ? (
                  <>
                    <div className="rounded-lg border bg-muted/40 p-3">
                      <p className="font-semibold text-sm">{userName ?? "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary capitalize">{userRole}</span>
                    </div>
                    {userRole !== "customer" && (
                      <Button variant="outline" asChild>
                        <Link href={dashboardHref} onClick={() => setIsOpen(false)}>Dashboard</Link>
                      </Button>
                    )}
                    {userRole === "customer" && (
                      <Button variant="outline" asChild>
                        <Link href="/customer/my-tickets" onClick={() => setIsOpen(false)}>My Tickets</Link>
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => { handleLogout(); setIsOpen(false); }} className="gap-2">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2 w-full">
                      <Input
                        placeholder="Nhập mã đặt chỗ..."
                        value={searchRef}
                        onChange={(e) => setSearchRef(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 h-10 text-sm border-gray-200"
                      />
                      <Button
                        onClick={() => { handleSearchBooking(); setIsOpen(false); }}
                        className="bg-[#0b5c66] hover:bg-[#094a52] h-10 px-4 text-xs font-semibold"
                      >
                        Tìm kiếm
                      </Button>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/login" onClick={() => setIsOpen(false)}>Log In</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
