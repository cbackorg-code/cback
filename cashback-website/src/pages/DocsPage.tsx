import { ArrowLeft, BookOpen, Shield, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

interface DocsPageProps {
    onBack: () => void;
}

export default function DocsPage({ onBack }: DocsPageProps) {
    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="hover:bg-foreground/10 h-10 w-10 text-foreground rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">User Guide & Terms</h1>
                    <p className="text-muted-foreground">Everything you need to know about using BackCash</p>
                </div>
            </div>

            {/* Quick Start Guide */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
                    <BookOpen className="h-5 w-5" />
                    How It Works
                </h2>
                <Card className="glass-card">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
                                <h3 className="font-medium">Search</h3>
                                <p className="text-sm text-muted-foreground">Find merchants to see which card gives the best cashback.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
                                <h3 className="font-medium">Verify</h3>
                                <p className="text-sm text-muted-foreground">Check the "Verified" status or read community comments to confirm.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
                                <h3 className="font-medium">Contribute</h3>
                                <p className="text-sm text-muted-foreground">Add new data or suggest corrections to help others.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Data Status & Updates */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-blue-400">
                    <Shield className="h-5 w-5" />
                    Data Status & Updates
                </h2>
                <Card className="glass-card border-l-4 border-l-blue-400">
                    <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Verify Status</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        <strong className="text-green-400">Verified:</strong> High confidence. Validated by multiple users or moderators.
                                    </li>
                                    <li>
                                        <strong className="text-yellow-400">Unverified:</strong> New entry or needs confirmation. Use with caution.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-foreground mb-1">Automatic Rate Updates</h3>
                                <p>
                                    Found an incorrect rate? <strong className="text-foreground">Suggest a new one!</strong>
                                </p>
                                <p className="mt-2">
                                    Our system automatically updates the main cashback rate when the community reaches a consensus.
                                    If your suggestion gets enough upvotes, it becomes the new official rate for that merchant.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Community Guidelines */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-emerald-400">
                    <Users className="h-5 w-5" />
                    Community Guidelines
                </h2>
                <Card className="glass-card border-l-4 border-l-emerald-400">
                    <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                        <p>
                            BackCash is a community-driven platform. We rely on users like you to keep data accurate.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-foreground">Be Accurate:</strong> Only add cashback rates you have personally verified or have official proof for.</li>
                            <li><strong className="text-foreground">Be Respectful:</strong> Keep comments helpful and civil. Harassment or spam will result in a ban.</li>
                            <li><strong className="text-foreground">No Spam:</strong> Do not add fake merchants or redundant entries.</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            {/* Terms & Disclaimer */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-amber-400">
                    <Shield className="h-5 w-5" />
                    Terms & Disclaimer
                </h2>
                <Card className="glass-card border-l-4 border-l-amber-400">
                    <CardContent className="p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                        <p>
                            By using BackCash, you agree to the following terms:
                        </p>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-foreground mb-1">1. Data Accuracy</h3>
                                <p>
                                    All cashback data is crowdsourced from the community.
                                    <strong className="text-foreground"> We are not responsible for any financial loss, missed cashback, or errors in the data. </strong>
                                    Always verify the cashback terms directly with your card issuer before making a purchase.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-foreground mb-1">2. User Accounts</h3>
                                <p>
                                    We reserve the right to suspend or ban accounts that violate our community guidelines, post spam, or attempt to manipulate the system.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-foreground mb-1">3. Privacy</h3>
                                <p>
                                    We respect your privacy. Your profile information is visible to other users to build trust, but we do not sell your personal data to third parties.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border/20 text-xs opacity-70">
                            Last Updated: February 2026
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
