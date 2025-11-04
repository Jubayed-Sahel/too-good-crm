package too.good.crm.features.dashboard

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.People
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.Purple500
import too.good.crm.ui.theme.TooGoodCrmTheme

// Data class to represent a dashboard navigation item
data class DashboardItem(
    val title: String,
    val icon: ImageVector,
    val route: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onLogoutClicked: () -> Unit,
    onDashboardItemClicked: (route: String) -> Unit
) {
    // List of features accessible from the dashboard
    val dashboardItems = listOf(
        DashboardItem("Leads", Icons.Default.People, "leads"),
        DashboardItem("Tasks", Icons.Default.CheckCircle, "tasks"),
        DashboardItem("Analytics", Icons.Default.BarChart, "analytics")
        // Add more items here as your app grows
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Dashboard") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Purple500, // From DESIGN_TOKENS
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
        }
    ) { innerPadding ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2), // A 2-column grid layout
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            items(dashboardItems) { item ->
                DashboardCard(
                    item = item,
                    onClick = { onDashboardItemClicked(item.route) }
                )
            }
        }
    }
}

@Composable
fun DashboardCard(
    item: DashboardItem,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .aspectRatio(1f) // Makes the card a square
            .clickable(onClick = onClick),
        shape = MaterialTheme.shapes.medium, // Consistent 8.dp rounding
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp), // Subtle shadow
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = "${item.title} Icon",
                modifier = Modifier.size(48.dp),
                tint = Purple500 // Use primary color for icons
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = item.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DashboardScreenPreview() {
    TooGoodCrmTheme {
        DashboardScreen(onLogoutClicked = {}, onDashboardItemClicked = {})
    }
}
