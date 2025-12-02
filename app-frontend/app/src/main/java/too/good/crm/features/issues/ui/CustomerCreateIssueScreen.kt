package too.good.crm.features.issues.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.Organization
import too.good.crm.data.model.Vendor
import too.good.crm.data.model.Order
import too.good.crm.features.issues.viewmodel.IssueViewModel
import too.good.crm.data.UserSession

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerCreateIssueScreen(
    onNavigateBack: () -> Unit,
    viewModel: IssueViewModel = viewModel()
) {
    val coroutineScope = rememberCoroutineScope()
    
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedPriority by remember { mutableStateOf("medium") }
    var selectedCategory by remember { mutableStateOf("general") }
    var expandedPriority by remember { mutableStateOf(false) }
    var expandedCategory by remember { mutableStateOf(false) }
    
    // Organization, Vendor, Order state
    var organizations by remember { mutableStateOf<List<Organization>>(emptyList()) }
    var selectedOrganization by remember { mutableStateOf<Int?>(null) }
    var expandedOrganization by remember { mutableStateOf(false) }
    var loadingOrganizations by remember { mutableStateOf(true) }
    
    var vendors by remember { mutableStateOf<List<Vendor>>(emptyList()) }
    var selectedVendor by remember { mutableStateOf<Int?>(null) }
    var expandedVendor by remember { mutableStateOf(false) }
    var loadingVendors by remember { mutableStateOf(false) }
    
    var orders by remember { mutableStateOf<List<Order>>(emptyList()) }
    var selectedOrder by remember { mutableStateOf<Int?>(null) }
    var expandedOrder by remember { mutableStateOf(false) }
    var loadingOrders by remember { mutableStateOf(false) }

    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()
    val createSuccess by viewModel.createIssueSuccess.collectAsState()
    
    var showSuccessMessage by remember { mutableStateOf(false) }

    val priorities = listOf("low", "medium", "high", "urgent")
    val categories = listOf(
        "general", "delivery", "quality", "billing",
        "communication", "technical", "other"
    )
    
    // Fetch ALL organizations on screen load (for customers to raise issues for any organization)
    LaunchedEffect(Unit) {
        loadingOrganizations = true
        try {
            val response = ApiClient.organizationApiService.getAllOrganizationsForIssues()
            if (response.isSuccessful) {
                organizations = response.body() ?: emptyList()
                android.util.Log.d("CustomerCreateIssue", "Loaded ${organizations.size} organizations")
                
                // Auto-select user's primary organization if available
                val userOrgId = UserSession.currentProfile?.organizationId
                if (userOrgId != null && organizations.any { it.id == userOrgId }) {
                    selectedOrganization = userOrgId
                    android.util.Log.d("CustomerCreateIssue", "Auto-selected user's primary org: $userOrgId")
                } else if (organizations.isNotEmpty()) {
                    selectedOrganization = organizations.first().id
                    android.util.Log.d("CustomerCreateIssue", "Auto-selected first org: ${organizations.first().id}")
                }
            } else {
                android.util.Log.e("CustomerCreateIssue", "Failed to load organizations: ${response.code()}")
            }
        } catch (e: Exception) {
            android.util.Log.e("CustomerCreateIssue", "Failed to load organizations: ${e.message}", e)
        } finally {
            loadingOrganizations = false
        }
    }
    
    // Fetch vendors when organization is selected
    LaunchedEffect(selectedOrganization) {
        selectedOrganization?.let { orgId ->
            loadingVendors = true
            vendors = emptyList()
            selectedVendor = null
            try {
                val response = ApiClient.vendorApiService.getVendors(
                    pageSize = 100,
                    organizationId = orgId
                )
                vendors = response.results
            } catch (e: Exception) {
                android.util.Log.e("CustomerCreateIssue", "Failed to load vendors: ${e.message}")
            } finally {
                loadingVendors = false
            }
        }
    }
    
    // Fetch orders when organization is selected
    LaunchedEffect(selectedOrganization) {
        selectedOrganization?.let { orgId ->
            loadingOrders = true
            orders = emptyList()
            selectedOrder = null
            try {
                val response = ApiClient.orderApiService.getOrdersByOrganization(orgId)
                if (response.isSuccessful) {
                    orders = response.body()?.results ?: emptyList()
                }
            } catch (e: Exception) {
                android.util.Log.e("CustomerCreateIssue", "Failed to load orders: ${e.message}")
            } finally {
                loadingOrders = false
            }
        }
    }

    // Handle success - clear form and show message instead of navigating back
    LaunchedEffect(createSuccess) {
        if (createSuccess != null) {
            viewModel.clearCreateSuccess()
            
            // Clear form fields
            title = ""
            description = ""
            selectedPriority = "medium"
            selectedCategory = "general"
            selectedVendor = null
            selectedOrder = null
            
            // Show success message
            showSuccessMessage = true
            
            // Hide success message after 3 seconds
            kotlinx.coroutines.delay(3000)
            showSuccessMessage = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Report Issue") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            Text(
                text = "Describe your issue",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "We'll sync this with Linear to track and resolve it quickly.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))
            
            // Success message
            if (showSuccessMessage) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.Default.CheckCircle,
                            contentDescription = "Success",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Issue Created Successfully!",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                            Text(
                                text = "You can create another issue or go back to view your issues.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Organization Dropdown
            ExposedDropdownMenuBox(
                expanded = expandedOrganization,
                onExpandedChange = {
                    if (!isLoading && !loadingOrganizations) {
                        expandedOrganization = !expandedOrganization
                    }
                }
            ) {
                OutlinedTextField(
                    value = organizations.find { it.id == selectedOrganization }?.name ?: "Select Organization",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Organization *") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedOrganization) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    enabled = !isLoading && !loadingOrganizations
                )
                ExposedDropdownMenu(
                    expanded = expandedOrganization,
                    onDismissRequest = { expandedOrganization = false }
                ) {
                    if (loadingOrganizations) {
                        DropdownMenuItem(
                            text = { Text("Loading...") },
                            onClick = { }
                        )
                    } else if (organizations.isEmpty()) {
                        DropdownMenuItem(
                            text = { Text("No organizations available") },
                            onClick = { }
                        )
                    } else {
                        organizations.forEach { org ->
                            DropdownMenuItem(
                                text = { Text(org.name) },
                                onClick = {
                                    selectedOrganization = org.id
                                    expandedOrganization = false
                                }
                            )
                        }
                    }
                }
            }
            
            if (organizations.isEmpty() && !loadingOrganizations) {
                Text(
                    text = "You need to be part of an organization to raise issues.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(top = 4.dp)
                )
            } else {
                Text(
                    text = "Select the organization you want to report an issue about",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Title
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Issue Title *") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                enabled = !isLoading
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Description
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description *") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp),
                maxLines = 8,
                enabled = !isLoading
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Priority Dropdown
            ExposedDropdownMenuBox(
                expanded = expandedPriority,
                onExpandedChange = {
                    if (!isLoading) {
                        expandedPriority = !expandedPriority
                    }
                }
            ) {
                OutlinedTextField(
                    value = selectedPriority.capitalizeFirstChar(),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Priority") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedPriority) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    enabled = !isLoading
                )
                ExposedDropdownMenu(
                    expanded = expandedPriority,
                    onDismissRequest = { expandedPriority = false }
                ) {
                    priorities.forEach { priority ->
                        DropdownMenuItem(
                            text = { Text(priority.capitalizeFirstChar()) },
                            onClick = {
                                selectedPriority = priority
                                expandedPriority = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Category Dropdown
            ExposedDropdownMenuBox(
                expanded = expandedCategory,
                onExpandedChange = {
                    if (!isLoading) {
                        expandedCategory = !expandedCategory
                    }
                }
            ) {
                OutlinedTextField(
                    value = selectedCategory.capitalizeFirstChar(),
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Category") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedCategory) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    enabled = !isLoading
                )
                ExposedDropdownMenu(
                    expanded = expandedCategory,
                    onDismissRequest = { expandedCategory = false }
                ) {
                    categories.forEach { category ->
                        DropdownMenuItem(
                            text = { Text(category.capitalizeFirstChar()) },
                            onClick = {
                                selectedCategory = category
                                expandedCategory = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Vendor Dropdown (Optional)
            if (selectedOrganization != null) {
                ExposedDropdownMenuBox(
                    expanded = expandedVendor,
                    onExpandedChange = {
                        if (!isLoading && !loadingVendors) {
                            expandedVendor = !expandedVendor
                        }
                    }
                ) {
                    OutlinedTextField(
                        value = vendors.find { it.id == selectedVendor }?.name ?: "No specific vendor",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Vendor (Optional)") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedVendor) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        enabled = !isLoading && !loadingVendors
                    )
                    ExposedDropdownMenu(
                        expanded = expandedVendor,
                        onDismissRequest = { expandedVendor = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("No specific vendor") },
                            onClick = {
                                selectedVendor = null
                                expandedVendor = false
                            }
                        )
                        if (loadingVendors) {
                            DropdownMenuItem(
                                text = { Text("Loading...") },
                                onClick = { }
                            )
                        } else {
                            vendors.forEach { vendor ->
                                DropdownMenuItem(
                                    text = { Text(vendor.name) },
                                    onClick = {
                                        selectedVendor = vendor.id
                                        expandedVendor = false
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Order Dropdown (Optional)
                ExposedDropdownMenuBox(
                    expanded = expandedOrder,
                    onExpandedChange = {
                        if (!isLoading && !loadingOrders) {
                            expandedOrder = !expandedOrder
                        }
                    }
                ) {
                    OutlinedTextField(
                        value = orders.find { it.id == selectedOrder }?.orderNumber ?: "No related order",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Related Order (Optional)") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedOrder) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        enabled = !isLoading && !loadingOrders
                    )
                    ExposedDropdownMenu(
                        expanded = expandedOrder,
                        onDismissRequest = { expandedOrder = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("No related order") },
                            onClick = {
                                selectedOrder = null
                                expandedOrder = false
                            }
                        )
                        if (loadingOrders) {
                            DropdownMenuItem(
                                text = { Text("Loading...") },
                                onClick = { }
                            )
                        } else {
                            orders.forEach { order ->
                                DropdownMenuItem(
                                    text = { Text(order.orderNumber) },
                                    onClick = {
                                        selectedOrder = order.id
                                        expandedOrder = false
                                    }
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
            
            // Info card
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Text(
                    text = "Note: This issue will be sent to the selected organization. Vendors and employees of that organization will be able to view and resolve it.",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(12.dp),
                    color = MaterialTheme.colorScheme.onPrimaryContainer
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Error message
            errorMessage?.let { error ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = error,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Submit button
            Button(
                onClick = {
                    if (selectedOrganization != null && title.isNotBlank() && description.isNotBlank()) {
                        viewModel.createIssue(
                            organizationId = selectedOrganization!!,
                            title = title,
                            description = description,
                            priority = selectedPriority,
                            category = selectedCategory,
                            vendorId = selectedVendor,
                            orderId = selectedOrder
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading && selectedOrganization != null && title.isNotBlank() && description.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("Submit Issue")
                }
            }
        }
    }
}

