import { useMemo } from "react";
import { cn } from "../lib/utils";

interface UserAvatarProps {
    user: {
        name: string;
        avatar_url?: string;
        reputation?: number;
    };
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
    const { name, avatar_url, reputation = 0 } = user;
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const tier = useMemo(() => {
        if (reputation >= 1000) return { name: "Platinum", color: "ring-cyan-400", bg: "bg-cyan-500" };
        if (reputation >= 500) return { name: "Gold", color: "ring-yellow-400", bg: "bg-yellow-500" };
        if (reputation >= 100) return { name: "Silver", color: "ring-slate-300", bg: "bg-slate-400" };
        return { name: "Bronze", color: "ring-amber-600", bg: "bg-amber-600" }; // Default / Bronze
    }, [reputation]);

    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-24 w-24 text-2xl"
    };

    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background transition-all duration-300",
                sizeClasses[size],
                tier.color,
                !avatar_url && tier.bg, // Use tier color as bg if no image
                className
            )}
        >
            {avatar_url ? (
                <img
                    src={avatar_url}
                    alt={name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <span className="font-bold text-white">{initials}</span>
            )}
        </div>
    );
}
