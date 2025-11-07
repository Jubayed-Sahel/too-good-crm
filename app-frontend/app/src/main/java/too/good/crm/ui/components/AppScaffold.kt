package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffoldWithDrawer(
    title: String,
    activeMode: ActiveMode,
    onModeChanged: (ActiveMode) -> Unit,
    onNavigate: (String) -> Unit,
    onLogout: () -> Unit,
    content: @Composable (PaddingValues) -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val canSwitchMode = UserSession.canSwitchMode()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            NavigationDrawerContent(
                activeMode = activeMode,
                onNavigate = { route ->
                    scope.launch { drawerState.close() }
                    onNavigate(route)
                },
                onLogout = {
                    scope.launch { drawerState.close() }
                    onLogout()
                }
            )
        }
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Role Switcher ABOVE the top bar - ALWAYS VISIBLE
            if (canSwitchMode) {
                RoleSwitcher(
                    currentMode = activeMode,
                    onModeChanged = onModeChanged,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Scaffold with top bar and content
            Scaffold(
                topBar = {
                    val topBarColor = if (activeMode == ActiveMode.VENDOR) {
                        Color(0xFF8B5CF6) // Purple for Vendor
                    } else {
                        Color(0xFF3B82F6) // Blue for Client
                    }

                    TopAppBar(
                        title = { Text(title) },
                        navigationIcon = {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(Icons.Default.Menu, contentDescription = "Menu")
                            }
                        },
                        actions = {
                            IconButton(onClick = { /* TODO: Notifications */ }) {
                                Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = topBarColor,
                            titleContentColor = Color.White,
                            navigationIconContentColor = Color.White,
                            actionIconContentColor = Color.White
                        )
                    )
                },
                modifier = Modifier.weight(1f)
            ) { paddingValues ->
                // Page content
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    content(PaddingValues(0.dp))
                }
            }
        }
    }
}

@Composable
fun NavigationDrawerContent(
    activeMode: ActiveMode,
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
                    imageVector = if (activeMode == ActiveMode.VENDOR) Icons.Default.FlashOn else Icons.Default.ShoppingCart,
                    contentDescription = "App Icon",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(40.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = "Too Good CRM",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (activeMode == ActiveMode.VENDOR) "Vendor Platform" else "Client Platform",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            // Navigation Items - Different for Vendor vs Client mode
            if (activeMode == ActiveMode.VENDOR) {
                // Vendor Mode Navigation
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                    label = { Text("Dashboard") },
                    selected = false,
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
                    icon = { Icon(Icons.Default.Group, contentDescription = null) },
                    label = { Text("Team") },
                    selected = false,
                    onClick = { onNavigate("team") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                    label = { Text("Settings") },
                    selected = false,
                    onClick = { onNavigate("settings") }
                )
            } else {
                // Client Mode Navigation
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Dashboard, contentDescription = null) },
                    label = { Text("Dashboard") },
                    selected = false,
                    onClick = { onNavigate("client-dashboard") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Store, contentDescription = null) },
                    label = { Text("My Vendors") },
                    selected = false,
                    onClick = { onNavigate("my-vendors") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.ShoppingBag, contentDescription = null) },
                    label = { Text("My Orders") },
                    selected = false,
                    onClick = { onNavigate("my-orders") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Payment, contentDescription = null) },
                    label = { Text("Payments") },
                    selected = false,
                    onClick = { onNavigate("payments") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Event, contentDescription = null) },
                    label = { Text("Activities") },
                    selected = false,
                    onClick = { onNavigate("activities") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.ReportProblem, contentDescription = null) },
                    label = { Text("Issues") },
                    selected = false,
                    onClick = { onNavigate("issues") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                    label = { Text("Settings") },
                    selected = false,
                    onClick = { onNavigate("settings") }
                )
            }

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

