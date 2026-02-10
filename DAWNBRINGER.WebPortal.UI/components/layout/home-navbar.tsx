"use client";

import Link from "next/link";
import { Swords } from "lucide-react";

export function HomeNavbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link
                    href="/"
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
                    <Link
                        href="/"
                        className="relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-all duration-200 cursor-pointer bg-emerald-500/10 text-emerald-500 font-medium shadow-sm"
                    >
                        Home
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="https://github.com/Project-KONGOR-Open-Source/NEXUS"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/60 transition-all duration-200 hover:text-foreground hover:bg-accent cursor-pointer"
                        aria-label="View on GitHub"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.523 2 12 2z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
}
