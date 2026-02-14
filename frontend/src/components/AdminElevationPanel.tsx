import { useState } from 'react';
import { useAddAdminAccess, useGetAllUsers, useRecoverAdminSession } from '../hooks/useQueries';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ShieldCheck, AlertTriangle, Lock, UserPlus, Info, RefreshCw } from 'lucide-react';

export default function AdminElevationPanel() {
  const [targetPrincipal, setTargetPrincipal] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const addAdminAccess = useAddAdminAccess();
  const recoverAdminSession = useRecoverAdminSession();
  const { data: users = [] } = useGetAllUsers();
  const { logout, user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  const isAdmin = users.some(u => u.user.toText() === user?.id && u.role === 'admin');
  const adminCount = users.filter(u => u.role === 'admin' && u.isActive).length;

  const handleRecoverAdmin = async () => {
    try {
      const result = await recoverAdminSession.mutateAsync();

      toast.success('Admin Session Recovered', {
        description: 'Emergency admin access has been restored. Please log in again.',
      });

      // Force logout and clear cache after recovery
      setTimeout(async () => {
        await logout();
        queryClient.clear();
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Admin recovery error:', error);

      const errorMessage = error?.message || '';
      if (errorMessage.includes('Admin sessions exist')) {
        toast.error('Recovery Not Needed', {
          description: 'Active admin sessions already exist.',
        });
      } else if (errorMessage.includes('Only deployer')) {
        toast.error('Unauthorized', {
          description: 'Only the deployer principal can recover admin access.',
        });
      } else {
        toast.error('Recovery Failed', {
          description: 'Unable to recover admin session. Please contact support.',
        });
      }
    }
  };

  const handleAddAdminClick = () => {
    const principal = targetPrincipal.trim() || selectedUser;

    if (!principal) {
      toast.error('Please select or enter a user');
      return;
    }

    // Validate principal format
    try {
      // Basic validation - principal should be alphanumeric with dashes
      if (!/^[a-z0-9-]+$/.test(principal)) {
        toast.error('Invalid Principal ID format');
        return;
      }
    } catch (error) {
      toast.error('Invalid Principal ID');
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmAddAdmin = async () => {
    const principal = targetPrincipal.trim() || selectedUser;

    if (!principal) {
      toast.error('Please select or enter a user');
      return;
    }

    try {
      await addAdminAccess.mutateAsync(principal);

      toast.success('Admin access granted', {
        description: `User ${principal.slice(0, 8)}...${principal.slice(-6)} has been granted admin privileges.`,
      });

      // Clear form
      setTargetPrincipal('');
      setSelectedUser('');
    } catch (error: any) {
      console.error('Add admin error:', error);

      const errorMessage = error?.message || '';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('Access denied', {
          description: 'Only admins can grant admin access. Please check your permissions.',
        });
      } else if (errorMessage.includes('not found')) {
        toast.error('User not found', {
          description: 'The specified user does not exist in the system.',
        });
      } else {
        toast.error('Failed to grant admin access', {
          description: 'An error occurred. Please try again or contact support.',
        });
      }
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const nonAdminUsers = users.filter(u => u.role !== 'admin');

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin Privilege Management
          </CardTitle>
          <CardDescription>
            Grant admin access to other users or recover admin access in emergencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grant" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grant" disabled={!isAdmin}>
                Grant Admin Access
              </TabsTrigger>
              <TabsTrigger value="recover">
                Emergency Recovery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grant" className="space-y-4 mt-4">
              {!isAdmin ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Only existing admins can grant admin access to other users.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Grant admin privileges to another user. The target user's session will be invalidated and they must log in again.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userSelect" className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Select User
                      </Label>
                      <Select
                        value={selectedUser}
                        onValueChange={(value) => {
                          setSelectedUser(value);
                          setTargetPrincipal('');
                        }}
                        disabled={addAdminAccess.isPending}
                      >
                        <SelectTrigger id="userSelect">
                          <SelectValue placeholder="Select a user from the list" />
                        </SelectTrigger>
                        <SelectContent>
                          {nonAdminUsers.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground">
                              No non-admin users available
                            </div>
                          ) : (
                            nonAdminUsers.map((user) => (
                              <SelectItem key={user.user.toText()} value={user.user.toText()}>
                                {user.name || 'Unknown'} ({user.user.toText().slice(0, 8)}...{user.user.toText().slice(-6)})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="principalInput" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Enter Principal ID
                      </Label>
                      <Input
                        id="principalInput"
                        type="text"
                        value={targetPrincipal}
                        onChange={(e) => {
                          setTargetPrincipal(e.target.value);
                          setSelectedUser('');
                        }}
                        placeholder="Enter user's Principal ID"
                        disabled={addAdminAccess.isPending}
                        className="font-mono text-sm"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddAdminClick}
                      className="w-full"
                      disabled={addAdminAccess.isPending || (!targetPrincipal.trim() && !selectedUser)}
                    >
                      {addAdminAccess.isPending ? 'Granting Access...' : 'Grant Admin Access'}
                    </Button>
                  </div>

                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      This action will invalidate the target user's session and is logged in the audit trail.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </TabsContent>

            <TabsContent value="recover" className="space-y-4 mt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Emergency admin session recovery for the deployer principal when no active admin sessions exist.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">Current Status:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Active Admin Count: {adminCount}</li>
                      <li>Total Users: {users.length}</li>
                      <li>Recovery Available: {adminCount === 0 ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleRecoverAdmin}
                  className="w-full"
                  disabled={recoverAdminSession.isPending}
                  variant={adminCount === 0 ? 'default' : 'outline'}
                >
                  {recoverAdminSession.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Recovering...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Recover Admin Session
                    </>
                  )}
                </Button>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs space-y-2">
                    <p>This emergency recovery mechanism:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Only works for the deployer principal</li>
                      <li>Only activates when zero active admin sessions exist</li>
                      <li>Automatically grants admin privileges</li>
                      <li>Requires logout and re-login to activate</li>
                      <li>Is logged in the audit trail</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Admin Access Grant
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to grant admin privileges to this user?</p>
              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                {targetPrincipal.trim() || selectedUser}
              </p>
              <p className="text-xs">This action will:</p>
              <ul className="text-xs list-disc list-inside space-y-1">
                <li>Grant full admin privileges to the user</li>
                <li>Invalidate the user's current session</li>
                <li>Require the user to log in again</li>
                <li>Be logged in the audit trail with your Principal ID</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddAdmin}>
              Confirm Grant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
