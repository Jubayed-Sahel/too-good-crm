package too.good.crm.features.client

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.video.VideoCallHelper
import too.good.crm.ui.video.VideoCallPermissionHandler
import too.good.crm.utils.LogoutHandler
import too.good.crm.data.models.CallType
import too.good.crm.data.Resource
import android.widget.Toast
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyVendorsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<VendorStatus?>(null) }
    val vendors = remember { VendorSampleData.getVendors() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    // Load profiles on initial load
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }

    val filteredVendors = vendors.filter { vendor ->
        val matchesSearch = searchQuery.isEmpty() ||
                vendor.name.contains(searchQuery, ignoreCase = true) ||
                vendor.category.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || vendor.status == filterStatus
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
        title = "My Vendors",
        activeMode = activeMode,
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    val primaryProfile = user.primaryProfile ?: profile
                    val newMode = when (primaryProfile.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        else -> ActiveMode.CLIENT
                    }
                    UserSession.activeMode = newMode
                    activeMode = newMode
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { }
            )
        },
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            if (newMode == ActiveMode.VENDOR) {
                onNavigate("dashboard")
            } else {
                onNavigate("client-dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = {
            LogoutHandler.performLogout(
                scope = scope,
                authRepository = authRepository,
                onComplete = {
                    onNavigate("main")
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "My Vendors",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Manage your vendor relationships and track partnerships",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                VendorStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = vendors.size.toString(),
                    color = DesignTokens.Colors.Info
                )
                VendorStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Active",
                    value = vendors.count { it.status == VendorStatus.ACTIVE }.toString(),
                    color = DesignTokens.Colors.Success
                )
                VendorStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Orders",
                    value = vendors.sumOf { it.totalOrders }.toString(),
                    color = DesignTokens.Colors.Info
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search vendors...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = DesignTokens.Colors.Info
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Vendors List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredVendors) { vendor ->
                    VendorCard(vendor = vendor)
                }
            }
        }
    }
}

@Composable
fun VendorCard(vendor: Vendor) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = vendor.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = vendor.category,
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
                VendorStatusBadge(status = vendor.status)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Star,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = DesignTokens.Colors.ActivityNote
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${vendor.rating}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Icon(
                        Icons.Default.ShoppingBag,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = DesignTokens.Colors.Info
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${vendor.totalOrders} orders",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Email,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = vendor.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
                
                // Video/Audio Call Buttons
                if (vendor.userId != null) {
                    VendorCallButtons(userId = vendor.userId)
                }
            }
        }
    }
}

@Composable
fun VendorCallButtons(userId: Int) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var isInitiatingCall by remember { mutableStateOf(false) }
    
    Row(
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        // Video Call Button
        VideoCallPermissionHandler(
            onPermissionsGranted = {
                isInitiatingCall = true
                coroutineScope.launch {
                    val result = VideoCallHelper.initiateCall(
                        recipientId = userId,
                        callType = CallType.VIDEO
                    )
                    isInitiatingCall = false
                    
                    if (result is Resource.Error) {
                        Toast.makeText(
                            context,
                            result.message ?: "Failed to start call",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            },
            onPermissionsDenied = {
                Toast.makeText(
                    context,
                    "Camera and microphone permissions required",
                    Toast.LENGTH_LONG
                ).show()
            }
        ) { requestPermissions ->
            IconButton(
                onClick = { requestPermissions() },
                enabled = !isInitiatingCall,
                modifier = Modifier.size(32.dp)
            ) {
                if (isInitiatingCall) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Icon(
                        imageVector = Icons.Default.Videocam,
                        contentDescription = "Video Call",
                        tint = DesignTokens.Colors.Info,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
        
        // Audio Call Button
        VideoCallPermissionHandler(
            onPermissionsGranted = {
                coroutineScope.launch {
                    val result = VideoCallHelper.initiateCall(
                        recipientId = userId,
                        callType = CallType.AUDIO
                    )
                    
                    if (result is Resource.Error) {
                        Toast.makeText(
                            context,
                            result.message ?: "Failed to start call",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            },
            onPermissionsDenied = {
                Toast.makeText(
                    context,
                    "Microphone permission required",
                    Toast.LENGTH_SHORT
                ).show()
            }
        ) { requestPermissions ->
            IconButton(
                onClick = { requestPermissions() },
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Audio Call",
                    tint = DesignTokens.Colors.Info,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun VendorStatusBadge(status: VendorStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        VendorStatus.ACTIVE -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Active"
        )
        VendorStatus.INACTIVE -> Triple(
            DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f),
            DesignTokens.Colors.OnSurfaceVariant,
            "Inactive"
        )
    }

    Surface(
        shape = RoundedCornerShape(6.dp),
        color = backgroundColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium,
            fontSize = 11.sp
        )
    }
}

@Composable
fun VendorStatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: Color
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
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = color,
                fontSize = 20.sp
            )
        }
    }
}

