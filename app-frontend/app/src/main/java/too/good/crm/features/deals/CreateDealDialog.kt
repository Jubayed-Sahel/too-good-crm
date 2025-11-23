package too.good.crm.features.deals

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

data class CreateDealData(
    val title: String,
    val customerName: String,
    val value: String,
    val stage: String,
    val probability: Int,
    val expectedCloseDate: String,
    val owner: String,
    val description: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateDealDialog(
    onDismiss: () -> Unit,
    onCreateDeal: (CreateDealData) -> Unit,
    isCreating: Boolean,
    error: String?
) {
    var title by remember { mutableStateOf("") }
    var customerName by remember { mutableStateOf("") }
    var value by remember { mutableStateOf("") }
    var stage by remember { mutableStateOf("lead") }
    var probability by remember { mutableStateOf(50) }
    var expectedCloseDate by remember { mutableStateOf("") }
    var owner by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    
    var stageExpanded by remember { mutableStateOf(false) }
    var probabilityExpanded by remember { mutableStateOf(false) }

    var titleError by remember { mutableStateOf(false) }
    var customerError by remember { mutableStateOf(false) }
    var valueError by remember { mutableStateOf(false) }

    val stageOptions = listOf(
        "lead" to "Lead",
        "qualified" to "Qualified",
        "proposal" to "Proposal",
        "negotiation" to "Negotiation",
        "closed-won" to "Closed Won",
        "closed-lost" to "Closed Lost"
    )

    val probabilityOptions = listOf(10, 25, 50, 75, 90, 100)

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
                            text = "Create New Deal",
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
                        text = "Deal Information",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    OutlinedTextField(
                        value = title,
                        onValueChange = {
                            title = it
                            titleError = it.isBlank() || it.length < 3
                        },
                        label = { Text("Deal Title *") },
                        placeholder = { Text("Enterprise Software License") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = titleError,
                        supportingText = if (titleError) {
                            { Text("Title must be at least 3 characters") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        OutlinedTextField(
                            value = customerName,
                            onValueChange = {
                                customerName = it
                                customerError = it.isBlank()
                            },
                            label = { Text("Customer *") },
                            placeholder = { Text("Search customer...") },
                            modifier = Modifier.weight(1f),
                            isError = customerError,
                            supportingText = if (customerError) {
                                { Text("Customer is required") }
                            } else null,
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    OutlinedTextField(
                        value = value,
                        onValueChange = {
                            value = it.filter { char -> char.isDigit() || char == '.' }
                            valueError = value.isEmpty() || value.toDoubleOrNull()?.let { it <= 0 } ?: true
                        },
                        label = { Text("Deal Value ($) *") },
                        placeholder = { Text("50000") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = valueError,
                        supportingText = if (valueError) {
                            { Text("Value must be greater than 0") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Deal Details
                    Text(
                        text = "Deal Details",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        // Stage Dropdown
                        ExposedDropdownMenuBox(
                            expanded = stageExpanded,
                            onExpandedChange = { stageExpanded = !stageExpanded },
                            modifier = Modifier.weight(1f)
                        ) {
                            OutlinedTextField(
                                value = stageOptions.find { it.first == stage }?.second ?: "Lead",
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Stage") },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = stageExpanded) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(type = MenuAnchorType.PrimaryNotEditable),
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                            )
                            ExposedDropdownMenu(
                                expanded = stageExpanded,
                                onDismissRequest = { stageExpanded = false }
                            ) {
                                stageOptions.forEach { (value, label) ->
                                    DropdownMenuItem(
                                        text = { Text(label) },
                                        onClick = {
                                            stage = value
                                            stageExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        // Probability Dropdown
                        ExposedDropdownMenuBox(
                            expanded = probabilityExpanded,
                            onExpandedChange = { probabilityExpanded = !probabilityExpanded },
                            modifier = Modifier.weight(1f)
                        ) {
                            OutlinedTextField(
                                value = "$probability%",
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Probability") },
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = probabilityExpanded) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(type = MenuAnchorType.PrimaryNotEditable),
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                            )
                            ExposedDropdownMenu(
                                expanded = probabilityExpanded,
                                onDismissRequest = { probabilityExpanded = false }
                            ) {
                                probabilityOptions.forEach { value ->
                                    DropdownMenuItem(
                                        text = { Text("$value%") },
                                        onClick = {
                                            probability = value
                                            probabilityExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                    ) {
                        OutlinedTextField(
                            value = expectedCloseDate,
                            onValueChange = { expectedCloseDate = it },
                            label = { Text("Expected Close Date") },
                            placeholder = { Text("YYYY-MM-DD") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )

                        OutlinedTextField(
                            value = owner,
                            onValueChange = { owner = it },
                            label = { Text("Deal Owner") },
                            placeholder = { Text("John Doe") },
                            modifier = Modifier.weight(1f),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Description
                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description") },
                        placeholder = { Text("Additional information about the deal...") },
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
                            titleError = title.isBlank() || title.length < 3
                            customerError = customerName.isBlank()
                            valueError = value.isEmpty() || value.toDoubleOrNull()?.let { it <= 0 } ?: true

                            if (!titleError && !customerError && !valueError) {
                                onCreateDeal(
                                    CreateDealData(
                                        title = title,
                                        customerName = customerName,
                                        value = value,
                                        stage = stage,
                                        probability = probability,
                                        expectedCloseDate = expectedCloseDate,
                                        owner = owner,
                                        description = description
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
                        Text("Create Deal")
                    }
                }
            }
        }
    }
}

