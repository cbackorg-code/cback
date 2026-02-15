import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, Users, Clock, Sparkles, Loader2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { api } from "../lib/api";
import type { Card, DashboardStats } from "../lib/api";

interface CardSelectorProps {
    onCardSelect: (cardId: string) => void;
}

export default function Home({ onCardSelect }: CardSelectorProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchedCards, fetchedStats] = await Promise.all([
                    api.getCards(),
                    api.getDashboardStats()
                ]);
                setCards(fetchedCards);
                setStats(fetchedStats);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatLastUpdated = (dateStr: string | null) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return "Just now";
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 48) return "Yesterday";
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-accent animate-pulse" />
                    <span className="text-xs sm:text-sm font-medium text-accent">Smart Cashback Intelligence</span>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight gradient-text leading-tight pb-1 px-2">
                    Check Your Cashback Like a Pro
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    Discover which merchants give you the best cashback rates. Community-verified data from real users.
                </p>
            </div>

            {/* Stats Grid - Full width */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Cards"
                    value={stats?.total_cards ?? "..."}
                    icon={CreditCard}
                    description="Credit cards tracked"
                />
                <StatCard
                    title="Merchants"
                    value={stats?.total_merchants ?? "..."}
                    icon={TrendingUp}
                    description="Verified merchants"
                />
                <StatCard
                    title="Contributors"
                    value={stats?.total_contributors ?? "..."}
                    icon={Users}
                    description="Community members"
                />
                <StatCard
                    title="Last Updated"
                    value={stats ? formatLastUpdated(stats.last_updated) : "..."}
                    icon={Clock}
                    description="Real-time data"
                />
            </div>

            {/* Card Selection */}
            <div className="space-y-4 sm:space-y-6">
                <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Select Your Card</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Choose a credit card to view cashback merchant entries
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : (
                    /* Credit Cards - Full width 2-column grid */
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => onCardSelect(card.id)}
                                className="group relative cursor-pointer"
                            >
                                {/* Card Container - Fixed height for uniform sizing */}
                                <div className="relative h-48 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden glass-card glow-hover transition-all duration-500 hover:scale-[1.02]">
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Card Image - Centered and constrained */}
                                    <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center">
                                        <img
                                            src={card.image_url}
                                            alt={card.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end p-4 sm:p-6">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 text-primary mb-1 sm:mb-2">
                                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <span className="text-xs sm:text-sm font-medium">View Merchants</span>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                                                Click to explore cashback offers
                                            </p>
                                        </div>
                                    </div>

                                    {/* Edge highlight */}
                                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/5 pointer-events-none" />
                                </div>

                                {/* Card Info */}
                                <div className="mt-3 sm:mt-4 text-center space-y-0.5 sm:space-y-1">
                                    <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors duration-300">{card.name}</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{card.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-3 pt-4 sm:pt-8">
                <p className="text-xs sm:text-sm text-muted-foreground px-4">
                    Don't see your card? Help the community by adding merchant data!
                </p>
            </div>
        </div>
    );
}
