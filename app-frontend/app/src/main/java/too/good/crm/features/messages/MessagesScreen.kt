package too.good.crm.features.messages

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.model.UserProfile
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.utils.LogoutHandler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    // Load profiles on initial load if not already loaded
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    AppScaffoldWithDrawer(
        title = "Messages",
        activeMode = activeMode,
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    // Update user session with new profile data
                    val profiles = user.profiles ?: emptyList()
                    val primaryProfile = user.primaryProfile ?: profile
                    
                    val hasCustomerProfile = profiles.any { it.profileType == "customer" }
                    val hasVendorProfile = profiles.any {
                        it.profileType == "employee" || it.profileType == "vendor"
                    }
                    
                    val userRole = when {
                        hasCustomerProfile && hasVendorProfile -> too.good.crm.data.UserRole.BOTH
                        hasCustomerProfile -> too.good.crm.data.UserRole.CLIENT
                        hasVendorProfile -> too.good.crm.data.UserRole.VENDOR
                        else -> too.good.crm.data.UserRole.CLIENT
                    }
                    
                    // Update active mode based on new profile type
                    val newMode = when (primaryProfile.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        "customer" -> ActiveMode.CLIENT
                        else -> ActiveMode.VENDOR
                    }
                    
                    // Update UserSession
                    UserSession.currentProfile = too.good.crm.data.AppUserProfile(
                        id = user.id,
                        name = "${user.firstName} ${user.lastName}",
                        email = user.email,
                        role = userRole,
                        organizationId = primaryProfile.organizationId ?: 0,
                        organizationName = primaryProfile.organizationName 
                            ?: primaryProfile.organization?.name 
                            ?: "Unknown",
                        activeMode = newMode
                    )
                    UserSession.activeMode = newMode
                    activeMode = newMode
                    
                    // Navigate based on profile type
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        "employee", "vendor" -> onNavigate("dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { error ->
                    // Error is already handled in ProfileViewModel
                }
            )
        },
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when switching modes
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = {
            // Perform proper logout using centralized handler
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
                .padding(DesignTokens.Spacing.Space4)
        ) {
            // Coming Soon Card
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
                        .padding(DesignTokens.Padding.CardPaddingComfortable),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Message,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = DesignTokens.Colors.Primary
                    )
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                    Text(
                        text = "Messages",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
                    Text(
                        text = "Stay connected with your team and customers",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                    
                    // Feature list
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        FeatureItem("Real-time messaging")
                        FeatureItem("Group conversations")
                        FeatureItem("File sharing")
                        FeatureItem("Message history")
                    }
                    
                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                    
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = DesignTokens.Colors.Info100
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(DesignTokens.Spacing.Space3),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Info,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
                            Text(
                                text = "This feature is coming soon! We're working hard to bring you an amazing messaging experience.",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.Info
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FeatureItem(text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = null,
            tint = DesignTokens.Colors.Success,
            modifier = Modifier.size(20.dp)
        )
        Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = DesignTokens.Colors.OnSurface
        )
    }
}
