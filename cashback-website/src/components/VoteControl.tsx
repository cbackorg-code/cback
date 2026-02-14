import { useState, useEffect } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { toast } from "sonner";

interface VoteControlProps {
    initialUpvotes: number;
    initialDownvotes: number;
    initialUserVote?: 1 | -1 | 0; // 1 for up, -1 for down, 0 for none
    isAuthenticated: boolean;
    onOpenLogin: () => void;
    onVote?: (newVote: 1 | -1 | 0) => void;
    className?: string;
}

export function VoteControl({
    initialUpvotes,
    initialDownvotes,
    initialUserVote = 0,
    isAuthenticated,
    onOpenLogin,
    onVote,
    className
}: VoteControlProps) {
    // Optimistic UI updates
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    const [userVote, setUserVote] = useState<1 | -1 | 0>(initialUserVote);

    // Sync with props if they change (e.g. from parent refresh)
    useEffect(() => {
        setUpvotes(initialUpvotes);
        setDownvotes(initialDownvotes);
        if (initialUserVote !== undefined) setUserVote(initialUserVote);
    }, [initialUpvotes, initialDownvotes, initialUserVote]);

    const handleVote = (direction: 1 | -1) => {
        if (!isAuthenticated) {
            toast.error("Please login to vote", {
                description: "You need to be signed in to rate merchants.",
                action: {
                    label: "Sign In",
                    onClick: onOpenLogin
                }
            });
            onOpenLogin();
            return;
        }

        let newVote: 1 | -1 | 0 = direction;

        // Calculate new counts based on transition
        // Cases:
        // 0 -> 1: Up+1
        // 0 -> -1: Down+1
        // 1 -> 0: Up-1
        // -1 -> 0: Down-1
        // 1 -> -1: Up-1, Down+1
        // -1 -> 1: Down-1, Up+1

        if (userVote === direction) {
            // Toggle off
            newVote = 0;
            if (direction === 1) setUpvotes(prev => prev - 1);
            else setDownvotes(prev => prev - 1);
        } else if (userVote === 0) {
            // New vote from neutral
            newVote = direction;
            if (direction === 1) setUpvotes(prev => prev + 1);
            else setDownvotes(prev => prev + 1);
        } else {
            // Switch vote
            newVote = direction;
            if (direction === 1) {
                // Was down, now up
                setDownvotes(prev => prev - 1);
                setUpvotes(prev => prev + 1);
            } else {
                // Was up, now down
                setUpvotes(prev => prev - 1);
                setDownvotes(prev => prev + 1);
            }
        }

        setUserVote(newVote);
        onVote?.(newVote);
    };

    return (
        <div className={cn(
            "flex items-center gap-0.5 bg-muted/40 rounded-lg p-1 border border-border/10",
            className
        )}>
            {/* Upvote Section */}
            <div className="flex items-center gap-0.5">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-7 w-7 p-0 hover:bg-primary/10 transition-colors rounded-sm",
                        userVote === 1 ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVote(1);
                    }}
                >
                    <ArrowBigUp className={cn("h-5 w-5 transition-transform active:-translate-y-0.5", userVote === 1 && "fill-current")} />
                </Button>
                <span className={cn(
                    "text-sm font-bold font-mono min-w-[2ch] text-center px-1",
                    userVote === 1 ? "text-primary" : "text-foreground"
                )}>
                    {upvotes}
                </span>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-border/50 mx-1" />

            {/* Downvote Section */}
            <div className="flex items-center gap-0.5">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "h-7 w-7 p-0 hover:bg-red-500/10 transition-colors rounded-sm",
                        userVote === -1 ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVote(-1);
                    }}
                >
                    <ArrowBigDown className={cn("h-5 w-5 transition-transform active:translate-y-0.5", userVote === -1 && "fill-current")} />
                </Button>
                <span className={cn(
                    "text-sm font-bold font-mono min-w-[2ch] text-center px-1",
                    userVote === -1 ? "text-red-500" : "text-muted-foreground"
                )}>
                    {downvotes}
                </span>
            </div>
        </div>
    );
}
