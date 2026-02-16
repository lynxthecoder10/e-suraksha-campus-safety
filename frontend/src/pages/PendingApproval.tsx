import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useState } from 'react';

export default function PendingApproval() {
    const { logout, refreshProfile, profile } = useSupabaseAuth();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refreshProfile();
        // Small artificial delay to show the spinner (UX)
        setTimeout(() => setIsRefreshing(false), 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {/* Logo */}
                    <img
                        src="/assets/generated/campus-shield-logo.png?v=1"
                        alt="E-Suraksha"
                        className="h-20 w-20 mx-auto mb-4"
                    />
                </div>

                <Card className="border-border">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full w-fit mb-4">
                            <Clock className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                        </div>
                        <CardTitle className="text-2xl">Approval Pending</CardTitle>
                        <CardDescription className="text-lg pt-2">
                            Your account is waiting for administrator approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground text-center text-sm">
                            To ensure campus safety, all new accounts must be verified by the security team.
                            This usually takes less than 24 hours.
                        </p>

                        <div className="bg-muted p-4 rounded-lg text-sm">
                            <p className="font-medium mb-1">Current Status:</p>
                            <div className="flex items-center gap-2">
                                <span className="capitalize px-2 py-0.5 rounded text-amber-700 bg-amber-100 dark:bg-amber-900 dark:text-amber-100 text-xs font-bold border border-amber-200 dark:border-amber-800">
                                    {profile?.status || 'Pending'}
                                </span>
                                <span className="text-muted-foreground">
                                    {profile?.role === 'user' ? '(Standard User)' : `(${profile?.role})`}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Button
                                onClick={handleRefresh}
                                className="w-full"
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Check Status
                            </Button>

                            <Button
                                variant="outline"
                                onClick={logout}
                                className="w-full"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
