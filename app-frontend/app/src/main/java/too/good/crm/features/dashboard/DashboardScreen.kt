package too.good.crm.features.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import too.good.crm.ui.theme.TooGoodCrmTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogoutClicked: () -> Unit,
    onNavigate: (route: String) -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            NavigationDrawerContent(
                onNavigate = { route ->
                    scope.launch { drawerState.close() }
                    onNavigate(route)
                },
                onLogout = {
                    scope.launch { drawerState.close() }
                    onLogoutClicked()
                }
            )
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Dashboard") },
                    navigationIcon = {
                        IconButton(onClick = { scope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu")
                        }
                    },
                    actions = {
                        IconButton(onClick = { /* TODO: Profile */ }) {
                            Icon(Icons.Default.Person, contentDescription = "Profile")
                        }
                        Switch(
                            checked = false,
                            onCheckedChange = { /* TODO: Dark mode */ },
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        IconButton(onClick = { /* TODO: Notifications */ }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primary,
                        titleContentColor = MaterialTheme.colorScheme.onPrimary,
                        navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                        actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                    )
                )
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp)
            ) {
                WelcomeCard()
                Spacer(modifier = Modifier.height(16.dp))
                MetricCard(
                    title = "TOTAL CUSTOMERS",
                    value = "1234",
                    change = "+12%",
                    changeLabel = "vs last month",
                    icon = Icons.Default.People,
                    isPositive = true
                )
                Spacer(modifier = Modifier.height(16.dp))
                MetricCard(
                    title = "ACTIVE DEALS",
                    value = "87",
                    change = "+8%",
                    changeLabel = "vs last month",
                    icon = Icons.Default.Description,
                    isPositive = true
                )
                Spacer(modifier = Modifier.height(16.dp))
                MetricCard(
                    title = "REVENUE",
                    value = "$452,000",
                    change = "+23%",
                    changeLabel = "vs last month",
                    icon = Icons.Default.AttachMoney,
                    isPositive = true
                )
            }
        }
    }
}

@Composable
fun NavigationDrawerContent(
    onNavigate: (String) -> Unit,
    onLogout: () -> Unit
) {
    ModalDrawerSheet(
        modifier = Modifier.width(280.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // App Logo and Title
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(vertical = 16.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.FlashOn,
                    contentDescription = "LeadGrid",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(40.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "LeadGrid",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "CRM Platform",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            // Navigation Items
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                label = { Text("Dashboard") },
                selected = true,
                onClick = { onNavigate("dashboard") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.People, contentDescription = null) },
                label = { Text("Customers") },
                selected = false,
                onClick = { onNavigate("customers") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.TrendingUp, contentDescription = null) },
                label = { Text("Sales") },
                selected = false,
                onClick = { onNavigate("sales") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Description, contentDescription = null) },
                label = { Text("Deals") },
                selected = false,
                onClick = { onNavigate("deals") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Person, contentDescription = null) },
                label = { Text("Leads") },
                selected = false,
                onClick = { onNavigate("leads") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Event, contentDescription = null) },
                label = { Text("Activities") },
                selected = false,
                onClick = { onNavigate("activities") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.BarChart, contentDescription = null) },
                label = { Text("Analytics") },
                selected = false,
                onClick = { onNavigate("analytics") }
            )
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                label = { Text("Settings") },
                selected = false,
                onClick = { onNavigate("settings") }
            )

            Spacer(modifier = Modifier.weight(1f))

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            // Sign Out
            NavigationDrawerItem(
                icon = { Icon(Icons.Default.Logout, contentDescription = null) },
                label = { Text("Sign Out", color = MaterialTheme.colorScheme.error) },
                selected = false,
                onClick = onLogout,
                colors = NavigationDrawerItemDefaults.colors(
                    unselectedIconColor = MaterialTheme.colorScheme.error
                )
            )
        }
    }
}

@Composable
fun WelcomeCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Text(
                text = "Good Evening! 👋",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Welcome to Your Dashboard",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Track your sales pipeline, manage customer relationships, and grow your business",
                style = MaterialTheme.typography.bodyMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Button(
                    onClick = { /* TODO: Navigate to Analytics */ },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.TrendingUp, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Analytics")
                }
                OutlinedButton(
                    onClick = { /* TODO: Create new deal */ },
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
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
                        tint = if (isPositive) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = change,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) MaterialTheme.colorScheme.tertiary else MaterialTheme.colorScheme.error,
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
                color = MaterialTheme.colorScheme.secondaryContainer,
                modifier = Modifier.size(56.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DashboardScreenPreview() {
    TooGoodCrmTheme {
        DashboardScreen(onLogoutClicked = {}, onNavigate = {})
    }
}
