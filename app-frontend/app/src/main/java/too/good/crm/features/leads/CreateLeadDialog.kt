package too.good.crm.features.leads

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import too.good.crm.ui.theme.DesignTokens

data class CreateLeadData(
    val name: String,
    val email: String,
    val phone: String,
    val company: String,
    val jobTitle: String,
    val source: String,
    val estimatedValue: String,
    val notes: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateLeadDialog(
    onDismiss: () -> Unit,
    onCreateLead: (CreateLeadData) -> Unit,
    isCreating: Boolean,
    error: String?
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var company by remember { mutableStateOf("") }
    var jobTitle by remember { mutableStateOf("") }
    var source by remember { mutableStateOf("website") }
    var estimatedValue by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    
    var expanded by remember { mutableStateOf(false) }

    var nameError by remember { mutableStateOf(false) }
    var emailError by remember { mutableStateOf(false) }
    var companyError by remember { mutableStateOf(false) }

    val sourceOptions = listOf(
        "website" to "Website",
        "referral" to "Referral",
        "cold_call" to "Cold Call",
        "email_campaign" to "Email Campaign",
        "social_media" to "Social Media",
        "event" to "Event",
        "partner" to "Partner",
        "other" to "Other"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.9f),
            shape = RoundedCornerShape(DesignTokens.Radius.Large),
            color = DesignTokens.Colors.Surface
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
                            .padding(DesignTokens.Spacing.Space4),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Create New Lead",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.OnPrimary
                        )
                        IconButton(onClick = onDismiss) {
                            Icon(
                                Icons.Default.Close,
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
                        .padding(DesignTokens.Spacing.Space4),
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    // Error message
                    error?.let {
                        Surface(
                            color = DesignTokens.Colors.ErrorLight,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = it,
                                color = DesignTokens.Colors.ErrorDark,
                                modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }

                    // Basic Information
                    Text(
                        text = "Contact Information",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    OutlinedTextField(
                        value = name,
                        onValueChange = {
                            name = it
                            nameError = it.isBlank()
                        },
                        label = { Text("Full Name *") },
                        placeholder = { Text("John Doe") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = nameError,
                        supportingText = if (nameError) {
                            { Text("Name is required") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        OutlinedTextField(
                            value = email,
                            onValueChange = {
                                email = it
                                emailError = it.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(it).matches()
                            },
                            label = { Text("Email *") },
                            placeholder = { Text("john@example.com") },
                            modifier = Modifier.weight(1f),
                            isError = emailError,
                            supportingText = if (emailError) {
                                { Text("Valid email required") }
                            } else null,
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone") },
                        placeholder = { Text("+1 234 567 8900") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Company Information
                    Text(
                        text = "Company Information",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    OutlinedTextField(
                        value = company,
                        onValueChange = {
                            company = it
                            companyError = it.isBlank()
                        },
                        label = { Text("Company *") },
                        placeholder = { Text("Acme Corporation") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = companyError,
                        supportingText = if (companyError) {
                            { Text("Company is required") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    OutlinedTextField(
                        value = jobTitle,
                        onValueChange = { jobTitle = it },
                        label = { Text("Job Title") },
                        placeholder = { Text("Marketing Director") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Lead Details
                    Text(
                        text = "Lead Details",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    // Source Dropdown
                    ExposedDropdownMenuBox(
                        expanded = expanded,
                        onExpandedChange = { expanded = !expanded }
                    ) {
                        OutlinedTextField(
                            value = sourceOptions.find { it.first == source }?.second ?: "Website",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Source") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(type = MenuAnchorType.PrimaryNotEditable),
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                        ExposedDropdownMenu(
                            expanded = expanded,
                            onDismissRequest = { expanded = false }
                        ) {
                            sourceOptions.forEach { (value, label) ->
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

                    OutlinedTextField(
                        value = estimatedValue,
                        onValueChange = { estimatedValue = it.filter { char -> char.isDigit() } },
                        label = { Text("Estimated Value ($)") },
                        placeholder = { Text("50000") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Notes
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notes") },
                        placeholder = { Text("Additional information about the lead...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 3,
                        maxLines = 5,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                }

                // Footer Buttons
                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(DesignTokens.Spacing.Space4),
                    horizontalArrangement = Arrangement.spacedBy(
                        DesignTokens.Spacing.Space2,
                        Alignment.End
                    )
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            // Validate
                            nameError = name.isBlank()
                            emailError = email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
                            companyError = company.isBlank()

                            if (!nameError && !emailError && !companyError) {
                                onCreateLead(
                                    CreateLeadData(
                                        name = name,
                                        email = email,
                                        phone = phone,
                                        company = company,
                                        jobTitle = jobTitle,
                                        source = source,
                                        estimatedValue = estimatedValue,
                                        notes = notes
                                    )
                                )
                            }
                        },
                        enabled = !isCreating
                    ) {
                        if (isCreating) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = DesignTokens.Colors.OnPrimary,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
                        }
                        Text("Create Lead")
                    }
                }
            }
        }
    }
}

