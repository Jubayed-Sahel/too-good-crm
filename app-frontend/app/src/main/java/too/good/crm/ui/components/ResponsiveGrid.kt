package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.responsiveColumns
import too.good.crm.ui.utils.responsiveSpacing

/**
 * Responsive Grid that adapts column count based on screen size
 * Mimics web-frontend's SimpleGrid with responsive columns
 * 
 * Example usage:
 * ```
 * ResponsiveGrid(
 *     compactColumns = 1,
 *     mediumColumns = 2,
 *     expandedColumns = 3
 * ) {
 *     items.forEach { item ->
 *         ItemCard(item, modifier = Modifier.weight(1f))
 *     }
 * }
 * ```
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ResponsiveGrid(
    modifier: Modifier = Modifier,
    compactColumns: Int = 1,
    mediumColumns: Int = 2,
    expandedColumns: Int = 3,
    horizontalSpacing: androidx.compose.ui.unit.Dp = DesignTokens.Spacing.Space4,
    verticalSpacing: androidx.compose.ui.unit.Dp = DesignTokens.Spacing.Space4,
    content: @Composable FlowRowScope.() -> Unit
) {
    val columns = responsiveColumns(
        compact = compactColumns,
        medium = mediumColumns,
        expanded = expandedColumns
    )
    
    FlowRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(horizontalSpacing),
        verticalArrangement = Arrangement.spacedBy(verticalSpacing),
        maxItemsInEachRow = columns,
        content = content
    )
}

/**
 * Stats Grid for dashboard - matches web-frontend StatsGrid
 * Automatically arranges stat cards in a responsive grid
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun StatsGrid(
    stats: List<StatData>,
    modifier: Modifier = Modifier
) {
    val columns = responsiveColumns(
        compact = 1,
        medium = 2,
        expanded = 3
    )
    
    FlowRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(
            responsiveSpacing(
                compact = DesignTokens.Spacing.Space4,
                medium = DesignTokens.Spacing.Space5
            )
        ),
        verticalArrangement = Arrangement.spacedBy(
            responsiveSpacing(
                compact = DesignTokens.Spacing.Space4,
                medium = DesignTokens.Spacing.Space5
            )
        ),
        maxItemsInEachRow = columns
    ) {
        stats.forEach { stat ->
            Box(modifier = Modifier.weight(1f)) {
                StatCard(
                    title = stat.title,
                    value = stat.value,
                    icon = stat.icon,
                    change = stat.change,
                    isPositive = stat.isPositive,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

/**
 * Data class for stat card information
 */
data class StatData(
    val title: String,
    val value: String,
    val icon: @Composable () -> Unit,
    val change: String,
    val isPositive: Boolean = true
)

/**
 * Simple 2-column grid (common use case)
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TwoColumnGrid(
    modifier: Modifier = Modifier,
    horizontalSpacing: androidx.compose.ui.unit.Dp = DesignTokens.Spacing.Space4,
    verticalSpacing: androidx.compose.ui.unit.Dp = DesignTokens.Spacing.Space4,
    content: @Composable FlowRowScope.() -> Unit
) {
    FlowRow(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(horizontalSpacing),
        verticalArrangement = Arrangement.spacedBy(verticalSpacing),
        maxItemsInEachRow = 2,
        content = content
    )
}
