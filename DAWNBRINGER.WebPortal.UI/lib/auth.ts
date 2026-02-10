import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

const DISCORD_SCOPES = "identify email guilds";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: { scope: DISCORD_SCOPES },
            },
        }),
    ],

    callbacks: {
        async jwt({ token, account, profile, trigger }) {
            // On Initial Sign-In, Persist Discord Data Into The JWT
            if (account && profile) {
                token.discordID = profile.id as string;
                token.discordUsername = profile.username as string;
                token.discordGlobalName = (profile.global_name as string) ?? null;
                token.discordEmail = profile.email as string;
                token.discordAvatar = (profile.avatar as string) ?? null;
                token.userID = null;
                token.isVerified = false;
                token.zorgathToken = null;
            }

            // Attempt To Log In Via Discord And Retrieve ZORGATH JWT
            // Runs on initial sign-in AND on session update (e.g. after registration)
            if (!token.userID && token.discordID) {
                try {
                    const response = await fetch(
                        `${process.env.ZORGATH_API_URL}/User/LoginDiscord`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ discordID: token.discordID }),
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        token.userID = data.userID;
                        token.isVerified = data.isVerified;
                        token.zorgathToken = data.token;
                    }
                } catch {
                    // User Not Yet Registered — This Is Expected For New Users
                }
            }

            // Force Token Refresh When Triggered By Client (e.g. After Registration)
            if (trigger === "update" && token.userID && token.discordID) {
                try {
                    const response = await fetch(
                        `${process.env.ZORGATH_API_URL}/User/LoginDiscord`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ discordID: token.discordID }),
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        token.userID = data.userID;
                        token.isVerified = data.isVerified;
                        token.zorgathToken = data.token;
                    }
                } catch {
                    // Token Refresh Failed — Keep Existing Values
                }
            }

            return token;
        },

        async session({ session, token }) {
            session.user.discordID = token.discordID;
            session.user.discordUsername = token.discordUsername;
            session.user.discordGlobalName = token.discordGlobalName;
            session.user.discordEmail = token.discordEmail;
            session.user.discordAvatar = token.discordAvatar;
            session.user.userID = token.userID;
            session.user.isVerified = token.isVerified;
            session.user.zorgathToken = token.zorgathToken;

            // Build Discord Avatar URL
            if (token.discordAvatar && token.discordID) {
                session.user.image = `https://cdn.discordapp.com/avatars/${token.discordID}/${token.discordAvatar}.png`;
            }

            return session;
        },

        async signIn({ account, profile }) {
            // Only Allow Discord Sign-Ins With A Verified Email
            if (account?.provider === "discord") {
                return (profile as { verified?: boolean })?.verified === true;
            }
            return false;
        },
    },

    pages: {
        signIn: "/login",
        error: "/login",
    },

    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 Days
    },

    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },

    trustHost: true,
});
