# Beeyield — iOS & Android build workflow (Capacitor)

The web app is server-rendered (TanStack Start) and its BeeGPT endpoint runs on
the server, so the native shell loads the deployed site rather than a static
bundle. Native plugins (status bar, splash, keyboard, hardware back button) run
inside the shell; the browser build is untouched.

## 1. One-time setup (on your own Mac / dev machine)

```bash
git clone <your repo> && cd <repo>
npm install
npx cap add ios       # macOS + Xcode required
npx cap add android   # Android Studio required
```

The generated `ios/` and `android/` folders are native projects — commit them.

## 2. Point the shell at a server

`capacitor.config.ts` reads `CAP_SERVER_URL`:

```bash
# development against the Lovable preview
CAP_SERVER_URL="https://id-preview--73e9cb93-0251-4d03-ac8a-f323b4bb684c.lovable.app" npx cap sync

# store builds — use your published/custom domain
CAP_SERVER_URL="https://beeyield.app" npx cap sync
```

Run `npx cap sync` after every config or plugin change.

## 3. Android — signed APK / AAB

1. Create a keystore once:
   ```bash
   keytool -genkey -v -keystore beeyield.keystore -alias beeyield \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Put credentials in `android/keystore.properties` (git-ignore it):
   ```
   storeFile=../beeyield.keystore
   storePassword=***
   keyAlias=beeyield
   keyPassword=***
   ```
3. In `android/app/build.gradle`, add above `android { ... buildTypes }`:
   ```gradle
   def keystoreProps = new Properties()
   def keystoreFile = rootProject.file("keystore.properties")
   if (keystoreFile.exists()) { keystoreProps.load(new FileInputStream(keystoreFile)) }

   signingConfigs {
     release {
       storeFile file(keystoreProps['storeFile'])
       storePassword keystoreProps['storePassword']
       keyAlias keystoreProps['keyAlias']
       keyPassword keystoreProps['keyPassword']
     }
   }
   ```
   and set `signingConfig signingConfigs.release` inside `buildTypes.release`.
4. Build:
   ```bash
   npx cap sync android
   cd android
   ./gradlew assembleRelease   # → app/build/outputs/apk/release/app-release.apk
   ./gradlew bundleRelease     # → app/build/outputs/bundle/release/app-release.aab (Play Store)
   ```

## 4. iOS — TestFlight

1. `npx cap sync ios && npx cap open ios`
2. In Xcode: select the `App` target → **Signing & Capabilities** → pick your
   Apple Developer team; bundle id must be `app.beeyield.mobile` (or change it
   in `capacitor.config.ts` and Xcode together).
3. Bump `CFBundleShortVersionString` / build number under **General**.
4. **Product → Destination → Any iOS Device (arm64)**, then **Product → Archive**.
5. In the Organizer: **Distribute App → App Store Connect → Upload**.
6. The build appears in App Store Connect → TestFlight after processing.

Required for App Store review: camera/mic/location usage strings in
`ios/App/App/Info.plist` if you enable those features:
`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`,
`NSLocationWhenInUseUsageDescription`.

## 5. Handy scripts

```bash
npm run mobile:sync      # sync web config + plugins into both platforms
npm run mobile:ios       # sync + open Xcode
npm run mobile:android   # sync + open Android Studio
```

## Notes

- App icons/splash: drop a 1024×1024 `icon.png` and `splash.png` into
  `resources/` and run `npx @capacitor/assets generate`.
- Keep `CAP_SERVER_URL` on HTTPS — Android blocks cleartext by default.
- OAuth sign-in redirects use `window.location.origin`, which resolves to the
  configured server URL inside the shell, so Google login works unchanged.
