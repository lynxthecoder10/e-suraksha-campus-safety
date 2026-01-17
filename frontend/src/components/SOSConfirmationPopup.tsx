import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, Hash, Phone, AlertCircle, X } from 'lucide-react';
import { SOSConfirmation } from '../backend';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SOSConfirmationPopupProps {
  confirmation: SOSConfirmation;
  onClose: () => void;
}

export default function SOSConfirmationPopup({ confirmation, onClose }: SOSConfirmationPopupProps) {
  const [open, setOpen] = useState(true);
  const [autoCloseTimer, setAutoCloseTimer] = useState(30);

  // Format timestamp
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000); // Convert nanoseconds to milliseconds
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format location
  const formatLocation = (lat: number, lon: number) => {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  };

  // Auto-close timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAutoCloseTimer((prev) => {
        if (prev <= 1) {
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto" 
        aria-describedby="sos-confirmation-description"
        role="alertdialog"
        aria-live="assertive"
        aria-labelledby="sos-confirmation-title"
      >
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 flex justify-center">
              <div className="rounded-full bg-success/10 p-3 animate-pulse-slow">
                <CheckCircle className="h-12 w-12 text-success" aria-hidden="true" />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleClose}
              aria-label="Close confirmation dialog"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle id="sos-confirmation-title" className="text-center text-2xl font-bold">
            Emergency Alert Sent!
          </DialogTitle>
          <DialogDescription id="sos-confirmation-description" className="text-center text-base">
            Campus security has been notified and is responding to your location.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6 space-y-4">
            {/* Alert ID */}
            <div className="flex items-start gap-3">
              <Hash className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Alert ID</p>
                <p className="text-base font-mono font-semibold break-all" aria-label={`Alert ID ${confirmation.alertId.toString()}`}>
                  {confirmation.alertId.toString()}
                </p>
              </div>
            </div>

            <Separator />

            {/* Timestamp */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Time Sent</p>
                <p className="text-base font-semibold" aria-label={`Time sent ${formatTimestamp(confirmation.timestamp)}`}>
                  {formatTimestamp(confirmation.timestamp)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Your Location</p>
                <p className="text-base font-semibold font-mono break-all" aria-label={`Location ${formatLocation(confirmation.location.latitude, confirmation.location.longitude)}`}>
                  {formatLocation(confirmation.location.latitude, confirmation.location.longitude)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Estimated Response Time */}
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">Estimated Response Time</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-base font-semibold" aria-label={`Estimated response time ${confirmation.estimatedResponseTime.toString()} minutes`}>
                    {confirmation.estimatedResponseTime.toString()} minutes
                  </p>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    Fast Response
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Message */}
        <div className="bg-muted/50 rounded-lg p-4 border border-muted">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground" role="status">
              {confirmation.confirmationMessage}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button 
            onClick={handleClose} 
            className="w-full" 
            size="lg"
            aria-label={`Acknowledge alert, auto-closing in ${autoCloseTimer} seconds`}
            autoFocus
          >
            Acknowledge ({autoCloseTimer}s)
          </Button>
          <p className="text-xs text-center text-muted-foreground" aria-live="polite">
            This popup will close automatically in {autoCloseTimer} seconds
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
