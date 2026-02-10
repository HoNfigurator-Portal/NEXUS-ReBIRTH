import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "@/components/providers";
import "./globals.css";

const fontSans = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

const fontMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Project KONGOR Re:BIRTH",
    description:
        "The official web portal for Project KONGOR Re:BIRTH. Register, manage your accounts, and explore the community.",
    icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body
                className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased min-h-screen relative`}
            >
                {/* Background Image */}
                <div
                    className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url(/main_bg/main_bg.png)" }}
                />
                <div className="fixed inset-0 -z-10 bg-background/75" />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
