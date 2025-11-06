package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppTopBar(
    title: String,
    onMenuClick: () -> Unit,
    showRoleSwitcher: Boolean = true,
    activeMode: ActiveMode = UserSession.activeMode,
    onModeChanged: ((ActiveMode) -> Unit)? = null
) {
    val canSwitchMode = UserSession.canSwitchMode()

    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(title)
                if (canSwitchMode && showRoleSwitcher) {
                    ModeBadge(mode = activeMode)
                }
            }
        },
        navigationIcon = {
            IconButton(onClick = onMenuClick) {
                Icon(Icons.Default.Menu, contentDescription = "Menu")
            }
        },
        actions = {
            if (canSwitchMode && showRoleSwitcher && onModeChanged != null) {
                // Compact mode switcher for top bar
                Row(
                    modifier = Modifier.padding(horizontal = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    // Vendor button
                    IconButton(
                        onClick = { onModeChanged(ActiveMode.VENDOR) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.BusinessCenter,
                            contentDescription = "Vendor Mode",
                            tint = if (activeMode == ActiveMode.VENDOR)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.6f)
                        )
                    }

                    // Client button
                    IconButton(
                        onClick = { onModeChanged(ActiveMode.CLIENT) },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Client Mode",
                            tint = if (activeMode == ActiveMode.CLIENT)
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.6f)
                        )
                    }
                }
            }
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

