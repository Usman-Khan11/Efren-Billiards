import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { X, Loader2 } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/` }
        });
        if (error) {
            setMessage(error.message);
            setLoading(false);
        }
    };

    const handleEmailPasswordAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (!error) setMessage('Check your email for confirmation!');
            else setMessage(error.message);
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (!error) onClose();
            else setMessage(error.message);
        }
        setLoading(false);
    };

    const handleTwilioOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await supabase.auth.signInWithOtp({ phone });
        setLoading(false);
        if (!error) {
            setMessage('OTP sent to your phone!');
        } else {
            setMessage(error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                        {authMethod === 'phone' ? 'Phone Sign In' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {message && (
                        <div className="p-3 text-sm font-bold text-center text-blue-400 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            {message}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={authMethod + (isSignUp ? 'signup' : 'signin')}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Continue with Google
                            </button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase font-bold tracking-widest">Or</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>

                            {authMethod === 'email' ? (
                                <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <input
                                        type="password"
                                        placeholder={isSignUp ? "Create Password" : "Password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !email || !password}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                                        {isSignUp ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleTwilioOTP} className="space-y-4">
                                    <input
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !phone}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                                        Send OTP
                                    </button>
                                </form>
                            )}

                            <div className="flex flex-col gap-4 mt-6">
                                {authMethod === 'email' && (
                                    <div className="flex bg-zinc-900 p-1 rounded-xl">
                                        <button
                                            onClick={() => { setIsSignUp(false); setMessage(''); }}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${!isSignUp ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-white'}`}
                                            type="button"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => { setIsSignUp(true); setMessage(''); }}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${isSignUp ? 'bg-blue-600 text-white shadow' : 'text-zinc-500 hover:text-white'}`}
                                            type="button"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        setAuthMethod(authMethod === 'email' ? 'phone' : 'email');
                                        setMessage('');
                                    }}
                                    className="w-full text-center text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    {authMethod === 'email' ? 'Switch to Phone Login' : 'Switch to Email Login'}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
