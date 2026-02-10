import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserCircle, Shield, GamepadIcon, Mail, Hash, AtSign, CheckCircle, ExternalLink } from "lucide-react";
import { getUser } from "@/lib/api-client";
import type { GetBasicAccountDTO } from "@/types";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.userID) {
        redirect("/login");
    }

    let accounts: GetBasicAccountDTO[] = [];

    if (session.user.zorgathToken) {
        try {
            const userData = await getUser(session.user.userID, session.user.zorgathToken);
            accounts = userData.accounts;
        } catch {
            // API Unavailable
        }
    }

    const mainAccount = accounts[0];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile</h1>
                <p className="mt-2 text-sm text-muted-foreground/70">
                    Manage your account settings and Discord connection.
                </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-lg shadow-black/5">
                <div className="relative bg-gradient-to-br from-[#5865F2]/10 via-[#5865F2]/5 to-transparent px-6 py-10 sm:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(88,101,242,0.08),transparent_60%)]" />
                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {session.user.image ? (
                            <img
                                src={session.user.image}
                                alt="Discord Avatar"
                                className="h-24 w-24 rounded-2xl ring-4 ring-background/80 shadow-xl"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#5865F2]/20 ring-4 ring-background/80">
                                <UserCircle className="h-12 w-12 text-[#5865F2]" />
                            </div>
                        )}
                        <div className="text-center sm:text-left">
                            <p className="text-2xl font-bold">
                                {session.user.discordGlobalName ?? session.user.discordUsername}
                            </p>
                            {session.user.discordGlobalName && (
                                <p className="mt-1 text-sm text-muted-foreground/70">
                                    @{session.user.discordUsername}
                                </p>
                            )}
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-500">
                                <CheckCircle className="h-3.5 w-3.5" />
                                Verified
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-px bg-border/30 sm:grid-cols-3">
                    <InfoCell icon={<Hash className="h-3.5 w-3.5" />} label="Discord ID" value={session.user.discordID} />
                    <InfoCell icon={<AtSign className="h-3.5 w-3.5" />} label="Username" value={session.user.discordUsername} />
                    <InfoCell icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={session.user.discordEmail ?? "\u2014"} />
                </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden shadow-lg shadow-black/5">
                <div className="flex items-center gap-3 border-b border-border/30 px-6 py-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                        <Shield className="h-4.5 w-4.5 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold">Account Information</h2>
                        <p className="text-xs text-muted-foreground/60">Your game account details</p>
                    </div>
                </div>
                <div className="grid gap-px bg-border/30 sm:grid-cols-3">
                    <InfoCell icon={<Hash className="h-3.5 w-3.5" />} label="User ID" value={String(session.user.userID)} />
                    <InfoCell icon={<GamepadIcon className="h-3.5 w-3.5" />} label="Main Account" value={mainAccount?.name ?? "\u2014"} />
                    <InfoCell icon={<UserCircle className="h-3.5 w-3.5" />} label="Total Accounts" value={String(accounts.length)} />
                </div>
            </div>
        </div>
    );
}

function InfoCell({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
    return (
        <div className="bg-card/30 px-6 py-5 transition-colors duration-200 hover:bg-card/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 uppercase tracking-wider">
                {icon}
                {label}
            </div>
            <p className="mt-2 font-mono text-sm font-medium truncate">{value}</p>
        </div>
    );
}
