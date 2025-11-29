package too.good.crm.ui.components

import androidx.compose.foundation.background
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
import androidx.compose.ui.unit.sp
import too.good.crm.data.model.UserProfile
import too.good.crm.ui.theme.DesignTokens

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileSwitcher(
    profiles: List<UserProfile>,
    activeProfile: UserProfile?,
    onProfileSelected: (UserProfile) -> Unit,
    modifier: Modifier = Modifier,
    isSwitching: Boolean = false
) {
    var showMenu by remember { mutableStateOf(false) }
    
    // Filter profiles: Employee profiles only show if they have an organization
    val validProfiles = profiles.filter { profile ->
        if (profile.profileType == "employee") {
            // Employee profiles: Only show if they have an organization (assigned by vendor)
            profile.organization != null || profile.organizationId != null
        } else {
            // Vendor and customer profiles: Always show
            true
        }
    }

    // Log profile information for debugging
    android.util.Log.d("ProfileSwitcher", "Total profiles: ${profiles.size}, Valid profiles: ${validProfiles.size}")
    validProfiles.forEach { profile ->
        android.util.Log.d("ProfileSwitcher", "Profile: ${profile.profileType} - ${profile.organizationName ?: "No Org"} (ID: ${profile.id}, Primary: ${profile.isPrimary})")
    }

    // Don't show switcher if no profiles
    if (validProfiles.isEmpty()) {
        return
    }

    val vendorProfiles = validProfiles.filter { it.profileType == "vendor" }
    val customerProfiles = validProfiles.filter { it.profileType == "customer" }
    val employeeProfiles = validProfiles.filter {
        it.profileType == "employee" && (it.organization != null || it.organizationId != null)
    }

    // Show switcher even with single profile (but make it non-interactive to show current profile)
    val canSwitch = validProfiles.size > 1

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(DesignTokens.Colors.Background)
            .padding(horizontal = DesignTokens.Spacing.Space4, vertical = DesignTokens.Spacing.Space2)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (canSwitch) DesignTokens.Colors.Surface else DesignTokens.Colors.SurfaceVariant
            ),
            shape = MaterialTheme.shapes.medium,
            elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
            onClick = { if (canSwitch) showMenu = true }
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    // Profile Icon
                    Surface(
                        shape = MaterialTheme.shapes.small,
                        color = when (activeProfile?.profileType) {
                            "vendor" -> DesignTokens.Colors.Primary100
                            "employee" -> DesignTokens.Colors.Secondary100
                            "customer" -> DesignTokens.Colors.Info100
                            else -> DesignTokens.Colors.Gray100
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = getProfileIcon(activeProfile?.profileType),
                                contentDescription = null,
                                tint = when (activeProfile?.profileType) {
                                    "vendor" -> DesignTokens.Colors.Primary
                                    "employee" -> DesignTokens.Colors.Secondary
                                    "customer" -> DesignTokens.Colors.Info
                                    else -> DesignTokens.Colors.Gray500
                                },
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = getProfileDisplayName(activeProfile) ?: "Select Profile",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = DesignTokens.Colors.OnSurface
                        )
                        if (activeProfile?.roles?.isNotEmpty() == true) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = activeProfile.roles[0].name,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant,
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                // Dropdown Icon
                Icon(
                    imageVector = if (showMenu) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                    contentDescription = "Switch Profile",
                    tint = DesignTokens.Colors.OnSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
        
        // Profile Selection Dropdown Menu
        DropdownMenu(
            expanded = showMenu,
            onDismissRequest = { showMenu = false },
            modifier = Modifier
                .fillMaxWidth(0.85f)
                .widthIn(max = 320.dp)
        ) {
        // Vendor Profiles
        if (vendorProfiles.isNotEmpty()) {
            DropdownMenuItem(
                text = { 
                    Text(
                        text = "Vendor Profiles",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                },
                onClick = { },
                enabled = false
            )
            vendorProfiles.forEach { profile ->
                ProfileMenuItem(
                    profile = profile,
                    isActive = activeProfile?.id == profile.id,
                    isSwitching = isSwitching,
                    onClick = {
                        if (!isSwitching && activeProfile?.id != profile.id) {
                            onProfileSelected(profile)
                            showMenu = false
                        }
                    }
                )
            }
            if (customerProfiles.isNotEmpty() || employeeProfiles.isNotEmpty()) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
            }
        }

        // Customer Profiles
        if (customerProfiles.isNotEmpty()) {
            if (vendorProfiles.isEmpty() && employeeProfiles.isNotEmpty()) {
                DropdownMenuItem(
                    text = { 
                        Text(
                            text = "Customer Profiles",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            fontSize = 10.sp,
                            letterSpacing = 1.sp
                        )
                    },
                    onClick = { },
                    enabled = false
                )
            }
            customerProfiles.forEach { profile ->
                ProfileMenuItem(
                    profile = profile,
                    isActive = activeProfile?.id == profile.id,
                    isSwitching = isSwitching,
                    onClick = {
                        if (!isSwitching && activeProfile?.id != profile.id) {
                            onProfileSelected(profile)
                            showMenu = false
                        }
                    }
                )
            }
            if (employeeProfiles.isNotEmpty()) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
            }
        }

        // Employee Profiles - Only show if user has been assigned as employee by a vendor (has organization)
        if (employeeProfiles.isNotEmpty()) {
            DropdownMenuItem(
                text = { 
                    Text(
                        text = "Employee Profiles",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                },
                onClick = { },
                enabled = false
            )
            employeeProfiles.forEach { profile ->
                ProfileMenuItem(
                    profile = profile,
                    isActive = activeProfile?.id == profile.id,
                    isSwitching = isSwitching,
                    onClick = {
                        if (!isSwitching && activeProfile?.id != profile.id) {
                            onProfileSelected(profile)
                            showMenu = false
                        }
                    }
                )
            }
        }
        }
    }
}

@Composable
private fun ProfileMenuItem(
    profile: UserProfile,
    isActive: Boolean,
    isSwitching: Boolean,
    onClick: () -> Unit
) {
    DropdownMenuItem(
        text = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                ) {
                    Icon(
                        imageVector = getProfileIcon(profile.profileType),
                        contentDescription = null,
                        tint = when (profile.profileType) {
                            "vendor" -> DesignTokens.Colors.Primary
                            "employee" -> DesignTokens.Colors.Secondary
                            "customer" -> DesignTokens.Colors.Info
                            else -> DesignTokens.Colors.Gray500
                        },
                        modifier = Modifier.size(18.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = getProfileDisplayName(profile) ?: profile.profileType,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = if (isActive) FontWeight.Bold else FontWeight.Normal,
                            color = DesignTokens.Colors.OnSurface
                        )
                        if (profile.roles?.isNotEmpty() == true) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = profile.roles[0].name,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant,
                                fontSize = 11.sp
                            )
                        }
                    }
                }
                if (isActive) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Active",
                        tint = DesignTokens.Colors.Primary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        },
        onClick = onClick,
        enabled = !isSwitching && !isActive,
        modifier = Modifier.background(
            if (isActive) DesignTokens.Colors.Primary50.copy(alpha = 0.3f) 
            else Color.Transparent
        )
    )
}

private fun getProfileIcon(profileType: String?): androidx.compose.ui.graphics.vector.ImageVector {
    return when (profileType) {
        "vendor" -> Icons.Default.BusinessCenter
        "employee" -> Icons.Default.People
        "customer" -> Icons.Default.ShoppingCart
        else -> Icons.Default.Person
    }
}

private fun getProfileDisplayName(profile: UserProfile?): String? {
    return when (profile?.profileType) {
        "vendor" -> profile.organizationName ?: "Vendor"
        "employee" -> profile.organizationName ?: profile.organization?.name ?: "Employee"
        "customer" -> "Customer"
        else -> profile?.profileTypeDisplay ?: profile?.profileType
    }
}
