package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.WindowSize
import too.good.crm.ui.utils.getWindowSize
import too.good.crm.ui.utils.responsiveSpacing

/**
 * Responsive list that shows cards on compact screens
 * and can show table/grid on larger screens
 * 
 * Mimics web-frontend's ResponsiveTable pattern
 * 
 * Example usage:
 * ```
 * ResponsiveList(
 *     items = customers,
 *     compactView = { customer -> CustomerCard(customer) },
 *     expandedView = { customers -> CustomerTable(customers) }
 * )
 * ```
 */
@Composable
fun <T> ResponsiveList(
    items: List<T>,
    modifier: Modifier = Modifier,
    compactView: @Composable (T) -> Unit,
    expandedView: (@Composable (List<T>) -> Unit)? = null
) {
    val windowSize = getWindowSize()
    
    when (windowSize) {
        WindowSize.COMPACT -> {
            // Mobile: Vertical card list
            LazyColumn(
                modifier = modifier,
                verticalArrangement = Arrangement.spacedBy(
                    responsiveSpacing(compact = DesignTokens.Spacing.Space3)
                ),
                contentPadding = PaddingValues(DesignTokens.Spacing.Space4)
            ) {
                items(items) { item ->
                    compactView(item)
                }
            }
        }
        else -> {
            // Tablet/Desktop: Use expanded view if provided, otherwise use cards
            if (expandedView != null) {
                expandedView(items)
            } else {
                LazyColumn(
                    modifier = modifier,
                    verticalArrangement = Arrangement.spacedBy(
                        responsiveSpacing(
                            compact = DesignTokens.Spacing.Space3,
                            medium = DesignTokens.Spacing.Space4
                        )
                    ),
                    contentPadding = PaddingValues(
                        responsiveSpacing(
                            compact = DesignTokens.Spacing.Space4,
                            medium = DesignTokens.Spacing.Space5,
                            expanded = DesignTokens.Spacing.Space6
                        )
                    )
                ) {
                    items(items) { item ->
                        compactView(item)
                    }
                }
            }
        }
    }
}

/**
 * Empty state component
 * Shows when a list has no items
 */
@Composable
fun EmptyState(
    title: String,
    message: String,
    icon: @Composable () -> Unit = {},
    action: (@Composable () -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    ResponsiveCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space6),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
        ) {
            Box(
                modifier = Modifier.size(DesignTokens.Heights.IconXl),
                contentAlignment = Alignment.Center
            ) {
                icon()
            }
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                color = DesignTokens.Colors.OnSurface
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
            action?.invoke()
        }
    }
}

/**
 * Loading state component
 * Shows when data is being fetched
 */
@Composable
fun LoadingState(
    message: String = "Loading...",
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(DesignTokens.Spacing.Space8),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
        ) {
            CircularProgressIndicator(
                color = DesignTokens.Colors.Primary,
                strokeWidth = DesignTokens.Spacing.Space1
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
        }
    }
}

/**
 * Error state component
 * Shows when data fetching fails
 */
@Composable
fun ErrorState(
    title: String = "Something went wrong",
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    ResponsiveCard(
        modifier = modifier.fillMaxWidth(),
        backgroundColor = DesignTokens.Colors.ErrorLight,
        contentColor = DesignTokens.Colors.Error
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space6),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
        ) {
            Text(
                text = "⚠️",
                style = MaterialTheme.typography.displaySmall
            )
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                color = DesignTokens.Colors.ErrorDark
            )
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.Error
            )
            if (onRetry != null) {
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error,
                        contentColor = DesignTokens.Colors.Surface
                    )
                ) {
                    Text("Retry")
                }
            }
        }
    }
}
