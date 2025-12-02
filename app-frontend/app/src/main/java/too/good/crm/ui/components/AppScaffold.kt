package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.theme.DesignTokens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffoldWithDrawer(
    title: String,
    activeMode: ActiveMode,
    profiles: List<too.good.crm.data.model.UserProfile> = emptyList(),
    activeProfile: too.good.crm.data.model.UserProfile? = null,
    isSwitchingProfile: Boolean = false,
    onProfileSelected: ((too.good.crm.data.model.UserProfile) -> Unit)? = null,
    onModeChanged: (ActiveMode) -> Unit,
    onNavigate: (String) -> Unit,
    onLogout: () -> Unit,
    content: @Composable (PaddingValues) -> Unit
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val canSwitchMode = UserSession.canSwitchMode()
    val hasMultipleProfiles = profiles.size > 1

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
            // Profile Switcher ABOVE the top bar - Only show if user has multiple profiles
            // Employee profiles only show if they have an organization (same logic as web app)
            if (hasMultipleProfiles && onProfileSelected != null) {
                ProfileSwitcher(
                    profiles = profiles,
                    activeProfile = activeProfile,
                    isSwitching = isSwitchingProfile,
                    onProfileSelected = onProfileSelected,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Scaffold with top bar and content
            Scaffold(
                topBar = {
                    // Match web-frontend colors: purple for vendor, blue for client
                    val topBarColor = if (activeMode == ActiveMode.VENDOR) {
                        DesignTokens.Colors.Primary // Purple 600
                    } else {
                        DesignTokens.Colors.Info // Blue 500
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
                            titleContentColor = DesignTokens.Colors.White,
                            navigationIconContentColor = DesignTokens.Colors.White,
                            actionIconContentColor = DesignTokens.Colors.White
                        ),
                        windowInsets = WindowInsets(top = 0.dp)
                    )
                },
                containerColor = DesignTokens.Colors.Background, // Match web gray.50
                modifier = Modifier.weight(1f)
            ) { paddingValues ->
                // Page content with proper background
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
                    tint = if (activeMode == ActiveMode.VENDOR) MaterialTheme.colorScheme.primary else DesignTokens.Colors.Secondary,
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
                        text = if (activeMode == ActiveMode.VENDOR) "Vendor Platform" else "Client Platform",
                        style = MaterialTheme.typography.bodySmall,
                        color = if (activeMode == ActiveMode.VENDOR) MaterialTheme.colorScheme.primary else DesignTokens.Colors.Secondary
                    )
                }
            }

            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

            // Navigation Items - Match exact web sidebar structure
            if (activeMode == ActiveMode.VENDOR) {
                // Vendor Mode Navigation (matches web vendorMenuItems)
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
                    icon = { Icon(Icons.AutoMirrored.Filled.TrendingUp, contentDescription = null) },
                    label = { Text("Sales") },
                    selected = false,
                    onClick = { onNavigate("sales") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Event, contentDescription = null) },
                    label = { Text("Activities") },
                    selected = false,
                    onClick = { onNavigate("activities") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.AutoMirrored.Filled.Message, contentDescription = null) },
                    label = { Text("Messages") },
                    selected = false,
                    onClick = { onNavigate("messages") }
                )
                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.ReportProblem, contentDescription = null) },
                    label = { Text("Issues") },
                    selected = false,
                    onClick = { onNavigate("vendor-issues") }
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
                // Client Mode Navigation (matches web clientMenuItems)
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
                    icon = { Icon(Icons.AutoMirrored.Filled.Message, contentDescription = null) },
                    label = { Text("Messages") },
                    selected = false,
                    onClick = { onNavigate("messages") }
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
                icon = { Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null) },
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

