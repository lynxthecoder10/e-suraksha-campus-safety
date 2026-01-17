import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle, MapPin, Activity, Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    try {
      await login();
      // Session creation happens automatically in App.tsx after successful login
    } catch (error) {
      console.error('Login error:', error);
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
                Secure authentication via Internet Identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="adminAccess" 
                  checked={showAdminSecret}
                  onCheckedChange={(checked) => setShowAdminSecret(checked as boolean)}
                  disabled={isLoggingIn}
                />
                <Label 
                  htmlFor="adminAccess" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Request Admin Access?
                </Label>
              </div>

              {showAdminSecret && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="adminSecret" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Admin Secret
                  </Label>
                  <Input
                    id="adminSecret"
                    type="password"
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    placeholder="Enter admin secret (optional)"
                    disabled={isLoggingIn}
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Admin secret verification will occur after successful login
                  </p>
                </div>
              )}

              <Button
                size="lg"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Login with Internet Identity'
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By logging in, you agree to our terms of service and privacy policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
