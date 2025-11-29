package too.good.crm.features.employees

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
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
import too.good.crm.ui.utils.*
import too.good.crm.utils.LogoutHandler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeDetailScreen(
    employeeId: String,
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
    var showDeleteDialog by remember { mutableStateOf(false) }
    
    // Load profiles
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Load employee details
    LaunchedEffect(employeeId) {
        viewModel.loadEmployee(employeeId.toInt())
    }
    
    val employee = uiState.selectedEmployee

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
        title = "Employee Details",
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
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = DesignTokens.Colors.Primary)
            }
        } else if (employee == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        Icons.Default.PersonOff,
                        contentDescription = null,
                        modifier = Modifier.size(getResponsiveIconSize() * 3),
                        tint = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.5f)
                    )
                    Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))
                    Text(
                        text = "Employee not found",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = getResponsiveBodySize()
                    )
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(DesignTokens.Colors.Background)
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(defaultResponsivePadding())
            ) {
                // Header Card with Avatar and Basic Info
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(getResponsiveCornerRadius()),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(defaultResponsivePadding()),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(getResponsiveIconSize() * 3)
                                .clip(CircleShape)
                                .background(DesignTokens.Colors.Primary.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = employee.initials,
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.Primary,
                                fontSize = responsiveValue(
                                    compact = DesignTokens.Typography.HeadlineMedium,
                                    medium = DesignTokens.Typography.HeadlineLarge,
                                    expanded = DesignTokens.Typography.HeadlineLarge
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                        Text(
                            text = employee.fullName,
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            fontSize = getResponsiveTitleSize()
                        )
                        
                        if (employee.jobTitle != null) {
                            Text(
                                text = employee.jobTitle,
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant,
                                fontSize = getResponsiveBodySize()
                            )
                        }

                        Spacer(modifier = Modifier.height(defaultResponsiveSpacing() / 2))

                        EmployeeStatusBadge(status = employee.status)

                        Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                        // Action Buttons
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(defaultResponsiveSpacing() / 2)
                        ) {
                            OutlinedButton(
                                onClick = { onNavigate("employee-edit/$employeeId") },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = DesignTokens.Colors.Info
                                )
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = null)
                                Spacer(modifier = Modifier.width(defaultResponsiveSpacing() / 4))
                                Text("Edit", fontSize = getResponsiveBodySize())
                            }
                            
                            OutlinedButton(
                                onClick = { showDeleteDialog = true },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = DesignTokens.Colors.Error
                                )
                            ) {
                                Icon(Icons.Default.Delete, contentDescription = null)
                                Spacer(modifier = Modifier.width(defaultResponsiveSpacing() / 4))
                                Text("Delete", fontSize = getResponsiveBodySize())
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                // Contact Information
                InfoSection(title = "Contact Information") {
                    InfoRow(
                        icon = Icons.Default.Email,
                        label = "Email",
                        value = employee.email
                    )
                    if (employee.phone != null) {
                        InfoRow(
                            icon = Icons.Default.Phone,
                            label = "Phone",
                            value = employee.phone
                        )
                    }
                    if (employee.emergencyContact != null) {
                        InfoRow(
                            icon = Icons.Default.ContactPhone,
                            label = "Emergency Contact",
                            value = employee.emergencyContact
                        )
                    }
                }

                Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                // Employment Details
                InfoSection(title = "Employment Details") {
                    if (employee.department != null) {
                        InfoRow(
                            icon = Icons.Default.Business,
                            label = "Department",
                            value = employee.department
                        )
                    }
                    if (employee.roleName != null) {
                        InfoRow(
                            icon = Icons.Default.Shield,
                            label = "Role",
                            value = employee.roleName
                        )
                    }
                    InfoRow(
                        icon = Icons.Default.Work,
                        label = "Employment Type",
                        value = employee.employmentTypeDisplay ?: employee.employmentType ?: "N/A"
                    )
                    if (employee.hireDate != null) {
                        InfoRow(
                            icon = Icons.Default.CalendarToday,
                            label = "Hire Date",
                            value = employee.hireDate
                        )
                    }
                    if (employee.managerName != null) {
                        InfoRow(
                            icon = Icons.Default.Person,
                            label = "Manager",
                            value = employee.managerName
                        )
                    }
                }

                Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))

                // Address Information (if available)
                if (employee.address != null || employee.city != null) {
                    InfoSection(title = "Address") {
                        if (employee.address != null) {
                            InfoRow(
                                icon = Icons.Default.Home,
                                label = "Street",
                                value = employee.address
                            )
                        }
                        val cityStateZip = listOfNotNull(
                            employee.city,
                            employee.state,
                            employee.zipCode ?: employee.postalCode
                        ).joinToString(", ")
                        if (cityStateZip.isNotEmpty()) {
                            InfoRow(
                                icon = Icons.Default.LocationOn,
                                label = "Location",
                                value = cityStateZip
                            )
                        }
                        if (employee.country != null) {
                            InfoRow(
                                icon = Icons.Default.Public,
                                label = "Country",
                                value = employee.country
                            )
                        }
                    }
                }
            }
        }
    }
    
    // Delete Confirmation Dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Employee") },
            text = { Text("Are you sure you want to delete ${employee?.fullName}? This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.deleteEmployee(
                            id = employeeId.toInt(),
                            onSuccess = {
                                showDeleteDialog = false
                                onBack()
                            },
                            onError = {
                                showDeleteDialog = false
                            }
                        )
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error
                    )
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun InfoSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(getResponsiveCornerRadius()),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = getResponsiveElevation())
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(defaultResponsivePadding())
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                fontSize = getResponsiveBodySize()
            )
            Spacer(modifier = Modifier.height(defaultResponsiveSpacing()))
            content()
        }
    }
}

@Composable
fun InfoRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = defaultResponsiveSpacing() / 4),
        verticalAlignment = Alignment.Top
    ) {
        Icon(
            icon,
            contentDescription = null,
            modifier = Modifier.size(getResponsiveIconSize()),
            tint = DesignTokens.Colors.Info
        )
        Spacer(modifier = Modifier.width(defaultResponsiveSpacing() / 2))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = getResponsiveSmallSize()
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                fontSize = getResponsiveBodySize()
            )
        }
    }
}
