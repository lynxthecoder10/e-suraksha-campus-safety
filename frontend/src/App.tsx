import { useEffect, useState } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useCreateUserSession, useValidateStoredSession, useRefreshUserSession } from './hooks/useQueries';
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
import { toast } from 'sonner';
import { dbAPI } from './utils/db'; // Robust session handling

const SESSION_KEY = 'current-session';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sessionRestoreAttempted, setSessionRestoreAttempted] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track if we are actively restoring a session to prevent login flash
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  const createSessionMutation = useCreateUserSession();
  const validateSessionQuery = useValidateStoredSession();
  const refreshSessionMutation = useRefreshUserSession();

  // Non-blocking session restoration with timeout protection
  useEffect(() => {
    if (isInitializing || !identity) return;
    if (sessionRestoreAttempted) return;

    const restoreSession = async () => {
      // Start restoring session - keeps loading state active
      setIsRestoringSession(true);

      try {
        // Try to restore from IndexedDB for better security
        const storedSession = await dbAPI.get(SESSION_KEY);

        if (storedSession) {
          const sessionData = storedSession;

          // Check if session is expired
          const now = Date.now();
          const expiresAt = Number(sessionData.expiresAt) / 1_000_000; // Convert nanoseconds to milliseconds

          if (expiresAt > now) {
            // Session not expired, validate with backend (with timeout)
            try {
              const validationPromise = validateSessionQuery.mutateAsync();
              const timeoutPromise = new Promise<boolean>((_, reject) =>
                setTimeout(() => reject(new Error('Validation timeout')), 5000)
              );

              const isValid = await Promise.race([validationPromise, timeoutPromise]);

              if (isValid) {
                setUserRole(sessionData.role);
                console.log('[Session] Restored from storage:', sessionData.role);

                // Cache session in service worker for offline access
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'CACHE_SESSION',
                    sessionData: {
                      role: sessionData.role,
                      expiresAt: sessionData.expiresAt,
                      sessionId: sessionData.sessionId,
                    }
                  });
                }

                // Done with restoration
                setSessionRestoreAttempted(true);
                setIsRestoringSession(false);
                return;
              }
            } catch (error) {
              console.log('[Session] Validation failed or timed out, will create new session');
            }
          } else {
            console.log('[Session] Stored session expired');
          }

          // Clear invalid/expired session
          await dbAPI.delete(SESSION_KEY);
        }
      } catch (error) {
        console.error('[Session] Restore failed:', error);
        await dbAPI.delete(SESSION_KEY);
      }

      // Create new session if restoration failed
      if (!userRole) {
        try {
          const session = await createSessionMutation.mutateAsync();
          setUserRole(session.role);

          // Store session with expiration in IndexedDB
          const sessionData = {
            role: session.role,
            expiresAt: session.expiresAt,
            sessionId: session.sessionId,
          };
          await dbAPI.put(SESSION_KEY, sessionData);
          console.log('[Session] Created new session:', session.role);

          // Cache session data in service worker for offline access
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'CACHE_SESSION',
              sessionData
            });
          }
        } catch (error) {
          console.error('[Session] Creation failed:', error);
          toast.error('Failed to establish session. Please try logging in again.');
        }
      }

      setSessionRestoreAttempted(true);
      setIsRestoringSession(false);
    };

    // Run session restoration asynchronously without blocking UI
    restoreSession();
  }, [identity, isInitializing, sessionRestoreAttempted, userRole, createSessionMutation, validateSessionQuery]);

  // Session revalidation when coming back online
  useEffect(() => {
    const handleRevalidateSession = async () => {
      if (!identity || !userRole) return;

      console.log('[Session] Revalidating session after coming online');

      try {
        const storedSession = await dbAPI.get(SESSION_KEY);
        if (storedSession) {
          const sessionData = storedSession;

          // Validate with timeout
          const validationPromise = validateSessionQuery.mutateAsync();
          const timeoutPromise = new Promise<boolean>((_, reject) =>
            setTimeout(() => reject(new Error('Validation timeout')), 5000)
          );

          const isValid = await Promise.race([validationPromise, timeoutPromise]);

          if (!isValid) {
            console.log('[Session] Session invalid, refreshing...');
            const newSession = await refreshSessionMutation.mutateAsync();

            const updatedSessionData = {
              role: newSession.role,
              expiresAt: newSession.expiresAt,
              sessionId: newSession.sessionId,
            };
            await dbAPI.put(SESSION_KEY, updatedSessionData);
            setUserRole(newSession.role);

            toast.success('Session refreshed successfully');
          } else {
            console.log('[Session] Session still valid');
          }
        }
      } catch (error) {
        console.error('[Session] Revalidation failed:', error);
      }
    };

    window.addEventListener('revalidate-session', handleRevalidateSession);

    return () => {
      window.removeEventListener('revalidate-session', handleRevalidateSession);
    };
  }, [identity, userRole, validateSessionQuery, refreshSessionMutation]);

  // PWA network status handling
  useEffect(() => {
    const handleNetworkChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const online = customEvent.detail.online;
      setIsOnline(online);

      if (online) {
        toast.success('Connection restored');
      } else {
        toast.info('You are offline. Emergency features still available.');
      }
    };

    window.addEventListener('network-status-change', handleNetworkChange);

    return () => {
      window.removeEventListener('network-status-change', handleNetworkChange);
    };
  }, []);

  // Handle offline queue sync
  useEffect(() => {
    const handleSyncQueue = () => {
      console.log('[PWA] Sync offline queue triggered');
      window.dispatchEvent(new Event('process-offline-queue'));
    };

    window.addEventListener('sync-offline-queue', handleSyncQueue);

    return () => {
      window.removeEventListener('sync-offline-queue', handleSyncQueue);
    };
  }, []);

  // Periodic session refresh (every 30 minutes)
  useEffect(() => {
    if (!identity || !userRole) return;

    const refreshInterval = setInterval(async () => {
      try {
        const storedSession = await dbAPI.get(SESSION_KEY);
        if (storedSession) {
          const sessionData = storedSession;
          const now = Date.now();
          const expiresAt = Number(sessionData.expiresAt) / 1_000_000;

          // Refresh if session expires in less than 1 hour
          if (expiresAt - now < 60 * 60 * 1000) {
            console.log('[Session] Proactively refreshing session');
            const newSession = await refreshSessionMutation.mutateAsync();

            const updatedSessionData = {
              role: newSession.role,
              expiresAt: newSession.expiresAt,
              sessionId: newSession.sessionId,
            };
            await dbAPI.put(SESSION_KEY, updatedSessionData);
            setUserRole(newSession.role);
          }
        }
      } catch (error) {
        console.error('[Session] Periodic refresh failed:', error);
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    return () => clearInterval(refreshInterval);
  }, [identity, userRole, refreshSessionMutation]);

  if (isInitializing) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Initializing E-Suraksha...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  if (!identity) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <LoginPrompt />
          </main>
          <Footer />
          <PWAInstallPrompt />
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  // Show minimal loading only during initial session setup OR restoration
  if ((!userRole && !sessionRestoreAttempted) || isRestoringSession) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Restoring secure session...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // If session restoration attempted AND COMPLETED but no role, show login again
  if (!userRole && sessionRestoreAttempted && !isRestoringSession) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <LoginPrompt />
          </main>
          <Footer />
          <PWAInstallPrompt />
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {userRole === 'admin' ? <AdminDashboard /> : <Dashboard />}
        </main>
        <Footer />
        <ProfileSetupModal />
        <PWAInstallPrompt />
        <OfflineIndicator />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
