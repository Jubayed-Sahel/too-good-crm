# ================================================================================================
# Too Good CRM - ProGuard Rules
# ================================================================================================
# Production-ready ProGuard configuration following Android best practices
# Last updated: 2024
#
# References:
# - https://developer.android.com/build/shrink-code
# - https://square.github.io/retrofit/
# ================================================================================================

# ------------------------------------------------------------------------------------------------
# General Android Rules
# ------------------------------------------------------------------------------------------------

# Keep line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Keep annotations
-keepattributes *Annotation*

# Keep generic signature for reflection
-keepattributes Signature

# Keep exceptions
-keepattributes Exceptions

# Keep inner classes
-keepattributes InnerClasses

# Keep EnclosingMethod attribute
-keepattributes EnclosingMethod

# ------------------------------------------------------------------------------------------------
# Kotlin Specific Rules
# ------------------------------------------------------------------------------------------------

# Keep Kotlin metadata
-keep class kotlin.Metadata { *; }

# Keep Kotlin coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.** {
    volatile <fields>;
}

# Keep Kotlin serialization
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# ------------------------------------------------------------------------------------------------
# Jetpack Compose Rules
# ------------------------------------------------------------------------------------------------

# Keep Compose runtime
-keep class androidx.compose.runtime.** { *; }
-keep class androidx.compose.ui.** { *; }
-keep class androidx.compose.foundation.** { *; }
-keep class androidx.compose.material3.** { *; }

# Keep @Composable functions
-keep @androidx.compose.runtime.Composable class ** { *; }

# ------------------------------------------------------------------------------------------------
# Retrofit & OkHttp Rules
# ------------------------------------------------------------------------------------------------

# Retrofit
-keepattributes Signature, InnerClasses, EnclosingMethod
-keepattributes RuntimeVisibleAnnotations, RuntimeVisibleParameterAnnotations
-keepattributes AnnotationDefault

-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Ignore annotation used for build tooling
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement

# Ignore JSR 305 annotations for embedding nullability information
-dontwarn javax.annotation.**

# Guarded by a NoClassDefFoundError try/catch and only used when on the classpath
-dontwarn kotlin.Unit

# Top-level functions that can only be used by Kotlin
-dontwarn retrofit2.KotlinExtensions
-dontwarn retrofit2.KotlinExtensions$*

# With R8 full mode, it sees no subtypes of Retrofit interfaces since they are created with a Proxy
-if interface * { @retrofit2.http.* <methods>; }
-keep,allowobfuscation interface <1>

# Keep inherited services
-if interface * { @retrofit2.http.* <methods>; }
-keep,allowobfuscation interface * extends <1>

# With R8 full mode generic signatures are stripped for classes that are not kept
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response

# With R8 full mode generic signatures are stripped for classes that are not kept
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# OkHttp Logging Interceptor
-keep class okhttp3.logging.HttpLoggingInterceptor { *; }

# ------------------------------------------------------------------------------------------------
# Gson Rules (for JSON parsing)
# ------------------------------------------------------------------------------------------------

# Gson uses generic type information stored in a class file when working with fields
-keepattributes Signature

# Gson specific classes
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep all model classes (data classes for API responses)
-keep class too.good.crm.data.model.** { *; }
-keep class too.good.crm.data.models.** { *; }

# Prevent stripping of field names in model classes
-keepclassmembers class too.good.crm.data.model.** { *; }
-keepclassmembers class too.good.crm.data.models.** { *; }

# Application classes that will be serialized/deserialized over Gson
-keep class too.good.crm.data.model.** { <fields>; }
-keep class too.good.crm.data.models.** { <fields>; }

# ------------------------------------------------------------------------------------------------
# Android Architecture Components (ViewModel, LiveData, etc.)
# ------------------------------------------------------------------------------------------------

# ViewModel
-keep class * extends androidx.lifecycle.ViewModel {
    <init>();
}
-keep class * extends androidx.lifecycle.AndroidViewModel {
    <init>(android.app.Application);
}

# Keep ViewModel constructors
-keepclassmembers class * extends androidx.lifecycle.ViewModel {
    <init>(...);
}

# ------------------------------------------------------------------------------------------------
# Navigation Component Rules
# ------------------------------------------------------------------------------------------------

-keep class androidx.navigation.** { *; }
-keepnames class androidx.navigation.**

# ------------------------------------------------------------------------------------------------
# Material Components Rules
# ------------------------------------------------------------------------------------------------

-keep class com.google.android.material.** { *; }
-dontwarn com.google.android.material.**

# ------------------------------------------------------------------------------------------------
# Pusher (Real-time notifications)
# ------------------------------------------------------------------------------------------------

-keep class com.pusher.** { *; }
-dontwarn com.pusher.**

# ------------------------------------------------------------------------------------------------
# Parcelable
# ------------------------------------------------------------------------------------------------

-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# ------------------------------------------------------------------------------------------------
# Enum
# ------------------------------------------------------------------------------------------------

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# ------------------------------------------------------------------------------------------------
# R8 Full Mode Rules
# ------------------------------------------------------------------------------------------------

# Keep class members of R8-optimized classes
-keepclassmembers class ** {
    @androidx.compose.runtime.Composable <methods>;
}

# ------------------------------------------------------------------------------------------------
# Custom Application Rules
# ------------------------------------------------------------------------------------------------

# Keep your API service interfaces
-keep interface too.good.crm.data.api.** { *; }

# Keep repository classes
-keep class too.good.crm.data.repository.** { *; }

# Keep ViewModel classes
-keep class too.good.crm.features.**.viewmodel.** { *; }
-keep class too.good.crm.features.**.*ViewModel { *; }

# Keep data classes used in API
-keepclassmembers class too.good.crm.data.** {
    <init>(...);
    <fields>;
}

# ------------------------------------------------------------------------------------------------
# WebView (if used)
# ------------------------------------------------------------------------------------------------

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ------------------------------------------------------------------------------------------------
# Debugging & Logging (Remove in production)
# ------------------------------------------------------------------------------------------------

# Remove all logging in production
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# Remove println statements
-assumenosideeffects class kotlin.io.ConsoleKt {
    public static *** println(...);
}

# ------------------------------------------------------------------------------------------------
# Optimization Settings
# ------------------------------------------------------------------------------------------------

# Enable aggressive optimizations
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-verbose

# Optimization options
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*

# ------------------------------------------------------------------------------------------------
# Warnings to Ignore (Third-party libraries)
# ------------------------------------------------------------------------------------------------

-dontwarn java.lang.invoke.StringConcatFactory
-dontwarn javax.annotation.Nullable
-dontwarn javax.annotation.ParametersAreNonnullByDefault
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# ================================================================================================
# End of ProGuard Rules
# ================================================================================================