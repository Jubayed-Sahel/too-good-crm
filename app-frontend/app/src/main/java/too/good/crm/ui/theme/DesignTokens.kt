package too.good.crm.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object DesignTokens {
    // Colors - Material Design 3 Vendor/Admin Theme (Matching Web App)
    object Colors {
        // Brand Colors (Vendor Primary - Matching Web App)
        val Primary = Color(0xFF8B5CF6) // Purple 500
        val PrimaryVariant = Color(0xFF7C3AED) // Purple 600
        val PrimaryLight = Color(0xFFA78BFA) // Purple 400
        val PrimaryDark = Color(0xFF6D28D9) // Purple 700
        val PrimaryContainer = Color(0xFFEDE9FE) // Purple 100
        
        // Primary Color Scale (Matching Web App)
        val Primary50 = Color(0xFFF5F3FF)
        val Primary100 = Color(0xFFEDE9FE)
        val Primary200 = Color(0xFFDDD6FE)
        val Primary300 = Color(0xFFC4B5FD)
        val Primary400 = Color(0xFFA78BFA)
        val Primary500 = Color(0xFF8B5CF6)
        val Primary600 = Color(0xFF7C3AED)
        val Primary700 = Color(0xFF6D28D9)
        val Primary800 = Color(0xFF5B21B6)
        val Primary900 = Color(0xFF4C1D95)

        // Secondary Colors (Blue - Matching Web App)
        val Secondary = Color(0xFF3B82F6) // Blue 500
        val SecondaryVariant = Color(0xFF2563EB) // Blue 600
        val SecondaryLight = Color(0xFF60A5FA) // Blue 400
        val SecondaryDark = Color(0xFF1D4ED8) // Blue 700
        val SecondaryContainer = Color(0xFFDBEAFE) // Blue 100
        
        // Secondary Color Scale (Matching Web App)
        val Secondary50 = Color(0xFFEFF6FF)
        val Secondary100 = Color(0xFFDBEAFE)
        val Secondary200 = Color(0xFFBFDBFE)
        val Secondary300 = Color(0xFF93C5FD)
        val Secondary400 = Color(0xFF60A5FA)
        val Secondary500 = Color(0xFF3B82F6)
        val Secondary600 = Color(0xFF2563EB)
        val Secondary700 = Color(0xFF1D4ED8)
        val Secondary800 = Color(0xFF1E40AF)
        val Secondary900 = Color(0xFF1E3A8A)

        // Semantic Colors (Matching Web App)
        val Success = Color(0xFF22C55E) // Green 500
        val SuccessLight = Color(0xFFDCFCE7) // Green 100
        val SuccessDark = Color(0xFF15803D) // Green 700
        val Success50 = Color(0xFFF0FDF4)
        val Success100 = Color(0xFFDCFCE7)
        val Success200 = Color(0xFFBBF7D0)
        val Success300 = Color(0xFF86EFAC)
        val Success400 = Color(0xFF4ADE80)
        val Success500 = Color(0xFF22C55E)
        val Success600 = Color(0xFF16A34A)
        val Success700 = Color(0xFF15803D)
        val Success800 = Color(0xFF166534)
        val Success900 = Color(0xFF14532D)

        val Warning = Color(0xFFF59E0B) // Orange 500
        val WarningLight = Color(0xFFFEF3C7) // Orange 100
        val WarningDark = Color(0xFFB45309) // Orange 700
        val Warning50 = Color(0xFFFFFBEB)
        val Warning100 = Color(0xFFFEF3C7)
        val Warning200 = Color(0xFFFDE68A)
        val Warning300 = Color(0xFFFCD34D)
        val Warning400 = Color(0xFFFBBF24)
        val Warning500 = Color(0xFFF59E0B)
        val Warning600 = Color(0xFFD97706)
        val Warning700 = Color(0xFFB45309)
        val Warning800 = Color(0xFF92400E)
        val Warning900 = Color(0xFF78350F)

        val Error = Color(0xFFEF4444) // Red 500
        val ErrorLight = Color(0xFFFEE2E2) // Red 100
        val ErrorDark = Color(0xFFB91C1C) // Red 700
        val Error50 = Color(0xFFFEF2F2)
        val Error100 = Color(0xFFFEE2E2)
        val Error200 = Color(0xFFFECACA)
        val Error300 = Color(0xFFFCA5A5)
        val Error400 = Color(0xFFF87171)
        val Error500 = Color(0xFFEF4444)
        val Error600 = Color(0xFFDC2626)
        val Error700 = Color(0xFFB91C1C)
        val Error800 = Color(0xFF991B1B)
        val Error900 = Color(0xFF7F1D1D)

        val Info = Color(0xFF0EA5E9) // Sky 500 (Matching Web App)
        val InfoLight = Color(0xFFE0F2FE) // Sky 100
        val InfoDark = Color(0xFF0369A1) // Sky 700
        val Info50 = Color(0xFFF0F9FF)
        val Info100 = Color(0xFFE0F2FE)
        val Info200 = Color(0xFFBAE6FD)
        val Info300 = Color(0xFF7DD3FC)
        val Info400 = Color(0xFF38BDF8)
        val Info500 = Color(0xFF0EA5E9)
        val Info600 = Color(0xFF0284C7)
        val Info700 = Color(0xFF0369A1)
        val Info800 = Color(0xFF075985)
        val Info900 = Color(0xFF0C4A6E)

        // Surface Colors (Matching Web App)
        val Surface = Color(0xFFFFFFFF) // White
        val SurfaceVariant = Color(0xFFF9FAFB) // Gray 50
        val SurfaceTint = Color(0xFF8B5CF6) // Primary

        // Background Colors (Matching Web App)
        val Background = Color(0xFFF9FAFB) // Gray 50
        val BackgroundDark = Color(0xFFF3F4F6) // Gray 100
        val BackgroundTertiary = Color(0xFFE5E7EB) // Gray 200

        // Outline & Border Colors (Matching Web App)
        val Outline = Color(0xFFD1D5DB) // Gray 300
        val OutlineVariant = Color(0xFFE5E7EB) // Gray 200
        val OutlineMedium = Color(0xFFD1D5DB) // Gray 300
        val OutlineDark = Color(0xFF9CA3AF) // Gray 400
        val OutlineFocus = Color(0xFF8B5CF6) // Primary

        // Text Colors (Matching Web App)
        val OnSurface = Color(0xFF111827) // Gray 900
        val OnSurfaceVariant = Color(0xFF6B7280) // Gray 500
        val OnSurfaceTertiary = Color(0xFF9CA3AF) // Gray 400
        val OnPrimary = Color(0xFFFFFFFF) // White
        val OnSecondary = Color(0xFFFFFFFF) // White
        
        // Text Color Aliases (Matching Web App)
        val TextPrimary = Color(0xFF111827) // Gray 900
        val TextSecondary = Color(0xFF6B7280) // Gray 500
        val TextTertiary = Color(0xFF9CA3AF) // Gray 400
        val TextInverse = Color(0xFFFFFFFF) // White
        val TextLink = Color(0xFF8B5CF6) // Primary
        val TextLinkHover = Color(0xFF7C3AED) // Primary 600
        
        // Border Colors (Matching Web App)
        val BorderLight = Color(0xFFE5E7EB) // Gray 200
        val BorderMedium = Color(0xFFD1D5DB) // Gray 300
        val BorderDark = Color(0xFF9CA3AF) // Gray 400
        val BorderFocus = Color(0xFF8B5CF6) // Primary

        // Status Colors (Business Operations - Matching Web App)
        val StatusOpen = Color(0xFF3B82F6) // Blue 500
        val StatusInProgress = Color(0xFFF59E0B) // Orange 500
        val StatusCompleted = Color(0xFF22C55E) // Green 500
        val StatusClosed = Color(0xFF6B7280) // Gray 500
        val StatusFailed = Color(0xFFEF4444) // Red 500
        val StatusPending = Color(0xFFF59E0B) // Orange 500
        val StatusScheduled = Color(0xFF8B5CF6) // Purple 500
        val StatusActive = Color(0xFF22C55E) // Green 500
        val StatusInactive = Color(0xFF6B7280) // Gray 500
        val StatusLead = Color(0xFF60A5FA) // Blue 400
        val StatusQualified = Color(0xFF8B5CF6) // Purple 500
        val StatusWon = Color(0xFF22C55E) // Green 500
        val StatusLost = Color(0xFFEF4444) // Red 500

        // Priority Colors (Matching Web App)
        val PriorityUrgent = Color(0xFFDC2626) // Red 600
        val PriorityHigh = Color(0xFFF59E0B) // Orange 500
        val PriorityMedium = Color(0xFF3B82F6) // Blue 500
        val PriorityLow = Color(0xFF9CA3AF) // Gray 400

        // Activity Type Colors
        val ActivityCall = Color(0xFF3B82F6) // Blue 500
        val ActivityEmail = Color(0xFF8B5CF6) // Violet 500
        val ActivityTelegram = Color(0xFF06B6D4) // Cyan 500
        val ActivityMeeting = Color(0xFFF59E0B) // Orange 500
        val ActivityNote = Color(0xFFEAB308) // Yellow 500
        val ActivityTask = Color(0xFF10B981) // Green 500

        // Gray Scale (Matching Web App Exactly)
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
        
        // Neutral Colors (Matching Web App)
        val Neutral50 = Color(0xFFFAFAFA)
        val Neutral100 = Color(0xFFF5F5F5)
        val Neutral200 = Color(0xFFE5E5E5)
        val Neutral300 = Color(0xFFD4D4D4)
        val Neutral400 = Color(0xFFA3A3A3)
        val Neutral500 = Color(0xFF737373)
        val Neutral600 = Color(0xFF525252)
        val Neutral700 = Color(0xFF404040)
        val Neutral800 = Color(0xFF262626)
        val Neutral900 = Color(0xFF171717)
        
        // Special Accent Colors
        val PinkAccent = Color(0xFFEC4899) // Pink 500 - for special accents
        val PinkLight = Color(0xFFFCE7F3) // Pink 100 - for pink backgrounds
        
        // Chart & Visualization Colors (matching Web App)
        val ChartPurple = Color(0xFF8B5CF6) // Purple 500 for charts
        val ChartBlue = Color(0xFF2563EB) // Blue 600 for charts
        val ChartOrange = Color(0xFFD97706) // Orange 600 for charts  
        val ChartGreen = Color(0xFF16A34A) // Green 600 for charts
        val ChartGray = Color(0xFF6B7280) // Gray 500 for charts
        val ChartYellow = Color(0xFFEAB308) // Yellow 500 for badges/gold
        val ChartSilver = Color(0xFF6B7280) // Gray 500 for silver badge

        val White = Color(0xFFFFFFFF)
        val Black = Color(0xFF000000)
    }

    // Typography - Material Design 3 Type Scale
    object Typography {
        // Display (Large headlines, hero text)
        val DisplayLarge: TextUnit = 57.sp
        val DisplayMedium: TextUnit = 45.sp
        val DisplaySmall: TextUnit = 36.sp

        // Headline (Section headings, page titles)
        val HeadlineLarge: TextUnit = 32.sp
        val HeadlineMedium: TextUnit = 28.sp
        val HeadlineSmall: TextUnit = 24.sp

        // Title (Card titles, dialog titles)
        val TitleLarge: TextUnit = 22.sp
        val TitleMedium: TextUnit = 16.sp
        val TitleSmall: TextUnit = 14.sp

        // Body (Main content text)
        val BodyLarge: TextUnit = 16.sp
        val BodyMedium: TextUnit = 14.sp
        val BodySmall: TextUnit = 12.sp

        // Label (Buttons, chips, labels)
        val LabelLarge: TextUnit = 14.sp
        val LabelMedium: TextUnit = 12.sp
        val LabelSmall: TextUnit = 11.sp

        // Font Weights
        val FontWeightLight = androidx.compose.ui.text.font.FontWeight.Light // 300
        val FontWeightNormal = androidx.compose.ui.text.font.FontWeight.Normal // 400
        val FontWeightMedium = androidx.compose.ui.text.font.FontWeight.Medium // 500
        val FontWeightSemiBold = androidx.compose.ui.text.font.FontWeight.SemiBold // 600
        val FontWeightBold = androidx.compose.ui.text.font.FontWeight.Bold // 700
    }

    // Spacing - Material Design (dp units)
    object Spacing {
        val Space0: Dp = 0.dp
        val Space1: Dp = 4.dp // Extra small spacing
        val Space2: Dp = 8.dp // Small spacing, standard unit
        val Space3: Dp = 12.dp // Medium-small spacing
        val Space4: Dp = 16.dp // Medium spacing, card padding
        val Space5: Dp = 20.dp // Medium-large spacing
        val Space6: Dp = 24.dp // Large spacing, section gaps
        val Space7: Dp = 28.dp
        val Space8: Dp = 32.dp // Extra large spacing
        val Space10: Dp = 40.dp
        val Space12: Dp = 48.dp // Massive spacing, page sections
        val Space16: Dp = 64.dp // Maximum spacing
    }

    // Elevation & Shadows (Material Design)
    object Elevation {
        val Level0: Dp = 0.dp // Flat surfaces
        val Level1: Dp = 1.dp // Raised buttons, cards (resting)
        val Level2: Dp = 2.dp // FAB (resting), cards (pressed)
        val Level3: Dp = 3.dp // Modal sidesheets, bottom sheets
        val Level4: Dp = 4.dp // Navigation drawer, cards (dragged)
        val Level6: Dp = 6.dp // App bar, FAB (pressed)
        val Level8: Dp = 8.dp // Navigation drawer (open), bottom navigation
        val Level12: Dp = 12.dp // Dialogs, pickers
        val Level16: Dp = 16.dp // Modal navigation drawer
        val Level24: Dp = 24.dp // Dialog elevation (prominent)
    }

    // Border Radius (Corner Radius)
    object Radius {
        val None: Dp = 0.dp // Sharp corners
        val ExtraSmall: Dp = 4.dp // Small chips, tight constraints
        val Small: Dp = 8.dp // Buttons, text fields
        val Medium: Dp = 12.dp // Cards, containers (default)
        val Large: Dp = 16.dp // FABs, large buttons
        val ExtraLarge: Dp = 28.dp // Bottom sheets, dialogs
        val Full: Dp = 9999.dp // Circular (icons, avatars, pills)
    }

    // Component Heights
    object Heights {
        // Buttons
        val ButtonStandard: Dp = 40.dp
        val FabStandard: Dp = 56.dp
        val FabSmall: Dp = 40.dp
        val FabExtended: Dp = 56.dp

        // Icon Buttons
        val IconButton: Dp = 48.dp // Touch target

        // Chips
        val ChipStandard: Dp = 32.dp

        // List Items
        val ListItemSingleLine: Dp = 56.dp
        val ListItemTwoLine: Dp = 72.dp
        val ListItemThreeLine: Dp = 88.dp

        // App Bars
        val TopAppBarSmall: Dp = 64.dp
        val TopAppBarMedium: Dp = 112.dp
        val TopAppBarLarge: Dp = 152.dp
        val BottomNavigation: Dp = 80.dp

        // Navigation Drawer
        val NavigationDrawerStandard: Dp = 360.dp
        val NavigationDrawerModal: Dp = 256.dp

        // Data Tables
        val TableHeader: Dp = 56.dp
        val TableRow: Dp = 52.dp

        // Icons
        val IconXs: Dp = 18.dp
        val IconSm: Dp = 24.dp
        val IconMd: Dp = 40.dp
        val IconLg: Dp = 48.dp
        val IconXl: Dp = 64.dp

        // Avatars
        val AvatarXs: Dp = 24.dp
        val AvatarSm: Dp = 32.dp
        val AvatarMd: Dp = 40.dp
        val AvatarLg: Dp = 56.dp
        val AvatarXl: Dp = 96.dp

        // Images
        val ImageThumbnail: Dp = 48.dp
        val ImageSmall: Dp = 80.dp
        val ImageMedium: Dp = 120.dp
        val ImageLarge: Dp = 240.dp

        // Badge
        val BadgeLarge: Dp = 16.dp
        val BadgeSmall: Dp = 6.dp

        // Bottom Sheet
        val BottomSheetDragHandle: Dp = 4.dp

        // Snackbar
        val SnackbarSingleLine: Dp = 48.dp
        val SnackbarTwoLine: Dp = 68.dp
    }

    // Component Widths
    object Widths {
        val BottomSheetDragHandleWidth: Dp = 32.dp
    }

    // Padding
    object Padding {
        val CardPaddingStandard: Dp = 16.dp
        val CardPaddingComfortable: Dp = 20.dp
        val CardPaddingSpacious: Dp = 24.dp

        val ListItemHorizontal: Dp = 16.dp
        val ListItemVertical: Dp = 12.dp

        val ButtonHorizontal: Dp = 24.dp
        val ButtonVertical: Dp = 10.dp

        val ChipHorizontal: Dp = 16.dp

        val TextFieldHorizontal: Dp = 16.dp
        val TextFieldVertical: Dp = 16.dp

        val DialogPadding: Dp = 24.dp
        val BottomSheetSide: Dp = 16.dp
        val BottomSheetTop: Dp = 24.dp

        val TableCellHorizontal: Dp = 16.dp
        val TableCellVertical: Dp = 12.dp
    }

    // Screen Breakpoints (Window Size Classes)
    object Breakpoints {
        val CompactWidth: Dp = 600.dp
        val MediumWidth: Dp = 840.dp
        val CompactHeight: Dp = 480.dp
        val MediumHeight: Dp = 900.dp
    }

    // Touch Targets
    object TouchTarget {
        val Minimum: Dp = 48.dp // Android accessibility guideline
    }

    // Opacity
    object Opacity {
        const val Disabled: Float = 0.38f
        const val StateHover: Float = 0.08f
        const val StateFocus: Float = 0.12f
        const val StatePressed: Float = 0.12f
        const val StateDragged: Float = 0.16f
        const val Scrim: Float = 0.32f
    }

    // Animation Durations (milliseconds)
    object Duration {
        const val Enter: Int = 250 // Content appearing
        const val Exit: Int = 175 // Content disappearing
        const val Emphasized: Int = 450 // Important state changes
    }
}