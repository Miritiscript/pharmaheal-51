
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasUserDismissedPrompt = localStorage.getItem('pwa-install-dismissed');
    if (hasUserDismissedPrompt) {
      setDismissed(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show install banner
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    });
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    setDismissed(true);
    // Save dismissal to localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showInstallBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 mx-auto w-11/12 max-w-md z-50">
      <div className="glass-card p-4 rounded-lg shadow-lg border border-primary/20 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-sm">Install PharmaHeal</h3>
          <p className="text-xs text-muted-foreground">
            Install our app for offline access and better performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissInstallBanner}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleInstallClick}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
