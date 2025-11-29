package too.good.crm.features.employees

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.models.Employee
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import too.good.crm.utils.LogoutHandler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    
    val viewModel = remember { EmployeeViewModel(context) }
    val uiState by viewModel.uiState.collectAsState()
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedStatus by remember { mutableStateOf<String?>(null) }
    var selectedDepartment by remember { mutableStateOf<String?>(null) }
    
    // Load profiles
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Load employees and departments
    LaunchedEffect(Unit) {
        val organizationId = UserSession.currentProfile?.organizationId
        viewModel.loadEmployees(organizationId = organizationId)
        viewModel.loadDepartments()
    }
    
    // Filtered employees
    val filteredEmployees = remember(uiState.employees, searchQuery, selectedStatus, selectedDepartment) {
        uiState.employees.filter { employee ->
            val matchesSearch = searchQuery.isEmpty() ||
                    employee.fullName.contains(searchQuery, ignoreCase = true) ||
                    employee.email.contains(searchQuery, ignoreCase = true) ||
                    (employee.department?.contains(searchQuery, ignoreCase = true) == true)
            val matchesStatus = selectedStatus == null || employee.status == selectedStatus
            val matchesDepartment = selectedDepartment == null || employee.department == selectedDepartment
            matchesSearch && matchesStatus && matchesDepartment
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
        title = "Employees",
        activeMode = activeMode,
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
                .padding(defaultResponsivePadding())
        ) {
            // Header
            Text(
                text = "Team Members",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                fontSize = getResponsiveTitleSize()
            )
            Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))
            Text(
                text = "Manage your organization's employees",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = getResponsiveBodySize()
            )

            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(defaultResponsiveSpacing() / 2)
            ) {
                EmployeeStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = uiState.employees.size.toString(),
                    color = DesignTokens.Colors.Info
                )
                EmployeeStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Active",
                    value = uiState.employees.count { it.status == "active" }.toString(),
                    color = DesignTokens.Colors.Success
                )
                EmployeeStatCard(
                    modifier = Modifier.weight(1f),
                    title = "On Leave",
                    value = uiState.employees.count { it.status == "on-leave" }.toString(),
                    color = DesignTokens.Colors.Warning
                )
            }

            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search employees...", fontSize = getResponsiveBodySize()) },
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
                shape = RoundedCornerShape(getResponsiveCornerRadius()),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = DesignTokens.Colors.Info
                )
            )

            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

            // Employee List
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(defaultResponsiveSpacing()),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = DesignTokens.Colors.Primary)
                }
            } else if (filteredEmployees.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(defaultResponsiveSpacing()),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.People,
                            contentDescription = null,
                            modifier = Modifier.size(getResponsiveIconSize() * 2),
                            tint = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.5f)
                        )
                        Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))
                        Text(
                            text = if (searchQuery.isNotEmpty()) "No employees found" else "No employees yet",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            fontSize = getResponsiveBodySize()
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(defaultResponsiveSpacing() / 2)
                ) {
                    items(filteredEmployees) { employee ->
                        EmployeeCard(
                            employee = employee,
                            onClick = { onNavigate("employee-detail/${employee.id}") }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EmployeeCard(
    employee: Employee,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(getResponsiveCornerRadius()),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(defaultResponsivePadding()),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(getResponsiveIconSize() * 2)
                    .clip(CircleShape)
                    .background(DesignTokens.Colors.Primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = employee.initials,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = DesignTokens.Colors.Primary,
                    fontSize = getResponsiveBodySize()
                )
            }

            Spacer(modifier = Modifier.width(defaultResponsiveSpacing() / 2))

            // Employee Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = employee.fullName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    fontSize = getResponsiveBodySize()
                )
                if (employee.jobTitle != null) {
                    Text(
                        text = employee.jobTitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = getResponsiveSmallSize()
                    )
                }
                if (employee.department != null) {
                    Text(
                        text = employee.department,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.Info,
                        fontSize = getResponsiveSmallSize()
                    )
                }
            }

            // Status Badge
            EmployeeStatusBadge(status = employee.status)
        }
    }
}

@Composable
fun EmployeeStatusBadge(status: String) {
    val (backgroundColor, textColor, text) = when (status) {
        "active" -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Active"
        )
        "inactive" -> Triple(
            DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f),
            DesignTokens.Colors.OnSurfaceVariant,
            "Inactive"
        )
        "on-leave" -> Triple(
            DesignTokens.Colors.Warning.copy(alpha = 0.1f),
            DesignTokens.Colors.Warning,
            "On Leave"
        )
        "terminated" -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Terminated"
        )
        else -> Triple(
            DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f),
            DesignTokens.Colors.OnSurfaceVariant,
            status
        )
    }

    Surface(
        shape = RoundedCornerShape(getResponsiveCornerRadius() / 2),
        color = backgroundColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = defaultResponsiveSpacing() / 3, vertical = defaultResponsiveSpacing() / 4),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium,
            fontSize = getResponsiveSmallSize()
        )
    }
}

@Composable
fun EmployeeStatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(getResponsiveCornerRadius()),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(responsivePadding(
                    compact = DesignTokens.Spacing.Space3,
                    medium = DesignTokens.Spacing.Space4,
                    expanded = DesignTokens.Spacing.Space4
                )),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = getResponsiveSmallSize()
            )
            Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 4))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = color,
                fontSize = getResponsiveTitleSize()
            )
        }
    }
}
