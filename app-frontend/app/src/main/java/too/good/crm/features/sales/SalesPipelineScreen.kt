package too.good.crm.features.sales

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.model.*
import too.good.crm.data.repository.AuthRepository
import too.good.crm.data.repository.CustomerRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.utils.LogoutHandler
import java.text.NumberFormat
import java.util.*
import kotlin.math.roundToInt

/**
 * Sales Pipeline Screen
 * 
 * Features:
 * - Horizontally scrollable pipeline board with columns for each stage
 * - Drag and drop to move leads/deals between stages
 * - Automatic customer creation when lead moved to "Closed Won"
 * - Visual feedback during drag operations
 * - Statistics overview
 * 
 * Matches web frontend: web-frontend/src/features/deals/pages/SalesPage.tsx
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalesPipelineScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val viewModel = remember { SalesPipelineViewModel() }
    val uiState by viewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    val pullToRefreshState = rememberPullToRefreshState()
    val customerRepository = remember { CustomerRepository.getInstance(context) }
    
    // Search and filter state
    var searchQuery by remember { mutableStateOf("") }
    var showFilters by remember { mutableStateOf(false) }
    
    // Create Lead Dialog state
    var showCreateLeadDialog by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
        viewModel.loadAll()
    }

    // Snackbar for conversion messages
    val snackbarHostState = remember { SnackbarHostState() }
    
    // Listen for conversion success
    LaunchedEffect(uiState.showClosedWonSuccess) {
        if (uiState.showClosedWonSuccess) {
            scope.launch {
                val leadName = uiState.lastConvertedLeadName ?: "Lead"
                val result = snackbarHostState.showSnackbar(
                    message = "🎉 $leadName moved to Closed Won and converted to customer!",
                    actionLabel = "View Customers",
                    duration = SnackbarDuration.Long
                )
                if (result == SnackbarResult.ActionPerformed) {
                    onNavigate("customers")
                }
                viewModel.dismissClosedWonSuccess()
            }
        }
    }

    AppScaffoldWithDrawer(
        title = "Sales",
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
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
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
        Box(modifier = Modifier.fillMaxSize()) {
            PullToRefreshBox(
            isRefreshing = uiState.isRefreshing,
            onRefresh = { viewModel.refresh() },
            state = pullToRefreshState,
            modifier = Modifier.fillMaxSize()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(DesignTokens.Colors.Background)
                    .padding(paddingValues)
            ) {
                // Header with Search and Actions
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White)
                        .padding(16.dp)
                ) {
                    // Title and Subtitle - Matches web design
                    Text(
                        text = "Sales Pipeline",
                        style = MaterialTheme.typography.headlineLarge,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface,
                        fontSize = 32.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Manage deals and leads through every stage of your sales process.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.8f),
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )
                    
                    Spacer(modifier = Modifier.height(20.dp))
                    
                    // Search Bar with improved styling
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = { 
                            searchQuery = it
                            viewModel.search(it)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { 
                            Text(
                                "Search deals, leads, or customers...",
                                color = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.6f)
                            ) 
                        },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Search, 
                                contentDescription = "Search",
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = {
                                    searchQuery = ""
                                    viewModel.search("")
                                }) {
                                    Icon(
                                        Icons.Default.Close, 
                                        contentDescription = "Clear",
                                        tint = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedBorderColor = DesignTokens.Colors.OutlineVariant,
                            focusedBorderColor = DesignTokens.Colors.Primary
                        )
                    )
                }

                // Statistics Overview
                PipelineStatistics(
                    pipelineValue = uiState.pipelineValue,
                    openDeals = uiState.openDealsCount,
                    wonDeals = uiState.wonDealsCount,
                    wonValue = uiState.wonValue,
                    winRate = uiState.winRate,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
                )

                // Pipeline Board Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Pipeline Board",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.TextPrimary
                        )
                        Text(
                            text = "${uiState.totalDealsCount} deals, ${uiState.totalLeadsCount} leads",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                    
                    Button(
                        onClick = { showCreateLeadDialog = true },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF9C27B0) // Purple matching web frontend
                        )
                    ) {
                        Icon(
                            Icons.Default.Add,
                            contentDescription = "Add Lead",
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("New Lead")
                    }
                }

                // Horizontal Scrollable Pipeline Board
                if (uiState.isLoading) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = DesignTokens.Colors.Primary)
                    }
                } else {
                    HorizontalPipelineBoard(
                        stages = uiState.stages,
                        dealsGroupedByStage = uiState.dealsGroupedByStage,
                        leadsGroupedByStage = uiState.leadsGroupedByStage,
                        onDealClick = { deal ->
                            onNavigate("deals/${deal.id}")
                        },
                        onLeadClick = { lead ->
                            onNavigate("leads/${lead.id}")
                        },
                        onMoveLeadToNextStage = { lead, nextStageKey ->
                            android.util.Log.d("SalesPipelineScreen", "onMoveLeadToNextStage: lead ${lead.id}, nextStageKey $nextStageKey")
                            // Find the next stage from the stages list
                            val nextStage = uiState.stages.find { it.key == nextStageKey }
                            android.util.Log.d("SalesPipelineScreen", "Found nextStage: $nextStage, id: ${nextStage?.id}, key: ${nextStage?.key}, label: ${nextStage?.label}")
                            
                            // Always call the API - backend can find stage by key and name even without ID
                            nextStage?.let { stage ->
                                android.util.Log.d("SalesPipelineScreen", "Calling viewModel.moveLeadToStage(leadId=${lead.id}, stageId=${stage.id}, stageKey=${stage.key}, stageName=${stage.label})")
                                viewModel.moveLeadToStage(
                                    leadId = lead.id,
                                    stageId = stage.id,
                                    stageKey = stage.key,
                                    stageName = stage.label,
                                    onSuccess = { 
                                        android.util.Log.d("SalesPipelineScreen", "Lead moved successfully")
                                    }
                                )
                            } ?: android.util.Log.e("SalesPipelineScreen", "nextStage not found for key: $nextStageKey")
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f)
                    )
                }

                // Error Snackbar
                uiState.error?.let { error ->
                    LaunchedEffect(error) {
                        snackbarHostState.showSnackbar(
                            message = error,
                            duration = SnackbarDuration.Short
                        )
                        viewModel.clearError()
                    }
                }
            }
        }
            
        // Snackbar Host positioned at the bottom
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp)
        )
        }
    }
    
    // Create Lead Dialog
    CreateLeadDialog(
        isOpen = showCreateLeadDialog,
        isLoading = uiState.isCreatingLead,
        onDismiss = { showCreateLeadDialog = false },
        onSubmit = { formData ->
            // Get organization ID from active profile
            val organizationId = profileState.activeProfile?.organization?.id
            
            viewModel.createLead(
                organizationId = organizationId,
                formData = formData,
                onSuccess = {
                    showCreateLeadDialog = false
                    scope.launch {
                        snackbarHostState.showSnackbar(
                            message = "Lead created successfully! 🎉",
                            duration = SnackbarDuration.Short
                        )
                    }
                }
            )
        }
    )
}
