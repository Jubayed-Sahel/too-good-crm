package too.good.crm.features.leads

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.Lead
import too.good.crm.data.model.ActivityListItem
import too.good.crm.data.model.CreateActivityRequest
import too.good.crm.data.repository.LeadRepository
import too.good.crm.data.repository.ActivityRepository
import too.good.crm.features.activities.ActivityTimeline
import too.good.crm.features.activities.LogActivityDialog
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import android.widget.Toast
import kotlinx.coroutines.launch

/**
 * Lead Detail Screen
 * Displays comprehensive lead information with edit and conversion options
 * Matches web-frontend/src/pages/LeadDetailPage.tsx
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeadDetailScreen(
    leadId: String,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { LeadRepository() }
    val activityRepository = remember { ActivityRepository() }
    val coroutineScope = rememberCoroutineScope()
    
    var lead by remember { mutableStateOf<Lead?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var showConvertDialog by remember { mutableStateOf(false) }
    var isDeleting by remember { mutableStateOf(false) }
    var isConverting by remember { mutableStateOf(false) }
    
    // Activity state
    var activities by remember { mutableStateOf<List<ActivityListItem>>(emptyList()) }
    var isActivitiesLoading by remember { mutableStateOf(false) }
    var isCreatingActivity by remember { mutableStateOf(false) }
    var showActivityDialog by remember { mutableStateOf(false) }
    
    // Load lead data
    LaunchedEffect(leadId) {
        isLoading = true
        error = null
        val leadIdInt = leadId.toIntOrNull()
        if (leadIdInt != null) {
            when (val result = repository.getLead(leadIdInt)) {
                is NetworkResult.Success -> {
                    lead = result.data
                    isLoading = false
                }
                is NetworkResult.Error -> {
                    error = result.message
                    isLoading = false
                }
                is NetworkResult.Exception -> {
                    error = result.exception.message ?: "Unknown error occurred"
                    isLoading = false
                }
            }
        } else {
            error = "Invalid lead ID"
            isLoading = false
        }
    }
    
    // Load activities
    LaunchedEffect(leadId) {
        isActivitiesLoading = true
        val leadIdInt = leadId.toIntOrNull()
        if (leadIdInt != null) {
            when (val result = activityRepository.getLeadActivities(leadIdInt)) {
                is NetworkResult.Success -> {
                    activities = result.data.results
                    isActivitiesLoading = false
                }
                else -> {
                    isActivitiesLoading = false
                }
            }
        }
    }
    
    // Delete confirmation dialog
    if (showDeleteDialog && lead != null) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Delete Lead") },
            text = {
                Text("Are you sure you want to delete ${lead?.name}? This action cannot be undone.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            isDeleting = true
                            val leadIdInt = leadId.toIntOrNull()
                            if (leadIdInt != null) {
                                when (repository.deleteLead(leadIdInt)) {
                                    is NetworkResult.Success -> {
                                        Toast.makeText(
                                            context,
                                            "Lead deleted successfully",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                        onBack()
                                    }
                                    is NetworkResult.Error -> {
                                        Toast.makeText(
                                            context,
                                            "Failed to delete lead",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    }
                                    else -> {}
                                }
                            }
                            isDeleting = false
                            showDeleteDialog = false
                        }
                    },
                    enabled = !isDeleting,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error
                    )
                ) {
                    if (isDeleting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = DesignTokens.Colors.OnPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showDeleteDialog = false },
                    enabled = !isDeleting
                ) {
                    Text("Cancel")
                }
            }
        )
    }
    
    // Convert confirmation dialog
    if (showConvertDialog && lead != null) {
        AlertDialog(
            onDismissRequest = { showConvertDialog = false },
            title = { Text("Convert Lead") },
            text = {
                Text("Convert ${lead?.name} to a customer? This will create a new customer record.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            isConverting = true
                            val leadIdInt = leadId.toIntOrNull()
                            if (leadIdInt != null) {
                                when (repository.convertLead(leadIdInt)) {
                                    is NetworkResult.Success -> {
                                        Toast.makeText(
                                            context,
                                            "Lead converted successfully",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                        onBack()
                                    }
                                    is NetworkResult.Error -> {
                                        Toast.makeText(
                                            context,
                                            "Failed to convert lead",
                                            Toast.LENGTH_SHORT
                                        ).show()
                                    }
                                    else -> {}
                                }
                            }
                            isConverting = false
                            showConvertDialog = false
                        }
                    },
                    enabled = !isConverting,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Success
                    )
                ) {
                    if (isConverting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(16.dp),
                            strokeWidth = 2.dp,
                            color = DesignTokens.Colors.OnPrimary
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text("Convert")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showConvertDialog = false },
                    enabled = !isConverting
                ) {
                    Text("Cancel")
                }
            }
        )
    }
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Lead Details") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
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
            if (lead != null) {
                FloatingActionButton(
                    onClick = { showActivityDialog = true },
                    containerColor = DesignTokens.Colors.Primary
                ) {
                    Icon(Icons.Default.Add, "Log Activity")
                }
            }
        }
    ) { padding ->
        when {
            isLoading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        CircularProgressIndicator()
                        Text(
                            text = "Loading lead...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
            }
            error != null -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        Icon(
                            Icons.Default.ErrorOutline,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = DesignTokens.Colors.Error
                        )
                        Text(
                            text = error ?: "Unknown error",
                            style = MaterialTheme.typography.titleMedium,
                            color = DesignTokens.Colors.Error
                        )
                        Button(onClick = onBack) {
                            Text("Go Back")
                        }
                    }
                }
            }
            lead != null -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DesignTokens.Colors.Background)
                        .padding(padding)
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
                                    text = lead!!.name.firstOrNull()?.uppercase() ?: "L",
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
                                    text = lead!!.name,
                                    style = MaterialTheme.typography.headlineSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = DesignTokens.Colors.OnSurface
                                )
                                lead!!.organizationName?.let {
                                    Text(
                                        text = it,
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                }
                                lead!!.jobTitle?.let {
                                    Text(
                                        text = it,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                }
                                
                                // Status Badge
                                val statusText = lead!!.qualificationStatus ?: lead!!.status
                                val statusColor = when (statusText.lowercase()) {
                                    "new" -> DesignTokens.Colors.Info
                                    "contacted" -> DesignTokens.Colors.Warning
                                    "qualified" -> DesignTokens.Colors.Success
                                    "unqualified", "disqualified", "lost" -> DesignTokens.Colors.Error
                                    "converted" -> DesignTokens.Colors.Success
                                    else -> DesignTokens.Colors.OnSurfaceVariant
                                }
                                StatusBadge(
                                    text = statusText.replaceFirstChar { it.uppercase() },
                                    color = statusColor
                                )
                            }
                        }
                    }
                    
                    // Action Buttons
                    if (lead!!.isConverted) {
                        // Show converted status
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = DesignTokens.Colors.SuccessLight,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        ) {
                            Row(
                                modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.Success
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Converted to Customer",
                                    color = DesignTokens.Colors.Success,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    } else {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            // Convert Button
                            Button(
                                onClick = { showConvertDialog = true },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = DesignTokens.Colors.Success
                                )
                            ) {
                                Icon(Icons.Default.CheckCircle, "Convert")
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Convert")
                            }
                            
                            // Edit Button
                            Button(
                                onClick = onEdit,
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = DesignTokens.Colors.Primary
                                )
                            ) {
                                Icon(Icons.Default.Edit, "Edit")
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Edit")
                            }
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
                            lead!!.email?.let {
                                InfoRow(
                                    icon = Icons.Default.Email,
                                    label = "Email",
                                    value = it
                                )
                            }
                            
                            // Phone
                            lead!!.phone?.let {
                                InfoRow(
                                    icon = Icons.Default.Phone,
                                    label = "Phone",
                                    value = it
                                )
                            }
                            
                            // Source
                            lead!!.source?.let {
                                InfoRow(
                                    icon = Icons.Default.Source,
                                    label = "Source",
                                    value = it.replace("_", " ").replaceFirstChar { char -> char.uppercase() }
                                )
                            }
                        }
                    }
                    
                    // Lead Metrics Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Lead Metrics",
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
                                    label = "Lead Score",
                                    value = "${lead!!.leadScore ?: 0}",
                                    color = when {
                                        (lead!!.leadScore ?: 0) >= 80 -> DesignTokens.Colors.Success
                                        (lead!!.leadScore ?: 0) >= 50 -> DesignTokens.Colors.Warning
                                        else -> DesignTokens.Colors.Error
                                    }
                                )
                                
                                VerticalDivider(modifier = Modifier.height(60.dp))
                                
                                StatItem(
                                    label = "Est. Value",
                                    value = lead!!.estimatedValue ?: "-",
                                    color = DesignTokens.Colors.Primary
                                )
                            }
                        }
                    }
                    
                    // Activities Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Activity History",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            ActivityTimeline(
                                activities = activities,
                                isLoading = isActivitiesLoading,
                                onActivityClick = { /* TODO: Activity detail */ },
                                onRefresh = { 
                                    coroutineScope.launch {
                                        isActivitiesLoading = true
                                        val leadIdInt = leadId.toIntOrNull()
                                        if (leadIdInt != null) {
                                            when (val result = activityRepository.getLeadActivities(leadIdInt)) {
                                                is NetworkResult.Success -> {
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
                            )
                        }
                    }
                    
                    // Additional Details Card
                    if (lead!!.notes != null || lead!!.assignedToName != null) {
                        ResponsiveCard {
                            Column(
                                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                            ) {
                                Text(
                                    text = "Additional Details",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = DesignTokens.Colors.OnSurface
                                )
                                
                                HorizontalDivider()
                                
                                // Assigned To
                                lead!!.assignedToName?.let {
                                    InfoRow(
                                        icon = Icons.Default.Person,
                                        label = "Assigned To",
                                        value = it
                                    )
                                }
                                
                                // Notes
                                lead!!.notes?.let {
                                    Column {
                                        Text(
                                            text = "Notes",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = DesignTokens.Colors.OnSurfaceVariant
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Text(
                                            text = it,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = DesignTokens.Colors.OnSurface
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Log Activity Dialog
    if (showActivityDialog) {
        LogActivityDialog(
            dealId = null,
            customerId = null,
            leadId = leadId.toIntOrNull(),
            onDismiss = { showActivityDialog = false },
            onSave = { activityRequest ->
                coroutineScope.launch {
                    isCreatingActivity = true
                    when (activityRepository.createActivity(activityRequest)) {
                        is NetworkResult.Success -> {
                            showActivityDialog = false
                            isCreatingActivity = false
                            // Refresh activities
                            isActivitiesLoading = true
                            val leadIdInt = leadId.toIntOrNull()
                            if (leadIdInt != null) {
                                when (val result = activityRepository.getLeadActivities(leadIdInt)) {
                                    is NetworkResult.Success -> {
                                        activities = result.data.results
                                        isActivitiesLoading = false
                                    }
                                    else -> {
                                        isActivitiesLoading = false
                                    }
                                }
                            }
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
