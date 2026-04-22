import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

// ============================================================================
// Auth Context — manages session, user, and profile state globally
// ============================================================================

interface AuthState {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    /** Fetches or refreshes the profile from Supabase `profiles` table */
    refreshProfile: () => Promise<void>;
    /** Manually update the profile state (e.g. after editing) */
    setProfile: (profile: Profile | null) => void;
    /** Signs out and clears all state */
    signOut: () => Promise<void>;
    /** Check if user is admin (role === 'admin' from DB, not JWT) */
    isAdmin: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    /** Fetch profile from public.profiles for the given user ID */
    const fetchProfile = useCallback(async (userId: string, currentUser?: User | null) => {
        const fallbackProfile: Profile = {
            id: userId,
            full_name: currentUser?.user_metadata?.full_name || '',
            avatar_url: currentUser?.user_metadata?.avatar_url || null,
            phone: currentUser?.phone || '',
            email: currentUser?.email || '',
            tier: 'Guest',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            // Wrap the entire process in a 5-second timeout
            const fetchTask = async () => {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        // Profile not found, let's try to create it
                        const { data: newProfile, error: insertError } = await (supabase.from('profiles') as any)
                            .insert([{
                                id: userId,
                                full_name: fallbackProfile.full_name,
                                tier: 'Guest',
                                status: 'active'
                            }])
                            .select()
                            .single();
                            
                        if (insertError || !newProfile) {
                            console.warn('Profile creation error (RLS?):', insertError?.message || 'No profile returned');
                            return fallbackProfile;
                        }
                        return newProfile as Profile;
                    }
                    console.warn('Profile fetch error (RLS?):', error.message);
                    return fallbackProfile;
                }
                if (!data) return fallbackProfile;
                return data as Profile;
            };

            const timeoutPromise = new Promise<Profile>((_, reject) => 
                setTimeout(() => reject(new Error('Fetch timeout')), 5000)
            );

            const finalProfile = await Promise.race([fetchTask(), timeoutPromise]);
            setProfile(finalProfile);

        } catch (err) {
            console.error('Profile fetch failed or timed out:', err);
            // Only fall back if we don't have a profile or the current profile is empty
            setProfile(prev => {
                if (prev && prev.full_name) return prev;
                return fallbackProfile;
            });
        }
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user?.id) {
            await fetchProfile(user.id, user);
        }
    }, [user, fetchProfile]);

    const signOut = useCallback(async () => {
        // Optimistically clear state immediately
        setSession(null);
        setUser(null);
        setProfile(null);
        window.location.hash = '#home';

        try {
            // Race the signout against a 2-second timeout so it doesn't hang the background process
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Sign out timeout')), 2000));
            await Promise.race([supabase.auth.signOut(), timeout]);
        } catch (error) {
            console.error('Error during sign out:', error);
        }
    }, []);

    const isAdmin = profile?.tier === 'Admin';

    // Bootstrap: get the current session + listen for auth changes
    useEffect(() => {
        let mounted = true;
        const timeoutRef: { current: NodeJS.Timeout | null } = { current: null };

        // We rely on onAuthStateChange's INITIAL_SESSION event to load the user.
        // But we keep a safety timeout just in case it never fires.
        timeoutRef.current = setTimeout(() => {
            if (mounted) {
                console.warn('[Auth] Initialization took too long, forcing loading to false.');
                setLoading(false);
            }
        }, 8000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, s) => {
                if (!mounted) return;

                // Only update if session actually changed or on initial load
                if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                    setSession(s);
                    setUser(s?.user ?? null);

                    if (s?.user) {
                        try {
                            await fetchProfile(s.user.id, s.user);
                        } catch (e) {
                            console.error('Auth state profile fetch error:', e);
                        }
                    } else {
                        setProfile(null);
                    }

                    // Clear the timeout if the auth state change fired
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    return (
        <AuthContext.Provider
            value={{ session, user, profile, loading, refreshProfile, setProfile, signOut, isAdmin }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/** Hook to consume auth context — must be used within <AuthProvider> */
export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
