// ============================================================================
// Database TypeScript Definitions
// Maps to the existing Supabase PostgreSQL schema
// ============================================================================

export type MembershipTier = 'Guest' | 'Player' | 'Bronze' | 'Silver' | 'Gold' | 'Admin' | 'guest' | 'admin';
export type ProfileStatus = 'active' | 'suspended' | 'pending';

export interface MemberBanner {
    id: string;
    title: string;
    marketing_message: string | null;
    instruction_message: string | null;
    target_type: 'general' | 'tier' | 'specific_member';
    target_value: string | null;
    whatsapp_preset: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Player {
    id: string;
    name: string;
    avatar_url: string | null;
    rating: number;
    wins: number;
    losses: number;
    created_at: string;
}

export interface Ranking {
    id: string;
    game_type: TournamentCategory;
    rank: number;
    player_name: string;
    user_id: string | null;
    score: number;
    trend: 'up' | 'down' | 'same';
    company: string | null;
    created_at?: string;
    updated_at?: string;
}

/** Profile row — maps to `public.profiles` table */
export interface Profile {
    id: string;                       // UUID — references auth.users.id
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    phone: string | null;
    tier: MembershipTier;
    status: ProfileStatus;
    created_at: string;
    updated_at: string;
}

/** Tournament status enum */
export type TournamentStatus = 'pending' | 'in_progress' | 'completed';

/** Tournament format enum */
export type TournamentFormat = 'single_elimination' | 'double_elimination';

/** Game type enum */
export type TournamentCategory = 'billiards' | 'darts' | 'chess';

/** Tournament row — maps to `public.tournaments` */
export interface Tournament {
    id: string;
    name: string;
    description: string | null;
    prize_amount: number | null;
    game_type: TournamentCategory;
    status: TournamentStatus;
    format: TournamentFormat;
    start_date: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

/** Registration row — maps to `public.registrations` */
export interface Registration {
    id: string;
    user_id: string;
    tournament_id: string;
    status: 'registered' | 'checked_in' | 'withdrawn';
    registered_at: string;
}

export interface Match {
    id: string;
    tournament_id: string;
    round: number;
    match_order: number;
    player1_id: string | null;
    player2_id: string | null;
    winner_id: string | null;
    status: 'pending' | 'in_progress' | 'completed';
    next_match_id: string | null;
    loser_next_match_id?: string | null;     // New: for double elimination
    bracket_type?: 'winners' | 'losers' | 'grand_final'; // New: bracket identification
    created_at: string;
}

// ============================================================================
// Supabase Database type — used by createClient<Database>(...)
// This provides end-to-end type safety for all Supabase queries.
// ============================================================================
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: {
                    id: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    tier: MembershipTier;
                    status: ProfileStatus;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    email?: string | null;
                    phone?: string | null;
                    tier?: MembershipTier;
                    status?: ProfileStatus;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            players: {
                Row: Player;
                Insert: {
                    id: string;
                    name: string;
                    avatar_url?: string | null;
                    rating: number;
                    wins: number;
                    losses: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    avatar_url?: string | null;
                    rating?: number;
                    wins?: number;
                    losses?: number;
                    created_at?: string;
                };
                Relationships: [];
            };
            tournaments: {
                Row: Tournament;
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    prize_amount?: number | null;
                    game_type: TournamentCategory;
                    status: TournamentStatus;
                    format?: TournamentFormat;
                    start_date?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    prize_amount?: number | null;
                    game_type?: TournamentCategory;
                    status?: TournamentStatus;
                    format?: TournamentFormat;
                    start_date?: string | null;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            registrations: {
                Row: Registration;
                Insert: {
                    id?: string;
                    user_id: string;
                    tournament_id: string;
                    status?: 'registered' | 'checked_in' | 'withdrawn';
                    registered_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    tournament_id?: string;
                    status?: 'registered' | 'checked_in' | 'withdrawn';
                    registered_at?: string;
                };
                Relationships: [];
            };
            matches: {
                Row: Match;
                Insert: {
                    id?: string;
                    tournament_id: string;
                    round: number;
                    match_order: number;
                    player1_id?: string | null;
                    player2_id?: string | null;
                    winner_id?: string | null;
                    status?: 'pending' | 'in_progress' | 'completed';
                    next_match_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    tournament_id?: string;
                    round?: number;
                    match_order?: number;
                    player1_id?: string | null;
                    player2_id?: string | null;
                    winner_id?: string | null;
                    status?: 'pending' | 'in_progress' | 'completed';
                    next_match_id?: string | null;
                    created_at?: string;
                };
                Relationships: [];
            };
            rankings: {
                Row: Ranking;
                Insert: {
                    id?: string;
                    game_type: TournamentCategory;
                    rank: number;
                    player_name: string;
                    user_id?: string | null;
                    score?: number;
                    trend?: 'up' | 'down' | 'same';
                    company?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    game_type?: TournamentCategory;
                    rank?: number;
                    player_name?: string;
                    user_id?: string | null;
                    score?: number;
                    trend?: 'up' | 'down' | 'same';
                    company?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            member_banners: {
                Row: MemberBanner;
                Insert: {
                    id?: string;
                    title: string;
                    marketing_message?: string | null;
                    instruction_message?: string | null;
                    target_type: 'general' | 'tier' | 'specific_member';
                    target_value?: string | null;
                    whatsapp_preset?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    marketing_message?: string | null;
                    instruction_message?: string | null;
                    target_type?: 'general' | 'tier' | 'specific_member';
                    target_value?: string | null;
                    whatsapp_preset?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            tournament_status: TournamentStatus;
            tournament_category: TournamentCategory;
        };
        CompositeTypes: Record<string, never>;
    };
}
