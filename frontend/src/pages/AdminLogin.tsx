
import { useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Lock, UserCog, CheckCircle2, Globe2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPassword } = useSupabaseAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithPassword(email, password);
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error('Access Denied', { description: 'Invalid administration credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-50 overflow-hidden">
      {/* Left Panel: Visual Branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 bg-slate-900 border-r border-slate-800">
        <div className="absolute inset-0 bg-[url('/assets/generated/safety-zones-interface.dim_600x400.svg')] opacity-5 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/90" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">E-Suraksha Admin</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Command Center <br />
            <span className="text-red-500">Access Control</span>
          </h1>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <Globe2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-slate-200">Global Monitoring</p>
              <p className="text-sm">Real-time incident tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
              <UserCog className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-slate-200">Role Management</p>
              <p className="text-sm">Granular access control</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex gap-6">
          <span>v3.3.0-stable</span>
          <span>Security Protocol: TLS 1.3</span>
          <span>Server Status: <span className="text-green-500">Online</span></span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative">
        <div className="absolute top-0 right-0 p-8">
          {/* Decorative elements */}
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Authenticate</h2>
            <p className="text-slate-400 text-sm">Enter your secure credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Administrator ID</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@suraksha.campus"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-slate-900/50 border-slate-800 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                />
                <UserCog className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Security Key</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 bg-slate-900/50 border-slate-800 focus:border-red-500/50 focus:ring-red-500/20 transition-all font-mono tracking-widest"
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Safe Environment</span>
            </div>
            <a href="#" className="hover:text-slate-300 transition-colors">Forgot Credentials?</a>
          </div>

          <div className="text-center text-xs text-slate-600 mt-4">
            <Link to="/tejas/signup" className="hover:text-red-500 transition-colors">
              Initialize New Command Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

