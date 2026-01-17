import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SafetyZone {
  id: string;
  name: string;
  type: 'safe' | 'restricted' | 'alert';
  coordinates: Array<{ lat: number; lng: number }>;
  description: string;
}

export default function SafetyZonesPanel() {
  const [zones, setZones] = useState<SafetyZone[]>([
    {
      id: '1',
      name: 'Main Campus',
      type: 'safe',
      coordinates: [],
      description: 'Primary campus area with 24/7 security',
    },
    {
      id: '2',
      name: 'Construction Zone',
      type: 'restricted',
      coordinates: [],
      description: 'Active construction - restricted access',
    },
    {
      id: '3',
      name: 'Parking Lot B',
      type: 'alert',
      coordinates: [],
      description: 'High incident area - increased monitoring',
    },
  ]);

  const getZoneColor = (type: SafetyZone['type']) => {
    switch (type) {
      case 'safe':
        return 'bg-green-500';
      case 'restricted':
        return 'bg-yellow-500';
      case 'alert':
        return 'bg-destructive';
    }
  };

  const getZoneBadgeVariant = (type: SafetyZone['type']) => {
    switch (type) {
      case 'safe':
        return 'default';
      case 'restricted':
        return 'secondary';
      case 'alert':
        return 'destructive';
    }
  };

  const handleDeleteZone = (zoneId: string) => {
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    toast.success('Safety zone deleted');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety Zones & Geofencing
              </CardTitle>
              <CardDescription>
                Define and manage campus safety zones and alert boundaries
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src="/assets/generated/safety-zones-interface.dim_600x400.png" 
              alt="Safety Zones Map"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 space-y-2">
              <div className="flex items-center gap-2 bg-background/90 px-3 py-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">Safe Zone</span>
              </div>
              <div className="flex items-center gap-2 bg-background/90 px-3 py-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs">Restricted</span>
              </div>
              <div className="flex items-center gap-2 bg-background/90 px-3 py-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-xs">Alert Zone</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Configured Zones</h3>
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-4 h-4 rounded-full ${getZoneColor(zone.type)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{zone.name}</p>
                      <Badge variant={getZoneBadgeVariant(zone.type)}>
                        {zone.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {zone.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteZone(zone.id)}
                  >
                    <Trash2 className="h-4 w-4" />
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
