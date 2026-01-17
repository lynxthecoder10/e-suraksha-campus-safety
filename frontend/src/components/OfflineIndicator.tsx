import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { offlineQueueService } from '@/services/offlineQueueService';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const updateQueueSize = () => {
      setQueueSize(offlineQueueService.getQueueSize());
    };

    // Initial queue size
    updateQueueSize();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for queue changes
    const queueInterval = setInterval(updateQueueSize, 1000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(queueInterval);
    };
  }, []);

  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-40">
      {!isOnline ? (
        <Badge variant="destructive" className="flex items-center gap-2 px-3 py-2">
          <WifiOff className="h-4 w-4" />
          <span>Offline Mode</span>
        </Badge>
      ) : queueSize > 0 ? (
        <Badge variant="outline" className="flex items-center gap-2 px-3 py-2 bg-warning/10 border-warning text-warning-foreground">
          <Wifi className="h-4 w-4" />
          <span>Syncing {queueSize} alert{queueSize > 1 ? 's' : ''}...</span>
        </Badge>
      ) : null}
    </div>
  );
}
