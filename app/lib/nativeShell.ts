"use client";

import { useEffect, useState } from "react";

// Detects whether the app is running inside an app-store-distributed native
// shell (Capacitor, a Trusted Web Activity, or an installed PWA reached via
// the manifest's start_url) rather than a normal browser tab.
//
// Apple/Google in-app purchase rules only apply to the app-store-distributed
// experience — a regular website visit is never subject to them. We use this
// to hide purchase/upgrade UI in the wrapped app so all billing happens on
// the web, avoiding the App Store's in-app purchase requirement entirely.
//
// Signals, in order of reliability:
//   1. `?src=pwa` on the URL — set by public/manifest.json's start_url, so
//      any launch via "Add to Home Screen" or a Trusted Web Activity carries
//      it on first load.
//   2. `window.Capacitor?.isNativePlatform()` — set automatically if/when
//      this app is wrapped with Capacitor.
//   3. `display-mode: standalone` / `navigator.standalone` — true whenever
//      the app is running installed (no browser chrome), which covers TWA
//      and installed-PWA launches even on routes that don't carry the
//      `src=pwa` param (e.g. deep links).
// Once detected, the result is persisted to localStorage so it stays true
// for the rest of the session even after navigating to a URL without the
// marker param.

const STORAGE_KEY = "mhvacr_native_shell";

function detectNativeShell(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {}

  let detected = false;

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("src") === "pwa") detected = true;
  } catch {}

  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.()) detected = true;
  if (w.navigator?.standalone) detected = true; // iOS Safari / wrapped WebView
  try {
    if (window.matchMedia?.("(display-mode: standalone)")?.matches) detected = true;
  } catch {}

  if (detected) {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  }

  return detected;
}

let cached: boolean | null = null;

/** Non-reactive check — safe to call outside React (e.g. in event handlers). */
export function isNativeShell(): boolean {
  if (cached === null) cached = detectNativeShell();
  return cached;
}

/**
 * React hook version. Starts as `false` (matches server render) and flips
 * to the real value after mount, to avoid SSR hydration mismatches — this
 * means purchase UI can flash briefly before hiding on a native-shell
 * launch, which is expected for client-only detection like this.
 */
export function useNativeShell(): boolean {
  const [native, setNative] = useState(false);
  useEffect(() => { setNative(isNativeShell()); }, []);
  return native;
}
