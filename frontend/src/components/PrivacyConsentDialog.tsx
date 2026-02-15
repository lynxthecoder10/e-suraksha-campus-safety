import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Eye, MapPin, Clock } from 'lucide-react';

interface PrivacyConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: (consents: ConsentOptions) => void;
  feature: 'location-sharing' | 'sos-alert' | 'messaging';
}

export interface ConsentOptions {
  locationSharing: boolean;
  dataStorage: boolean;
  emergencyContacts: boolean;
}

export default function PrivacyConsentDialog({
  open,
  onOpenChange,
  onConsent,
  feature,
}: PrivacyConsentDialogProps) {
  const [consents, setConsents] = useState<ConsentOptions>({
    locationSharing: false,
    dataStorage: false,
    emergencyContacts: false,
  });

  const handleConsent = () => {
    onConsent(consents);
    onOpenChange(false);
  };

  const getFeatureInfo = () => {
    switch (feature) {
      case 'location-sharing':
        return {
          title: 'Location Sharing Consent',
          description: 'We need your permission to share your location during emergencies',
          icon: MapPin,
        };
      case 'sos-alert':
        return {
          title: 'Emergency Alert Consent',
          description: 'Understand how your data is used during SOS alerts',
          icon: Shield,
        };
      case 'messaging':
        return {
          title: 'Secure Messaging Consent',
          description: 'Communication with security personnel',
          icon: Eye,
        };
    }
  };

  const info = getFeatureInfo();
  const Icon = info.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {info.title}
          </DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            <div className="relative p-4 bg-muted rounded-lg">
              <img
                src="/assets/generated/privacy-consent-dialog.dim_500x400.svg"
                alt="Privacy Illustration"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Time-Limited Access</p>
                    <p className="text-sm text-muted-foreground">
                      Location sharing only during active emergencies
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Encrypted Storage</p>
                    <p className="text-sm text-muted-foreground">
                      All data is encrypted and securely stored
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">No Continuous Tracking</p>
                    <p className="text-sm text-muted-foreground">
                      We never track your location outside of emergencies
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="location"
                  checked={consents.locationSharing}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({ ...prev, locationSharing: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="location" className="cursor-pointer">
                    I consent to location sharing during emergencies
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your location will only be shared when you trigger an SOS alert
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="storage"
                  checked={consents.dataStorage}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({ ...prev, dataStorage: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="storage" className="cursor-pointer">
                    I consent to secure data storage
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Emergency data is stored securely for response coordination
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="contacts"
                  checked={consents.emergencyContacts}
                  onCheckedChange={(checked) =>
                    setConsents((prev) => ({ ...prev, emergencyContacts: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="contacts" className="cursor-pointer">
                    I consent to notifying my emergency contacts
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your emergency contacts will be notified during SOS alerts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConsent}
            disabled={!consents.locationSharing || !consents.dataStorage}
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
