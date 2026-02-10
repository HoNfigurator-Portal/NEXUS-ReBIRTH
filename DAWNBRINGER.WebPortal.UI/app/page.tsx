import Link from "next/link";
import { Shield, Swords, Users, Github, ArrowRight, Zap, Globe, Lock } from "lucide-react";

export default function HomePage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[800px] w-[1000px] rounded-full bg-emerald-500/[0.07] blur-[150px]" />
                <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-emerald-600/[0.04] blur-[120px]" />
                <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-teal-600/[0.03] blur-[100px]" />
                <div className="absolute left-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-cyan-600/[0.02] blur-[80px]" />
            </div>

            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

            <div className="pointer-events-none absolute top-20 left-20 h-1.5 w-1.5 rounded-full bg-emerald-500/40 animate-pulse-glow" />
            <div className="pointer-events-none absolute top-40 right-32 h-1 w-1 rounded-full bg-emerald-400/30 animate-pulse-glow [animation-delay:1s]" />
            <div className="pointer-events-none absolute bottom-32 left-1/4 h-1.5 w-1.5 rounded-full bg-teal-500/30 animate-pulse-glow [animation-delay:2s]" />
            <div className="pointer-events-none absolute top-1/3 right-1/4 h-1 w-1 rounded-full bg-emerald-500/20 animate-pulse-glow [animation-delay:0.5s]" />

            <main className="relative z-10 flex flex-col items-center gap-16 px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-8 animate-fade-in">
                    <div className="group relative flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 glow-md float">
                        <Swords className="h-10 w-10 text-emerald-500 transition-transform duration-300 group-hover:scale-110" />
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-xl" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                            Project{" "}
                            <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
                                KONGOR
                            </span>
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/50" />
                            <p className="text-base font-medium tracking-[0.3em] uppercase text-emerald-500/70 sm:text-lg">
                                Re:BIRTH
                            </p>
                            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-500/50" />
                        </div>
                    </div>

                    <p className="max-w-xl text-base leading-relaxed text-muted-foreground/80 text-balance sm:text-lg">
                        The open-source community-driven revival platform for Heroes of Newerth.
                        Free forever.
                    </p>
                </div>

                <div className="grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3 animate-fade-in [animation-delay:0.15s]">
                    <FeatureCard
                        icon={<Shield className="h-6 w-6" />}
                        title="Secure"
                        description="Discord OAuth2 authentication with verified email enforcement."
                        gradient="from-emerald-500/20 to-teal-500/20"
                    />
                    <FeatureCard
                        icon={<Users className="h-6 w-6" />}
                        title="Community"
                        description="Manage accounts, clans, and connect with fellow players."
                        gradient="from-teal-500/20 to-cyan-500/20"
                    />
                    <FeatureCard
                        icon={<Swords className="h-6 w-6" />}
                        title="Play"
                        description="Register your account and jump straight into the action."
                        gradient="from-cyan-500/20 to-emerald-500/20"
                    />
                </div>

                <div className="flex flex-col items-center gap-6 animate-fade-in [animation-delay:0.3s]">
                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <Link
                            href="/login"
                            className="group relative inline-flex h-13 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-emerald-600 px-10 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:bg-emerald-500 hover:shadow-emerald-500/35 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                            <DiscordIcon className="h-5 w-5" />
                            Sign In with Discord
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                        <a
                            href="https://github.com/Project-KONGOR-Open-Source/NEXUS"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl border border-border bg-card/50 px-10 text-sm font-medium transition-all duration-300 hover:bg-accent hover:border-border/60 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
                        >
                            <Github className="h-4.5 w-4.5" />
                            View on GitHub
                        </a>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6 animate-fade-in [animation-delay:0.45s]">
                    <div className="flex items-center gap-8 text-xs text-muted-foreground/50">
                        <div className="flex items-center gap-1.5">
                            <Lock className="h-3 w-3" />
                            <span>Secure</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Globe className="h-3 w-3" />
                            <span>Open Source</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Zap className="h-3 w-3" />
                            <span>Free Forever</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground/40">
                        Project KONGOR Re:BIRTH always was and forever will be completely free.
                    </p>
                </div>
            </main>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    gradient,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    gradient: string;
}) {
    return (
        <div className="group relative flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/40 p-8 text-center transition-all duration-300 hover:bg-card/70 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5 backdrop-blur-sm">
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 transition-all duration-300 group-hover:bg-emerald-500/15 group-hover:scale-110 group-hover:glow-sm">
                {icon}
            </div>
            <h3 className="relative text-lg font-semibold">{title}</h3>
            <p className="relative text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
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
