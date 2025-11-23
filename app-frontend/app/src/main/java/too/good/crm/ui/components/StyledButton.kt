package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.WindowSize
import too.good.crm.ui.utils.getWindowSize

@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        modifier = modifier.height(DesignTokens.Heights.ButtonStandard),
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = DesignTokens.Colors.Primary,
            contentColor = DesignTokens.Colors.OnPrimary,
            disabledContainerColor = DesignTokens.Colors.Outline,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = DesignTokens.Typography.FontWeightSemiBold
        )
    }
}

@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(DesignTokens.Heights.ButtonStandard),
        enabled = enabled,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = DesignTokens.Colors.Primary,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        ),
        border = ButtonDefaults.outlinedButtonBorder.copy(
            brush = androidx.compose.ui.graphics.SolidColor(DesignTokens.Colors.Primary)
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = DesignTokens.Typography.FontWeightSemiBold
        )
    }
}

/**
 * Responsive Primary Button with adaptive sizing based on screen size
 * Matches web-frontend's button patterns
 */
@Composable
fun ResponsivePrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: (@Composable () -> Unit)? = null,
    containerColor: Color = DesignTokens.Colors.Primary,
    contentColor: Color = DesignTokens.Colors.OnPrimary
) {
    val windowSize = getWindowSize()
    val buttonHeight = when (windowSize) {
        WindowSize.COMPACT -> DesignTokens.Heights.ButtonStandard
        else -> DesignTokens.Heights.ButtonStandard + 4.dp
    }
    
    Button(
        onClick = onClick,
        modifier = modifier.height(buttonHeight),
        enabled = enabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = containerColor,
            contentColor = contentColor,
            disabledContainerColor = DesignTokens.Colors.Outline,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        ),
        contentPadding = PaddingValues(
            horizontal = DesignTokens.Padding.ButtonHorizontal,
            vertical = DesignTokens.Padding.ButtonVertical
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
            verticalAlignment = Alignment.CenterVertically
        ) {
            icon?.invoke()
            Text(
                text = text,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = DesignTokens.Typography.FontWeightMedium
            )
        }
    }
}

/**
 * Responsive Outlined Button with adaptive sizing
 */
@Composable
fun ResponsiveOutlinedButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: (@Composable () -> Unit)? = null,
    contentColor: Color = DesignTokens.Colors.Primary
) {
    val windowSize = getWindowSize()
    val buttonHeight = when (windowSize) {
        WindowSize.COMPACT -> DesignTokens.Heights.ButtonStandard
        else -> DesignTokens.Heights.ButtonStandard + 4.dp
    }
    
    OutlinedButton(
        onClick = onClick,
        modifier = modifier.height(buttonHeight),
        enabled = enabled,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = contentColor,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        ),
        contentPadding = PaddingValues(
            horizontal = DesignTokens.Padding.ButtonHorizontal,
            vertical = DesignTokens.Padding.ButtonVertical
        ),
        border = ButtonDefaults.outlinedButtonBorder.copy(
            brush = androidx.compose.ui.graphics.SolidColor(contentColor)
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
            verticalAlignment = Alignment.CenterVertically
        ) {
            icon?.invoke()
            Text(
                text = text,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = DesignTokens.Typography.FontWeightMedium
            )
        }
    }
}

/**
 * Text Button - for tertiary actions
 */
@Composable
fun ResponsiveTextButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: (@Composable () -> Unit)? = null,
    contentColor: Color = DesignTokens.Colors.Primary
) {
    TextButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled,
        colors = ButtonDefaults.textButtonColors(
            contentColor = contentColor,
            disabledContentColor = DesignTokens.Colors.OnSurfaceVariant
        )
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
            verticalAlignment = Alignment.CenterVertically
        ) {
            icon?.invoke()
            Text(
                text = text,
                style = MaterialTheme.typography.labelMedium,
                fontWeight = DesignTokens.Typography.FontWeightMedium
            )
        }
    }
}