package too.good.crm.features.client

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.AppScaffoldWithDrawer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyVendorsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<VendorStatus?>(null) }
    val vendors = remember { VendorSampleData.getVendors() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredVendors = vendors.filter { vendor ->
        val matchesSearch = searchQuery.isEmpty() ||
                vendor.name.contains(searchQuery, ignoreCase = true) ||
                vendor.category.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || vendor.status == filterStatus
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
        title = "My Vendors",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
            if (newMode == ActiveMode.VENDOR) {
                onNavigate("dashboard")
            } else {
                onNavigate("client-dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onBack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF9FAFB))
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "My Vendors",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Manage your vendor relationships and track partnerships",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF6B7280)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                VendorStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = vendors.size.toString(),
                    color = Color(0xFF3B82F6)
                )
                VendorStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Active",
                    value = vendors.count { it.status == VendorStatus.ACTIVE }.toString(),
                    color = Color(0xFF22C55E)
                )
                VendorStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Orders",
                    value = vendors.sumOf { it.totalOrders }.toString(),
                    color = Color(0xFF3B82F6)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search vendors...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = null)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear")
                        }
                    }
                },
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = Color.White,
                    unfocusedContainerColor = Color.White,
                    focusedBorderColor = Color(0xFF3B82F6)
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Vendors List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredVendors) { vendor ->
                    VendorCard(vendor = vendor)
                }
            }
        }
    }
}

@Composable
fun VendorCard(vendor: Vendor) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = vendor.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = vendor.category,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF6B7280)
                    )
                }
                VendorStatusBadge(status = vendor.status)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Star,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = Color(0xFFFBBF24)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${vendor.rating}",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1F2937)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Icon(
                        Icons.Default.ShoppingBag,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = Color(0xFF3B82F6)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${vendor.totalOrders} orders",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF6B7280)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Email,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Color(0xFF6B7280)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = vendor.email,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF6B7280)
                    )
                }
            }
        }
    }
}

@Composable
fun VendorStatusBadge(status: VendorStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        VendorStatus.ACTIVE -> Triple(
            Color(0xFF22C55E).copy(alpha = 0.1f),
            Color(0xFF22C55E),
            "Active"
        )
        VendorStatus.INACTIVE -> Triple(
            Color(0xFF6B7280).copy(alpha = 0.1f),
            Color(0xFF6B7280),
            "Inactive"
        )
    }

    Surface(
        shape = RoundedCornerShape(6.dp),
        color = backgroundColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium,
            fontSize = 11.sp
        )
    }
}

@Composable
fun VendorStatCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    color: Color
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6B7280),
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = color,
                fontSize = 20.sp
            )
        }
    }
}

