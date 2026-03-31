import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DownloadSimple, X } from "@phosphor-icons/react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('velocity-pwa-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
    };
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('velocity-pwa-dismissed', Date.now().toString());
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div
      data-testid="install-prompt"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border border-border rounded-2xl p-4 shadow-lg z-40 animate-fade-up"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <DownloadSimple weight="duotone" className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">Install Velocity-One</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add to your home screen for quick access and offline support.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              data-testid="install-app-button"
              size="sm"
              onClick={handleInstall}
              className="rounded-xl text-xs h-8"
            >
              Install
            </Button>
            <Button
              data-testid="dismiss-install"
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="rounded-xl text-xs h-8 text-muted-foreground"
            >
              Not now
            </Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground">
          <X weight="bold" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
