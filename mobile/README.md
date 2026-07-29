# My HVAC/R Tool — Mobile Wrapper

This is a thin native shell (Expo + `react-native-webview`) that loads the
live web app at `app.myhvacrtool.com` inside a full-screen WebView. It exists
so the app can be submitted to the Apple App Store and Google Play — it does
not contain any of the app's actual UI or logic, which all lives in the main
Next.js project one level up (`../app`).

All billing stays on the web. This shell loads the site with `?src=pwa` in
the URL, which the web app detects (`app/lib/nativeShell.ts`) to hide every
purchase/upgrade button — see the "Web-only billing" decision from the app
store audit. Never add a Stripe checkout flow or App Store/Play Store
purchase flow to this shell without revisiting that decision first.

## What's here

- `App.tsx` — the WebView shell: loads the app, hides the splash screen once
  loaded, routes external links (parts suppliers, Google Maps, mailto:) out
  to the system browser instead of trapping them in the webview, and lets
  Android's hardware back button navigate webview history.
- `app.json` — app name, bundle ID (`com.myhvacrtool.app` for both
  platforms), icons, splash screen, and the camera/microphone/location
  permission strings iOS and Android require.
- `eas.json` — EAS Build profiles (`development`, `preview`, `production`).
- `assets/` — app icon, Android adaptive icon, and splash image, generated
  from the same wrench mark used for the PWA icons in `../public`.

## One-time setup

```
cd mobile
npm install
npx eas login          # sign in to your existing Expo account
npx eas init            # links this project to an EAS project — creates one if needed
```

`eas init` will ask to set `extra.eas.projectId` in `app.json` — let it do
that automatically.

Since you're reusing your existing Apple Developer account and EAS org from
your other app, `eas build` will prompt to either reuse existing
credentials/certificates or generate new ones scoped to this app's bundle ID
(`com.myhvacrtool.app`) — EAS manages iOS signing for you, so you shouldn't
need to touch Xcode directly.

## Building

```
# Android — produces an installable .apk for testing on a device
npx eas build --platform android --profile preview

# iOS — builds in Expo's cloud, no Mac required
npx eas build --platform ios --profile production

# Android — production build for Play Console (.aab)
npx eas build --platform android --profile production
```

## Submitting

Once a production build finishes:

```
npx eas submit --platform ios
npx eas submit --platform android
```

Each will ask for App Store Connect / Play Console details the first time
(App Store Connect API key, or a Play Console service account JSON) and
remember them for next time.

## Local development

```
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an Android
emulator / iOS simulator (simulator requires macOS). Since the shell just
loads the live production URL, there's nothing to "develop" here day to
day — you're testing the shell itself (splash screen, link routing, back
button), not the app's features, which you'd test the normal way in a
regular browser against `app.myhvacrtool.com` or `localhost:3000`.

## Before your first submission

- [ ] Confirm the "Manage your plan at myhvacrtool.com" message (not a live
      purchase button) shows correctly when testing a locked/paywalled
      feature in a build — this is what keeps the app out of Apple's
      in-app-purchase requirement.
- [ ] Test camera capture (nameplate/gauge/component photos) on a real
      device for both platforms — WebView file-input camera support is the
      one area worth hands-on testing before submitting.
- [ ] Voice dictation relies on the Web Speech API, which iOS's WKWebView
      does not support. It will simply not offer voice input on iOS (the
      web app already feature-detects this and won't error) — this is an
      expected platform limitation, not a bug to chase.
- [ ] You'll need App Store screenshots and a Play Store listing (icon is
      already handled) — those are store-listing assets, not part of this
      shell.
- [ ] Update `public/manifest.json`'s `screenshots` array in the main repo
      too if you want a richer install prompt on Android/desktop PWA
      installs (currently empty).
