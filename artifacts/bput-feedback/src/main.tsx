import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function detectAndApplyPlatform() {
  const ua = navigator.userAgent;
  const pl = (navigator.platform || "").toLowerCase();
  const html = document.documentElement;

  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.maxTouchPoints > 1 && /mac/i.test(ua));
  const isAndroid = /android/i.test(ua);
  const isWindows = /win/i.test(pl) || /windows/i.test(ua);
  const isMac = !isIOS && /mac/i.test(pl);
  const isLinux = !isAndroid && /linux/i.test(pl);
  const isMobile = isIOS || isAndroid;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true;

  html.classList.remove("os-ios", "os-android", "os-windows", "os-mac", "os-linux");
  if (isIOS) html.classList.add("os-ios");
  else if (isAndroid) html.classList.add("os-android");
  else if (isWindows) html.classList.add("os-windows");
  else if (isMac) html.classList.add("os-mac");
  else if (isLinux) html.classList.add("os-linux");

  if (isMobile) html.classList.add("is-mobile");
  else html.classList.add("is-desktop");

  if (isStandalone) html.classList.add("is-standalone");
}

detectAndApplyPlatform();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("SW registration failed:", err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
