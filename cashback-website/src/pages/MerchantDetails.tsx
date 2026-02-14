
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Clock, MessageSquare, Send, CheckCircle, User, Pencil, ThumbsUp, ThumbsDown, Percent } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea"
import { toast } from "sonner";
import { VoteControl } from "../components/VoteControl";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog"
import { Label } from "../components/ui/label"

interface MerchantDetailsProps {
    merchantId: string;
    onBack: () => void;
    isAuthenticated: boolean;
    onOpenLogin: () => void;
}

interface Comment {
    id: string;
    content: string;
    created_at: string;
    author?: {
        id: string;
        display_name: string;
        reputation_score?: number;
    };
}

interface RateSuggestion {
    id: string;
    entry_id: string;
    proposed_rate: number;
    reason: string;
    upvotes: number;
    downvotes: number;
    score: number;
    user_vote?: 'up' | 'down';
    contributor: string;
    created_at: string;
    is_current_user?: boolean;
}

export default function MerchantDetails({ merchantId, onBack, isAuthenticated, onOpenLogin }: MerchantDetailsProps) {
    const [newComment, setNewComment] = useState("");
    const [entry, setEntry] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Suggestion State
    const [suggestions, setSuggestions] = useState<RateSuggestion[]>([]);
    const [isSuggestionDialogOpen, setIsSuggestionDialogOpen] = useState(false);
    const [proposedRate, setProposedRate] = useState("");
    const [suggestionReason, setSuggestionReason] = useState("");
    const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

    // Rate Input State
    const [isRateComboboxOpen, setIsRateComboboxOpen] = useState(false);

    // Generate suggested rates dynamically based on card's max rate
    const suggestedRates = useMemo(() => {
        if (!entry || !entry.maxCashbackRate) return ["1%", "2%", "5%"]; // Fallback
        const rates = [];
        const max = Math.floor(entry.maxCashbackRate);
        for (let i = max; i >= 0; i--) {
            rates.push(`${i}%`);
        }
        return rates;
    }, [entry]);


    // Helper function to get user tier based on reputation
    const getUserTier = (reputation: number = 0): { name: string; color: string; bgColor: string } => {
        if (reputation >= 1000) return { name: "Platinum", color: "text-cyan-400", bgColor: "bg-cyan-400/10 border-cyan-400/30" };
        if (reputation >= 500) return { name: "Gold", color: "text-yellow-400", bgColor: "bg-yellow-400/10 border-yellow-400/30" };
        if (reputation >= 100) return { name: "Silver", color: "text-slate-300", bgColor: "bg-slate-300/10 border-slate-300/30" };
        return { name: "Bronze", color: "text-amber-600", bgColor: "bg-amber-600/10 border-amber-600/30" };
    };

    const hasPendingSuggestion = useMemo(() => {
        return suggestions.some(s => s.is_current_user);
    }, [suggestions]);

    // Fetch entry details from API
    useEffect(() => {
        const fetchEntry = async () => {
            setIsLoading(true);
            try {
                // Fetch single entry directly by ID - much faster!
                const entryData = await api.getEntry(merchantId);

                setEntry({
                    id: entryData.id,
                    merchant: entryData.merchant?.canonical_name || "Unknown",
                    statementName: entryData.statement_name,
                    cashbackRate: `${entryData.reported_cashback_rate}% `,
                    contributor: entryData.contributor?.display_name || "Anonymous",
                    comments: entryData.notes,
                    lastVerified: entryData.last_verified_at,
                    status: entryData.status,
                    mcc: entryData.mcc,
                    cardId: entryData.card?.slug,
                    cardName: entryData.card?.name,
                    maxCashbackRate: entryData.card?.max_cashback_rate,
                    userVote: entryData.user_vote,
                    upvoteCount: entryData.upvote_count,
                    downvoteCount: entryData.downvote_count
                });
            } catch (error: any) {
                console.error("Error fetching entry:", error);
                if (error.message === 'Entry not found') {
                    toast.error("Entry not found");
                } else {
                    toast.error("Failed to load entry details");
                }
            } finally {
                setIsLoading(false);
            }
        };

        const fetchSuggestions = async () => {
            try {
                const data = await api.getRateSuggestions(merchantId);
                setSuggestions(data);
            } catch (error) {
                console.error("Failed to load suggestions", error);
            }
        }

        fetchEntry();
        fetchSuggestions();
    }, [merchantId]);

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            setIsLoadingComments(true);
            try {
                const commentsData = await api.getComments(merchantId);
                setComments(commentsData);
            } catch (error) {
                console.error("Error fetching comments:", error);
                // Don't show error toast for comments, just leave empty
            } finally {
                setIsLoadingComments(false);
            }
        };

        fetchComments();
    }, [merchantId]);

    const handleAddComment = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to comment", {
                description: "You need to be signed in to join the discussion.",
                action: {
                    label: "Sign In",
                    onClick: onOpenLogin
                }
            });
            onOpenLogin();
            return;
        }

        if (!newComment.trim() || !entry) return;

        setIsSubmittingComment(true);
        try {
            const createdComment = await api.createComment(merchantId, newComment.trim());
            setComments(prev => [createdComment, ...prev]);
            setNewComment("");
            toast.success("Comment added!");
        } catch (error: any) {
            console.error("Error creating comment:", error);
            if (error.message === 'Unauthorized') {
                toast.error("Please login to comment");
                onOpenLogin();
            } else {
                toast.error("Failed to add comment");
            }
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleVote = async (newVote: 1 | -1 | 0) => {
        // Map numeric vote to API string
        if (newVote === 0) return; // API doesn't support "unvoting" yet easily, or we just ignore
        const type = newVote === 1 ? 'up' : 'down';

        try {
            const result = await api.voteEntry(entry!.id, type);
            // Update local state
            setEntry((prev: any) => prev ? {
                ...prev,
                upvoteCount: result.upvotes,
                downvoteCount: result.downvotes,
                status: result.status,
                lastVerified: result.is_verified ? new Date().toISOString() : prev.lastVerified,
                userVote: result.user_vote
            } : null);

            toast.success("Vote recorded");
        } catch (error: any) {
            console.error("Vote failed:", error);
            if (error.message === "Unauthorized") {
                onOpenLogin();
            } else {
                toast.error("Failed to record vote");
            }
        }
    };

    const handleSubmitSuggestion = async () => {
        if (!isAuthenticated) {
            onOpenLogin();
            return;
        }

        const rate = parseFloat(proposedRate);
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toast.error("Please enter a valid rate (0-100)");
            return;
        }

        setIsSubmittingSuggestion(true);
        try {
            const data = await api.createRateSuggestion(merchantId, rate, suggestionReason);
            toast.success(data.message || "Suggestion submitted!");
            setIsSuggestionDialogOpen(false);
            setProposedRate("");
            setSuggestionReason("");

            // Refresh suggestions
            const updatedSuggestions = await api.getRateSuggestions(merchantId);
            setSuggestions(updatedSuggestions);
        } catch (error) {
            toast.error("Failed to submit suggestion");
        } finally {
            setIsSubmittingSuggestion(false);
        }
    };

    const handleVoteSuggestion = async (suggestionId: string, type: 'up' | 'down') => {
        if (!isAuthenticated) {
            onOpenLogin();
            return;
        }

        try {
            const result = await api.voteRateSuggestion(suggestionId, type);

            if (result.accepted) {
                toast.success("Suggestion Accepted!", {
                    description: "The community has approved this change. The main entry has been updated."
                });
                // Reload everything to show new main rate
                window.location.reload();
            } else {
                // Update local state for just this suggestion
                setSuggestions(prev => prev.map(s => {
                    if (s.id === suggestionId) {
                        return {
                            ...s,
                            upvotes: result.upvotes,
                            downvotes: result.downvotes,
                            score: result.score,
                            user_vote: result.user_vote // Use backend result (handles toggles)
                        };
                    }
                    return s;
                }));
            }
        } catch (error) {
            toast.error("Failed to vote");
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!entry) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-muted-foreground">Entry not found</p>
                <Button onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    const getCashbackStyle = (rate: string) => {
        const rateNum = parseInt(rate) || 0;
        if (rateNum >= 5) return { bg: "bg-primary/15", text: "text-primary", border: "border-primary/30" };
        if (rateNum >= 1) return { bg: "bg-primary/10", text: "text-primary/80", border: "border-primary/20" };
        return { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border/30" };
    };

    const style = getCashbackStyle(entry.cashbackRate);

    return (
        <div className="space-y-6 pb-24 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="hover:bg-foreground/10 h-9 w-9 sm:h-10 sm:w-10 shrink-0 text-foreground mt-1 rounded-full"
                >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground break-words">{entry.merchant}</h1>
                            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                                {entry.cardName}
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                <span className="font-mono text-xs break-all">{entry.statementName}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Content Stack */}
            <div className="space-y-6">
                {/* Stats & Info */}
                <div className="space-y-6">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Card className="glass-card overflow-hidden relative group">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Cashback</span>
                                <div className={cn("text-2xl font-bold", style.text)}>{entry.cashbackRate || "0%"}</div>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            onOpenLogin();
                                            return;
                                        }
                                        if (hasPendingSuggestion) {
                                            toast.error("Pending Suggestion Exists", {
                                                description: "You already have a pending suggestion for this card. Please wait for it to be resolved."
                                            });
                                            return;
                                        }
                                        setIsSuggestionDialogOpen(true);
                                    }}
                                >
                                    <Pencil className="h-3 w-3" />
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="glass-card overflow-hidden">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                                <div className="flex items-center gap-1.5 text-lg font-medium">
                                    {entry.status === 'verified' ? (
                                        <>
                                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            <span className="text-emerald-400">Verified</span>
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground">Unverified</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card overflow-hidden col-span-2 sm:col-span-1">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Contributor</span>
                                <div className="flex items-center gap-2 text-foreground font-medium truncate max-w-full">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {entry.contributor || "Anonymous"}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="glass-card overflow-hidden col-span-2 sm:col-span-1">
                            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider">MCC</span>
                                <div className="text-lg font-medium">
                                    {entry.mcc || <span className="text-muted-foreground text-sm">--</span>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Voting Controls */}
                    <Card className="glass-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <span className="font-medium">Is this cashback rate accurate?</span>
                            <VoteControl
                                initialUpvotes={entry.upvoteCount || 0}
                                initialDownvotes={entry.downvoteCount || 0}
                                initialUserVote={entry.userVote === 'up' ? 1 : entry.userVote === 'down' ? -1 : 0}
                                isAuthenticated={isAuthenticated}
                                onOpenLogin={onOpenLogin}
                                onVote={handleVote}
                                className="scale-110"
                            />
                        </CardContent>
                    </Card>

                    {/* Rate Suggestions Section */}
                    {suggestions.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Pencil className="h-4 w-4 text-primary" />
                                Community Rate Suggestions
                            </h3>
                            <div className="grid gap-3">
                                {suggestions.map(s => (
                                    <Card key={s.id} className="glass-card border-l-4 border-l-primary/50">
                                        <CardContent className="p-4 flex items-center justify-between gap-4">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold text-primary">{s.proposed_rate}%</span>
                                                    <span className="text-xs text-muted-foreground">by {s.contributor}</span>
                                                </div>
                                                {s.reason && (
                                                    <p className="text-sm text-muted-foreground">{s.reason}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-center gap-1 bg-background/50 p-1.5 rounded-lg border border-border/50">
                                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Score: {s.score}</span>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-8 w-8 hover:text-primary hover:bg-primary/10", s.user_vote === 'up' && "text-primary bg-primary/10")}
                                                        onClick={() => handleVoteSuggestion(s.id, 'up')}
                                                    >
                                                        <ThumbsUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn("h-8 w-8 hover:text-red-500 hover:bg-red-500/10", s.user_vote === 'down' && "text-red-500 bg-red-500/10")}
                                                        onClick={() => handleVoteSuggestion(s.id, 'down')}
                                                    >
                                                        <ThumbsDown className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Original Note */}
                    {entry.comments && (
                        <Card className="glass-card">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                    Original Note
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">{entry.comments}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Comments System */}
                <Card className="glass-card flex flex-col max-h-[600px]">
                    <CardContent className="p-0 flex flex-col h-full">
                        <div className="p-4 border-b border-border/20">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Timeline
                            </h3>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
                            {isLoadingComments ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-muted-foreground text-sm">Loading comments...</p>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground space-y-2 opacity-50">
                                    <MessageSquare className="h-8 w-8" />
                                    <p className="text-sm">No comments yet</p>
                                </div>
                            ) : (
                                comments.map((comment) => {
                                    const createdDate = new Date(comment.created_at);
                                    const displayName = comment.author?.display_name || "Anonymous";
                                    const reputation = comment.author?.reputation_score || 0;
                                    const tier = getUserTier(reputation);
                                    return (
                                        <div key={comment.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-lg bg-primary"
                                            )}>
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-medium text-foreground">{displayName}</span>
                                                        <span className={cn(
                                                            "text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase tracking-wide",
                                                            tier.color,
                                                            tier.bgColor
                                                        )}>
                                                            {tier.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} • {createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground/90 bg-muted/20 p-2.5 rounded-r-lg rounded-bl-lg">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-4 border-t border-border/20 bg-background/20 backdrop-blur-sm">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isSubmittingComment && handleAddComment()}
                                    disabled={isSubmittingComment}
                                    className="bg-background/50 border-border/40 focus-visible:ring-primary/20"
                                />
                                <Button
                                    size="icon"
                                    onClick={handleAddComment}
                                    disabled={isSubmittingComment}
                                    className="shrink-0 btn-gradient text-white rounded-lg"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isSuggestionDialogOpen} onOpenChange={setIsSuggestionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Suggest Correct Logic</DialogTitle>
                        <DialogDescription>
                            Proposed changes will be reviewed by the community. If accepted, the rate will be updated automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Correct Cashback Rate (%)</Label>
                            <div
                                className="relative"
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setIsRateComboboxOpen(false);
                                    }
                                }}
                            >
                                <div className="relative">
                                    <Input
                                        placeholder="e.g 5%"
                                        value={proposedRate}
                                        onChange={(e) => {
                                            setProposedRate(e.target.value);
                                            setIsRateComboboxOpen(true);
                                        }}
                                        onFocus={() => setIsRateComboboxOpen(true)}
                                        className="bg-background/50 focus-visible:ring-primary/20 pr-8 h-10"
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
                                </div>
                                {isRateComboboxOpen && (
                                    <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                                        <div className="max-h-[200px] overflow-y-auto p-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
                                            {suggestedRates.map((rate) => (
                                                <button
                                                    key={rate}
                                                    type="button"
                                                    onClick={() => {
                                                        setProposedRate(rate);
                                                        setIsRateComboboxOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer touch-manipulation",
                                                        proposedRate === rate ? "bg-primary/5 text-primary" : "text-foreground"
                                                    )}
                                                >
                                                    {rate}
                                                    {proposedRate === rate && <CheckCircle className="h-3 w-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason / Source</Label>
                            <Textarea
                                placeholder="Explain why this rate is correct (e.g. Official T&C link)"
                                value={suggestionReason}
                                onChange={(e) => setSuggestionReason(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSuggestionDialogOpen(false)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">Cancel</Button>
                        <Button onClick={handleSubmitSuggestion} disabled={isSubmittingSuggestion} className="btn-gradient text-white">
                            {isSubmittingSuggestion ? "Submitting..." : "Submit Suggestion"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
