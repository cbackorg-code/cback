import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "./ThemeProvider";
import { useState, useRef, useEffect } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCurrentIcon = () => {
        if (theme === "dark") return <Moon className="h-4 w-4" />;
        if (theme === "light") return <Sun className="h-4 w-4" />;
        return <Monitor className="h-4 w-4" />;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="hover:bg-foreground/10 hover:text-primary transition-all duration-300 text-foreground"
            >
                {getCurrentIcon()}
                <span className="sr-only">Toggle theme</span>
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 floating-dropdown overflow-hidden z-50">
                    <button
                        onClick={() => { setTheme("light"); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/10 transition-colors ${theme === "light" ? "text-primary bg-primary/5" : "text-foreground"
                            }`}
                    >
                        <Sun className="h-4 w-4" />
                        Light
                    </button>
                    <button
                        onClick={() => { setTheme("dark"); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/10 transition-colors ${theme === "dark" ? "text-primary bg-primary/5" : "text-foreground"
                            }`}
                    >
                        <Moon className="h-4 w-4" />
                        Dark
                    </button>
                    <button
                        onClick={() => { setTheme("system"); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-foreground/10 transition-colors ${theme === "system" ? "text-primary bg-primary/5" : "text-foreground"
                            }`}
                    >
                        <Monitor className="h-4 w-4" />
                        System
                    </button>
                </div>
            )}
        </div>
    );
}
