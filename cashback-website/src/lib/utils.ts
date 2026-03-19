import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function showAuthToast(actionText: string, description: string, onOpenLogin: () => void) {
    toast.error(`Please login to ${actionText}`, {
        description,
        action: {
            label: "OK",
            onClick: onOpenLogin
        }
    })
}
