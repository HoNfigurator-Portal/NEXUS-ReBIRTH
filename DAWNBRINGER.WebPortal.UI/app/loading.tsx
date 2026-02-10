import { ThrobLoader } from "@/components/ui/throb-loader";

export default function RootLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <ThrobLoader size={80} text="Loading..." />
        </div>
    );
}
