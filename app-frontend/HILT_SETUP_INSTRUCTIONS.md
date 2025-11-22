# Hilt Dependency Injection Setup Guide

This document explains how to enable Hilt dependency injection in the Too Good CRM Android app.

## Why Use Hilt?

✅ **Better code organization** - Separates object creation from business logic
✅ **Easier testing** - Mock dependencies easily in tests  
✅ **Less boilerplate** - Reduces manual dependency management
✅ **Type-safe** - Compile-time dependency resolution
✅ **Android-optimized** - Built specifically for Android lifecycle

## Current Status

The following files are ready for Hilt:
- ✅ `di/AppModule.kt` - Dependency providers
- ✅ `CrmApplication.kt` - Application class
- ⚠️ Gradle configuration needed
- ⚠️ ViewModels need conversion

## Step-by-Step Setup

### Step 1: Update build.gradle.kts (Project level)

Add Hilt plugin to `app-frontend/build.gradle.kts`:

```kotlin
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    id("com.google.dagger.hilt.android") version "2.48" apply false  // Add this
}
```

### Step 2: Update build.gradle.kts (App level)

Add to `app-frontend/app/build.gradle.kts`:

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.google.dagger.hilt.android")  // Add this
    id("com.google.devtools.ksp")  // Add this for annotation processing
}

dependencies {
    // Existing dependencies...
    
    // Hilt Dependencies
    implementation("com.google.dagger:hilt-android:2.48")
    ksp("com.google.dagger:hilt-android-compiler:2.48")
    
    // Hilt for Compose & Navigation
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Hilt for ViewModels (if using)
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.6.2")
}
```

### Step 3: Update libs.versions.toml

Add to `app-frontend/gradle/libs.versions.toml`:

```toml
[versions]
# ... existing versions ...
hilt = "2.48"
hiltNavigation = "1.1.0"
ksp = "1.9.20-1.0.14"

[libraries]
# ... existing libraries ...
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-android-compiler", version.ref = "hilt" }
hilt-navigation-compose = { group = "androidx.hilt", name = "hilt-navigation-compose", version.ref = "hiltNavigation" }

[plugins]
# ... existing plugins ...
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

### Step 4: Update AndroidManifest.xml

Change the `<application>` tag to use `CrmApplication`:

```xml
<application
    android:name=".CrmApplication"
    android:allowBackup="true"
    ...>
```

### Step 5: Enable Hilt in CrmApplication.kt

Uncomment the `@HiltAndroidApp` annotation:

```kotlin
@HiltAndroidApp  // Uncomment this line
class CrmApplication : Application() {
    // ...
}
```

### Step 6: Update MainActivity.kt

Add `@AndroidEntryPoint` annotation:

```kotlin
@AndroidEntryPoint  // Add this
class MainActivity : ComponentActivity() {
    // ...
}
```

### Step 7: Convert ViewModels to Use Hilt

Example for `LoginViewModel`:

**Before:**
```kotlin
class LoginViewModel(context: Context) : ViewModel() {
    private val repository = AuthRepository(context)
    // ...
}
```

**After:**
```kotlin
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {
    // ...
}
```

**Usage in Composable:**
```kotlin
@Composable
fun LoginScreen() {
    val viewModel: LoginViewModel = hiltViewModel()
    // ...
}
```

### Step 8: Update All ViewModels

Convert these ViewModels to use Hilt:

1. ✅ `LoginViewModel` 
2. ✅ `DashboardViewModel`
3. ✅ `CustomersViewModel`
4. ✅ `EmployeeViewModel`
5. ✅ `IssueViewModel`
6. ✅ `ProfileViewModel`

### Step 9: Sync and Build

```bash
./gradlew clean
./gradlew build
```

## Benefits After Setup

### Before Hilt:
```kotlin
@Composable
fun CustomersScreen() {
    val context = LocalContext.current
    val viewModel = remember { CustomersViewModel(context) }
    // ...
}
```

### After Hilt:
```kotlin
@Composable
fun CustomersScreen() {
    val viewModel: CustomersViewModel = hiltViewModel()
    // ...
}
```

## Testing with Hilt

### Unit Tests
```kotlin
@HiltAndroidTest
class LoginViewModelTest {
    @get:Rule
    var hiltRule = HiltAndroidRule(this)
    
    @Inject
    lateinit var authRepository: AuthRepository
    
    @Test
    fun testLogin() {
        // Test with injected dependencies
    }
}
```

### Add Test Dependencies
```kotlin
androidTestImplementation("com.google.dagger:hilt-android-testing:2.48")
kspAndroidTest("com.google.dagger:hilt-android-compiler:2.48")
```

## Common Issues & Solutions

### Issue: "Unresolved reference: hilt"
**Solution:** Make sure you've synced Gradle after adding dependencies.

### Issue: "@AndroidEntryPoint can only be used on Activity"
**Solution:** Ensure the class extends ComponentActivity, not Activity.

### Issue: "No injected constructor found"
**Solution:** Add `@Inject constructor` to your ViewModel.

### Issue: Build fails with KSP errors
**Solution:** Make sure KSP plugin version matches Kotlin version.

## Migration Checklist

- [ ] Update project build.gradle.kts
- [ ] Update app build.gradle.kts
- [ ] Update libs.versions.toml
- [ ] Update AndroidManifest.xml
- [ ] Uncomment @HiltAndroidApp in CrmApplication.kt
- [ ] Add @AndroidEntryPoint to MainActivity
- [ ] Convert LoginViewModel to use Hilt
- [ ] Convert DashboardViewModel to use Hilt
- [ ] Convert CustomersViewModel to use Hilt
- [ ] Convert EmployeeViewModel to use Hilt
- [ ] Convert IssueViewModel to use Hilt
- [ ] Convert ProfileViewModel to use Hilt
- [ ] Update all screen composables to use hiltViewModel()
- [ ] Test build and runtime
- [ ] Add test dependencies

## Resources

- [Official Hilt Documentation](https://developer.android.com/training/dependency-injection/hilt-android)
- [Hilt with Jetpack Compose](https://developer.android.com/training/dependency-injection/hilt-jetpack)
- [Testing with Hilt](https://developer.android.com/training/dependency-injection/hilt-testing)

---

**Note:** Hilt setup is optional but highly recommended for production apps. The app will work without Hilt, but with Hilt you get better architecture, testing, and maintainability.

