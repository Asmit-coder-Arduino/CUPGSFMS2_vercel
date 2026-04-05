import { useMemo } from "react";

export type Platform = "ios" | "android" | "windows" | "mac" | "linux" | "web";

export interface PlatformInfo {
  platform: Platform;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isStandalone: boolean;
  canInstallPWA: boolean;
}

export function usePlatform(): PlatformInfo {
  return useMemo(() => {
    const ua = navigator.userAgent;
    const platform = (navigator.platform || "").toLowerCase();

    const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.maxTouchPoints > 1 && /mac/i.test(ua));
    const isAndroid = /android/i.test(ua);
    const isWindows = /win/i.test(platform) || /windows/i.test(ua);
    const isMac = !isIOS && /mac/i.test(platform);
    const isLinux = !isAndroid && /linux/i.test(platform);
    const isMobile = isIOS || isAndroid || /mobile|tablet/i.test(ua);
    const isDesktop = !isMobile;
    const isSafari = /safari/i.test(ua) && !/chrome/i.test(ua);
    const isChrome = /chrome/i.test(ua) && !/edge/i.test(ua);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    let detectedPlatform: Platform = "web";
    if (isIOS) detectedPlatform = "ios";
    else if (isAndroid) detectedPlatform = "android";
    else if (isWindows) detectedPlatform = "windows";
    else if (isMac) detectedPlatform = "mac";
    else if (isLinux) detectedPlatform = "linux";

    return {
      platform: detectedPlatform,
      isIOS,
      isAndroid,
      isMobile,
      isDesktop,
      isWindows,
      isMac,
      isLinux,
      isSafari,
      isChrome,
      isStandalone,
      canInstallPWA: isChrome || isAndroid,
    };
  }, []);
}
