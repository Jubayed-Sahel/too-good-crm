package too.good.crm.features.deals

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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DealsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var filterStage by remember { mutableStateOf<DealStage?>(null) }
    val deals = remember { DealSampleData.getDeals() }
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    val filteredDeals = deals.filter { deal ->
        val matchesSearch = searchQuery.isEmpty() ||
                deal.title.contains(searchQuery, ignoreCase = true) ||
                deal.customerName.contains(searchQuery, ignoreCase = true)
        val matchesFilter = filterStage == null || deal.stage == filterStage
        matchesSearch && matchesFilter
    }

    AppScaffoldWithDrawer(
        title = "Deals",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate to appropriate dashboard when mode changes
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onBack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space4,
                        medium = DesignTokens.Spacing.Space5,
                        expanded = DesignTokens.Spacing.Space6
                    )
                ),
            verticalArrangement = Arrangement.spacedBy(
                responsiveSpacing(
                    compact = DesignTokens.Spacing.Space4,
                    medium = DesignTokens.Spacing.Space5
                )
            )
        ) {
            // Header Section
            Column(
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                Text(
                    text = "Deals",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = "Track your sales pipeline and manage deals",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }

            // Stats Grid - Responsive (1/2/3/4 columns based on screen)
            ResponsiveGrid(
                compactColumns = 2,
                mediumColumns = 4,
                expandedColumns = 4
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "TOTAL DEALS",
                        value = deals.size.toString(),
                        icon = {
                            Icon(
                                Icons.Default.Description,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Primary
                            )
                        },
                        change = "+12%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f),
                        iconTintColor = DesignTokens.Colors.Primary,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "ACTIVE",
                        value = deals.count { it.status == DealStatus.ACTIVE }.toString(),
                        icon = {
                            Icon(
                                Icons.Default.TrendingUp,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Warning
                            )
                        },
                        change = "+8%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.WarningLight,
                        iconTintColor = DesignTokens.Colors.Warning,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "WON",
                        value = deals.count { it.status == DealStatus.WON }.toString(),
                        icon = {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Success
                            )
                        },
                        change = "+15%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.SuccessLight,
                        iconTintColor = DesignTokens.Colors.Success,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    StatCard(
                        title = "PIPELINE VALUE",
                        value = "$${deals.filter { it.status == DealStatus.ACTIVE }.sumOf { it.value }.toInt() / 1000}K",
                        icon = {
                            Icon(
                                Icons.Default.AttachMoney,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Secondary
                            )
                        },
                        change = "+23%",
                        isPositive = true,
                        iconBackgroundColor = DesignTokens.Colors.SecondaryContainer,
                        iconTintColor = DesignTokens.Colors.Secondary,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Search deals...") },
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
                    unfocusedContainerColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Deals List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(filteredDeals) { deal ->
                    DealCard(deal = deal)
                }
            }
        }
    }
}

@Composable
fun DealCard(deal: Deal) {
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
            // Title and Value
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = deal.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Business,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp),
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = deal.customerName,
                            style = MaterialTheme.typography.bodyMedium,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = NumberFormat.getCurrencyInstance(Locale.US).format(deal.value),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.Success
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    DealStageBadge(stage = deal.stage)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress Bar
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Probability",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = "${deal.probability}%",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = { deal.probability / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = when {
                        deal.probability >= 75 -> DesignTokens.Colors.Success
                        deal.probability >= 50 -> DesignTokens.Colors.Warning
                        else -> DesignTokens.Colors.Error
                    },
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Footer Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.CalendarToday,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Close: ${deal.expectedCloseDate}",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = deal.owner,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun DealStageBadge(stage: DealStage) {
    val (backgroundColor, textColor, text) = when (stage) {
        DealStage.PROSPECTING -> Triple(
            DesignTokens.Colors.Info.copy(alpha = 0.1f),
            DesignTokens.Colors.Info,
            "Prospecting"
        )
        DealStage.QUALIFICATION -> Triple(
            DesignTokens.Colors.StatusScheduled.copy(alpha = 0.1f),
            DesignTokens.Colors.StatusScheduled,
            "Qualification"
        )
        DealStage.PROPOSAL -> Triple(
            DesignTokens.Colors.Warning.copy(alpha = 0.1f),
            DesignTokens.Colors.Warning,
            "Proposal"
        )
        DealStage.NEGOTIATION -> Triple(
            DesignTokens.Colors.PinkAccent.copy(alpha = 0.1f),
            DesignTokens.Colors.PinkAccent,
            "Negotiation"
        )
        DealStage.CLOSED_WON -> Triple(
            DesignTokens.Colors.Success.copy(alpha = 0.1f),
            DesignTokens.Colors.Success,
            "Won"
        )
        DealStage.CLOSED_LOST -> Triple(
            DesignTokens.Colors.Error.copy(alpha = 0.1f),
            DesignTokens.Colors.Error,
            "Lost"
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
fun StatCard(
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

