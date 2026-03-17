import React, { useState } from 'react';
import { api } from '../lib/api';
import { MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface FeedbackFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ open, onOpenChange }) => {
    const [type, setType] = useState('feature_request');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim()) {
            setError('Please enter a message');
            return;
        }

        setSubmitting(true);
        setError(null);
        
        try {
            await api.submitFeedback({
                type,
                message
            });
            setSuccess(true);
            setMessage('');
            setTimeout(() => {
                setSuccess(false);
                onOpenChange(false);
            }, 3000); // Close automatically after 3 seconds
        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card border-border/20 rounded-xl sm:rounded-lg overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Help Us Improve
                    </DialogTitle>
                    <DialogDescription>
                        Got an idea for a new feature? Found a bug? Let us know below!
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3 animate-in fade-in zoom-in duration-300">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-lg">Thank you!</p>
                            <p className="text-sm text-muted-foreground mt-1">Your feedback has been submitted.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="type">Feedback Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger id="type" className="bg-background/50">
                                    <SelectValue placeholder="Select feedback type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="feature_request">Feature Request</SelectItem>
                                    <SelectItem value="bug">Report a Bug</SelectItem>
                                    <SelectItem value="card_request">Card Addition Request</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Describe your request or bug in detail..."
                                className="bg-background/50 resize-none h-24"
                                disabled={submitting}
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in fade-in">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                className="hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => onOpenChange(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="btn-gradient"
                            >
                                {submitting ? "Submitting..." : "Submit Feedback"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};
