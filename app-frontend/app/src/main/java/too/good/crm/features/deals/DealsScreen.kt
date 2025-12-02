package too.good.crm.features.deals

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.material3.pulltorefresh.rememberPullToRefreshState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import too.good.crm.utils.LogoutHandler
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun DealsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    
    val viewModel: DealsViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    var searchQuery by remember { mutableStateOf("") }
    var filterStage by remember { mutableStateOf<String?>(null) }
    val pullToRefreshState = rememberPullToRefreshState()
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }
    
    // Search with debounce
    LaunchedEffect(searchQuery) {
        if (searchQuery.isNotEmpty()) {
            viewModel.searchDeals(searchQuery)
        } else if (filterStage == null) {
            viewModel.loadDeals()
        }
    }
    
    // Filter by stage
    LaunchedEffect(filterStage) {
        if (filterStage != null) {
            viewModel.filterByStage(filterStage)
        } else if (searchQuery.isEmpty()) {
            viewModel.loadDeals()
        }
    }

    AppScaffoldWithDrawer(
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
        title = "Deals",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
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
        PullToRefreshBox(
            isRefreshing = uiState.isRefreshing,
            onRefresh = { viewModel.loadDeals(refresh = true) },
            state = pullToRefreshState,
            modifier = Modifier.fillMaxSize()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(DesignTokens.Colors.Background)
                    .padding(paddingValues)
                    .padding(
                        responsivePadding(
                            compact = DesignTokens.Spacing.Space4,
                            medium = DesignTokens.Spacing.Space5,
                            expanded = DesignTokens.Spacing.Space6
                        )
                    ),
                verticalArrangement = Arrangement.spacedBy(
                    responsiveSpacing(
                        compact = DesignTokens.Spacing.Space4,
                        medium = DesignTokens.Spacing.Space5
                    )
                )
            ) {
            // Header Section
            Column(
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                Text(
                    text = "Deals",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = "Track your sales pipeline and manage deals",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }

            // Stats Grid - Responsive (1/2/3/4 columns based on screen)
            ResponsiveGrid(
                compactColumns = 2,
                mediumColumns = 4,
                expandedColumns = 4
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "TOTAL DEALS",
                        value = uiState.totalCount.toString(),
                        icon = {
                            Icon(
                                Icons.Default.Description,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Primary
                            )
                        },
                        change = "+12%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f),
                        iconTintColor = DesignTokens.Colors.Primary,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "ACTIVE",
                        value = uiState.deals.count { it.status == "open" }.toString(),
                        icon = {
                            Icon(
                                Icons.AutoMirrored.Filled.TrendingUp,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Warning
                            )
                        },
                        change = "+8%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.WarningLight,
                        iconTintColor = DesignTokens.Colors.Warning,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "WON",
                        value = uiState.deals.count { it.isWon }.toString(),
                        icon = {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Success
                            )
                        },
                        change = "+15%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.SuccessLight,
                        iconTintColor = DesignTokens.Colors.Success,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    val pipelineValue = uiState.deals.filter { it.status == "open" }.sumOf { 
                        it.value.toDoubleOrNull() ?: 0.0 
                    }.toInt()
                    StatCard(
                        title = "PIPELINE VALUE",
                        value = if (pipelineValue >= 1000) "$${pipelineValue / 1000}K" else "$$pipelineValue",
                        icon = {
                            Icon(
                                Icons.Default.AttachMoney,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Secondary
                            )
                        },
                        change = "+23%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.SecondaryContainer,
                        iconTintColor = DesignTokens.Colors.Secondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search deals...") },
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
                    unfocusedContainerColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Deals List
            when {
                uiState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                uiState.error != null -> {
                    ResponsiveCard {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Error,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Error,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = uiState.error ?: "Failed to load deals",
                                color = DesignTokens.Colors.Error,
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                }
                uiState.deals.isEmpty() -> {
                    ResponsiveCard {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.Search,
                                contentDescription = null,
                                tint = DesignTokens.Colors.OnSurfaceVariant,
                                modifier = Modifier.size(48.dp)
                            )
                            Text(
                                text = "No deals found",
                                style = MaterialTheme.typography.titleMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
                else -> {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.deals) { deal ->
                            DealCard(
                                deal = deal,
                                onView = { onNavigate("deal-detail/${deal.id}") },
                                onEdit = { onNavigate("deal-edit/${deal.id}") }
                            )
                        }
                    }
                }
            }
        }
        }
    }
}

@Composable
fun DealCard(
    deal: too.good.crm.data.model.DealListItem,
    onView: () -> Unit,
    onEdit: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onView() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Title and Value
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = deal.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Business,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = deal.customerName ?: "No customer",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    val dealValue = deal.value.toDoubleOrNull() ?: 0.0
                    Text(
                        text = "${deal.currency} ${NumberFormat.getNumberInstance(Locale.US).format(dealValue)}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.Success
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    DealStatusBadge(
                        status = deal.status,
                        stageName = deal.stageName,
                        isWon = deal.isWon,
                        isLost = deal.isLost
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar
            deal.probability?.let { probability ->
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Probability",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Text(
                            text = "$probability%",
                            style = MaterialTheme.typography.bodySmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                        progress = { probability / 100f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = when {
                            probability >= 75 -> DesignTokens.Colors.Success
                            probability >= 50 -> DesignTokens.Colors.Warning
                            else -> DesignTokens.Colors.Error
                        },
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
            }

            // Footer Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                deal.expectedCloseDate?.let { closeDate ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "Close: $closeDate",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }

                deal.assignedToName?.let { assignedTo ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Person,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = assignedTo,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
            }
            
            // Action Buttons
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onView,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(
                        Icons.Default.RemoveRedEye,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View", style = MaterialTheme.typography.bodySmall)
                }
                Button(
                    onClick = onEdit,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    Icon(
                        Icons.Default.Edit,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Edit", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

@Composable
fun DealStatusBadge(status: String, stageName: String?, isWon: Boolean, isLost: Boolean) {
    val (backgroundColor, textColor, text) = when {
        isWon -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Won"
        )
        isLost -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Lost"
        )
        stageName != null -> Triple(
            DesignTokens.Colors.Primary.copy(alpha = 0.1f),
            DesignTokens.Colors.Primary,
            stageName
        )
        else -> Triple(
            DesignTokens.Colors.Info.copy(alpha = 0.1f),
            DesignTokens.Colors.Info,
            status.replaceFirstChar { it.uppercase() }
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
fun StatCard(
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

