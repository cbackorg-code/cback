import { useState, useEffect } from "react";
import { CreditCard, TrendingUp, Users, Loader2, MessageSquare, ChevronRight } from "lucide-react";
import { api } from "../lib/api";
import type { Card, DashboardStats } from "../lib/api";

interface CardSelectorProps {
    onCardSelect: (cardId: string) => void;
    user?: { id?: string; name: string; email: string; avatar_url?: string; reputation?: number } | null;
    onOpenLogin?: () => void;
}

import SEO from "../components/SEO";
import { FeedbackForm } from "../components/FeedbackForm";
import { Button } from "../components/ui/button";

export default function Home({ onCardSelect, user, onOpenLogin }: CardSelectorProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

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



    return (
        <div className="space-y-4 sm:space-y-6">
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

            {/* ── DESKTOP ONLY: Hero (compact) ────────────────────────────── */}
            <div className="hidden sm:block text-center space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight gradient-text leading-tight pb-1">
                    Check Real Cashback Rates
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
                    Community-verified cashback rates for your favourite cards.
                </p>
            </div>

            {/* ── CARD SELECTION ─────────────────────────────────────────── */}
            <div className="space-y-3 sm:space-y-4">

                {/* Desktop section heading — compact */}
                <div className="hidden sm:flex items-center justify-between">
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">Explore Rates by Card</h2>
                    {!isLoading && stats && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <CreditCard className="h-3.5 w-3.5 text-primary/70" />
                                <strong className="text-foreground font-semibold">{stats.total_cards}</strong> Cards
                            </span>
                            <span className="text-border">·</span>
                            <span className="flex items-center gap-1.5">
                                <TrendingUp className="h-3.5 w-3.5 text-primary/70" />
                                <strong className="text-foreground font-semibold">{stats.total_merchants}</strong> Merchants
                            </span>
                            <span className="text-border">·</span>
                            <span className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-primary/70" />
                                <strong className="text-foreground font-semibold">{stats.total_contributors}</strong> Contributors
                            </span>
                        </div>
                    )}
                </div>

                {/* Mobile headline — eye-catching, gradient */}
                <div className="sm:hidden flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary shrink-0" />
                    <h1 className="text-xl font-bold tracking-tight gradient-text leading-tight">
                        Pick your card
                    </h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ─── MOBILE: 2-col compact card grid ──────────────── */}
                        <div className="grid gap-3 grid-cols-2 sm:hidden">
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => onCardSelect(card.id)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="relative h-40 rounded-2xl overflow-hidden border border-border/60 bg-card active:scale-[0.97] transition-transform duration-200 shadow-sm">
                                        {/* Tap ripple overlay */}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-active:opacity-100 transition-opacity duration-150 z-10" />

                                        {/* Card image */}
                                        <div className="absolute inset-0 p-3 pb-9 flex items-center justify-center">
                                            <img
                                                src={card.image_url}
                                                alt={card.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>

                                        {/* Name pill — solid dark so always readable on any card image */}
                                        <div className="absolute bottom-0 inset-x-0 px-2.5 py-2 flex items-center justify-between gap-1 bg-gradient-to-r from-primary to-secondary">
                                            <p className="text-xs font-semibold text-white leading-tight truncate">{card.name}</p>
                                            <ChevronRight className="h-3 w-3 text-white/70 shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ─── DESKTOP: responsive 2 / 3 / 4-col grid ────────── */}
                        <div className="hidden sm:grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {cards.map((card) => (
                                <div
                                    key={card.id}
                                    onClick={() => onCardSelect(card.id)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="relative h-52 rounded-2xl overflow-hidden glass-card glow-hover transition-all duration-500 hover:scale-[1.02]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Card image */}
                                        <div className="absolute inset-0 p-4 pb-12 flex items-center justify-center">
                                            <img
                                                src={card.image_url}
                                                alt={card.name}
                                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>

                                        {/* Name bar — solid dark, always readable */}
                                        <div className="absolute bottom-0 inset-x-0 px-3 py-2.5 flex items-center justify-between gap-1 bg-gradient-to-r from-primary to-secondary">
                                            <h3 className="font-semibold text-sm text-white leading-tight truncate group-hover:text-white/90 transition-colors">{card.name}</h3>
                                            <TrendingUp className="h-3.5 w-3.5 text-white/60 shrink-0 group-hover:text-white/90 transition-colors" />
                                        </div>

                                        <div className="absolute inset-0 rounded-2xl border border-white/5 pointer-events-none" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── MOBILE ONLY: Compact stat strip ────────────────────────── */}
            {!isLoading && stats && (
                <div className="sm:hidden flex items-center justify-center text-xs text-muted-foreground py-1">
                    <span className="flex items-center gap-1.5 px-2.5">
                        <CreditCard className="h-3 w-3 text-primary/70" />
                        <span><strong className="text-foreground font-semibold">{stats.total_cards}</strong> Cards</span>
                    </span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1.5 px-2.5">
                        <TrendingUp className="h-3 w-3 text-primary/70" />
                        <span><strong className="text-foreground font-semibold">{stats.total_merchants}</strong> Merchants</span>
                    </span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1.5 px-2.5">
                        <Users className="h-3 w-3 text-primary/70" />
                        <span><strong className="text-foreground font-semibold">{stats.total_contributors}</strong> Contributors</span>
                    </span>
                </div>
            )}

            {/* ── CTA / Feedback ─────────────────────────────────────────── */}
            <div className="text-center space-y-3 pt-2 sm:pt-4 pb-0">
                <p className="text-sm text-muted-foreground px-4 hidden sm:block">
                    Don't see your card? Help the community by adding merchant data!
                </p>
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 glass-card hover:bg-white/10 transition-colors border-white/20 text-foreground text-xs sm:text-sm"
                        onClick={() => {
                            if (!user) {
                                onOpenLogin?.();
                            } else {
                                setIsFeedbackOpen(true);
                            }
                        }}
                    >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Share Feedback
                    </Button>
                </div>
                <FeedbackForm
                    open={isFeedbackOpen}
                    onOpenChange={setIsFeedbackOpen}
                />
            </div>
        </div>
    );
}
