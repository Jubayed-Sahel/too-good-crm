package too.good.crm.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object DesignTokens {
    // Colors - Material Design 3 Vendor/Admin Theme
    object Colors {
        // Brand Colors (Vendor Primary)
        val Primary = Color(0xFF667EEA) // Purple 500
        val PrimaryVariant = Color(0xFF764BA2) // Purple 700
        val PrimaryLight = Color(0xFF8A9DF0) // Purple 300
        val PrimaryContainer = Color(0xFFE8EBFA) // Purple 50

        // Secondary Colors (Accent)
        val Secondary = Color(0xFF5E72E4) // Indigo 500
        val SecondaryVariant = Color(0xFF4F5FD8) // Indigo 600
        val SecondaryContainer = Color(0xFFE5E8FB) // Indigo 50

        // Semantic Colors
        val Success = Color(0xFF10B981) // Green 500
        val SuccessLight = Color(0xFFD1FAE5) // Green 100
        val SuccessDark = Color(0xFF047857) // Green 700

        val Warning = Color(0xFFF59E0B) // Orange 500
        val WarningLight = Color(0xFFFEF3C7) // Orange 100
        val WarningDark = Color(0xFFD97706) // Orange 600

        val Error = Color(0xFFEF4444) // Red 500
        val ErrorLight = Color(0xFFFEE2E2) // Red 100
        val ErrorDark = Color(0xFFDC2626) // Red 600

        val Info = Color(0xFF3B82F6) // Blue 500
        val InfoLight = Color(0xFFDBEAFE) // Blue 100
        val InfoDark = Color(0xFF1E40AF) // Blue 700

        // Surface Colors
        val Surface = Color(0xFFFFFFFF) // White
        val SurfaceVariant = Color(0xFFF8FAFC) // Gray 50
        val SurfaceTint = Color(0xFF667EEA) // Primary

        // Background Colors
        val Background = Color(0xFFF1F5F9) // Gray 100
        val BackgroundDark = Color(0xFFE2E8F0) // Gray 200

        // Outline & Border Colors
        val Outline = Color(0xFFCBD5E1) // Gray 300
        val OutlineVariant = Color(0xFFE2E8F0) // Gray 200

        // Text Colors
        val OnSurface = Color(0xFF1E293B) // Gray 900
        val OnSurfaceVariant = Color(0xFF64748B) // Gray 500
        val OnSurfaceTertiary = Color(0xFF94A3B8) // Gray 400
        val OnPrimary = Color(0xFFFFFFFF) // White
        val OnSecondary = Color(0xFFFFFFFF) // White

        // Status Colors (Business Operations)
        val StatusOpen = Color(0xFF3B82F6) // Blue 500
        val StatusInProgress = Color(0xFFF59E0B) // Orange 500
        val StatusCompleted = Color(0xFF10B981) // Green 500
        val StatusClosed = Color(0xFF64748B) // Gray 500
        val StatusFailed = Color(0xFFEF4444) // Red 500
        val StatusPending = Color(0xFFF59E0B) // Orange 500
        val StatusScheduled = Color(0xFF8B5CF6) // Violet 500

        // Priority Colors
        val PriorityUrgent = Color(0xFFDC2626) // Red 600
        val PriorityHigh = Color(0xFFF59E0B) // Orange 500
        val PriorityMedium = Color(0xFF3B82F6) // Blue 500
        val PriorityLow = Color(0xFF94A3B8) // Gray 400

        // Activity Type Colors
        val ActivityCall = Color(0xFF3B82F6) // Blue 500
        val ActivityEmail = Color(0xFF8B5CF6) // Violet 500
        val ActivityTelegram = Color(0xFF06B6D4) // Cyan 500
        val ActivityMeeting = Color(0xFFF59E0B) // Orange 500
        val ActivityNote = Color(0xFFEAB308) // Yellow 500
        val ActivityTask = Color(0xFF10B981) // Green 500

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