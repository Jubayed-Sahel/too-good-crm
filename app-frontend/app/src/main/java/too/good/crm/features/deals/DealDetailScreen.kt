package too.good.crm.features.deals

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.Deal
import too.good.crm.data.model.PipelineStage
import too.good.crm.data.repository.DealRepository
import too.good.crm.ui.components.ResponsiveCard
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.responsivePadding
import too.good.crm.ui.utils.responsiveSpacing
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DealDetailScreen(
    dealId: Int,
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val repository = remember { DealRepository() }
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }
    
    var deal by remember { mutableStateOf<Deal?>(null) }
    var stages by remember { mutableStateOf<List<PipelineStage>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showStageDialog by remember { mutableStateOf(false) }
    var showWinDialog by remember { mutableStateOf(false) }
    var showLoseDialog by remember { mutableStateOf(false) }
    var lossReason by remember { mutableStateOf("") }
    
    // Load deal details
    LaunchedEffect(dealId) {
        isLoading = true
        when (val result = repository.getDeal(dealId)) {
            is NetworkResult.Success -> {
                deal = result.data
                // Load pipeline stages
                result.data.pipelineId?.let { pipelineId ->
                    when (val stagesResult = repository.getPipelineStages(pipelineId)) {
                        is NetworkResult.Success -> stages = stagesResult.data
                        else -> {}
                    }
                }
                isLoading = false
            }
            is NetworkResult.Error -> {
                error = result.message
                isLoading = false
            }
            is NetworkResult.Exception -> {
                error = result.exception.message
                isLoading = false
            }
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Deal Details") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DesignTokens.Colors.Surface
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { paddingValues ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.Error,
                            contentDescription = null,
                            tint = DesignTokens.Colors.Error,
                            modifier = Modifier.size(48.dp)
                        )
                        Text(
                            text = error ?: "Failed to load deal",
                            style = MaterialTheme.typography.bodyLarge,
                            color = DesignTokens.Colors.Error
                        )
                        Button(onClick = onBack) {
                            Text("Go Back")
                        }
                    }
                }
            }
            deal != null -> {
                DealDetailContent(
                    deal = deal!!,
                    stages = stages,
                    onEdit = { onNavigate("deal-edit/$dealId") },
                    onDelete = { showDeleteDialog = true },
                    onMoveStage = { showStageDialog = true },
                    onMarkWon = { showWinDialog = true },
                    onMarkLost = { showLoseDialog = true },
                    paddingValues = paddingValues
                )
            }
        }
    }
    
    // Delete Confirmation Dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Deal") },
            text = { Text("Are you sure you want to delete this deal? This action cannot be undone.") },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            when (repository.deleteDeal(dealId)) {
                                is NetworkResult.Success -> {
                                    showDeleteDialog = false
                                    onBack()
                                }
                                is NetworkResult.Error -> {
                                    showDeleteDialog = false
                                    snackbarHostState.showSnackbar("Failed to delete deal")
                                }
                                is NetworkResult.Exception -> {
                                    showDeleteDialog = false
                                    snackbarHostState.showSnackbar("Network error")
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error
                    )
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Move Stage Dialog
    if (showStageDialog && stages.isNotEmpty()) {
        var selectedStageId by remember { mutableStateOf(deal?.stageId ?: stages.first().id) }
        
        AlertDialog(
            onDismissRequest = { showStageDialog = false },
            title = { Text("Move to Stage") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    stages.forEach { stage ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    if (selectedStageId == stage.id) 
                                        DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f) 
                                    else Color.Transparent
                                )
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = selectedStageId == stage.id,
                                onClick = { selectedStageId = stage.id }
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = stage.name,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                                stage.probability?.let {
                                    Text(
                                        text = "Probability: $it%",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            when (repository.moveDealStage(dealId, selectedStageId)) {
                                is NetworkResult.Success -> {
                                    showStageDialog = false
                                    // Reload deal
                                    when (val result = repository.getDeal(dealId)) {
                                        is NetworkResult.Success -> deal = result.data
                                        else -> {}
                                    }
                                    snackbarHostState.showSnackbar("Deal moved successfully")
                                }
                                is NetworkResult.Error -> {
                                    showStageDialog = false
                                    snackbarHostState.showSnackbar("Failed to move deal")
                                }
                                is NetworkResult.Exception -> {
                                    showStageDialog = false
                                    snackbarHostState.showSnackbar("Network error")
                                }
                            }
                        }
                    }
                ) {
                    Text("Move")
                }
            },
            dismissButton = {
                TextButton(onClick = { showStageDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Mark Won Dialog
    if (showWinDialog) {
        AlertDialog(
            onDismissRequest = { showWinDialog = false },
            title = { Text("Mark as Won") },
            text = { Text("Mark this deal as won? This will update the deal status and record the win date.") },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            when (repository.winDeal(dealId)) {
                                is NetworkResult.Success -> {
                                    showWinDialog = false
                                    when (val result = repository.getDeal(dealId)) {
                                        is NetworkResult.Success -> deal = result.data
                                        else -> {}
                                    }
                                    snackbarHostState.showSnackbar("Deal marked as won!")
                                }
                                is NetworkResult.Error -> {
                                    showWinDialog = false
                                    snackbarHostState.showSnackbar("Failed to mark deal as won")
                                }
                                is NetworkResult.Exception -> {
                                    showWinDialog = false
                                    snackbarHostState.showSnackbar("Network error")
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Success
                    )
                ) {
                    Text("Mark Won")
                }
            },
            dismissButton = {
                TextButton(onClick = { showWinDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Mark Lost Dialog
    if (showLoseDialog) {
        AlertDialog(
            onDismissRequest = { showLoseDialog = false },
            title = { Text("Mark as Lost") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Why was this deal lost?")
                    OutlinedTextField(
                        value = lossReason,
                        onValueChange = { lossReason = it },
                        placeholder = { Text("Enter loss reason...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            when (repository.loseDeal(dealId, lossReason.ifBlank { null })) {
                                is NetworkResult.Success -> {
                                    showLoseDialog = false
                                    lossReason = ""
                                    when (val result = repository.getDeal(dealId)) {
                                        is NetworkResult.Success -> deal = result.data
                                        else -> {}
                                    }
                                    snackbarHostState.showSnackbar("Deal marked as lost")
                                }
                                is NetworkResult.Error -> {
                                    showLoseDialog = false
                                    snackbarHostState.showSnackbar("Failed to mark deal as lost")
                                }
                                is NetworkResult.Exception -> {
                                    showLoseDialog = false
                                    snackbarHostState.showSnackbar("Network error")
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error
                    )
                ) {
                    Text("Mark Lost")
                }
            },
            dismissButton = {
                TextButton(onClick = { 
                    showLoseDialog = false
                    lossReason = ""
                }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun DealDetailContent(
    deal: Deal,
    stages: List<PipelineStage>,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onMoveStage: () -> Unit,
    onMarkWon: () -> Unit,
    onMarkLost: () -> Unit,
    paddingValues: PaddingValues
) {
    LazyColumn(
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
        // Header with Avatar and Basic Info
        item {
            ResponsiveCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(DesignTokens.Spacing.Space4),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .clip(CircleShape)
                            .background(DesignTokens.Colors.PrimaryLight),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Description,
                            contentDescription = null,
                            modifier = Modifier.size(40.dp),
                            tint = DesignTokens.Colors.Primary
                        )
                    }
                    
                    // Deal Title
                    Text(
                        text = deal.title,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    
                    // Deal Code
                    Text(
                        text = deal.code,
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    
                    // Status and Stage Badges
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        StatusBadge(status = deal.status, isWon = deal.isWon, isLost = deal.isLost)
                        deal.stageName?.let { stageName ->
                            StageBadge(stageName = stageName)
                        }
                        PriorityBadge(priority = deal.priority)
                    }
                }
            }
        }
        
        // Value and Probability
        item {
            ResponsiveCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(DesignTokens.Spacing.Space4),
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    Text(
                        text = "Deal Value",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${deal.currency} ${formatCurrency(deal.value)}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.Success
                        )
                        
                        deal.probability?.let { probability ->
                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "$probability%",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = DesignTokens.Colors.Primary
                                )
                                Text(
                                    text = "Probability",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                    }
                    
                    // Progress bar for probability
                    deal.probability?.let { probability ->
                        Column {
                            Spacer(modifier = Modifier.height(8.dp))
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
                    }
                }
            }
        }
        
        // Contact Information
        item {
            ResponsiveCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(DesignTokens.Spacing.Space4),
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    Text(
                        text = "Customer & Assignment",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    deal.customerName?.let { customerName ->
                        InfoRow(
                            icon = Icons.Default.Business,
                            label = "Customer",
                            value = customerName
                        )
                    }
                    
                    deal.assignedToName?.let { assignedTo ->
                        InfoRow(
                            icon = Icons.Default.Person,
                            label = "Assigned To",
                            value = assignedTo
                        )
                    }
                    
                    deal.pipeline?.name?.let { pipelineName ->
                        InfoRow(
                            icon = Icons.Default.AccountTree,
                            label = "Pipeline",
                            value = pipelineName
                        )
                    }
                }
            }
        }
        
        // Dates
        item {
            ResponsiveCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(DesignTokens.Spacing.Space4),
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    Text(
                        text = "Important Dates",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    deal.expectedCloseDate?.let { date ->
                        InfoRow(
                            icon = Icons.Default.CalendarToday,
                            label = "Expected Close",
                            value = formatDate(date)
                        )
                    }
                    
                    deal.actualCloseDate?.let { date ->
                        InfoRow(
                            icon = Icons.Default.EventAvailable,
                            label = "Actual Close",
                            value = formatDate(date)
                        )
                    }
                    
                    deal.nextActionDate?.let { date ->
                        InfoRow(
                            icon = Icons.Default.Alarm,
                            label = "Next Action",
                            value = formatDate(date)
                        )
                    }
                    
                    InfoRow(
                        icon = Icons.Default.Schedule,
                        label = "Created",
                        value = formatDate(deal.createdAt)
                    )
                }
            }
        }
        
        // Description and Notes
        if (!deal.description.isNullOrBlank() || !deal.notes.isNullOrBlank() || !deal.nextAction.isNullOrBlank()) {
            item {
                ResponsiveCard {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(DesignTokens.Spacing.Space4),
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Text(
                            text = "Details",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        deal.description?.let { description ->
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "Description",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                                Text(
                                    text = description,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                            }
                        }
                        
                        deal.nextAction?.let { nextAction ->
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "Next Action",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                                Text(
                                    text = nextAction,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                            }
                        }
                        
                        deal.notes?.let { notes ->
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "Notes",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                                Text(
                                    text = notes,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                            }
                        }
                        
                        deal.lossReason?.let { reason ->
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(
                                    text = "Loss Reason",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.Error
                                )
                                Text(
                                    text = reason,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                            }
                        }
                    }
                }
            }
        }
        
        // Tags
        if (!deal.tags.isNullOrEmpty()) {
            item {
                ResponsiveCard {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(DesignTokens.Spacing.Space4),
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Text(
                            text = "Tags",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            deal.tags.forEach { tag ->
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f)
                                ) {
                                    Text(
                                        text = tag,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = DesignTokens.Colors.Primary
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Action Buttons
        item {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Primary Actions
                if (!deal.isWon && !deal.isLost) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = onMarkWon,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = DesignTokens.Colors.Success
                            )
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Mark Won")
                        }
                        
                        Button(
                            onClick = onMarkLost,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = DesignTokens.Colors.Error
                            )
                        ) {
                            Icon(Icons.Default.Cancel, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Mark Lost")
                        }
                    }
                    
                    if (stages.isNotEmpty()) {
                        OutlinedButton(
                            onClick = onMoveStage,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.SwapHoriz, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Move to Different Stage")
                        }
                    }
                }
                
                // Edit and Delete
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = onEdit,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Edit")
                    }
                    
                    OutlinedButton(
                        onClick = onDelete,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = DesignTokens.Colors.Error
                        )
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Delete")
                    }
                }
            }
        }
        
        // Bottom Spacing
        item {
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
        }
    }
}

@Composable
private fun InfoRow(
    icon: ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = DesignTokens.Colors.Primary,
            modifier = Modifier.size(20.dp)
        )
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurface,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun StatusBadge(status: String, isWon: Boolean, isLost: Boolean) {
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
        status == "open" -> Triple(
            DesignTokens.Colors.Info.copy(alpha = 0.1f),
            DesignTokens.Colors.Info,
            "Open"
        )
        else -> Triple(
            DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f),
            DesignTokens.Colors.OnSurfaceVariant,
            status.capitalize(Locale.getDefault())
        )
    }
    
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = backgroundColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun StageBadge(stageName: String) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f)
    ) {
        Text(
            text = stageName,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.bodySmall,
            color = DesignTokens.Colors.Primary,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun PriorityBadge(priority: String) {
    val (backgroundColor, textColor) = when (priority.lowercase()) {
        "urgent" -> Pair(DesignTokens.Colors.Error.copy(alpha = 0.1f), DesignTokens.Colors.Error)
        "high" -> Pair(DesignTokens.Colors.Warning.copy(alpha = 0.1f), DesignTokens.Colors.Warning)
        "medium" -> Pair(DesignTokens.Colors.Info.copy(alpha = 0.1f), DesignTokens.Colors.Info)
        else -> Pair(DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.1f), DesignTokens.Colors.OnSurfaceVariant)
    }
    
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = backgroundColor
    ) {
        Text(
            text = priority.capitalize(Locale.getDefault()),
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium
        )
    }
}

private fun formatCurrency(value: String): String {
    return try {
        val amount = value.toDoubleOrNull() ?: 0.0
        NumberFormat.getNumberInstance(Locale.US).format(amount)
    } catch (e: Exception) {
        value
    }
}

private fun formatDate(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
        val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.US)
        val date = inputFormat.parse(dateString)
        date?.let { outputFormat.format(it) } ?: dateString
    } catch (e: Exception) {
        try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.US)
            val date = inputFormat.parse(dateString)
            date?.let { outputFormat.format(it) } ?: dateString
        } catch (e: Exception) {
            dateString
        }
    }
}
