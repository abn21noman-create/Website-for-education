import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const failures = [];
const checks = [];

function check(condition, message) {
  checks.push(message);
  if (!condition) failures.push(message);
  console.log(`${condition ? '✓' : '✗'} ${message}`);
}

const [
  manifest,
  activity,
  appGradle,
  networkPolicy,
  proguard,
  adapter,
  runtimeStatus,
  indexHtml,
  wrapperProperties,
  releaseWorkflow,
] = await Promise.all([
  read('android/app/src/main/AndroidManifest.xml'),
  read('android/app/src/main/java/com/nokkhotro/hsc2028/MainActivity.kt'),
  read('android/app/build.gradle.kts'),
  read('android/app/src/main/res/xml/network_security_config.xml'),
  read('android/app/proguard-rules.pro'),
  read('src/lib/nativeFocus.ts'),
  read('src/components/AppRuntimeStatus.tsx'),
  read('index.html'),
  read('android/gradle/wrapper/gradle-wrapper.properties'),
  read('.github/workflows/android-release.yml'),
]);

const permissions = [...manifest.matchAll(/<uses-permission\s+android:name="([^"]+)"\s*\/>/g)]
  .map((match) => match[1])
  .sort();
const allowedPermissions = [
  'android.permission.ACCESS_NETWORK_STATE',
  'android.permission.INTERNET',
];
check(
  JSON.stringify(permissions) === JSON.stringify(allowedPermissions),
  'manifest has only Internet and network-state permissions'
);
check(
  !/<(?:service|receiver|provider)\b/.test(manifest) &&
    !/QUERY_ALL_PACKAGES|SYSTEM_ALERT_WINDOW|BIND_ACCESSIBILITY_SERVICE|DEVICE_ADMIN/.test(manifest),
  'manifest has no service, receiver, provider, package scan, overlay, accessibility or device-admin surface'
);
check(
  manifest.includes('android:usesCleartextTraffic="false"') &&
    manifest.includes('android:allowBackup="false"') &&
    networkPolicy.includes('cleartextTrafficPermitted="false"'),
  'Android networking is HTTPS-only and app backup is disabled'
);
check(
  manifest.includes('android.webkit.WebView.EnableSafeBrowsing') &&
    activity.includes('safeBrowsingEnabled = true'),
  'WebView Safe Browsing is enabled in manifest and runtime settings'
);

check(
  appGradle.includes('minSdk = 26') &&
    appGradle.includes('targetSdk = 36') &&
    appGradle.includes('compileSdk = 36') &&
    appGradle.includes('isMinifyEnabled = true') &&
    appGradle.includes('isShrinkResources = true'),
  'native build targets API 36, supports API 26+, and shrinks release code/resources'
);
check(
  activity.includes('WebViewAssetLoader.AssetsPathHandler') &&
    activity.includes('https://${FocusPolicy.APP_ASSET_HOST}/index.html#/') &&
    !activity.includes('loadUrl("http'),
  'host loads the bundled appassets origin rather than a remote website'
);
check(
  (activity.match(/addJavascriptInterface\(/g) || []).length === 1 &&
    activity.includes('fun startFocusSession(durationSeconds: Int, label: String)') &&
    activity.includes('fun stopFocusSession(): Boolean') &&
    activity.includes('fun getFocusState(): String') &&
    proguard.includes('@android.webkit.JavascriptInterface'),
  'one narrow, annotated focus bridge is exposed and preserved through R8'
);
check(
  activity.includes('startLockTask()') &&
    activity.includes('stopLockTask()') &&
    activity.includes('nokkhotro:native-focus-active') &&
    activity.includes('nokkhotro:native-focus-lost') &&
    adapter.includes("'nokkhotro:native-focus-active'") &&
    adapter.includes("'nokkhotro:native-focus-lost'"),
  'native and TypeScript lock events agree on documented Lock Task start/release boundaries'
);
check(
  activity.includes('isLockTaskPermitted(packageName)') &&
    !activity.includes('isDeviceOwnerApp') &&
    !activity.includes('setLockTaskPackages'),
  'managed kiosk is detected but never self-provisioned or silently allowlisted'
);
check(
  runtimeStatus.includes('if (\n      isNativeAndroidHost()') &&
    indexHtml.includes('http-equiv="Content-Security-Policy"') &&
    indexHtml.includes("script-src 'self'") &&
    indexHtml.includes("connect-src 'self' https://*.supabase.co"),
  'native host skips PWA worker registration and bundled HTML carries a restrictive CSP'
);

check(
  wrapperProperties.includes('downloads.gradle.org/distributions/gradle-8.11.1-bin.zip') &&
    wrapperProperties.includes('distributionSha256Sum=f397b287023acdba1e9f6fc5ea72d22dd63669d59ed4a289a29b1a76eee151c6') &&
    wrapperProperties.includes('validateDistributionUrl=true'),
  'Gradle wrapper pins 8.11.1 and verifies the official distribution checksum'
);
const wrapperJar = await readFile(new URL('../android/gradle/wrapper/gradle-wrapper.jar', import.meta.url));
const wrapperSha = createHash('sha256').update(wrapperJar).digest('hex');
check(
  wrapperSha === '2db75c40782f5e8ba1fc278a5574bab070adccb2d21ca5a6e5ed840888448046',
  'Gradle wrapper JAR matches the recorded official 8.11.1 checksum'
);
check(
  releaseWorkflow.includes('REQUIRE_RELEASE_SIGNING: \'true\'') &&
    releaseWorkflow.includes('bundleRelease') &&
    releaseWorkflow.includes('jarsigner -verify') &&
    releaseWorkflow.includes('ANDROID_UPLOAD_KEYSTORE_BASE64'),
  'release workflow fails closed on signing and verifies the Play AAB signature'
);

console.log(`\n${failures.length === 0 ? `PASS (${checks.length} checks)` : `FAIL (${failures.length}/${checks.length})`}`);
if (failures.length) process.exit(1);
