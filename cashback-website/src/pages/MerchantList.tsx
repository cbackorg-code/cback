import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, PlusCircle, Search, TrendingUp, Store, CheckCircle, Filter, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { useState, useMemo, useEffect } from "react";
import StatCard from "../components/StatCard";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { AddMerchantDialog } from "../components/AddMerchantDialog";
import { api } from "../lib/api";

interface MerchantTableProps {
    cardId: string;
    onBack: () => void;
    onMerchantSelect: (merchantId: string) => void;
    isAuthenticated: boolean;
    onOpenLogin: () => void;
}

import SEO from "../components/SEO";

export default function MerchantList({ cardId, onBack, onMerchantSelect, isAuthenticated, onOpenLogin }: MerchantTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("merchant");
    const [showStats, setShowStats] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // API State
    const [merchants, setMerchants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pagination State
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 50;

    // V1: Fetch real cards

    const [currentCard, setCurrentCard] = useState<any>(null);


    const handleRefresh = () => {
        // Reload from scratch
        loadMerchants(0, true);
    };

    // Fetch cards on mount
    useEffect(() => {
        const fetchCards = async () => {
            try {
                const cardsData = await api.getCards();
                const matchedCard = cardsData.find((c: any) => c.id === cardId || c.slug === cardId);
                setCurrentCard(matchedCard);
            } catch (error) {
                console.error("Error fetching cards:", error);
            }
        };
        fetchCards();
    }, [cardId]);


    // Use currentCard instead of mockCards.find
    const card = currentCard;

    // Reset pagination when filters change (search or SORT)
    useEffect(() => {
        setOffset(0);
        setHasMore(true);
        setMerchants([]); // Clear current list to avoid weird jumps
        loadMerchants(0, true);
    }, [searchQuery, cardId, sortBy]); // Add sortBy here!

    // Load more when offset changes (for scrolling)
    useEffect(() => {
        if (offset > 0) {
            loadMerchants(offset, false);
        }
    }, [offset]);

    const loadMerchants = async (currentOffset: number, isReset: boolean) => {
        if (!cardId && !currentCard) return;

        setIsLoading(true);
        try {
            // Ensure card data
            let targetCardId = currentCard?.id;
            if (!targetCardId) {
                const cards = await api.getCards();
                const found = cards.find(c => c.id === cardId || c.slug === cardId);
                if (found) {
                    setCurrentCard(found);
                    targetCardId = found.id;
                } else {
                    console.error("Card not found");
                    setIsLoading(false);
                    return;
                }
            }

            // Pass sortBy to API
            const data = await api.getEntries(searchQuery, targetCardId, currentOffset, LIMIT, sortBy);

            // Transform data
            const mappedData = data.map((entry: any) => ({
                id: entry.id,
                cardId: cardId,
                merchant: entry?.merchant?.canonical_name || "Unknown",
                statementName: entry.statement_name || "",
                cashbackRate: `${entry.reported_cashback_rate}%`,
                mcc: entry.mcc || "",
                contributor: entry?.contributor?.display_name || "Community",
                date: new Date(entry.created_at).toLocaleDateString(),
                comments: entry.notes || "",
                lastVerified: entry.last_verified_at ? new Date(entry.last_verified_at).toLocaleDateString() : ""
            }));

            if (mappedData.length < LIMIT) {
                setHasMore(false);
            }

            setMerchants(prev => isReset ? mappedData : [...prev, ...mappedData]);

        } catch (error) {
            console.error("Error fetching entries:", error);
            // toast.error("Failed to load entries"); // Removed toast spam
            setHasMore(false); // Stop infinite scroll on error
        } finally {
            setIsLoading(false);
        }
    };



    // Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (entry.isIntersecting && !isLoading && hasMore) {
                    setOffset(prev => prev + LIMIT);
                }
            },
            { threshold: 0.1, rootMargin: "100px" }
        );

        const target = document.querySelector("#load-more-trigger");
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [isLoading, hasMore]);

    const entries = merchants; // Use fetched data

    const stats = useMemo(() => {
        const totalMerchants = entries.length;
        const merchantsWith5Percent = entries.filter(e => e.cashbackRate === "5%").length;
        const merchantsWithNoCashback = entries.filter(e => e.cashbackRate === "0%" || e.cashbackRate === "").length;
        const verifiedEntries = entries.filter(e => e.lastVerified).length;
        return { totalMerchants, merchantsWith5Percent, merchantsWithNoCashback, verifiedEntries };
    }, [entries]);

    // Unique merchants and statements for filters
    const uniqueMerchants = useMemo(() => {
        const merchants = new Set(entries.map(e => e.merchant).filter(Boolean));
        return Array.from(merchants).sort();
    }, [entries]);

    const uniqueMCCs = useMemo(() => {
        const mccs = new Set(entries.map(e => e.mcc).filter(Boolean));
        return Array.from(mccs).sort();
    }, [entries]);

    const filteredAndSortedEntries = useMemo(() => {
        // Only Filter locally. SORTING IS NOW SERVER-SIDE.
        let filtered = entries;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((entry) =>
                entry.merchant.toLowerCase().includes(query) ||
                entry.statementName.toLowerCase().includes(query) ||
                entry.contributor.toLowerCase().includes(query) ||
                entry.comments.toLowerCase().includes(query)
            );
        }

        // No client-side sorting!
        return filtered;
    }, [entries, searchQuery]);

    const getCashbackStyle = (rate: string) => {
        const rateNum = parseInt(rate) || 0;
        if (rateNum >= 5) return { bg: "bg-primary/15", text: "text-primary", border: "border-primary/30" };
        if (rateNum >= 1) return { bg: "bg-primary/10", text: "text-primary/80", border: "border-primary/20" };
        return { bg: "bg-muted/50", text: "text-muted-foreground", border: "border-border/30" };
    };

    const handleAddEntry = () => {
        if (!isAuthenticated) {
            toast.error("Please login to add entries", {
                description: "Help the community grow by signing in to contribute.",
                action: {
                    label: "Sign In",
                    onClick: onOpenLogin
                }
            });
            onOpenLogin();
            return;
        }
        setIsAddDialogOpen(true);
    };

    if (isLoading && !card) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!card && !isLoading) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Card not found</p>
                <Button variant="link" onClick={onBack}>Go back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-24">
            <SEO
                title={`${card?.name || 'Unknown Card'} Cashback Merchants | CBack`}
                description={`List of merchants with cashback rates for ${card?.name || 'credit card'}. Verified by community. Check MCC codes and best offers.`}
                keywords={[
                    `${card?.name}`, "cashback", "merchants", "rates", "mcc codes",
                    "credit card offers", "shopping rewards", "discount",
                    "swiggy hdfc", "sbi cashback", "amazon icici"
                ]}
            />
            {/* Header */}
            <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="hover:bg-foreground/10 h-9 w-9 sm:h-10 sm:w-10 shrink-0 text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">{card?.name}</h1>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {card?.max_cashback_rate}% Max Rate
                        </p>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStats(!showStats)}
                    className={`gap-2 h-9 px-3 rounded-lg transition-all duration-300 ${showStats
                        ? 'btn-gradient text-white shadow-lg'
                        : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                        }`}
                >
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Stats</span>
                </Button>
            </div>

            {/* Stats - Collapsible */}
            {showStats && (
                <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <StatCard title="Total Merchants" value={stats.totalMerchants} icon={Store} description="Tracked" />
                    <StatCard title="5% Cashback" value={stats.merchantsWith5Percent} icon={TrendingUp} description="Best rate" trend={stats.totalMerchants > 0 ? `${Math.round((stats.merchantsWith5Percent / stats.totalMerchants) * 100)}%` : "0%"} />
                    <StatCard title="No Cashback" value={stats.merchantsWithNoCashback} icon={Filter} description="Excluded" />
                    <StatCard title="Verified" value={stats.verifiedEntries} icon={CheckCircle} description="Confirmed" />
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search merchants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 sm:h-11 glass-card text-foreground"
                    />
                    {isLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex gap-2 sm:gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="flex-1 sm:w-32 h-10 sm:h-11 glass-card text-foreground">
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent className="floating-dropdown">
                            <SelectItem value="merchant">A-Z</SelectItem>
                            <SelectItem value="cashback-high">High First</SelectItem>
                            <SelectItem value="cashback-low">Low First</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Merchant Cards Grid */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedEntries.map((entry) => {
                    const style = getCashbackStyle(entry.cashbackRate);
                    return (
                        <Card
                            key={entry.id}
                            onClick={() => onMerchantSelect(entry.id)}
                            className="glass-card overflow-hidden group hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        >
                            <CardContent className="p-0">
                                {/* Header */}
                                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/20">
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center shrink-0">
                                            <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{entry.merchant}</h3>
                                            <p className="text-xs sm:text-sm text-muted-foreground truncate font-mono">{entry.statementName}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-sm sm:text-base font-bold border ${style.bg} ${style.text} ${style.border} shrink-0`}>
                                        {entry.cashbackRate || "0%"}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                                    {entry.comments && (
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                                            <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">{entry.comments}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between text-xs sm:text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            {entry.lastVerified && (
                                                <span className="flex items-center gap-1 text-emerald-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    <span className="hidden sm:inline">{entry.lastVerified}</span>
                                                </span>
                                            )}
                                            {entry.contributor && (
                                                <span className="truncate max-w-[80px] sm:max-w-none">by {entry.contributor}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredAndSortedEntries.length === 0 && (
                <Card className="glass-card">
                    <CardContent className="py-8 sm:py-12 text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1 sm:mb-2">No merchants found</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {searchQuery ? "Try adjusting your filters" : "Be the first to add data!"}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Results Summary */}
            {searchQuery && filteredAndSortedEntries.length > 0 && (
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Showing {filteredAndSortedEntries.length} of {entries.length} merchants
                </p>
            )}

            {/* Floating Add Entry Button */}
            <div id="load-more-trigger" className="h-4 w-full opacity-0 pointer-events-none" />

            {isLoading && merchants.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
            )}

            <Button
                className="fixed bottom-6 right-6 h-14 w-14 sm:h-auto sm:w-auto sm:px-6 rounded-full btn-gradient text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 z-40"
                onClick={handleAddEntry}
            >
                <PlusCircle className="h-6 w-6 sm:mr-2" />
                <span className="hidden sm:inline">Add Entry</span>
            </Button>

            <AddMerchantDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                cardId={currentCard?.id} // Pass UUID instead of name
                cardName={card?.name || ""} // Keep for display
                maxRate={card?.max_cashback_rate || 5}
                existingStatementNames={entries.map(e => e.statementName)}
                existingMerchantNames={uniqueMerchants}
                existingMCCs={uniqueMCCs}
                onSuccess={handleRefresh}
            />
        </div>
    );
}
