package too.good.crm.features.client

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import kotlinx.coroutines.launch
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientDashboardScreen(
    onLogoutClicked: () -> Unit,
    onNavigate: (route: String) -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val scope = rememberCoroutineScope()
    val profileViewModel = remember { too.good.crm.features.profile.ProfileViewModel(context) }
    val dashboardViewModel = remember { ClientDashboardViewModel(context) }
    val authRepository = remember { too.good.crm.data.repository.AuthRepository(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val dashboardState by dashboardViewModel.uiState.collectAsState()
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    // Load profiles on initial load if not already loaded
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
        // Load dashboard data
        dashboardViewModel.loadDashboardData()
    }

    AppScaffoldWithDrawer(
        title = "Client Dashboard",
        activeMode = activeMode,
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    // Update user session with new profile data
                    val profiles = user.profiles ?: emptyList()
                    val primaryProfile = user.primaryProfile ?: profile
                    
                    val hasCustomerProfile = profiles.any { it.profileType == "customer" }
                    val hasVendorProfile = profiles.any {
                        it.profileType == "employee" || it.profileType == "vendor"
                    }
                    
                    val userRole = when {
                        hasCustomerProfile && hasVendorProfile -> too.good.crm.data.UserRole.BOTH
                        hasCustomerProfile -> too.good.crm.data.UserRole.CLIENT
                        hasVendorProfile -> too.good.crm.data.UserRole.VENDOR
                        else -> too.good.crm.data.UserRole.CLIENT
                    }
                    
                    // Update active mode based on new profile type
                    val newMode = when (primaryProfile.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        "customer" -> ActiveMode.CLIENT
                        else -> ActiveMode.VENDOR
                    }
                    
                    // Update UserSession
                    UserSession.currentProfile = too.good.crm.data.AppUserProfile(
                        id = user.id,
                        name = "${user.firstName} ${user.lastName}",
                        email = user.email,
                        role = userRole,
                        organizationId = primaryProfile.organizationId ?: 0,
                        organizationName = primaryProfile.organizationName 
                            ?: primaryProfile.organization?.name 
                            ?: "Unknown",
                        activeMode = newMode
                    )
                    UserSession.activeMode = newMode
                    activeMode = newMode
                    
                    // Navigate based on profile type
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        "employee", "vendor" -> onNavigate("dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { error ->
                    // Error is already handled in ProfileViewModel
                }
            )
        },
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
            if (newMode == ActiveMode.VENDOR) {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = {
            // Perform actual logout before navigating
            scope.launch {
                authRepository.logout()
                // Clear user session
                UserSession.clearSession()
                // Now navigate to main/login
                onLogoutClicked()
            }
        }
    ) { paddingValues ->
        // Pull-to-refresh state
        val isRefreshing = dashboardState.isLoading
        
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                // Show loading state
                if (dashboardState.isLoading && !dashboardState.hasData) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
                return@Column
            }
            
            // Show error state
            if (dashboardState.error != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = DesignTokens.Colors.Error.copy(alpha = 0.1f)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Error Loading Dashboard",
                            style = MaterialTheme.typography.titleMedium,
                            color = DesignTokens.Colors.Error
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = dashboardState.error ?: "Unknown error",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { dashboardViewModel.refresh() }) {
                            Icon(Icons.Default.Refresh, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Retry")
                        }
                    }
                }
                return@Column
            }
            
            // Show dashboard content
            ClientWelcomeCard(onNavigate)
            Spacer(modifier = Modifier.height(16.dp))
            
            // Vendor stats
            val vendorStats = dashboardState.vendorStats
            ClientMetricCard(
                title = "MY VENDORS",
                value = vendorStats?.totalVendors?.toString() ?: "0",
                change = "+${vendorStats?.activeVendors ?: 0}",
                changeLabel = "active vendors",
                icon = Icons.Default.Store,
                isPositive = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            // Order stats
            val orderStats = dashboardState.orderStats
            val activeOrders = (orderStats?.byStatus?.pending ?: 0) + 
                              (orderStats?.byStatus?.processing ?: 0) +
                              (orderStats?.byStatus?.confirmed ?: 0)
            ClientMetricCard(
                title = "ACTIVE ORDERS",
                value = activeOrders.toString(),
                change = "+${orderStats?.byStatus?.completed ?: 0}",
                changeLabel = "completed",
                icon = Icons.Default.ShoppingBag,
                isPositive = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            // Total spent (revenue)
            val totalRevenue = orderStats?.totalRevenue ?: 0.0
            ClientMetricCard(
                title = "TOTAL SPENT",
                value = "$${String.format("%.2f", totalRevenue)}",
                change = "${orderStats?.total ?: 0}",
                changeLabel = "total orders",
                icon = Icons.Default.Payment,
                isPositive = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            
            // Pending orders
            ClientMetricCard(
                title = "PENDING ORDERS",
                value = (orderStats?.byStatus?.pending ?: 0).toString(),
                change = "${orderStats?.byStatus?.cancelled ?: 0}",
                changeLabel = "cancelled",
                icon = Icons.Default.HourglassEmpty,
                isPositive = orderStats?.byStatus?.pending ?: 0 <= 5
            )
        }
            
            // Floating refresh button
            if (dashboardState.hasData) {
                FloatingActionButton(
                    onClick = { dashboardViewModel.refresh() },
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(16.dp),
                    containerColor = DesignTokens.Colors.Info
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh Dashboard"
                    )
                }
            }
        }
    }
}

@Composable
fun ClientWelcomeCard(onNavigate: (String) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.Info.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Text(
                text = "Welcome Back! 👋",
                style = MaterialTheme.typography.titleMedium,
                color = DesignTokens.Colors.Info
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Client Portal",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Manage your vendors, track orders, handle payments, and resolve issues",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = { onNavigate("my-orders") },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Info
                    )
                ) {
                    Icon(Icons.Default.ShoppingBag, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("My Orders")
                }
                OutlinedButton(
                    onClick = { onNavigate("my-vendors") },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = DesignTokens.Colors.Info
                    )
                ) {
                    Icon(Icons.Default.Store, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("My Vendors")
                }
            }
        }
    }
}

@Composable
fun ClientMetricCard(
    title: String,
    value: String,
    change: String,
    changeLabel: String,
    icon: ImageVector,
    isPositive: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (isPositive) Icons.Default.ArrowUpward else Icons.Default.ArrowDownward,
                        contentDescription = null,
                        tint = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = change,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        fontWeight = FontWeight.SemiBold
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = changeLabel,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Surface(
                shape = MaterialTheme.shapes.medium,
                color = DesignTokens.Colors.Info.copy(alpha = 0.1f),
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = DesignTokens.Colors.Info
                    )
                }
            }
        }
    }
}

