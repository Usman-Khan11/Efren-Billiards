import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { AuthError } from '@supabase/supabase-js';

// ============================================================================
// useProfile — handles profile linking (email/phone) and updating
// ============================================================================

interface LinkingState {
    loading: boolean;
    error: string | null;
    success: string | null;
}

/** Parse Supabase AuthApiError into human-friendly messages */
function parseAuthError(error: AuthError): string {
    const msg = error.message.toLowerCase();

    if (msg.includes('rate') || msg.includes('too many')) {
        return 'Too many requests. Please wait a minute before trying again.';
    }
    if (msg.includes('already registered') || msg.includes('already been registered')) {
        return 'This contact method is already linked to another account.';
    }
    if (msg.includes('invalid') && msg.includes('otp')) {
        return 'Invalid verification code. Please check and try again.';
    }
    if (msg.includes('expired')) {
        return 'Verification code has expired. Please request a new one.';
    }
    if (msg.includes('phone') && msg.includes('format')) {
        return 'Invalid phone format. Use international format: +971XXXXXXXXX';
    }
    // Fallback
    return error.message;
}

export function useProfileLinking() {
    const { user, refreshProfile } = useAuth();
    const [phoneLinking, setPhoneLinking] = useState<LinkingState>({
        loading: false,
        error: null,
        success: null,
    });
    const [emailLinking, setEmailLinking] = useState<LinkingState>({
        loading: false,
        error: null,
        success: null,
    });
    const [otpSent, setOtpSent] = useState(false);

    /**
     * Send an OTP to a new phone number to link it to the current account.
     * Supabase dispatches the SMS via Twilio under the hood.
     */
    const sendPhoneOtp = useCallback(async (phone: string) => {
        setPhoneLinking({ loading: true, error: null, success: null });
        try {
            const { error } = await supabase.auth.updateUser({ phone });
            if (error) {
                setPhoneLinking({
                    loading: false,
                    error: parseAuthError(error),
                    success: null,
                });
                return;
            }
            setOtpSent(true);
            setPhoneLinking({
                loading: false,
                error: null,
                success: 'Verification code sent! Check your phone.',
            });
        } catch (err: any) {
            setPhoneLinking({
                loading: false,
                error: err.message || 'Unexpected error sending OTP.',
                success: null,
            });
        }
    }, []);

    /**
     * Verify the OTP to confirm phone linking.
     * Uses verifyOtp with type 'phone_change' since we're updating the user's phone.
     */
    const verifyPhoneOtp = useCallback(async (phone: string, token: string) => {
        setPhoneLinking({ loading: true, error: null, success: null });
        try {
            const { error } = await supabase.auth.verifyOtp({
                phone,
                token,
                type: 'phone_change',
            });
            if (error) {
                setPhoneLinking({
                    loading: false,
                    error: parseAuthError(error),
                    success: null,
                });
                return;
            }
            // Update the profile table with the new phone
            if (user?.id) {
                await (supabase.from('profiles') as any)
                    .update({ phone })
                    .eq('id', user.id);
            }
            setOtpSent(false);
            await refreshProfile();
            setPhoneLinking({
                loading: false,
                error: null,
                success: 'Phone number linked successfully!',
            });
        } catch (err: any) {
            setPhoneLinking({
                loading: false,
                error: err.message || 'Unexpected error verifying OTP.',
                success: null,
            });
        }
    }, [user?.id, refreshProfile]);

    /**
     * Link a new email to the current account.
     * Supabase will send a confirmation email.
     */
    const linkEmail = useCallback(async (email: string) => {
        setEmailLinking({ loading: true, error: null, success: null });
        try {
            const { error } = await supabase.auth.updateUser({ email });
            if (error) {
                setEmailLinking({
                    loading: false,
                    error: parseAuthError(error),
                    success: null,
                });
                return;
            }
            // Update profile table
            if (user?.id) {
                await (supabase.from('profiles') as any)
                    .update({ email })
                    .eq('id', user.id);
            }
            await refreshProfile();
            setEmailLinking({
                loading: false,
                error: null,
                success: 'Confirmation email sent! Please check your inbox.',
            });
        } catch (err: any) {
            setEmailLinking({
                loading: false,
                error: err.message || 'Unexpected error linking email.',
                success: null,
            });
        }
    }, [user?.id, refreshProfile]);

    return {
        phoneLinking,
        emailLinking,
        otpSent,
        sendPhoneOtp,
        verifyPhoneOtp,
        linkEmail,
    };
}
