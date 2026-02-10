import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { checkAccountNameAvailability } from "@/lib/api-client";
import { APIError } from "@/lib/api-client";

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.discordID) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    if (!name) {
        return NextResponse.json({ error: "Name parameter is required" }, { status: 400 });
    }

    try {
        const result = await checkAccountNameAvailability(name);
        return NextResponse.json(result);
    } catch (error) {
        if (error instanceof APIError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json(
            { error: "Failed to check account name" },
            { status: 500 }
        );
    }
}
