"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [swReady, setSwReady] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwReady(true);
          console.log("SW registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("SW registration failed:", err);
        });
    }

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Online/offline detection
    const handleOffline = () => setShowOfflineBanner(true);
    const handleOnline = () => setShowOfflineBanner(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Set initial state
    if (!navigator.onLine) setShowOfflineBanner(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  }

  return (
    <>
      {/* Offline banner */}
      {showOfflineBanner && (
        <div style={{
          position: "fixed",
          top: 52,
          left: 0,
          right: 0,
          background: "#92400e",
          color: "#fff",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          zIndex: 800,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "system-ui, sans-serif",
        }}>
          <span>📡 You're offline — cached tools still work</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Install banner */}
      {showInstallBanner && (
        <div style={{
          position: "fixed",
          bottom: 20,
          left: 16,
          right: 16,
          background: "#0f1f3d",
          color: "#fff",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 800,
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          fontFamily: "system-ui, sans-serif",
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🔧</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Install HVAC/R Pro</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Add to home screen for quick access and offline tools
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleInstall}
              style={{
                padding: "8px 14px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallBanner(false)}
              style={{
                padding: "8px 10px",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}