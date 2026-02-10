import { NextResponse } from "next/server";
import { verifyDiscordAccount } from "@/lib/api-client";
import { APIError } from "@/lib/api-client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "No verification token provided." }, { status: 400 });
    }

    try {
        await verifyDiscordAccount(token);
        return NextResponse.json({ success: true, message: "Account verified successfully." });
    } catch (error) {
        console.error("[/api/verify] Error:", error);
        if (error instanceof APIError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json(
            { error: "Failed to verify account. Please try again." },
            { status: 500 }
        );
    }
}
