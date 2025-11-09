package too.good.crm.features.customers

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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateCustomerDialog(
    onDismiss: () -> Unit,
    onCreateCustomer: (
        name: String,
        email: String,
        phone: String,
        firstName: String,
        lastName: String,
        companyName: String,
        customerType: String,
        address: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        website: String,
        notes: String
    ) -> Unit,
    isCreating: Boolean,
    error: String?
) {
    var name by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var companyName by remember { mutableStateOf("") }
    var customerType by remember { mutableStateOf("individual") }
    var address by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var country by remember { mutableStateOf("") }
    var postalCode by remember { mutableStateOf("") }
    var website by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    var nameError by remember { mutableStateOf(false) }
    var emailError by remember { mutableStateOf(false) }
    var phoneError by remember { mutableStateOf(false) }

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
                            text = "Create New Customer",
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

                    // Customer Type Selection
                    Text(
                        text = "Customer Type",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        FilterChip(
                            selected = customerType == "individual",
                            onClick = { customerType = "individual" },
                            label = { Text("Individual") },
                            modifier = Modifier.weight(1f)
                        )
                        FilterChip(
                            selected = customerType == "business",
                            onClick = { customerType = "business" },
                            label = { Text("Business") },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Basic Information
                    Text(
                        text = "Basic Information",
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
                            value = firstName,
                            onValueChange = { firstName = it },
                            label = { Text("First Name") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                        OutlinedTextField(
                            value = lastName,
                            onValueChange = { lastName = it },
                            label = { Text("Last Name") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    OutlinedTextField(
                        value = email,
                        onValueChange = {
                            email = it
                            emailError = it.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(it).matches()
                        },
                        label = { Text("Email *") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = emailError,
                        supportingText = if (emailError) {
                            { Text("Valid email is required") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    OutlinedTextField(
                        value = phone,
                        onValueChange = {
                            phone = it
                            phoneError = it.isBlank()
                        },
                        label = { Text("Phone *") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = phoneError,
                        supportingText = if (phoneError) {
                            { Text("Phone is required") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    // Business Information (show only if business type)
                    if (customerType == "business") {
                        HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                        Text(
                            text = "Business Information",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = DesignTokens.Colors.OnSurface
                        )

                        OutlinedTextField(
                            value = companyName,
                            onValueChange = { companyName = it },
                            label = { Text("Company Name") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )

                        OutlinedTextField(
                            value = website,
                            onValueChange = { website = it },
                            label = { Text("Website") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Address Information
                    Text(
                        text = "Address Information",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Street Address") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        OutlinedTextField(
                            value = city,
                            onValueChange = { city = it },
                            label = { Text("City") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                        OutlinedTextField(
                            value = state,
                            onValueChange = { state = it },
                            label = { Text("State") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        OutlinedTextField(
                            value = postalCode,
                            onValueChange = { postalCode = it },
                            label = { Text("Postal Code") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                        OutlinedTextField(
                            value = country,
                            onValueChange = { country = it },
                            label = { Text("Country") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Notes
                    OutlinedTextField(
                        value = notes,
                        onValueChange = { notes = it },
                        label = { Text("Notes") },
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
                            phoneError = phone.isBlank()

                            if (!nameError && !emailError && !phoneError) {
                                onCreateCustomer(
                                    name, email, phone, firstName, lastName,
                                    companyName, customerType, address, city,
                                    state, country, postalCode, website, notes
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
                        Text("Create Customer")
                    }
                }
            }
        }
    }
}
