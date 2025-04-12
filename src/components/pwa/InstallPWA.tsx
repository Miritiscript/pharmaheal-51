
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

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

      // Show install modal for first-time visitors
      const isFirstVisit = !localStorage.getItem('pwa-visited');
      if (isFirstVisit) {
        setShowInstallModal(true);
        localStorage.setItem('pwa-visited', 'true');
      } else {
        // Show the smaller banner for returning visitors
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      // Hide the installation UI
      setShowInstallBanner(false);
      setShowInstallModal(false);
      
      // Log installation or show a toast
      toast({
        title: "Installation successful!",
        description: "PharmaHeal has been installed on your device.",
      });
      
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [toast]);

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
      setShowInstallModal(false);
    });
  };

  const dismissInstallPrompt = () => {
    setShowInstallBanner(false);
    setShowInstallModal(false);
    setDismissed(true);
    // Save dismissal to localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <>
      {/* Smaller install banner for returning visitors */}
      {showInstallBanner && !dismissed && !showInstallModal && (
        <div className="fixed top-16 left-0 right-0 mx-auto z-50 flex justify-center p-2">
          <div className="glass-card p-2 rounded-lg shadow-lg flex items-center justify-between max-w-xs">
            <p className="text-xs mr-2 text-foreground">
              Install PharmaHeal for quick access! 
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissInstallPrompt}
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
      )}

      {/* Modal for first-time visitors */}
      <Dialog open={showInstallModal} onOpenChange={setShowInstallModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Install PharmaHeal</DialogTitle>
            <DialogDescription>
              Install PharmaHeal for faster access and offline features. Add it to your home screen for a better experience.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={dismissInstallPrompt}>
              Maybe Later
            </Button>
            <Button variant="default" onClick={handleInstallClick} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Install
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallPWA;
