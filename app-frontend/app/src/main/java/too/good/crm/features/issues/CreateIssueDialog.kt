package too.good.crm.features.issues

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

data class CreateIssueData(
    val title: String,
    val description: String,
    val priority: String,
    val category: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateIssueDialog(
    onDismiss: () -> Unit,
    onCreateIssue: (CreateIssueData) -> Unit,
    isCreating: Boolean,
    error: String?
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("medium") }
    var category by remember { mutableStateOf("other") }
    
    var priorityExpanded by remember { mutableStateOf(false) }
    var categoryExpanded by remember { mutableStateOf(false) }

    var titleError by remember { mutableStateOf(false) }

    val priorityOptions = listOf(
        "low" to "Low",
        "medium" to "Medium",
        "high" to "High",
        "critical" to "Critical"
    )

    val categoryOptions = listOf(
        "quality" to "Quality",
        "delivery" to "Delivery",
        "payment" to "Payment",
        "communication" to "Communication",
        "other" to "Other"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.8f),
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
                            text = "Create New Issue",
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

                    // Issue Information
                    Text(
                        text = "Issue Information",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    OutlinedTextField(
                        value = title,
                        onValueChange = {
                            title = it
                            titleError = it.isBlank()
                        },
                        label = { Text("Title *") },
                        placeholder = { Text("Enter issue title") },
                        modifier = Modifier.fillMaxWidth(),
                        isError = titleError,
                        supportingText = if (titleError) {
                            { Text("Title is required") }
                        } else null,
                        singleLine = true,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description") },
                        placeholder = { Text("Describe the issue...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4,
                        maxLines = 6,
                        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                    // Priority and Category
                    Text(
                        text = "Classification",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )

                    // Priority Dropdown
                    ExposedDropdownMenuBox(
                        expanded = priorityExpanded,
                        onExpandedChange = { priorityExpanded = !priorityExpanded }
                    ) {
                        OutlinedTextField(
                            value = priorityOptions.find { it.first == priority }?.second ?: "Medium",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Priority") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = priorityExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(type = MenuAnchorType.PrimaryNotEditable),
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                        ExposedDropdownMenu(
                            expanded = priorityExpanded,
                            onDismissRequest = { priorityExpanded = false }
                        ) {
                            priorityOptions.forEach { (value, label) ->
                                DropdownMenuItem(
                                    text = { Text(label) },
                                    onClick = {
                                        priority = value
                                        priorityExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    // Category Dropdown
                    ExposedDropdownMenuBox(
                        expanded = categoryExpanded,
                        onExpandedChange = { categoryExpanded = !categoryExpanded }
                    ) {
                        OutlinedTextField(
                            value = categoryOptions.find { it.first == category }?.second ?: "Other",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Category") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = categoryExpanded) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(type = MenuAnchorType.PrimaryNotEditable),
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )
                        ExposedDropdownMenu(
                            expanded = categoryExpanded,
                            onDismissRequest = { categoryExpanded = false }
                        ) {
                            categoryOptions.forEach { (value, label) ->
                                DropdownMenuItem(
                                    text = { Text(label) },
                                    onClick = {
                                        category = value
                                        categoryExpanded = false
                                    }
                                )
                            }
                        }
                    }

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
                            titleError = title.isBlank()

                            if (!titleError) {
                                onCreateIssue(
                                    CreateIssueData(
                                        title = title,
                                        description = description,
                                        priority = priority,
                                        category = category
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
                        Text("Create Issue")
                    }
                }
            }
        }
    }
}

