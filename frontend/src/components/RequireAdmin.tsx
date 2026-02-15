import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useGetCallerUserRole } from '../hooks/useQueries';
import { toast } from 'sonner';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { user, isInitializing } = useSupabaseAuth();
    const { data: roleData, isLoading: isRoleLoading } = useGetCallerUserRole();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isInitializing && !user) {
            navigate('/admin/login');
            return;
        }

        if (!isInitializing && !isRoleLoading && roleData) {
            const role = Object.keys(roleData)[0];
            if (role !== 'admin') {
                toast.error('Unauthorized Access', { description: 'This area is restricted to administrators.' });
                navigate('/'); // Bounce to student home
            }
        }
    }, [user, isInitializing, roleData, isRoleLoading, navigate]);

    if (isInitializing || isRoleLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    // Double check render block
    const role = roleData ? Object.keys(roleData)[0] : null;
    if (role !== 'admin') return null;

    return <>{children}</>;
}
