package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.WindowSize
import too.good.crm.ui.utils.getWindowSize

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

/**
 * Responsive App Top Bar with adaptive layout based on screen size
 * Matches web-frontend's responsive top bar pattern
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResponsiveAppTopBar(
    title: String,
    onMenuClick: () -> Unit,
    showRoleSwitcher: Boolean = true,
    activeMode: ActiveMode = UserSession.activeMode,
    onModeChanged: ((ActiveMode) -> Unit)? = null
) {
    val canSwitchMode = UserSession.canSwitchMode()
    val windowSize = getWindowSize()
    
    // Adaptive title display based on screen size
    val showFullTitle = windowSize != WindowSize.COMPACT
    val showExpandedBadge = windowSize == WindowSize.EXPANDED

    TopAppBar(
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(
                    if (showFullTitle) DesignTokens.Spacing.Space3 else DesignTokens.Spacing.Space2
                )
            ) {
                Text(
                    text = title,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    style = if (showFullTitle) {
                        MaterialTheme.typography.titleLarge
                    } else {
                        MaterialTheme.typography.titleMedium
                    }
                )
                if (canSwitchMode && showRoleSwitcher && showExpandedBadge) {
                    ModeBadge(mode = activeMode)
                }
            }
        },
        navigationIcon = {
            IconButton(onClick = onMenuClick) {
                Icon(
                    Icons.Default.Menu,
                    contentDescription = "Menu",
                    modifier = Modifier.size(
                        if (showFullTitle) DesignTokens.Heights.IconSm 
                        else DesignTokens.Heights.IconXs
                    )
                )
            }
        },
        actions = {
            // Mode switcher - only show on medium+ screens in compact form
            if (canSwitchMode && showRoleSwitcher && onModeChanged != null && 
                windowSize != WindowSize.COMPACT) {
                Row(
                    modifier = Modifier.padding(horizontal = DesignTokens.Spacing.Space2),
                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
                ) {
                    IconButton(
                        onClick = { onModeChanged(ActiveMode.VENDOR) },
                        modifier = Modifier.size(DesignTokens.Heights.IconButton)
                    ) {
                        Icon(
                            imageVector = Icons.Default.BusinessCenter,
                            contentDescription = "Vendor Mode",
                            tint = if (activeMode == ActiveMode.VENDOR)
                                MaterialTheme.colorScheme.onPrimary
                            else
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.6f)
                        )
                    }

                    IconButton(
                        onClick = { onModeChanged(ActiveMode.CLIENT) },
                        modifier = Modifier.size(DesignTokens.Heights.IconButton)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Client Mode",
                            tint = if (activeMode == ActiveMode.CLIENT)
                                MaterialTheme.colorScheme.onPrimary
                            else
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.6f)
                        )
                    }
                }
            }
            
            // Notifications icon - always visible
            IconButton(onClick = { /* TODO: Notifications */ }) {
                Icon(
                    Icons.Default.Notifications,
                    contentDescription = "Notifications",
                    modifier = Modifier.size(
                        if (showFullTitle) DesignTokens.Heights.IconSm 
                        else DesignTokens.Heights.IconXs
                    )
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = if (activeMode == ActiveMode.VENDOR) 
                DesignTokens.Colors.Primary 
            else 
                DesignTokens.Colors.Info,
            titleContentColor = DesignTokens.Colors.OnPrimary,
            navigationIconContentColor = DesignTokens.Colors.OnPrimary,
            actionIconContentColor = DesignTokens.Colors.OnPrimary
        )
    )
}

/**
 * Mode Badge component
 * Shows current mode (Vendor/Client) as a badge in the top bar
 */
@Composable
fun ModeBadge(mode: ActiveMode) {
    Surface(
        color = DesignTokens.Colors.Surface.copy(alpha = 0.2f),
        shape = RoundedCornerShape(DesignTokens.Radius.Full),
        modifier = Modifier.height(24.dp)
    ) {
        Row(
            modifier = Modifier.padding(
                horizontal = DesignTokens.Spacing.Space2,
                vertical = DesignTokens.Spacing.Space1
            ),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
        ) {
            Icon(
                imageVector = if (mode == ActiveMode.VENDOR) 
                    Icons.Default.BusinessCenter 
                else 
                    Icons.Default.Person,
                contentDescription = null,
                modifier = Modifier.size(12.dp),
                tint = DesignTokens.Colors.OnPrimary
            )
            Text(
                text = if (mode == ActiveMode.VENDOR) "Vendor" else "Client",
                style = MaterialTheme.typography.labelSmall,
                color = DesignTokens.Colors.OnPrimary
            )
        }
    }
}

