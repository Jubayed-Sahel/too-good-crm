// Updated to fix IDE indexing issues - 2025-11-09
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "too.good.crm"
    compileSdk {
        version = release(36)
    }

    defaultConfig {
        applicationId = "too.good.crm"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // For Android Emulator - use: "http://10.0.2.2:8000/api/"
        // For Physical Phone - use: "http://YOUR_IP:8000/api/" (replace YOUR_IP with your computer's IP)
        // For Production - use: "https://api.yourdomain.com/api/"

        //  EDIT THIS LINE WITH IP ADDRESS
        // Get your IP: Windows (cmd): ipconfig | Mac/Linux: ifconfig
        val backendUrl = "http://192.168.0.218:8000/api/"
        buildConfigField("String", "BACKEND_URL", "\"$backendUrl\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    lint {
        disable.add("UnsafeOptInUsageError")
        disable.add("UnsafeOptInUsageWarning")
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation("androidx.navigation:navigation-compose:2.7.7")
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.kotlinx.coroutines.android)
    implementation("androidx.compose.material:material-icons-extended")
    implementation("com.google.android.material:material:1.11.0")
    implementation(libs.accompanist.swiperefresh)
    
    // Pusher for real-time updates
    implementation("com.pusher:pusher-java-client:2.4.4")
    
    // Jitsi Meet SDK for video calling
    implementation("org.jitsi.react:jitsi-meet-sdk:9.2.2") {
        isTransitive = true
    }

}