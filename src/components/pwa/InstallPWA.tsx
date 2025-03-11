
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
    <div className="fixed top-16 left-0 right-0 mx-auto z-50 flex justify-center p-2">
      <div className="glass-card p-2 rounded-lg shadow-lg flex items-center justify-between max-w-xs">
        <p className="text-xs mr-2 text-foreground">
          Install PharmaHeal for quick access! 
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissInstallBanner}
            className="h-7 w-7 p-0"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleInstallClick}
            className="flex items-center gap-1 h-7 text-xs"
          >
            <Download className="h-3 w-3" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
