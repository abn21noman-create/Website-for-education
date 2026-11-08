package com.nokkhotro.hsc2028

import android.annotation.SuppressLint
import android.app.Activity
import android.app.ActivityManager
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject

/**
 * Native Android host for Nokkhotro.
 *
 * The complete audited Vite build is bundled in the APK and served from
 * Android's reserved appassets HTTPS origin. The host exposes one narrow bridge:
 * Android Lock Task / screen pinning for a student-initiated focus session.
 * It does not request Accessibility, package visibility, overlay, device-admin,
 * storage, background-install, or other policy-sensitive capabilities.
 */
class MainActivity : Activity() {
    private lateinit var webView: WebView
    private lateinit var activityManager: ActivityManager
    @Volatile private var focusRequested = false
    private var focusConfirmed = false
    private var focusRequestedAt = 0L
    private val verifyLockRunnable = Runnable { verifyRequestedLock() }

    private val assetLoader by lazy {
        WebViewAssetLoader.Builder()
            .setDomain(FocusPolicy.APP_ASSET_HOST)
            .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        activityManager = getSystemService(ActivityManager::class.java)
        webView = findViewById(R.id.app_web_view)

        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG)
        configureWebView()

        if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
            webView.loadUrl(APP_START_URL)
        }
    }

    @SuppressLint("JavascriptInterface")
    private fun configureWebView() {
        webView.setBackgroundColor(Color.TRANSPARENT)
        webView.isFocusable = true
        webView.isFocusableInTouchMode = true
        webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_BOUND, false)

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = false
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            mediaPlaybackRequiresUserGesture = true
            builtInZoomControls = false
            displayZoomControls = false
            setGeolocationEnabled(false)
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "$userAgentString NokkhotroAndroid/${BuildConfig.VERSION_NAME}"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                safeBrowsingEnabled = true
            }
        }

        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, false)
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val uri = request.url
                if (FocusPolicy.isTrustedAppUrl(uri.scheme, uri.host)) return false
                if (!request.isForMainFrame) return true
                if (focusRequested) {
                    emitWebEvent("nokkhotro:native-navigation-blocked")
                    return true
                }
                return openExternalUri(uri)
            }
        }

        // The bridge is safe because untrusted top-level navigation is never
        // loaded in this WebView and the bundled CSP does not allow remote frames.
        webView.addJavascriptInterface(FocusBridge(), BRIDGE_NAME)
        webView.requestFocus(View.FOCUS_DOWN)
    }

    private fun openExternalUri(uri: Uri): Boolean {
        if (uri.scheme !in setOf("https", "mailto")) return true
        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            })
            true
        } catch (_: ActivityNotFoundException) {
            true
        }
    }

    private inner class FocusBridge {
        @JavascriptInterface
        fun getCapabilities(): String = JSONObject()
            .put("platform", "android")
            .put("bridgeVersion", 1)
            .put("focusLock", true)
            .put("lockTask", true)
            .put("managedKiosk", isManagedLockTaskPermitted())
            .put("appVersion", BuildConfig.VERSION_NAME)
            .toString()

        @JavascriptInterface
        fun getFocusState(): String = JSONObject()
            .put("state", if (isLockTaskActive()) "active" else "inactive")
            .put("requested", focusRequested)
            .put("lockTaskMode", activityManager.lockTaskModeState)
            .put("managedKiosk", isManagedLockTaskPermitted())
            .toString()

        @JavascriptInterface
        fun startFocusSession(durationSeconds: Int, label: String): String {
            if (!FocusPolicy.acceptsDuration(durationSeconds)) {
                return JSONObject()
                    .put("accepted", false)
                    .put("reason", "invalid-duration")
                    .toString()
            }
            // Validate the only user-controlled bridge string even though it is
            // never logged, rendered natively, or sent off the device.
            FocusPolicy.cleanLabel(label)
            runOnUiThread { requestStrictFocus() }
            return JSONObject()
                .put("accepted", true)
                .put("mode", if (isLockTaskActive()) "active" else "requested")
                .toString()
        }

        @JavascriptInterface
        fun stopFocusSession(): Boolean {
            runOnUiThread { releaseStrictFocus() }
            return true
        }
    }

    private fun requestStrictFocus() {
        focusRequested = true
        focusConfirmed = false
        focusRequestedAt = SystemClock.elapsedRealtime()
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        enterImmersiveFocus()

        if (!isLockTaskActive()) {
            try {
                // On a normal Play-installed phone Android shows its own trusted
                // screen-pinning consent. If a school DPC allowlists this package,
                // the same call enters managed Lock Task without a second prompt.
                startLockTask()
            } catch (_: IllegalArgumentException) {
                failRequestedLock("start-rejected")
                return
            } catch (_: SecurityException) {
                failRequestedLock("start-rejected")
                return
            } catch (_: IllegalStateException) {
                failRequestedLock("start-rejected")
                return
            }
        }
        scheduleLockVerification()
    }

    private fun scheduleLockVerification(delayMs: Long = LOCK_POLL_MS) {
        webView.removeCallbacks(verifyLockRunnable)
        webView.postDelayed(verifyLockRunnable, delayMs)
    }

    private fun verifyRequestedLock() {
        if (!focusRequested) return
        if (isLockTaskActive()) {
            enterImmersiveFocus()
            if (!focusConfirmed) {
                focusConfirmed = true
                emitWebEvent("nokkhotro:native-focus-active")
            }
            // Continue checking so a manual unpin is detected even if no WebView
            // visibility/focus callback arrives before another app opens.
            scheduleLockVerification(LOCK_MONITOR_MS)
            return
        }

        if (focusConfirmed) {
            failRequestedLock("lock-released")
            return
        }

        val elapsed = SystemClock.elapsedRealtime() - focusRequestedAt
        if (elapsed >= LOCK_CONFIRM_GRACE_MS && hasWindowFocus()) {
            failRequestedLock("not-confirmed")
            return
        }
        scheduleLockVerification()
    }

    private fun failRequestedLock(reason: String = "not-confirmed") {
        if (!focusRequested) return
        focusRequested = false
        focusConfirmed = false
        webView.removeCallbacks(verifyLockRunnable)
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        leaveImmersiveFocus()
        emitWebEvent("nokkhotro:native-focus-lost", reason)
    }

    private fun releaseStrictFocus() {
        focusRequested = false
        focusConfirmed = false
        webView.removeCallbacks(verifyLockRunnable)
        if (isLockTaskActive()) {
            try {
                stopLockTask()
            } catch (_: IllegalArgumentException) {
                // Already released by Android or the student.
            } catch (_: SecurityException) {
                // A managed-device policy controls the final release.
            } catch (_: IllegalStateException) {
                // The task already left the foreground during teardown.
            }
        }
        window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        leaveImmersiveFocus()
    }

    private fun isLockTaskActive(): Boolean =
        activityManager.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE

    private fun isManagedLockTaskPermitted(): Boolean =
        getSystemService(android.app.admin.DevicePolicyManager::class.java)
            .isLockTaskPermitted(packageName)

    private fun enterImmersiveFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.apply {
                hide(WindowInsets.Type.systemBars())
                systemBarsBehavior =
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_FULLSCREEN or
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        }
    }

    private fun leaveImmersiveFocus() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.show(WindowInsets.Type.systemBars())
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
        }
    }

    private fun emitWebEvent(name: String, reason: String? = null) {
        // Names and reasons are fixed native constants. JSONObject.quote keeps
        // this boundary safe if a future reason contains punctuation.
        val eventName = JSONObject.quote(name)
        val script = if (reason == null) {
            "window.dispatchEvent(new CustomEvent($eventName));"
        } else {
            val eventReason = JSONObject.quote(reason)
            "window.dispatchEvent(new CustomEvent($eventName, {detail:{reason:$eventReason}}));"
        }
        webView.post { webView.evaluateJavascript(script, null) }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus && focusRequested) {
            verifyRequestedLock()
        }
    }

    @Deprecated("Android predictive back is disabled for this activity in the manifest")
    override fun onBackPressed() {
        if (focusRequested) {
            emitWebEvent("nokkhotro:native-back-blocked")
            return
        }
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        if (focusRequested) scheduleLockVerification()
    }

    override fun onPause() {
        if (
            focusRequested &&
            !isLockTaskActive() &&
            SystemClock.elapsedRealtime() - focusRequestedAt >= LOCK_CONFIRM_GRACE_MS
        ) {
            // A manual unpin followed by leaving the app must pause the web
            // countdown even if WebView visibility events are delayed.
            failRequestedLock("activity-paused")
        }
        webView.onPause()
        super.onPause()
    }

    override fun onSaveInstanceState(outState: Bundle) {
        webView.saveState(outState)
        super.onSaveInstanceState(outState)
    }

    override fun onDestroy() {
        if (isFinishing && focusRequested) {
            releaseStrictFocus()
        }
        webView.removeCallbacks(verifyLockRunnable)
        webView.removeJavascriptInterface(BRIDGE_NAME)
        webView.stopLoading()
        webView.destroy()
        super.onDestroy()
    }

    companion object {
        private const val BRIDGE_NAME = "NokkhotroNative"
        private const val LOCK_CONFIRM_GRACE_MS = 5_000L
        private const val LOCK_POLL_MS = 250L
        private const val LOCK_MONITOR_MS = 1_000L
        private const val APP_START_URL =
            "https://${FocusPolicy.APP_ASSET_HOST}/index.html#/"
    }
}
