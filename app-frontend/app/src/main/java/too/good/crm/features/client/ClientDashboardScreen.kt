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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.AppScaffoldWithDrawer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClientDashboardScreen(
    onLogoutClicked: () -> Unit,
    onNavigate: (route: String) -> Unit
) {
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    AppScaffoldWithDrawer(
        title = "Client Dashboard",
        activeMode = activeMode,
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
            containerColor = Color(0xFF3B82F6).copy(alpha = 0.1f)
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
                color = Color(0xFF3B82F6)
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
                        containerColor = Color(0xFF3B82F6)
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
                        contentColor = Color(0xFF3B82F6)
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
                        imageVector = if (isPositive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                        contentDescription = null,
                        tint = if (isPositive) Color(0xFF22C55E) else Color(0xFFEF4444),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = change,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) Color(0xFF22C55E) else Color(0xFFEF4444),
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
                color = Color(0xFF3B82F6).copy(alpha = 0.1f),
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Color(0xFF3B82F6)
                    )
                }
            }
        }
    }
}

