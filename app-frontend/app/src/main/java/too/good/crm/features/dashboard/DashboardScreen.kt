package too.good.crm.features.dashboard

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
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
            // Navigate to client dashboard when switching to client mode
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
                .padding(DesignTokens.Spacing.Space4)
        ) {
            WelcomeCard()
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            MetricCard(
                title = "TOTAL CUSTOMERS",
                value = "1234",
                change = "+12%",
                changeLabel = "vs last month",
                icon = Icons.Default.People,
                isPositive = true,
                iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f),
                iconTintColor = DesignTokens.Colors.Primary
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            MetricCard(
                title = "ACTIVE DEALS",
                value = "87",
                change = "+8%",
                changeLabel = "vs last month",
                icon = Icons.Default.Description,
                isPositive = true,
                iconBackgroundColor = DesignTokens.Colors.InfoLight,
                iconTintColor = DesignTokens.Colors.Info
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            MetricCard(
                title = "REVENUE",
                value = "$452,000",
                change = "+23%",
                changeLabel = "vs last month",
                icon = Icons.Default.AttachMoney,
                isPositive = true,
                iconBackgroundColor = DesignTokens.Colors.SuccessLight,
                iconTintColor = DesignTokens.Colors.Success
            )
        }
    }
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
                    Icon(Icons.Default.TrendingUp, contentDescription = null)
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
                        imageVector = if (isPositive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
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
