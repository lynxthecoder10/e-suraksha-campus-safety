import { useSupabaseAuth, SupabaseAuthProvider } from './hooks/useSupabaseAuth';
import LoginPrompt from './components/LoginPrompt';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
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

function AppContent() {
  const { user, session, isInitializing } = useSupabaseAuth();

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

  // If not authenticated, we only show public routes (like admin login) or the main login prompt
  // But wait, we want /admin/login to be accessible even if not logged in as a student.
  // And the main "/" should show LoginPrompt if not logged in.

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BrowserRouter>
        <Header />
        <main className="flex-1">
          <Routes>
            {/* Public/Auth Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Main App Routes */}
            <Route path="/" element={
              session && user ? <Dashboard /> : <LoginPrompt />
            } />
            <Route path="/dashboard" element={
              session && user ? <Dashboard /> : <Navigate to="/" />
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

