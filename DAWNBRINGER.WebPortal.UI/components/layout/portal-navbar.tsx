"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Swords, LayoutDashboard, UserCircle, GamepadIcon, LogOut, Menu, X, Home, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

export function PortalNavbar({ session }: { session: Session }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Check if user is admin
    const isAdmin = session.user.role === "admin";

    const navigationItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/profile", label: "Profile", icon: UserCircle },
        { href: "/accounts", label: "Accounts", icon: GamepadIcon },
        ...(isAdmin ? [{ href: "/admin/dashboard", label: "Admin", icon: Shield }] : []),
    ];

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/dashboard"
                    className="group flex items-center gap-3 text-sm font-semibold cursor-pointer"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 transition-all duration-300 group-hover:bg-emerald-500/15 group-hover:glow-sm">
                        <Swords className="h-4.5 w-4.5 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <span className="hidden font-bold sm:inline">
                        Project <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">KONGOR</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 sm:flex">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-all duration-200 cursor-pointer",
                                pathname === item.href
                                    ? "bg-emerald-500/10 text-emerald-500 font-medium shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                            {pathname === item.href && (
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+0.5rem)] h-0.5 w-6 rounded-full bg-emerald-500" />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <div className="hidden items-center gap-3 sm:flex">
                        <div className="flex items-center gap-3 rounded-xl bg-secondary/40 pl-4 pr-3 py-1.5 transition-colors hover:bg-secondary/60">
                            <div className="text-right text-xs">
                                <p className="font-medium leading-tight">
                                    {session.user.discordGlobalName ?? session.user.discordUsername}
                                </p>
                                <p className="text-muted-foreground/60 leading-tight">via Discord</p>
                            </div>
                            {session.user.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.discordUsername ?? "Avatar"}
                                    className="h-8 w-8 rounded-lg ring-1 ring-border/50"
                                />
                            )}
                        </div>

                        <div className="h-6 w-px bg-border/50" />

                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/60 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            aria-label="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent sm:hidden cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="border-t border-border/50 bg-background/95 backdrop-blur-2xl sm:hidden animate-fade-in">
                    <div className="space-y-1 px-4 py-4">
                        <div className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 mb-3">
                            {session.user.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.discordUsername ?? "Avatar"}
                                    className="h-10 w-10 rounded-xl ring-2 ring-border/50"
                                />
                            )}
                            <div>
                                <p className="text-sm font-medium">
                                    {session.user.discordGlobalName ?? session.user.discordUsername}
                                </p>
                                <p className="text-xs text-muted-foreground/60">via Discord</p>
                            </div>
                        </div>

                        {navigationItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 cursor-pointer",
                                    pathname === item.href
                                        ? "bg-emerald-500/10 text-emerald-500 font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}

                        <div className="my-2 h-px bg-border/30" />

                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all duration-200 hover:text-destructive hover:bg-destructive/5 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
