import { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogin: (user: { name: string; email: string; picture?: string }) => void;
}

export function LoginDialog({ open, onOpenChange, onLogin }: LoginDialogProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Check your email for the login link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                toast.success('Successfully logged in!');
                onOpenChange(false);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
            // Supabase will redirect, so no need to close dialog manually here immediately
        } catch (error: any) {
            toast.error("Google Login Failed: " + error.message);
            setIsGoogleLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] max-w-[400px] rounded-2xl p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
                <div className="glass-card flex flex-col p-6 sm:p-8 gap-6 backdrop-blur-xl bg-background/60 border border-white/10 rounded-2xl">
                    <DialogHeader className="items-center text-center space-y-2">
                        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg mb-2">
                            <LogIn className="h-6 w-6 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {isSignUp ? "Sign up to start contributing" : "Sign in to access your account"}
                        </DialogDescription>
                    </DialogHeader>

                    <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full h-11 rounded-xl gap-3 bg-white hover:bg-white/90 text-gray-900 border-gray-200 shadow-sm relative overflow-hidden group transition-all"
                        disabled={isGoogleLoading || isLoading}
                    >
                        {isGoogleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                        )}
                        <span className="font-medium text-[#1f1f1f]">Sign in with Google</span>
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none text-foreground/80">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter email"
                                required
                                className="bg-background/40 border-white/10 focus-visible:ring-primary/30 focus-visible:border-primary/50 h-11 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none text-foreground/80">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                className="bg-background/40 border-white/10 focus-visible:ring-primary/30 focus-visible:border-primary/50 h-11 rounded-xl"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl btn-gradient text-white font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isSignUp ? "Creating Account..." : "Signing In..."}
                                </>
                            ) : (
                                isSignUp ? "Create Account" : "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or Use Demo Account</span>
                        </div>
                    </div>

                    <Button
                        onClick={() => {
                            // Auto-fill and submit demo credentials - logic needs to actually sign in or just mock it? 
                            // Creating a real "demo@example.com" on Supabase is hassle. 
                            // Let's just mock the login success callback if they click demo, 
                            // BUT warn them it's local-only state if we do that.
                            // Better: actually sign them in anonymously or with a hardcoded real account if it exists?
                            // Safest: Just mock the onLogin callback for now so they can test UI.

                            // Checking if we can just bypass auth for demo...
                            // Actually, let's just create a real signInWithPassword call with a known test account if we had one.
                            // But since we don't know if they created one, let's revert to the "Mock" behavior for the Demo button ONLY.
                            onLogin({ name: "Demo User", email: "demo@example.com" });
                            onOpenChange(false);
                            toast.success("Signed in as Demo User (Local Mode)");
                        }}
                        variant="ghost"
                        className="w-full h-11 rounded-xl border border-dashed border-white/20 hover:bg-white/5"
                    >
                        Skip & Continue as Guest (Demo)
                    </Button>

                    <div className="text-center text-sm">
                        <button
                            type="button"
                            className="text-primary hover:underline hover:text-primary/80 transition-colors"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp
                                ? 'Already have an account? Sign In'
                                : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
