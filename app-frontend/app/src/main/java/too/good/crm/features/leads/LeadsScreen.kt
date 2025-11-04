package too.good.crm.features.leads

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.TooGoodCrmTheme

// Data class to represent a Lead. In a real app, this would be in a 'domain' or 'data' layer.
data class Lead(
    val id: Int,
    val companyName: String,
    val contactPerson: String,
    val status: String,
    val value: Double
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LeadsScreen(
    leads: List<Lead>,
    onAddLeadClicked: () -> Unit,
    onLeadClicked: (leadId: Int) -> Unit,
    onLogoutClicked: () -> Unit,
    // viewModel: LeadsViewModel = hiltViewModel() // In a real app
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Leads") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                ),
                actions = {
                    IconButton(onClick = onLogoutClicked) {
                        Icon(
                            imageVector = Icons.Default.Logout,
                            contentDescription = "Log Out"
                        )
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddLeadClicked,
                containerColor = MaterialTheme.colorScheme.secondary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Lead")
            }
        }
    ) { innerPadding ->
        if (leads.isEmpty()) {
            Box(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "No leads yet. Tap the '+' button to add one.",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .padding(innerPadding)
                    .fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(leads, key = { it.id }) { lead ->
                    LeadListItem(lead = lead, onClick = { onLeadClicked(lead.id) })
                }
            }
        }
    }
}

@Composable
fun LeadListItem(
    lead: Lead,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = lead.companyName,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Contact: ${lead.contactPerson}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Status: ${lead.status}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = String.format("$%,.2f", lead.value),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LeadsScreenPreview() {
    val sampleLeads = listOf(
        Lead(1, "Innovate Corp", "John Doe", "Contacted", 15000.0),
        Lead(2, "Tech Solutions", "Jane Smith", "New", 25000.0),
        Lead(3, "Synergy Inc.", "Peter Jones", "Qualified", 5000.0)
    )
    TooGoodCrmTheme {
        LeadsScreen(
            leads = sampleLeads,
            onAddLeadClicked = {},
            onLeadClicked = {},
            onLogoutClicked = {}
        )
    }
}

@Preview(showBackground = true)
@Composable
fun LeadsScreenEmptyPreview() {
    TooGoodCrmTheme {
        LeadsScreen(
            leads = emptyList(),
            onAddLeadClicked = {},
            onLeadClicked = {},
            onLogoutClicked = {}
        )
    }
}
