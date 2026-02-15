import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function AuthCallback() {
    const navigate = useNavigate();
    const { session, isInitializing } = useSupabaseAuth();

    useEffect(() => {
        if (!isInitializing) {
            if (session) {
                // Successful login
                navigate('/dashboard');
            } else {
                // No session found, redirect to login
                navigate('/');
            }
        }
    }, [session, isInitializing, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <div className="text-primary animate-pulse">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto"
                    >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" x2="3" y1="12" y2="12" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold">Completing Sign In...</h2>
                <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mt-4"></div>
            </div>
        </div>
    );
}
