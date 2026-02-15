import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Navigation, AlertTriangle, TrendingUp } from 'lucide-react';
import { useGetHistoricalAlerts } from '../hooks/useQueries';

export default function SafetyMapPanel() {
  const [selectedView, setSelectedView] = useState<'heatmap' | 'evacuation'>('heatmap');
  const { data: historicalAlerts } = useGetHistoricalAlerts();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Campus Safety Map
          </CardTitle>
          <CardDescription>
            View incident heat maps and evacuation routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="heatmap">
                <TrendingUp className="h-4 w-4 mr-2" />
                Heat Map
              </TabsTrigger>
              <TabsTrigger value="evacuation">
                <Navigation className="h-4 w-4 mr-2" />
                Evacuation Routes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap" className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src="/assets/generated/incident-heatmap-overlay.dim_500x400.svg"
                  alt="Incident Heat Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 space-y-2">
                  <Badge variant="destructive">High Risk</Badge>
                  <Badge variant="secondary">Medium Risk</Badge>
                  <Badge>Low Risk</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Incidents</p>
                  <p className="text-2xl font-bold">{historicalAlerts?.length || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">High Risk Zones</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="evacuation" className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src="/assets/generated/evacuation-routes-map.dim_800x600.svg"
                  alt="Evacuation Routes"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-green-600">Safe Route</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Navigation className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">Primary Route</p>
                    <p className="text-sm text-muted-foreground">Via Main Gate - 5 min walk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Alternative Route</p>
                    <p className="text-sm text-muted-foreground">Via East Exit - 7 min walk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 border rounded-lg opacity-50">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <div className="flex-1">
                    <p className="font-medium">West Route - Blocked</p>
                    <p className="text-sm text-muted-foreground">Active incident in area</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
