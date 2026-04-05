import { useState, useEffect } from "react";
import { X, Download, Share, PlusSquare } from "lucide-react";
import { usePlatform } from "@/hooks/usePlatform";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isIOS, isAndroid, isSafari, isStandalone } = usePlatform();

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem("cupgs-install-dismissed");
    if (alreadyDismissed || isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS && isSafari && !isStandalone) {
      const timer = setTimeout(() => setShowIOSBanner(true), 3000);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIOS, isSafari, isStandalone]);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowAndroidBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowAndroidBanner(false);
    setShowIOSBanner(false);
    setDismissed(true);
    sessionStorage.setItem("cupgs-install-dismissed", "1");
  };

  if (dismissed || isStandalone) return null;

  if (showAndroidBanner && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div
          className="mx-3 mb-3 rounded-2xl shadow-2xl border overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0d4773 0%, #1565a8 100%)", borderColor: "#1e5f9a" }}
        >
          <div className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <img src="/icons/icon-72.png" alt="CUPGS" className="w-10 h-10 rounded-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm leading-tight">Install CUPGS Feedback</div>
              <div className="text-blue-200 text-xs mt-0.5">Add to Home Screen for quick access</div>
            </div>
            <button onClick={handleDismiss} className="text-white/60 hover:text-white p-1 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/70 border border-white/20 hover:bg-white/10 transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={handleAndroidInstall}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-blue-900 flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
              style={{ background: "white" }}
            >
              <Download className="w-4 h-4" />
              Install App
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showIOSBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
        <div
          className="mx-3 mb-3 rounded-2xl shadow-2xl border overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0d4773 0%, #1565a8 100%)", borderColor: "#1e5f9a" }}
        >
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-3">
              <img src="/icons/icon-72.png" alt="CUPGS" className="w-10 h-10 rounded-xl" />
              <div>
                <div className="text-white font-semibold text-sm">Install on iPhone / iPad</div>
                <div className="text-blue-200 text-xs">Add to Home Screen</div>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-white/60 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="bg-white/10 rounded-xl p-3 space-y-2.5">
              <div className="flex items-center gap-3 text-white text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <span>1. Tap the <strong>Share</strong> button in Safari (bottom bar)</span>
              </div>
              <div className="flex items-center gap-3 text-white text-xs">
                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <span>2. Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-center gap-3 text-white text-xs">
                <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</div>
                <span>3. Tap <strong>Add</strong> — app is installed!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
