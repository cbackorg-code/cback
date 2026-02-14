import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

interface UserMenuProps {
    user: { name: string; email: string };
    onLogout: () => void;
    onProfileClick?: () => void;
}

export function UserMenu({ user, onLogout, onProfileClick }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Get initials
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-foreground/5 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
                <div className="text-right hidden sm:block mr-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                </div>

                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full gradient-primary flex items-center justify-center shadow-md ring-2 ring-background group-hover:scale-105 transition-transform duration-200">
                    <span className="text-xs sm:text-sm font-bold text-white">{initials}</span>
                </div>

                <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl glass-card border border-white/10 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-border/10 mb-1">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <div className="px-1">
                        <button
                            onClick={() => {
                                onProfileClick?.();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors text-left"
                        >
                            <User className="h-4 w-4" />
                            Profile
                        </button>
                        <button
                            onClick={() => {
                                onLogout();
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-left mt-1"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
