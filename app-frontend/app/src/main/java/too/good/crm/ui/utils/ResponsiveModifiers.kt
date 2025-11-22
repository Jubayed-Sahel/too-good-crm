package too.good.crm.ui.utils

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.DesignTokens

/**
 * Window size classes following Material Design 3 guidelines
 * Matches web-frontend's responsive breakpoint strategy
 */
enum class WindowSize {
    COMPACT,  // < 600dp (phones in portrait)
    MEDIUM,   // 600-840dp (tablets in portrait, unfolded flip phones)
    EXPANDED  // > 840dp (tablets in landscape, foldables, desktops)
}

/**
 * Get current window size based on screen width
 * Follows Material Design 3 Window Size Classes
 */
@Composable
fun getWindowSize(): WindowSize {
    val configuration = LocalConfiguration.current
    val screenWidth = configuration.screenWidthDp.dp
    
    return when {
        screenWidth < DesignTokens.Breakpoints.CompactWidth -> WindowSize.COMPACT
        screenWidth < DesignTokens.Breakpoints.MediumWidth -> WindowSize.MEDIUM
        else -> WindowSize.EXPANDED
    }
}

/**
 * Responsive spacing based on window size
 * 
 * Example usage:
 * ```
 * .padding(responsiveSpacing(
 *     compact = 16.dp,
 *     medium = 20.dp,
 *     expanded = 24.dp
 * ))
 * ```
 */
@Composable
fun responsiveSpacing(
    compact: Dp,
    medium: Dp = compact,
    expanded: Dp = medium
): Dp {
    return when (getWindowSize()) {
        WindowSize.COMPACT -> compact
        WindowSize.MEDIUM -> medium
        WindowSize.EXPANDED -> expanded
    }
}

/**
 * Responsive padding values
 * Returns PaddingValues with all sides set to the responsive spacing
 * 
 * Example usage:
 * ```
 * .padding(responsivePadding(
 *     compact = DesignTokens.Spacing.Space4,
 *     medium = DesignTokens.Spacing.Space5,
 *     expanded = DesignTokens.Spacing.Space6
 * ))
 * ```
 */
@Composable
fun responsivePadding(
    compact: Dp,
    medium: Dp = compact,
    expanded: Dp = medium
): PaddingValues {
    val padding = responsiveSpacing(compact, medium, expanded)
    return PaddingValues(padding)
}

/**
 * Responsive padding with separate horizontal and vertical values
 */
@Composable
fun responsivePaddingValues(
    compactHorizontal: Dp,
    compactVertical: Dp,
    mediumHorizontal: Dp = compactHorizontal,
    mediumVertical: Dp = compactVertical,
    expandedHorizontal: Dp = mediumHorizontal,
    expandedVertical: Dp = mediumVertical
): PaddingValues {
    return when (getWindowSize()) {
        WindowSize.COMPACT -> PaddingValues(
            horizontal = compactHorizontal,
            vertical = compactVertical
        )
        WindowSize.MEDIUM -> PaddingValues(
            horizontal = mediumHorizontal,
            vertical = mediumVertical
        )
        WindowSize.EXPANDED -> PaddingValues(
            horizontal = expandedHorizontal,
            vertical = expandedVertical
        )
    }
}

/**
 * Responsive column count for grid layouts
 * Matches web-frontend's responsive grid pattern
 * 
 * Example usage:
 * ```
 * val columns = responsiveColumns(
 *     compact = 1,
 *     medium = 2,
 *     expanded = 3
 * )
 * ```
 */
@Composable
fun responsiveColumns(
    compact: Int = 1,
    medium: Int = 2,
    expanded: Int = 3
): Int {
    return when (getWindowSize()) {
        WindowSize.COMPACT -> compact
        WindowSize.MEDIUM -> medium
        WindowSize.EXPANDED -> expanded
    }
}

/**
 * Responsive font size
 */
@Composable
fun <T> responsiveValue(
    compact: T,
    medium: T = compact,
    expanded: T = medium
): T {
    return when (getWindowSize()) {
        WindowSize.COMPACT -> compact
        WindowSize.MEDIUM -> medium
        WindowSize.EXPANDED -> expanded
    }
}

/**
 * Check if current screen is compact (mobile)
 */
@Composable
fun isCompactScreen(): Boolean = getWindowSize() == WindowSize.COMPACT

/**
 * Check if current screen is medium or larger (tablet+)
 */
@Composable
fun isTabletOrLarger(): Boolean = getWindowSize() != WindowSize.COMPACT

/**
 * Check if current screen is expanded (tablet landscape, desktop)
 */
@Composable
fun isExpandedScreen(): Boolean = getWindowSize() == WindowSize.EXPANDED

// Helper functions with default values from DesignTokens

/**
 * Default responsive spacing using DesignTokens
 */
@Composable
fun defaultResponsiveSpacing(): Dp = responsiveSpacing(
    compact = DesignTokens.Spacing.Space4,
    medium = DesignTokens.Spacing.Space5,
    expanded = DesignTokens.Spacing.Space6
)

/**
 * Default responsive padding using DesignTokens
 */
@Composable
fun defaultResponsivePadding(): PaddingValues = responsivePadding(
    compact = DesignTokens.Spacing.Space4,
    medium = DesignTokens.Spacing.Space5,
    expanded = DesignTokens.Spacing.Space6
)

/**
 * Get responsive icon size based on window size
 */
@Composable
fun getResponsiveIconSize(): Dp = responsiveSpacing(
    compact = 24.dp,
    medium = 28.dp,
    expanded = 32.dp
)

/**
 * Get responsive title font size based on window size
 */
@Composable
fun getResponsiveTitleSize(): TextUnit = responsiveValue(
    compact = DesignTokens.Typography.TitleLarge,
    medium = DesignTokens.Typography.HeadlineSmall,
    expanded = DesignTokens.Typography.HeadlineMedium
)

/**
 * Get responsive body font size based on window size
 */
@Composable
fun getResponsiveBodySize(): TextUnit = responsiveValue(
    compact = DesignTokens.Typography.BodyMedium,
    medium = DesignTokens.Typography.BodyLarge,
    expanded = DesignTokens.Typography.BodyLarge
)

/**
 * Get responsive small font size based on window size
 */
@Composable
fun getResponsiveSmallSize(): TextUnit = responsiveValue(
    compact = DesignTokens.Typography.BodySmall,
    medium = DesignTokens.Typography.BodyMedium,
    expanded = DesignTokens.Typography.BodyMedium
)

/**
 * Get responsive corner radius based on window size
 */
@Composable
fun getResponsiveCornerRadius(): Dp = responsiveSpacing(
    compact = DesignTokens.Radius.Medium,
    medium = DesignTokens.Radius.Large,
    expanded = DesignTokens.Radius.Large
)

/**
 * Get responsive elevation based on window size
 */
@Composable
fun getResponsiveElevation(): Dp = responsiveSpacing(
    compact = 2.dp,
    medium = 4.dp,
    expanded = 6.dp
)

