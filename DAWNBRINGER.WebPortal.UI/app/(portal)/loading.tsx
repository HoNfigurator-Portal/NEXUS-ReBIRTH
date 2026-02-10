import { ThrobLoader } from "@/components/ui/throb-loader";

export default function PortalLoading() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <ThrobLoader size={72} text="Loading..." />
        </div>
    );
}
