import { cn } from "@/lib/utils";

const FRAME_SIZE = 64; // each frame is 64x64 in the sprite
const TOTAL_FRAMES = 32;

interface ThrobLoaderProps {
    size?: number;
    className?: string;
    text?: string;
}

export function ThrobLoader({ size = 64, className, text }: ThrobLoaderProps) {
    const scale = size / FRAME_SIZE;
    const totalWidth = FRAME_SIZE * TOTAL_FRAMES * scale;

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div
                className="throb-animation"
                style={{
                    width: size,
                    height: size,
                    backgroundImage: "url(/loading/throb-sprite.png)",
                    backgroundSize: `${totalWidth}px ${size}px`,
                    "--throb-offset": `-${totalWidth}px`,
                } as React.CSSProperties}
            />
            {text && (
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
}
