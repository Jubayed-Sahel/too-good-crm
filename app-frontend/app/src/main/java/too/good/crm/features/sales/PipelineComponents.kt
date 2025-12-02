package too.good.crm.features.sales

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGesturesAfterLongPress
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import kotlinx.coroutines.delay
import too.good.crm.data.model.*
import too.good.crm.ui.theme.DesignTokens
import java.text.NumberFormat
import java.util.*
import kotlin.math.roundToInt

/**
 * Horizontal Pipeline Board with Drag and Drop
 */
@Composable
fun HorizontalPipelineBoard(
    stages: List<StageConfig>,
    dealsGroupedByStage: Map<String, List<DealListItem>>,
    leadsGroupedByStage: Map<String, List<LeadListItem>>,
    onDealClick: (DealListItem) -> Unit,
    onLeadClick: (LeadListItem) -> Unit,
    onMoveLeadToNextStage: (LeadListItem, String) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()
    
    LazyRow(
        state = listState,
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        userScrollEnabled = true
    ) {
        itemsIndexed(
            items = stages,
            key = { _, stage -> stage.key }
        ) { index, stage ->
            val deals = dealsGroupedByStage[stage.key] ?: emptyList()
            val leads = leadsGroupedByStage[stage.key] ?: emptyList()
            val nextStage = if (index < stages.size - 1) stages[index + 1] else null
            
            PipelineStageColumn(
                stage = stage,
                deals = deals,
                leads = leads,
                nextStage = nextStage,
                onDealClick = onDealClick,
                onLeadClick = onLeadClick,
                onMoveLeadToNextStage = onMoveLeadToNextStage
            )
        }
    }
}

/**
 * Individual Pipeline Stage Column
 */
@Composable
private fun PipelineStageColumn(
    stage: StageConfig,
    deals: List<DealListItem>,
    leads: List<LeadListItem>,
    nextStage: StageConfig?,
    onDealClick: (DealListItem) -> Unit,
    onLeadClick: (LeadListItem) -> Unit,
    onMoveLeadToNextStage: (LeadListItem, String) -> Unit
) {
    val totalItems = deals.size + leads.size
    val totalValue = remember(deals, leads) {
        deals.sumOf { it.value.toDoubleOrNull() ?: 0.0 } +
        leads.sumOf { it.estimatedValue?.toDoubleOrNull() ?: 0.0 }
    }
    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale.US) }
    
    Card(
        modifier = Modifier
            .width(320.dp)
            .heightIn(min = 500.dp, max = 700.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Stage Header - Matches web design
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(stage.color.copy(alpha = 0.08f))
                    .padding(horizontal = 16.dp, vertical = 14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = stage.icon,
                                contentDescription = null,
                                tint = stage.color,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = stage.label,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.OnSurface,
                                fontSize = 15.sp
                            )
                        }
                        Text(
                            text = currencyFormat.format(totalValue),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold,
                            color = stage.color,
                            fontSize = 14.sp
                        )
                    }
                    
                    Surface(
                        shape = CircleShape,
                        color = stage.color,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = totalItems.toString(),
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            }
            
            Divider(color = DesignTokens.Colors.OutlineVariant, thickness = 1.dp)
            
            // Items List
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Show leads
                items(
                    items = leads,
                    key = { "lead-${it.id}" }
                ) { lead ->
                    LeadCard(
                        lead = lead,
                        stageColor = stage.color,
                        nextStage = nextStage,
                        onMoveToNextStage = { nextStageKey ->
                            android.util.Log.d("PipelineStageColumn", "onMoveToNextStage called for lead ${lead.id} to stage $nextStageKey")
                            onMoveLeadToNextStage(lead, nextStageKey)
                        }
                    )
                }
                
                // Show deals
                items(
                    items = deals,
                    key = { "deal-${it.id}" }
                ) { deal ->
                    DealCard(
                        deal = deal,
                        stageColor = stage.color,
                        onClick = { onDealClick(deal) }
                    )
                }
                
                // Empty state
                if (totalItems == 0) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 40.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Inbox,
                                    contentDescription = null,
                                    tint = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.5f),
                                    modifier = Modifier.size(48.dp)
                                )
                                Text(
                                    text = "No items",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.7f)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Deal Card Component with Drag Support
 */
@Composable
private fun DealCard(
    deal: DealListItem,
    stageColor: Color,
    onClick: () -> Unit
) {
    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale.US) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 1.dp,
            pressedElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Title
            Text(
                text = deal.title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = DesignTokens.Colors.TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            // Customer
            deal.customerName?.let { customerName ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = DesignTokens.Colors.SurfaceVariant.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = null,
                            tint = DesignTokens.Colors.OnSurfaceVariant,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = customerName,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
            
            // Value and Probability
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(
                        text = "Value",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    Text(
                        text = currencyFormat.format(deal.value.toDoubleOrNull() ?: 0.0),
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = stageColor
                    )
                }
                
                deal.probability?.let { probability ->
                    if (deal.stage != "closed-won" && deal.stage != "closed-lost") {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = when {
                                probability >= 70 -> DesignTokens.Colors.Success
                                probability >= 40 -> DesignTokens.Colors.Warning
                                else -> DesignTokens.Colors.OnSurfaceVariant
                            }.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "$probability%",
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = when {
                                    probability >= 70 -> DesignTokens.Colors.Success
                                    probability >= 40 -> DesignTokens.Colors.Warning
                                    else -> DesignTokens.Colors.OnSurfaceVariant
                                }
                            )
                        }
                    }
                }
            }
            
            // Metadata footer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                deal.expectedCloseDate?.let { date ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = null,
                            tint = DesignTokens.Colors.OnSurfaceVariant,
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = formatDate(date),
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
                
                deal.assignedToName?.let { assignedTo ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(stageColor, shape = CircleShape)
                        )
                        Text(
                            text = assignedTo,
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

/**
 * Lead Card Component with Drag Support
 */
@Composable
private fun LeadCard(
    lead: LeadListItem,
    stageColor: Color,
    nextStage: StageConfig?,
    onMoveToNextStage: (String) -> Unit
) {
    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale.US) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.Primary.copy(alpha = 0.3f)),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 1.dp,
            pressedElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Header with badge and action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(4.dp),
                        color = DesignTokens.Colors.Primary
                    ) {
                        Text(
                            text = "Lead",
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 10.sp
                        )
                    }
                    Text(
                        text = "ID: ${lead.id}",
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 10.sp
                    )
                }
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { /* TODO: View lead detail */ },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Visibility,
                            contentDescription = "View",
                            tint = DesignTokens.Colors.Primary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    IconButton(
                        onClick = { /* TODO: Edit */ },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = DesignTokens.Colors.Secondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    IconButton(
                        onClick = { /* TODO: Delete */ },
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = DesignTokens.Colors.Error,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    
                    // Move to next stage button (hidden if at final stage)
                    nextStage?.let { next ->
                        IconButton(
                            onClick = { 
                                android.util.Log.d("LeadCard", "Arrow clicked for lead ${lead.id}, moving to stage ${next.key}")
                                onMoveToNextStage(next.key)
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ArrowForward,
                                contentDescription = "Move to ${next.label}",
                                tint = DesignTokens.Colors.Primary,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
            
            // Name
            Text(
                text = lead.name,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            // Contact Info
            lead.email?.let { email ->
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = DesignTokens.Colors.SurfaceVariant.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Email,
                            contentDescription = null,
                            tint = DesignTokens.Colors.OnSurfaceVariant,
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = email,
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
            
            // Estimated Value
            lead.estimatedValue?.toDoubleOrNull()?.let { value ->
                if (value > 0) {
                    Column {
                        Text(
                            text = "Estimated Value",
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                        Text(
                            text = currencyFormat.format(value),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.Primary
                        )
                    }
                }
            }
            
            // Metadata footer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = null,
                        tint = DesignTokens.Colors.OnSurfaceVariant,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = formatDate(lead.createdAt),
                        style = MaterialTheme.typography.labelSmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
                
                lead.assignedToName?.let { assignedTo ->
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(DesignTokens.Colors.Primary, shape = CircleShape)
                        )
                        Text(
                            text = assignedTo,
                            style = MaterialTheme.typography.labelSmall,
                            color = DesignTokens.Colors.OnSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

/**
 * Helper function to format dates
 */
private fun formatDate(dateString: String): String {
    return try {
        val date = java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).parse(dateString)
        date?.let {
            java.text.SimpleDateFormat("MMM dd, yyyy", Locale.US).format(it)
        } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}

/**
 * Statistics Cards Row
 */
@Composable
fun PipelineStatistics(
    pipelineValue: Double,
    openDeals: Int,
    wonDeals: Int,
    wonValue: Double,
    winRate: Int,
    modifier: Modifier = Modifier
) {
    val currencyFormat = remember { NumberFormat.getCurrencyInstance(Locale.US) }
    
    LazyRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(horizontal = 4.dp)
    ) {
        item {
            StatCard(
                title = "Pipeline Value",
                value = currencyFormat.format(pipelineValue),
                icon = Icons.Default.AttachMoney,
                iconBackgroundColor = DesignTokens.Colors.Primary.copy(alpha = 0.15f),
                iconTint = DesignTokens.Colors.Primary
            )
        }
        
        item {
            StatCard(
                title = "Open Deals",
                value = openDeals.toString(),
                icon = Icons.Default.TrendingUp,
                iconBackgroundColor = DesignTokens.Colors.Info.copy(alpha = 0.15f),
                iconTint = DesignTokens.Colors.Info
            )
        }
        
        item {
            StatCard(
                title = "Closed Won",
                value = wonDeals.toString(),
                subtitle = currencyFormat.format(wonValue),
                icon = Icons.Default.EmojiEvents,
                iconBackgroundColor = DesignTokens.Colors.Success.copy(alpha = 0.15f),
                iconTint = DesignTokens.Colors.Success
            )
        }
        
        item {
            StatCard(
                title = "Win Rate",
                value = "$winRate%",
                icon = Icons.Default.CheckCircle,
                iconBackgroundColor = DesignTokens.Colors.Warning.copy(alpha = 0.15f),
                iconTint = DesignTokens.Colors.Warning
            )
        }
    }
}

/**
 * Individual Stat Card - Matches web frontend design
 */
@Composable
fun StatCard(
    title: String,
    value: String,
    icon: ImageVector,
    iconBackgroundColor: Color,
    iconTint: Color,
    subtitle: String? = null,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .width(180.dp)
            .height(140.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant.copy(alpha = 0.8f),
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineLarge,
                    fontWeight = FontWeight.Bold,
                    color = DesignTokens.Colors.OnSurface,
                    fontSize = 32.sp,
                    lineHeight = 36.sp
                )
                subtitle?.let {
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 13.sp
                    )
                }
            }
            
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(iconBackgroundColor, shape = RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(28.dp)
                )
            }
        }
    }
}
