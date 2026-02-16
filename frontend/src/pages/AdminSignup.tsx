import { useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Lock, UserCog, UserPlus, Fingerprint } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminSignup() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [securityToken, setSecurityToken] = useState(''); // The "Secret Key" to become admin
    const [isLoading, setIsLoading] = useState(false);

    const { supabase } = useSupabaseAuth(); // access client directly for signUp with metadata
    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Hardcoded check for the "Permission Key" to create an admin
        // In a real app, this might be validated via Edge Function, but for now client-side gate + DB trigger is okay
        if (securityToken !== 'Tejas') {
            toast.error('Security Breach', { description: 'Invalid Security Token. Access Denied.' });
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'admin',    // Driven by the SQL trigger update
                        status: 'active'  // Driven by the SQL trigger update
                    }
                }
            });

            if (error) throw error;

            toast.success('Admin Account Created', {
                description: 'Welcome to the Command Center. Please sign in.'
            });
            navigate('/tejas/login');

        } catch (error: any) {
            toast.error('Signup Failed', { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-950 text-slate-50 overflow-hidden">
            {/* Left Panel: Visual Branding (Same as Login) */}
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
                        Initialize <br />
                        <span className="text-red-500">Command Protocol</span>
                    </h1>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="p-6 bg-slate-800/50 rounded-lg border border-slate-700 backdrop-blur-sm">
                        <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-red-500" />
                            Restricted Access
                        </h3>
                        <p className="text-sm text-slate-400">
                            Administrator creation requires a valid Level-5 Security Token.
                            Unathorized attempts are logged.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-slate-500">
                    <span>Secure Channel Encrypted</span>
                </div>
            </div>

            {/* Right Panel: Signup Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative">
                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight">Create Admin Profile</h2>
                        <p className="text-slate-400 text-sm">Verify identity to establish new credentials.</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token" className="text-red-400 font-mono text-xs uppercase tracking-wider">Security Token (Required)</Label>
                            <div className="relative">
                                <Input
                                    id="token"
                                    type="password"
                                    placeholder="Enter 'Tejas' to authorize"
                                    value={securityToken}
                                    onChange={(e) => setSecurityToken(e.target.value)}
                                    required
                                    className="pl-10 bg-red-950/20 border-red-900/50 focus:border-red-500 focus:ring-red-500/20 transition-all font-mono"
                                />
                                <Fingerprint className="w-4 h-4 absolute left-3 top-3 text-red-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                            <div className="relative">
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Officer Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="pl-10 bg-slate-900/50 border-slate-800 focus:border-red-500/50 focus:ring-red-500/20 transition-all"
                                />
                                <UserCog className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">Official Email</Label>
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
                                <UserPlus className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">Set Password</Label>
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
                            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20 transition-all mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Authorize & Create Account'}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-slate-800/50 text-center text-xs text-slate-500">
                        Already authorized?
                        <Link to="/tejas/login" className="ml-2 text-red-500 hover:text-red-400 hover:underline">Access Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
