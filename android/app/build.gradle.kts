plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val configuredVersionCode = providers.gradleProperty("VERSION_CODE").orNull?.toIntOrNull() ?: 1
val configuredVersionName = providers.gradleProperty("VERSION_NAME").orNull ?: "1.0.0"
val configuredApplicationId =
    providers.gradleProperty("APPLICATION_ID").orNull ?: "com.nokkhotro.hsc2028"
val releaseSigningValues = mapOf(
    "ANDROID_KEYSTORE_FILE" to System.getenv("ANDROID_KEYSTORE_FILE"),
    "ANDROID_KEYSTORE_PASSWORD" to System.getenv("ANDROID_KEYSTORE_PASSWORD"),
    "ANDROID_KEY_ALIAS" to System.getenv("ANDROID_KEY_ALIAS"),
    "ANDROID_KEY_PASSWORD" to System.getenv("ANDROID_KEY_PASSWORD")
)
val configuredSigningValues = releaseSigningValues.values.count { !it.isNullOrBlank() }
val requireReleaseSigning = System.getenv("REQUIRE_RELEASE_SIGNING") == "true"
if (configuredSigningValues in 1..3) {
    throw GradleException("Release signing is partially configured; provide all four ANDROID_* values.")
}
if (requireReleaseSigning && configuredSigningValues != 4) {
    throw GradleException("REQUIRE_RELEASE_SIGNING=true but release signing is not fully configured.")
}

android {
    namespace = "com.nokkhotro.hsc2028"
    compileSdk = 36

    defaultConfig {
        applicationId = configuredApplicationId
        minSdk = 26
        targetSdk = 36
        versionCode = configuredVersionCode
        versionName = configuredVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        if (configuredSigningValues == 4) {
            create("release") {
                storeFile = file(releaseSigningValues.getValue("ANDROID_KEYSTORE_FILE")!!)
                storePassword = releaseSigningValues.getValue("ANDROID_KEYSTORE_PASSWORD")!!
                keyAlias = releaseSigningValues.getValue("ANDROID_KEY_ALIAS")!!
                keyPassword = releaseSigningValues.getValue("ANDROID_KEY_PASSWORD")!!
                enableV1Signing = true
                enableV2Signing = true
                enableV3Signing = true
                enableV4Signing = true
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfigs.findByName("release")?.let { signingConfig = it }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
    }

    lint {
        abortOnError = true
        checkReleaseBuilds = true
        htmlReport = true
        sarifReport = true
    }

}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    testImplementation("junit:junit:4.13.2")
}

val repositoryRoot = rootProject.projectDir.parentFile
val generatedWebAssets = layout.projectDirectory.dir("src/main/assets")
val npmExecutable = if (
    System.getProperty("os.name").lowercase().contains("windows")
) "npm.cmd" else "npm"

val syncWebAssets by tasks.registering(Exec::class) {
    group = "nokkhotro"
    description = "Build the audited Vite app into the native APK assets."
    workingDir(repositoryRoot)
    commandLine(npmExecutable, "run", "build:android")

    inputs.files(
        repositoryRoot.resolve("package.json"),
        repositoryRoot.resolve("package-lock.json"),
        repositoryRoot.resolve("vite.config.ts"),
        repositoryRoot.resolve("tsconfig.json"),
        repositoryRoot.resolve("index.html")
    )
    inputs.dir(repositoryRoot.resolve("src"))
    inputs.dir(repositoryRoot.resolve("public"))
    outputs.dir(generatedWebAssets)
}

tasks.named("preBuild") {
    dependsOn(syncWebAssets)
}
