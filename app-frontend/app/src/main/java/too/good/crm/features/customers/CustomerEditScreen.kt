package too.good.crm.features.customers

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
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
    
    val customer = remember(uiState.customers, customerId) {
        uiState.customers.find { it.id == customerId }
    }
    
    // Form state
    var name by remember { mutableStateOf(customer?.name ?: "") }
    var email by remember { mutableStateOf(customer?.email ?: "") }
    var phone by remember { mutableStateOf(customer?.phone ?: "") }
    var company by remember { mutableStateOf(customer?.company ?: "") }
    var status by remember { mutableStateOf(customer?.status ?: CustomerStatus.ACTIVE) }
    var website by remember { mutableStateOf(customer?.website ?: "") }
    var industry by remember { mutableStateOf(customer?.industry ?: "") }
    
    var isSaving by remember { mutableStateOf(false) }
    
    // Validation
    val isFormValid = name.isNotBlank() && 
                      email.isNotBlank() && 
                      android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() &&
                      company.isNotBlank()
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Edit Customer") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
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
                    // Basic Information Card
                    ResponsiveCard {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                        ) {
                            Text(
                                text = "Basic Information",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface
                            )
                            
                            HorizontalDivider()
                            
                            // Name Field
                            FormField(
                                label = "Full Name",
                                required = true,
                                error = if (name.isBlank()) "Name is required" else null
                            ) {
                                OutlinedTextField(
                                    value = name,
                                    onValueChange = { name = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("John Doe") },
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
                            
                            // Company Field
                            FormField(
                                label = "Company",
                                required = true,
                                error = if (company.isBlank()) "Company is required" else null
                            ) {
                                OutlinedTextField(
                                    value = company,
                                    onValueChange = { company = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Acme Corporation") },
                                    singleLine = true,
                                    leadingIcon = {
                                        Icon(Icons.Default.Business, contentDescription = null)
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
                                isSaving = true
                                val customerIdInt = customerId.toIntOrNull()
                                if (customerIdInt != null) {
                                    viewModel.updateCustomer(
                                        customerId = customerIdInt,
                                        name = name,
                                        email = email,
                                        phone = phone,
                                        companyName = company,
                                        status = status.name.lowercase(),
                                        website = website,
                                        notes = industry  // Using industry field as notes for now
                                    )
                                    Toast.makeText(
                                        context,
                                        "Customer updated successfully",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                    onBack()
                                } else {
                                    Toast.makeText(
                                        context,
                                        "Invalid customer ID",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                    isSaving = false
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
