# Quick Integration Guide - Sales Pipeline Screen

## Step 1: Add Navigation Route

### In your main navigation file (e.g., `Navigation.kt` or `NavGraph.kt`):

```kotlin
// Add to your navigation composable block
composable("sales-pipeline") {
    SalesPipelineScreen(
        onNavigate = { route -> navController.navigate(route) },
        onBack = { navController.popBackStack() }
    )
}
```

## Step 2: Add Menu Item in Drawer

### Update your navigation drawer or bottom navigation:

```kotlin
// In your drawer items list
val drawerItems = listOf(
    DrawerItem("Dashboard", Icons.Default.Dashboard, "dashboard"),
    DrawerItem("Sales Pipeline", Icons.Default.TrendingUp, "sales-pipeline"), // NEW
    DrawerItem("Leads", Icons.Default.People, "leads"),
    DrawerItem("Customers", Icons.Default.Business, "customers"),
    // ... other items
)
```

## Step 3: Update Imports

### Add these imports to your navigation file:

```kotlin
import too.good.crm.features.sales.SalesPipelineScreen
```

## Step 4: Test the Integration

### Navigate to the screen:

```kotlin
// From any screen
Button(onClick = { navController.navigate("sales-pipeline") }) {
    Icon(Icons.Default.TrendingUp, contentDescription = null)
    Spacer(modifier = Modifier.width(8.dp))
    Text("Open Sales Pipeline")
}
```

## Step 5: Verify Backend APIs

Ensure these endpoints are working:

```bash
# Test deals endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://your-api.com/api/deals/

# Test leads endpoint  
curl -H "Authorization: Bearer YOUR_TOKEN" http://your-api.com/api/leads/

# Test pipelines endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://your-api.com/api/pipelines/

# Test lead conversion
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://your-api.com/api/leads/1/convert/
```

## Step 6: Replace Old Sales Screen (Optional)

If you want to replace the existing `SalesScreen.kt`:

### Option A: Keep Both
```kotlin
composable("sales") { SalesScreen(...) }           // Old list view
composable("sales-pipeline") { SalesPipelineScreen(...) } // New pipeline view
```

### Option B: Replace Old
```kotlin
composable("sales") { SalesPipelineScreen(...) }  // Replace old with new
```

## Step 7: Add Quick Access from Dashboard

### Add a card to your dashboard:

```kotlin
@Composable
fun DashboardQuickActions() {
    Card(
        onClick = { onNavigate("sales-pipeline") },
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.TrendingUp,
                contentDescription = null,
                modifier = Modifier.size(40.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    "Sales Pipeline",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "Manage your deals and leads",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
```

## Troubleshooting

### Issue: "Unresolved reference: SalesPipelineScreen"
**Solution**: Make sure the package name matches your project structure:
```kotlin
package too.good.crm.features.sales  // Adjust if different
```

### Issue: Navigation doesn't work
**Solution**: Verify your NavHost setup includes the route:
```kotlin
NavHost(
    navController = navController,
    startDestination = "dashboard"
) {
    // ... other routes
    composable("sales-pipeline") { SalesPipelineScreen(...) }
}
```

### Issue: Data doesn't load
**Solution**: Check:
1. API base URL is correct
2. Authentication token is valid
3. Network permissions in AndroidManifest.xml
4. Repository instances are initialized

### Issue: Drag and drop doesn't work
**Solution**: 
1. Ensure you're on a device (not emulator may have issues)
2. Try longer press (500ms default)
3. Check that parent views don't consume touch events

## Complete Navigation Example

```kotlin
// NavGraph.kt
@Composable
fun AppNavGraph(
    navController: NavHostController,
    startDestination: String = "dashboard"
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable("dashboard") {
            DashboardScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }
        
        composable("sales-pipeline") {
            SalesPipelineScreen(
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
            )
        }
        
        composable("leads/{leadId}") { backStackEntry ->
            val leadId = backStackEntry.arguments?.getString("leadId")?.toIntOrNull()
            LeadDetailScreen(
                leadId = leadId,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
            )
        }
        
        composable("deals/{dealId}") { backStackEntry ->
            val dealId = backStackEntry.arguments?.getString("dealId")?.toIntOrNull()
            DealDetailScreen(
                dealId = dealId,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
            )
        }
        
        composable("customers/{customerId}") { backStackEntry ->
            val customerId = backStackEntry.arguments?.getString("customerId")?.toIntOrNull()
            CustomerDetailScreen(
                customerId = customerId,
                onNavigate = { route -> navController.navigate(route) },
                onBack = { navController.popBackStack() }
            )
        }
    }
}
```

## Testing Checklist

After integration, test these scenarios:

- [ ] Navigate to sales pipeline from dashboard
- [ ] Navigate to sales pipeline from drawer menu
- [ ] Pipeline board loads without errors
- [ ] Can scroll horizontally between stages
- [ ] Long press initiates drag on a card
- [ ] Drop card on different stage moves it
- [ ] Lead converts when dropped on "Closed Won"
- [ ] Click on card navigates to detail screen
- [ ] Search filters items correctly
- [ ] Pull to refresh reloads data
- [ ] Back button returns to previous screen
- [ ] Snackbar shows for conversions with working "View" action

## Done! 🎉

Your Sales Pipeline screen is now integrated and ready to use.

For detailed documentation, see: `ANDROID_SALES_PIPELINE_IMPLEMENTATION.md`
