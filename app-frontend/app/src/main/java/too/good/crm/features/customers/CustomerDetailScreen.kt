package too.good.crm.features.customers

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import too.good.crm.data.Resource
import too.good.crm.data.models.CallType
import too.good.crm.data.model.ActivityListItem
import too.good.crm.data.model.CreateActivityRequest
import too.good.crm.data.model.Deal
import too.good.crm.data.model.Issue
import too.good.crm.data.repository.ActivityRepository
import too.good.crm.data.repository.DealRepository
import too.good.crm.data.repository.IssueRepository
import too.good.crm.features.activities.ActivityTimeline
import too.good.crm.features.activities.LogActivityDialog
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import androidx.compose.ui.graphics.Color
import too.good.crm.ui.utils.*
import too.good.crm.ui.video.VideoCallHelper
import too.good.crm.ui.video.VideoCallPermissionHandler
import android.widget.Toast
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.*

/**
 * Customer Detail Screen
 * Displays comprehensive customer information with edit and delete options
 * Matches web-frontend/src/features/customers/pages/CustomerDetailPage.tsx
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerDetailScreen(
    customerId: String,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val viewModel: CustomersViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    val customer = remember(uiState.customers, customerId) {
        uiState.customers.find { it.id == customerId }
    }
    
    val activityRepository = remember { ActivityRepository() }
    val dealRepository = remember { DealRepository() }
    val issueRepository = remember { IssueRepository() }
    
    var activities by remember { mutableStateOf<List<ActivityListItem>>(emptyList()) }
    var isActivitiesLoading by remember { mutableStateOf(false) }
    var isCreatingActivity by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showActivityDialog by remember { mutableStateOf(false) }
    
    var relatedDeals by remember { mutableStateOf<List<too.good.crm.data.model.DealListItem>>(emptyList()) }
    var isDealsLoading by remember { mutableStateOf(false) }
    
    var relatedIssues by remember { mutableStateOf<List<Issue>>(emptyList()) }
    var isIssuesLoading by remember { mutableStateOf(false) }
    
    val coroutineScope = rememberCoroutineScope()
    var isInitiatingCall by remember { mutableStateOf(false) }
    
    // Load customer activities
    LaunchedEffect(customerId) {
        isActivitiesLoading = true
        val customerIdInt = customerId.toIntOrNull()
        if (customerIdInt != null) {
            when (val result = activityRepository.getCustomerActivities(customerIdInt)) {
                is too.good.crm.data.NetworkResult.Success -> {
                    activities = result.data.results
                    isActivitiesLoading = false
                }
                else -> {
                    isActivitiesLoading = false
                }
            }
        }
    }
    
    // Load related deals
    LaunchedEffect(customerId) {
        isDealsLoading = true
        val customerIdInt = customerId.toIntOrNull()
        if (customerIdInt != null) {
            when (val result = dealRepository.getCustomerDeals(customerIdInt)) {
                is too.good.crm.data.NetworkResult.Success -> {
                    relatedDeals = result.data.results
                    isDealsLoading = false
                }
                else -> {
                    isDealsLoading = false
                }
            }
        }
    }
    
    // Load related issues
    LaunchedEffect(customerId) {
        isIssuesLoading = true
        val customerIdInt = customerId.toIntOrNull()
        if (customerIdInt != null) {
            coroutineScope.launch {
                issueRepository.getCustomerIssues(customerIdInt).fold(
                    onSuccess = { issues ->
                        relatedIssues = issues
                        isIssuesLoading = false
                    },
                    onFailure = {
                        isIssuesLoading = false
                    }
                )
            }
        }
    }
    
    // Function to refresh activities
    fun refreshActivities() {
        coroutineScope.launch {
            isActivitiesLoading = true
            val customerIdInt = customerId.toIntOrNull()
            if (customerIdInt != null) {
                when (val result = activityRepository.getCustomerActivities(customerIdInt)) {
                    is too.good.crm.data.NetworkResult.Success -> {
                        activities = result.data.results
                        isActivitiesLoading = false
                    }
                    else -> {
                        isActivitiesLoading = false
                        Toast.makeText(context, "Failed to load activities", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        }
    }
    
    // Delete confirmation dialog
    if (showDeleteDialog && customer != null) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Customer") },
            text = {
                Text("Are you sure you want to delete ${customer.name}? This action cannot be undone.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.showDeleteConfirmDialog(customer)
                        showDeleteDialog = false
                        onBack()
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
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Customer Details") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onEdit) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = DesignTokens.Colors.Primary
                        )
                    }
                    IconButton(onClick = { showDeleteDialog = true }) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = DesignTokens.Colors.Error
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = DesignTokens.Colors.Surface
                )
            )
        },
        floatingActionButton = {
            if (customer != null) {
                FloatingActionButton(
                    onClick = { showActivityDialog = true },
                    containerColor = DesignTokens.Colors.Primary
                ) {
                    Icon(Icons.Default.Add, "Log Activity")
                }
            }
        }
    ) { paddingValues ->
        if (customer == null) {
            // Customer not found
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    Icon(
                        Icons.Default.PersonOff,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = "Customer not found",
                        style = MaterialTheme.typography.titleMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Button(onClick = onBack) {
                        Text("Go Back")
                    }
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(DesignTokens.Colors.Background)
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(
                        responsivePadding(
                            compact = DesignTokens.Spacing.Space4,
                            medium = DesignTokens.Spacing.Space5,
                            expanded = DesignTokens.Spacing.Space6
                        )
                    ),
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
            ) {
                // Header Card with Avatar and Primary Info
                ResponsiveCard {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        // Avatar
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(CircleShape)
                                .background(DesignTokens.Colors.Primary.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = customer.name.first().uppercase(),
                                style = MaterialTheme.typography.displaySmall,
                                color = DesignTokens.Colors.Primary,
                                fontWeight = FontWeight.Bold
                            )
                        }
                        
                        // Name and Company
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
                        ) {
                            Text(
                                text = customer.name,
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            Text(
                                text = customer.company,
                                style = MaterialTheme.typography.bodyLarge,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                            
                            // Status Badge
                            val (statusText, statusColor) = when (customer.status) {
                                CustomerStatus.ACTIVE -> "Active" to DesignTokens.Colors.Success
                                CustomerStatus.INACTIVE -> "Inactive" to DesignTokens.Colors.OnSurfaceVariant
                                CustomerStatus.PENDING -> "Pending" to DesignTokens.Colors.Warning
                            }
                            StatusBadge(text = statusText, color = statusColor)
                        }
                    }
                }
                
                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    // Call Button
                    if (customer.email.isNotEmpty()) {
                        VideoCallPermissionHandler(
                            onPermissionsGranted = {
                                isInitiatingCall = true
                                coroutineScope.launch {
                                    val result = if (customer.userId != null) {
                                        VideoCallHelper.initiateCall(
                                            recipientId = customer.userId,
                                            callType = CallType.VIDEO
                                        )
                                    } else {
                                        VideoCallHelper.initiateCallByEmail(
                                            email = customer.email,
                                            callType = CallType.VIDEO
                                        )
                                    }
                                    isInitiatingCall = false
                                    
                                    if (result is Resource.Error) {
                                        Toast.makeText(
                                            context,
                                            result.message ?: "Failed to start call",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    } else if (result is Resource.Success) {
                                        Toast.makeText(
                                            context,
                                            "Call initiated",
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
                            Button(
                                onClick = { requestPermissions() },
                                modifier = Modifier.weight(1f),
                                enabled = !isInitiatingCall,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = DesignTokens.Colors.Success
                                )
                            ) {
                                if (isInitiatingCall) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp,
                                        color = DesignTokens.Colors.OnPrimary
                                    )
                                } else {
                                    Icon(Icons.Default.Phone, "Call")
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Call")
                            }
                        }
                    }
                    
                    // Edit Button
                    Button(
                        onClick = onEdit,
                        modifier = Modifier.weight(if (customer.email.isNotEmpty()) 1f else 2f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = DesignTokens.Colors.Primary
                        )
                    ) {
                        Icon(Icons.Default.Edit, "Edit")
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Edit")
                    }
                }
                
                // Contact Information Card
                ResponsiveCard {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Text(
                            text = "Contact Information",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.OnSurface
                        )
                        
                        HorizontalDivider()
                        
                        // Email
                        InfoRow(
                            icon = Icons.Default.Email,
                            label = "Email",
                            value = customer.email
                        )
                        
                        // Phone
                        if (customer.phone.isNotEmpty()) {
                            InfoRow(
                                icon = Icons.Default.Phone,
                                label = "Phone",
                                value = customer.phone
                            )
                        }
                        
                        // Website
                        if (customer.website.isNotEmpty()) {
                            InfoRow(
                                icon = Icons.Default.Language,
                                label = "Website",
                                value = customer.website
                            )
                        }
                    }
                }
                
                // Customer Stats Card
                ResponsiveCard {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Text(
                            text = "Customer Statistics",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.OnSurface
                        )
                        
                        HorizontalDivider()
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            StatItem(
                                label = "Total Value",
                                value = NumberFormat.getCurrencyInstance(Locale.US)
                                    .format(customer.value),
                                color = DesignTokens.Colors.Success
                            )
                            
                            VerticalDivider(modifier = Modifier.height(60.dp))
                            
                            StatItem(
                                label = "Status",
                                value = customer.status.name.lowercase()
                                    .replaceFirstChar { it.uppercase() },
                                color = when (customer.status) {
                                    CustomerStatus.ACTIVE -> DesignTokens.Colors.Success
                                    CustomerStatus.INACTIVE -> DesignTokens.Colors.OnSurfaceVariant
                                    CustomerStatus.PENDING -> DesignTokens.Colors.Warning
                                }
                            )
                        }
                    }
                }
                
                // Related Deals
                ResponsiveCard {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Related Deals",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            if (relatedDeals.isNotEmpty()) {
                                Text(
                                    text = "${relatedDeals.size} deals",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.TextSecondary
                                )
                            }
                        }
                        
                        HorizontalDivider()
                        
                        if (isDealsLoading) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = DesignTokens.Spacing.Space4),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(32.dp),
                                    color = DesignTokens.Colors.Primary
                                )
                            }
                        } else if (relatedDeals.isEmpty()) {
                            Text(
                                text = "No deals found",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.TextSecondary,
                                modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2)
                            )
                        } else {
                            Column(
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                            ) {
                                relatedDeals.take(5).forEach { deal ->
                                    Surface(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                                        color = DesignTokens.Colors.SurfaceVariant,
                                        onClick = { onNavigate("deals/${deal.id}") }
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(DesignTokens.Spacing.Space3),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = deal.title,
                                                    style = MaterialTheme.typography.bodyLarge,
                                                    fontWeight = FontWeight.Medium,
                                                    color = DesignTokens.Colors.OnSurface
                                                )
                                                Text(
                                                    text = deal.stageName ?: "No stage",
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = DesignTokens.Colors.TextSecondary
                                                )
                                            }
                                            Column(
                                                horizontalAlignment = Alignment.End
                                            ) {
                                                Text(
                                                    text = deal.value ?: "-",
                                                    style = MaterialTheme.typography.bodyLarge,
                                                    fontWeight = FontWeight.Bold,
                                                    color = DesignTokens.Colors.Primary
                                                )
                                                StatusBadge(deal.status)
                                            }
                                        }
                                    }
                                }
                                
                                if (relatedDeals.size > 5) {
                                    TextButton(
                                        onClick = { onNavigate("deals?customer=$customerId") },
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("View all ${relatedDeals.size} deals")
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Related Issues
                ResponsiveCard {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Related Issues",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            if (relatedIssues.isNotEmpty()) {
                                Text(
                                    text = "${relatedIssues.size} issues",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.TextSecondary
                                )
                            }
                        }
                        
                        HorizontalDivider()
                        
                        if (isIssuesLoading) {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = DesignTokens.Spacing.Space4),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(32.dp),
                                    color = DesignTokens.Colors.Primary
                                )
                            }
                        } else if (relatedIssues.isEmpty()) {
                            Text(
                                text = "No issues found",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.TextSecondary,
                                modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2)
                            )
                        } else {
                            Column(
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                            ) {
                                relatedIssues.take(5).forEach { issue ->
                                    Surface(
                                        modifier = Modifier.fillMaxWidth(),
                                        shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                                        color = DesignTokens.Colors.SurfaceVariant,
                                        onClick = { onNavigate("issues/${issue.id}") }
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(DesignTokens.Spacing.Space3),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = issue.title,
                                                    style = MaterialTheme.typography.bodyLarge,
                                                    fontWeight = FontWeight.Medium,
                                                    color = DesignTokens.Colors.OnSurface
                                                )
                                                Row(
                                                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                                                ) {
                                                    Text(
                                                        text = issue.priority.uppercase(),
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = when (issue.priority.lowercase()) {
                                                            "urgent", "high" -> DesignTokens.Colors.Error
                                                            "medium" -> DesignTokens.Colors.Warning
                                                            else -> DesignTokens.Colors.TextSecondary
                                                        }
                                                    )
                                                    Text(
                                                        text = "•",
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = DesignTokens.Colors.TextSecondary
                                                    )
                                                    Text(
                                                        text = issue.category,
                                                        style = MaterialTheme.typography.bodySmall,
                                                        color = DesignTokens.Colors.TextSecondary
                                                    )
                                                }
                                            }
                                            IssueStatusBadge(issue.status)
                                        }
                                    }
                                }
                                
                                if (relatedIssues.size > 5) {
                                    TextButton(
                                        onClick = { onNavigate("issues?customer=$customerId") },
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Text("View all ${relatedIssues.size} issues")
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Activity History
                ResponsiveCard {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Activities",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            if (activities.isNotEmpty()) {
                                Text(
                                    text = "${activities.size} total",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.TextSecondary
                                )
                            }
                        }
                        
                        ActivityTimeline(
                            activities = activities,
                            isLoading = isActivitiesLoading,
                            onActivityClick = { /* TODO: Activity detail */ },
                            onRefresh = { refreshActivities() }
                        )
                    }
                }
            }
        }
    }
    
    // Log Activity Dialog
    if (showActivityDialog) {
        LogActivityDialog(
            dealId = null,
            customerId = customerId.toIntOrNull(),
            leadId = null,
            onDismiss = { showActivityDialog = false },
            onSave = { activityRequest ->
                coroutineScope.launch {
                    isCreatingActivity = true
                    when (activityRepository.createActivity(activityRequest)) {
                        is too.good.crm.data.NetworkResult.Success -> {
                            showActivityDialog = false
                            isCreatingActivity = false
                            refreshActivities()
                            Toast.makeText(context, "Activity logged successfully", Toast.LENGTH_SHORT).show()
                        }
                        else -> {
                            isCreatingActivity = false
                            Toast.makeText(context, "Failed to log activity", Toast.LENGTH_SHORT).show()
                        }
                    }
                }
            },
            isLoading = isCreatingActivity
        )
    }
}

@Composable
private fun InfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = DesignTokens.Colors.OnSurfaceVariant,
            modifier = Modifier.size(24.dp)
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
                color = DesignTokens.Colors.OnSurface
            )
        }
    }
}

@Composable
private fun StatItem(
    label: String,
    value: String,
    color: androidx.compose.ui.graphics.Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = DesignTokens.Colors.OnSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}

@Composable
private fun StatusBadge(status: String) {
    val (backgroundColor, textColor) = when (status.lowercase()) {
        "won" -> DesignTokens.Colors.Success to DesignTokens.Colors.White
        "lost" -> DesignTokens.Colors.Error to DesignTokens.Colors.White
        "active", "open" -> DesignTokens.Colors.Primary to DesignTokens.Colors.OnPrimary
        else -> DesignTokens.Colors.SurfaceVariant to DesignTokens.Colors.OnSurfaceVariant
    }
    
    Surface(
        shape = RoundedCornerShape(DesignTokens.Radius.Full),
        color = backgroundColor
    ) {
        Text(
            text = status.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = textColor,
            modifier = Modifier.padding(
                horizontal = DesignTokens.Spacing.Space2,
                vertical = 4.dp
            )
        )
    }
}

@Composable
private fun IssueStatusBadge(status: String) {
    val (backgroundColor, textColor) = when (status.lowercase()) {
        "resolved", "closed" -> DesignTokens.Colors.Success to DesignTokens.Colors.White
        "in_progress", "in progress" -> DesignTokens.Colors.Warning to DesignTokens.Colors.White
        "open" -> DesignTokens.Colors.Error to DesignTokens.Colors.White
        else -> DesignTokens.Colors.SurfaceVariant to DesignTokens.Colors.OnSurfaceVariant
    }
    
    Surface(
        shape = RoundedCornerShape(DesignTokens.Radius.Full),
        color = backgroundColor
    ) {
        Text(
            text = status.replace("_", " ").uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = textColor,
            modifier = Modifier.padding(
                horizontal = DesignTokens.Spacing.Space2,
                vertical = 4.dp
            )
        )
    }
}
