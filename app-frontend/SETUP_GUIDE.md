# Linear Issue Tracking - Mobile App Setup Guide

## ✅ What's Implemented

### Backend (Already Set Up)
- ✅ Linear API integration service (`linear_service.py`)
- ✅ Issue models with Linear sync fields
- ✅ API endpoints for customers and vendors
- ✅ Automatic Linear sync when issues are created
- ✅ LINEAR_API_KEY configured in `.env`

### Mobile App (Just Added)
- ✅ Data models (`Issue.kt`)
- ✅ API service interface (`IssueApiService.kt`)
- ✅ Repository layer (`IssueRepository.kt`)
- ✅ Shared ViewModel (`IssueViewModel.kt`)
- ✅ Customer UI screens (3 screens)
- ✅ Vendor/Employee UI screens (2 screens)

## 🚀 Integration Steps

### Step 1: Set Up Retrofit API Client

Create `app/src/main/java/too/good/crm/data/api/ApiClient.kt`:

```kotlin
package too.good.crm.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val BASE_URL = "https://your-backend-url.com/api/" // Update this!
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .addInterceptor { chain ->
            val original = chain.request()
            val request = original.newBuilder()
                .header("Authorization", "Token ${getAuthToken()}") // Your auth token
                .header("Content-Type", "application/json")
                .method(original.method, original.body)
                .build()
            chain.proceed(request)
        }
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val issueApiService: IssueApiService = retrofit.create(IssueApiService::class.java)
    
    private fun getAuthToken(): String {
        // Get token from SharedPreferences or your auth manager
        return "your-auth-token" // Update this!
    }
}
```

### Step 2: Update ViewModel to Use ApiClient

If not using dependency injection, update `IssueViewModel`:

```kotlin
class IssueViewModel : ViewModel() {
    private val repository = IssueRepository(ApiClient.issueApiService)
    
    // ... rest of the code stays the same
}
```

### Step 3: Add Navigation Routes

In your main navigation composable:

```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val userMode = UserSession.activeMode // Get from your session
    
    NavHost(navController = navController, startDestination = "home") {
        // ... other routes
        
        // Customer routes
        composable("issues") {
            if (userMode == ActiveMode.CLIENT) {
                CustomerIssuesListScreen(
                    organizationId = 1, // Get from your session
                    onNavigateToCreate = { navController.navigate("issues/create") },
                    onNavigateToDetail = { id -> navController.navigate("issues/$id") },
                    onNavigateBack = { navController.navigateUp() }
                )
            } else {
                VendorIssuesListScreen(
                    onNavigateToDetail = { id -> navController.navigate("issues/vendor/$id") },
                    onNavigateBack = { navController.navigateUp() }
                )
            }
        }
        
        composable("issues/create") {
            CustomerCreateIssueScreen(
                organizationId = 1, // Get from your session
                onNavigateBack = { navController.navigateUp() }
            )
        }
        
        composable("issues/{issueId}") { backStackEntry ->
            val issueId = backStackEntry.arguments?.getString("issueId")?.toIntOrNull()
            if (issueId != null) {
                if (userMode == ActiveMode.CLIENT) {
                    CustomerIssueDetailScreen(
                        issueId = issueId,
                        onNavigateBack = { navController.navigateUp() },
                        onOpenLinear = { url -> openInBrowser(url) }
                    )
                } else {
                    VendorIssueDetailScreen(
                        issueId = issueId,
                        onNavigateBack = { navController.navigateUp() },
                        onOpenLinear = { url -> openInBrowser(url) }
                    )
                }
            }
        }
    }
}

fun openInBrowser(url: String) {
    // Implement browser opening logic
}
```

### Step 4: Add Menu Item to Dashboard

Add this button to your dashboard/home screen:

```kotlin
// For Customer
Button(onClick = { navController.navigate("issues") }) {
    Icon(Icons.Default.BugReport, contentDescription = null)
    Spacer(Modifier.width(8.dp))
    Text("My Issues")
}

// For Vendor/Employee
Button(onClick = { navController.navigate("issues") }) {
    Icon(Icons.Default.Assignment, contentDescription = null)
    Spacer(Modifier.width(8.dp))
    Text("Issue Tracking")
}
```

### Step 5: Update Backend URL

Update the base URL in `ApiClient.kt` to point to your backend:

```kotlin
private const val BASE_URL = "https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/"
```

Or for local testing:
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/" // Android emulator
// OR
private const val BASE_URL = "http://192.168.x.x:8000/api/" // Physical device
```

### Step 6: Test the Backend

Test backend endpoints first:

```bash
# Test customer create issue
curl -X POST http://localhost:8000/api/client/issues/raise/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": 1,
    "title": "Test Issue",
    "description": "This is a test issue",
    "priority": "high",
    "category": "technical"
  }'

# Test vendor get all issues
curl -X GET http://localhost:8000/api/issues/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### Step 7: Add Internet Permission

Make sure `AndroidManifest.xml` has:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### Step 8: Handle Linear URL Opening

Add to your activity or create utility function:

```kotlin
fun Context.openUrl(url: String) {
    try {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        startActivity(intent)
    } catch (e: Exception) {
        Toast.makeText(this, "Cannot open URL", Toast.LENGTH_SHORT).show()
    }
}
```

## 🎨 Customization

### Change Colors

The screens use Material 3 theme colors. Customize in your theme:

```kotlin
MaterialTheme(
    colorScheme = lightColorScheme(
        primary = Color(0xFF6750A4),
        primaryContainer = Color(0xFFEADDFF),
        // ... other colors
    )
) {
    // Your app content
}
```

### Add More Filters

In `VendorIssuesListScreen.kt`, add more filter options:

```kotlin
// Add category filter
FilterChip(
    selected = categoryFilter == "technical",
    onClick = { viewModel.setCategoryFilter("technical") },
    label = { Text("Technical") }
)
```

### Add Offline Support

Implement Room database caching:

```kotlin
@Entity(tableName = "issues")
data class IssueEntity(
    @PrimaryKey val id: Int,
    val title: String,
    // ... other fields
)
```

## 🐛 Troubleshooting

### Issues Not Loading
1. Check backend is running
2. Verify BASE_URL is correct
3. Check authorization token is valid
4. Look at Logcat for network errors

### Linear Not Syncing
1. Verify LINEAR_API_KEY in backend `.env`
2. Check organization has `linear_team_id` set
3. Review backend logs: `tail -f shared-backend/logs/django.log`

### Permission Errors
1. Verify user role in backend
2. Check if customer/vendor profile exists
3. Ensure auth token is being sent correctly

## 📱 Testing Checklist

- [ ] Customer can create issues
- [ ] Customer sees only their issues
- [ ] Vendor sees all customer issues
- [ ] Vendor can update status
- [ ] Vendor can update priority
- [ ] Vendor can resolve issues
- [ ] Linear link opens correctly
- [ ] Filters work properly
- [ ] Comments appear in issue detail
- [ ] Error messages display correctly
- [ ] Loading states show properly

## 🎯 Next Features to Add

1. **Push Notifications**: Notify customers when issue status changes
2. **File Attachments**: Allow uploading images/documents
3. **Real-time Updates**: WebSocket for live status changes
4. **Offline Mode**: Cache issues with Room
5. **Search**: Add search bar to filter issues
6. **Sorting**: Sort by date, priority, status
7. **Issue Templates**: Pre-filled forms for common issues
8. **Analytics**: Dashboard showing issue metrics

## 📞 Support

If you encounter issues:
1. Check backend logs
2. Review Logcat output
3. Test API endpoints with Postman
4. Verify Linear API key is valid
5. Check organization settings in admin panel

## 🔐 Security Notes

- Never commit API keys or tokens
- Use environment variables for sensitive data
- Implement proper token refresh mechanism
- Add request/response encryption for production
- Implement rate limiting on backend

## ✅ Summary

You now have a complete Linear-integrated issue tracking system where:
- **Customers** can raise and track issues
- **Vendors/Employees** can manage and resolve issues
- Everything syncs automatically with Linear
- Clean, Material 3 UI that follows Android best practices

Start by adding the navigation routes and testing with your backend!

