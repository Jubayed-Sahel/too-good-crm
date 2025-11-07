package too.good.crm.features.client.payment

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
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterStatus by remember { mutableStateOf<PaymentStatus?>(null) }
    val payments = remember { PaymentSampleData.getPayments() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredPayments = payments.filter { payment ->
        val matchesSearch = searchQuery.isEmpty() ||
                payment.paymentNumber.contains(searchQuery, ignoreCase = true) ||
                payment.vendorName.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStatus == null || payment.status == filterStatus
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
        title = "Payments",
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
                text = "Payments",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Manage your payment history and upcoming dues",
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Cards
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                PaymentStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Total Paid",
                    value = "$${(payments.filter { it.status == PaymentStatus.PAID }.sumOf { it.amount } / 1000).toInt()}K",
                    color = DesignTokens.Colors.Success
                )
                PaymentStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Pending",
                    value = payments.count { it.status == PaymentStatus.PENDING }.toString(),
                    color = DesignTokens.Colors.Warning
                )
                PaymentStatCard(
                    modifier = Modifier.weight(1f),
                    title = "Overdue",
                    value = payments.count { it.status == PaymentStatus.OVERDUE }.toString(),
                    color = DesignTokens.Colors.Error
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search payments...") },
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

            // Payments List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredPayments) { payment ->
                    PaymentCard(payment = payment)
                }
            }
        }
    }
}

@Composable
fun PaymentCard(payment: Payment) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* Navigate to detail */ },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Payment Icon
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = DesignTokens.Colors.Info.copy(alpha = 0.1f),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Payment,
                        contentDescription = null,
                        tint = DesignTokens.Colors.Info,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Payment Info
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = payment.paymentNumber,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = payment.vendorName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                    PaymentStatusBadge(status = payment.status)
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = NumberFormat.getCurrencyInstance(Locale.US).format(payment.amount),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.Info
                    )

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = payment.method,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            fontSize = 12.sp
                        )
                        if (payment.dueDate != null) {
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Due: ${payment.dueDate}",
                                style = MaterialTheme.typography.bodySmall,
                                color = if (payment.status == PaymentStatus.OVERDUE) DesignTokens.Colors.Error else DesignTokens.Colors.OnSurfaceVariant,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PaymentStatusBadge(status: PaymentStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        PaymentStatus.PAID -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Paid"
        )
        PaymentStatus.PENDING -> Triple(
            DesignTokens.Colors.Warning.copy(alpha = 0.1f),
            DesignTokens.Colors.Warning,
            "Pending"
        )
        PaymentStatus.OVERDUE -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Overdue"
        )
        PaymentStatus.FAILED -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Failed"
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
fun PaymentStatCard(
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

