"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Swords, Eye, EyeOff, Loader2, Check, X, AlertCircle, KeyRound, UserPlus } from "lucide-react";
import { registerFormSchema, type RegisterFormValues } from "@/lib/validators";
import type { CheckAccountNameDTO } from "@/types";

export default function RegisterPage() {
    const { data: session, update: updateSession } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState<RegisterFormValues>({
        name: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
    const [nameChecking, setNameChecking] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    async function handleCheckName() {
        if (formData.name.length < 3) return;

        setNameChecking(true);
        try {
            const response = await fetch(`/api/check-account-name?name=${encodeURIComponent(formData.name)}`);
            if (response.ok) {
                const result: CheckAccountNameDTO = await response.json();
                setNameAvailable(result.isAvailable);
            } else {
                setNameAvailable(null);
            }
        } catch {
            setNameAvailable(null);
        } finally {
            setNameChecking(false);
        }
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setServerError(null);
        setErrors({});

        const result = registerFormSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const path = issue.path[0];
                if (path && !fieldErrors[path]) {
                    fieldErrors[path] = issue.message;
                }
            }
            setErrors(fieldErrors);
            return;
        }

        if (!session?.user?.discordID || !session?.user?.discordEmail) {
            setServerError("Discord session data is missing. Please sign in again.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    discordID: session.user.discordID,
                    discordUsername: session.user.discordUsername,
                    discordEmail: session.user.discordEmail,
                    discordAvatarHash: session.user.discordAvatar ?? null,
                    accountName: formData.name,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error ?? "Registration failed");
            }

            await updateSession();

            router.push("/pending-verification");
        } catch (error) {
            setServerError(
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function updateField(field: keyof RegisterFormValues, value: string) {
        setFormData((previous) => ({ ...previous, [field]: value }));
        if (errors[field]) {
            setErrors((previous) => {
                const next = { ...previous };
                delete next[field];
                return next;
            });
        }
        if (field === "name") {
            setNameAvailable(null);
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/4 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-emerald-500/[0.05] blur-[150px]" />
                <div className="absolute right-1/4 bottom-1/3 h-[300px] w-[300px] rounded-full bg-teal-500/[0.03] blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-md animate-fade-in">
                <div className="relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />

                    <div className="relative mb-8 flex flex-col items-center gap-5 text-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 glow-sm">
                            <Swords className="h-8 w-8 text-emerald-500" />
                            <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-lg" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Create Your Account
                            </h1>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Welcome,{" "}
                                <span className="font-medium text-foreground">
                                    {session?.user?.discordGlobalName ?? session?.user?.discordUsername ?? "player"}
                                </span>
                                . Set up your in-game account to continue.
                            </p>
                        </div>
                    </div>

                    {serverError && (
                        <div className="relative mb-6 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{serverError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="relative space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="name"
                                className="flex items-center gap-2 text-sm font-medium leading-none"
                            >
                                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                                Account Name
                            </label>
                            <div className="relative">
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(event) => updateField("name", event.target.value)}
                                    onBlur={handleCheckName}
                                    placeholder="Choose your in-game name"
                                    maxLength={15}
                                    autoComplete="username"
                                    className={`flex h-12 w-full rounded-xl border bg-background/50 px-4 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 ${
                                        nameAvailable === true ? "border-emerald-500/50 focus-visible:ring-emerald-500/50" :
                                        nameAvailable === false || errors.name ? "border-destructive/50 focus-visible:ring-destructive/50" :
                                        "border-input hover:border-border/80"
                                    }`}
                                />
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                    {nameChecking && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {nameAvailable === true && (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        </div>
                                    )}
                                    {nameAvailable === false && (
                                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10">
                                            <X className="h-3.5 w-3.5 text-destructive" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name}</p>
                            )}
                            {nameAvailable === false && (
                                <p className="text-xs text-destructive">
                                    This account name is already taken.
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground/60">
                                3-15 characters. Letters, numbers, hyphens, underscores, and backticks.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="flex items-center gap-2 text-sm font-medium leading-none"
                            >
                                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                                Game Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(event) =>
                                        updateField("password", event.target.value)
                                    }
                                    placeholder="Create a password for the game client"
                                    autoComplete="new-password"
                                    className={`flex h-12 w-full rounded-xl border bg-background/50 px-4 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 ${
                                        errors.password ? "border-destructive/50 focus-visible:ring-destructive/50" : "border-input hover:border-border/80"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-destructive">{errors.password}</p>
                            )}
                            <p className="text-xs text-muted-foreground/60">
                                Minimum 8 characters with uppercase, lowercase, digit, and special character.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="confirmPassword"
                                className="flex items-center gap-2 text-sm font-medium leading-none"
                            >
                                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                                Confirm Game Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(event) =>
                                        updateField("confirmPassword", event.target.value)
                                    }
                                    placeholder="Re-enter your password"
                                    autoComplete="new-password"
                                    className={`flex h-12 w-full rounded-xl border bg-background/50 px-4 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200 ${
                                        errors.confirmPassword ? "border-destructive/50 focus-visible:ring-destructive/50" : "border-input hover:border-border/80"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer"
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide confirm password"
                                            : "Show confirm password"
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-destructive">
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-emerald-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground/50">
                    This password is used to log in to the game client. Your web
                    portal access uses Discord authentication.
                </p>
            </div>
        </div>
    );
}
