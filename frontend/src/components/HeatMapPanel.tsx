import { useGetHistoricalAlerts, useGetHistoricalReports } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, TrendingUp } from 'lucide-react';

export default function HeatMapPanel() {
  const { data: alerts, isLoading: alertsLoading } = useGetHistoricalAlerts();
  const { data: reports, isLoading: reportsLoading } = useGetHistoricalReports();

  const isLoading = alertsLoading || reportsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Loading heat map data...</p>
        </CardContent>
      </Card>
    );
  }

  const totalIncidents = (alerts?.length || 0) + (reports?.length || 0);

  // Aggregate location data
  const locationCounts = new Map<string, number>();
  
  alerts?.forEach((alert) => {
    const key = `${alert.location.latitude.toFixed(3)},${alert.location.longitude.toFixed(3)}`;
    locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
  });

  reports?.forEach((report) => {
    const key = `${report.location.latitude.toFixed(3)},${report.location.longitude.toFixed(3)}`;
    locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
  });

  const hotspots = Array.from(locationCounts.entries())
    .map(([location, count]) => {
      const [lat, lng] = location.split(',').map(Number);
      return { location: { latitude: lat, longitude: lng }, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Emergency Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">SOS activations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Incident Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">User submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            High-Activity Locations
          </CardTitle>
          <CardDescription>
            Areas with the most incident activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hotspots.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No incident data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hotspots.map((hotspot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">
                          {hotspot.location.latitude.toFixed(4)}, {hotspot.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">{hotspot.count} incidents</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
