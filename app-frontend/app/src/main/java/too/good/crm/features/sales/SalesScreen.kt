package too.good.crm.features.sales

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.data.repository.AuthRepository
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.utils.LogoutHandler
import too.good.crm.data.model.DealListItem
import too.good.crm.data.model.PipelineStage
import too.good.crm.data.model.CreateDealRequest
import too.good.crm.features.deals.CreateDealDialog
import too.good.crm.features.deals.CreateDealData
import too.good.crm.data.repository.CustomerRepository
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SalesScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val authRepository = remember { AuthRepository(context) }
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    val salesViewModel = remember { SalesViewModel() }
    val salesState by salesViewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    val customerRepository = remember { CustomerRepository.getInstance(context) }
    
    // Stage move dialog state
    var showMoveStageDialog by remember { mutableStateOf(false) }
    var selectedDeal by remember { mutableStateOf<DealListItem?>(null) }
    var selectedStageId by remember { mutableStateOf<Int?>(null) }
    
    // Create deal dialog state
    var showCreateDealDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
        // Force load deals and pipelines when screen opens
        android.util.Log.d("SalesScreen", "🚀 Screen opened - loading deals and pipelines...")
        salesViewModel.loadDeals()
        salesViewModel.loadPipelines()
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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
        ) {
            // Search bar
            var searchQuery by remember { mutableStateOf("") }
            
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
            
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { query ->
                    searchQuery = query
                    salesViewModel.searchDeals(query)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Search deals...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search")
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = {
                            searchQuery = ""
                            salesViewModel.searchDeals("")
                        }) {
                            Icon(Icons.Default.Close, contentDescription = "Clear")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp)
            )

            // Deals list
            when {
                salesState.isLoading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }
                salesState.deals.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                Icons.Default.Description,
                                contentDescription = null,
                                modifier = Modifier.size(48.dp),
                                tint = DesignTokens.Colors.OnSurfaceVariant
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
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(salesState.deals) { deal ->
                            SalesDealCard(
                                deal = deal,
                                stages = salesState.stages,
                                onView = { onNavigate("deal-detail/${deal.id}") },
                                onMoveStage = {
                                    selectedDeal = deal
                                    selectedStageId = deal.stageId
                                    showMoveStageDialog = true
                                }
                            )
                        }
                    }
                }
            }
            }
            
            // FloatingActionButton for creating new deal
            FloatingActionButton(
                onClick = { showCreateDealDialog = true },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp),
                containerColor = DesignTokens.Colors.Primary,
                contentColor = DesignTokens.Colors.OnPrimary
            ) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = "Create Deal",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
        
        // Create Deal Dialog
        if (showCreateDealDialog) {
        CreateDealDialog(
            onDismiss = { showCreateDealDialog = false },
            onCreateDeal = { dealData ->
                scope.launch {
                    android.util.Log.d("SalesScreen", "📤 Starting deal creation process...")
                    android.util.Log.d("SalesScreen", "Customer search: ${dealData.customerName}")
                    
                    // Find customer by name or email
                    customerRepository.getCustomers(search = dealData.customerName)
                        .onSuccess { customers ->
                            android.util.Log.d("SalesScreen", "Found ${customers.size} customers")
                            
                            // Use the first customer from search results (backend already filtered)
                            // Or try to match more precisely
                            val customer = customers.firstOrNull { 
                                // Exact match first
                                it.name.equals(dealData.customerName, ignoreCase = true) ||
                                it.email.equals(dealData.customerName, ignoreCase = true)
                            } ?: customers.firstOrNull { 
                                // Then partial match
                                it.name.contains(dealData.customerName, ignoreCase = true) ||
                                it.email.contains(dealData.customerName, ignoreCase = true)
                            } ?: customers.firstOrNull() // Or just use the first result
                            
                            android.util.Log.d("SalesScreen", "Matched customer: ${customer?.name} (ID: ${customer?.id})")
                            
                            if (customer != null) {
                                // Get default pipeline or first pipeline
                                val defaultPipeline = salesState.pipelines.firstOrNull { it.isDefault }
                                    ?: salesState.pipelines.firstOrNull()
                                
                                // Find stage ID by stage name (match the stage key/name from dialog)
                                val stageId = salesState.stages.find { stage ->
                                    val stageNameLower = stage.name.lowercase()
                                    val dealStageLower = dealData.stage.lowercase()
                                    stageNameLower.contains(dealStageLower) ||
                                    dealStageLower.contains(stageNameLower) ||
                                    // Map common stage names
                                    (dealStageLower == "lead" && (stageNameLower.contains("lead") || stageNameLower.contains("new"))) ||
                                    (dealStageLower == "qualified" && stageNameLower.contains("qualif")) ||
                                    (dealStageLower == "proposal" && stageNameLower.contains("proposal")) ||
                                    (dealStageLower == "negotiation" && stageNameLower.contains("negotiat")) ||
                                    (dealStageLower == "closed-won" && (stageNameLower.contains("won") || (stageNameLower.contains("close") && !stageNameLower.contains("lost")))) ||
                                    (dealStageLower == "closed-lost" && stageNameLower.contains("lost"))
                                }?.id ?: salesState.stages.firstOrNull()?.id
                                
                                // Get active organization ID from profile
                                val organizationId = profileState.activeProfile?.organization?.id
                                
                                android.util.Log.d("SalesScreen", "Organization ID: $organizationId")
                                android.util.Log.d("SalesScreen", "Stage ID: $stageId")
                                android.util.Log.d("SalesScreen", "Pipeline: ${defaultPipeline?.id}")
                                
                                if (organizationId == null) {
                                    android.util.Log.e("SalesScreen", "❌ No active organization")
                                    return@launch
                                }
                                
                                if (stageId == null) {
                                    android.util.Log.w("SalesScreen", "⚠️  No stages available - proceeding without stage (backend may set default)")
                                    // Continue anyway - matching web frontend behavior
                                    // Backend will handle default stage assignment
                                }
                                
                                // Convert value string to Double
                                val valueDouble = dealData.value.toDoubleOrNull()
                                if (valueDouble == null) {
                                    android.util.Log.e("SalesScreen", "❌ Invalid value: ${dealData.value}")
                                    return@launch
                                }
                                
                                val createRequest = CreateDealRequest(
                                    organization = organizationId,
                                    title = dealData.title,
                                    customer = customer.id,
                                    value = valueDouble,
                                    currency = "USD",
                                    pipeline = defaultPipeline?.id,
                                    stage = stageId,
                                    probability = dealData.probability,
                                    expectedCloseDate = dealData.expectedCloseDate.takeIf { it.isNotBlank() },
                                    description = dealData.description.takeIf { it.isNotBlank() },
                                    priority = "medium"
                                )
                                
                                android.util.Log.d("SalesScreen", "📤 Creating deal: $createRequest")
                                
                                salesViewModel.createDeal(createRequest) {
                                    showCreateDealDialog = false
                                }
                            } else {
                                android.util.Log.e("SalesScreen", "❌ Customer not found: ${dealData.customerName}")
                                // Customer not found - show error
                                // TODO: Enhance to show customer picker or allow creating customer
                            }
                        }
                        .onFailure { error ->
                            android.util.Log.e("SalesScreen", "❌ Error fetching customers: ${error.message}", error)
                            // Handle error fetching customers
                            // TODO: Show error message
                        }
                }
            },
            isCreating = salesState.isCreating,
            error = salesState.error
        )
        }
        
        // Move Stage Dialog
        if (showMoveStageDialog && selectedDeal != null) {
        MoveStageDialog(
            deal = selectedDeal!!,
            stages = salesState.stages,
            selectedStageId = selectedStageId,
            isMoving = salesState.isMovingDeal,
            onDismiss = {
                showMoveStageDialog = false
                selectedDeal = null
                selectedStageId = null
            },
            onConfirm = { stageId: Int ->
                selectedDeal?.let { deal ->
                    salesViewModel.moveDealToStage(
                        dealId = deal.id,
                        stageId = stageId,
                        onSuccess = {
                            showMoveStageDialog = false
                            selectedDeal = null
                            selectedStageId = null
                        }
                    )
                }
            }
        )
        }
        
        // Show error snackbar
        salesState.error?.let { error ->
            LaunchedEffect(error) {
                // Error will be shown via snackbar if needed
                salesViewModel.clearError()
            }
        }
    }
}

/**
 * Deal card for sales screen with stage tag and move stage option
 * Matches web frontend design but in list format
 */
@Composable
fun SalesDealCard(
    deal: DealListItem,
    stages: List<PipelineStage>,
    onView: () -> Unit,
    onMoveStage: () -> Unit
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
            // Title and Stage Tag
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
            Text(
                        text = deal.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.OnSurface
            )
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Stage Tag - matches web frontend colors
                    deal.stageName?.let { stageName ->
                        PipelineStageTag(
                            stageName = stageName,
                            stageId = deal.stageId
                        )
                    } ?: run {
                        // If no stage name, show default tag
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f)
                        ) {
                            Text(
                                text = "No Stage",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant,
                                fontWeight = FontWeight.Medium,
                                fontSize = 11.sp
                            )
                        }
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
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Customer Info
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

            Spacer(modifier = Modifier.height(12.dp))

            // Footer with actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left side: Probability and date
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    deal.probability?.let { probability ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "$probability%",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Medium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "prob",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                    
                    deal.expectedCloseDate?.let { closeDate ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.CalendarToday,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = closeDate,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }

                // Right side: Move stage button
                TextButton(
                    onClick = onMoveStage,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Icon(
                        Icons.Default.ArrowForward,
                        contentDescription = "Move Stage",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
            Text(
                        text = "Move",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }
        }
    }
}

/**
 * Pipeline Stage Tag with colors matching web frontend
 * Web frontend colors:
 * - Lead: blue
 * - Qualified: cyan
 * - Proposal: purple
 * - Negotiation: orange
 * - Closed Won: green
 */
@Composable
fun PipelineStageTag(
    stageName: String,
    stageId: Int? = null
) {
    val stageNameLower = stageName.lowercase().trim()
    
    // Map stage names to colors (matching web frontend)
    val (backgroundColor, textColor) = when {
        stageNameLower.contains("lead") || stageNameLower == "lead" -> 
            Pair(DesignTokens.Colors.Info.copy(alpha = 0.1f), DesignTokens.Colors.Info)
        
        stageNameLower.contains("qualified") || stageNameLower == "qualified" -> 
            Pair(Color(0xFF06B6D4).copy(alpha = 0.1f), Color(0xFF06B6D4)) // Cyan
        
        stageNameLower.contains("proposal") || stageNameLower == "proposal" -> 
            Pair(DesignTokens.Colors.StatusScheduled.copy(alpha = 0.1f), DesignTokens.Colors.StatusScheduled) // Purple
        
        stageNameLower.contains("negotiation") || stageNameLower == "negotiation" -> 
            Pair(DesignTokens.Colors.Warning.copy(alpha = 0.1f), DesignTokens.Colors.Warning) // Orange
        
        stageNameLower.contains("closed") && (stageNameLower.contains("won") || stageNameLower.contains("win")) -> 
            Pair(DesignTokens.Colors.Success.copy(alpha = 0.1f), DesignTokens.Colors.Success) // Green
        
        stageNameLower.contains("closed") && stageNameLower.contains("lost") -> 
            Pair(DesignTokens.Colors.Error.copy(alpha = 0.1f), DesignTokens.Colors.Error) // Red
        
        else -> 
            Pair(DesignTokens.Colors.Primary.copy(alpha = 0.1f), DesignTokens.Colors.Primary)
    }

    Surface(
        shape = RoundedCornerShape(6.dp),
        color = backgroundColor
    ) {
        Text(
            text = stageName,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium,
            fontSize = 11.sp
        )
    }
}

/**
 * Dialog to move deal to different stage
 * Matches web frontend: select stage from available pipeline stages
 */
@Composable
fun MoveStageDialog(
    deal: DealListItem,
    stages: List<PipelineStage>,
    selectedStageId: Int?,
    isMoving: Boolean,
    onDismiss: () -> Unit,
    onConfirm: (Int) -> Unit
) {
    var currentSelectedStageId by remember { mutableStateOf(selectedStageId) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Move Deal to Stage",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = deal.title,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
                Spacer(modifier = Modifier.height(8.dp))
                
                if (stages.isEmpty()) {
                    Text(
                        text = "No stages available",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.Error
                    )
                } else {
                    stages.forEach { stage ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { currentSelectedStageId = stage.id },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = currentSelectedStageId == stage.id,
                                onClick = { currentSelectedStageId = stage.id }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = stage.name,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                                stage.probability?.let { probability ->
                                    Text(
                                        text = "Probability: $probability%",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    currentSelectedStageId?.let { stageId ->
                        onConfirm(stageId)
                    }
                },
                enabled = currentSelectedStageId != null && !isMoving && stages.isNotEmpty(),
                modifier = Modifier.padding(8.dp)
            ) {
                if (isMoving) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text("Move")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isMoving
            ) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun SalesMetricCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    change: String,
    icon: ImageVector,
    color: Color,
    isPositive: Boolean
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space3)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(DesignTokens.Heights.IconSm)
                )
                Surface(
                    shape = RoundedCornerShape(DesignTokens.Radius.Small),
                    color = if (isPositive) DesignTokens.Colors.Success.copy(alpha = 0.1f) else DesignTokens.Colors.Error.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = change,
                        modifier = Modifier.padding(horizontal = DesignTokens.Spacing.Space2, vertical = DesignTokens.Spacing.Space1),
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        fontWeight = DesignTokens.Typography.FontWeightMedium,
                        fontSize = 11.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))

            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = DesignTokens.Colors.OnSurface,
                fontSize = 20.sp
            )

            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))

            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
fun MonthlyPerformanceCard(
    month: String,
    revenue: Double,
    deals: Int,
    target: Double
) {
    val progress = (revenue / target).toFloat().coerceIn(0f, 1f)
    val percentOfTarget = ((revenue / target) * 100).toInt()

    Card(
        modifier = Modifier.fillMaxWidth(),
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
                Column {
                    Text(
                        text = month,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "$deals deals closed",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }

                Text(
                    text = NumberFormat.getCurrencyInstance(Locale.US).format(revenue),
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = DesignTokens.Colors.Success
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Target Progress",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = "$percentOfTarget% of ${NumberFormat.getCurrencyInstance(Locale.US).format(target)}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp),
                    color = when {
                        progress >= 0.9f -> DesignTokens.Colors.Success
                        progress >= 0.7f -> DesignTokens.Colors.Warning
                        else -> DesignTokens.Colors.Error
                    },
                    trackColor = DesignTokens.Colors.OutlineVariant,
                )
            }
        }
    }
}

@Composable
fun TopPerformerCard(
    name: String,
    revenue: Double,
    deals: Int,
    rank: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Rank Badge
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = when (rank) {
                    1 -> DesignTokens.Colors.ChartYellow.copy(alpha = 0.2f)
                    2 -> DesignTokens.Colors.ChartGray.copy(alpha = 0.2f)
                    3 -> DesignTokens.Colors.ChartOrange.copy(alpha = 0.2f)
                    else -> DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f)
                },
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "#$rank",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = when (rank) {
                            1 -> DesignTokens.Colors.ChartYellow
                            2 -> DesignTokens.Colors.ChartGray
                            3 -> DesignTokens.Colors.ChartOrange
                            else -> DesignTokens.Colors.OnSurfaceVariant
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$deals deals closed",
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }

            Text(
                text = NumberFormat.getCurrencyInstance(Locale.US).format(revenue),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.Success
            )
        }
    }
}

