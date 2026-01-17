import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permissionType: 'location' | 'microphone' | 'motion';
}

export default function PermissionDialog({ open, onOpenChange, permissionType }: PermissionDialogProps) {
  const getContent = () => {
    switch (permissionType) {
      case 'location':
        return {
          title: 'Location Permission Required',
          description: 'E-Suraksha needs access to your location to send emergency alerts with your position. Please enable location permissions in your browser settings.',
          instructions: [
            'Click the lock icon in your browser address bar',
            'Find "Location" in the permissions list',
            'Change it to "Allow"',
            'Refresh the page',
          ],
        };
      case 'microphone':
        return {
          title: 'Microphone Permission Required',
          description: 'Voice activation requires microphone access to detect emergency phrases. Please enable microphone permissions in your browser settings.',
          instructions: [
            'Click the lock icon in your browser address bar',
            'Find "Microphone" in the permissions list',
            'Change it to "Allow"',
            'Refresh the page',
          ],
        };
      case 'motion':
        return {
          title: 'Motion Sensor Permission Required',
          description: 'Shake detection requires access to your device motion sensors. Please enable motion permissions.',
          instructions: [
            'On iOS: Go to Settings > Safari > Motion & Orientation Access',
            'On Android: Enable motion sensors in browser settings',
            'Refresh the page',
          ],
        };
    }
  };

  const content = getContent();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{content.description}</p>
            <div className="space-y-2">
              <p className="font-semibold">How to enable:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {content.instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            I Understand
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
