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
  const [selectedUser, setSelectedUser] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Hooks
  const addAdminAccess = useAddAdminAccess();
  const { data: users = [] } = useGetAllUsers();
  const { user } = useSupabaseAuth(); // Current user

  // Derived state
  const isAdmin = users.some(u => u.user.toText() === user?.id && u.role === 'admin');
  const nonAdminUsers = users.filter(u => u.role !== 'admin');

  const handleGrantAccess = () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmGrant = async () => {
    try {
      await addAdminAccess.mutateAsync(selectedUser);
      toast.success('Admin privileges granted');
      setSelectedUser('');
    } catch (error: any) {
      toast.error('Failed to grant admin access', {
        description: error.message || 'Unknown error'
      });
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin Privilege Management
          </CardTitle>
          <CardDescription>
            Grant admin access to other registered users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Share Admin Portal</span>
            </div>
            <div className="flex gap-2">
              <code className="flex-1 p-2 bg-background rounded border text-xs font-mono flex items-center">
                {window.location.origin}/admin/login
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/admin/login`);
                  toast.success('Link copied to clipboard');
                }}
              >
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with users. Once they sign up/login, you can find them in the list below to promote them.
            </p>
          </div>

          {!isAdmin ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>You do not have permission to manage admins.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select User to Promote</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nonAdminUsers.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">No eligible users found</div>
                    ) : (
                      nonAdminUsers.map(u => (
                        <SelectItem key={u.user.toText()} value={u.user.toText()}>
                          {u.name} ({u.role})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleGrantAccess}
                disabled={!selectedUser || addAdminAccess.isPending}
              >
                {addAdminAccess.isPending ? 'Granting...' : 'Grant Admin Access'}
              </Button>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Promoting a user grants them full access to the Command Center. This action is logged.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote this user to Admin? They will have full system access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmGrant}>Promote User</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
