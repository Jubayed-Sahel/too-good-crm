
package too.good.crm.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = DesignTokens.Colors.Purple500,
    onPrimary = Color.White,
    primaryContainer = DesignTokens.Colors.Purple100,
    onPrimaryContainer = DesignTokens.Colors.Purple900,

    secondary = DesignTokens.Colors.Blue500,
    onSecondary = Color.White,
    secondaryContainer = DesignTokens.Colors.Blue100,
    onSecondaryContainer = DesignTokens.Colors.Blue900,

    error = DesignTokens.Colors.Error,
    onError = Color.White,
    errorContainer = DesignTokens.Colors.RedBg,
    onErrorContainer = DesignTokens.Colors.RedText,

    background = DesignTokens.Colors.Gray50,
    onBackground = DesignTokens.Colors.Gray900,

    surface = Color.White,
    onSurface = DesignTokens.Colors.Gray900,
    surfaceVariant = DesignTokens.Colors.Gray100,
    onSurfaceVariant = DesignTokens.Colors.Gray700,

    outline = DesignTokens.Colors.Gray200,
    outlineVariant = DesignTokens.Colors.Gray300
)

@Composable
fun TooGoodCrmTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = AppTypography,
        content = content
    )
}
