// ZORGATH API Response Types (Mirrors ZORGATH.WebPortal.API DTOs)

export interface GetBasicUserDTO {
    id: number;
    emailAddress: string;
    accounts: GetBasicAccountDTO[];
}

export interface GetBasicAccountDTO {
    id: number;
    name: string;
}

export interface GetAuthenticationTokenDTO {
    userID: number;
    tokenType: string;
    token: string;
    isVerified: boolean;
}

// Discord OAuth2 Profile

export interface DiscordProfile {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email: string | null;
    verified: boolean;
    global_name: string | null;
}

// Registration Payloads (Mirrors RegisterDiscordUserDTO)

export interface RegisterDiscordUserPayload {
    discordID: string;
    discordUsername: string;
    discordEmail: string;
    discordAvatarHash: string | null;
    accountName: string;
    password: string;
    confirmPassword: string;
}

// Discord User Response (Mirrors GetDiscordUserDTO)

export interface GetDiscordUserDTO {
    userID: number;
    discordID: string;
    discordUsername: string;
    discordAvatarHash: string | null;
    emailAddress: string;
    isVerified: boolean;
    accounts: GetBasicAccountDTO[];
}

// Account Name Availability (Mirrors CheckAccountNameDTO)

export interface CheckAccountNameDTO {
    isAvailable: boolean;
    accountName: string;
}

// Portal Types

export interface UserProfile {
    id: number;
    discordID: string;
    discordUsername: string;
    discordAvatarURL: string | null;
    accounts: AccountSummary[];
    goldCoins: number;
    silverCoins: number;
    totalLevel: number;
    totalExperience: number;
    timestampCreated: string;
    timestampLastActive: string;
}

export interface AccountSummary {
    id: number;
    name: string;
    nameWithClanTag: string;
    clanName: string | null;
    clanTier: string;
    isMain: boolean;
    ascensionLevel: number;
}

// Session Extensions

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            discordID: string;
            discordUsername: string;
            discordGlobalName: string | null;
            discordEmail: string;
            discordAvatar: string | null;
            image: string | null;
            email: string | null;
            userID: number | null;
            isVerified: boolean;
            zorgathToken: string | null;
            role: "user" | "admin" | null;
        };
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        discordID: string;
        discordUsername: string;
        discordGlobalName: string | null;
        discordEmail: string;
        discordAvatar: string | null;
        userID: number | null;
        isVerified: boolean;
        zorgathToken: string | null;
        role: "user" | "admin" | null;
    }
}
