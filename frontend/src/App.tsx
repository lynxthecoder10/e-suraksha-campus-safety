import { useSupabaseAuth, SupabaseAuthProvider } from './hooks/useSupabaseAuth';
import LoginPrompt from './components/LoginPrompt';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import PendingApproval from './pages/PendingApproval';
import RequireAdmin from './components/RequireAdmin';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSubscribeToAlerts, useSubscribeToReports } from './hooks/useRealtime';
import AuthCallback from './pages/AuthCallback';

function AppContent() {
  const { user, session, isInitializing, profile } = useSupabaseAuth();

  // Global Real-time Subscriptions
  useSubscribeToAlerts();
  useSubscribeToReports();

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

  // Helper to determine main content
  const getMainElement = () => {
    if (!session || !user) return <LoginPrompt />;
    if (profile?.status === 'pending') return <Navigate to="/pending-approval" replace />;
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrowserRouter>
        <Header />
        <main className="flex-1">
          <Routes>


            {/* Secret Admin Routes (Keyword: Tejas) */}
            <Route path="/tejas" element={<Navigate to="/tejas/login" replace />} />
            <Route path="/tejas/login" element={<AdminLogin />} />
            <Route path="/tejas/signup" element={<AdminSignup />} />

            {/* Legacy/Standard Admin Limit - Redirect to Home or Fake 404 in future */}
            <Route path="/admin" element={<Navigate to="/" replace />} />
            <Route path="/admin/login" element={<Navigate to="/" replace />} />

            {/* OAuth Callback Handlers (Handle potentially malformed redirects) */}
            <Route path="/oauth/consent" element={<AuthCallback />} />
            <Route path="//oauth/consent" element={<AuthCallback />} />

            {/* Main App Routes */}
            <Route path="/" element={getMainElement()} />

            <Route path="/pending-approval" element={
              session && user ? <PendingApproval /> : <Navigate to="/" />
            } />

            <Route path="/dashboard" element={
              session && user ? (
                profile?.status === 'pending' ? <Navigate to="/pending-approval" /> : <Dashboard />
              ) : <Navigate to="/" />
            } />

            {/* Protected Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ProfileSetupModal />
        <PWAInstallPrompt />
        <OfflineIndicator />
        <Toaster />
      </BrowserRouter>
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

