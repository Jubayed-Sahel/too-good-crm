# 🔄 Migration Guide - Sample Data → Real API

## Overview

This guide shows **exactly** how to migrate each screen from sample data to real API calls.  
Estimated time: **2-3 hours total** for all screens.

---

## ✅ Pre-Migration Checklist

- [x] Backend running on `0.0.0.0:8000`
- [x] Can access `http://10.0.2.2:8000/api/` from emulator
- [x] User is authenticated (token set)
- [x] All ViewModels created
- [x] All repositories created
- [x] All API services created

---

## 📝 Screen Migration Priority

| # | Screen | Time | Difficulty | Status |
|---|--------|------|------------|--------|
| 1 | LeadsScreen | 20min | ⭐ Easy | ⬜ Pending |
| 2 | DealsScreen | 25min | ⭐⭐ Medium | ⬜ Pending |
| 3 | ActivitiesScreen | 20min | ⭐ Easy | ⬜ Pending |
| 4 | SalesScreen | 15min | ⭐ Easy | ⬜ Pending |
| 5 | MessagesScreen | 40min | ⭐⭐⭐ Hard | ⬜ Pending |

---

## 1️⃣ LeadsScreen Migration (20 minutes)

### Current Code Location
`app/src/main/java/too/good/crm/features/leads/LeadsScreen.kt`

### Step 1: Add ViewModel Import
```kotlin
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import too.good.crm.features.leads.LeadsViewModel
import too.good.crm.ui.components.*
```

### Step 2: Replace Sample Data

**Find this:**
```kotlin
@Composable
fun LeadsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    // Sample data
    val leads = remember { LeadSampleData.getLeads() }
```

**Replace with:**
```kotlin
@Composable
fun LeadsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: LeadsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
```

### Step 3: Add Loading State

**Add before content:**
```kotlin
// Loading state
if (uiState.isLoading && uiState.leads.isEmpty()) {
    LoadingScreen(message = "Loading leads...")
    return
}

// Error state
if (uiState.error != null) {
    ErrorScreen(
        errorType = ErrorType.NETWORK,
        message = uiState.error!!,
        onRetry = { viewModel.refresh() }
    )
    return
}
```

### Step 4: Update List

**Find:**
```kotlin
items(leads) { lead ->
    LeadCard(lead)
}
```

**Replace with:**
```kotlin
items(uiState.leads) { lead ->
    LeadCard(lead)
}
```

### Step 5: Add Pull-to-Refresh

**Wrap LazyColumn with:**
```kotlin
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState

SwipeRefresh(
    state = rememberSwipeRefreshState(uiState.isRefreshing),
    onRefresh = { viewModel.refresh() }
) {
    LazyColumn {
        // ... items
    }
}
```

### Step 6: Add Search (Optional)

```kotlin
var searchQuery by remember { mutableStateOf("") }

SearchBar(
    query = searchQuery,
    onQueryChange = { searchQuery = it },
    onSearch = { viewModel.searchLeads(it) }
)
```

### ✅ Test LeadsScreen

1. Run app
2. Navigate to Leads
3. Should see "Loading leads..."
4. Then see actual data from backend
5. Pull down to refresh
6. Should see updated data

---

## 2️⃣ DealsScreen Migration (25 minutes)

### Current Code Location
`app/src/main/java/too/good/crm/features/deals/DealsScreen.kt`

### Step 1: Add ViewModel

```kotlin
import too.good.crm.features.deals.DealsViewModel

@Composable
fun DealsScreen(
    onNavigate: (String) -> Unit,
    viewModel: DealsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
```

### Step 2: Replace Sample Data

**Find:**
```kotlin
val deals = remember { DealSampleData.getDeals() }
```

**Replace with:**
```kotlin
val uiState by viewModel.uiState.collectAsState()
```

### Step 3: Add States

```kotlin
when {
    uiState.isLoading && uiState.deals.isEmpty() -> {
        SkeletonList(count = 5, itemHeight = 120.dp)
    }
    uiState.error != null -> {
        ErrorCard(
            message = uiState.error!!,
            onRetry = { viewModel.refresh() }
        )
    }
    uiState.deals.isEmpty() -> {
        EmptyState(
            icon = Icons.Default.TrendingUp,
            message = "No deals yet",
            actionText = "Create Deal",
            onAction = { /* navigate to create */ }
        )
    }
    else -> {
        DealsList(deals = uiState.deals)
    }
}
```

### Step 4: Add Stage Filters

```kotlin
Row(
    modifier = Modifier
        .horizontalScroll(rememberScrollState())
        .padding(horizontal = 16.dp, vertical = 8.dp),
    horizontalArrangement = Arrangement.spacedBy(8.dp)
) {
    FilterChip(
        selected = uiState.selectedStage == null,
        onClick = { viewModel.filterByStage(null) },
        label = { Text("All") }
    )
    uiState.stages.forEach { stage ->
        FilterChip(
            selected = uiState.selectedStage == stage.name,
            onClick = { viewModel.filterByStage(stage.name) },
            label = { Text(stage.name) }
        )
    }
}
```

### Step 5: Add Deal Actions

```kotlin
DealCard(
    deal = deal,
    onClick = { /* navigate to detail */ },
    onWin = { 
        viewModel.winDeal(deal.id) {
            // Show success
        }
    },
    onLose = {
        viewModel.loseDeal(deal.id, null) {
            // Show success
        }
    }
)
```

### ✅ Test DealsScreen

1. Should load deals from API
2. Filter chips should work
3. Pull to refresh should work
4. Win/Lose actions should update

---

## 3️⃣ ActivitiesScreen Migration (20 minutes)

### Current Code Location
`app/src/main/java/too/good/crm/features/activities/ActivitiesScreen.kt`

### Step 1: Add ViewModel

```kotlin
import too.good.crm.features.activities.ActivitiesViewModel

@Composable
fun ActivitiesScreen(
    viewModel: ActivitiesViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
```

### Step 2: Add Tab Bar

```kotlin
var selectedTab by remember { mutableStateOf(0) }

TabRow(selectedTabIndex = selectedTab) {
    Tab(
        selected = selectedTab == 0,
        onClick = { 
            selectedTab = 0
            viewModel.loadActivities()
        },
        text = { Text("All") }
    )
    Tab(
        selected = selectedTab == 1,
        onClick = { 
            selectedTab = 1
            viewModel.loadUpcoming()
        },
        text = { Text("Upcoming") }
    )
    Tab(
        selected = selectedTab == 2,
        onClick = { 
            selectedTab = 2
            viewModel.loadOverdue()
        },
        text = { Text("Overdue") }
    )
}
```

### Step 3: Display Activities

```kotlin
when {
    uiState.isLoading -> LoadingScreen()
    uiState.error != null -> ErrorScreen(message = uiState.error!!)
    else -> {
        LazyColumn {
            items(uiState.activities) { activity ->
                ActivityCard(
                    activity = activity,
                    onComplete = { 
                        viewModel.completeActivity(activity.id) {}
                    }
                )
            }
        }
    }
}
```

### ✅ Test ActivitiesScreen

1. Should load all activities
2. Tabs should switch views
3. Complete button should work

---

## 4️⃣ SalesScreen Migration (15 minutes)

### Current Code Location
`app/src/main/java/too/good/crm/features/sales/SalesScreen.kt`

### Step 1: Add ViewModel

```kotlin
import too.good.crm.features.sales.SalesViewModel

@Composable
fun SalesScreen(
    viewModel: SalesViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
```

### Step 2: Display Stats

```kotlin
if (uiState.isLoading) {
    SkeletonCard(height = 200.dp)
} else {
    uiState.stats?.let { stats ->
        StatisticsCard(
            totalRevenue = stats.totalRevenue,
            totalDeals = stats.totalDeals,
            wonDeals = stats.wonDeals,
            conversionRate = stats.conversionRate
        )
    }
}
```

### Step 3: Add Period Filter

```kotlin
Row {
    listOf("day", "week", "month", "quarter", "year").forEach { period ->
        FilterChip(
            selected = uiState.selectedPeriod == period,
            onClick = { viewModel.changePeriod(period) },
            label = { Text(period.capitalize()) }
        )
    }
}
```

### ✅ Test SalesScreen

1. Should load dashboard stats
2. Period filters should work
3. Stats should update

---

## 5️⃣ MessagesScreen Migration (40 minutes)

### Current Code Location
`app/src/main/java/too/good/crm/features/messages/MessagesScreen.kt`

### Step 1: Add ViewModel

```kotlin
import too.good.crm.features.messages.MessagesViewModel

@Composable
fun MessagesScreen(
    viewModel: MessagesViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
```

### Step 2: Two-Pane Layout

```kotlin
Row {
    // Conversations list (left pane)
    Column(modifier = Modifier.weight(0.4f)) {
        if (uiState.isLoading) {
            SkeletonList(count = 8)
        } else {
            LazyColumn {
                items(uiState.conversations) { conversation ->
                    ConversationItem(
                        conversation = conversation,
                        selected = uiState.selectedConversationId == conversation.id,
                        onClick = {
                            viewModel.loadMessages(conversation.id)
                        }
                    )
                }
            }
        }
    }
    
    // Messages (right pane)
    Column(modifier = Modifier.weight(0.6f)) {
        if (uiState.selectedConversationId != null) {
            MessagesView(
                messages = uiState.messages,
                isLoading = uiState.isLoadingMessages,
                onSendMessage = { content ->
                    viewModel.sendMessage(
                        uiState.selectedConversationId!!,
                        content
                    ) {}
                }
            )
        } else {
            EmptyState(message = "Select a conversation")
        }
    }
}
```

### Step 3: Send Message UI

```kotlin
@Composable
fun MessageInput(
    onSend: (String) -> Unit,
    isSending: Boolean
) {
    var text by remember { mutableStateOf("") }
    
    Row {
        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier.weight(1f),
            placeholder = { Text("Type a message...") }
        )
        IconButton(
            onClick = {
                if (text.isNotBlank()) {
                    onSend(text)
                    text = ""
                }
            },
            enabled = !isSending && text.isNotBlank()
        ) {
            if (isSending) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp))
            } else {
                Icon(Icons.Default.Send, "Send")
            }
        }
    }
}
```

### ✅ Test MessagesScreen

1. Should load conversations
2. Clicking conversation should load messages
3. Sending message should work
4. Should show "Sending..." state

---

## 🗑️ Files to Delete After Migration

Once all screens are migrated and tested:

```bash
# Sample data files (no longer needed)
rm app/src/main/java/too/good/crm/data/sample/LeadSampleData.kt
rm app/src/main/java/too/good/crm/data/sample/DealSampleData.kt
rm app/src/main/java/too/good/crm/data/sample/ActivitySampleData.kt
rm app/src/main/java/too/good/crm/data/sample/MessageSampleData.kt
```

---

## 🐛 Troubleshooting

### Issue: "Unable to resolve host"

**Solution:**
```kotlin
// Check BASE_URL in ApiClient.kt
private const val BASE_URL = "http://10.0.2.2:8000/api/"

// Make sure backend is running on 0.0.0.0:8000
cd shared-backend
python manage.py runserver 0.0.0.0:8000
```

### Issue: "401 Unauthorized"

**Solution:**
```kotlin
// Make sure token is set after login
ApiClient.setAuthToken(token)

// Check token in AuthRepository.kt
```

### Issue: Empty list but no error

**Solution:**
```kotlin
// Check backend has data
curl http://localhost:8000/api/leads/

// Check logs in Android Studio
// Filter by "okhttp" to see network requests
```

### Issue: "JSON parsing error"

**Solution:**
```kotlin
// Data model doesn't match backend
// Check model annotations match backend field names
@SerializedName("created_at") val createdAt: String
```

---

## ✅ Post-Migration Testing

After migrating all screens:

### Manual Testing

- [ ] Open app → Navigate to Leads → Should load
- [ ] Pull to refresh → Should reload
- [ ] Search leads → Should filter
- [ ] Create lead → Should add to list
- [ ] Open Deals → Should load
- [ ] Filter by stage → Should filter
- [ ] Open Messages → Should load
- [ ] Send message → Should appear
- [ ] Open Activities → Should load
- [ ] Complete activity → Should update
- [ ] Open Sales → Should load stats

### Network Testing

- [ ] Turn off WiFi → Should show "No connection" error
- [ ] Turn on WiFi → Retry button should work
- [ ] Slow network → Should show loading states
- [ ] Backend down → Should show "Server error"

### Edge Cases

- [ ] Empty state → Should show "No items" message
- [ ] Large dataset → Should not freeze UI
- [ ] Rapid refreshes → Should not crash
- [ ] Multiple simultaneous calls → Should handle properly

---

## 📊 Migration Checklist

Track your progress:

### Screens
- [ ] LeadsScreen migrated
- [ ] LeadsScreen tested
- [ ] DealsScreen migrated
- [ ] DealsScreen tested
- [ ] ActivitiesScreen migrated
- [ ] ActivitiesScreen tested
- [ ] SalesScreen migrated
- [ ] SalesScreen tested
- [ ] MessagesScreen migrated
- [ ] MessagesScreen tested

### Cleanup
- [ ] Removed sample data files
- [ ] Removed unused imports
- [ ] Updated navigation
- [ ] Tested all flows
- [ ] Fixed all lint errors

### Documentation
- [ ] Read API_INTEGRATION_COMPLETE.md
- [ ] Read API_QUICK_REFERENCE.md
- [ ] Team trained on new architecture

---

## 🎉 Completion

Once all checkboxes are checked:

✅ **All screens migrated to real API**  
✅ **Sample data removed**  
✅ **App fully integrated with backend**  
✅ **Ready for production testing**

**Estimated Total Time:** 2-3 hours

**Congratulations!** 🎊 Your app now uses real backend data!

---

## 📞 Need Help?

**Check these resources:**
1. `API_INTEGRATION_COMPLETE.md` - Full documentation
2. `API_QUICK_REFERENCE.md` - Quick patterns
3. Individual ViewModel files - Usage examples
4. Backend API docs - Endpoint details

**Still stuck?** Check the ViewModel implementation files for complete working examples!

