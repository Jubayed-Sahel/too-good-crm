package too.good.crm.features.client.orders

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
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.features.client.Order
import too.good.crm.features.client.OrderSampleData
import too.good.crm.features.client.OrderStatus
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyOrdersScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<OrderStatus?>(null) }
    val orders = remember { OrderSampleData.getOrders() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredOrders = orders.filter { order ->
        val matchesSearch = searchQuery.isEmpty() ||
                order.orderNumber.contains(searchQuery, ignoreCase = true) ||
                order.vendorName.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || order.status == filterStatus
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
        title = "My Orders",
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
                .background(DesignTokens.Colors.Background)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "My Orders",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Track and manage your purchase orders",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OrderStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total",
                    value = orders.size.toString(),
                    color = DesignTokens.Colors.Info
                )
                OrderStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Active",
                    value = orders.count { it.status != OrderStatus.DELIVERED && it.status != OrderStatus.CANCELLED }.toString(),
                    color = DesignTokens.Colors.Warning
                )
                OrderStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Delivered",
                    value = orders.count { it.status == OrderStatus.DELIVERED }.toString(),
                    color = DesignTokens.Colors.Success
                )
                OrderStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Value",
                    value = "$${(orders.sumOf { it.amount } / 1000).toInt()}K",
                    color = DesignTokens.Colors.Info
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search orders...") },
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
                    focusedBorderColor = DesignTokens.Colors.Info
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Orders List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredOrders) { order ->
                    OrderCard(order = order)
                }
            }
        }
    }
}

@Composable
fun OrderCard(order: Order) {
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
                        text = order.orderNumber,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = order.vendorName,
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
                OrderStatusBadge(status = order.status)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = NumberFormat.getCurrencyInstance(Locale.US).format(order.amount),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.Info
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${order.items} items",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.CalendarToday,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = order.orderDate,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                    if (order.deliveryDate != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.LocalShipping,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.Success
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = order.deliveryDate,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.Success
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrderStatusBadge(status: OrderStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        OrderStatus.PENDING -> Triple(
            DesignTokens.Colors.Warning.copy(alpha = 0.1f),
            DesignTokens.Colors.Warning,
            "Pending"
        )
        OrderStatus.PROCESSING -> Triple(
            DesignTokens.Colors.Info.copy(alpha = 0.1f),
            DesignTokens.Colors.Info,
            "Processing"
        )
        OrderStatus.SHIPPED -> Triple(
            DesignTokens.Colors.StatusScheduled.copy(alpha = 0.1f),
            DesignTokens.Colors.StatusScheduled,
            "Shipped"
        )
        OrderStatus.DELIVERED -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Delivered"
        )
        OrderStatus.CANCELLED -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Cancelled"
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
fun OrderStatCard(
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
                color = DesignTokens.Colors.OnSurfaceVariant,
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

