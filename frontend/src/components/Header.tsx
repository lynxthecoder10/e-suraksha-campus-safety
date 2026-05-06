import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Moon, Sun, LogOut, LayoutDashboard, UserRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function Header() {
  const { user, logout } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const isAuthenticated = !!user;
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 shadow-sm backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex min-h-16 items-center justify-between gap-3 py-2">
        <Link to="/" className="group flex min-w-0 items-center gap-3 rounded-full pr-3 transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 shadow-inner">
            <img src="/assets/generated/campus-shield-logo.png?v=1" alt="E-Suraksha Logo" className="h-9 w-9" />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-success" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold leading-tight bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent md:text-xl">
              E-Suraksha
            </span>
            <span className="block truncate text-xs text-muted-foreground">Campus Safety</span>
          </span>
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-2 md:gap-3">
          {isAuthenticated && (
            <Badge variant="outline" className="hidden max-w-[220px] gap-2 truncate rounded-full bg-accent/60 px-3 py-1.5 sm:flex">
              <Shield className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{displayName}</span>
            </Badge>
          )}

          {isAuthenticated && (
            <Button asChild variant="ghost" className="hidden rounded-full gap-2 md:inline-flex">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {isAuthenticated && (
            <Button
              onClick={handleLogout}
              variant="outline"
              className="rounded-full gap-2 px-3 md:px-4"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}

          {isAuthenticated && (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary sm:hidden" aria-label={`Signed in as ${displayName}`}>
              <UserRound className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
