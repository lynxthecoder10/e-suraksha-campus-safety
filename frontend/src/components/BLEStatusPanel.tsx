import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, Radio } from 'lucide-react';
import { bleService, BLEMessage } from '../services/bleService';
import { toast } from 'sonner';

export default function BLEStatusPanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [queuedMessages, setQueuedMessages] = useState<BLEMessage[]>([]);
  const [isSupported] = useState(bleService.checkIsSupported());

  useEffect(() => {
    const interval = setInterval(() => {
      setQueuedMessages(bleService.getQueuedMessages());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartScanning = async () => {
    const success = await bleService.startScanning();
    if (success) {
      setIsScanning(true);
      toast.success('BLE scanning started');
    } else {
      toast.error('Failed to start BLE scanning');
    }
  };

  const handleStopScanning = () => {
    bleService.stopScanning();
    setIsScanning(false);
    toast.info('BLE scanning stopped');
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            BLE Multi-Hop Fallback
          </CardTitle>
          <CardDescription>
            Bluetooth Low Energy not supported on this device
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            BLE Multi-Hop Fallback
          </div>
          <Badge variant={isScanning ? 'default' : 'secondary'}>
            {isScanning ? 'Scanning' : 'Idle'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Offline SOS relay through Bluetooth mesh network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <img
            src="/assets/generated/ble-mesh-network.dim_600x400.svg"
            alt="BLE Mesh Network"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={handleStartScanning} className="flex-1">
              <Radio className="h-4 w-4 mr-2" />
              Start BLE Scanning
            </Button>
          ) : (
            <Button onClick={handleStopScanning} variant="outline" className="flex-1">
              Stop Scanning
            </Button>
          )}
        </div>

        {queuedMessages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Queued Messages ({queuedMessages.length})</p>
            <div className="space-y-2">
              {queuedMessages.slice(0, 3).map((msg) => (
                <div key={msg.id} className="p-3 bg-muted rounded-lg text-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{msg.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Hops: {msg.hops}/{5}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <p className="text-sm font-medium">How it works:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• SOS alerts relay through nearby devices</li>
            <li>• Works without internet connection</li>
            <li>• Automatic sync when online</li>
            <li>• Up to 5 hops for extended range</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
