import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Radio, Watch, Lock, MapPin, Battery, Wifi } from 'lucide-react';
import { iotService, PanicPole, Wearable, SmartLock } from '../services/iotService';

export default function IoTDevicesPanel() {
  const [panicPoles, setPanicPoles] = useState<PanicPole[]>([]);
  const [smartLocks, setSmartLocks] = useState<SmartLock[]>([]);

  useEffect(() => {
    setPanicPoles(iotService.getPanicPoles());
    setSmartLocks(iotService.getSmartLocks());
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'triggered':
        return 'destructive';
      case 'offline':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          IoT Smart Campus Devices
        </CardTitle>
        <CardDescription>
          Monitor and manage connected campus safety devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-6">
          <img
            src="/assets/generated/iot-campus-devices.dim_800x300.svg"
            alt="IoT Campus Devices"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <Tabs defaultValue="poles">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="poles">
              <MapPin className="h-4 w-4 mr-2" />
              Panic Poles
            </TabsTrigger>
            <TabsTrigger value="wearables">
              <Watch className="h-4 w-4 mr-2" />
              Wearables
            </TabsTrigger>
            <TabsTrigger value="locks">
              <Lock className="h-4 w-4 mr-2" />
              Smart Locks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="poles" className="space-y-3 mt-4">
            {panicPoles.map((pole) => (
              <div key={pole.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Panic Pole {pole.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {pole.location.latitude.toFixed(4)}, {pole.location.longitude.toFixed(4)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last maintenance: {pole.lastMaintenance.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(pole.status)}>{pole.status}</Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="wearables" className="space-y-3 mt-4">
            <div className="text-center py-8 text-muted-foreground">
              <Watch className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No wearables connected</p>
              <Button variant="outline" className="mt-4">
                <Wifi className="h-4 w-4 mr-2" />
                Connect Device
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="locks" className="space-y-3 mt-4">
            {smartLocks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No smart locks configured</p>
              </div>
            ) : (
              smartLocks.map((lock) => (
                <div key={lock.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{lock.location}</p>
                      <p className="text-sm text-muted-foreground">
                        Last access: {lock.accessLog[lock.accessLog.length - 1]?.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(lock.status)}>{lock.status}</Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
