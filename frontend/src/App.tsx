import { useSupabaseAuth, SupabaseAuthProvider } from './hooks/useSupabaseAuth';
import LoginPrompt from './components/LoginPrompt';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useGetCallerUserProfile } from './hooks/useQueries'; // We will update this later to fetch from Supabase
import { useEffect, useState } from 'react';

function AppContent() {
  const { user, session, isInitializing } = useSupabaseAuth();

  // Temporary: Fetch profile using new hook once we update useQueries. 
  // For now, we rely on Supabase session user metadata or profile table.
  // We'll update useQueries in the next step.
  // const { data: userProfile } = useGetCallerUserProfile(); 

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleNetworkChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading E-Suraksha...</p>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <LoginPrompt />
        </main>
        <Footer />
        <PWAInstallPrompt />
        <Toaster />
      </div>
    );
  }

  // Determine role from profile (to be implemented fully with RLS)
  // For now, assume 'user' or check metadata if we set it there.
  const userRole: string = 'user'; // Default for now

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Simple role check for now, will enhance with profile data later */}
        {userRole === 'admin' ? <AdminDashboard /> : <Dashboard />}
      </main>
      <Footer />
      <ProfileSetupModal />
      <PWAInstallPrompt />
      <OfflineIndicator />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SupabaseAuthProvider>
        <AppContent />
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

