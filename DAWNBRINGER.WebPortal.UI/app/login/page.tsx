"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Swords, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { ThrobLoader } from "@/components/ui/throb-loader";

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
    const error = searchParams.get("error");

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-emerald-500/[0.05] blur-[150px]" />
                <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-teal-500/[0.03] blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm animate-fade-in">
                <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />

                    <div className="relative mb-8 flex flex-col items-center gap-5 text-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 glow-sm">
                            <Swords className="h-8 w-8 text-emerald-500" />
                            <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-lg" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Sign in with your Discord account to continue.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="relative mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>
                                {error === "OAuthAccountNotLinked"
                                    ? "This Discord account is not linked to any Project KONGOR account."
                                    : error === "AccessDenied"
                                      ? "Your Discord account must have a verified email address."
                                      : "An error occurred during sign-in. Please try again."}
                            </span>
                        </div>
                    )}

                    <button
                        onClick={() =>
                            signIn("discord", { callbackUrl })
                        }
                        className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-[#5865F2] px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-[#5865F2]/20 transition-all duration-300 hover:bg-[#4752C4] hover:shadow-[#5865F2]/30 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        <DiscordIcon className="h-5 w-5" />
                        Continue with Discord
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </button>

                    <div className="relative mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground/50">
                        <div className="flex items-center gap-1.5">
                            <Shield className="h-3 w-3" />
                            <span>Encrypted</span>
                        </div>
                        <div className="h-3 w-px bg-border" />
                        <span>OAuth 2.0</span>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground/50">
                    By signing in, you agree to the Project KONGOR{" "}
                    <a
                        href="https://github.com/Project-KONGOR-Open-Source/NEXUS/blob/main/license"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 transition-colors hover:text-muted-foreground"
                    >
                        Terms and Conditions
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <ThrobLoader size={72} />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}

function DiscordIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );
}
