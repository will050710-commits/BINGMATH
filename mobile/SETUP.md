# DuoMath Mobile — Hướng dẫn Setup & Chạy

## Bước 1: Cài Java JDK (bắt buộc)

Tải và cài **JDK 17** (khuyến nghị):
```
https://adoptium.net/temurin/releases/?version=17
```
- Chọn Windows x64 → `.msi` → cài đặt.
- Sau khi cài, mở terminal mới và kiểm tra:
```powershell
java --version
# phải hiện: openjdk 17.x.x
```

---

## Bước 2: Cài Android Studio

1. Tải tại: https://developer.android.com/studio
2. Cài đặt, trong setup chọn **"Standard"** installation.
3. Sau khi cài xong → mở **SDK Manager** (Tools → SDK Manager):
   - Chọn tab **SDK Platforms** → tích **Android 14 (API 34)**
   - Chọn tab **SDK Tools** → tích:
     - Android SDK Build-Tools
     - Android SDK Platform-Tools
     - Android Emulator
4. Tạo **AVD** (máy ảo Android): Tools → AVD Manager → Create Virtual Device → Pixel 6 → API 34

---

## Bước 3: Cấu hình biến môi trường

Thêm vào PowerShell profile hoặc System Environment Variables:
```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

---

## Bước 4: Cài Firebase Native Config

Truy cập **Firebase Console** (https://console.firebase.google.com/) → Project `duosteam-be693`:

1. Project Settings → **Add app** → chọn **Android**
2. Package name: `com.duomathmobile`
3. Tải file `google-services.json`
4. Đặt file vào: `DuoMathMobile/android/app/google-services.json`

---

## Bước 5: Cài dependencies

```powershell
cd "DuoMathMobile"
npm install
```

---

## Bước 6: Chạy app

**Trên Android emulator:**
```powershell
# Mở emulator từ AVD Manager trước, rồi:
npx react-native run-android
```

**Trên thiết bị thật:**
1. Bật Developer Mode trên điện thoại (Settings → About → tap Build Number 7 lần)
2. Bật USB Debugging
3. Kết nối cáp USB
4. ```powershell
   adb devices  # xác nhận thấy device
   npx react-native run-android
   ```

---

## Bước 7: Cấu hình Backend URL cho thiết bị thật

Mở `src/api/client.js` và thay `10.0.2.2` bằng IP máy tính trên cùng WiFi:
```js
const BASE_URL = __DEV__
  ? 'http://192.168.x.x:5000'  // ← thay bằng IP thật của máy bạn
  : 'https://...';
```

Tương tự `src/screens/learn/LessonWebViewScreen.js` và `src/screens/battle/MRMScreen.js` → thay `10.0.2.2:3000`.

---

## Cấu trúc thư mục

```
DuoMathMobile/
├── android/          ← Android native project (Gradle)
├── ios/              ← iOS (macOS only)
├── src/
│   ├── api/          ← client.js, auth.js, leaderboard.js, chat.js
│   ├── context/      ← AuthContext.js, LanguageContext.js
│   ├── navigation/   ← RootNavigator, AuthStack, AppTabs
│   ├── screens/
│   │   ├── auth/     ← LoginScreen, SignUpScreen
│   │   ├── home/     ← HomeScreen
│   │   ├── learn/    ← LessonListScreen, LessonWebViewScreen
│   │   ├── battle/   ← MRMScreen
│   │   ├── library/  ← TaiLieuScreen
│   │   └── profile/  ← ProfileScreen, SettingsScreen
│   └── theme/        ← colors.js, typography.js, spacing.js
└── App.tsx           ← Entry point
```
