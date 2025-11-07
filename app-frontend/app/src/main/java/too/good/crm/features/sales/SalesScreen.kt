package too.good.crm.features.sales

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    AppScaffoldWithDrawer(
        title = "Sales",
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
                .background(DesignTokens.Colors.Background)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "Sales Overview",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Track your sales performance and revenue metrics",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Revenue Metrics
            Text(
                text = "Revenue Metrics",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.OnSurface
            )
            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SalesMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Revenue",
                    value = "$485K",
                    change = "+23%",
                    icon = Icons.Default.AttachMoney,
                    color = DesignTokens.Colors.Success,
                    isPositive = true
                )
                SalesMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Deals Closed",
                    value = "24",
                    change = "+12%",
                    icon = Icons.Default.CheckCircle,
                    color = DesignTokens.Colors.StatusScheduled,
                    isPositive = true
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SalesMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Avg Deal Size",
                    value = "$20.2K",
                    change = "+8%",
                    icon = Icons.Default.AttachMoney,
                    color = DesignTokens.Colors.Info,
                    isPositive = true
                )
                SalesMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Win Rate",
                    value = "68%",
                    change = "+5%",
                    icon = Icons.Default.Assessment,
                    color = DesignTokens.Colors.Warning,
                    isPositive = true
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Monthly Performance
            Text(
                text = "Monthly Performance",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.OnSurface
            )
            Spacer(modifier = Modifier.height(12.dp))

            MonthlyPerformanceCard(
                month = "November 2024",
                revenue = 125000.0,
                deals = 8,
                target = 150000.0
            )

            Spacer(modifier = Modifier.height(12.dp))

            MonthlyPerformanceCard(
                month = "October 2024",
                revenue = 145000.0,
                deals = 10,
                target = 150000.0
            )

            Spacer(modifier = Modifier.height(12.dp))

            MonthlyPerformanceCard(
                month = "September 2024",
                revenue = 98000.0,
                deals = 6,
                target = 120000.0
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Top Performers
            Text(
                text = "Top Performers",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.OnSurface
            )
            Spacer(modifier = Modifier.height(12.dp))

            TopPerformerCard(
                name = "Sarah Johnson",
                revenue = 145000.0,
                deals = 12,
                rank = 1
            )

            Spacer(modifier = Modifier.height(12.dp))

            TopPerformerCard(
                name = "Michael Chen",
                revenue = 125000.0,
                deals = 10,
                rank = 2
            )

            Spacer(modifier = Modifier.height(12.dp))

            TopPerformerCard(
                name = "Emily Davis",
                revenue = 98000.0,
                deals = 8,
                rank = 3
            )
        }
    }
}

@Composable
fun SalesMetricCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    change: String,
    icon: ImageVector,
    color: Color,
    isPositive: Boolean
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
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(32.dp)
                )
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isPositive) DesignTokens.Colors.Success.copy(alpha = 0.1f) else DesignTokens.Colors.Error.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = change,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        fontWeight = FontWeight.Medium,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.OnSurface
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
        }
    }
}

@Composable
fun MonthlyPerformanceCard(
    month: String,
    revenue: Double,
    deals: Int,
    target: Double
) {
    val progress = (revenue / target).toFloat().coerceIn(0f, 1f)
    val percentOfTarget = ((revenue / target) * 100).toInt()

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = month,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$deals deals closed",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }

                Text(
                    text = NumberFormat.getCurrencyInstance(Locale.US).format(revenue),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = DesignTokens.Colors.Success
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Target Progress",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = "$percentOfTarget% of ${NumberFormat.getCurrencyInstance(Locale.US).format(target)}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color = when {
                        progress >= 0.9f -> DesignTokens.Colors.Success
                        progress >= 0.7f -> DesignTokens.Colors.Warning
                        else -> DesignTokens.Colors.Error
                    },
                    trackColor = DesignTokens.Colors.OutlineVariant,
                )
            }
        }
    }
}

@Composable
fun TopPerformerCard(
    name: String,
    revenue: Double,
    deals: Int,
    rank: Int
) {
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
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Rank Badge
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = when (rank) {
                    1 -> Color(0xFFFFD700).copy(alpha = 0.2f)
                    2 -> Color(0xFFC0C0C0).copy(alpha = 0.2f)
                    3 -> Color(0xFFCD7F32).copy(alpha = 0.2f)
                    else -> DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f)
                },
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "#$rank",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = when (rank) {
                            1 -> Color(0xFFFFD700)
                            2 -> Color(0xFF808080)
                            3 -> Color(0xFFCD7F32)
                            else -> DesignTokens.Colors.OnSurfaceVariant
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$deals deals closed",
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }

            Text(
                text = NumberFormat.getCurrencyInstance(Locale.US).format(revenue),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.Success
            )
        }
    }
}

