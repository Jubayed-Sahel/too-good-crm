package too.good.crm.features.customers

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import too.good.crm.data.rbac.PermissionManager
import android.widget.Toast

/**
 * Customer Edit Screen
 * Allows editing existing customer information
 * Matches web-frontend/src/features/customers/pages/EditCustomerPage.tsx
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerEditScreen(
    customerId: String,
    onBack: () -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val viewModel: CustomersViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    val coroutineScope = rememberCoroutineScope()
    
    val customer = remember(uiState.customers, customerId) {
        uiState.customers.find { it.id == customerId }
    }
    
    // Form state - matching web frontend structure
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf(customer?.email ?: "") }
    var phone by remember { mutableStateOf(customer?.phone ?: "") }
    var companyName by remember { mutableStateOf(customer?.company ?: "") }
    var jobTitle by remember { mutableStateOf("") }
    var website by remember { mutableStateOf(customer?.website ?: "") }
    var status by remember { mutableStateOf(customer?.status ?: CustomerStatus.ACTIVE) }
    var address by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var postalCode by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var industry by remember { mutableStateOf(customer?.industry ?: "") }
    var notes by remember { mutableStateOf("") }
    
    // Split customer name into first/last on initial load
    LaunchedEffect(customer?.name) {
        customer?.name?.let { fullName ->
            val parts = fullName.split(" ", limit = 2)
            firstName = parts.getOrNull(0) ?: ""
            lastName = parts.getOrNull(1) ?: ""
        }
    }
    
    var isSaving by remember { mutableStateOf(false) }
    
    // Observe ViewModel state for success/error
    LaunchedEffect(uiState.successMessage, uiState.error) {
        if (uiState.successMessage != null && isSaving) {
            Toast.makeText(
                context,
                uiState.successMessage,
                Toast.LENGTH_SHORT
            ).show()
            isSaving = false
            viewModel.clearSuccessMessage()
            // Navigate back after showing success
            onBack()
        } else if (uiState.error != null && isSaving) {
            Toast.makeText(
                context,
                uiState.error,
                Toast.LENGTH_SHORT
            ).show()
            isSaving = false
            viewModel.clearError()
        }
    }
    
    // Validation - matching web frontend requirements
    val isFormValid = firstName.isNotBlank() && 
                      lastName.isNotBlank() &&
                      email.isNotBlank() && 
                      android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Edit Customer") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
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
            ) {
                // Form Content
                Column(
                    modifier = Modifier
                        .weight(1f)
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
                    // Personal Information Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Personal Information",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            // First Name Field
                            FormField(
                                label = "First Name",
                                required = true,
                                error = if (firstName.isBlank()) "First name is required" else null
                            ) {
                                OutlinedTextField(
                                    value = firstName,
                                    onValueChange = { firstName = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("John") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Person, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Last Name Field
                            FormField(
                                label = "Last Name",
                                required = true,
                                error = if (lastName.isBlank()) "Last name is required" else null
                            ) {
                                OutlinedTextField(
                                    value = lastName,
                                    onValueChange = { lastName = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Doe") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Person, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Email Field
                            FormField(
                                label = "Email",
                                required = true,
                                error = if (email.isBlank()) "Email is required" 
                                       else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) 
                                           "Invalid email address" 
                                       else null
                            ) {
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("john@example.com") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Email, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Phone Field
                            FormField(
                                label = "Phone",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = phone,
                                    onValueChange = { phone = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("+1 234 567 8900") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Phone, contentDescription = null)
                                    }
                                )
                            }
                        }
                    }
                    
                    // Organization Information Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Organization Information",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            // Company Name Field
                            FormField(
                                label = "Company Name",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = companyName,
                                    onValueChange = { companyName = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Acme Corporation") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Business, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Job Title Field
                            FormField(
                                label = "Job Title",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = jobTitle,
                                    onValueChange = { jobTitle = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Sales Manager") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Work, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Website Field
                            FormField(
                                label = "Website",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = website,
                                    onValueChange = { website = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("https://example.com") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Language, contentDescription = null)
                                    }
                                )
                            }
                        }
                    }
                    
                    // Customer Status Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Customer Status",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            // Status Field
                            FormField(
                                label = "Status",
                                required = false
                            ) {
                                Column {
                                    Text(
                                        text = "Select customer status",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = DesignTokens.Colors.OnSurfaceVariant,
                                        modifier = Modifier.padding(bottom = 8.dp)
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        CustomerStatus.values().forEach { statusValue ->
                                            FilterChip(
                                                selected = status == statusValue,
                                                onClick = { status = statusValue },
                                                label = { 
                                                    Text(
                                                        statusValue.name.lowercase()
                                                            .replaceFirstChar { it.uppercase() }
                                                    ) 
                                                },
                                                leadingIcon = if (status == statusValue) {
                                                    { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                                                } else null
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                    
                    // Address Information Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Address Information",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            // Street Address Field
                            FormField(
                                label = "Street Address",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = address,
                                    onValueChange = { address = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("123 Main Street") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Home, contentDescription = null)
                                    }
                                )
                            }
                            
                            // City Field
                            FormField(
                                label = "City",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = city,
                                    onValueChange = { city = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("New York") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.LocationCity, contentDescription = null)
                                    }
                                )
                            }
                            
                            // State Field
                            FormField(
                                label = "State",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = state,
                                    onValueChange = { state = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("NY") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Map, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Postal Code Field
                            FormField(
                                label = "Postal Code",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = postalCode,
                                    onValueChange = { postalCode = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("10001") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Pin, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Country Field
                            FormField(
                                label = "Country",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = country,
                                    onValueChange = { country = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("United States") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Public, contentDescription = null)
                                    }
                                )
                            }
                        }
                    }
                    
                    // Additional Information Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Additional Information",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            // Industry Field
                            FormField(
                                label = "Industry",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = industry,
                                    onValueChange = { industry = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Technology") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Work, contentDescription = null)
                                    }
                                )
                            }
                            
                            // Notes Field
                            FormField(
                                label = "Notes",
                                required = false
                            ) {
                                OutlinedTextField(
                                    value = notes,
                                    onValueChange = { notes = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Additional notes about this customer...") },
                                    minLines = 4,
                                    maxLines = 6,
                                    leadingIcon = {
                                        Icon(Icons.Default.Notes, contentDescription = null)
                                    }
                                )
                            }
                        }
                    }
                }
                
                // Bottom Action Bar
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = DesignTokens.Colors.Surface,
                    shadowElevation = 8.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(DesignTokens.Spacing.Space4),
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                    ) {
                        OutlinedButton(
                            onClick = onBack,
                            modifier = Modifier.weight(1f),
                            enabled = !isSaving
                        ) {
                            Text("Cancel")
                        }
                        
                        Button(
                            onClick = {
                                // Check permission before allowing update
                                if (!PermissionManager.canUpdate("customer")) {
                                    Toast.makeText(
                                        context,
                                        "You don't have permission to update customers. Please contact your administrator.",
                                        Toast.LENGTH_LONG
                                    ).show()
                                    return@Button
                                }
                                
                                val customerIdInt = customerId.toIntOrNull()
                                if (customerIdInt == null) {
                                    Toast.makeText(
                                        context,
                                        "Invalid customer ID",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                    return@Button
                                }
                                
                                if (isSaving) return@Button
                                
                                isSaving = true
                                // Combine first and last name for the name field
                                val fullName = "$firstName $lastName".trim()
                                
                                coroutineScope.launch {
                                    viewModel.updateCustomer(
                                        customerId = customerIdInt,
                                        name = fullName,
                                        firstName = firstName,
                                        lastName = lastName,
                                        email = email,
                                        phone = phone,
                                        companyName = companyName,
                                        jobTitle = jobTitle,
                                        status = status.name.lowercase(),
                                        address = address,
                                        city = city,
                                        state = state,
                                        postalCode = postalCode,
                                        country = country,
                                        website = website,
                                        industry = industry,
                                        notes = notes
                                    )
                                    // Success/error handling is done in LaunchedEffect above
                                }
                            },
                            modifier = Modifier.weight(1f),
                            enabled = isFormValid && !isSaving,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = DesignTokens.Colors.Primary
                            )
                        ) {
                            if (isSaving) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = DesignTokens.Colors.OnPrimary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                            }
                            Text("Save Changes")
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FormField(
    label: String,
    required: Boolean,
    error: String? = null,
    content: @Composable () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = DesignTokens.Colors.OnSurface
            )
            if (required) {
                Text(
                    text = " *",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.Error
                )
            }
        }
        
        content()
        
        if (error != null) {
            Text(
                text = error,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.Error
            )
        }
    }
}
