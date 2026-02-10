"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowRight, Sparkles } from "lucide-react";
import { ThrobLoader } from "@/components/ui/throb-loader";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token provided.");
            return;
        }

        async function verify() {
            try {
                const response = await fetch(
                    `/api/verify?token=${encodeURIComponent(token!)}`,
                    { method: "GET" }
                );

                const data = await response.json();

                if (response.ok) {
                    setStatus("success");
                    setMessage(data.message ?? "Your account has been verified successfully!");
                } else {
                    setStatus("error");
                    setMessage(data.error ?? "Verification failed. The token may be invalid or already used.");
                }
            } catch {
                setStatus("error");
                setMessage("Could not connect to the server. Please try again later.");
            }
        }

        verify();
    }, [token]);

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4">
            <div className="pointer-events-none absolute inset-0">
                <div className={`absolute left-1/2 top-1/3 -translate-x-1/2 h-[600px] w-[800px] rounded-full blur-[150px] transition-colors duration-700 ${
                    status === "success" ? "bg-emerald-500/[0.06]" :
                    status === "error" ? "bg-red-500/[0.04]" :
                    "bg-emerald-500/[0.04]"
                }`} />
            </div>

            <div className="relative z-10 w-full max-w-sm animate-fade-in">
                <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
                    <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-700 ${
                        status === "success" ? "bg-gradient-to-b from-emerald-500/[0.04] to-transparent opacity-100" :
                        status === "error" ? "bg-gradient-to-b from-red-500/[0.03] to-transparent opacity-100" :
                        "bg-gradient-to-b from-emerald-500/[0.02] to-transparent opacity-100"
                    }`} />

                    <div className="relative flex flex-col items-center gap-6 text-center">
                        {status === "loading" && (
                            <>
                                <ThrobLoader size={72} />
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Verifying Your Account
                                    </h1>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        Please wait while we verify your account.
                                    </p>
                                </div>
                            </>
                        )}

                        {status === "success" && (
                            <>
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 glow-md">
                                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                                    <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-lg" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <Sparkles className="h-4 w-4 text-emerald-500" />
                                        <h1 className="text-2xl font-bold tracking-tight">
                                            Account Verified!
                                        </h1>
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:scale-[1.01] cursor-pointer"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </>
                        )}

                        {status === "error" && (
                            <>
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
                                    <XCircle className="h-8 w-8 text-destructive" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        Verification Failed
                                    </h1>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary px-4 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:border-border cursor-pointer"
                                >
                                    Back to Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <ThrobLoader size={72} />
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}
