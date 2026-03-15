import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, Users, Clock, Loader2 } from "lucide-react";
import StatCard from "../components/StatCard";
import { api } from "../lib/api";
import type { Card, DashboardStats } from "../lib/api";

interface CardSelectorProps {
    onCardSelect: (cardId: string) => void;
}

import SEO from "../components/SEO";

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
            <SEO
                title="Best Credit Card Cashback Rates, MCC Codes & Offers | CBack"
                description="Find the best cashback credit cards and offers. Compare rates, verified by the community. Check MCC codes for Swiggy HDFC, SBI Cashback, Amazon ICICI, and more."
                keywords={[
                    "cashback", "credit cards", "cback", "cashback rate", "mccs", "mcc",
                    "merchant code", "merchant codes", "swiggy hdfc", "sbi cashback",
                    "sbi phonepe", "amazon icici", "credit card offers", "best cashback credit cards",
                    "merchant category codes", "credit card rewards", "shopping offers",
                    "hdfc millenia", "axis ace", "flipkart axis", "hsbc cashback"
                ]}
            />
            {/* Hero Section */}
            <div className="text-center space-y-3 sm:space-y-4">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight gradient-text leading-tight pb-1 px-2">
                    Check Real Cashback Rates
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                    Stop guessing your rewards. See up-to-date, community-verified cashback rates for your favorite merchants.
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
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Explore Rates by Card</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Select a card below to see where people are getting the best cashback
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
                                <div className="relative h-56 sm:h-64 rounded-xl sm:rounded-2xl overflow-hidden glass-card glow-hover transition-all duration-500 hover:scale-[1.02]">
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

                                    {/* Liquid Glass Button - Always Visible */}
                                    <div className="absolute bottom-4 inset-x-4 flex justify-center">
                                        <div className="w-auto glass-effect text-foreground/90 border border-white/20 shadow-lg backdrop-blur-md bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] group-hover:-translate-y-1">
                                            <span>View Merchants</span>
                                            <TrendingUp className="h-4 w-4" />
                                        </div>
                                    </div>

                                    {/* Edge highlight */}
                                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-white/5 pointer-events-none" />
                                </div>

                                {/* Card Info */}
                                <div className="mt-3 sm:mt-4 text-center space-y-0.5 sm:space-y-1">
                                    <h3 className="font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors duration-300">{card.name}</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground">{card.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-3 pt-4 sm:pt-8">
                <p className="text-sm sm:text-base text-muted-foreground px-4">
                    Don't see your card? Help the community by adding merchant data!
                </p>
            </div>
        </div >
    );
}
