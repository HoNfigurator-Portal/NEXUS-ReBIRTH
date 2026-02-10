"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 Hour
const STORAGE_KEY = "kongor_last_activity";
const ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "click",
    "pointerdown",
];
const THROTTLE_MS = 30_000; // Update storage at most every 30 seconds

export function IdleTracker() {
    const { status } = useSession();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            signOut({ callbackUrl: "/login" });
        }, IDLE_TIMEOUT_MS);
    }, []);

    const handleActivity = useCallback(() => {
        const now = Date.now();

        if (now - lastUpdateRef.current > THROTTLE_MS) {
            lastUpdateRef.current = now;
            try {
                localStorage.setItem(STORAGE_KEY, String(now));
            } catch {
                // localStorage unavailable
            }
        }

        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        if (status !== "authenticated") return;

        try {
            localStorage.setItem(STORAGE_KEY, String(Date.now()));
        } catch {
            // localStorage unavailable
        }

        resetTimer();

        for (const event of ACTIVITY_EVENTS) {
            document.addEventListener(event, handleActivity, { passive: true });
        }

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                resetTimer();
            }
        };
        window.addEventListener("storage", handleStorageChange);

        const checkInterval = setInterval(() => {
            try {
                const lastActivity = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
                if (lastActivity > 0 && Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
                    signOut({ callbackUrl: "/login" });
                }
            } catch {
                // localStorage unavailable
            }
        }, 60_000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            for (const event of ACTIVITY_EVENTS) {
                document.removeEventListener(event, handleActivity);
            }
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(checkInterval);
        };
    }, [status, handleActivity, resetTimer]);

    return null;
}
