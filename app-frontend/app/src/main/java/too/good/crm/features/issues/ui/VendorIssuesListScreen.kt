package too.good.crm.features.issues.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.accompanist.swiperefresh.SwipeRefresh
import com.google.accompanist.swiperefresh.rememberSwipeRefreshState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import too.good.crm.data.model.Issue
import too.good.crm.data.pusher.PusherService
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.issues.viewmodel.IssueViewModel
import too.good.crm.features.issues.viewmodel.IssueUiState
import android.content.Context
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.DisposableEffect

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VendorIssuesListScreen(
    onNavigateToDetail: (Int) -> Unit,
    onNavigateBack: () -> Unit,
    viewModel: IssueViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val statusFilter by viewModel.statusFilter.collectAsState()
    val priorityFilter by viewModel.priorityFilter.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val coroutineScope = rememberCoroutineScope()

    // Initialize Pusher and subscribe to real-time updates
    LaunchedEffect(Unit) {
        val userId = authRepository.getUserId()
        if (userId > 0) {
            PusherService.initialize(userId)
            
            // Subscribe to user's private channel for issue updates
            val channelName = "private-user-$userId"
            PusherService.subscribeToChannel(channelName) { eventName, data ->
                when (eventName) {
                    "issue-created", "issue-updated", "issue-status-changed" -> {
                        // Reload issues when any issue event is received
                        viewModel.loadAllIssues()
                    }
                }
            }
        }
        
        // Load issues when screen opens
        viewModel.loadAllIssues()
    }
    
    // Cleanup Pusher subscription when screen is disposed
    DisposableEffect(Unit) {
        onDispose {
            val userId = authRepository.getUserId()
            if (userId > 0) {
                PusherService.unsubscribe("private-user-$userId")
            }
        }
    }

    // Handle pull-to-refresh
    suspend fun refresh() {
        isRefreshing = true
        viewModel.loadAllIssues()
        delay(1000) // Show refresh indicator for at least 1 second
        isRefreshing = false
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Issue Tracking") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            coroutineScope.launch {
                                refresh()
                            }
                        }
                    ) {
                        Icon(Icons.Default.Refresh, "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        val swipeRefreshState = rememberSwipeRefreshState(isRefreshing)

        SwipeRefresh(
            state = swipeRefreshState,
            onRefresh = {
                coroutineScope.launch {
                    refresh()
                }
            },
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
            // Compact Stats Cards
            val state = uiState
            if (state is IssueUiState.Success) {
                val totalCount = state.issues.size
                val openCount = state.issues.count { it.status == "open" }
                val inProgressCount = state.issues.count { it.status == "in_progress" }
                val resolvedCount = state.issues.count { it.status == "resolved" }
                
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = too.good.crm.ui.theme.DesignTokens.Spacing.Space4, vertical = too.good.crm.ui.theme.DesignTokens.Spacing.Space2),
                    horizontalArrangement = Arrangement.spacedBy(too.good.crm.ui.theme.DesignTokens.Spacing.Space3)
                ) {
                    IssueStatCard(
                        modifier = Modifier.weight(1f),
                        title = "Total",
                        value = totalCount.toString(),
                        color = too.good.crm.ui.theme.DesignTokens.Colors.Primary
                    )
                    IssueStatCard(
                        modifier = Modifier.weight(1f),
                        title = "Open",
                        value = openCount.toString(),
                        color = too.good.crm.ui.theme.DesignTokens.Colors.Info
                    )
                    IssueStatCard(
                        modifier = Modifier.weight(1f),
                        title = "In Progress",
                        value = inProgressCount.toString(),
                        color = too.good.crm.ui.theme.DesignTokens.Colors.Warning
                    )
                    IssueStatCard(
                        modifier = Modifier.weight(1f),
                        title = "Resolved",
                        value = resolvedCount.toString(),
                        color = too.good.crm.ui.theme.DesignTokens.Colors.Success
                    )
                }
            }
            
            // Filters
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(too.good.crm.ui.theme.DesignTokens.Spacing.Space4),
                elevation = CardDefaults.cardElevation(defaultElevation = too.good.crm.ui.theme.DesignTokens.Elevation.Level1),
                colors = CardDefaults.cardColors(containerColor = too.good.crm.ui.theme.DesignTokens.Colors.White),
                shape = MaterialTheme.shapes.large,
                border = androidx.compose.foundation.BorderStroke(1.dp, too.good.crm.ui.theme.DesignTokens.Colors.OutlineVariant)
            ) {
                Column(modifier = Modifier.padding(too.good.crm.ui.theme.DesignTokens.Spacing.Space4)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.FilterList,
                            contentDescription = "Filters",
                            tint = too.good.crm.ui.theme.DesignTokens.Colors.Primary
                        )
                        Spacer(modifier = Modifier.width(too.good.crm.ui.theme.DesignTokens.Spacing.Space2))
                        Text(
                            text = "Filters",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = too.good.crm.ui.theme.DesignTokens.Typography.FontWeightBold,
                            color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurface
                        )
                    }

                    Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space3))

                    // Status Filter
                    Text(
                        text = "Status",
                        style = MaterialTheme.typography.labelMedium,
                        color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurfaceVariant,
                        fontWeight = too.good.crm.ui.theme.DesignTokens.Typography.FontWeightSemiBold
                    )
                    Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space2))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(too.good.crm.ui.theme.DesignTokens.Spacing.Space2)
                    ) {
                        item {
                            FilterChip(
                                selected = statusFilter == null,
                                onClick = { viewModel.setStatusFilter(null) },
                                label = { Text("All") }
                            )
                        }
                        items(listOf("open", "in_progress", "resolved", "closed")) { status ->
                            FilterChip(
                                selected = statusFilter == status,
                                onClick = { viewModel.setStatusFilter(status) },
                                label = { Text(status.replace("_", " ").capitalizeFirstChar()) }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space3))

                    // Priority Filter
                    Text(
                        text = "Priority",
                        style = MaterialTheme.typography.labelMedium,
                        color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurfaceVariant,
                        fontWeight = too.good.crm.ui.theme.DesignTokens.Typography.FontWeightSemiBold
                    )
                    Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space2))
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(too.good.crm.ui.theme.DesignTokens.Spacing.Space2)
                    ) {
                        item {
                            FilterChip(
                                selected = priorityFilter == null,
                                onClick = { viewModel.setPriorityFilter(null) },
                                label = { Text("All") }
                            )
                        }
                        items(listOf("urgent", "high", "medium", "low")) { priority ->
                            FilterChip(
                                selected = priorityFilter == priority,
                                onClick = { viewModel.setPriorityFilter(priority) },
                                label = { Text(priority.capitalizeFirstChar()) }
                            )
                        }
                    }
                }
            }

            // Issues List
            Box(
                modifier = Modifier.fillMaxSize()
            ) {
                when (val state = uiState) {
                    is IssueUiState.Loading -> {
                        CircularProgressIndicator(
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }
                    is IssueUiState.Success -> {
                        if (state.issues.isEmpty()) {
                            EmptyIssuesVendorView(
                                modifier = Modifier.align(Alignment.Center)
                            )
                        } else {
                            LazyColumn(
                                contentPadding = PaddingValues(horizontal = too.good.crm.ui.theme.DesignTokens.Spacing.Space4, vertical = too.good.crm.ui.theme.DesignTokens.Spacing.Space2),
                                verticalArrangement = Arrangement.spacedBy(too.good.crm.ui.theme.DesignTokens.Spacing.Space3)
                            ) {
                                items(state.issues) { issue ->
                                    VendorIssueCard(
                                        issue = issue,
                                        onClick = { onNavigateToDetail(issue.id) }
                                    )
                                }
                            }
                        }
                    }
                    is IssueUiState.Error -> {
                        ErrorView(
                            message = state.message,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }
                }
            }
            }
        }
    }
}

@Composable
fun VendorIssueCard(
    issue: Issue,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = too.good.crm.ui.theme.DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = too.good.crm.ui.theme.DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, too.good.crm.ui.theme.DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier.padding(too.good.crm.ui.theme.DesignTokens.Spacing.Space4)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = issue.issueNumber,
                    style = MaterialTheme.typography.labelMedium,
                    color = too.good.crm.ui.theme.DesignTokens.Colors.Primary,
                    fontWeight = too.good.crm.ui.theme.DesignTokens.Typography.FontWeightBold
                )
                StatusChip(status = issue.status)
            }

            Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space2))

            Text(
                text = issue.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = too.good.crm.ui.theme.DesignTokens.Typography.FontWeightBold,
                color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurface,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space2))

            Text(
                text = issue.description,
                style = MaterialTheme.typography.bodyMedium,
                color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space3))

            // Customer info
            issue.raisedByCustomerName?.let { customerName ->
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = too.good.crm.ui.theme.DesignTokens.Colors.SurfaceVariant,
                        shape = MaterialTheme.shapes.small
                    ) {
                        Text(
                            text = "Customer: $customerName",
                            modifier = Modifier.padding(horizontal = too.good.crm.ui.theme.DesignTokens.Spacing.Space2, vertical = too.good.crm.ui.theme.DesignTokens.Spacing.Space1),
                            style = MaterialTheme.typography.labelSmall,
                            color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
                Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space2))
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                PriorityChip(priority = issue.priority)

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    issue.assignedToName?.let { assignee ->
                        Surface(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = "Assigned: $assignee",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }

                    if (issue.syncedToLinear) {
                        Surface(
                            color = MaterialTheme.colorScheme.secondaryContainer,
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = "Linear",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSecondaryContainer
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyIssuesVendorView(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "No issues found",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Customer-reported issues will appear here",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun IssueStatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: androidx.compose.ui.graphics.Color
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = too.good.crm.ui.theme.DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = too.good.crm.ui.theme.DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, too.good.crm.ui.theme.DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(too.good.crm.ui.theme.DesignTokens.Spacing.Space3),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = too.good.crm.ui.theme.DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(too.good.crm.ui.theme.DesignTokens.Spacing.Space1))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = too.good.crm.ui.theme.DesignTokens.Typography.FontWeightBold,
                color = color,
                fontSize = 20.sp
            )
        }
    }
}


