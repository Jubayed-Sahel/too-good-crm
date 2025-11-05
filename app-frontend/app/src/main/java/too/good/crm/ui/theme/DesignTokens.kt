package too.good.crm.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object DesignTokens {
    // Colors - Brand
    object Colors {
        // Purple (Primary)
        val Purple50 = Color(0xFFF5F3FF)
        val Purple100 = Color(0xFFEDE9FE)
        val Purple200 = Color(0xFFDDD6FE)
        val Purple300 = Color(0xFFC4B5FD)
        val Purple400 = Color(0xFFA78BFA)
        val Purple500 = Color(0xFF8B5CF6) // Main
        val Purple600 = Color(0xFF7C3AED)
        val Purple700 = Color(0xFF6D28D9)
        val Purple800 = Color(0xFF5B21B6)
        val Purple900 = Color(0xFF4C1D95)

        // Blue (Secondary)
        val Blue50 = Color(0xFFEFF6FF)
        val Blue100 = Color(0xFFDBEAFE)
        val Blue500 = Color(0xFF3B82F6)
        val Blue600 = Color(0xFF2563EB)
        val Blue700 = Color(0xFF1D4ED8)
        val Blue900 = Color(0xFF1E3A8A)

        // Semantic Colors
        val Success = Color(0xFF22C55E)
        val Warning = Color(0xFFF59E0B)
        val Error = Color(0xFFEF4444)
        val Info = Color(0xFF3B82F6)

        // Status Colors
        val Active = Color(0xFF22C55E)
        val Pending = Color(0xFFF59E0B)
        val Inactive = Color(0xFF6B7280)
        val Won = Color(0xFF22C55E)
        val Lost = Color(0xFFEF4444)

        // Gray Scale
        val Gray50 = Color(0xFFF9FAFB)
        val Gray100 = Color(0xFFF3F4F6)
        val Gray200 = Color(0xFFE5E7EB)
        val Gray300 = Color(0xFFD1D5DB)
        val Gray400 = Color(0xFF9CA3AF)
        val Gray500 = Color(0xFF6B7280)
        val Gray600 = Color(0xFF4B5563)
        val Gray700 = Color(0xFF374151)
        val Gray800 = Color(0xFF1F2937)
        val Gray900 = Color(0xFF111827)

        // Status Badge Colors
        val GreenBg = Color(0xFFDCFCE7)
        val GreenText = Color(0xFF15803D)
        val YellowBg = Color(0xFFFEF3C7)
        val YellowText = Color(0xFF92400E)
        val RedBg = Color(0xFFFEE2E2)
        val RedText = Color(0xFF991B1B)
        val PurpleBg = Color(0xFFF3E8FF)
        val PurpleText = Color(0xFF6B21A8)

        val White = Color(0xFFFFFFFF)
        val Black = Color(0xFF000000)
    }

    // Typography
    object Typography {
        val FontSizeXs: TextUnit = 12.sp
        val FontSizeSm: TextUnit = 14.sp
        val FontSizeMd: TextUnit = 16.sp
        val FontSizeLg: TextUnit = 18.sp
        val FontSizeXl: TextUnit = 20.sp
        val FontSize2xl: TextUnit = 24.sp
        val FontSize3xl: TextUnit = 30.sp

        val FontWeightNormal = androidx.compose.ui.text.font.FontWeight.Normal // 400
        val FontWeightMedium = androidx.compose.ui.text.font.FontWeight.Medium // 500
        val FontWeightSemiBold = androidx.compose.ui.text.font.FontWeight.SemiBold // 600
        val FontWeightBold = androidx.compose.ui.text.font.FontWeight.Bold // 700
    }

    // Spacing (4px increments)
    object Spacing {
        val Space1: Dp = 4.dp
        val Space2: Dp = 8.dp
        val Space3: Dp = 12.dp
        val Space4: Dp = 16.dp
        val Space6: Dp = 24.dp
        val Space8: Dp = 32.dp
        val Space12: Dp = 48.dp
    }

    // Border Radius
    object Radius {
        val Sm: Dp = 2.dp
        val Base: Dp = 4.dp
        val Lg: Dp = 8.dp // Standard for inputs/buttons
        val Xl: Dp = 12.dp // Standard for cards/dialogs
        val Xxl: Dp = 16.dp
        val Xxxl: Dp = 24.dp
    }

    // Component Heights
    object Heights {
        val InputSm: Dp = 32.dp
        val InputMd: Dp = 40.dp // Standard
        val InputLg: Dp = 48.dp
        val InputXl: Dp = 56.dp

        val IconXs: Dp = 12.dp
        val IconSm: Dp = 14.dp
        val IconMd: Dp = 16.dp
        val IconLg: Dp = 20.dp
        val IconXl: Dp = 24.dp
        val IconStatCard: Dp = 48.dp
    }
}
