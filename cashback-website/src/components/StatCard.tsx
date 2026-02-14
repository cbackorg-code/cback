import { Card, CardContent } from "./ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
}

export default function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <Card className="overflow-hidden glass-card hover:glow-primary transition-all duration-300 group">
            <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs lg:text-sm font-medium text-muted-foreground truncate">{title}</p>
                        <div className="flex items-baseline gap-1 sm:gap-2 mt-1 sm:mt-2">
                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{value}</h3>
                            {trend && (
                                <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-accent">
                                    {trend}
                                </span>
                            )}
                        </div>
                        {description && (
                            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{description}</p>
                        )}
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl gradient-primary group-hover:glow-primary transition-all duration-300 shrink-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
