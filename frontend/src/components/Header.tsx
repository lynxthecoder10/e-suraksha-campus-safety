import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Shield, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function Header() {
  // const { login, logout: clear, loginStatus, identity } = useInternetIdentity(); // OLD
  const { user, session, logout, isInitializing } = useSupabaseAuth(); // NEW
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  // We'll fetch this from Supabase profile later
  // const { data: userProfile } = useGetCallerUserProfile();
  const userProfile = user?.user_metadata?.full_name ? { name: user.user_metadata.full_name } : null;

  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/generated/campus-shield-logo.png?v=1" alt="E-Suraksha Logo" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              E-Suraksha
            </h1>
            <p className="text-xs text-muted-foreground">Campus Safety</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{user?.email?.split('@')[0] || 'User'}</span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
