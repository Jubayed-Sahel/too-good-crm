package too.good.crm.features.activities

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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.AppScaffoldWithDrawer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActivitiesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterType by remember { mutableStateOf<ActivityType?>(null) }
    var filterStatus by remember { mutableStateOf<ActivityStatus?>(null) }
    val activities = remember { ActivitySampleData.getActivities() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredActivities = activities.filter { activity ->
        val matchesSearch = searchQuery.isEmpty() ||
                activity.title.contains(searchQuery, ignoreCase = true) ||
                activity.customerName.contains(searchQuery, ignoreCase = true)
        val matchesType = filterType == null || activity.type == filterType
        val matchesStatus = filterStatus == null || activity.status == filterStatus
        matchesSearch && matchesType && matchesStatus
    }

    AppScaffoldWithDrawer(
        title = "Activities",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onBack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF9FAFB))
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "Activities",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Track your tasks, meetings, calls, and follow-ups",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF6B7280)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = activities.size.toString(),
                    color = MaterialTheme.colorScheme.primary
                )
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Completed",
                    value = activities.count { it.status == ActivityStatus.COMPLETED }.toString(),
                    color = Color(0xFF22C55E)
                )
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Pending",
                    value = activities.count { it.status == ActivityStatus.PENDING }.toString(),
                    color = Color(0xFFF59E0B)
                )
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Scheduled",
                    value = activities.count { it.status == ActivityStatus.SCHEDULED }.toString(),
                    color = Color(0xFF3B82F6)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search activities...") },
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
                    unfocusedContainerColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Activities List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredActivities) { activity ->
                    ActivityCard(activity = activity)
                }
            }
        }
    }
}

@Composable
fun ActivityCard(activity: Activity) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Type Icon
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = getActivityTypeColor(activity.type).copy(alpha = 0.1f),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = getActivityTypeIcon(activity.type),
                        contentDescription = null,
                        tint = getActivityTypeColor(activity.type),
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Activity Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = activity.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.weight(1f)
                    )
                    ActivityStatusBadge(status = activity.status)
                }

                Spacer(modifier = Modifier.height(4.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Business,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = Color(0xFF6B7280)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = activity.customerName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = Color(0xFF6B7280)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Due: ${activity.dueDate}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = Color(0xFF6B7280)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = activity.createdBy,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ActivityStatusBadge(status: ActivityStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        ActivityStatus.COMPLETED -> Triple(
            Color(0xFF22C55E).copy(alpha = 0.1f),
            Color(0xFF22C55E),
            "Completed"
        )
        ActivityStatus.PENDING -> Triple(
            Color(0xFFF59E0B).copy(alpha = 0.1f),
            Color(0xFFF59E0B),
            "Pending"
        )
        ActivityStatus.SCHEDULED -> Triple(
            Color(0xFF3B82F6).copy(alpha = 0.1f),
            Color(0xFF3B82F6),
            "Scheduled"
        )
        ActivityStatus.OVERDUE -> Triple(
            Color(0xFFEF4444).copy(alpha = 0.1f),
            Color(0xFFEF4444),
            "Overdue"
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
fun ActivityStatCard(
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
                color = Color(0xFF6B7280),
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

fun getActivityTypeIcon(type: ActivityType): ImageVector {
    return when (type) {
        ActivityType.CALL -> Icons.Default.Phone
        ActivityType.EMAIL -> Icons.Default.Email
        ActivityType.MEETING -> Icons.Default.Event
        ActivityType.TASK -> Icons.Default.CheckCircle
        ActivityType.FOLLOW_UP -> Icons.Default.Update
    }
}

fun getActivityTypeColor(type: ActivityType): Color {
    return when (type) {
        ActivityType.CALL -> Color(0xFF3B82F6)
        ActivityType.EMAIL -> Color(0xFF8B5CF6)
        ActivityType.MEETING -> Color(0xFF22C55E)
        ActivityType.TASK -> Color(0xFFF59E0B)
        ActivityType.FOLLOW_UP -> Color(0xFFEC4899)
    }
}

