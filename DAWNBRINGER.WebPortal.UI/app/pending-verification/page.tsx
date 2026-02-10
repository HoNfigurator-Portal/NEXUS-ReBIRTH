"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle, Loader2, CheckCircle, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export default function PendingVerificationPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleResend() {
        if (!session?.user?.discordID) return;

        setResending(true);
        setError(null);

        try {
            const response = await fetch("/api/resend-verification", {
                method: "POST",
            });

            if (response.ok) {
                setResent(true);
            } else {
                const data = await response.json();
                setError(data.error ?? "Failed to resend verification.");
            }
        } catch {
            setError("Could not connect to the server.");
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#5865F2]/[0.05] blur-[150px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm animate-fade-in">
                <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#5865F2]/[0.03] to-transparent pointer-events-none" />

                    <div className="relative flex flex-col items-center gap-6 text-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5865F2]/20 bg-[#5865F2]/10">
                            <MessageCircle className="h-8 w-8 text-[#5865F2]" />
                            <div className="absolute inset-0 rounded-2xl bg-[#5865F2]/5 blur-lg" />
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Check Your Discord DMs
                            </h1>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                We sent a verification link to your Discord DMs.
                                Click the link to activate your account.
                            </p>
                        </div>

                        {session?.user?.discordUsername && (
                            <div className="flex items-center gap-3 rounded-xl bg-secondary/60 px-5 py-3">
                                {session.user.image && (
                                    <img
                                        src={session.user.image}
                                        alt="Avatar"
                                        className="h-7 w-7 rounded-full ring-2 ring-border"
                                    />
                                )}
                                <span className="text-sm font-medium">
                                    {session.user.discordGlobalName ?? session.user.discordUsername}
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="flex w-full items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-left text-sm text-destructive">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="w-full space-y-3">
                            {resent ? (
                                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm font-medium text-emerald-500">
                                    <CheckCircle className="h-4 w-4" />
                                    Verification link resent! Check your DMs.
                                </div>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary px-4 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:border-border cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {resending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Resending...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="h-4 w-4" />
                                            Resend Verification Link
                                        </>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => router.push("/dashboard")}
                                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:scale-[1.01] cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                I Have Verified — Continue
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground/50">
                    Make sure you have DMs enabled from server members, or the
                    bot may not be able to message you.
                </p>
            </div>
        </div>
    );
}
