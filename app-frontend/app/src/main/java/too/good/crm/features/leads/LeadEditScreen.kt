package too.good.crm.features.leads

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
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.CreateLeadRequest
import too.good.crm.data.model.Lead
import too.good.crm.data.repository.LeadRepository
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import android.widget.Toast
import kotlinx.coroutines.launch

/**
 * Lead Edit Screen
 * Allows editing existing lead information
 * Matches web-frontend/src/pages/EditLeadPage.tsx
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeadEditScreen(
    leadId: String,
    onBack: () -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val repository = remember { LeadRepository() }
    val coroutineScope = rememberCoroutineScope()
    
    var lead by remember { mutableStateOf<Lead?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    
    // Form state
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var organization by remember { mutableStateOf("") }
    var jobTitle by remember { mutableStateOf("") }
    var source by remember { mutableStateOf("website") }
    var estimatedValue by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    
    var isSaving by remember { mutableStateOf(false) }
    
    // Load lead data
    LaunchedEffect(leadId) {
        isLoading = true
        error = null
        val leadIdInt = leadId.toIntOrNull()
        if (leadIdInt != null) {
            when (val result = repository.getLead(leadIdInt)) {
                is NetworkResult.Success -> {
                    lead = result.data
                    // Populate form fields
                    name = result.data.name
                    email = result.data.email ?: ""
                    phone = result.data.phone ?: ""
                    organization = result.data.organizationName ?: ""
                    jobTitle = result.data.jobTitle ?: ""
                    source = result.data.source ?: "website"
                    estimatedValue = result.data.estimatedValue ?: ""
                    notes = result.data.notes ?: ""
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
    
    // Validation
    val isFormValid = name.isNotBlank() && 
                      email.isNotBlank() && 
                      android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() &&
                      organization.isNotBlank()
    
    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Edit Lead") },
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
                                    error = if (organization.isBlank()) "Company is required" else null
                                ) {
                                    OutlinedTextField(
                                        value = organization,
                                        onValueChange = { organization = it },
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
                                        placeholder = { Text("CEO") },
                                        singleLine = true,
                                        leadingIcon = {
                                            Icon(Icons.Default.Work, contentDescription = null)
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
                                
                                // Source Field
                                FormField(
                                    label = "Lead Source",
                                    required = false
                                ) {
                                    Column {
                                        Text(
                                            text = "Select lead source",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = DesignTokens.Colors.OnSurfaceVariant,
                                            modifier = Modifier.padding(bottom = 8.dp)
                                        )
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                                        ) {
                                            listOf("website", "referral", "cold_call", "social_media").forEach { sourceValue ->
                                                FilterChip(
                                                    selected = source == sourceValue,
                                                    onClick = { source = sourceValue },
                                                    label = { 
                                                        Text(
                                                            sourceValue.replace("_", " ")
                                                                .replaceFirstChar { it.uppercase() }
                                                        ) 
                                                    },
                                                    leadingIcon = if (source == sourceValue) {
                                                        { Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp)) }
                                                    } else null
                                                )
                                            }
                                        }
                                    }
                                }
                                
                                // Estimated Value Field
                                FormField(
                                    label = "Estimated Value",
                                    required = false
                                ) {
                                    OutlinedTextField(
                                        value = estimatedValue,
                                        onValueChange = { estimatedValue = it },
                                        modifier = Modifier.fillMaxWidth(),
                                        placeholder = { Text("50000") },
                                        singleLine = true,
                                        leadingIcon = {
                                            Icon(Icons.Default.AttachMoney, contentDescription = null)
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
                                        placeholder = { Text("Additional notes...") },
                                        minLines = 3,
                                        maxLines = 5
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
                                    coroutineScope.launch {
                                        isSaving = true
                                        val leadIdInt = leadId.toIntOrNull()
                                        if (leadIdInt != null) {
                                            val request = CreateLeadRequest(
                                                organization = lead?.organization,
                                                name = name,
                                                email = email.ifBlank { null },
                                                phone = phone.ifBlank { null },
                                                organizationName = organization.ifBlank { null },
                                                jobTitle = jobTitle.ifBlank { null },
                                                source = source,
                                                estimatedValue = estimatedValue.ifBlank { null },
                                                notes = notes.ifBlank { null }
                                            )
                                            
                                            when (repository.updateLead(leadIdInt, request)) {
                                                is NetworkResult.Success -> {
                                                    Toast.makeText(
                                                        context,
                                                        "Lead updated successfully",
                                                        Toast.LENGTH_SHORT
                                                    ).show()
                                                    onBack()
                                                }
                                                is NetworkResult.Error -> {
                                                    Toast.makeText(
                                                        context,
                                                        "Failed to update lead",
                                                        Toast.LENGTH_SHORT
                                                    ).show()
                                                }
                                                else -> {}
                                            }
                                        } else {
                                            Toast.makeText(
                                                context,
                                                "Invalid lead ID",
                                                Toast.LENGTH_SHORT
                                            ).show()
                                        }
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
