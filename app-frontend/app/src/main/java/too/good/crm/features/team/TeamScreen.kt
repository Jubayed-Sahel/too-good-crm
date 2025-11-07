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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
fun TeamScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterRole by remember { mutableStateOf<TeamRole?>(null) }
    val teamMembers = remember { TeamSampleData.getTeamMembers() }

    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredMembers = teamMembers.filter { member ->
        val matchesSearch = searchQuery.isEmpty() ||
                member.name.contains(searchQuery, ignoreCase = true) ||
                member.email.contains(searchQuery, ignoreCase = true) ||
                member.department.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterRole == null || member.role == filterRole
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
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
                text = "Team",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Manage your team members and their roles",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF6B7280)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                TeamStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = teamMembers.size.toString(),
                    icon = Icons.Default.People,
                    color = Color(0xFF667EEA)
                )
                TeamStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Active",
                    value = teamMembers.count { it.status == TeamStatus.ACTIVE }.toString(),
                    icon = Icons.Default.CheckCircle,
                    color = Color(0xFF10B981)
                )
                TeamStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Departments",
                    value = teamMembers.map { it.department }.distinct().size.toString(),
                    icon = Icons.Default.Business,
                    color = Color(0xFF8B5CF6)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Search and Filter Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
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
                            tint = Color(0xFF9CA3AF)
                        )
                    },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFF667EEA),
                        unfocusedBorderColor = Color(0xFFE5E7EB),
                        focusedContainerColor = Color.White,
                        unfocusedContainerColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                )

                // Add Member Button
                Button(
                    onClick = { /* Add member dialog */ },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF667EEA)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Member",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Role Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
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

            Spacer(modifier = Modifier.height(16.dp))

            // Team Members List
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredMembers) { member ->
                    TeamMemberCard(member = member)
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
    icon: ImageVector,
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
                .padding(16.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1F2937)
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF6B7280)
            )
        }
    }
}

@Composable
fun TeamMemberCard(member: TeamMember) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                // Avatar
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(member.role.color.copy(alpha = 0.1f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = member.name.split(" ").mapNotNull { it.firstOrNull() }.take(2).joinToString(""),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = member.role.color
                    )
                }

                // Member Info
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = member.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF1F2937)
                    )
                    Text(
                        text = member.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF6B7280)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Role Badge
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = member.role.color.copy(alpha = 0.1f)
                        ) {
                            Text(
                                text = member.role.displayName,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = member.role.color,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        // Department
                        Text(
                            text = "• ${member.department}",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF9CA3AF)
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
                    color = Color(0xFF9CA3AF),
                    fontSize = 11.sp
                )
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
    ADMIN("Admin", Color(0xFFEF4444)),
    MANAGER("Manager", Color(0xFF8B5CF6)),
    SALES("Sales Rep", Color(0xFF3B82F6)),
    SUPPORT("Support", Color(0xFF10B981)),
    DEVELOPER("Developer", Color(0xFFF59E0B))
}

enum class TeamStatus(val displayName: String, val color: Color) {
    ACTIVE("Active", Color(0xFF10B981)),
    INACTIVE("Inactive", Color(0xFF6B7280)),
    ON_LEAVE("On Leave", Color(0xFFF59E0B))
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

