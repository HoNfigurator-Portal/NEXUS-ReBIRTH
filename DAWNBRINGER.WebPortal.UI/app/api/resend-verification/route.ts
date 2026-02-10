import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { resendVerification } from "@/lib/api-client";

export async function POST() {
    const session = await auth();

    if (!session?.user?.discordID) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        await resendVerification(session.user.discordID);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[/api/resend-verification] Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to resend verification" },
            { status: 500 }
        );
    }
}
