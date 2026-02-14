import { ArrowLeft, Mail, Calendar, Award, Edit, Plus, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import StatCard from "../components/StatCard";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { ProfileStats } from "../lib/api";
import { toast } from "sonner";

interface ProfileProps {
    onBack: () => void;
    user: { name: string; email: string; picture?: string };
}

export default function Profile({ onBack, user }: ProfileProps) {
    const [profileData, setProfileData] = useState<ProfileStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await api.getProfile();
                setProfileData(data);
            } catch (error: any) {
                console.error("Error fetching profile:", error);
                if (error.message === "Unauthorized") {
                    toast.error("Please login to view your profile");
                } else {
                    toast.error("Failed to load profile data");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
                <p className="text-muted-foreground">Failed to load profile</p>
                <Button onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    const stats = {
        initials: user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase(),
        joinDate: new Date(profileData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        reputation: profileData.reputation_score,
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
                <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
            </div>

            {/* User Profile Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
                {/* Decorative background gradient */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                {/* Avatar */}
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full gradient-primary flex items-center justify-center shadow-xl ring-4 ring-background shrink-0 overflow-hidden">
                    {user.picture ? (
                        <img src={user.picture} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-3xl sm:text-4xl font-bold text-white">{stats.initials}</span>
                    )}
                </div>

                {/* User Info */}
                <div className="text-center sm:text-left space-y-2 py-2 flex-1 relative z-10">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                            <Mail className="h-4 w-4" /> {user.email}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-4 pt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/30 text-secondary-foreground text-sm font-medium border border-secondary/20">
                            <Calendar className="h-4 w-4" />
                            Member since {stats.joinDate}
                        </div>
                    </div>
                </div>

                {/* Reputation Score - Desktop */}
                <div className="hidden sm:flex flex-col items-end justify-center h-full py-2 z-10">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Reputation</p>
                        <p className="text-4xl font-bold gradient-text">{stats.reputation}</p>
                    </div>
                </div>
            </div>

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
                    value={profileData.stats.total_entries.toString()}
                    icon={Edit}
                    description="Improvements made"
                />
                <StatCard
                    title="Current Streak"
                    value={contributions.length > 0 ? `${contributions.length} Days` : "0 Days"}
                    icon={TrendingUp}
                    description="Consecutive activity"
                    trend={contributions.length > 3 ? "Fire!" : undefined}
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
                                No contributions yet. Start adding merchants to build your reputation!
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
                                        <div className="font-mono font-bold text-primary">
                                            {item.points}
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
