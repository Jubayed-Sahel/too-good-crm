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
    val profileViewModel = remember { too.good.crm.features.profile.ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    // Load profiles on initial load if not already loaded
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
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
        onLogout = onLogoutClicked
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            ClientWelcomeCard()
            Spacer(modifier = Modifier.height(16.dp))
            ClientMetricCard(
                title = "MY VENDORS",
                value = "12",
                change = "+3",
                changeLabel = "new this month",
                icon = Icons.Default.Store,
                isPositive = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            ClientMetricCard(
                title = "ACTIVE ORDERS",
                value = "8",
                change = "+5",
                changeLabel = "vs last month",
                icon = Icons.Default.ShoppingBag,
                isPositive = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            ClientMetricCard(
                title = "TOTAL SPENT",
                value = "$24,500",
                change = "+18%",
                changeLabel = "vs last month",
                icon = Icons.Default.Payment,
                isPositive = true
            )
            Spacer(modifier = Modifier.height(16.dp))
            ClientMetricCard(
                title = "OPEN ISSUES",
                value = "2",
                change = "-1",
                changeLabel = "vs last week",
                icon = Icons.Default.ReportProblem,
                isPositive = true
            )
        }
    }
}

@Composable
fun ClientWelcomeCard() {
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
                    onClick = { /* TODO: Navigate to Orders */ },
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
                    onClick = { /* TODO: Create new order */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = DesignTokens.Colors.Info
                    )
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("New Order")
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

