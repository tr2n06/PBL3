"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, LogOut, User, Home, type LucideIcon } from "lucide-react";
import { Footer } from "@/components/landing/footer";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userRole: "customer" | "employee" | "manager";
  userName: string;
  userEmail: string;
}

export function DashboardLayout({
  children,
  navItems,
  userRole,
  userName,
  userEmail,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const roleLabels = {
    customer: "Customer",
    employee: "Employee",
    manager: "Manager",
  };

  // Use router.push so browser back/forward buttons keep working
  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className={cn("fixed inset-y-0 left-0 z-40 hidden flex-col border-r bg-sidebar lg:flex transition-all duration-300", isSidebarCollapsed ? "w-[72px]" : "w-64")}>
        <div className={cn("flex h-16 items-center gap-2 border-b px-6", isSidebarCollapsed && "justify-center px-0")}>
          {/* Logo toggles sidebar collapse instead of redirecting */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            <Image
              src="/logo1.png"
              alt="SkyLine logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain shrink-0"
              priority
            />
            {!isSidebarCollapsed && (
              <span className="text-lg font-bold text-sidebar-foreground">
                SkyLine
              </span>
            )}
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
                  isSidebarCollapsed ? "justify-center px-2" : "px-3",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isSidebarCollapsed ? "justify-center px-2" : "px-3"
            )}
            title={isSidebarCollapsed ? "Back to Home" : undefined}
          >
            <Home className="h-5 w-5 shrink-0" />
            {!isSidebarCollapsed && <span>Back to Home</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex flex-1 flex-col transition-all duration-300", isSidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64")}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Image
                    src="/logo1.png"
                    alt="SkyLine logo"
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                    priority
                  />
                  <span className="text-lg font-bold">SkyLine</span>
                </Link>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t p-4">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Home className="h-5 w-5" />
                  Back to Home
                </Link>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo for mobile – toggles mobile menu Sheet */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="flex items-center gap-2 lg:hidden hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
          >
            <Image
              src="/logo1.png"
              alt="SkyLine logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
              priority
            />
            <span className="font-bold">SkyLine</span>
          </button>

          {/* Spacer for desktop */}
          <div className="hidden lg:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-medium">{userName}</div>
                  <div className="text-xs text-muted-foreground">
                    {roleLabels[userRole]}
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/${userRole}/profile`}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>

        {/* Footer – same as the landing page */}
        <Footer />
      </div>
    </div>
  );
}
