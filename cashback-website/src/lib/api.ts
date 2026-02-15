import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Card {
    id: string;
    slug: string;
    name: string;
    issuer: string;
    network: string;
    description: string;
    image_url: string;
    max_cashback_rate: number;
}

export interface Merchant {
    id: string;
    canonical_name: string;
    category?: string;
}

export interface CashbackEntry {
    id: string;
    card_id: string;
    merchant_id: string;
    statement_name: string;
    reported_cashback_rate: number;
    mcc?: string;
    notes?: string;
    status: string;
    upvote_count: number;
    downvote_count: number;
    created_at: string;
    last_verified_at?: string;
    card?: Card;
    merchant?: Merchant;
    contributor?: { id: string; display_name: string };
    user_vote?: 'up' | 'down' | null;
}

export interface ProfileStats {
    id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
    role: string;
    reputation_score: number;
    created_at: string;
    stats: {
        total_contributions: number;
        total_entries: number;
        approved_edits: number;
        reputation: number;
    };
    recent_activity: Array<{
        id: string;
        type: string;
        merchant: string;
        date: string;
        cashback_rate: number;
    }>;
}

export interface DashboardStats {
    total_cards: number;
    total_merchants: number;
    total_contributors: number;
    last_updated: string | null;
}

export const api = {
    getHeaders: async () => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Check for Demo Mode
        const isDemo = localStorage.getItem('demo_mode') === 'true';
        if (isDemo) {
            headers['Authorization'] = 'Bearer demo-token';
            return headers;
        }

        const { data } = await supabase.auth.getSession();
        if (data.session?.access_token) {
            headers['Authorization'] = `Bearer ${data.session.access_token}`;
        }
        return headers;
    },

    getCards: async (): Promise<Card[]> => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/cards/`, { headers });
        if (!res.ok) throw new Error('Failed to fetch cards');
        return res.json();
    },

    getEntries: async (search?: string, cardId?: string, offset = 0, limit = 20, sortBy: string = 'merchant'): Promise<CashbackEntry[]> => {
        const queryParams = new URLSearchParams({
            offset: offset.toString(),
            limit: limit.toString(),
            sort: sortBy
        });
        if (search) queryParams.append('search', search);
        if (cardId) queryParams.append('card_id', cardId);

        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/entries/?${queryParams}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch entries');
        return res.json();
    },

    getEntry: async (entryId: string): Promise<CashbackEntry> => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/entries/${entryId}`, { headers });
        if (!res.ok) {
            if (res.status === 404) throw new Error('Entry not found');
            throw new Error('Failed to fetch entry');
        }
        return res.json();
    },

    createEntry: async (entryData: any) => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/entries/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(entryData)
        });
        if (!res.ok) {
            if (res.status === 403) throw new Error("Unauthorized");
            throw new Error('Failed to create entry');
        }
        return res.json();
    },

    // Comments
    getComments: async (entryId: string) => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/comments/entry/${entryId}`, { headers });
        if (!res.ok) throw new Error('Failed to fetch comments');
        return res.json();
    },

    createComment: async (entryId: string, content: string) => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/comments/`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ entry_id: entryId, content })
        });
        if (!res.ok) {
            if (res.status === 403) throw new Error("Unauthorized");
            throw new Error('Failed to create comment');
        }
        return res.json();
    },

    voteEntry: async (entryId: string, voteType: 'up' | 'down'): Promise<{ upvotes: number; downvotes: number; status: string; is_verified: boolean; user_vote: 'up' | 'down' | null }> => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/votes/entries/${entryId}`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ vote_type: voteType }),
        });
        if (!res.ok) {
            if (res.status === 401) throw new Error("Unauthorized");
            throw new Error('Failed to vote');
        }
        return res.json();
    },

    // Rate Suggestions
    getRateSuggestions: async (entryId: string) => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/entries/${entryId}/suggestions`, {
            headers,
        });
        if (!res.ok) throw new Error('Failed to fetch suggestions');
        return res.json();
    },

    createRateSuggestion: async (entryId: string, rate: number, reason: string) => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/entries/${entryId}/suggestions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ proposed_rate: rate, reason }),
        });
        if (!res.ok) throw new Error('Failed to submit suggestion');
        return res.json();
    },

    voteRateSuggestion: async (suggestionId: string, voteType: 'up' | 'down') => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/entries/suggestions/${suggestionId}/vote`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ vote_type: voteType }),
        });
        if (!res.ok) throw new Error('Failed to vote on suggestion');
        return res.json();
    },

    // Profile
    getProfile: async (): Promise<ProfileStats> => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/profile/me`, { headers });
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
            throw new Error('Failed to fetch profile');
        }
        return res.json();
    },

    getDashboardStats: async (): Promise<DashboardStats> => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/stats/dashboard`, { headers });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
    },

    getPublicProfile: async (userId: string): Promise<ProfileStats> => {
        const headers = await api.getHeaders();
        const res = await fetch(`${API_URL}/profile/${userId}`, { headers });
        if (!res.ok) {
            if (res.status === 404) throw new Error("User not found");
            throw new Error('Failed to fetch public profile');
        }
        return res.json();
    }
};
