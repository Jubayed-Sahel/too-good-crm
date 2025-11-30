package too.good.crm.features.activities

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Note
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import too.good.crm.data.model.ActivityListItem
import too.good.crm.ui.theme.DesignTokens
import java.text.SimpleDateFormat
import java.util.*

/**
 * Activity Timeline Component
 * Displays activities in a timeline format with grouping by date
 */
@Composable
fun ActivityTimeline(
    activities: List<ActivityListItem>,
    isLoading: Boolean,
    onActivityClick: (Int) -> Unit,
    onRefresh: () -> Unit,
    modifier: Modifier = Modifier
) {
    when {
        isLoading -> {
            Box(
                modifier = modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        activities.isEmpty() -> {
            EmptyActivitiesState(
                onCreateActivity = {}, // Handled by parent
                modifier = modifier
            )
        }
        else -> {
            // Group activities by date
            val groupedActivities = activities.groupBy { activity ->
                val date = parseDate(activity.createdAt)
                formatDateHeader(date)
            }
            
            LazyColumn(
                modifier = modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                groupedActivities.forEach { (dateHeader, activitiesInGroup) ->
                    // Date Header
                    item(key = "header_$dateHeader") {
                        Text(
                            text = dateHeader,
                            style = MaterialTheme.typography.labelLarge,
                            color = DesignTokens.Colors.TextSecondary,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                    
                    // Activities for this date
                    items(
                        items = activitiesInGroup,
                        key = { it.id }
                    ) { activity ->
                        ActivityTimelineItem(
                            activity = activity,
                            onClick = { onActivityClick(activity.id) }
                        )
                    }
                }
            }
        }
    }
}

/**
 * Single Activity Item in Timeline
 */
@Composable
private fun ActivityTimelineItem(
    activity: ActivityListItem,
    onClick: () -> Unit
) {
    var isExpanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { isExpanded = !isExpanded },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Activity Type Icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(getActivityTypeColor(activity.activityType).copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = getActivityTypeIcon(activity.activityType),
                    contentDescription = activity.activityTypeDisplay,
                    tint = getActivityTypeColor(activity.activityType),
                    modifier = Modifier.size(24.dp)
                )
            }
            
            // Content
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Title and Status
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = activity.title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = if (isExpanded) Int.MAX_VALUE else 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    
                    ActivityStatusBadge(status = activity.status)
                }
                
                // Type Display
                Text(
                    text = activity.activityTypeDisplay ?: activity.activityType,
                    style = MaterialTheme.typography.labelSmall,
                    color = getActivityTypeColor(activity.activityType)
                )
                
                // Description (if expanded)
                if (isExpanded && !activity.description.isNullOrBlank()) {
                    Text(
                        text = activity.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = DesignTokens.Colors.TextSecondary
                    )
                }
                
                // Metadata Row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Assigned To
                    if (!activity.assignedToName.isNullOrBlank()) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.TextSecondary
                            )
                            Text(
                                text = activity.assignedToName,
                                style = MaterialTheme.typography.labelSmall,
                                color = DesignTokens.Colors.TextSecondary
                            )
                        }
                    }
                    
                    // Time
                    activity.scheduledAt?.let { scheduledAt ->
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Schedule,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.TextSecondary
                            )
                            Text(
                                text = formatTime(scheduledAt),
                                style = MaterialTheme.typography.labelSmall,
                                color = DesignTokens.Colors.TextSecondary
                            )
                        }
                    }
                    
                    // Customer Name
                    if (!activity.customerName.isNullOrBlank()) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Business,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp),
                                tint = DesignTokens.Colors.TextSecondary
                            )
                            Text(
                                text = activity.customerName,
                                style = MaterialTheme.typography.labelSmall,
                                color = DesignTokens.Colors.TextSecondary,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Activity Status Badge
 */
@Composable
private fun ActivityStatusBadge(status: String) {
    val (color, text) = when (status.lowercase()) {
        "scheduled" -> DesignTokens.Colors.Info to "Scheduled"
        "in_progress" -> DesignTokens.Colors.Warning to "In Progress"
        "completed" -> DesignTokens.Colors.Success to "Completed"
        "cancelled" -> DesignTokens.Colors.Error to "Cancelled"
        else -> DesignTokens.Colors.TextSecondary to status
    }
    
    Surface(
        shape = RoundedCornerShape(4.dp),
        color = color.copy(alpha = 0.1f),
        modifier = Modifier.border(
            width = 1.dp,
            color = color.copy(alpha = 0.3f),
            shape = RoundedCornerShape(4.dp)
        )
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = color,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
        )
    }
}

/**
 * Empty Activities State
 */
@Composable
private fun EmptyActivitiesState(
    onCreateActivity: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Icon(
            Icons.Default.EventNote,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = DesignTokens.Colors.TextSecondary.copy(alpha = 0.5f)
        )
        
        Text(
            text = "No Activities Yet",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.SemiBold,
            color = DesignTokens.Colors.TextSecondary
        )
        
        Text(
            text = "Track calls, emails, meetings, and more to keep a complete history of interactions.",
            style = MaterialTheme.typography.bodyMedium,
            color = DesignTokens.Colors.TextSecondary.copy(alpha = 0.7f),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}

/**
 * Get icon for activity type
 */
private fun getActivityTypeIcon(activityType: String): ImageVector {
    return when (activityType.lowercase()) {
        "call" -> Icons.Default.Phone
        "email" -> Icons.Default.Email
        "telegram" -> Icons.AutoMirrored.Filled.Send
        "meeting" -> Icons.Default.Event
        "note" -> Icons.AutoMirrored.Filled.Note
        "task" -> Icons.Default.CheckCircle
        else -> Icons.Default.EventNote
    }
}

/**
 * Get color for activity type
 */
private fun getActivityTypeColor(activityType: String): Color {
    return when (activityType.lowercase()) {
        "call" -> Color(0xFF10B981) // Green
        "email" -> Color(0xFF3B82F6) // Blue
        "telegram" -> Color(0xFF0088CC) // Telegram Blue
        "meeting" -> Color(0xFF8B5CF6) // Purple
        "note" -> Color(0xFFF59E0B) // Amber
        "task" -> Color(0xFFEC4899) // Pink
        else -> DesignTokens.Colors.TextSecondary
    }
}

/**
 * Parse ISO date string to Date
 */
private fun parseDate(dateString: String): Date {
    return try {
        val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        format.parse(dateString) ?: Date()
    } catch (e: Exception) {
        Date()
    }
}

/**
 * Format date for group header
 */
private fun formatDateHeader(date: Date): String {
    val calendar = Calendar.getInstance()
    val today = calendar.time
    calendar.add(Calendar.DAY_OF_YEAR, -1)
    val yesterday = calendar.time
    
    return when {
        isSameDay(date, today) -> "Today"
        isSameDay(date, yesterday) -> "Yesterday"
        else -> SimpleDateFormat("MMMM dd, yyyy", Locale.getDefault()).format(date)
    }
}

/**
 * Format time for display
 */
private fun formatTime(dateString: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val outputFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
        val date = inputFormat.parse(dateString)
        date?.let { outputFormat.format(it) } ?: dateString
    } catch (e: Exception) {
        dateString
    }
}

/**
 * Check if two dates are the same day
 */
private fun isSameDay(date1: Date, date2: Date): Boolean {
    val cal1 = Calendar.getInstance().apply { time = date1 }
    val cal2 = Calendar.getInstance().apply { time = date2 }
    return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
            cal1.get(Calendar.DAY_OF_YEAR) == cal2.get(Calendar.DAY_OF_YEAR)
}
