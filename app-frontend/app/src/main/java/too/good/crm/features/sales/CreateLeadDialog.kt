package too.good.crm.features.sales

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import too.good.crm.ui.theme.DesignTokens

/**
 * Create Lead Dialog - Matches web frontend
 * web-frontend/src/features/leads/components/CreateLeadDialog.tsx
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateLeadDialog(
    isOpen: Boolean,
    onDismiss: () -> Unit,
    onSubmit: (CreateLeadFormData) -> Unit,
    isLoading: Boolean = false
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var company by remember { mutableStateOf("") }
    var jobTitle by remember { mutableStateOf("") }
    var source by remember { mutableStateOf("website") }
    var estimatedValue by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    
    val isValidEmail = remember(email) {
        if (email.isEmpty()) false
        else android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }
    
    val isFormValid = remember(name, company, email) {
        name.isNotBlank() && company.isNotBlank() && isValidEmail
    }
    
    if (isOpen) {
        Dialog(
            onDismissRequest = onDismiss,
            properties = DialogProperties(
                dismissOnBackPress = true,
                dismissOnClickOutside = false,
                usePlatformDefaultWidth = false
            )
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .fillMaxHeight(0.9f),
                shape = MaterialTheme.shapes.large,
                color = DesignTokens.Colors.Surface,
                tonalElevation = 6.dp
            ) {
                Column(
                    modifier = Modifier.fillMaxSize()
                ) {
                    // Header
                    Surface(
                        color = DesignTokens.Colors.Primary,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.OnPrimary,
                                    modifier = Modifier.size(24.dp)
                                )
                                Text(
                                    text = "Create New Lead",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = DesignTokens.Colors.OnPrimary
                                )
                            }
                            IconButton(onClick = onDismiss) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Close",
                                    tint = DesignTokens.Colors.OnPrimary
                                )
                            }
                        }
                    }
                    
                    // Form Content
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .verticalScroll(rememberScrollState())
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Name Field
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Full Name *",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Medium,
                                color = DesignTokens.Colors.OnSurface
                            )
                            OutlinedTextField(
                                value = name,
                                onValueChange = { name = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("John Doe") },
                                singleLine = true
                            )
                        }
                        
                        // Contact Fields
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "Email *",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                                OutlinedTextField(
                                    value = email,
                                    onValueChange = { email = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("john@example.com") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                    singleLine = true,
                                    isError = email.isNotEmpty() && !isValidEmail
                                )
                                if (email.isNotEmpty() && !isValidEmail) {
                                    Text(
                                        text = "Please enter a valid email address",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = DesignTokens.Colors.Error
                                    )
                                }
                            }
                            
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "Phone",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                                OutlinedTextField(
                                    value = phone,
                                    onValueChange = { phone = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("+1 234 567 8900") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                    singleLine = true
                                )
                            }
                        }
                        
                        // Company Fields
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "Company *",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                                OutlinedTextField(
                                    value = company,
                                    onValueChange = { company = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Acme Corporation") },
                                    singleLine = true
                                )
                            }
                            
                            Column(
                                modifier = Modifier.weight(1f),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "Job Title",
                                    style = MaterialTheme.typography.labelMedium,
                                    fontWeight = FontWeight.Medium,
                                    color = DesignTokens.Colors.OnSurface
                                )
                                OutlinedTextField(
                                    value = jobTitle,
                                    onValueChange = { jobTitle = it },
                                    modifier = Modifier.fillMaxWidth(),
                                    placeholder = { Text("Marketing Director") },
                                    singleLine = true
                                )
                            }
                        }
                        
                        // Source
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Source",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Medium,
                                color = DesignTokens.Colors.OnSurface
                            )
                            var expanded by remember { mutableStateOf(false) }
                            val sources = listOf(
                                "website" to "Website",
                                "referral" to "Referral",
                                "cold_call" to "Cold Call",
                                "email_campaign" to "Email Campaign",
                                "social_media" to "Social Media",
                                "event" to "Event",
                                "partner" to "Partner",
                                "other" to "Other"
                            )
                            ExposedDropdownMenuBox(
                                expanded = expanded,
                                onExpandedChange = { expanded = it }
                            ) {
                                OutlinedTextField(
                                    value = sources.find { it.first == source }?.second ?: "Website",
                                    onValueChange = {},
                                    readOnly = true,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .menuAnchor(),
                                    trailingIcon = {
                                        ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                                    }
                                )
                                ExposedDropdownMenu(
                                    expanded = expanded,
                                    onDismissRequest = { expanded = false }
                                ) {
                                    sources.forEach { (value, label) ->
                                        DropdownMenuItem(
                                            text = { Text(label) },
                                            onClick = {
                                                source = value
                                                expanded = false
                                            }
                                        )
                                    }
                                }
                            }
                        }
                        
                        // Estimated Value
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Estimated Value ($)",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Medium,
                                color = DesignTokens.Colors.OnSurface
                            )
                            OutlinedTextField(
                                value = estimatedValue,
                                onValueChange = { estimatedValue = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("50000") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true
                            )
                        }
                        
                        // Notes
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = "Notes",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Medium,
                                color = DesignTokens.Colors.OnSurface
                            )
                            OutlinedTextField(
                                value = notes,
                                onValueChange = { notes = it },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(100.dp),
                                placeholder = { Text("Additional information about the lead...") },
                                maxLines = 4
                            )
                        }
                    }
                    
                    // Footer Actions
                    HorizontalDivider()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.End)
                    ) {
                        OutlinedButton(
                            onClick = onDismiss,
                            enabled = !isLoading
                        ) {
                            Text("Cancel")
                        }
                        Button(
                            onClick = {
                                onSubmit(
                                    CreateLeadFormData(
                                        name = name,
                                        email = email,
                                        phone = phone.ifBlank { null },
                                        company = company,
                                        jobTitle = jobTitle.ifBlank { null },
                                        source = source,
                                        estimatedValue = estimatedValue.ifBlank { null },
                                        notes = notes.ifBlank { null }
                                    )
                                )
                            },
                            enabled = isFormValid && !isLoading,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = DesignTokens.Colors.Primary
                            )
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(16.dp),
                                    strokeWidth = 2.dp,
                                    color = DesignTokens.Colors.OnPrimary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                            }
                            Text("Create Lead")
                        }
                    }
                }
            }
        }
    }
}

/**
 * Form data for creating a lead
 */
data class CreateLeadFormData(
    val name: String,
    val email: String,
    val phone: String?,
    val company: String,
    val jobTitle: String?,
    val source: String,
    val estimatedValue: String?,
    val notes: String?
)
