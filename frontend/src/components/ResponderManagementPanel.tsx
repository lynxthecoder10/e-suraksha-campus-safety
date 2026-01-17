import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Users, UserCheck, UserX, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Responder {
  id: string;
  name: string;
  role: string;
  onDuty: boolean;
  assignedIncidents: number;
  lastActive: Date;
}

export default function ResponderManagementPanel() {
  const [responders, setResponders] = useState<Responder[]>([
    {
      id: '1',
      name: 'Officer John Smith',
      role: 'Security',
      onDuty: true,
      assignedIncidents: 2,
      lastActive: new Date(),
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      role: 'Medical',
      onDuty: true,
      assignedIncidents: 1,
      lastActive: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      name: 'Officer Mike Davis',
      role: 'Security',
      onDuty: false,
      assignedIncidents: 0,
      lastActive: new Date(Date.now() - 7200000),
    },
  ]);

  const toggleDutyStatus = (responderId: string) => {
    setResponders((prev) =>
      prev.map((r) =>
        r.id === responderId ? { ...r, onDuty: !r.onDuty } : r
      )
    );
    toast.success('Duty status updated');
  };

  const onDutyCount = responders.filter((r) => r.onDuty).length;
  const totalIncidents = responders.reduce((sum, r) => sum + r.assignedIncidents, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Responders</p>
                <p className="text-2xl font-bold">{responders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold">{onDutyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
                <p className="text-2xl font-bold">{totalIncidents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Responder List</CardTitle>
          <CardDescription>
            Manage responder assignments and duty status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {responders.map((responder) => (
              <div
                key={responder.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar>
                    <AvatarImage src="/assets/generated/responder-avatar.dim_100x100.png" />
                    <AvatarFallback>
                      {responder.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{responder.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{responder.role}</Badge>
                      {responder.assignedIncidents > 0 && (
                        <Badge variant="secondary">
                          {responder.assignedIncidents} assigned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {responder.lastActive.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {responder.onDuty ? 'On Duty' : 'Off Duty'}
                    </span>
                    <Switch
                      checked={responder.onDuty}
                      onCheckedChange={() => toggleDutyStatus(responder.id)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
