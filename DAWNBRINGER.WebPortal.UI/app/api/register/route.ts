import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { registerDiscordUser } from "@/lib/api-client";
import { APIError } from "@/lib/api-client";
import type { RegisterDiscordUserPayload } from "@/types";

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.discordID) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const payload: RegisterDiscordUserPayload = await request.json();
        const result = await registerDiscordUser(payload);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("[/api/register] Error:", error);
        if (error instanceof APIError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Registration failed" },
            { status: 500 }
        );
    }
}
