import { type ReactNode } from "react";
import { CircleUser, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LoginDialog } from "./LoginDialog";
import { UserMenu } from "./UserMenu";

interface LayoutProps {
    children: ReactNode;
    onLogoClick?: () => void;
    onProfileClick?: () => void;
    user: { name: string; email: string; avatar_url?: string; reputation?: number } | null;
    onCloseLogin: () => void;
    isLoginOpen: boolean;
    onDocsClick: () => void;
    onLogout: () => void;
    onOpenLogin: () => void;
}

export default function Layout({
    children,
    onLogoClick,
    onProfileClick,
    user,
    onLogout,
    onOpenLogin,
    onCloseLogin,
    isLoginOpen,
    onDocsClick
}: LayoutProps) {

    return (
        <div className="flex flex-col min-h-screen text-foreground">
            {/* Floating Navbar */}
            <header className="sticky top-0 z-50 w-full px-3 sm:px-4 pt-3 sm:pt-4">
                <nav className="floating-navbar mx-auto max-w-6xl">
                    <div className="flex h-14 sm:h-16 items-center px-4 sm:px-6">
                        {/* Logo */}
                        <div
                            className={`mr-4 flex items-center gap-2 sm:gap-3 ${onLogoClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                            onClick={onLogoClick}
                        >
                            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-primary glow-primary shadow-lg">
                                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg sm:text-2xl gradient-text">
                                    CBack
                                </span>
                                <span className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5 sm:-mt-1 hidden xs:block">
                                    Smart Cashback Tracking
                                </span>
                            </div>
                        </div>

                        {/* Nav Items */}
                        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
                            {user ? (
                                <UserMenu user={user} onLogout={onLogout} onProfileClick={onProfileClick} />
                            ) : (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={onOpenLogin}
                                        className="gap-2 rounded-full px-2 sm:px-4 h-9 w-9 sm:w-auto btn-gradient text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 p-0 sm:p-auto"
                                    >
                                        <CircleUser className="h-5 w-5" />
                                        <span className="text-sm font-medium hidden sm:inline">Sign In</span>
                                    </Button>
                                    <LoginDialog
                                        open={isLoginOpen}
                                        onOpenChange={(open) => open ? onOpenLogin() : onCloseLogin()}
                                        onDocsClick={onDocsClick}
                                    />
                                </>
                            )}
                            <ThemeToggle />
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="glass rounded-xl p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Built for credit card enthusiasts. Community-driven. Open Source.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                © 2025 CBack
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
