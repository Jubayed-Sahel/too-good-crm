package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.responsivePadding
import too.good.crm.ui.utils.responsiveSpacing

@Composable
fun StyledCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = DesignTokens.Colors.Surface,
    contentColor: Color = DesignTokens.Colors.OnSurface,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor,
            contentColor = contentColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level1
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingStandard),
            content = content
        )
    }
}

@Composable
fun ElevatedCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = DesignTokens.Colors.Surface,
    contentColor: Color = DesignTokens.Colors.OnSurface,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor,
            contentColor = contentColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level3
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingComfortable),
            content = content
        )
    }
}

/**
 * Responsive Card following web-frontend patterns
 * Adjusts padding and spacing based on screen size
 */
@Composable
fun ResponsiveCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = DesignTokens.Colors.Surface,
    contentColor: Color = DesignTokens.Colors.OnSurface,
    elevation: Dp = DesignTokens.Elevation.Level1,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = backgroundColor,
            contentColor = contentColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = elevation
        ),
        shape = RoundedCornerShape(DesignTokens.Radius.Medium)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space4,
                        medium = DesignTokens.Spacing.Space5,
                        expanded = DesignTokens.Spacing.Space6
                    )
                ),
            verticalArrangement = Arrangement.spacedBy(
                responsiveSpacing(
                    compact = DesignTokens.Spacing.Space3,
                    medium = DesignTokens.Spacing.Space4
                )
            ),
            content = content
        )
    }
}

/**
 * Stat Card matching web-frontend StatCard pattern
 * Displays metric with icon, value, and change indicator
 */
@Composable
fun StatCard(
    title: String,
    value: String,
    icon: @Composable () -> Unit,
    change: String,
    isPositive: Boolean = true,
    modifier: Modifier = Modifier,
    iconBackgroundColor: Color = DesignTokens.Colors.SecondaryContainer,
    iconTintColor: Color = DesignTokens.Colors.Secondary
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White,
            contentColor = DesignTokens.Colors.OnSurface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level1
        ),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space4,
                        medium = DesignTokens.Spacing.Space5,
                        expanded = DesignTokens.Spacing.Space6
                    )
                ),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left side: Stats
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (isPositive) Icons.AutoMirrored.Filled.TrendingUp else Icons.AutoMirrored.Filled.TrendingDown,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error
                    )
                    Text(
                        text = change,
                        style = MaterialTheme.typography.bodySmall,
                        color = if (isPositive) DesignTokens.Colors.Success else DesignTokens.Colors.Error,
                        fontWeight = DesignTokens.Typography.FontWeightSemiBold
                    )
                    Text(
                        text = "vs last month",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            
            // Right side: Icon
            Surface(
                shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                color = iconBackgroundColor,
                modifier = Modifier.size(56.dp)
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    icon()
                }
            }
        }
    }
}

/**
 * Welcome Banner Card matching web-frontend WelcomeBanner
 * Gradient background with greeting, title, description, and action buttons
 */
@Composable
fun WelcomeBannerCard(
    greeting: String = "Good Evening",
    title: String = "Welcome to Your Dashboard",
    description: String = "Track your sales pipeline, manage customer relationships, and grow your business",
    onAnalyticsClick: () -> Unit = {},
    onNewDealClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.Primary
        ),
        shape = RoundedCornerShape(DesignTokens.Radius.Large),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level2
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space5,
                        medium = DesignTokens.Spacing.Space6
                    )
                ),
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
        ) {
            // Text Content
            Column(
                verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
            ) {
                Text(
                    text = "$greeting! 👋",
                    style = MaterialTheme.typography.titleMedium,
                    color = DesignTokens.Colors.OnPrimary.copy(alpha = 0.9f)
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnPrimary
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = DesignTokens.Colors.OnPrimary.copy(alpha = 0.95f)
                )
            }
            
            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
            ) {
                OutlinedButton(
                    onClick = onAnalyticsClick,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = DesignTokens.Colors.OnPrimary
                    )
                ) {
                    Text("Analytics")
                }
                Button(
                    onClick = onNewDealClick,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Surface,
                        contentColor = DesignTokens.Colors.Primary
                    )
                ) {
                    Text("New Deal")
                }
            }
        }
    }
}