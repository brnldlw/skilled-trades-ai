import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import WebView, { type WebViewNavigation } from "react-native-webview";

// The live app. `?src=pwa` marks this as an installed/native launch so the
// web app hides purchase/upgrade UI — see app/lib/nativeShell.ts in the
// main repo. All billing happens on the web; this shell never initiates a
// purchase.
const APP_URL = "https://app.myhvacrtool.com/?src=pwa";
const APP_HOST = "app.myhvacrtool.com";
const BRAND_NAVY = "#0f1f3d";
const BRAND_ORANGE = "#f97316";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [ready, setReady] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Android hardware back button navigates webview history instead of
  // immediately exiting the app.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack) {
        webviewRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNavStateChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
  }, []);

  // Keep the app on our own domain. Anything else (parts supplier sites,
  // Google Maps links, mailto:, tel:) opens in the system browser/app
  // instead of trapping the user inside this webview.
  const onShouldStartLoadWithRequest = useCallback((request: { url: string }) => {
    try {
      const url = new URL(request.url);
      if (url.hostname === APP_HOST || url.protocol === "about:") return true;
      Linking.openURL(request.url).catch(() => {});
      return false;
    } catch {
      // Non-http(s) schemes (mailto:, tel:, maps:) — hand off to the OS.
      Linking.openURL(request.url).catch(() => {});
      return false;
    }
  }, []);

  const onLoadEnd = useCallback(() => {
    setReady(true);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const onError = useCallback(() => {
    setLoadError(true);
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  const retry = useCallback(() => {
    setLoadError(false);
    setReady(false);
    setReloadKey(k => k + 1);
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      {loadError ? (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Can&rsquo;t connect</Text>
          <Text style={styles.errorBody}>
            Check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          key={reloadKey}
          ref={webviewRef}
          source={{ uri: APP_URL }}
          style={styles.webview}
          onNavigationStateChange={onNavStateChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onLoadEnd={onLoadEnd}
          onError={onError}
          onHttpError={onError}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          geolocationEnabled
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          startInLoadingState={false}
        />
      )}
      {!ready && !loadError && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={BRAND_ORANGE} />
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND_NAVY },
  webview: { flex: 1, backgroundColor: BRAND_NAVY },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_NAVY,
  },
  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: BRAND_NAVY,
  },
  errorTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  errorBody: { color: "#94a3b8", fontSize: 14, textAlign: "center", marginBottom: 24 },
  retryButton: { backgroundColor: BRAND_ORANGE, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  retryButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
