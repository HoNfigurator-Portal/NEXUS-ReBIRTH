import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, Users, Settings, Database, AlertTriangle, CheckCircle, Activity, BarChart3 } from "lucide-react";
import { Suspense } from "react";

export default async function AdminDashboardPage() {
    const session = await auth();

    if (!session?.user?.userID) {
        redirect("/login");
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.03] via-transparent to-transparent pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-xs font-medium text-red-500 uppercase tracking-wider">Admin Dashboard</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Admin Panel
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground/70">
                        System administration and management tools.
                    </p>
                </div>
            </div>

            <Suspense fallback={<AdminStatsSkeleton />}>
                <AdminStatsGrid />
            </Suspense>

            <div>
                <h2 className="mb-5 text-sm font-medium text-muted-foreground/70 uppercase tracking-wider">
                    Administration Tools
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <AdminToolCard
                        icon={<Users className="h-5 w-5" />}
                        title="User Management"
                        description="View and manage all user accounts."
                        href="/admin/users"
                        color="blue"
                    />
                    <AdminToolCard
                        icon={<Database className="h-5 w-5" />}
                        title="Database Status"
                        description="Monitor database performance and status."
                        href="/admin/database"
                        color="emerald"
                    />
                    <AdminToolCard
                        icon={<Settings className="h-5 w-5" />}
                        title="System Settings"
                        description="Configure system-wide settings."
                        href="/admin/settings"
                        color="amber"
                    />
                    <AdminToolCard
                        icon={<AlertTriangle className="h-5 w-5" />}
                        title="Security Logs"
                        description="View security events and alerts."
                        href="/admin/security"
                        color="red"
                    />
                    <AdminToolCard
                        icon={<Activity className="h-5 w-5" />}
                        title="System Health"
                        description="Monitor system health and performance."
                        href="/admin/health"
                        color="purple"
                    />
                    <AdminToolCard
                        icon={<BarChart3 className="h-5 w-5" />}
                        title="Analytics"
                        description="View usage statistics and analytics."
                        href="/admin/analytics"
                        color="zinc"
                    />
                </div>
            </div>
        </div>
    );
}

async function AdminStatsGrid() {
    // TODO: Fetch real admin stats from API
    const stats = {
        totalUsers: 0,
        activeUsers: 0,
        pendingVerifications: 0,
        systemUptime: "0h 0m",
    };

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard
                icon={<Users className="h-4 w-4" />}
                label="Total Users"
                value={String(stats.totalUsers)}
                color="blue"
            />
            <AdminStatCard
                icon={<Activity className="h-4 w-4" />}
                label="Active Users"
                value={String(stats.activeUsers)}
                color="emerald"
            />
            <AdminStatCard
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Pending Verifications"
                value={String(stats.pendingVerifications)}
                color="amber"
            />
            <AdminStatCard
                icon={<CheckCircle className="h-4 w-4" />}
                label="System Uptime"
                value={stats.systemUptime}
                color="purple"
            />
        </div>
    );
}

const adminColorMap = {
    blue: { bg: "bg-blue-500/10", text: "text-blue-500", glow: "group-hover:shadow-blue-500/5" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", glow: "group-hover:shadow-emerald-500/5" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-500", glow: "group-hover:shadow-amber-500/5" },
    red: { bg: "bg-red-500/10", text: "text-red-500", glow: "group-hover:shadow-red-500/5" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-500", glow: "group-hover:shadow-purple-500/5" },
    zinc: { bg: "bg-zinc-500/10", text: "text-zinc-400", glow: "group-hover:shadow-zinc-500/5" },
} as const;

function AdminStatCard({
    icon,
    label,
    value,
    color = "blue",
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color?: keyof typeof adminColorMap;
}) {
    const c = adminColorMap[color];
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

function AdminStatsSkeleton() {
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

function AdminToolCard({
    icon,
    title,
    description,
    href,
    color = "blue",
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    color?: keyof typeof adminColorMap;
}) {
    const c = adminColorMap[color];
    return (
        <a
            href={href}
            className={`group flex gap-4 rounded-2xl border p-6 transition-all duration-300 cursor-pointer hover:shadow-lg border-border/50 bg-card/40 hover:bg-card/70 hover:border-border/70 backdrop-blur-sm`}
        >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${c.bg} ${c.text}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground/70">
                    {description}
                </p>
            </div>
        </a>
    );
}
