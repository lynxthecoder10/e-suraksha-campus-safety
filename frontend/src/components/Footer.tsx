import { useGetLiveDeploymentInfo } from '../hooks/useQueries';
import { ExternalLink, Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Footer() {
  const { data: deploymentInfo } = useGetLiveDeploymentInfo();
  const [showPWAGuide, setShowPWAGuide] = useState(false);

  const handleOpenUrl = () => {
    if (!deploymentInfo?.url) return;
    window.open(deploymentInfo.url, '_blank', 'noopener,noreferrer');
  };

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (window.navigator as any).standalone 
    || document.referrer.includes('android-app://');

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 E-Suraksha Campus Safety. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isStandalone && (
              <Dialog open={showPWAGuide} onOpenChange={setShowPWAGuide}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span className="text-xs">Install as App</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5 text-primary" />
                      Install E-Suraksha as a PWA
                    </DialogTitle>
                    <DialogDescription>
                      Get the best experience with offline emergency features and faster access
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6 mt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Why Install?</h3>
                      <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                        <li>Works offline for emergency SOS alerts</li>
                        <li>Faster access from your home screen</li>
                        <li>Stay logged in automatically</li>
                        <li>Native app-like experience</li>
                        <li>Receive emergency notifications</li>
                      </ul>
                    </div>

                    {isAndroid && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Installation Steps (Android)</h3>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-primary">Chrome Browser:</h4>
                          <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                            <li>Tap the menu icon (⋮) in the top right corner</li>
                            <li>Select "Install app" or "Add to Home screen"</li>
                            <li>Tap "Install" in the confirmation dialog</li>
                            <li>The app will be added to your home screen</li>
                            <li>Launch E-Suraksha from your home screen</li>
                          </ol>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-primary">Edge Browser:</h4>
                          <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                            <li>Tap the menu icon (⋯) at the bottom</li>
                            <li>Select "Add to phone"</li>
                            <li>Tap "Add" in the confirmation dialog</li>
                            <li>The app will be added to your home screen</li>
                          </ol>
                        </div>
                      </div>
                    )}

                    {!isAndroid && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm">Installation Steps</h3>
                        <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
                          <li>Look for the install prompt at the bottom of the screen</li>
                          <li>Click "Install App" when prompted</li>
                          <li>Or use your browser's menu to "Install" or "Add to Home screen"</li>
                          <li>Launch E-Suraksha from your installed apps</li>
                        </ol>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Verification</h3>
                      <p className="text-sm text-muted-foreground">
                        After installation, the app will open in standalone mode without browser UI. 
                        You'll see the E-Suraksha icon on your home screen and can launch it like any native app.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm">Troubleshooting</h3>
                      <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                        <li>Make sure you're using Chrome or Edge browser</li>
                        <li>Check that you have a stable internet connection</li>
                        <li>Try refreshing the page if install option doesn't appear</li>
                        <li>Clear browser cache if you encounter issues</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {deploymentInfo?.url && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenUrl}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">Live on IC Network</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
