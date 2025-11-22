package too.good.crm.features.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.automirrored.filled.TrendingUp
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.model.UserProfile
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.components.ProfileSwitcher
import too.good.crm.ui.theme.DesignTokens
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogoutClicked: () -> Unit,
    onNavigate: (route: String) -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val dashboardViewModel = remember { DashboardViewModel() }
    val profileViewModel = remember { ProfileViewModel(context) }
    val authRepository = remember { too.good.crm.data.repository.AuthRepository(context) }
    
    val dashboardState by dashboardViewModel.uiState.collectAsState()
    val profileState by profileViewModel.uiState.collectAsState()
    
    // Get active profile's organization ID
    // For vendor/employee profiles, use organizationId from profile or organization object
    // For customer profiles, organizationId might be null (they don't filter by org)
    val organizationId = when (profileState.activeProfile?.profileType) {
        "vendor", "employee" -> {
            profileState.activeProfile?.organizationId 
                ?: profileState.activeProfile?.organization?.id
        }
        "customer" -> null // Customer dashboard doesn't filter by organization
        else -> profileState.activeProfile?.organizationId 
            ?: profileState.activeProfile?.organization?.id
    }
    
    // Load stats when profile is loaded
    LaunchedEffect(profileState.activeProfile?.id, profileState.isLoading) {
        if (!profileState.isLoading && profileState.activeProfile != null) {
            dashboardViewModel.loadStats()
        }
    }
    
    // Load profiles on initial load if not already loaded
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Refresh profiles when screen becomes visible (in case profile was switched elsewhere)
    LaunchedEffect(profileState.activeProfile?.id) {
        // Reload if we have no profiles but should have them
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    AppScaffoldWithDrawer(
        title = "Dashboard",
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
                    
                    // Refresh dashboard stats
                    dashboardViewModel.loadStats()
                    
                    // Navigate based on profile type
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        "employee", "vendor" -> onNavigate("dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { error ->
                    // Error is already handled in ProfileViewModel
                    // Could show snackbar here if needed
                }
            )
        },
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to client dashboard when switching to client mode
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(DesignTokens.Spacing.Space4)
        ) {
            WelcomeCard()
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            
            // Show loading state
            if (dashboardState.isLoading) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else if (dashboardState.error != null) {
                // Show error state
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = DesignTokens.Colors.ErrorLight
                    )
                ) {
                    Text(
                        text = "Error: ${dashboardState.error}",
                        modifier = Modifier.padding(DesignTokens.Spacing.Space4),
                        color = DesignTokens.Colors.Error,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                // Show stats cards
                val stats = dashboardState.stats
                
                // Extract values from Map
                val totalCustomers = (stats?.get("total_customers") as? Int) ?: 0
                val customerGrowth = (stats?.get("customer_growth_percent") as? Double)
                val totalDeals = (stats?.get("total_deals") as? Int) ?: 0
                val dealGrowth = (stats?.get("deal_growth_percent") as? Double)
                val totalRevenue = (stats?.get("total_revenue") as? Double) ?: 0.0
                val revenueGrowth = (stats?.get("revenue_growth_percent") as? Double)
                val activeLeads = (stats?.get("active_leads") as? Int)
                val leadGrowth = (stats?.get("lead_growth_percent") as? Double)
                
                // Total Customers Card
                MetricCard(
                    title = "TOTAL CUSTOMERS",
                    value = totalCustomers.toString(),
                    change = formatPercentage(customerGrowth),
                    changeLabel = "vs last month",
                    icon = Icons.Default.People,
                    isPositive = (customerGrowth ?: 0.0) >= 0,
                    iconBackgroundColor = DesignTokens.Colors.Primary100,
                    iconTintColor = DesignTokens.Colors.Primary
                )
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                
                // Active Deals Card
                MetricCard(
                    title = "ACTIVE DEALS",
                    value = totalDeals.toString(),
                    change = formatPercentage(dealGrowth),
                    changeLabel = "vs last month",
                    icon = Icons.Default.Description,
                    isPositive = (dealGrowth ?: 0.0) >= 0,
                    iconBackgroundColor = DesignTokens.Colors.Info100,
                    iconTintColor = DesignTokens.Colors.Info
                )
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                
                // Revenue Card
                MetricCard(
                    title = "REVENUE",
                    value = formatCurrency(totalRevenue),
                    change = formatPercentage(revenueGrowth),
                    changeLabel = "vs last month",
                    icon = Icons.Default.AttachMoney,
                    isPositive = (revenueGrowth ?: 0.0) >= 0,
                    iconBackgroundColor = DesignTokens.Colors.Success100,
                    iconTintColor = DesignTokens.Colors.Success
                )
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                
                // Active Leads Card
                if (activeLeads != null) {
                    MetricCard(
                        title = "ACTIVE LEADS",
                        value = activeLeads.toString(),
                        change = formatPercentage(leadGrowth),
                        changeLabel = "vs last month",
                        icon = Icons.AutoMirrored.Filled.TrendingUp,
                        isPositive = (leadGrowth ?: 0.0) >= 0,
                        iconBackgroundColor = DesignTokens.Colors.Warning100,
                        iconTintColor = DesignTokens.Colors.Warning
                    )
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                }
            }
        }
    }
}

// Helper functions for formatting
private fun formatCurrency(amount: Double): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale.US)
    return formatter.format(amount)
}

private fun formatPercentage(percentage: Double?): String {
    if (percentage == null) return "0%"
    val sign = if (percentage >= 0) "+" else ""
    return "$sign${String.format("%.1f", percentage)}%"
}

@Composable
fun WelcomeCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        shape = MaterialTheme.shapes.large,
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable)
        ) {
            Text(
                text = "Good Evening! 👋",
                style = MaterialTheme.typography.titleMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontWeight = DesignTokens.Typography.FontWeightMedium
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            Text(
                text = "Welcome to Your Dashboard",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = DesignTokens.Colors.OnSurface
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            Text(
                text = "Track your sales pipeline, manage customer relationships, and grow your business",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
            ) {
                Button(
                    onClick = { /* TODO: Navigate to Analytics */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Primary
                    ),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Icon(Icons.AutoMirrored.Filled.TrendingUp, contentDescription = null)
                    Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
                    Text("Analytics")
                }
                OutlinedButton(
                    onClick = { /* TODO: Create new deal */ },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = DesignTokens.Colors.Primary
                    ),
                    shape = MaterialTheme.shapes.medium,
                    border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.Primary)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
                    Text("New Deal")
                }
            }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    change: String,
    changeLabel: String,
    icon: ImageVector,
    isPositive: Boolean,
    iconBackgroundColor: Color,
    iconTintColor: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (isPositive) Icons.AutoMirrored.Filled.TrendingUp else Icons.AutoMirrored.Filled.TrendingDown,
                        contentDescription = null,
                        tint = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space1))
                    Text(
                        text = change,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold
                    )
                    Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space1))
                    Text(
                        text = changeLabel,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            Surface(
                shape = MaterialTheme.shapes.medium,
                color = iconBackgroundColor,
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconTintColor,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DashboardScreenPreview() {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = DesignTokens.Colors.Primary,
            onPrimary = DesignTokens.Colors.OnPrimary,
            primaryContainer = DesignTokens.Colors.PrimaryContainer,
            secondary = DesignTokens.Colors.Secondary,
            onSecondary = DesignTokens.Colors.OnSecondary,
            secondaryContainer = DesignTokens.Colors.SecondaryContainer,
            error = DesignTokens.Colors.Error,
            surface = DesignTokens.Colors.Surface,
            onSurface = DesignTokens.Colors.OnSurface,
            surfaceVariant = DesignTokens.Colors.SurfaceVariant,
            onSurfaceVariant = DesignTokens.Colors.OnSurfaceVariant,
            background = DesignTokens.Colors.Background
        )
    ) {
        DashboardScreen(onLogoutClicked = {}, onNavigate = {})
    }
}
