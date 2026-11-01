# BingMath Mobile (DuoMathMobile)

Native Android/iOS client for BingMath, built with React Native 0.86 and React 19.2.3.
The app name and native identifier are **BingMath** / **com.bingmathmobile**.
The Xcode project keeps its existing `DuoMathMobile` name.

This `mobile/` directory in `will050710-commits/BINGMATH` is the source used by GitHub Actions.
The standalone `DuoMathMobile/` workspace copy is not a separate GitHub release source.

```sh
npm ci
npm run check
npm start
# In another terminal, with an emulator/device connected:
npm run android
```

Android packages:

```sh
npm run build:android:preview  # standalone test APK; no Metro required
npm run build:android:release  # signed production APK + Play Store AAB
```

See [SETUP.md](SETUP.md) for SDK versions, Firebase, signing, output paths, iOS prerequisites and CI artifacts.
