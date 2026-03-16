import { ArrowLeft, Calendar, Award, Edit, Plus, TrendingUp, Heart, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import StatCard from "../components/StatCard";
import { UserAvatar } from "../components/UserAvatar";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ProfileStats } from "../lib/api";
import { toast } from "sonner";

interface PublicProfileProps {
    userId: string;
    onBack: () => void;
}

export default function PublicProfile({ userId, onBack }: PublicProfileProps) {
    const [profileData, setProfileData] = useState<ProfileStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await api.getPublicProfile(userId);
                setProfileData(data);
            } catch (error: any) {
                console.error("Error fetching public profile:", error);
                toast.error("Failed to load contributor profile");
            } finally {
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-muted-foreground">Loading profile...</p>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-muted-foreground">User not found</p>
                <Button onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    const isRagveer = profileData.display_name.toLowerCase().includes('ragveer') || 
                      profileData.display_name.toLowerCase().includes('techofino');

    const stats = {
        joinDate: new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        reputation: isRagveer ? '∞' : profileData.reputation_score,
        contributions: profileData.stats.total_contributions
    };

    // Convert recent activity from API format to display format
    const contributions = profileData.recent_activity.map((activity) => {
        const activityDate = new Date(activity.date);
        const now = new Date();
        const diffTime = now.getTime() - activityDate.getTime();
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let timeAgo = "";
        if (diffMinutes < 1) timeAgo = "Just now";
        else if (diffMinutes < 60) timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        else if (diffDays === 1) timeAgo = "Yesterday";
        else if (diffDays < 7) timeAgo = `${diffDays} days ago`;
        else if (diffDays < 14) timeAgo = "1 week ago";
        else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)} weeks ago`;
        else timeAgo = `${Math.floor(diffDays / 30)} months ago`;

        return {
            id: activity.id,
            type: activity.type,
            merchant: activity.merchant,
            date: timeAgo,
            points: activity.type === 'added' ? '+50' : '+20'
        };
    });

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="hover:bg-foreground/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Contributor Profile</h1>
            </div>

            {/* User Profile Card */}
            <div className={`glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden ${isRagveer ? 'border-2 border-primary/40 shadow-lg' : ''}`}>
                {/* Decorative background gradient */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none ${isRagveer ? 'bg-primary/20' : 'bg-primary/10'}`} />
                {isRagveer && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                )}

                {/* Avatar */}
                <div className="relative">
                    <UserAvatar
                        user={{
                            name: profileData.display_name,
                            avatar_url: profileData.avatar_url,
                            reputation: profileData.reputation_score
                        }}
                        className={`h-24 w-24 sm:h-32 sm:w-32 shadow-xl text-3xl sm:text-4xl ${isRagveer ? 'ring-4 ring-primary/50 shadow-primary/20' : 'ring-4 ring-border'}`}
                    />
                </div>

                {/* User Info */}
                <div className="text-center sm:text-left space-y-2 py-2 flex-1 relative z-10">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row items-center gap-3 text-foreground">
                            {profileData.display_name}
                            {isRagveer && (
                                <span className="bg-primary/10 text-primary border border-primary/20 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                    <Award className="h-3.5 w-3.5" /> Data Pioneer
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-4 pt-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${isRagveer ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/30 text-secondary-foreground border-secondary/20'}`}>
                            <Calendar className="h-4 w-4" />
                            Member since {stats.joinDate}
                        </div>
                    </div>
                </div>

                {/* Reputation Score - Desktop */}
                <div className="hidden sm:flex flex-col items-end justify-center h-full py-2 z-10">
                    <div className="text-right">
                        <p className={`text-sm uppercase tracking-wider font-semibold ${isRagveer ? 'text-primary' : 'text-muted-foreground'}`}>Reputation</p>
                        <p className={`text-4xl font-bold ${isRagveer ? 'text-primary' : 'gradient-text'}`}>{stats.reputation}</p>
                    </div>
                </div>
            </div>

            {/* Special Ragveer Appreciation Section */}
            {isRagveer && (
                <div className="bg-primary/5 dark:bg-primary/10 border-y border-primary/20 p-6 sm:p-8 relative overflow-hidden my-8 rounded-2xl shadow-sm">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-3 text-center md:text-left flex-1">
                            <h3 className="text-2xl font-bold text-primary flex items-center justify-center md:justify-start gap-2">
                                <Heart className="h-6 w-6 text-primary" />
                                Support the Creator
                            </h3>
                            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                                Ragveer (Techofino) generously provided the initial spreadsheet of cashback rates that made CBack possible. 
                                We are incredibly grateful for his countless hours compiling this data for the community to make our lives easier!
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
                            <Button 
                                variant="default"
                                className="whitespace-nowrap transition-transform hover:scale-105"
                                onClick={() => window.open('https://docs.google.com/spreadsheets/d/1LEw12SuubMCJ-6u_4PZtRSD8FI1B5uecbeyCvCApQtk/edit?usp=sharing', '_blank')}
                            >
                                <Star className="h-4 w-4 mr-2" />
                                View Original Data
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Merchants Added"
                    value={profileData.stats.total_entries.toString()}
                    icon={Plus}
                    description="Total contributions"
                />
                <StatCard
                    title="Edits Approved"
                    value={profileData.stats.approved_edits.toString()}
                    icon={Edit}
                    description="Improvements made"
                />
                <StatCard
                    title="Total Contribution"
                    value={contributions.length > 0 ? `${contributions.length}` : "0"}
                    icon={TrendingUp}
                    description="Recent activity count"
                />
                <StatCard
                    title="Total Points"
                    value={stats.reputation}
                    icon={Award}
                    description="Community score"
                />
            </div>

            {/* Contributions Dashboard */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold px-1">Recent Activity</h3>
                <Card className="glass-card overflow-hidden border-white/5">
                    <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Contribution History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {contributions.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No recent activity to show.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {contributions.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 
                                                ${item.type === 'added' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    item.type === 'edited' ? 'bg-blue-500/10 text-blue-500' :
                                                        'bg-purple-500/10 text-purple-500'}`}>
                                                {item.type === 'added' ? <Plus className="h-5 w-5" /> :
                                                    item.type === 'edited' ? <Edit className="h-5 w-5" /> :
                                                        <Award className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {item.type === 'added' ? 'Added new merchant' :
                                                        item.type === 'edited' ? 'Updated details for' :
                                                            'Verified cashback for'} <span className="font-bold">{item.merchant}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">{item.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
