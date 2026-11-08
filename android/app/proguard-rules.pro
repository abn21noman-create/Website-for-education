# The only JavaScript bridge methods are explicitly annotated and exposed only
# to the bundled appassets origin. Keep their names for Android WebView.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve source/line metadata for useful Play Console crash reports.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
