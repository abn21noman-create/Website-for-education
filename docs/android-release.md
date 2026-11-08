# Native Android build and Play release

Nokkhotro's Android application is a direct Kotlin host for the audited React/Vite application. It is **not Capacitor, Cordova, Expo, or a remote-site wrapper**. Each APK/AAB contains the web build that it runs and serves it from Android's reserved HTTPS app-assets origin with `WebViewAssetLoader`.

## Security and focus model

- The only JavaScript bridge is `NokkhotroNative`. It reports a versioned capability/state object and can request or release Android Lock Task (Screen Pinning).
- A student request starts only from the visible **Start focus** action. The web countdown remains paused while Android's trusted confirmation is open.
- A normal Play-installed personal device uses Android Screen Pinning. Android owns the confirmation and the student can manually unpin. Nokkhotro detects a declined or released pin and pauses the countdown, so escaped time earns no study credit.
- A school-managed device can provide stronger Lock Task behavior only when an independently administered Device Policy Controller (DPC) allowlists this package. This app does not try to make itself Device Owner or silently provision kiosk mode.
- Completion and the confirmed emergency-exit action call `stopLockTask()` immediately.
- Untrusted top-level pages never load inside the bridged WebView. Normal external HTTPS/mail links open in another app only while focus is inactive.
- The bundled app skips PWA service-worker registration. APK updates, rather than a second web cache, version the native UI.

The manifest requests only:

- `android.permission.INTERNET`
- `android.permission.ACCESS_NETWORK_STATE`

There is no Accessibility Service, overlay permission, package enumeration, storage permission, Device Admin receiver, background install, or downloaded executable code.

> No framework or repository can guarantee Play Protect or Play Store approval. Google evaluates the final signed artifact, target API, behavior, SDKs, privacy/data-safety disclosures, account flows, and store listing. Keep the listing factual: on personal devices this is user-confirmed, manually releasable Screen Pinning—not an unbreakable app blocker.

## Toolchain

- Node.js 22 and npm 10+
- JDK 17
- Android SDK platform 36 and Build Tools 36.0.0
- Gradle 9.8.2 through the committed, checksum-validated wrapper
- Minimum Android API 26; target/compile API 36

Install web dependencies first:

```bash
npm ci
```

The Gradle `preBuild` task runs `npm run build:android` and places a fresh Vite build in the ignored directory `android/app/src/main/assets/`. Do not hand-edit or commit that generated directory.

## Local commands and outputs

```bash
# Native JVM policy tests + Android lint
npm run android:test

# Debug APK (application ID gets a .debug suffix)
npm run android:apk

# Release AAB; unsigned unless all signing environment values are present
npm run android:bundle
```

Outputs:

- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- R8 mapping: `android/app/build/outputs/mapping/release/mapping.txt`

The debug package is intentionally separate from the Play package and cannot upgrade an installed production build.

Optional Gradle properties:

```bash
./android/gradlew -p android \
  -PVERSION_CODE=2 \
  -PVERSION_NAME=1.1.0 \
  bundleRelease
```

`APPLICATION_ID` is also overridable as a Gradle property for a deliberate fork, but do not change it after creating the Play app. Nokkhotro's default is `com.nokkhotro.hsc2028`.

## GitHub Actions

### Pull requests and debug APKs

`.github/workflows/android-ci.yml` runs native JVM tests, debug/release Android lint, `assembleDebug`, and an R8-minified `bundleRelease` on pull requests. It signs that release bundle with a one-day, throwaway key generated inside the job and verifies the signature, so the complete release path is compiled without exposing or requiring a repository secret. The throwaway AAB is never uploaded; only the debug APK and lint/test reports become workflow artifacts. It is safe for pull requests.

### Signed Play bundle

`.github/workflows/android-release.yml` is manual (`workflow_dispatch`). It requires a positive, monotonically increasing `version_code` and a semantic-style `version_name`. It runs tests and release lint, applies R8/resource shrinking, builds a signed AAB, verifies that the bundle is signed, generates SHA-256, and uploads the AAB, checksum, and mapping file as a private workflow artifact.

Configure these GitHub Actions repository secrets:

| Secret | Value |
|---|---|
| `ANDROID_UPLOAD_KEYSTORE_BASE64` | Base64 of the Play **upload** keystore |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Upload-key alias |
| `ANDROID_KEY_PASSWORD` | Upload-key password |

The workflow fails closed if any value is missing. It never prints or uploads the keystore.

Create an upload key offline and keep at least two secure backups outside Git/GitHub artifacts:

```bash
keytool -genkeypair -v \
  -keystore nokkhotro-upload.jks \
  -alias upload \
  -keyalg RSA -keysize 4096 -validity 10000

# Linux: copy this one-line result into the GitHub secret
base64 -w 0 nokkhotro-upload.jks

# macOS alternative
base64 < nokkhotro-upload.jks | tr -d '\n'

# Certificate for Play Console enrollment or verification
keytool -export -rfc \
  -keystore nokkhotro-upload.jks \
  -alias upload \
  -file upload_certificate.pem
```

For a signed local build:

```bash
export ANDROID_KEYSTORE_FILE="$PWD/nokkhotro-upload.jks"
export ANDROID_KEYSTORE_PASSWORD='...'
export ANDROID_KEY_ALIAS='upload'
export ANDROID_KEY_PASSWORD='...'
export REQUIRE_RELEASE_SIGNING=true
./android/gradlew -p android \
  -PVERSION_CODE=2 -PVERSION_NAME=1.1.0 \
  testReleaseUnitTest lintRelease bundleRelease
```

The `.gitignore` excludes `*.jks` and `*.keystore`, but secrets should still be created and stored outside the repository.

## Play App Signing checklist

1. Create the Play Console app with the final application ID `com.nokkhotro.hsc2028`.
2. Enroll in **Play App Signing**. The local/GitHub key is the upload key; Google protects the app-signing key and signs distributed APKs.
3. Run the signed-AAB workflow with a new version code. Download and verify its checksum before upload.
4. Upload first to **Internal testing**, not Production.
5. Keep `https://nokkhotro-hsc-2028.vercel.app/` on Supabase Auth's allowed redirect list. The private `appassets` host is not publicly routable, so native email verification and password-recovery links intentionally finish in that audited production web app; the updated credentials then work in Android.
6. Enter the public Privacy Policy URL `https://nokkhotro-hsc-2028.vercel.app/privacy` and account-deletion URL `https://nokkhotro-hsc-2028.vercel.app/account-deletion`. Complete Data safety, app-access, content-rating, target-audience, and ads declarations from the exact release using [`play-data-safety.md`](play-data-safety.md) as a review worksheet—not as a substitute for checking the current Play form/provider behavior. Authentication and cloud study/life sync must be disclosed accurately; native focus state stays on-device and does not inspect which other app the student opens.
7. Use a real support URL/email and screenshots that show Android's confirmation honestly. Do not advertise uninstall prevention, silent kiosk mode, surveillance, or guaranteed app blocking on personal phones.
8. Review the pre-launch report, Android vitals, policy warnings, and Play Protect result before expanding the testing track.
9. Preserve the upload keystore, passwords, source commit, AAB checksum, and R8 `mapping.txt` for every release.

## Physical-device acceptance test

Run these on at least one API 26-class device and current Android before promotion:

1. Fresh install and launch; bundled dashboard renders without loading a remote shell.
2. Start Focus Mode; countdown remains paused during the system pinning prompt.
3. Decline the prompt; UI reports that Screen Pinning is required and no time is deducted.
4. Accept the prompt; only then does the countdown run.
5. Manually unpin; countdown pauses and does not count time outside the app.
6. Resume and accept pinning again.
7. Confirm emergency exit; native pinning releases and incomplete time is not logged.
8. Complete a short test fixture; native pinning releases once, routine progress/study time/XP log once.
9. Background, rotate, kill, and relaunch; restored time is paused and absent time is not credited.
10. Verify normal HTTPS cloud sync, offline behavior, Safe Browsing, external-link handling, dark mode, TalkBack, and back navigation.
11. With a disposable account, distinguish **Reset study data** from full account deletion; run full deletion, confirm the app returns signed-out, local account data is gone, and the same credentials cannot sign in again.
12. Open the two public policy/deletion URLs in a signed-out browser and complete a separate disposable web-account deletion test.
13. Install the signed internal-test build and confirm Play recognizes its package, version code, upload signature, and target API.

A managed-school test is separate: the school's DPC must call Android's documented `setLockTaskPackages(...)` policy for this package. Nokkhotro intentionally contains no self-enrollment or hidden administrator path.
