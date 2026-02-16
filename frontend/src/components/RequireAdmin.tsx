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
                toast.error('Unauthorized Access', { description: 'This area is restricted to administrators.' });
                navigate('/');
            } else {
                setIsChecking(false);
            }
        };

        checkRole();
    }, [user, isInitializing, profile, navigate, refreshProfile]);

    if (isInitializing || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    // Double check
    if (profile?.role !== 'admin') return null;

    return <>{children}</>;
}
