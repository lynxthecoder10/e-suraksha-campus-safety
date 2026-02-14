import { useState } from 'react';
import { useGetAllUsers, useUpdateUserRole, useSetAccountStatus } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { UserCog, Shield, User as UserIcon, Ban, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { UserRole } from 'declarations/backend';

export default function UserManagementPanel() {
  const { data: users = [], isLoading } = useGetAllUsers();
  const updateRole = useUpdateUserRole();
  const setAccountStatus = useSetAccountStatus();
  const { identity, logout: clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<boolean | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'role' | 'status'>('role');

  const currentUserPrincipal = identity?.getPrincipal().toString();

  const handleRoleChange = (userPrincipal: string, newRole: UserRole) => {
    setSelectedUser(userPrincipal);
    setSelectedRole(newRole);
    setActionType('role');
    setConfirmDialogOpen(true);
  };

  const handleStatusChange = (userPrincipal: string, newStatus: boolean) => {
    setSelectedUser(userPrincipal);
    setSelectedStatus(newStatus);
    setActionType('status');
    setConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (actionType === 'role' && selectedRole !== null) {
        await updateRole.mutateAsync({ user: selectedUser, role: selectedRole });

        toast.success('User role updated successfully', {
          description: `Role changed to ${selectedRole}. User session invalidated.`,
        });

        // If we changed our own role, force logout
        if (selectedUser === currentUserPrincipal) {
          toast.info('Your role was changed. Logging out...', {
            description: 'Please log in again to continue.',
          });
          setTimeout(async () => {
            await clear();
            queryClient.clear();
          }, 2000);
        }
      } else if (actionType === 'status' && selectedStatus !== null) {
        await setAccountStatus.mutateAsync({ user: selectedUser, isActive: selectedStatus });

        toast.success('Account status updated successfully', {
          description: selectedStatus ? 'Account enabled' : 'Account disabled. User session invalidated.',
        });

        // If we disabled our own account, force logout
        if (!selectedStatus && selectedUser === currentUserPrincipal) {
          toast.info('Your account was disabled. Logging out...', {
            description: 'Please contact an administrator.',
          });
          setTimeout(async () => {
            await clear();
            queryClient.clear();
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error('Error updating user:', error);

      // Show generic error message for security
      toast.error('Access denied', {
        description: 'Unable to complete the action. Please check your permissions.',
      });
    } finally {
      setConfirmDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole(null);
      setSelectedStatus(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>;
      case 'user':
        return <Badge variant="default" className="gap-1"><UserIcon className="h-3 w-3" />User</Badge>;
      case 'guest':
        return <Badge variant="outline" className="gap-1"><UserIcon className="h-3 w-3" />Guest</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/30">
        <CheckCircle className="h-3 w-3" />Active
      </Badge>
    ) : (
      <Badge variant="outline" className="gap-1 bg-destructive/10 text-destructive border-destructive/30">
        <Ban className="h-3 w-3" />Inactive
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user roles, permissions, and account status. All changes are logged and trigger session invalidation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Role changes and account status updates will invalidate the user's session, requiring them to log in again.
            </AlertDescription>
          </Alert>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.user.toText()}>
                      <TableCell className="font-mono text-xs">
                        {user.user.toText().slice(0, 8)}...{user.user.toText().slice(-6)}
                      </TableCell>
                      <TableCell>{user.name || 'N/A'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.user.toText(), value as UserRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant={user.isActive ? 'destructive' : 'default'}
                            size="sm"
                            onClick={() => handleStatusChange(user.user.toText(), !user.isActive)}
                            disabled={updateRole.isPending || setAccountStatus.isPending}
                          >
                            {user.isActive ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Action
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {actionType === 'role' && selectedRole && (
                <>
                  <p>Are you sure you want to change this user's role to <strong>{selectedRole}</strong>?</p>
                  <p className="text-xs">This action will:</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    <li>Invalidate the user's current session</li>
                    <li>Require the user to log in again</li>
                    <li>Be logged in the audit trail</li>
                  </ul>
                </>
              )}
              {actionType === 'status' && selectedStatus !== null && (
                <>
                  <p>Are you sure you want to <strong>{selectedStatus ? 'enable' : 'disable'}</strong> this user's account?</p>
                  <p className="text-xs">This action will:</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    <li>Invalidate the user's current session</li>
                    <li>{selectedStatus ? 'Allow the user to log in' : 'Prevent the user from accessing the system'}</li>
                    <li>Be logged in the audit trail</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
