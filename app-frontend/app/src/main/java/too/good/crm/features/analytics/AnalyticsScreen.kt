package too.good.crm.features.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.features.profile.ProfileViewModel
import too.good.crm.ui.components.AppScaffoldWithDrawer
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.responsivePadding
import too.good.crm.ui.utils.responsiveSpacing
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AnalyticsScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val profileViewModel = remember { ProfileViewModel(context) }
    val profileState by profileViewModel.uiState.collectAsState()
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    LaunchedEffect(Unit) {
        if (profileState.profiles.isEmpty() && !profileState.isLoading) {
            profileViewModel.loadProfiles()
        }
    }

    AppScaffoldWithDrawer(
        title = "Analytics",
        activeMode = activeMode,
        profiles = profileState.profiles,
        activeProfile = profileState.activeProfile,
        isSwitchingProfile = profileState.isSwitching,
        onProfileSelected = { profile ->
            profileViewModel.switchProfile(
                profileId = profile.id,
                onSuccess = { user ->
                    val primaryProfile = user.primaryProfile ?: profile
                    val newMode = when (primaryProfile.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        else -> ActiveMode.CLIENT
                    }
                    UserSession.activeMode = newMode
                    activeMode = newMode
                    when (primaryProfile.profileType) {
                        "customer" -> onNavigate("client-dashboard")
                        else -> onNavigate("dashboard")
                    }
                },
                onError = { }
            )
        },
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
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
                .verticalScroll(rememberScrollState())
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
            AnalyticsHeader()

            // Revenue Overview Card
            RevenueOverviewCard()

            // Sales Pipeline Card
            SalesPipelineCard()

            // Top Performers Card
            TopPerformersCard()

            // Conversion Funnel Card
            ConversionFunnelCard()

            // Recent Activities Card
            RecentActivitiesCard()
        }
    }
}

@Composable
fun AnalyticsHeader() {
    Column(
        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
    ) {
        Text(
            text = "Analytics",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = DesignTokens.Typography.FontWeightBold,
            color = DesignTokens.Colors.OnSurface
        )
        Text(
            text = "Track your sales performance and business insights",
            style = MaterialTheme.typography.bodyMedium,
            color = DesignTokens.Colors.OnSurfaceVariant
        )
    }
    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
    
    // Action Buttons
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
    ) {
        OutlinedButton(
            onClick = { /* TODO: Date range picker */ },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(DesignTokens.Radius.Medium),
            border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.Outline)
        ) {
            Icon(Icons.Default.CalendarToday, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
            Text("Last 30 Days", fontSize = 14.sp)
        }
        Button(
            onClick = { /* TODO: Export report */ },
            modifier = Modifier.weight(1f),
            colors = ButtonDefaults.buttonColors(
                containerColor = DesignTokens.Colors.Primary
            ),
            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
        ) {
            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
            Text("Export Report", fontSize = 14.sp)
        }
    }
}

@Composable
fun RevenueOverviewCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable)
        ) {
            Text(
                text = "REVENUE OVERVIEW",
                style = MaterialTheme.typography.labelMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            
            Text(
                text = "$125,000",
                style = MaterialTheme.typography.displaySmall,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = DesignTokens.Colors.OnSurface
            )
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                Surface(
                    shape = RoundedCornerShape(DesignTokens.Radius.Small),
                    color = DesignTokens.Colors.SuccessLight.copy(alpha = 0.3f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            Icons.Default.TrendingUp,
                            contentDescription = null,
                            tint = DesignTokens.Colors.Success,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "+27.6%",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                            color = DesignTokens.Colors.Success
                        )
                    }
                }
                Text(
                    text = "vs last month",
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            
            // Simple bar chart visualization
            val months = listOf("Jan", "Feb", "Mar", "Apr", "May", "Jun")
            val values = listOf(65000, 75000, 82000, 98000, 115000, 125000)
            val maxValue = values.maxOrNull() ?: 1
            
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.Bottom
            ) {
                months.forEachIndexed { index, month ->
                    Column(
                        modifier = Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(4.dp, Alignment.Bottom)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(((values[index].toFloat() / maxValue.toFloat()) * 100).dp)
                                .clip(RoundedCornerShape(topStart = 4.dp, topEnd = 4.dp))
                                .background(
                                    if (index == months.lastIndex) DesignTokens.Colors.Info
                                    else DesignTokens.Colors.OutlineVariant
                                )
                        )
                        Text(
                            text = month,
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            fontSize = 10.sp
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
            
            // Footer stats
            HorizontalDivider(color = DesignTokens.Colors.OutlineVariant)
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Previous Month",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = "$98,000",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Growth",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = "$27,000",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                        color = DesignTokens.Colors.Success
                    )
                }
            }
        }
    }
}

@Composable
fun SalesPipelineCard() {
    val stages = listOf(
        PipelineStage("Lead", 45, 225000, DesignTokens.Colors.ChartGray),
        PipelineStage("Qualified", 32, 480000, DesignTokens.Colors.ChartBlue),
        PipelineStage("Proposal", 18, 540000, DesignTokens.Colors.ChartPurple),
        PipelineStage("Negotiation", 12, 360000, DesignTokens.Colors.ChartOrange),
        PipelineStage("Closed Won", 8, 320000, DesignTokens.Colors.ChartGreen)
    )
    
    val totalValue = stages.sumOf { it.value }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable),
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
        ) {
            Text(
                text = "SALES PIPELINE",
                style = MaterialTheme.typography.labelMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                letterSpacing = 0.5.sp
            )
            
            Text(
                text = formatCurrency(totalValue),
                style = MaterialTheme.typography.displaySmall,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = DesignTokens.Colors.OnSurface,
                fontSize = 32.sp
            )
            
            Text(
                text = "Total Pipeline Value",
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            
            stages.forEach { stage ->
                val percentage = (stage.value.toFloat() / totalValue.toFloat()) * 100
                PipelineStageRow(stage, percentage)
            }
        }
    }
}

data class PipelineStage(
    val name: String,
    val count: Int,
    val value: Int,
    val color: Color
)

@Composable
fun PipelineStageRow(stage: PipelineStage, percentage: Float) {
    Column(
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(stage.color)
                )
                Text(
                    text = stage.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = "(${stage.count})",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
            Text(
                text = formatCurrency(stage.value),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = DesignTokens.Colors.OnSurface
            )
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(8.dp)
                    .clip(RoundedCornerShape(DesignTokens.Radius.Full))
                    .background(DesignTokens.Colors.OutlineVariant)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(percentage / 100f)
                        .background(stage.color)
                )
            }
            Text(
                text = "${percentage.toInt()}%",
                style = MaterialTheme.typography.labelSmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                modifier = Modifier.widthIn(min = 35.dp)
            )
        }
    }
}

@Composable
fun TopPerformersCard() {
    val performers = listOf(
        Performer("John Smith", "Sales Manager", 24, 580000, DesignTokens.Colors.ChartYellow),
        Performer("Sarah Johnson", "Sales Rep", 19, 425000, DesignTokens.Colors.ChartGray),
        Performer("Michael Chen", "Sales Rep", 16, 380000, DesignTokens.Colors.ChartOrange),
        Performer("Emily Davis", "Account Manager", 14, 340000, DesignTokens.Colors.Info),
        Performer("David Wilson", "Sales Rep", 12, 295000, DesignTokens.Colors.Info)
    )
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable),
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    Icons.Default.EmojiEvents,
                    contentDescription = null,
                    tint = DesignTokens.Colors.Secondary,
                    modifier = Modifier.size(18.dp)
                )
                Text(
                    text = "TOP PERFORMERS",
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    letterSpacing = 0.5.sp
                )
            }
            
            performers.forEachIndexed { index, performer ->
                PerformerRow(performer, index + 1, index == 0)
            }
        }
    }
}

data class Performer(
    val name: String,
    val role: String,
    val deals: Int,
    val revenue: Int,
    val color: Color
)

@Composable
fun PerformerRow(performer: Performer, rank: Int, isTopPerformer: Boolean) {
    Surface(
        shape = RoundedCornerShape(DesignTokens.Radius.Medium),
        color = if (isTopPerformer) DesignTokens.Colors.InfoLight.copy(alpha = 0.3f) 
               else Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space3),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(performer.color),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = performer.name.split(" ").map { it.first() }.joinToString(""),
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.White,
                    fontWeight = DesignTokens.Typography.FontWeightBold
                )
            }
            
            if (rank <= 3) {
                Surface(
                    shape = CircleShape,
                    color = when(rank) {
                        1 -> DesignTokens.Colors.ChartYellow
                        2 -> DesignTokens.Colors.ChartGray
                        else -> DesignTokens.Colors.ChartOrange
                    },
                    modifier = Modifier.offset(x = (-20).dp, y = 12.dp)
                ) {
                    Text(
                        text = rank.toString(),
                        modifier = Modifier.padding(4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.White,
                        fontWeight = DesignTokens.Typography.FontWeightBold,
                        fontSize = 10.sp
                    )
                }
            }
            
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = performer.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = performer.role,
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
            
            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = formatCurrency(performer.revenue),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = "${performer.deals} deals",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun ConversionFunnelCard() {
    val funnelStages = listOf(
        FunnelStage("Leads", 500, 100),
        FunnelStage("Qualified", 320, 64),
        FunnelStage("Proposal", 180, 36),
        FunnelStage("Negotiation", 120, 24),
        FunnelStage("Closed Won", 80, 16)
    )
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable),
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
        ) {
            Text(
                text = "CONVERSION FUNNEL",
                style = MaterialTheme.typography.labelMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                letterSpacing = 0.5.sp
            )
            
            Text(
                text = "Lead to customer conversion rate: 16%",
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))
            
            funnelStages.forEachIndexed { index, stage ->
                FunnelStageRow(stage, index == 0, index == funnelStages.lastIndex)
                if (index < funnelStages.lastIndex) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.ArrowDropDown,
                            contentDescription = null,
                            tint = DesignTokens.Colors.OutlineVariant,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

data class FunnelStage(
    val name: String,
    val count: Int,
    val percentage: Int
)

@Composable
fun FunnelStageRow(stage: FunnelStage, isFirst: Boolean, isLast: Boolean) {
    Column(
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stage.name,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stage.count.toString(),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Text(
                    text = "(${stage.percentage}%)",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
        }
        
        Box(
            modifier = Modifier
                .fillMaxWidth(stage.percentage / 100f)
                .height(48.dp)
                .clip(RoundedCornerShape(DesignTokens.Radius.Medium))
                .background(
                    when {
                        isLast -> DesignTokens.Colors.Success
                        isFirst -> DesignTokens.Colors.InfoLight
                        else -> DesignTokens.Colors.Info.copy(alpha = 0.5f)
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "${stage.percentage}%",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = DesignTokens.Typography.FontWeightBold,
                color = if (isLast) DesignTokens.Colors.White else DesignTokens.Colors.OnSurface
            )
        }
    }
}

@Composable
fun RecentActivitiesCard() {
    val activities = listOf(
        Activity("Enterprise CRM Solution deal closed", "John Smith", "5 minutes ago", Icons.Default.CheckCircle, DesignTokens.Colors.Success, "won"),
        Activity("Product demo with TechCorp Inc.", "Sarah Johnson", "1 hour ago", Icons.Default.CalendarToday, DesignTokens.Colors.Warning, null),
        Activity("Follow-up call with Digital Solutions", "Michael Chen", "2 hours ago", Icons.Default.Phone, DesignTokens.Colors.Info, null),
        Activity("Proposal sent to Global Systems", "Emily Davis", "3 hours ago", Icons.Default.Email, DesignTokens.Colors.Secondary, null),
        Activity("Mobile App Development moved to Negotiation", "John Smith", "4 hours ago", Icons.Default.CheckCircle, DesignTokens.Colors.Success, null),
        Activity("Discovery call with Startup Ventures", "Sarah Johnson", "5 hours ago", Icons.Default.Phone, DesignTokens.Colors.Info, null)
    )
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable)
        ) {
            Text(
                text = "RECENT ACTIVITIES",
                style = MaterialTheme.typography.labelMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                letterSpacing = 0.5.sp
            )
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
            
            activities.forEachIndexed { index, activity ->
                ActivityRow(activity)
                if (index < activities.lastIndex) {
                    HorizontalDivider(
                        modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2),
                        color = DesignTokens.Colors.OutlineVariant
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
            HorizontalDivider(color = DesignTokens.Colors.OutlineVariant)
            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))
            
            Text(
                text = "View All Activities",
                modifier = Modifier.fillMaxWidth(),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                color = DesignTokens.Colors.Primary,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }
    }
}

data class Activity(
    val title: String,
    val user: String,
    val time: String,
    val icon: ImageVector,
    val color: Color,
    val status: String?
)

@Composable
fun ActivityRow(activity: Activity) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(activity.color.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                activity.icon,
                contentDescription = null,
                tint = activity.color,
                modifier = Modifier.size(16.dp)
            )
        }
        
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = activity.title,
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "by ${activity.user}",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
                Text(
                    text = "•",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
                Text(
                    text = activity.time,
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }
        }
        
        if (activity.status != null) {
            Surface(
                shape = RoundedCornerShape(DesignTokens.Radius.Small),
                color = DesignTokens.Colors.SuccessLight.copy(alpha = 0.3f)
            ) {
                Text(
                    text = activity.status,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    color = DesignTokens.Colors.Success
                )
            }
        }
    }
}

fun formatCurrency(value: Int): String {
    val format = NumberFormat.getCurrencyInstance(Locale.US)
    format.maximumFractionDigits = 0
    return format.format(value)
}
