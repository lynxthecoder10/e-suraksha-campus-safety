import { useState } from 'react';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, MapPin, Activity, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPrompt() {
  const { login, signInWithPassword, signUpWithPassword, signInWithGoogle } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithPassword(email, password);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUpWithPassword(email, password, fullName);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <img
            src="/assets/generated/campus-shield-logo.dim_200x200.png"
            alt="E-Suraksha"
            className="h-24 w-24 mx-auto"
          />
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-chart-1 to-chart-2 bg-clip-text text-transparent">
            E-Suraksha
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your Campus Safety Companion - Emergency Response & Real-Time Protection
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
            <h3 className="font-semibold mb-2">SOS Alerts</h3>
            <p className="text-sm text-muted-foreground">
              Instant emergency alerts with location tracking
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <MapPin className="h-8 w-8 text-chart-1 mb-3" />
            <h3 className="font-semibold mb-2">Heat Maps</h3>
            <p className="text-sm text-muted-foreground">
              Visualize incident patterns and high-risk areas
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <Activity className="h-8 w-8 text-chart-2 mb-3" />
            <h3 className="font-semibold mb-2">Crisis Brain</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered risk prediction and analytics
            </p>
          </div>
          <div className="p-6 rounded-lg border border-border bg-card hover:shadow-lg transition-shadow">
            <Shield className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Offline Mode</h3>
            <p className="text-sm text-muted-foreground">
              BLE fallback for connectivity issues
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Login to Continue</CardTitle>
              <CardDescription>
                Secure authentication via Magic Link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={signInWithGoogle}>
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="flex gap-4 border-b rounded-t-lg">
                  <Button
                    variant={authMode === 'signin' ? 'default' : 'ghost'}
                    onClick={() => setAuthMode('signin')}
                    className="flex-1 rounded-b-none"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={authMode === 'signup' ? 'default' : 'ghost'}
                    onClick={() => setAuthMode('signup')}
                    className="flex-1 rounded-b-none"
                  >
                    Sign Up
                  </Button>
                </div>

                {authMode === 'signin' ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
