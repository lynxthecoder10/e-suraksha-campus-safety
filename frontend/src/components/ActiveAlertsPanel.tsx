import { useGetActiveAlerts, useResolveAlert } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AlertTriangle, Phone, Flame, HelpCircle, MapPin, Clock, CheckCircle } from 'lucide-react';
import type { SOSType } from 'declarations/backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ActiveAlertsPanelProps {
  isAdmin?: boolean;
}

export default function ActiveAlertsPanel({ isAdmin = false }: ActiveAlertsPanelProps) {
  const { data: alerts, isLoading } = useGetActiveAlerts();
  const resolveAlert = useResolveAlert();
  const { identity } = useInternetIdentity();

  const handleResolve = async (alertId: bigint) => {
    try {
      await resolveAlert.mutateAsync(alertId);
      toast.success('Alert resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve alert');
      console.error(error);
    }
  };

  const getSOSIcon = (type: SOSType) => {
    switch (type) {
      case SOSType.medical:
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case SOSType.police:
        return <Phone className="h-5 w-5 text-chart-1" />;
      case SOSType.fire:
        return <Flame className="h-5 w-5 text-chart-4" />;
      default:
        return <HelpCircle className="h-5 w-5 text-chart-2" />;
    }
  };

  const getSOSLabel = (type: SOSType) => {
    switch (type) {
      case SOSType.medical:
        return 'Medical';
      case SOSType.police:
        return 'Police';
      case SOSType.fire:
        return 'Fire';
      default:
        return 'Other';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading active alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Active Emergency Alerts
        </CardTitle>
        <CardDescription>
          {alerts?.length || 0} active alert{alerts?.length !== 1 ? 's' : ''} requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No active alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const isOwnAlert = identity?.getPrincipal().toString() === alert.user.toString();
              const canResolve = isAdmin || isOwnAlert;

              return (
                <div
                  key={alert.id.toString()}
                  className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getSOSIcon(alert.sosType)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="destructive">{getSOSLabel(alert.sosType)}</Badge>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(Number(alert.timestamp) / 1000000).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {alert.location.latitude.toFixed(4)}, {alert.location.longitude.toFixed(4)}
                        </div>
                        {alert.extraData && (
                          <p className="text-sm mt-2">{alert.extraData}</p>
                        )}
                      </div>
                    </div>
                    {canResolve && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolveAlert.isPending}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
