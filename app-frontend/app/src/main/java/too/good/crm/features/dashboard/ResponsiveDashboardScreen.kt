package too.good.crm.features.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.responsivePadding
import too.good.crm.ui.utils.responsiveSpacing

/**
 * Updated Dashboard Screen with Responsive Components
 * Matches web-frontend's responsive design patterns
 */
@Composable
fun ResponsiveDashboardScreen(
    onLogoutClicked: () -> Unit,
    onNavigate: (route: String) -> Unit
) {
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    AppScaffoldWithDrawer(
        title = "Dashboard",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onLogoutClicked
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space4,
                        medium = DesignTokens.Spacing.Space5,
                        expanded = DesignTokens.Spacing.Space6
                    )
                ),
            verticalArrangement = Arrangement.spacedBy(
                responsiveSpacing(
                    compact = DesignTokens.Spacing.Space4,
                    medium = DesignTokens.Spacing.Space5
                )
            )
        ) {
            // Welcome Banner - Responsive
            WelcomeBannerCard(
                greeting = getGreeting(),
                title = "Welcome to Your Dashboard",
                description = "Track your sales pipeline, manage customer relationships, and grow your business",
                onAnalyticsClick = { onNavigate("analytics") },
                onNewDealClick = { onNavigate("deals") }
            )
            
            // Stats Grid - Automatically responsive (1/2/3 columns)
            StatsGrid(
                stats = listOf(
                    StatData(
                        title = "TOTAL CUSTOMERS",
                        value = "1,234",
                        icon = {
                            Icon(
                                Icons.Default.People,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Secondary
                            )
                        },
                        change = "+12%",
                        isPositive = true
                    ),
                    StatData(
                        title = "ACTIVE DEALS",
                        value = "87",
                        icon = {
                            Icon(
                                Icons.Default.Description,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Secondary
                            )
                        },
                        change = "+8%",
                        isPositive = true
                    ),
                    StatData(
                        title = "REVENUE",
                        value = "$452,000",
                        icon = {
                            Icon(
                                Icons.Default.AttachMoney,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Secondary
                            )
                        },
                        change = "+23%",
                        isPositive = true
                    )
                )
            )
            
            // Recent Activities Section
            ResponsiveCard {
                Column(
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Recent Activities",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = DesignTokens.Typography.FontWeightBold,
                            color = DesignTokens.Colors.OnSurface
                        )
                        ResponsiveTextButton(
                            text = "View All",
                            onClick = { onNavigate("activities") }
                        )
                    }
                    
                    // Activity items would go here
                    Text(
                        text = "No recent activities",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            
            // Quick Actions Grid
            ResponsiveGrid(
                compactColumns = 2,
                mediumColumns = 4,
                expandedColumns = 4
            ) {
                QuickActionCard(
                    title = "New Customer",
                    icon = Icons.Default.PersonAdd,
                    onClick = { onNavigate("customers") },
                    modifier = Modifier.weight(1f)
                )
                QuickActionCard(
                    title = "New Deal",
                    icon = Icons.Default.Add,
                    onClick = { onNavigate("deals") },
                    modifier = Modifier.weight(1f)
                )
                QuickActionCard(
                    title = "New Lead",
                    icon = Icons.Default.GroupAdd,
                    onClick = { onNavigate("leads") },
                    modifier = Modifier.weight(1f)
                )
                QuickActionCard(
                    title = "Analytics",
                    icon = Icons.Default.TrendingUp,
                    onClick = { onNavigate("analytics") },
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

/**
 * Quick Action Card Component
 */
@Composable
fun QuickActionCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.SurfaceVariant
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level1
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space4),
            horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(DesignTokens.Heights.IconMd),
                tint = DesignTokens.Colors.Primary
            )
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = DesignTokens.Typography.FontWeightMedium,
                color = DesignTokens.Colors.OnSurface
            )
        }
    }
}

/**
 * Get time-based greeting
 */
private fun getGreeting(): String {
    val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
    return when (hour) {
        in 0..11 -> "Good Morning"
        in 12..17 -> "Good Afternoon"
        else -> "Good Evening"
    }
}
