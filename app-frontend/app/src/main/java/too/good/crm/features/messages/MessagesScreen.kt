package too.good.crm.features.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Message
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.model.Conversation
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.utils.LogoutHandler
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

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
    
    val viewModel: MessagesViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    var searchQuery by remember { mutableStateOf("") }
    var showNewMessageDialog by remember { mutableStateOf(false) }
    var isRefreshing by remember { mutableStateOf(false) }
    val pullToRefreshState = rememberPullToRefreshState()
    
    // Load profiles on initial load
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Load recipients for new message dialog
    LaunchedEffect(Unit) {
        viewModel.loadRecipients()
    }
    
    // Poll for updates every 10 seconds
    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(10000) // 10 seconds
            viewModel.refresh()
        }
    }
    
    // Handle pull-to-refresh
    suspend fun handleRefresh() {
        isRefreshing = true
        viewModel.refresh()
        // Wait a moment to ensure the UI updates
        kotlinx.coroutines.delay(500)
        isRefreshing = false
    }
    
    // Show new message dialog
    if (showNewMessageDialog) {
        NewMessageDialog(
            recipients = uiState.recipients,
            isLoading = uiState.isLoadingRecipients,
            onDismiss = { showNewMessageDialog = false },
            onSelectRecipient = { recipient ->
                // Navigate to chat with selected recipient
                onNavigate("chat/${recipient.id}")
            }
        )
    }
    
    // Filter conversations by search query
    val filteredConversations = remember(uiState.conversations, searchQuery) {
        if (searchQuery.isEmpty()) {
            uiState.conversations
        } else {
            uiState.conversations.filter { conversation ->
                val participant = conversation.otherParticipant
                val name = "${participant.firstName ?: ""} ${participant.lastName ?: ""}".trim()
                val email = participant.email
                name.contains(searchQuery, ignoreCase = true) ||
                email.contains(searchQuery, ignoreCase = true)
            }
        }
    }
    
    // Calculate total unread count
    val totalUnreadCount = remember(uiState.conversations) {
        uiState.conversations.sumOf { it.unreadCount }
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
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
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
                .padding(DesignTokens.Spacing.Space4),
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
        ) {
            // Header with unread count
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Messages",
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    if (totalUnreadCount > 0) {
                        Badge(
                            containerColor = DesignTokens.Colors.Error
                        ) {
                            Text(
                                text = totalUnreadCount.toString(),
                                style = MaterialTheme.typography.labelSmall,
                                color = DesignTokens.Colors.White
                            )
                        }
                    }
                }
            }
            
            // Telegram Link Button
            TelegramLinkButton()
            
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search conversations...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search")
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
                    focusedContainerColor = DesignTokens.Colors.Surface,
                    unfocusedContainerColor = DesignTokens.Colors.Surface
                ),
                singleLine = true
            )
            
            // Conversations List with Pull-to-Refresh
            Card(
                modifier = Modifier.fillMaxSize(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(
                    containerColor = DesignTokens.Colors.Surface
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                PullToRefreshBox(
                    isRefreshing = isRefreshing,
                    onRefresh = {
                        scope.launch {
                            handleRefresh()
                        }
                    },
                    state = pullToRefreshState,
                    modifier = Modifier.fillMaxSize()
                ) {
                    when {
                        uiState.isLoading && !isRefreshing -> {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    CircularProgressIndicator()
                                    Text(
                                        text = "Loading conversations...",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                }
                            }
                        }
                        uiState.error != null && !isRefreshing -> {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Error,
                                        contentDescription = null,
                                        tint = DesignTokens.Colors.Error,
                                        modifier = Modifier.size(48.dp)
                                    )
                                    Text(
                                        text = uiState.error ?: "Failed to load conversations",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = DesignTokens.Colors.Error
                                    )
                                    Button(
                                        onClick = { viewModel.loadConversations() }
                                    ) {
                                        Text("Retry")
                                    }
                                }
                            }
                        }
                        filteredConversations.isEmpty() && !isRefreshing -> {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                    Icon(
                                        Icons.AutoMirrored.Filled.Message,
                                        contentDescription = null,
                                        tint = DesignTokens.Colors.OnSurfaceVariant,
                                        modifier = Modifier.size(64.dp)
                                    )
                                    Text(
                                        text = if (searchQuery.isEmpty()) "No conversations yet" else "No conversations found",
                                        style = MaterialTheme.typography.titleMedium,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                    // Role-specific empty state message
                                    Text(
                                        text = if (searchQuery.isEmpty()) {
                                            when (profileState.activeProfile?.profileType) {
                                                "vendor" -> "Choose a contact from the left to start messaging, or create a new conversation to reach out to your employees and customers."
                                                "employee" -> "Choose a contact from the left to start messaging, or create a new conversation to message your vendor or other team members."
                                                "customer" -> "Choose a contact from the left to continue a conversation. Only vendors and employees can initiate new conversations."
                                                else -> "Pull down to refresh or tap + to start a conversation"
                                            }
                                        } else {
                                            "Try a different search term"
                                        },
                                        style = MaterialTheme.typography.bodySmall,
                                        color = DesignTokens.Colors.OnSurfaceVariant,
                                        textAlign = TextAlign.Center
                                    )
                                }
                            }
                        }
                        else -> {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(vertical = 8.dp)
                            ) {
                                items(filteredConversations) { conversation ->
                                    ConversationItem(
                                        conversation = conversation,
                                        onClick = {
                                            onNavigate("chat/${conversation.otherParticipant.id}")
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
        }
        
        // Floating Action Button
        FloatingActionButton(
            onClick = { showNewMessageDialog = true },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp),
            containerColor = DesignTokens.Colors.Primary,
            contentColor = DesignTokens.Colors.OnPrimary
        ) {
            Icon(Icons.Default.Add, contentDescription = "New Message")
        }
    }
}

@Composable
fun ConversationItem(
    conversation: Conversation,
    onClick: () -> Unit
) {
    val context = LocalContext.current
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(DesignTokens.Colors.Primary.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            val participant = conversation.otherParticipant
            val displayName = "${participant.firstName ?: ""} ${participant.lastName ?: ""}".trim()
                .ifEmpty { participant.email }
            val initial = displayName.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
            Text(
                text = initial,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.Primary
            )
        }
        
        // Content
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(end = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Name with pinned indicator
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f, fill = false)
                ) {
                    val participant = conversation.otherParticipant
                    val displayName = "${participant.firstName ?: ""} ${participant.lastName ?: ""}".trim()
                        .ifEmpty { participant.email }
                    Text(
                        text = displayName,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                
                // Timestamp
                conversation.lastMessage?.createdAt?.let { timestamp ->
                    Text(
                        text = formatTimeAgo(timestamp, context),
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            // Last message with unread badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = conversation.lastMessage?.content ?: "No messages yet",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (conversation.unreadCount > 0) 
                        DesignTokens.Colors.OnSurface 
                    else 
                        DesignTokens.Colors.OnSurfaceVariant,
                    fontWeight = if (conversation.unreadCount > 0) 
                        FontWeight.SemiBold 
                    else 
                        FontWeight.Normal,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                
                if (conversation.unreadCount > 0) {
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .clip(CircleShape)
                            .background(DesignTokens.Colors.Error),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = conversation.unreadCount.toString(),
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.White,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }
    }
}

fun formatTimeAgo(timestamp: String, context: android.content.Context): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val date = sdf.parse(timestamp) ?: return timestamp
        
        val now = Date()
        val diffInMillis = now.time - date.time
        val diffInMinutes = diffInMillis / (1000 * 60)
        val diffInHours = diffInMillis / (1000 * 60 * 60)
        val diffInDays = diffInMillis / (1000 * 60 * 60 * 24)
        
        when {
            diffInMinutes < 1 -> "Just now"
            diffInMinutes < 60 -> "${diffInMinutes}m ago"
            diffInHours < 24 -> "${diffInHours}h ago"
            diffInDays < 7 -> "${diffInDays}d ago"
            else -> {
                val displayFormat = SimpleDateFormat("MMM d", Locale.getDefault())
                displayFormat.format(date)
            }
        }
    } catch (e: Exception) {
        timestamp
    }
}
