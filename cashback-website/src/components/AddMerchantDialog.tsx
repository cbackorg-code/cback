import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Store, Check, Percent } from "lucide-react";

import { cn } from "../lib/utils";
import { api } from "../lib/api";

interface AddMerchantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cardId?: string; // UUID from backend
    cardName: string; // Display name
    existingStatementNames: string[];
    existingMerchantNames?: string[]; // Optional since we just improved it
    existingMCCs?: string[]; // New prop for MCC suggestions
    maxRate: number;
    onSuccess?: () => void;
}

export function AddMerchantDialog({ open, onOpenChange, cardId, cardName, existingStatementNames, existingMerchantNames = [], existingMCCs = [], maxRate, onSuccess }: AddMerchantDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    // UI states for suggestions
    const [openRateCombobox, setOpenRateCombobox] = useState(false);
    const [openMerchantCombobox, setOpenMerchantCombobox] = useState(false);
    const [openStatementCombobox, setOpenStatementCombobox] = useState(false);
    const [openMccCombobox, setOpenMccCombobox] = useState(false);

    const [formData, setFormData] = useState({
        merchantName: "",
        statementName: "",
        cashbackRate: "",
        category: "",
        notes: ""
    });

    // Generate suggested rates dynamically from maxRate down to 0
    const suggestedRates = useMemo(() => {
        const rates = [];
        for (let i = maxRate; i >= 0; i--) {
            rates.push(`${i}%`);
        }
        return rates;
    }, [maxRate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.cashbackRate) {
            toast.error("Please enter a cashback rate");
            return;
        }

        const numericRate = parseFloat(formData.cashbackRate.replace("%", "").trim());
        if (isNaN(numericRate) || numericRate > maxRate) {
            toast.error(`Rate cannot exceed ${maxRate}% for this card.`);
            return;
        }
        if (numericRate < 0) {
            toast.error("Rate cannot be negative.");
            return;
        }

        // Duplicate Check
        const normalizedInput = formData.statementName.toLowerCase().trim();
        const isDuplicate = existingStatementNames.some(
            name => name.toLowerCase().trim() === normalizedInput
        );

        if (isDuplicate) {
            toast.error("merchant statement name already exists", {
                description: `A merchant with statement name "${formData.statementName}" is already listed.`
            });
            return;
        }

        setIsLoading(true);

        try {
            // Use cardId if provided, otherwise fetch and match by name
            let targetCardId = cardId;

            if (!targetCardId) {
                const cards = await api.getCards();
                const targetCard = cards.find((c: any) => c.name === cardName || c.slug === cardName);
                if (!targetCard) throw new Error(`Card not found: ${cardName}`);
                targetCardId = targetCard.id;
            }

            await api.createEntry({
                card_id: targetCardId,
                statement_name: formData.statementName,
                cashback_rate: formData.cashbackRate,
                comments: formData.notes,
                mcc: formData.category,
                name: formData.merchantName
            });

            toast.success("Entry Submitted", {
                description: `Thanks! ${formData.statementName} is live.`
            });

            onOpenChange(false);
            if (onSuccess) onSuccess();
            setFormData({
                merchantName: "",
                statementName: "",
                cashbackRate: "",
                category: "",
                notes: ""
            });
        } catch (error: any) {
            console.error(error);
            // Check if error message contains "already exists" or similar from backend
            if (error.message?.toLowerCase().includes("exist") || error.message?.toLowerCase().includes("duplicate")) {
                toast.error("merchant statement name already exists", {
                    description: "This entry has already been added."
                });
            } else {
                toast.error("Failed to submit entry", {
                    description: error.message || "Please try again later."
                });
            }

        } finally {
            setIsLoading(false);
        }
    };

    // Helper to render autocomplete
    const renderAutocomplete = (
        value: string,
        onChange: (val: string) => void,
        suggestions: string[],
        isOpen: boolean,
        setIsOpen: (open: boolean) => void,
        placeholder: string,
        id: string
    ) => {
        // Filter suggestions based on input
        const filtered = suggestions.filter(s =>
            s.toLowerCase().includes(value.toLowerCase()) &&
            s.toLowerCase() !== value.toLowerCase()
        ).slice(0, 5); // Limit to top 5

        return (
            <div
                className="relative"
                onBlur={(e) => {
                    // Start a timeout to allow click events on the dropdown items to fire
                    // before closing the dropdown.
                    // Another common approach is checking relatedTarget, but relying on relatedTarget 
                    // inside the same container is safer.
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setIsOpen(false);
                    }
                }}
            >
                <div className="relative">
                    <Input
                        id={id}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        required={id !== "category"} // Category is optional? Original input wasn't required
                        className="bg-background/50 focus-visible:ring-primary/20"
                        autoComplete="off"
                    />
                </div>
                {isOpen && value.length > 0 && filtered.length > 0 && (
                    <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                        <div className="max-h-[200px] overflow-y-auto p-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
                            {filtered.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => {
                                        onChange(suggestion);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer touch-manipulation text-foreground"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] glass-card border-border/20 rounded-xl sm:rounded-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" />
                        Add New Entry
                    </DialogTitle>
                    <DialogDescription>
                        Contribute a new merchant for <strong>{cardName}</strong>. Max rate: {maxRate}%.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="merchant">Merchant Name <span className="text-destructive">*</span></Label>
                        {renderAutocomplete(
                            formData.merchantName,
                            (val) => setFormData(prev => ({ ...prev, merchantName: val })),
                            existingMerchantNames,
                            openMerchantCombobox,
                            setOpenMerchantCombobox,
                            "e.g. Starbucks",
                            "merchant"
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="statement">Statement / Payee Name <span className="text-destructive">*</span></Label>
                        {renderAutocomplete(
                            formData.statementName,
                            (val) => setFormData(prev => ({ ...prev, statementName: val })),
                            existingStatementNames,
                            openStatementCombobox,
                            setOpenStatementCombobox,
                            "STARBUCKS*...",
                            "statement"
                        )}
                        <p className="text-[10px] text-muted-foreground">Exactly as it appears on your statement.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate">Cashback Rate <span className="text-destructive">*</span></Label>
                            <div
                                className="relative"
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setOpenRateCombobox(false);
                                    }
                                }}
                            >
                                <div className="relative">
                                    <Input
                                        placeholder={`Max ${maxRate}%`}
                                        value={formData.cashbackRate}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, cashbackRate: e.target.value }));
                                            setOpenRateCombobox(true);
                                        }}
                                        onFocus={() => setOpenRateCombobox(true)}
                                        className="bg-background/50 focus-visible:ring-primary/20 pr-8 h-10"
                                    />
                                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
                                </div>
                                {openRateCombobox && (
                                    <div className="absolute top-full left-0 z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                                        <div className="max-h-[200px] overflow-y-auto p-1 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40">
                                            {suggestedRates
                                                .filter(rate => !formData.cashbackRate || rate.includes(formData.cashbackRate) || rate.replace('%', '').includes(formData.cashbackRate))
                                                .length === 0 && (
                                                    <div className="text-sm text-muted-foreground p-2 text-center">
                                                        Use "{formData.cashbackRate}"
                                                    </div>
                                                )}
                                            {suggestedRates
                                                .filter(rate => !formData.cashbackRate || rate.includes(formData.cashbackRate) || rate.replace('%', '').includes(formData.cashbackRate))
                                                .map((rate) => (
                                                    <button
                                                        key={rate}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({ ...prev, cashbackRate: rate }));
                                                            setOpenRateCombobox(false);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-2 py-1.5 text-sm rounded-sm flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer touch-manipulation",
                                                            formData.cashbackRate === rate ? "bg-primary/5 text-primary" : "text-foreground"
                                                        )}
                                                    >
                                                        {rate}
                                                        {formData.cashbackRate === rate && <Check className="h-3 w-3" />}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Category / MCC</Label>
                            {renderAutocomplete(
                                formData.category,
                                (val) => setFormData(prev => ({ ...prev, category: val })),
                                existingMCCs,
                                openMccCombobox,
                                setOpenMccCombobox,
                                "e.g. Dining, 5812",
                                "category"
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any restrictions or details..."
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="bg-background/50 resize-none h-20"
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="btn-gradient text-white">
                            {isLoading ? "Submitting..." : "Submit Entry"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
