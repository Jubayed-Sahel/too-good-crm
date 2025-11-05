
package too.good.crm.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import too.good.crm.ui.theme.DesignTokens

val AppTypography = Typography(
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = DesignTokens.Typography.FontWeightNormal,
        fontSize = DesignTokens.Typography.FontSizeMd
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = DesignTokens.Typography.FontWeightNormal,
        fontSize = DesignTokens.Typography.FontSizeSm
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = DesignTokens.Typography.FontWeightNormal,
        fontSize = DesignTokens.Typography.FontSizeXs
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
        fontSize = DesignTokens.Typography.FontSize2xl
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = DesignTokens.Typography.FontWeightMedium,
        fontSize = DesignTokens.Typography.FontSizeXl
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = DesignTokens.Typography.FontWeightMedium,
        fontSize = DesignTokens.Typography.FontSizeSm
    )
)
