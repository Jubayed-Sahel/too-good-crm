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
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
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
    
    var showDeleteDialog by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    var isInitiatingCall by remember { mutableStateOf(false) }
    
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
        }
    ) { padding ->
        if (customer == null) {
            // Customer not found
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
                
                // Activity History Card (Placeholder)
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
                                text = "Recent Activity",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            TextButton(onClick = { /* TODO: View all activities */ }) {
                                Text("View All")
                            }
                        }
                        
                        HorizontalDivider()
                        
                        // Last Contact Info
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                            ) {
                                Icon(
                                    Icons.Default.Event,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.OnSurfaceVariant,
                                    modifier = Modifier.size(20.dp)
                                )
                                Column {
                                    Text(
                                        text = "Last Contact",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                    Text(
                                        text = customer.lastContact,
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
