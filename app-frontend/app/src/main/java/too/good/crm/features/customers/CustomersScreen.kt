package too.good.crm.features.customers

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import too.good.crm.ui.video.VideoCallHelper
import too.good.crm.ui.video.VideoCallPermissionHandler
import too.good.crm.data.models.CallType
import too.good.crm.data.Resource
import android.widget.Toast
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomersScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    
    val viewModel: CustomersViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<CustomerStatus?>(null) }

    var activeMode by remember { mutableStateOf(UserSession.activeMode) }
    
    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }

    // Show snackbar for success messages
    val snackbarHostState = remember { SnackbarHostState() }
    
    LaunchedEffect(uiState.successMessage) {
        uiState.successMessage?.let { message ->
            snackbarHostState.showSnackbar(
                message = message,
                duration = SnackbarDuration.Short
            )
            viewModel.clearSuccessMessage()
        }
    }

    val filteredCustomers = uiState.customers.filter { customer ->
        val matchesSearch = searchQuery.isEmpty() ||
                customer.name.contains(searchQuery, ignoreCase = true) ||
                customer.company.contains(searchQuery, ignoreCase = true) ||
                customer.email.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || customer.status == filterStatus
        matchesSearch && matchesFilter
    }

    // Show create customer dialog
    if (uiState.showAddCustomerDialog) {
        CreateCustomerDialog(
            onDismiss = { viewModel.hideAddCustomerDialog() },
            onCreateCustomer = { name, email, phone, firstName, lastName, companyName, 
                                customerType, address, city, state, country, postalCode, 
                                website, notes ->
                viewModel.createCustomer(
                    name = name,
                    email = email,
                    phone = phone,
                    firstName = firstName,
                    lastName = lastName,
                    companyName = companyName,
                    customerType = customerType,
                    address = address,
                    city = city,
                    state = state,
                    country = country,
                    postalCode = postalCode,
                    website = website,
                    notes = notes
                )
            },
            isCreating = uiState.isCreatingCustomer,
            error = uiState.error
        )
    }

    // Show delete confirmation dialog
    if (uiState.showDeleteConfirmDialog) {
        val customerToDelete = uiState.customerToDelete
        if (customerToDelete != null) {
            AlertDialog(
                onDismissRequest = { viewModel.hideDeleteConfirmDialog() },
                title = { Text("Delete Customer") },
                text = {
                    Text("Are you sure you want to delete ${customerToDelete.name}? This action cannot be undone.")
                },
            confirmButton = {
                Button(
                    onClick = { viewModel.deleteCustomer() },
                    enabled = !uiState.isDeletingCustomer,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error
                    )
                ) {
                    if (uiState.isDeletingCustomer) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(20.dp),
                            color = DesignTokens.Colors.OnPrimary,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                    }
                    Text("Delete")
                }
            },
                dismissButton = {
                    TextButton(
                        onClick = { viewModel.hideDeleteConfirmDialog() },
                        enabled = !uiState.isDeletingCustomer
                    ) {
                        Text("Cancel")
                    }
                }
            )
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
            title = "Customers",
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
            onLogout = onBack
        ) { drawerPadding ->
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(DesignTokens.Colors.Background)
                    .padding(drawerPadding)
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Customers",
                                style = MaterialTheme.typography.headlineMedium,
                                fontWeight = DesignTokens.Typography.FontWeightBold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            Text(
                                text = "Manage your customer relationships and track activity",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                        if (uiState.isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                        }
                    }
                }

                // Error message
                uiState.error?.let { errorMessage ->
                    Surface(
                        color = DesignTokens.Colors.ErrorLight,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = errorMessage,
                                color = DesignTokens.Colors.ErrorDark,
                                style = MaterialTheme.typography.bodyMedium,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(onClick = { viewModel.clearError() }) {
                                Icon(
                                    Icons.Default.Close,
                                    contentDescription = "Dismiss error",
                                    tint = DesignTokens.Colors.ErrorDark
                                )
                            }
                        }
                    }
                }

                // Compact Stats Cards - Horizontal Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Total",
                        value = uiState.customers.size.toString(),
                        color = DesignTokens.Colors.Primary
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Active",
                        value = uiState.customers.count { it.status == CustomerStatus.ACTIVE }.toString(),
                        color = DesignTokens.Colors.Success
                    )
                    StatCard(
                        modifier = Modifier.weight(1f),
                        title = "Value",
                        value = "$${uiState.customers.sumOf { it.value }.toInt() / 1000}K",
                        color = DesignTokens.Colors.Secondary
                    )
                }

                // Search Bar - Responsive
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = {
                        Text(
                            "Search customers...",
                            style = MaterialTheme.typography.bodyMedium
                        )
                    },
                    leadingIcon = {
                        Icon(
                            Icons.Default.Search,
                            contentDescription = null,
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(
                                    Icons.Default.Clear,
                                    contentDescription = "Clear",
                                    tint = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                    },
                    shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DesignTokens.Colors.Surface,
                        unfocusedContainerColor = DesignTokens.Colors.Surface,
                        focusedBorderColor = DesignTokens.Colors.Primary,
                        unfocusedBorderColor = DesignTokens.Colors.Outline
                    )
                )

                // Customer List - Responsive
                if (uiState.isLoading && uiState.customers.isEmpty()) {
                    // Initial loading state
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            modifier = Modifier.padding(DesignTokens.Spacing.Space6),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                        ) {
                            CircularProgressIndicator()
                            Text(
                                text = "Loading customers...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                } else if (filteredCustomers.isEmpty()) {
                    EmptyState(
                        title = "No customers found",
                        message = "Try adjusting your search or add a new customer.",
                        icon = {
                            Icon(
                                Icons.Default.SearchOff,
                                contentDescription = null,
                                modifier = Modifier.size(DesignTokens.Heights.IconXl),
                                tint = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    )
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(
                            responsiveSpacing(
                                compact = DesignTokens.Spacing.Space3,
                                medium = DesignTokens.Spacing.Space4
                            )
                        )
                    ) {
                        items(filteredCustomers) { customer ->
                            ResponsiveCustomerCard(
                                customer = customer,
                                onView = { 
                                    Toast.makeText(context, "View customer: ${customer.name}", Toast.LENGTH_SHORT).show()
                                    // TODO: Navigate to customer detail screen
                                },
                                onEdit = { 
                                    Toast.makeText(context, "Edit customer: ${customer.name}", Toast.LENGTH_SHORT).show()
                                    // TODO: Navigate to customer edit screen
                                },
                                onDelete = { 
                                    viewModel.showDeleteConfirmDialog(customer)
                                }
                            )
                        }
                    }
                }
            }

            // Floating Action Button
            FloatingActionButton(
                onClick = { viewModel.showAddCustomerDialog() },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(16.dp),
                containerColor = DesignTokens.Colors.Primary,
                contentColor = DesignTokens.Colors.OnPrimary
            ) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = "Add Customer"
                )
            }

            // Snackbar
            SnackbarHost(
                hostState = snackbarHostState,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 80.dp)
            )
        }
    }
}

@Composable
fun ResponsiveCustomerCard(
    customer: Customer,
    onView: () -> Unit = {},
    onEdit: () -> Unit = {},
    onDelete: () -> Unit = {}
) {
    ResponsiveCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onView() }
    ) {
        // Header row with name and status badge - matching web design
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
            ) {
                Text(
                    text = customer.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = customer.company,
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
            
            // Status badge
            val (text, color) = when (customer.status) {
                CustomerStatus.ACTIVE -> "Active" to DesignTokens.Colors.Success
                CustomerStatus.INACTIVE -> "Inactive" to DesignTokens.Colors.OnSurfaceVariant
                CustomerStatus.PENDING -> "Pending" to DesignTokens.Colors.Warning
            }
            StatusBadge(text = text, color = color)
        }
        
        // Contact info section - matching web design
        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
        Column(
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
        ) {
            // Email
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Email,
                    contentDescription = null,
                    tint = DesignTokens.Colors.OnSurfaceVariant,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = customer.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
            
            // Phone
            if (customer.phone.isNotEmpty()) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = null,
                        tint = DesignTokens.Colors.OnSurfaceVariant,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = customer.phone,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
        }
        
        // Stats row - matching web design
        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
        HorizontalDivider(
            modifier = Modifier.fillMaxWidth(),
            color = DesignTokens.Colors.Outline.copy(alpha = 0.2f),
            thickness = 1.dp
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = DesignTokens.Spacing.Space2),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Total Value",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
                Text(
                    text = NumberFormat.getCurrencyInstance(Locale.US).format(customer.value),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "Last Contact",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
                Text(
                    text = customer.lastContact,
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
        }
        
        // Action buttons row - matching web design
        Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
        HorizontalDivider(
            modifier = Modifier.fillMaxWidth(),
            color = DesignTokens.Colors.Outline.copy(alpha = 0.2f),
            thickness = 1.dp
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = DesignTokens.Spacing.Space2),
            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
        ) {
            val context = LocalContext.current
            
            // Call button (show for all customers with email - matching web behavior)
            if (customer.email.isNotEmpty()) {
                CustomerCallButton(
                    userId = customer.userId,
                    email = customer.email,
                    customerName = customer.name,
                    modifier = Modifier.weight(1f)
                )
            }
            
            // View button
            OutlinedButton(
                onClick = onView,
                modifier = Modifier.weight(if (customer.email.isNotEmpty()) 1f else 1.5f),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = DesignTokens.Colors.Secondary
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Visibility,
                    contentDescription = "View",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("View", style = MaterialTheme.typography.bodyMedium)
            }
            
            // Edit button
            OutlinedButton(
                onClick = onEdit,
                modifier = Modifier.weight(if (customer.email.isNotEmpty()) 1f else 1.5f),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = DesignTokens.Colors.Primary
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "Edit",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Edit", style = MaterialTheme.typography.bodyMedium)
            }
            
            // Delete icon button
            IconButton(
                onClick = onDelete,
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Delete",
                    tint = DesignTokens.Colors.Error
                )
            }
        }
    }
}

@Composable
fun CustomerCallButton(
    userId: Int? = null,
    email: String,
    customerName: String,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var isInitiatingCall by remember { mutableStateOf(false) }
    
    // Call button matching website design
    VideoCallPermissionHandler(
        onPermissionsGranted = {
            isInitiatingCall = true
            coroutineScope.launch {
                // Try calling by userId first if available, otherwise by email
                val result = if (userId != null) {
                    android.util.Log.d("CustomerCallButton", "Calling by userId: $userId")
                    VideoCallHelper.initiateCall(
                        recipientId = userId,
                        callType = CallType.VIDEO
                    )
                } else {
                    android.util.Log.d("CustomerCallButton", "Calling by email: $email")
                    VideoCallHelper.initiateCallByEmail(
                        email = email,
                        callType = CallType.VIDEO
                    )
                }
                isInitiatingCall = false
                
                android.util.Log.d("CustomerCallButton", "Call result: ${if (result is Resource.Success) "Success - Call ID: ${result.data?.id}" else "Error"}")
                
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
        OutlinedButton(
            onClick = { requestPermissions() },
            enabled = !isInitiatingCall,
            modifier = modifier,
            colors = ButtonDefaults.outlinedButtonColors(
                contentColor = Color(0xFF22C55E) // Green like website
            ),
            border = BorderStroke(1.dp, Color(0xFF22C55E))
        ) {
            if (isInitiatingCall) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    strokeWidth = 2.dp,
                    color = Color(0xFF22C55E)
                )
            } else {
                Icon(
                    imageVector = Icons.Default.Phone,
                    contentDescription = "Call",
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Call", style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

// Legacy CustomerCard for backward compatibility (if needed elsewhere)
@Composable
fun CustomerCard(customer: Customer) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingStandard),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            Box(
                modifier = Modifier
                    .size(DesignTokens.Heights.ImageThumbnail)
                    .clip(CircleShape)
                    .background(DesignTokens.Colors.Primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = customer.name.first().uppercase(),
                    style = MaterialTheme.typography.titleLarge,
                    color = DesignTokens.Colors.Primary,
                    fontWeight = DesignTokens.Typography.FontWeightBold
                )
            }

            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space4))

            // Customer Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = customer.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = DesignTokens.Typography.FontWeightBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    val (text, color) = when (customer.status) {
                        CustomerStatus.ACTIVE -> "Active" to DesignTokens.Colors.Success
                        CustomerStatus.INACTIVE -> "Inactive" to DesignTokens.Colors.OnSurfaceVariant
                        CustomerStatus.PENDING -> "Pending" to DesignTokens.Colors.Warning
                    }
                    StatusBadge(text = text, color = color)
                }

                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))

                Text(
                    text = customer.company,
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )

                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Email,
                            contentDescription = null,
                            modifier = Modifier.size(DesignTokens.Heights.IconXs),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space1))
                        Text(
                            text = customer.email,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }

                    Text(
                        text = NumberFormat.getCurrencyInstance(Locale.US).format(customer.value),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = DesignTokens.Typography.FontWeightBold,
                        color = DesignTokens.Colors.Success
                    )
                }
            }

            Icon(
                Icons.Default.ChevronRight,
                contentDescription = "View details",
                tint = DesignTokens.Colors.OnSurfaceTertiary
            )
        }
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
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        colors = CardDefaults.cardColors(containerColor = DesignTokens.Colors.White),
        shape = MaterialTheme.shapes.large,
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space3),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = color,
                fontSize = 20.sp
            )
        }
    }
}
