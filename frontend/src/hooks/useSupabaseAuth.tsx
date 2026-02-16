import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
    id: string;
    role: string;
    status: string;
    name?: string;
}

interface SupabaseAuthContextType {
    user: User | null;
    session: Session | null;
    profile: UserProfile | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (email: string) => Promise<void>;
    signInWithPassword: (email: string, password: string) => Promise<void>;
    signUpWithPassword: (email: string, password: string, fullName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    verifyOtp: (email: string, token: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);

export const useSupabaseAuth = () => {
    const context = useContext(SupabaseAuthContext);
    if (!context) {
        throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
    }
    return context;
};

export const SupabaseAuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // Don't throw, just set profile to null/partial
                return;
            }
            setProfile(data);
        } catch (error) {
            console.error('Profile fetch exception:', error);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setIsInitializing(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setIsInitializing(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    const login = async (email: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });

            if (error) throw error;

            toast.success('Magic link sent!', {
                description: 'Check your email for the login link.',
            });
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('Login failed', {
                description: error.message,
            });
            throw error;
        }
    };

    const signInWithPassword = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            toast.success('Logged in successfully');
        } catch (error: any) {
            console.error('Login error:', error);
            toast.error('Login failed', { description: error.message });
            throw error;
        }
    };

    const signUpWithPassword = async (email: string, password: string, fullName: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });
            if (error) throw error;
            toast.success('Account created!', {
                description: 'Please check your email to confirm your account.',
            });
        } catch (error: any) {
            console.error('Signup error:', error);
            toast.error('Signup failed', { description: error.message });
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Google login error:', error);
            toast.error('Google login failed', { description: error.message });
            throw error;
        }
    };

    const verifyOtp = async (email: string, token: string) => {
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });
            if (error) throw error;
            toast.success('Logged in successfully');
        } catch (error: any) {
            console.error('OTP verification error:', error);
            toast.error('Verification failed', { description: error.message });
            throw error;
        }
    }

    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setProfile(null);
            toast.success('Logged out successfully');
        } catch (error: any) {
            console.error('Logout error:', error);
            toast.error('Logout failed', {
                description: error.message,
            });
        }
    };

    const value = {
        user,
        session,
        profile,
        isAuthenticated: !!user,
        isInitializing,
        login,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        verifyOtp,
        logout,
        refreshProfile,
    };

    return (
        <SupabaseAuthContext.Provider value={value}>
            {children}
        </SupabaseAuthContext.Provider>
    );
};
