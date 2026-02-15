import { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

import { Checkbox } from "./ui/checkbox";

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onLogin: (user: { name: string; email: string; picture?: string }) => void;
    onDocsClick: () => void;
}

export function LoginDialog({ open, onOpenChange, onLogin, onDocsClick }: LoginDialogProps) {
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
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
                            Welcome Back
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Sign in to access your account
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-2 px-1">
                        <Checkbox
                            id="terms"
                            checked={isTermsAccepted}
                            onCheckedChange={(checked) => setIsTermsAccepted(checked as boolean)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                            >
                                I agree to the <span className="text-primary hover:underline cursor-pointer" onClick={(e) => {
                                    e.preventDefault();
                                    onOpenChange(false); // Close dialog
                                    onDocsClick(); // Navigate to docs
                                }}>Terms & Guidelines</span>
                            </label>
                            <p className="text-xs text-muted-foreground/80">
                                You confirm that you understand the community guidelines.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleGoogleLogin}
                        variant="outline"
                        className="w-full h-11 rounded-xl gap-3 bg-white hover:bg-white/90 text-gray-900 border-gray-200 shadow-sm relative overflow-hidden group transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isGoogleLoading || !isTermsAccepted}
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


                </div>
            </DialogContent>
        </Dialog>
    );
}
