import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Wifi, Zap } from 'lucide-react';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    if (isStandalone) {
      setIsInstalled(true);
      console.log('[PWA Install Prompt] App already installed');
      return;
    }

    // Listen for install available event
    const handleInstallAvailable = () => {
      console.log('[PWA Install Prompt] Install available');
      
      // Check if prompt should be shown (not dismissed recently)
      const dismissedTime = localStorage.getItem('pwa-install-dismissed');
      if (dismissedTime) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          console.log('[PWA Install Prompt] Prompt dismissed recently, not showing');
          return;
        }
      }
      
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('[PWA Install Prompt] App installed');
      setIsInstalled(true);
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleAppInstalled);

    // Check immediately if install is available
    setTimeout(() => {
      if ((window as any).showInstallPrompt && !isStandalone) {
        handleInstallAvailable();
      }
    }, 2000);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const accepted = await (window as any).showInstallPrompt?.();
      if (accepted) {
        console.log('[PWA Install Prompt] User accepted installation');
        setShowPrompt(false);
        setIsInstalled(true);
        localStorage.removeItem('pwa-install-dismissed');
      } else {
        console.log('[PWA Install Prompt] User declined installation');
      }
    } catch (error) {
      console.error('[PWA Install Prompt] Failed to show install prompt:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    console.log('[PWA Install Prompt] User dismissed prompt');
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-5 duration-300">
      <Card className="shadow-lg border-primary bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Install E-Suraksha</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Get instant access to emergency features
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 -mr-1"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <Wifi className="h-3 w-3 text-primary" />
                </div>
                <span>Works offline for emergencies</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <span>Faster access from home screen</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="p-1 rounded bg-primary/10">
                  <Download className="h-3 w-3 text-primary" />
                </div>
                <span>Stay logged in automatically</span>
              </li>
            </ul>
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1"
                size="sm"
              >
                {isInstalling ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-2" />
                    Install App
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
                size="sm"
              >
                Not Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
