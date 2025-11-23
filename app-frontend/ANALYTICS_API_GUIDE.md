# Analytics API Quick Reference

## Usage Guide

### 1. Dashboard Statistics

```kotlin
// In your repository or ViewModel
val repository = DashboardStatsRepository()

// Get dashboard stats
val result = repository.getDashboardStats(
    startDate = "2025-01-01",  // Optional
    endDate = "2025-12-31"      // Optional
)

when (result) {
    is NetworkResult.Success -> {
        val stats = result.data
        println("Total Leads: ${stats.totalLeads}")
        println("Total Revenue: ${stats.totalRevenue}")
        println("Conversion Rate: ${stats.conversionRate}")
    }
    is NetworkResult.Error -> {
        println("Error: ${result.message}")
    }
    is NetworkResult.Loading -> {
        // Show loading indicator
    }
}
```

### 2. Sales Funnel

```kotlin
val result = repository.getSalesFunnel(
    startDate = "2025-01-01",
    endDate = "2025-12-31"
)

when (result) {
    is NetworkResult.Success -> {
        result.data.funnelData.forEach { stage ->
            println("${stage.stage}: ${stage.count} (${stage.value})")
        }
    }
    // Handle error...
}
```

### 3. Revenue by Period

```kotlin
val result = repository.getRevenueByPeriod(
    period = "month",  // day, week, month, quarter, year
    startDate = "2025-01-01",
    endDate = "2025-12-31"
)

when (result) {
    is NetworkResult.Success -> {
        result.data.revenueData.forEach { data ->
            println("${data.period}: $${data.revenue}")
        }
    }
    // Handle error...
}
```

### 4. Employee Performance

```kotlin
// All employees
val result = repository.getEmployeePerformance(
    startDate = "2025-01-01",
    endDate = "2025-12-31"
)

// Specific employee
val result = repository.getEmployeePerformance(
    employeeId = 123,
    startDate = "2025-01-01",
    endDate = "2025-12-31"
)

when (result) {
    is NetworkResult.Success -> {
        result.data.performanceData.forEach { perf ->
            println("${perf.employeeName}: ${perf.totalRevenue}")
            println("Conversion: ${perf.conversionRate}%")
        }
    }
    // Handle error...
}
```

### 5. Top Performers

```kotlin
val result = repository.getTopPerformers(
    metric = "revenue",  // revenue, deals, leads, conversion
    limit = 10,
    startDate = "2025-01-01",
    endDate = "2025-12-31"
)

when (result) {
    is NetworkResult.Success -> {
        result.data.topPerformers.forEach { performer ->
            println("${performer.rank}. ${performer.employeeName}: ${performer.value}")
        }
    }
    // Handle error...
}
```

### 6. Quick Stats

```kotlin
val result = repository.getQuickStats()

when (result) {
    is NetworkResult.Success -> {
        val stats = result.data
        println("Today: ${stats.todayLeads} leads, $${stats.todayRevenue}")
        println("This Week: ${stats.thisWeekLeads} leads, $${stats.thisWeekRevenue}")
        println("This Month: ${stats.thisMonthLeads} leads, $${stats.thisMonthRevenue}")
    }
    // Handle error...
}
```

---

## Model Classes Reference

### DashboardStats
```kotlin
data class DashboardStats(
    val totalLeads: Int,
    val totalDeals: Int,
    val totalCustomers: Int,
    val totalRevenue: Double,
    val activeDealsValue: Double,
    val wonDealsCount: Int,
    val lostDealsCount: Int,
    val conversionRate: Double,
    val recentActivities: List<Activity>?
)
```

### SalesFunnelData
```kotlin
data class SalesFunnelData(
    val stage: String,
    val count: Int,
    val value: Double,
    val conversionRate: Double?
)
```

### RevenueData
```kotlin
data class RevenueData(
    val period: String,
    val revenue: Double,
    val dealsCount: Int,
    val averageDealValue: Double?
)
```

### EmployeePerformance
```kotlin
data class EmployeePerformance(
    val employeeId: Int,
    val employeeName: String,
    val totalLeads: Int,
    val convertedLeads: Int,
    val totalDeals: Int,
    val wonDeals: Int,
    val totalRevenue: Double,
    val conversionRate: Double,
    val averageDealValue: Double?
)
```

### TopPerformer
```kotlin
data class TopPerformer(
    val employeeId: Int,
    val employeeName: String,
    val metric: String,
    val value: Double,
    val rank: Int
)
```

### QuickStats
```kotlin
data class QuickStats(
    val todayLeads: Int,
    val todayDeals: Int,
    val todayRevenue: Double,
    val thisWeekLeads: Int,
    val thisWeekDeals: Int,
    val thisWeekRevenue: Double,
    val thisMonthLeads: Int,
    val thisMonthDeals: Int,
    val thisMonthRevenue: Double
)
```

---

## ViewModel Integration Example

```kotlin
class DashboardViewModel : ViewModel() {
    private val repository = DashboardStatsRepository()
    
    private val _dashboardStats = MutableStateFlow<NetworkResult<DashboardStats>>(NetworkResult.Loading())
    val dashboardStats: StateFlow<NetworkResult<DashboardStats>> = _dashboardStats
    
    private val _quickStats = MutableStateFlow<NetworkResult<QuickStats>>(NetworkResult.Loading())
    val quickStats: StateFlow<NetworkResult<QuickStats>> = _quickStats
    
    fun loadDashboardStats() {
        viewModelScope.launch {
            _dashboardStats.value = NetworkResult.Loading()
            _dashboardStats.value = repository.getDashboardStats()
        }
    }
    
    fun loadQuickStats() {
        viewModelScope.launch {
            _quickStats.value = NetworkResult.Loading()
            _quickStats.value = repository.getQuickStats()
        }
    }
}
```

---

## Composable UI Example

```kotlin
@Composable
fun DashboardScreen(viewModel: DashboardViewModel) {
    val dashboardStats by viewModel.dashboardStats.collectAsState()
    val quickStats by viewModel.quickStats.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadDashboardStats()
        viewModel.loadQuickStats()
    }
    
    Column {
        when (val stats = quickStats) {
            is NetworkResult.Success -> {
                QuickStatsCard(stats.data)
            }
            is NetworkResult.Error -> {
                ErrorMessage(stats.message)
            }
            is NetworkResult.Loading -> {
                LoadingIndicator()
            }
        }
        
        when (val stats = dashboardStats) {
            is NetworkResult.Success -> {
                DashboardStatsCard(stats.data)
            }
            is NetworkResult.Error -> {
                ErrorMessage(stats.message)
            }
            is NetworkResult.Loading -> {
                LoadingIndicator()
            }
        }
    }
}
```

---

## API Endpoints

All analytics endpoints are prefixed with `/api/analytics/`

| Method | Endpoint | Parameters | Response |
|--------|----------|------------|----------|
| GET | `/dashboard/` | start_date?, end_date? | DashboardStats |
| GET | `/sales_funnel/` | start_date?, end_date? | SalesFunnelResponse |
| GET | `/revenue_by_period/` | period, start_date?, end_date? | RevenueByPeriodResponse |
| GET | `/employee_performance/` | start_date?, end_date?, employee_id? | EmployeePerformanceResponse |
| GET | `/top_performers/` | metric, limit, start_date?, end_date? | TopPerformersResponse |
| GET | `/quick_stats/` | - | QuickStats |

---

## Date Format

All date parameters should be in ISO 8601 format: `YYYY-MM-DD`

Example: `"2025-11-23"`

---

## Error Handling

Always handle three states:
1. **Loading** - Show progress indicator
2. **Success** - Display data
3. **Error** - Show error message with retry option

```kotlin
when (result) {
    is NetworkResult.Loading -> {
        CircularProgressIndicator()
    }
    is NetworkResult.Success -> {
        // Display your data
    }
    is NetworkResult.Error -> {
        Text("Error: ${result.message}")
        Button(onClick = { retry() }) {
            Text("Retry")
        }
    }
}
```

