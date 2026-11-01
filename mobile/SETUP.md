# BingMath Mobile: configuration and packaging

## Supported project configuration

- Node.js 22 LTS (at least 22.11.0); `.nvmrc` selects the CI major version.
- React Native 0.86.0, React 19.2.3, npm lockfile committed. Use `npm ci` on a clean checkout.
- JDK 17 for CI; set `JAVA_HOME` to a JDK installation.
- Android SDK Platform 36, Build Tools 36.0.0, NDK 27.1.12297006.
- Gradle 9.3.1 via the checked-in wrapper; minimum Android API 24.
- New Architecture and Hermes enabled.
- App display/registration name: `BingMath`; Android and iOS identifier: `com.bingmathmobile`.
- Version name is read from `package.json` on Android. Keep iOS `MARKETING_VERSION` aligned.
  Increment Android `BINGMATH_VERSION_CODE` and iOS `CURRENT_PROJECT_VERSION` for distribution.

Install SDK packages through Android Studio or:

```sh
sdkmanager "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" "platform-tools"
```

Set `ANDROID_HOME`, or put your machine's SDK directory in ignored `android/local.properties`:

```properties
sdk.dir=D:/android-sdk
```

On Windows, prefer a short ASCII checkout path (for example `C:/src/BINGMATH`).
`android.overridePathCheck=true` permits the current Vietnamese workspace path, but cannot
fix every NDK/CMake limitation involving Unicode or long paths. Never commit local SDK paths.

## Firebase

The Android client configuration in `android/app/google-services.json` must contain a client
for `com.bingmathmobile` in the intended Firebase project. It is a client configuration,
not a service account. Never put Firebase Admin/service-account credentials in the app.

For iOS, register an Apple app with the same bundle identifier in Firebase and download
`GoogleService-Info.plist` to `ios/DuoMathMobile/GoogleService-Info.plist` (ignored by Git).
The Xcode target already references this file in Copy Bundle Resources. `AppDelegate.swift`
initializes Firebase and the Podfile uses static frameworks for the pinned Firebase 21.x SDK.
An iOS build requires this real configuration, macOS/Xcode and an Apple signing team.

## Development

From `mobile/`:

```sh
npm ci
npm run check
npm start
# Separate terminal:
npm run android
```

`src/config/endpoints.js` is the single location for API and WebView URLs:

| Build | API | Web frontend |
| --- | --- | --- |
| Android debug emulator | http://10.0.2.2:8000 | http://10.0.2.2:3000 |
| iOS debug simulator | http://localhost:8000 | http://localhost:3000 |
| Preview / release | https://duomath.onrender.com | https://duomath.vercel.app |

For a physical phone, change `developmentHost` to your computer's LAN IP and run the local
services on an interface reachable from the phone. Android permits HTTP only in debug builds;
preview/release use HTTPS. iOS local networking also depends on ATS and device permissions.

## Android packages

```sh
npm run build:android:debug
npm run build:android:preview
npm run build:android:release
```

| Variant | Output below `android/app/build/outputs/` | Signing / purpose |
| --- | --- | --- |
| Debug | `apk/debug/app-debug.apk` | SDK debug key; requires Metro |
| Preview | `apk/preview/app-preview.apk` | SDK debug key; bundled JS/assets and production URLs |
| Release | `apk/release/app-release.apk`, `bundle/release/app-release.aab` | Private upload key required |

Preview is for testing only. It retains the Firebase package identifier, so it cannot coexist
with a differently signed production install. Debug keys generated on different machines/CI
runs may differ: uninstall the earlier test app before installing if Android rejects an update.
Uninstalling clears that app's local data. Use a stable private signing key for distributed updates.

Supply these through environment variables or your user-level `~/.gradle/gradle.properties`:

```properties
BINGMATH_UPLOAD_STORE_FILE=/absolute/path/to/bingmath-upload.keystore
BINGMATH_UPLOAD_STORE_PASSWORD=your-private-store-password
BINGMATH_UPLOAD_KEY_ALIAS=your-upload-key-alias
BINGMATH_UPLOAD_KEY_PASSWORD=your-private-key-password
```

Use an existing upload key for an already distributed application. For a new application,
create and back up a private key outside the repository (the command prompts for passwords):

```sh
keytool -genkeypair -v -storetype PKCS12 -keystore bingmath-upload.keystore -alias bingmath-upload -keyalg RSA -keysize 2048 -validity 10000
```

A release build fails explicitly when signing settings or the key file are missing; there is
no automatic fallback to a debug certificate. Extra Gradle options can be passed after `--`:

```sh
npm run build:android:release -- -PBINGMATH_VERSION_CODE=100
npm run build:android:preview -- -PreactNativeArchitectures=arm64-v8a
```

By default all four configured ABIs are built. Keep the default for general distribution;
an ABI override is useful for faster local testing on a known device.

## GitHub Actions

`.github/workflows/build-apk.yml` builds a preview APK on mobile changes to `main` and on pull
requests. It uses `npm ci`, validates image signatures, runs TypeScript/Jest checks, installs
pinned SDK components, verifies APK signing and confirms the JS bundle is inside the APK.
Packages and an APK SHA-256 checksum are uploaded as `bingmath-preview-<run number>` artifacts.
Download them from the completed workflow's **Artifacts** section (retained for 30 days).

For a signed APK + AAB, use **Run workflow**, choose `release`, and configure repository secrets:

- `ANDROID_KEYSTORE_BASE64`: base64 content of the private upload keystore.
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

CI derives the Android version code from the workflow run number plus 2. Check that it exceeds
the last distributed version before publishing to a store. Signed packages are uploaded as
`bingmath-release-<run number>` artifacts; the temporary keystore is removed afterward.
The workflow no longer labels a debug-signed APK as a production GitHub Release. Publishing
store builds is separate from building them; no APK/AAB or private key is committed to Git.

## iOS (macOS only)

After adding the Firebase plist:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

Open `ios/DuoMathMobile.xcworkspace` to select your development team and archive for distribution.
iOS compilation and signing cannot be validated on Windows.

## Verification and troubleshooting

- `npm run check`: image signature validation, TypeScript and Jest tests.
- `npm run lint`: existing project-wide ESLint rules.
- `npm run check:assets`: catches a JPEG mislabeled `.png` before Android's AAPT fails.
- Reinstall with `npm ci` after dependency changes. Do not restore Reanimated 3 or its Babel
  plugin from an older standalone copy: this app does not import Reanimated.
- `src/assets/images/owl.jpg` and `bingmath_owl.jpg` retain their original JPEG bytes under
  correct extensions. Launcher resources remain PNG.
- If Metro reports stale asset paths after the rename, restart it with `npm start -- --reset-cache`.

References: [React Native signing](https://reactnative.dev/docs/signed-apk-android),
[React Native Firebase setup](https://rnfirebase.io/).
