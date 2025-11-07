package too.good.crm.features.client.issues

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IssuesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<IssueStatus?>(null) }
    val issues = remember { IssueSampleData.getIssues() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredIssues = issues.filter { issue ->
        val matchesSearch = searchQuery.isEmpty() ||
                issue.issueNumber.contains(searchQuery, ignoreCase = true) ||
                issue.title.contains(searchQuery, ignoreCase = true) ||
                issue.vendorName.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || issue.status == filterStatus
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
        title = "Issues",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
            if (newMode == ActiveMode.VENDOR) {
                onNavigate("dashboard")
            } else {
                onNavigate("client-dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onBack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "Issues & Support",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Track and resolve issues with your vendors",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                IssueStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = issues.size.toString(),
                    color = DesignTokens.Colors.Info
                )
                IssueStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Open",
                    value = issues.count { it.status == IssueStatus.OPEN }.toString(),
                    color = DesignTokens.Colors.Error
                )
                IssueStatCard(
                    modifier = Modifier.weight(1f),
                    title = "In Progress",
                    value = issues.count { it.status == IssueStatus.IN_PROGRESS }.toString(),
                    color = DesignTokens.Colors.Warning
                )
                IssueStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Resolved",
                    value = issues.count { it.status == IssueStatus.RESOLVED || it.status == IssueStatus.CLOSED }.toString(),
                    color = DesignTokens.Colors.Success
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search issues...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = DesignTokens.Colors.Info
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Issues List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredIssues) { issue ->
                    IssueCard(issue = issue)
                }
            }
        }
    }
}

@Composable
fun IssueCard(issue: Issue) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Priority Indicator
                    IssuePriorityBadge(priority = issue.priority)
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = issue.issueNumber,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            fontSize = 11.sp
                        )
                        Text(
                            text = issue.title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
                IssueStatusBadge(status = issue.status)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = issue.description,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Store,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = DesignTokens.Colors.Info
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = issue.vendorName,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 12.sp
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = issue.createdDate,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
fun IssuePriorityBadge(priority: IssuePriority) {
    val color = when (priority) {
        IssuePriority.LOW -> DesignTokens.Colors.Success
        IssuePriority.MEDIUM -> DesignTokens.Colors.Info
        IssuePriority.HIGH -> DesignTokens.Colors.Warning
        IssuePriority.URGENT -> DesignTokens.Colors.Error
    }

    Box(
        modifier = Modifier
            .size(8.dp, 40.dp)
            .background(color, RoundedCornerShape(4.dp))
    )
}

@Composable
fun IssueStatusBadge(status: IssueStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        IssueStatus.OPEN -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Open"
        )
        IssueStatus.IN_PROGRESS -> Triple(
            DesignTokens.Colors.Warning.copy(alpha = 0.1f),
            DesignTokens.Colors.Warning,
            "In Progress"
        )
        IssueStatus.RESOLVED -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Resolved"
        )
        IssueStatus.CLOSED -> Triple(
            DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f),
            DesignTokens.Colors.OnSurfaceVariant,
            "Closed"
        )
    }

    Surface(
        shape = RoundedCornerShape(6.dp),
        color = backgroundColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium,
            fontSize = 11.sp
        )
    }
}

@Composable
fun IssueStatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = color,
                fontSize = 20.sp
            )
        }
    }
}

