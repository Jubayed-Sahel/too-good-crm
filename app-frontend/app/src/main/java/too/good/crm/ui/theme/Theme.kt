package too.good.crm.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

/**
 * Light Color Scheme for Too Good CRM
 * Following Material 3 design guidelines
 */
private val LightColorScheme = lightColorScheme(
    primary = DesignTokens.Colors.Primary,
    onPrimary = DesignTokens.Colors.OnPrimary,
    primaryContainer = DesignTokens.Colors.PrimaryContainer,
    onPrimaryContainer = DesignTokens.Colors.Primary,
    secondary = DesignTokens.Colors.Secondary,
    onSecondary = DesignTokens.Colors.OnSecondary,
    secondaryContainer = DesignTokens.Colors.SecondaryContainer,
    onSecondaryContainer = DesignTokens.Colors.Secondary,
    tertiary = DesignTokens.Colors.Primary,
    onTertiary = DesignTokens.Colors.OnPrimary,
    error = DesignTokens.Colors.Error,
    onError = DesignTokens.Colors.White,
    errorContainer = DesignTokens.Colors.ErrorLight,
    onErrorContainer = DesignTokens.Colors.ErrorDark,
    background = DesignTokens.Colors.Background,
    onBackground = DesignTokens.Colors.OnSurface,
    surface = DesignTokens.Colors.Surface,
    onSurface = DesignTokens.Colors.OnSurface,
    surfaceVariant = DesignTokens.Colors.SurfaceVariant,
    onSurfaceVariant = DesignTokens.Colors.OnSurfaceVariant,
    outline = DesignTokens.Colors.Outline,
    outlineVariant = DesignTokens.Colors.OutlineVariant,
    surfaceTint = DesignTokens.Colors.SurfaceTint
)

/**
 * Dark Color Scheme for Too Good CRM
 * Following Material 3 design guidelines
 */
private val DarkColorScheme = darkColorScheme(
    primary = DesignTokens.Colors.PrimaryLight,
    onPrimary = DesignTokens.Colors.PrimaryDark,
    primaryContainer = DesignTokens.Colors.PrimaryDark,
    onPrimaryContainer = DesignTokens.Colors.PrimaryLight,
    secondary = DesignTokens.Colors.SecondaryLight,
    onSecondary = DesignTokens.Colors.SecondaryDark,
    secondaryContainer = DesignTokens.Colors.SecondaryDark,
    onSecondaryContainer = DesignTokens.Colors.SecondaryLight,
    tertiary = DesignTokens.Colors.PrimaryLight,
    onTertiary = DesignTokens.Colors.PrimaryDark,
    error = DesignTokens.Colors.ErrorLight,
    onError = DesignTokens.Colors.ErrorDark,
    errorContainer = DesignTokens.Colors.ErrorDark,
    onErrorContainer = DesignTokens.Colors.ErrorLight,
    background = androidx.compose.ui.graphics.Color(0xFF1F2937),
    onBackground = androidx.compose.ui.graphics.Color(0xFFF9FAFB),
    surface = androidx.compose.ui.graphics.Color(0xFF111827),
    onSurface = androidx.compose.ui.graphics.Color(0xFFF9FAFB),
    surfaceVariant = androidx.compose.ui.graphics.Color(0xFF374151),
    onSurfaceVariant = androidx.compose.ui.graphics.Color(0xFFD1D5DB),
    outline = androidx.compose.ui.graphics.Color(0xFF6B7280),
    outlineVariant = androidx.compose.ui.graphics.Color(0xFF4B5563),
    surfaceTint = DesignTokens.Colors.PrimaryLight
)

/**
 * Too Good CRM Theme
 * 
 * Supports:
 * - Light and dark themes
 * - Dynamic color (Android 12+)
 * - System bar styling
 * 
 * @param darkTheme Whether to use dark theme. Defaults to system preference.
 * @param dynamicColor Whether to use dynamic color (Android 12+). Defaults to true.
 * @param content The composable content to apply the theme to.
 */
@Composable
fun TooGoodCrmTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        // Dynamic color is available on Android 12+
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) 
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}

