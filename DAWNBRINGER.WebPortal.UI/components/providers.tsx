"use client";

import { SessionProvider } from "next-auth/react";
import { IdleTracker } from "@/components/idle-tracker";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <IdleTracker />
            {children}
        </SessionProvider>
    );
}
