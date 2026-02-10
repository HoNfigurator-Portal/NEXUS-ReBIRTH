import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Swords, Trophy, Coins, Star, GamepadIcon, ArrowRight, Hash, Sparkles } from "lucide-react";
import { getUser } from "@/lib/api-client";
import type { GetBasicUserDTO } from "@/types";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user?.userID) {
        redirect("/login");
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] via-transparent to-transparent pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider">Dashboard</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Welcome back,{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                            {session.user.discordGlobalName ?? session.user.discordUsername}
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground/70">
                        Here is an overview of your Project KONGOR Re:BIRTH profile.
                    </p>
                </div>
                {session.user.image && (
                    <img
                        src={session.user.image}
                        alt="Avatar"
                        className="relative hidden h-16 w-16 rounded-2xl ring-2 ring-border/30 shadow-lg sm:block"
                    />
                )}
            </div>

            <Suspense fallback={<StatsGridSkeleton />}>
                <StatsGrid session={session} />
            </Suspense>

            <div>
                <h2 className="mb-5 text-sm font-medium text-muted-foreground/70 uppercase tracking-wider">
                    Quick Actions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <QuickActionCard
                        icon={<Swords className="h-5 w-5" />}
                        title="Play Now"
                        description="Launch the game client and jump into a match."
                        href="#"
                        accent
                    />
                    <QuickActionCard
                        icon={<Trophy className="h-5 w-5" />}
                        title="View Statistics"
                        description="Check your match history and performance."
                        href="/accounts"
                    />
                    <QuickActionCard
                        icon={<Star className="h-5 w-5" />}
                        title="Manage Profile"
                        description="Update your Discord link and account settings."
                        href="/profile"
                    />
                </div>
            </div>
        </div>
    );
}

async function StatsGrid({ session }: { session: { user: { userID: number | null; zorgathToken: string | null } } }) {
    let userData: GetBasicUserDTO | null = null;

    if (session.user.userID && session.user.zorgathToken) {
        try {
            userData = await getUser(session.user.userID, session.user.zorgathToken);
        } catch {
            // API Unavailable — Show Fallback
        }
    }

    const accountCount = userData?.accounts?.length ?? 0;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                icon={<GamepadIcon className="h-4 w-4" />}
                label="Game Accounts"
                value={userData ? String(accountCount) : "\u2014"}
                color="emerald"
            />
            <StatCard
                icon={<Coins className="h-4 w-4" />}
                label="Gold Coins"
                value="\u2014"
                color="amber"
            />
            <StatCard
                icon={<Coins className="h-4 w-4" />}
                label="Silver Coins"
                value="\u2014"
                color="zinc"
            />
            <StatCard
                icon={<Hash className="h-4 w-4" />}
                label="User ID"
                value={session.user.userID ? String(session.user.userID) : "\u2014"}
                color="blue"
            />
        </div>
    );
}

const colorMap = {
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", glow: "group-hover:shadow-emerald-500/5" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500", glow: "group-hover:shadow-amber-500/5" },
    zinc: { bg: "bg-zinc-500/10", text: "text-zinc-400", glow: "group-hover:shadow-zinc-500/5" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", glow: "group-hover:shadow-blue-500/5" },
} as const;

function StatCard({
    icon,
    label,
    value,
    color = "emerald",
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: keyof typeof colorMap;
}) {
    const c = colorMap[color];
    return (
        <div className={`group rounded-2xl border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-border/70 hover:bg-card/70 hover:shadow-lg ${c.glow} backdrop-blur-sm`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} ${c.text} transition-transform duration-300 group-hover:scale-110`}>
                    {icon}
                </div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
        </div>
    );
}

function StatsGridSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="h-[120px] animate-pulse rounded-2xl border border-border/30 bg-card/30"
                />
            ))}
        </div>
    );
}

function QuickActionCard({
    icon,
    title,
    description,
    href,
    accent = false,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    accent?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`group flex gap-4 rounded-2xl border p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                accent
                    ? "border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.07] hover:border-emerald-500/30 hover:shadow-emerald-500/5"
                    : "border-border/50 bg-card/40 hover:bg-card/70 hover:border-border/70"
            } backdrop-blur-sm`}
        >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
                accent
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-secondary/60 text-muted-foreground group-hover:text-foreground group-hover:bg-secondary"
            }`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{title}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/70">
                    {description}
                </p>
            </div>
        </Link>
    );
}
