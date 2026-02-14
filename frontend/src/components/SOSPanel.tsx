import { useState, useEffect } from 'react';
import { useTriggerAlert } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { SOSType, SOSConfirmation } from 'declarations/backend';
import { Shield, MapPin, Loader2, CheckCircle, Wifi, WifiOff, Clock, MapPinned, Hash } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { locationService } from '../services/locationService';
import { offlineQueueService } from '../services/offlineQueueService';
import SOSConfirmationPopup from './SOSConfirmationPopup';

export default function SOSPanel() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedEvents, setQueuedEvents] = useState(0);
  const [sosConfirmation, setSOSConfirmation] = useState<SOSConfirmation | null>(null);

  const triggerAlert = useTriggerAlert();

  // Initialize location
  useEffect(() => {
    const initLocation = async () => {
      try {
        const loc = await locationService.getCurrentLocation();
        setLocation({ latitude: loc.latitude, longitude: loc.longitude });
        setLocationError(null);
        setDetectingLocation(false);
      } catch (error: any) {
        setLocationError(error.message);
        setDetectingLocation(false);

        // Try to use last known location as fallback
        const lastKnown = locationService.getLastKnownLocation();
        if (lastKnown) {
          setLocation({ latitude: lastKnown.latitude, longitude: lastKnown.longitude });
          toast.warning('Using last known location', {
            description: 'Current location unavailable'
          });
        }
      }
    };

    initLocation();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', { description: 'Attempting to sync queued events...' });
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Connection lost', { description: 'SOS events will be queued for later' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial queue
    setQueuedEvents(offlineQueueService.getQueueSize());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSOSTrigger = async () => {
    // Get current or last known location
    let currentLocation = location;
    if (!currentLocation) {
      const lastKnown = locationService.getLastKnownLocation();
      if (lastKnown) {
        currentLocation = { latitude: lastKnown.latitude, longitude: lastKnown.longitude };
        toast.warning('Using last known location');
      } else {
        toast.error('Location unavailable', {
          description: 'Please enable location services and try again.',
          duration: 5000
        });
        return;
      }
    }

    try {
      // Check if online
      if (!isOnline) {
        // Queue for later
        const eventId = offlineQueueService.addToQueue(SOSType.other, currentLocation, null);
        setQueuedEvents(offlineQueueService.getQueueSize());
        toast.warning('Offline - Event queued', {
          description: 'Alert will be sent when connection is restored',
          duration: 5000
        });
        return;
      }

      // Send alert immediately
      const confirmation = await triggerAlert.mutateAsync({
        sosType: SOSType.other,
        location: currentLocation,
        extraData: null,
      });

      // Show confirmation popup
      setSOSConfirmation(confirmation);

      // Also show toast for immediate feedback
      toast.success('Emergency alert sent!', {
        description: `Alert ID: ${confirmation.alertId.toString()}. Campus security has been notified.`,
        duration: 5000,
        icon: <CheckCircle className="h-5 w-5 text-success" />,
      });

    } catch (error: any) {
      console.error('Failed to send emergency alert:', error);

      // Queue if network error
      if (error.message?.includes('network') || error.message?.includes('connection')) {
        const eventId = offlineQueueService.addToQueue(SOSType.other, currentLocation, null);
        setQueuedEvents(offlineQueueService.getQueueSize());
        toast.warning('Network error - Event queued', {
          description: 'Alert will be sent when connection is restored',
          duration: 5000
        });
      } else {
        let errorMessage = 'Failed to send emergency alert. Please try again.';

        if (error.message?.includes('Unauthorized')) {
          errorMessage = 'You are not authorized to send alerts. Please log in again.';
        } else if (error.message?.includes('inactive')) {
          errorMessage = 'Your account is inactive. Please contact support.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error('Emergency Alert Failed', {
          description: errorMessage,
          duration: 7000,
        });
      }
    }
  };

  const processOfflineQueue = async () => {
    const queue = offlineQueueService.getQueue();

    for (const event of queue) {
      try {
        await triggerAlert.mutateAsync({
          sosType: event.sosType,
          location: event.location,
          extraData: event.extraData,
        });

        offlineQueueService.removeFromQueue(event.id);
        toast.success('Queued alert sent', {
          description: `Alert from ${new Date(event.timestamp).toLocaleString()}`
        });
      } catch (error) {
        const canRetry = offlineQueueService.incrementRetry(event.id);
        if (!canRetry) {
          toast.error('Failed to send queued alert', {
            description: 'Max retries exceeded'
          });
        }
      }
    }

    setQueuedEvents(offlineQueueService.getQueueSize());
  };

  return (
    <div className="space-y-4">
      {/* Network Status */}
      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Offline - Alerts will be queued
            {queuedEvents > 0 && ` (${queuedEvents} queued)`}
          </AlertDescription>
        </Alert>
      )}

      {isOnline && queuedEvents > 0 && (
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Online - {queuedEvents} queued alert{queuedEvents > 1 ? 's' : ''} pending sync
          </AlertDescription>
        </Alert>
      )}

      {/* Location Status */}
      {detectingLocation && (
        <Alert>
          <MapPin className="h-4 w-4 animate-pulse" />
          <AlertDescription>Detecting your location...</AlertDescription>
        </Alert>
      )}

      {locationError && !location && (
        <Alert variant="destructive">
          <MapPin className="h-4 w-4" />
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}

      {location && !detectingLocation && (
        <Alert>
          <MapPin className="h-4 w-4 text-success" />
          <AlertDescription>
            Location ready: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </AlertDescription>
        </Alert>
      )}

      {/* Emergency SOS Button */}
      <div className="flex flex-col items-center gap-4 text-center py-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-destructive" />
          <h3 className="text-2xl font-bold text-foreground">Emergency SOS</h3>
        </div>
        <p className="text-muted-foreground max-w-md">
          Press the button below to instantly alert campus security and share your location.
        </p>
        <Button
          onClick={handleSOSTrigger}
          disabled={triggerAlert.isPending || (!location && !locationService.getLastKnownLocation())}
          size="lg"
          className="h-32 w-32 rounded-full p-0 shadow-2xl hover:scale-105 transition-all duration-300 bg-destructive hover:bg-destructive/90 animate-pulse-slow disabled:opacity-50 disabled:cursor-not-allowed"
          variant="destructive"
          aria-label="Emergency SOS Button"
        >
          {triggerAlert.isPending ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-12 w-12 animate-spin" />
              <span className="text-xs font-bold">Sending...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <img
                src="/assets/generated/sos-button.dim_128x128.png"
                alt="Emergency SOS"
                className="h-16 w-16 object-contain"
              />
              <span className="text-sm font-bold">SOS</span>
            </div>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Available 24/7 • Instant response • Location tracking
        </p>
        {(!location && !locationService.getLastKnownLocation()) && (
          <p className="text-xs text-destructive font-medium">
            Location required - Please enable location services
          </p>
        )}
      </div>

      {/* SOS Confirmation Popup */}
      {sosConfirmation && (
        <SOSConfirmationPopup
          confirmation={sosConfirmation}
          onClose={() => setSOSConfirmation(null)}
        />
      )}
    </div>
  );
}
