import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { toast } from 'sonner';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { user, isInitializing, profile, refreshProfile } = useSupabaseAuth();
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            if (isInitializing) return;

            if (!user) {
                navigate('/admin/login');
                return;
            }

            // If profile is already loaded, check it
            // If not (rare race condition if profile fetch fails), try to refresh
            if (!profile) {
                await refreshProfile();
                // Profile will be updated in next render cycle if successful
                // We depend on 'profile' in dependency array so we will come back here
                return;
            }

            if (profile.role !== 'admin') {
                // Debug Mode: Show why it failed instead of redirecting
                console.log("Admin Check Failed:", profile);
            } else {
                setIsChecking(false);
            }
        };

        checkRole();
    }, [user, isInitializing, profile, navigate, refreshProfile]);

    if (isInitializing || isChecking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
                <p>Verifying Privileges...</p>
                {/* Temporary Debug Info */}
                {profile && (
                    <div className="mt-8 p-4 bg-slate-900 rounded border border-slate-700 font-mono text-xs text-left">
                        <p className="text-red-400 font-bold mb-2">DEBUG INFO (Share this if stuck):</p>
                        <p>User ID: {user?.id}</p>
                        <p>Email: {user?.email}</p>
                        <p>Role: <span className="text-yellow-400">{profile.role}</span></p>
                        <p>Status: {profile.status}</p>
                    </div>
                )}
            </div>
        );
    }

    if (profile?.role !== 'admin') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
                <div className="bg-red-900/20 p-6 rounded-lg border border-red-900/50 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h2>
                    <p className="text-slate-300 mb-6">Your account does not have administrator privileges.</p>

                    <div className="bg-black/30 p-4 rounded text-left font-mono text-sm space-y-2 mb-6">
                        <p><strong>Current Info:</strong></p>
                        <p>ID: <span className="opacity-50">{user?.id}</span></p>
                        <p>Role: <span className="text-red-400">{profile?.role || 'None'}</span></p>
                        <p>Status: {profile?.status || 'Unknown'}</p>
                    </div>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => refreshProfile()}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                        >
                            Force Refresh
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
