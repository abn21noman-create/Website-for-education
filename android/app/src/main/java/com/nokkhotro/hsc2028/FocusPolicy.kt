package com.nokkhotro.hsc2028

/** Pure boundaries shared by the native bridge and JVM tests. */
object FocusPolicy {
    const val MIN_DURATION_SECONDS = 60
    const val MAX_DURATION_SECONDS = 2 * 60 * 60
    const val MAX_LABEL_CHARS = 160
    const val APP_ASSET_HOST = "appassets.androidplatform.net"

    fun acceptsDuration(seconds: Int): Boolean =
        seconds in MIN_DURATION_SECONDS..MAX_DURATION_SECONDS

    fun cleanLabel(label: String): String =
        label.trim().replace(Regex("[\\u0000-\\u001F\\u007F]"), " ").take(MAX_LABEL_CHARS)

    fun isTrustedAppUrl(scheme: String?, host: String?): Boolean =
        scheme == "https" && host == APP_ASSET_HOST
}
