package too.good.crm.features.team

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.utils.LogoutHandler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TeamScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    
    val teamViewModel = remember { TeamViewModel(context) }
    val teamUiState by teamViewModel.uiState.collectAsState()
    
    var searchQuery by remember { mutableStateOf("") }
    var filterRole by remember { mutableStateOf<TeamRole?>(null) }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    val pullToRefreshState = rememberPullToRefreshState()
    
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }

    AppScaffoldWithDrawer(
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
        title = "Team",
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
            isRefreshing = (teamUiState as? TeamUiState.Success)?.isRefreshing ?: false,
            onRefresh = { teamViewModel.loadEmployees(refresh = true) },
            state = pullToRefreshState,
            modifier = Modifier.fillMaxSize()
        ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
                .padding(DesignTokens.Spacing.Space4)
        ) {
            // Header
            Text(
                text = "Team",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = DesignTokens.Colors.OnSurface
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            Text(
                text = "Manage your team members and their roles",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space6))

            // Compact Stats Cards - Show based on state
            when (val state = teamUiState) {
                is TeamUiState.Loading -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        repeat(3) {
                            Card(
                                modifier = Modifier.weight(1f),
                                elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
                                colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
                                shape = MaterialTheme.shapes.large
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(DesignTokens.Spacing.Space3),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(24.dp),
                                        strokeWidth = 2.dp
                                    )
                                }
                            }
                        }
                    }
                }
                is TeamUiState.Success -> {
                    val employees = state.employees
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        TeamStatCard(
                            modifier = Modifier.weight(1f),
                            title = "Total",
                            value = employees.size.toString(),
                            color = DesignTokens.Colors.Primary
                        )
                        TeamStatCard(
                            modifier = Modifier.weight(1f),
                            title = "Active",
                            value = employees.count { it.status == "active" }.toString(),
                            color = DesignTokens.Colors.Success
                        )
                        TeamStatCard(
                            modifier = Modifier.weight(1f),
                            title = "Departments",
                            value = employees.mapNotNull { it.department }.distinct().size.toString(),
                            color = DesignTokens.Colors.StatusScheduled
                        )
                    }
                }
                is TeamUiState.Error -> {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
                        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
                        shape = MaterialTheme.shapes.large
                    ) {
                        Column(
                            modifier = Modifier.padding(DesignTokens.Spacing.Space4),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Failed to load employees",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.Error
                            )
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                            Button(onClick = { teamViewModel.retry() }) {
                                Text("Retry", style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))

            // Search and Filter Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text("Search team members...") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = DesignTokens.Colors.OnSurfaceTertiary
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = DesignTokens.Colors.Primary,
                        unfocusedBorderColor = DesignTokens.Colors.OutlineVariant,
                        focusedContainerColor = DesignTokens.Colors.White,
                        unfocusedContainerColor = DesignTokens.Colors.White
                    ),
                    shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                )

                // Add Member Button
                Button(
                    onClick = { /* Add member dialog */ },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Primary
                    ),
                    shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Member",
                        modifier = Modifier.size(DesignTokens.Heights.IconXs)
                    )
                    Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space1))
                    Text("Add")
                }
            }

            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))

            // Role Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                FilterChip(
                    selected = filterRole == null,
                    onClick = { filterRole = null },
                    label = { Text("All") }
                )
                FilterChip(
                    selected = filterRole == TeamRole.ADMIN,
                    onClick = { filterRole = TeamRole.ADMIN },
                    label = { Text("Admin") }
                )
                FilterChip(
                    selected = filterRole == TeamRole.MANAGER,
                    onClick = { filterRole = TeamRole.MANAGER },
                    label = { Text("Manager") }
                )
                FilterChip(
                    selected = filterRole == TeamRole.SALES,
                    onClick = { filterRole = TeamRole.SALES },
                    label = { Text("Sales") }
                )
            }

            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))

            // Team Members List
            when (val state = teamUiState) {
                is TeamUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator()
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                            Text(
                                text = "Loading team members...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
                is TeamUiState.Success -> {
                    val employees = state.employees
                    
                    // Filter employees based on search and role
                    val filteredEmployees = employees.filter { employee ->
                        val matchesSearch = searchQuery.isEmpty() ||
                                employee.fullName.contains(searchQuery, ignoreCase = true) ||
                                employee.email.contains(searchQuery, ignoreCase = true) ||
                                (employee.department?.contains(searchQuery, ignoreCase = true) ?: false)
                        // Note: Role filtering would need role mapping from employee.roleName to TeamRole
                        // For now, just use search filter
                        matchesSearch
                    }
                    
                    if (filteredEmployees.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Default.People,
                                    contentDescription = null,
                                    modifier = Modifier.size(64.dp),
                                    tint = DesignTokens.Colors.OnSurfaceVariant
                                )
                                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                                Text(
                                    text = if (searchQuery.isEmpty()) "No team members yet" else "No results found",
                                    style = MaterialTheme.typography.bodyLarge,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            items(filteredEmployees, key = { it.id }) { employee ->
                                RealTeamMemberCard(employee = employee)
                            }
                        }
                    }
                }
                is TeamUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = null,
                                modifier = Modifier.size(64.dp),
                                tint = DesignTokens.Colors.Error
                            )
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                            Text(
                                text = "Failed to load team members",
                                style = MaterialTheme.typography.bodyLarge,
                                color = DesignTokens.Colors.Error
                            )
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
                            Text(
                                text = state.message,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
                            Button(onClick = { teamViewModel.retry() }) {
                                Text("Retry", style = MaterialTheme.typography.labelMedium)
                            }
                        }
                    }
                }
            }
        }
        }
    }
}

@Composable
fun TeamStatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space3),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = color,
                fontSize = 20.sp
            )
        }
    }
}

@Composable
fun TeamMemberCard(member: TeamMember) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space4),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Avatar
                Box(
                    modifier = Modifier
                        .size(DesignTokens.Heights.ImageThumbnail)
                        .clip(CircleShape)
                        .background(member.role.color.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = member.name.split(" ").mapNotNull { it.firstOrNull() }.take(2).joinToString(""),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = DesignTokens.Typography.FontWeightBold,
                        color = member.role.color
                    )
                }

                // Member Info
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = member.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Text(
                        text = member.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Role Badge
                        Surface(
                            shape = RoundedCornerShape(DesignTokens.Radius.ExtraSmall),
                            color = member.role.color.copy(alpha = 0.1f)
                        ) {
                            Text(
                                text = member.role.displayName,
                                modifier = Modifier.padding(horizontal = DesignTokens.Spacing.Space2, vertical = DesignTokens.Spacing.Space1),
                                style = MaterialTheme.typography.labelSmall,
                                color = member.role.color,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        // Department
                        Text(
                            text = "• ${member.department}",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceTertiary
                        )
                    }
                }
            }

            // Status and Actions
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Status Badge
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = member.status.color.copy(alpha = 0.1f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(member.status.color)
                        )
                        Text(
                            text = member.status.displayName,
                            style = MaterialTheme.typography.labelSmall,
                            color = member.status.color,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Last Active
                Text(
                    text = "Active ${member.lastActive}",
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceTertiary,
                    fontSize = 11.sp
                )
            }
        }
    }
}

@Composable
fun RealTeamMemberCard(employee: too.good.crm.data.models.Employee) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingStandard),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Avatar
                Box(
                    modifier = Modifier
                        .size(DesignTokens.Heights.ImageThumbnail)
                        .clip(CircleShape)
                        .background(DesignTokens.Colors.Primary100),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = employee.initials,
                        style = MaterialTheme.typography.titleMedium,
                        color = DesignTokens.Colors.Primary,
                        fontWeight = DesignTokens.Typography.FontWeightBold
                    )
                }

                // Employee Info
                Column(
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
                ) {
                    Text(
                        text = employee.fullName,
                        style = MaterialTheme.typography.bodyLarge,
                        fontWeight = DesignTokens.Typography.FontWeightBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Text(
                        text = employee.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Role Badge
                        employee.roleName?.let { roleName ->
                            Surface(
                                shape = RoundedCornerShape(DesignTokens.Radius.ExtraSmall),
                                color = DesignTokens.Colors.Info.copy(alpha = 0.1f)
                            ) {
                                Text(
                                    text = roleName,
                                    modifier = Modifier.padding(horizontal = DesignTokens.Spacing.Space2, vertical = DesignTokens.Spacing.Space1),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = DesignTokens.Colors.Info,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        // Department
                        employee.department?.let { dept ->
                            Text(
                                text = "• $dept",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceTertiary
                            )
                        }
                        
                        // Job Title
                        employee.jobTitle?.let { title ->
                            Text(
                                text = "• $title",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceTertiary
                            )
                        }
                    }
                }
            }

            // Status and Actions
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Status Badge
                val statusColor = when (employee.status) {
                    "active" -> DesignTokens.Colors.Success
                    "inactive" -> DesignTokens.Colors.OnSurfaceVariant
                    "on-leave" -> DesignTokens.Colors.Warning
                    "terminated" -> DesignTokens.Colors.Error
                    else -> DesignTokens.Colors.OnSurfaceVariant
                }
                
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = statusColor.copy(alpha = 0.1f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(statusColor)
                        )
                        Text(
                            text = employee.statusDisplay ?: employee.status.replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.labelSmall,
                            color = statusColor,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Employee Code
                employee.code.let { code ->
                    Text(
                        text = "ID: $code",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceTertiary,
                        fontSize = 11.sp
                    )
                }
            }
        }
    }
}

// Data Models
data class TeamMember(
    val id: Int,
    val name: String,
    val email: String,
    val role: TeamRole,
    val department: String,
    val status: TeamStatus,
    val lastActive: String,
    val joinedDate: String
)

enum class TeamRole(val displayName: String, val color: Color) {
    ADMIN("Admin", DesignTokens.Colors.Error),
    MANAGER("Manager", DesignTokens.Colors.StatusScheduled),
    SALES("Sales Rep", DesignTokens.Colors.Info),
    SUPPORT("Support", DesignTokens.Colors.Success),
    DEVELOPER("Developer", DesignTokens.Colors.Warning)
}

enum class TeamStatus(val displayName: String, val color: Color) {
    ACTIVE("Active", DesignTokens.Colors.Success),
    INACTIVE("Inactive", DesignTokens.Colors.OnSurfaceVariant),
    ON_LEAVE("On Leave", DesignTokens.Colors.Warning)
}

object TeamSampleData {
    fun getTeamMembers() = listOf(
        TeamMember(
            id = 1,
            name = "Sarah Johnson",
            email = "sarah.johnson@company.com",
            role = TeamRole.ADMIN,
            department = "Management",
            status = TeamStatus.ACTIVE,
            lastActive = "2 hours ago",
            joinedDate = "Jan 15, 2023"
        ),
        TeamMember(
            id = 2,
            name = "Michael Chen",
            email = "michael.chen@company.com",
            role = TeamRole.MANAGER,
            department = "Sales",
            status = TeamStatus.ACTIVE,
            lastActive = "5 mins ago",
            joinedDate = "Mar 20, 2023"
        ),
        TeamMember(
            id = 3,
            name = "Emily Davis",
            email = "emily.davis@company.com",
            role = TeamRole.SALES,
            department = "Sales",
            status = TeamStatus.ACTIVE,
            lastActive = "1 hour ago",
            joinedDate = "May 10, 2023"
        ),
        TeamMember(
            id = 4,
            name = "James Wilson",
            email = "james.wilson@company.com",
            role = TeamRole.SALES,
            department = "Sales",
            status = TeamStatus.ACTIVE,
            lastActive = "30 mins ago",
            joinedDate = "Jun 5, 2023"
        ),
        TeamMember(
            id = 5,
            name = "Lisa Anderson",
            email = "lisa.anderson@company.com",
            role = TeamRole.SUPPORT,
            department = "Support",
            status = TeamStatus.ACTIVE,
            lastActive = "15 mins ago",
            joinedDate = "Jul 12, 2023"
        ),
        TeamMember(
            id = 6,
            name = "David Martinez",
            email = "david.martinez@company.com",
            role = TeamRole.DEVELOPER,
            department = "Engineering",
            status = TeamStatus.ACTIVE,
            lastActive = "3 hours ago",
            joinedDate = "Aug 1, 2023"
        ),
        TeamMember(
            id = 7,
            name = "Rachel Thompson",
            email = "rachel.thompson@company.com",
            role = TeamRole.SALES,
            department = "Sales",
            status = TeamStatus.ON_LEAVE,
            lastActive = "2 days ago",
            joinedDate = "Sep 8, 2023"
        ),
        TeamMember(
            id = 8,
            name = "Kevin Brown",
            email = "kevin.brown@company.com",
            role = TeamRole.MANAGER,
            department = "Support",
            status = TeamStatus.ACTIVE,
            lastActive = "1 hour ago",
            joinedDate = "Oct 15, 2023"
        ),
        TeamMember(
            id = 9,
            name = "Amanda Lee",
            email = "amanda.lee@company.com",
            role = TeamRole.SALES,
            department = "Sales",
            status = TeamStatus.INACTIVE,
            lastActive = "1 week ago",
            joinedDate = "Nov 2, 2023"
        ),
        TeamMember(
            id = 10,
            name = "Robert Garcia",
            email = "robert.garcia@company.com",
            role = TeamRole.DEVELOPER,
            department = "Engineering",
            status = TeamStatus.ACTIVE,
            lastActive = "10 mins ago",
            joinedDate = "Dec 10, 2023"
        )
    )
}

