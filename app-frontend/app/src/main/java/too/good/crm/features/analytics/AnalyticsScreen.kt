package too.good.crm.features.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Analytics") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = MaterialTheme.colorScheme.onPrimary,
                    navigationIconContentColor = MaterialTheme.colorScheme.onPrimary,
                    actionIconContentColor = MaterialTheme.colorScheme.onPrimary
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(Color(0xFFF9FAFB))
                .verticalScroll(rememberScrollState())
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = "Analytics Dashboard",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Business intelligence and performance insights",
                style = MaterialTheme.typography.bodyMedium,
                color = Color(0xFF6B7280)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Key Metrics
            Text(
                text = "Key Performance Indicators",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF374151)
            )
            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AnalyticsMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Total Revenue",
                    value = "$485K",
                    subtitle = "This month",
                    icon = Icons.Default.AttachMoney,
                    color = Color(0xFF22C55E)
                )
                AnalyticsMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Active Deals",
                    value = "24",
                    subtitle = "In pipeline",
                    icon = Icons.Default.TrendingUp,
                    color = Color(0xFF8B5CF6)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                AnalyticsMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Customers",
                    value = "5",
                    subtitle = "Active accounts",
                    icon = Icons.Default.People,
                    color = Color(0xFF3B82F6)
                )
                AnalyticsMetricCard(
                    modifier = Modifier.weight(1f),
                    title = "Win Rate",
                    value = "68%",
                    subtitle = "Success rate",
                    icon = Icons.Default.ShowChart,
                    color = Color(0xFFF59E0B)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Pipeline Analysis
            Text(
                text = "Pipeline Analysis",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF374151)
            )
            Spacer(modifier = Modifier.height(12.dp))

            PipelineStageCard(
                stage = "Prospecting",
                count = 3,
                value = 75000.0,
                color = Color(0xFF3B82F6)
            )

            Spacer(modifier = Modifier.height(12.dp))

            PipelineStageCard(
                stage = "Qualification",
                count = 4,
                value = 120000.0,
                color = Color(0xFF8B5CF6)
            )

            Spacer(modifier = Modifier.height(12.dp))

            PipelineStageCard(
                stage = "Proposal",
                count = 5,
                value = 185000.0,
                color = Color(0xFFF59E0B)
            )

            Spacer(modifier = Modifier.height(12.dp))

            PipelineStageCard(
                stage = "Negotiation",
                count = 8,
                value = 325000.0,
                color = Color(0xFFEC4899)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Performance Trends
            Text(
                text = "Performance Trends",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF374151)
            )
            Spacer(modifier = Modifier.height(12.dp))

            TrendCard(
                title = "Revenue Growth",
                value = "+23%",
                description = "Compared to last month",
                isPositive = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            TrendCard(
                title = "Customer Acquisition",
                value = "+12%",
                description = "New customers this quarter",
                isPositive = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            TrendCard(
                title = "Deal Conversion",
                value = "+8%",
                description = "Conversion rate improvement",
                isPositive = true
            )

            Spacer(modifier = Modifier.height(12.dp))

            TrendCard(
                title = "Average Deal Size",
                value = "+15%",
                description = "Higher value per deal",
                isPositive = true
            )
        }
    }
}

@Composable
fun AnalyticsMetricCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
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
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF111827)
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF374151)
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6B7280),
                fontSize = 12.sp
            )
        }
    }
}

@Composable
fun PipelineStageCard(
    stage: String,
    count: Int,
    value: Double,
    color: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = color.copy(alpha = 0.1f),
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = count.toString(),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = color
                    )
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = stage,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$count deals",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF6B7280)
                )
            }

            Text(
                text = "$${(value / 1000).toInt()}K",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF22C55E)
            )
        }
    }
}

@Composable
fun TrendCard(
    title: String,
    value: String,
    description: String,
    isPositive: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
            Icon(
                imageVector = if (isPositive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                contentDescription = null,
                tint = if (isPositive) Color(0xFF22C55E) else Color(0xFFEF4444),
                modifier = Modifier.size(32.dp)
            )

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF6B7280)
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = if (isPositive) Color(0xFF22C55E).copy(alpha = 0.1f) else Color(0xFFEF4444).copy(alpha = 0.1f)
            ) {
                Text(
                    text = value,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.titleMedium,
                    color = if (isPositive) Color(0xFF22C55E) else Color(0xFFEF4444),
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

