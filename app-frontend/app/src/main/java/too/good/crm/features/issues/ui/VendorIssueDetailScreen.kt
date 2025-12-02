package too.good.crm.features.issues.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import too.good.crm.features.issues.viewmodel.IssueDetailUiState
import too.good.crm.features.issues.viewmodel.IssueViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VendorIssueDetailScreen(
    issueId: Int,
    onNavigateBack: () -> Unit,
    onOpenLinear: (String) -> Unit,
    viewModel: IssueViewModel = viewModel()
) {
    val detailUiState by viewModel.detailUiState.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    var showStatusDialog by remember { mutableStateOf(false) }
    var showPriorityDialog by remember { mutableStateOf(false) }
    var showResolveDialog by remember { mutableStateOf(false) }
    var resolutionNotes by remember { mutableStateOf("") }

    LaunchedEffect(issueId) {
        viewModel.loadIssueDetails(issueId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Issue Details") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, "Back")
                    }
                },
                actions = {
                    // Quick resolve button
                    if (detailUiState is IssueDetailUiState.Success) {
                        val issue = (detailUiState as IssueDetailUiState.Success).issue
                        if (issue.status != "resolved" && issue.status != "closed") {
                            IconButton(onClick = { showResolveDialog = true }) {
                                Icon(Icons.Default.Check, "Resolve Issue")
                            }
                        }
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when (val state = detailUiState) {
                is IssueDetailUiState.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is IssueDetailUiState.Success -> {
                    val issue = state.issue
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                    ) {
                        // Issue Header
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            )
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = issue.issueNumber,
                                    style = MaterialTheme.typography.labelMedium,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = issue.title,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onPrimaryContainer
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    StatusChip(status = issue.status)
                                    PriorityChip(priority = issue.priority)
                                }
                            }
                        }

                        // Customer Info
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.secondaryContainer
                            )
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Reported By",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = issue.raisedByCustomerName ?: "Unknown Customer",
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Actions
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Actions",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(12.dp))

                                OutlinedButton(
                                    onClick = { showStatusDialog = true },
                                    modifier = Modifier.fillMaxWidth(),
                                    enabled = !isLoading
                                ) {
                                    Text("Update Status")
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedButton(
                                    onClick = { showPriorityDialog = true },
                                    modifier = Modifier.fillMaxWidth(),
                                    enabled = !isLoading
                                ) {
                                    Text("Update Priority")
                                }

                                // Linear Sync Button
                                if (!issue.syncedToLinear) {
                                    Spacer(modifier = Modifier.height(8.dp))

                                    OutlinedButton(
                                        onClick = {
                                            viewModel.syncToLinear(issueId) { success, url ->
                                                if (success && url != null) {
                                                    onOpenLinear(url)
                                                }
                                            }
                                        },
                                        modifier = Modifier.fillMaxWidth(),
                                        enabled = !isLoading
                                    ) {
                                        Text("Sync to Linear")
                                    }
                                }

                                if (issue.status != "resolved" && issue.status != "closed") {
                                    Spacer(modifier = Modifier.height(8.dp))

                                    Button(
                                        onClick = { showResolveDialog = true },
                                        modifier = Modifier.fillMaxWidth(),
                                        enabled = !isLoading
                                    ) {
                                        Text("Mark as Resolved")
                                    }
                                }

                                // Delete Issue Button (for vendors only)
                                Spacer(modifier = Modifier.height(8.dp))

                                OutlinedButton(
                                    onClick = {
                                        viewModel.deleteIssue(issueId) { success, error ->
                                            if (success) {
                                                onNavigateBack()
                                            }
                                        }
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    enabled = !isLoading,
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = MaterialTheme.colorScheme.error
                                    )
                                ) {
                                    Text("Delete Issue")
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Description
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Description",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = issue.description,
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Details
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "Details",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(12.dp))

                                DetailRow("Category", issue.category.capitalizeFirstChar())
                                DetailRow("Created", formatDateTime(issue.createdAt))
                                DetailRow("Last Updated", formatDateTime(issue.updatedAt))

                                issue.assignedToName?.let {
                                    DetailRow("Assigned To", it)
                                }

                                issue.resolvedAt?.let {
                                    DetailRow("Resolved At", formatDateTime(it))
                                }

                                issue.resolvedByName?.let {
                                    DetailRow("Resolved By", it)
                                }

                                issue.resolutionNotes?.let {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Resolution Notes:",
                                        style = MaterialTheme.typography.labelMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = it,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                            }
                        }

                        // Linear Integration
                        if (issue.syncedToLinear && issue.linearIssueUrl != null) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.tertiaryContainer
                                )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Synced with Linear",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "Manage this issue in Linear",
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    }
                                    IconButton(onClick = { onOpenLinear(issue.linearIssueUrl) }) {
                                        Icon(Icons.Default.OpenInBrowser, "Open in Linear")
                                    }
                                }
                            }
                        }

                        // Comments Section
                        if (!issue.comments.isNullOrEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Comments",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "${issue.comments.size} comments",
                                            style = MaterialTheme.typography.labelMedium,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(12.dp))

                                    issue.comments.forEach { comment ->
                                        CommentItem(comment = comment)
                                        if (comment != issue.comments.last()) {
                                            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
                                        }
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Error message
                        errorMessage?.let { error ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp),
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
                    }

                    // Status Dialog
                    if (showStatusDialog) {
                        AlertDialog(
                            onDismissRequest = { showStatusDialog = false },
                            title = { Text("Update Status") },
                            text = {
                                Column {
                                    listOf("open", "in_progress", "resolved", "closed").forEach { status ->
                                        TextButton(
                                            onClick = {
                                                viewModel.updateIssueStatus(issueId, status)
                                                showStatusDialog = false
                                            },
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text(status.replace("_", " ").capitalizeFirstChar())
                                        }
                                    }
                                }
                            },
                            confirmButton = {},
                            dismissButton = {
                                TextButton(onClick = { showStatusDialog = false }) {
                                    Text("Cancel")
                                }
                            }
                        )
                    }

                    // Priority Dialog
                    if (showPriorityDialog) {
                        AlertDialog(
                            onDismissRequest = { showPriorityDialog = false },
                            title = { Text("Update Priority") },
                            text = {
                                Column {
                                    listOf("urgent", "high", "medium", "low").forEach { priority ->
                                        TextButton(
                                            onClick = {
                                                viewModel.updateIssuePriority(issueId, priority)
                                                showPriorityDialog = false
                                            },
                                            modifier = Modifier.fillMaxWidth()
                                        ) {
                                            Text(priority.capitalizeFirstChar())
                                        }
                                    }
                                }
                            },
                            confirmButton = {},
                            dismissButton = {
                                TextButton(onClick = { showPriorityDialog = false }) {
                                    Text("Cancel")
                                }
                            }
                        )
                    }

                    // Resolve Dialog
                    if (showResolveDialog) {
                        AlertDialog(
                            onDismissRequest = {
                                showResolveDialog = false
                                resolutionNotes = ""
                            },
                            title = { Text("Resolve Issue") },
                            text = {
                                OutlinedTextField(
                                    value = resolutionNotes,
                                    onValueChange = { resolutionNotes = it },
                                    label = { Text("Resolution Notes") },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(120.dp),
                                    maxLines = 5
                                )
                            },
                            confirmButton = {
                                TextButton(
                                    onClick = {
                                        viewModel.resolveIssue(issueId, resolutionNotes)
                                        showResolveDialog = false
                                        resolutionNotes = ""
                                    },
                                    enabled = resolutionNotes.isNotBlank()
                                ) {
                                    Text("Resolve")
                                }
                            },
                            dismissButton = {
                                TextButton(onClick = {
                                    showResolveDialog = false
                                    resolutionNotes = ""
                                }) {
                                    Text("Cancel")
                                }
                            }
                        )
                    }
                }
                is IssueDetailUiState.Error -> {
                    ErrorView(
                        message = state.message,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }
    }
}

