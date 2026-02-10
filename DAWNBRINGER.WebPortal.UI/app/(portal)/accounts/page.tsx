import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GamepadIcon, Crown, User as UserIcon, AlertCircle, Hash, Shield } from "lucide-react";
import { getUser } from "@/lib/api-client";
import type { GetBasicAccountDTO } from "@/types";

export default async function AccountsPage() {
    const session = await auth();

    if (!session?.user?.userID) {
        redirect("/login");
    }

    let accounts: GetBasicAccountDTO[] = [];
    let fetchError = false;

    if (session.user.zorgathToken) {
        try {
            const userData = await getUser(session.user.userID, session.user.zorgathToken);
            accounts = userData.accounts;
        } catch {
            fetchError = true;
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Game Accounts
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground/70">
                        Manage your in-game accounts and sub-accounts.
                    </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 transition-all duration-300 hover:bg-emerald-500/15">
                    <GamepadIcon className="h-5 w-5 text-emerald-500" />
                </div>
            </div>

            {fetchError && (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Failed to load accounts. The API may be unavailable.</span>
                </div>
            )}

            {!fetchError && accounts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/40 bg-card/30 backdrop-blur-sm">
                    <div className="flex flex-col items-center justify-center gap-5 p-16 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
                            <GamepadIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div>
                            <p className="font-semibold">No Accounts Found</p>
                            <p className="mt-2 text-sm text-muted-foreground/60">
                                You do not have any game accounts yet.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {accounts.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((account, index) => (
                        <div
                            key={account.id}
                            className={`group rounded-2xl border p-6 transition-all duration-300 backdrop-blur-sm hover:shadow-lg ${
                                index === 0
                                    ? "border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.06] hover:border-amber-500/30 hover:shadow-amber-500/5"
                                    : "border-border/50 bg-card/40 hover:bg-card/60 hover:border-border/70"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
                                    index === 0
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-secondary/50 text-muted-foreground group-hover:bg-secondary"
                                }`}>
                                    {index === 0 ? (
                                        <Crown className="h-5.5 w-5.5" />
                                    ) : (
                                        <UserIcon className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate text-base">{account.name}</p>
                                    <div className="mt-2 flex items-center gap-2.5 text-xs text-muted-foreground/60">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${
                                            index === 0
                                                ? "bg-amber-500/10 text-amber-500"
                                                : "bg-secondary/60 text-muted-foreground"
                                        }`}>
                                            {index === 0 ? (
                                                <>
                                                    <Shield className="h-3 w-3" />
                                                    Main
                                                </>
                                            ) : (
                                                "Sub"
                                            )}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            {account.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
