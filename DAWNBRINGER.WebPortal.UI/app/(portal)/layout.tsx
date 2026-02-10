import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PortalNavbar } from "@/components/layout/portal-navbar";

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    if (!session.user.userID) {
        redirect("/register");
    }

    return (
        <div className="min-h-screen">
            <PortalNavbar session={session} />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
