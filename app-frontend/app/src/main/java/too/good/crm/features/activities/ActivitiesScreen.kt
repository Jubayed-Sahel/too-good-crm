package too.good.crm.features.activities

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Note
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.model.UserProfile
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.utils.LogoutHandler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ActivitiesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    
    // Use ViewModel for real data
    val activitiesViewModel = remember { ActivitiesViewModel() }
    val activitiesState by activitiesViewModel.uiState.collectAsState()
    
    var searchQuery by remember { mutableStateOf("") }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    val pullToRefreshState = rememberPullToRefreshState()

    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Search debounce
    LaunchedEffect(searchQuery) {
        if (searchQuery.isNotEmpty()) {
            activitiesViewModel.searchActivities(searchQuery)
        } else {
            activitiesViewModel.loadActivities()
        }
    }

    // Calculate stats from real data
    val activities = activitiesState.activities
    val totalActivities = activities.size
    val completedActivities = activities.count { it.status == "completed" }
    val pendingActivities = activities.count { it.status == "in_progress" || it.status == "scheduled" }
    val scheduledActivities = activities.count { it.status == "scheduled" }

    AppScaffoldWithDrawer(
        title = "Activities",
        activeMode = activeMode,
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    val primaryProfile = user.primaryProfile ?: profile
                    val newMode = when (primaryProfile.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        else -> ActiveMode.CLIENT
                    }
                    UserSession.activeMode = newMode
                    activeMode = newMode
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { }
            )
        },
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = {
            LogoutHandler.performLogout(
                scope = scope,
                authRepository = authRepository,
                onComplete = {
                    onNavigate("main")
                }
            )
        }
    ) { paddingValues ->
        PullToRefreshBox(
            isRefreshing = activitiesState.isRefreshing,
            onRefresh = { activitiesViewModel.refresh() },
            state = pullToRefreshState,
            modifier = Modifier.fillMaxSize()
        ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
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
                color = DesignTokens.Colors.OnSurfaceVariant
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
                    value = totalActivities.toString(),
                    color = MaterialTheme.colorScheme.primary
                )
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Completed",
                    value = completedActivities.toString(),
                    color = DesignTokens.Colors.Success
                )
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Pending",
                    value = pendingActivities.toString(),
                    color = DesignTokens.Colors.Warning
                )
                ActivityStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Scheduled",
                    value = scheduledActivities.toString(),
                    color = DesignTokens.Colors.Info
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

            // Loading and Error States
            when {
                activitiesState.isLoading && activities.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                activitiesState.error != null -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Error loading activities",
                                style = MaterialTheme.typography.bodyLarge,
                                color = DesignTokens.Colors.Error
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Button(onClick = { activitiesViewModel.loadActivities() }) {
                                Text("Retry")
                            }
                        }
                    }
                }
                activities.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.Event,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "No activities found",
                                style = MaterialTheme.typography.bodyLarge,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
                else -> {
                    // Activities List
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(activities) { activity ->
                            ActivityItemCard(activity = activity)
                        }
                    }
                }
            }
        }
        }
    }
}

@Composable
fun ActivityItemCard(activity: too.good.crm.data.model.ActivityListItem) {
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
            val typeIcon = getActivityTypeIconFromString(activity.activityType)
            val typeColor = getActivityTypeColorFromString(activity.activityType)
            
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = typeColor.copy(alpha = 0.1f),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = typeIcon,
                        contentDescription = null,
                        tint = typeColor,
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
                    ActivityStatusBadgeFromString(status = activity.status)
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Related entity (customer)
                if (activity.customerName != null) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Business,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = activity.customerName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Scheduled date
                    if (activity.scheduledAt != null) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.CalendarToday,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = formatDate(activity.scheduledAt),
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }

                    // Assigned to
                    if (activity.assignedToName != null) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = activity.assignedToName,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}

// Helper function to format date
private fun formatDate(dateString: String): String {
    return try {
        // Simple format - just show date part
        dateString.substringBefore("T")
    } catch (e: Exception) {
        dateString
    }
}

@Composable
fun ActivityStatusBadgeFromString(status: String) {
    val (backgroundColor, textColor, text) = when (status) {
        "completed" -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Completed"
        )
        "in_progress" -> Triple(
            DesignTokens.Colors.Warning.copy(alpha = 0.1f),
            DesignTokens.Colors.Warning,
            "In Progress"
        )
        "scheduled" -> Triple(
            DesignTokens.Colors.Info.copy(alpha = 0.1f),
            DesignTokens.Colors.Info,
            "Scheduled"
        )
        "cancelled" -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Cancelled"
        )
        else -> Triple(
            DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f),
            DesignTokens.Colors.OnSurfaceVariant,
            status.capitalize()
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

fun getActivityTypeIconFromString(type: String): ImageVector {
    return when (type) {
        "call" -> Icons.Default.Phone
        "email" -> Icons.Default.Email
        "telegram" -> Icons.AutoMirrored.Filled.Send
        "meeting" -> Icons.Default.Event
        "note" -> Icons.AutoMirrored.Filled.Note
        "task" -> Icons.Default.CheckCircle
        else -> Icons.Default.Event
    }
}

fun getActivityTypeColorFromString(type: String): Color {
    return when (type) {
        "call" -> DesignTokens.Colors.Info
        "email" -> DesignTokens.Colors.StatusScheduled
        "telegram" -> DesignTokens.Colors.PinkAccent
        "meeting" -> DesignTokens.Colors.Success
        "note" -> DesignTokens.Colors.Warning
        "task" -> DesignTokens.Colors.Primary
        else -> DesignTokens.Colors.OnSurfaceVariant
    }
}

