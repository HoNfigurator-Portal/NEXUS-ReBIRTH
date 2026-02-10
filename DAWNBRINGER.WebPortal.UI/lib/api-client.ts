import type {
    GetAuthenticationTokenDTO,
    GetBasicUserDTO,
    GetDiscordUserDTO,
    RegisterDiscordUserPayload,
    CheckAccountNameDTO,
    UserProfile,
} from "@/types";

const ZORGATH_API_URL = process.env.ZORGATH_API_URL;

class APIError extends Error {
    constructor(
        public status: number,
        message: string
    ) {
        super(message);
        this.name = "APIError";
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${ZORGATH_API_URL}${path}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(response.status, errorText);
    }

    return response.json() as Promise<T>;
}

function authenticatedRequest<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    return request<T>(path, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
}

// Authentication Endpoints

export async function registerDiscordUser(
    payload: RegisterDiscordUserPayload
): Promise<GetDiscordUserDTO> {
    return request<GetDiscordUserDTO>("/User/RegisterDiscord", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getUserByDiscordID(
    discordID: string
): Promise<GetDiscordUserDTO | null> {
    try {
        return await request<GetDiscordUserDTO>(
            `/User/Discord/${discordID}`,
            { method: "GET" }
        );
    } catch (error) {
        if (error instanceof APIError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function loginWithDiscord(
    discordID: string
): Promise<GetAuthenticationTokenDTO | null> {
    try {
        return await request<GetAuthenticationTokenDTO>("/User/LoginDiscord", {
            method: "POST",
            body: JSON.stringify({ discordID }),
        });
    } catch (error) {
        if (error instanceof APIError && error.status === 404) {
            return null;
        }
        throw error;
    }
}

// User Endpoints

export async function getUser(
    userID: number,
    token: string
): Promise<GetBasicUserDTO> {
    return authenticatedRequest<GetBasicUserDTO>(
        `/User/${userID}`,
        token
    );
}

export async function getUserProfile(
    userID: number,
    token: string
): Promise<UserProfile> {
    return authenticatedRequest<UserProfile>(
        `/User/${userID}/Profile`,
        token
    );
}

// Account Endpoints

export async function checkAccountNameAvailability(
    name: string
): Promise<CheckAccountNameDTO> {
    return request<CheckAccountNameDTO>(
        `/User/CheckAccountName/${encodeURIComponent(name)}`,
        { method: "GET" }
    );
}

export async function verifyDiscordAccount(
    token: string
): Promise<string> {
    return request<string>(
        `/User/VerifyDiscord/${encodeURIComponent(token)}`,
        { method: "GET" }
    );
}

export async function resendVerification(
    discordID: string
): Promise<string> {
    return request<string>("/User/ResendVerification", {
        method: "POST",
        body: JSON.stringify({ discordID }),
    });
}

export { APIError };
