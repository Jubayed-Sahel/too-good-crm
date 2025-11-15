# Linear Issue Tracking Integration - Mobile App

## Overview
Complete Linear integration for issue tracking in the mobile app with role-based access control.

## Features

### Customer Profile
- ✅ **Can raise issues** about organizations/vendors
- ✅ View their own issues
- ✅ Add comments to their issues
- ✅ Track issue status and updates
- ✅ See Linear sync status
- ✅ Open issues directly in Linear

### Vendor/Employee Profile
- ✅ **Cannot raise issues** (read-only for creation)
- ✅ View all customer-raised issues
- ✅ Filter issues by status and priority
- ✅ Update issue status (open, in_progress, resolved, closed)
- ✅ Update issue priority (urgent, high, medium, low)
- ✅ Assign issues to team members
- ✅ Resolve issues with resolution notes
- ✅ View customer details who raised the issue
- ✅ Access Linear for detailed tracking

## File Structure

```
app-frontend/app/src/main/java/too/good/crm/
├── data/
│   ├── api/
│   │   └── IssueApiService.kt          # Retrofit API service
│   ├── model/
│   │   └── Issue.kt                     # Data models
│   └── repository/
│       └── IssueRepository.kt           # Repository layer
└── features/
    └── issues/
        ├── viewmodel/
        │   └── IssueViewModel.kt        # Shared ViewModel
        └── ui/
            ├── CustomerCreateIssueScreen.kt      # Customer: Create issue
            ├── CustomerIssuesListScreen.kt       # Customer: View issues
            ├── CustomerIssueDetailScreen.kt      # Customer: Issue details
            ├── VendorIssuesListScreen.kt         # Vendor: View all issues
            └── VendorIssueDetailScreen.kt        # Vendor: Manage issues
```

## API Endpoints

### Customer Endpoints
```
POST   /api/client/issues/raise/           # Create new issue
GET    /api/client/issues/{id}/            # Get issue details
POST   /api/client/issues/{id}/comment/    # Add comment
```

### Vendor/Employee Endpoints
```
GET    /api/issues/                        # Get all issues (with filters)
GET    /api/issues/{id}/                   # Get issue details
PATCH  /api/issues/{id}/                   # Update issue (status, priority, assign)
POST   /api/issues/resolve/{id}/           # Resolve issue
```

## Backend Linear Integration

The backend automatically:
1. Creates Linear issues when customers raise issues
2. Syncs issue data with Linear
3. Stores Linear issue ID and URL
4. Allows vendor/employee updates to reflect in Linear
5. Uses organization's Linear team ID for routing

## Usage Flow

### Customer Flow
1. Customer opens "My Issues" screen
2. Clicks FAB to create new issue
3. Fills in title, description, priority, category
4. Submits issue → Auto-synced to Linear
5. Views issue list with status updates
6. Opens issue details to see progress
7. Can add comments and open in Linear

### Vendor/Employee Flow
1. Vendor opens "Issue Tracking" screen
2. Sees all customer-raised issues
3. Filters by status (open/in_progress/resolved/closed)
4. Filters by priority (urgent/high/medium/low)
5. Opens issue to see customer details
6. Updates status via dialog
7. Changes priority if needed
8. Marks as resolved with notes
9. Customer sees updates in real-time

## Navigation Integration

Add to your navigation graph:

```kotlin
// Customer routes
composable("issues/customer") { 
    CustomerIssuesListScreen(
        organizationId = currentOrgId,
        onNavigateToCreate = { navController.navigate("issues/create") },
        onNavigateToDetail = { id -> navController.navigate("issues/$id") },
        onNavigateBack = { navController.popBackStack() }
    )
}

composable("issues/create") {
    CustomerCreateIssueScreen(
        organizationId = currentOrgId,
        onNavigateBack = { navController.popBackStack() }
    )
}

composable("issues/{issueId}") { backStackEntry ->
    val issueId = backStackEntry.arguments?.getString("issueId")?.toIntOrNull()
    issueId?.let {
        CustomerIssueDetailScreen(
            issueId = it,
            onNavigateBack = { navController.popBackStack() },
            onOpenLinear = { url -> /* Open browser */ }
        )
    }
}

// Vendor routes
composable("issues/vendor") {
    VendorIssuesListScreen(
        onNavigateToDetail = { id -> navController.navigate("issues/vendor/$id") },
        onNavigateBack = { navController.popBackStack() }
    )
}

composable("issues/vendor/{issueId}") { backStackEntry ->
    val issueId = backStackEntry.arguments?.getString("issueId")?.toIntOrNull()
    issueId?.let {
        VendorIssueDetailScreen(
            issueId = it,
            onNavigateBack = { navController.popBackStack() },
            onOpenLinear = { url -> /* Open browser */ }
        )
    }
}
```

## Linear Configuration

Ensure your `.env` file has:
```env
LINEAR_API_KEY=lin_api_xxxxx
LINEAR_WEBHOOK_SECRET=lin_wh_xxxxx
```

## Dependencies Required

Add to `build.gradle.kts`:
```kotlin
dependencies {
    // Retrofit for API calls
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
    
    // Material 3
    implementation("androidx.compose.material3:material3:1.1.2")
}
```

## Testing

Test the following scenarios:

1. **Customer creates issue**: Should auto-sync to Linear
2. **Customer views issues**: Should only see their own
3. **Vendor views issues**: Should see all customer issues
4. **Vendor updates status**: Should update in backend and Linear
5. **Customer sees status update**: Should reflect vendor changes
6. **Linear link**: Should open in browser
7. **Filters work**: Status and priority filtering functional
8. **Comments**: Customer can add, visible in description

## Security Notes

- Customers can only view/edit their own issues
- Vendors/Employees can view all but not create
- API validates user roles before allowing actions
- Linear API key stored securely in backend
- No Linear credentials exposed to mobile app

## Next Steps

1. Add navigation entries in your app's NavHost
2. Configure Retrofit with base URL and auth token
3. Test with real Linear workspace
4. Add push notifications for issue updates
5. Implement offline caching with Room database
6. Add file attachments to issues
7. Implement real-time updates with WebSocket

## Support

For issues or questions:
- Check Linear API documentation
- Review backend logs for sync errors
- Test API endpoints with Postman first
- Verify Linear team ID is configured correctly

