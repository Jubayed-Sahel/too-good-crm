# Too Good CRM - Android Design Tokens (Vendor/Admin Mode)

> **Target Audience**: Vendor teams, admin panels, business operations
> **Platform**: Android (Material Design 3 / Jetpack Compose)
> **Design Philosophy**: Professional, data-dense, action-oriented

## Color Palette

### Brand Colors (Vendor Primary)
- **Primary**: `#667eea` (Purple 500) - Primary actions, CTAs
- **Primary Variant**: `#764ba2` (Purple 700) - Pressed states, darker accents
- **Primary Light**: `#8a9df0` (Purple 300) - Hover states, light backgrounds
- **Primary Container**: `#e8ebfa` (Purple 50) - Chip backgrounds, subtle highlights

### Secondary Colors (Accent)
- **Secondary**: `#5e72e4` (Indigo 500) - Secondary actions
- **Secondary Variant**: `#4f5fd8` (Indigo 600) - Pressed states
- **Secondary Container**: `#e5e8fb` (Indigo 50) - Light backgrounds

### Semantic Colors
- **Success**: `#10b981` (Green 500) - Completed, successful actions
- **Success Light**: `#d1fae5` (Green 100) - Success backgrounds
- **Success Dark**: `#047857` (Green 700) - Success text on light

- **Warning**: `#f59e0b` (Orange 500) - Pending, needs attention
- **Warning Light**: `#fef3c7` (Orange 100) - Warning backgrounds
- **Warning Dark**: `#d97706` (Orange 600) - Warning text on light

- **Error**: `#ef4444` (Red 500) - Failed, critical issues
- **Error Light**: `#fee2e2` (Red 100) - Error backgrounds
- **Error Dark**: `#dc2626` (Red 600) - Error text on light

- **Info**: `#3b82f6` (Blue 500) - Information, open items
- **Info Light**: `#dbeafe` (Blue 100) - Info backgrounds
- **Info Dark**: `#1e40af` (Blue 700) - Info text on light

### Surface Colors (Material Design 3)
- **Surface**: `#ffffff` (White) - Card backgrounds, elevated surfaces
- **Surface Variant**: `#f8fafc` (Gray 50) - Subtle background variations
- **Surface Tint**: `#667eea` (Primary) - Dynamic color tinting

### Background Colors
- **Background**: `#f1f5f9` (Gray 100) - App background, screen background
- **Background Dark**: `#e2e8f0` (Gray 200) - Darker background areas

### Outline & Border Colors
- **Outline**: `#cbd5e1` (Gray 300) - Default borders
- **Outline Variant**: `#e2e8f0` (Gray 200) - Subtle borders, dividers

### Text Colors
- **On Surface**: `#1e293b` (Gray 900) - Primary text on light surfaces
- **On Surface Variant**: `#64748b` (Gray 500) - Secondary text, labels
- **On Surface Tertiary**: `#94a3b8` (Gray 400) - Disabled text, placeholders
- **On Primary**: `#ffffff` (White) - Text on primary colored backgrounds
- **On Secondary**: `#ffffff` (White) - Text on secondary colored backgrounds

### Status Colors (Business Operations)
- **Open/New**: `#3b82f6` (Blue 500) - New items, open issues
- **In Progress**: `#f59e0b` (Orange 500) - Active work
- **Completed**: `#10b981` (Green 500) - Finished successfully
- **Closed**: `#64748b` (Gray 500) - Archived, inactive
- **Failed**: `#ef4444` (Red 500) - Failed operations
- **Pending**: `#f59e0b` (Orange 500) - Awaiting action
- **Scheduled**: `#8b5cf6` (Violet 500) - Planned activities

### Priority Colors
- **Urgent**: `#dc2626` (Red 600) - Immediate attention required
- **High**: `#f59e0b` (Orange 500) - Important, time-sensitive
- **Medium**: `#3b82f6` (Blue 500) - Normal priority
- **Low**: `#94a3b8` (Gray 400) - Can wait, low priority

### Activity Type Colors (Communication)
- **Call**: `#3b82f6` (Blue 500) - Phone calls, VoIP
- **Email**: `#8b5cf6` (Violet 500) - Email communications
- **Telegram**: `#06b6d4` (Cyan 500) - Telegram messages
- **Meeting**: `#f59e0b` (Orange 500) - Scheduled meetings
- **Note**: `#eab308` (Yellow 500) - Internal notes
- **Task**: `#10b981` (Green 500) - Action items

## Typography (Material Design 3 Type Scale)

### Font Families
- **Default**: Roboto (Android system default)
- **Display**: Roboto (Can use custom font like Poppins or Inter for branding)
- **Monospace**: Roboto Mono (For code, IDs, technical data)

### Type Scale (Material Design 3)

#### Display (Large headlines, hero text)
- **Display Large**: 57sp / Regular (400) / Line height: 64sp
- **Display Medium**: 45sp / Regular (400) / Line height: 52sp
- **Display Small**: 36sp / Regular (400) / Line height: 44sp

#### Headline (Section headings, page titles)
- **Headline Large**: 32sp / Regular (400) / Line height: 40sp
- **Headline Medium**: 28sp / Regular (400) / Line height: 36sp
- **Headline Small**: 24sp / Regular (400) / Line height: 32sp

#### Title (Card titles, dialog titles)
- **Title Large**: 22sp / Medium (500) / Line height: 28sp
- **Title Medium**: 16sp / Medium (500) / Line height: 24sp / Letter spacing: 0.15sp
- **Title Small**: 14sp / Medium (500) / Line height: 20sp / Letter spacing: 0.1sp

#### Body (Main content text)
- **Body Large**: 16sp / Regular (400) / Line height: 24sp / Letter spacing: 0.5sp
- **Body Medium**: 14sp / Regular (400) / Line height: 20sp / Letter spacing: 0.25sp
- **Body Small**: 12sp / Regular (400) / Line height: 16sp / Letter spacing: 0.4sp

#### Label (Buttons, chips, labels)
- **Label Large**: 14sp / Medium (500) / Line height: 20sp / Letter spacing: 0.1sp
- **Label Medium**: 12sp / Medium (500) / Line height: 16sp / Letter spacing: 0.5sp
- **Label Small**: 11sp / Medium (500) / Line height: 16sp / Letter spacing: 0.5sp

### Font Weights
- **Light**: 300 (Sparingly used for large headlines)
- **Regular**: 400 (Default body text)
- **Medium**: 500 (Emphasis, titles, buttons)
- **Semi-bold**: 600 (Strong emphasis, important labels)
- **Bold**: 700 (Critical information, strong CTAs)

## Spacing (Android dp units)

### Spacing Scale (Material Design)
- **0**: 0dp
- **1**: 4dp (Extra small spacing)
- **2**: 8dp (Small spacing, standard unit)
- **3**: 12dp (Medium-small spacing)
- **4**: 16dp (Medium spacing, card padding)
- **5**: 20dp (Medium-large spacing)
- **6**: 24dp (Large spacing, section gaps)
- **7**: 28dp
- **8**: 32dp (Extra large spacing)
- **10**: 40dp
- **12**: 48dp (Massive spacing, page sections)
- **16**: 64dp (Maximum spacing)

### Common Spacing Patterns
- **Icon Padding**: 8dp (Small), 12dp (Medium), 16dp (Large)
- **Card Padding**: 16dp (Standard), 20dp (Comfortable), 24dp (Spacious)
- **List Item Padding**: 16dp horizontal, 12dp vertical
- **Section Margin**: 16dp (Mobile), 24dp (Tablet)
- **Item Spacing**: 8dp (Tight), 12dp (Normal), 16dp (Comfortable)
- **Bottom Sheet Padding**: 16dp sides, 24dp top/bottom

### Vendor-Specific Spacing
- **Data Tables**: 12dp row padding, 16dp column padding
- **Forms**: 16dp field spacing, 24dp group spacing
- **Action Bars**: 16dp padding, 8dp between actions
- **Dashboards**: 16dp card spacing, 24dp section spacing

## Elevation & Shadows (Material Design)

### Elevation Levels (dp)
- **Level 0**: 0dp - Flat surfaces, no shadow
- **Level 1**: 1dp - Raised buttons, cards (resting)
- **Level 2**: 2dp - FAB (resting), cards (pressed)
- **Level 3**: 3dp - Modal sidesheets, bottom sheets
- **Level 4**: 4dp - Navigation drawer, cards (dragged)
- **Level 6**: 6dp - App bar, FAB (pressed)
- **Level 8**: 8dp - Navigation drawer (open), bottom navigation
- **Level 12**: 12dp - Dialogs, pickers
- **Level 16**: 16dp - Modal navigation drawer
- **Level 24**: 24dp - Dialog elevation (prominent)

### Usage Guidelines
- **Cards**: 1-2dp for subtle elevation
- **Bottom Sheets**: 8dp for standard, 16dp for modal
- **Dialogs**: 24dp for maximum prominence
- **FAB**: 6dp resting, 12dp pressed
- **Top App Bar**: 0dp scrolled, 4dp when lifted

## Border Radius (Android dp)

### Corner Radius Scale
- **None**: 0dp - Sharp corners (rare in MD3)
- **Extra Small**: 4dp - Small chips, tight constraints
- **Small**: 8dp - Buttons, text fields
- **Medium**: 12dp - Cards, containers (default)
- **Large**: 16dp - FABs, large buttons
- **Extra Large**: 28dp - Bottom sheets, dialogs
- **Full**: 9999dp - Circular (icons, avatars, pills)

### Component-Specific Radii
- **Cards**: 12dp (medium)
- **Buttons**: 8dp (small) for filled, 20dp (rounded) for pills
- **Text Fields**: 4dp top corners when focused
- **Chips**: 8dp (small) for compact, 16dp (large) for suggestion chips
- **Bottom Sheets**: 28dp (extra large) for top corners only
- **Dialogs**: 28dp (extra large)
- **FAB**: 16dp (large) for standard, 28dp (extra large) for extended

## Components (Material Design 3 / Jetpack Compose)

### Buttons

#### Types
- **Filled Button**: Primary actions, high emphasis
  - Background: Primary color
  - Text: On Primary color
  - Height: 40dp
  - Padding: 24dp horizontal, 10dp vertical
  - Corner Radius: 20dp (fully rounded)

- **Tonal Button**: Medium emphasis actions
  - Background: Secondary Container color
  - Text: On Secondary Container
  - Height: 40dp
  - Corner Radius: 20dp

- **Outlined Button**: Medium-low emphasis
  - Border: 1dp, Outline color
  - Background: Transparent
  - Text: Primary color
  - Height: 40dp
  - Corner Radius: 20dp

- **Text Button**: Low emphasis, tertiary actions
  - Background: Transparent
  - Text: Primary color
  - Height: 40dp
  - No border

- **FAB (Floating Action Button)**:
  - Size: 56dp (standard), 40dp (small), 96dp (extended)
  - Elevation: 6dp (resting), 12dp (pressed)
  - Icon: 24dp
  - Corner Radius: 16dp (standard), 12dp (small), 16dp (extended)

#### Icon Buttons
- **Standard**: 48dp x 48dp touch target, 24dp icon
- **Filled**: Background with primary color
- **Tonal**: Background with secondary container
- **Outlined**: 1dp border
- **Standard**: No background, icon only

### Cards

#### Types
- **Elevated Card**: Default cards with shadow
  - Elevation: 1dp (resting), 2dp (dragged)
  - Background: Surface color
  - Corner Radius: 12dp
  - Padding: 16dp

- **Filled Card**: Subtle background differentiation
  - Elevation: 0dp
  - Background: Surface Variant color
  - Corner Radius: 12dp
  - Padding: 16dp

- **Outlined Card**: Emphasized borders
  - Elevation: 0dp
  - Border: 1dp, Outline color
  - Background: Surface color
  - Corner Radius: 12dp
  - Padding: 16dp

#### Vendor Dashboard Cards
- **Stats Card**: Elevated, 16dp padding, icon + number + label
- **Activity Card**: Filled, 12dp padding, list of items with timestamps
- **Action Card**: Outlined, 20dp padding, large button or form

### Chips (Assist, Filter, Input, Suggestion)

#### Types
- **Assist Chip**: Actions, suggestions
  - Height: 32dp
  - Padding: 16dp horizontal
  - Corner Radius: 8dp
  - Leading icon: Optional, 18dp

- **Filter Chip**: Filtering options, multi-select
  - Height: 32dp
  - States: Selected (Primary Container) / Unselected (Surface)
  - Leading icon: Check (when selected), 18dp

- **Input Chip**: User-generated input tags
  - Height: 32dp
  - Trailing icon: Close (X), 18dp
  - Corner Radius: 8dp

- **Suggestion Chip**: Quick actions, recommendations
  - Height: 32dp
  - Elevated appearance
  - Corner Radius: 8dp

### Text Fields (Material Design Input)

#### Types
- **Filled Text Field**: Default, subtle background
  - Background: Surface Variant with alpha
  - Corner Radius: 4dp (top corners only)
  - Padding: 16dp horizontal, 16dp vertical
  - Label: Floating label animation

- **Outlined Text Field**: Emphasized boundaries
  - Border: 1dp, Outline color (unfocused), 2dp Primary (focused)
  - Corner Radius: 4dp
  - Padding: 16dp horizontal, 16dp vertical
  - Label: Floating outside border

#### States
- **Default**: Outline color border
- **Focused**: Primary color border (2dp)
- **Error**: Error color border with helper text
- **Disabled**: OnSurface Tertiary, 38% opacity

### Lists & List Items

#### Single-Line List Item
- Height: 56dp
- Padding: 16dp horizontal, 8dp vertical
- Leading: Icon (24dp) or Avatar (40dp)
- Trailing: Icon (24dp) or Text

#### Two-Line List Item
- Height: 72dp
- Primary text: Body Large
- Secondary text: Body Medium, OnSurface Variant

#### Three-Line List Item
- Height: 88dp
- Primary text: Body Large
- Secondary text: Body Medium, 2 lines max

### Badges

#### Types
- **Large Badge**: With number/text
  - Min width: 16dp, Height: 16dp
  - Padding: 4dp horizontal
  - Background: Error color (for notifications)
  - Text: Label Small, white

- **Small Badge**: Dot only
  - Size: 6dp x 6dp
  - Background: Error color

### Bottom Navigation

- **Container**: 80dp height
- **Items**: 3-5 items max
- **Active Item**: Primary color icon + label
- **Inactive Item**: OnSurface Variant icon + label
- **Icon Size**: 24dp
- **Label**: Label Medium (12sp)

### Top App Bar

#### Types
- **Small Top App Bar**: Default, 64dp height
  - Title: Title Large
  - Icons: 48dp touch target, 24dp icon size
  - Padding: 16dp sides

- **Medium Top App Bar**: 112dp height (collapsed to 64dp)
  - Title: Headline Small
  - Scrollable content triggers collapse

- **Large Top App Bar**: 152dp height (collapsed to 64dp)
  - Title: Headline Medium
  - Hero content area

### Navigation Drawer

- **Width**: 360dp (standard), 256dp (modal)
- **Elevation**: 1dp (standard), 16dp (modal)
- **Item Height**: 56dp
- **Active Item**: Secondary Container background
- **Icon Size**: 24dp
- **Padding**: 16dp horizontal

### Dialogs

#### Basic Dialog
- **Width**: 280dp (min) - 560dp (max)
- **Elevation**: 24dp
- **Corner Radius**: 28dp
- **Padding**: 24dp
- **Title**: Headline Small
- **Body**: Body Medium
- **Actions**: Text buttons, right-aligned

#### Full-Screen Dialog
- **Width**: Full screen
- **Top App Bar**: With close button
- **Body**: Scrollable content
- **Actions**: Top app bar or bottom buttons

### Bottom Sheets

#### Standard Bottom Sheet
- **Corner Radius**: 28dp (top corners)
- **Elevation**: 1dp
- **Drag Handle**: 32dp x 4dp, centered
- **Padding**: 16dp sides, 24dp top

#### Modal Bottom Sheet
- **Corner Radius**: 28dp (top corners)
- **Elevation**: 8dp
- **Scrim**: Black, 32% opacity
- **Max Height**: 90% of screen

### Snackbars & Toasts

#### Snackbar
- **Width**: Full width - 16dp margins (mobile)
- **Height**: 48dp (single line), 68dp (two lines)
- **Elevation**: 6dp
- **Corner Radius**: 4dp
- **Position**: Bottom, 16dp from edge
- **Duration**: 4 seconds (short), 10 seconds (long)
- **Action**: Text button, right-aligned

### Data Tables (Vendor-Specific)

#### Desktop/Tablet Table
- **Header**: 56dp height, Title Medium, OnSurface Variant
- **Row**: 52dp height, Body Medium
- **Cell Padding**: 16dp horizontal, 12dp vertical
- **Dividers**: 1dp, Outline Variant
- **Hover**: Surface Variant background
- **Selected**: Primary Container background (12% opacity)

#### Mobile Table (Card-Based)
- Each row becomes a card: Elevated Card, 16dp padding
- Key-value pairs: Label Small (key), Body Medium (value)
- Actions: Icon buttons at card bottom

## Layout (Android Responsive Design)

### Screen Breakpoints (Window Size Classes)
- **Compact Width**: < 600dp (Phones in portrait)
- **Medium Width**: 600dp - 839dp (Tablets in portrait, foldables)
- **Expanded Width**: ≥ 840dp (Tablets in landscape, desktops)

### Compact Height
- < 480dp (Phones in landscape)

### Medium Height
- 480dp - 899dp (Most phones in portrait)

### Expanded Height
- ≥ 900dp (Tablets)

### Layout Patterns

#### Compact Width (Phone Portrait)
- Single column layout
- Bottom navigation (3-5 items)
- Cards stack vertically
- Full-width forms
- Collapsed navigation drawer (modal)

#### Medium Width (Tablet Portrait)
- Two-column layout for lists + detail
- Side navigation rail (icons + labels)
- Cards in 2-column grid
- Expanded forms with side-by-side fields

#### Expanded Width (Tablet Landscape / Desktop)
- Three-column layout (nav + list + detail)
- Persistent navigation drawer
- Cards in 3-4 column grid
- Side-by-side layouts for comparison
- Data tables with all columns visible

### Vendor Dashboard Layouts

#### Phone (Compact)
```
┌─────────────────────┐
│   Top App Bar       │
├─────────────────────┤
│                     │
│   Stats Grid        │
│   (1 column)        │
│                     │
│   Recent Orders     │
│   (Card list)       │
│                     │
│   Quick Actions     │
│                     │
├─────────────────────┤
│  Bottom Navigation  │
└─────────────────────┘
```

#### Tablet (Medium/Expanded)
```
┌──────┬──────────────────────────────┐
│      │   Top App Bar                │
│      ├──────────────────────────────┤
│ Nav  │                              │
│ Rail │   Stats Grid (2-4 columns)   │
│      │                              │
│      │   Recent Orders Table        │
│      │                              │
│      │   Charts & Analytics         │
│      │                              │
└──────┴──────────────────────────────┘
```

### Grid System
- **Columns**: 4 (phone), 8 (tablet portrait), 12 (tablet landscape)
- **Gutter**: 16dp (phone), 24dp (tablet)
- **Margins**: 16dp (phone), 24dp (tablet)

## Interactions & States

### Touch Targets
- **Minimum Size**: 48dp x 48dp (Android accessibility guideline)
- **Icon-Only Buttons**: 48dp x 48dp
- **Icons within Buttons**: 18-24dp with padding

### Ripple Effects (Material)
- **Bounded**: For buttons, cards (contained ripple)
- **Unbounded**: For icon buttons (circular ripple)
- **Color**: Primary color at 12% opacity (light theme)

### State Layers (Material Design 3)
All interactive surfaces show state layers:

- **Hover** (Desktop/Mouse): OnSurface at 8% opacity
- **Focus** (Keyboard): OnSurface at 12% opacity
- **Pressed**: OnSurface at 12% opacity
- **Dragged**: OnSurface at 16% opacity

### Disabled States
- **Opacity**: 38% for content (text, icons)
- **Color**: OnSurface
- **Interaction**: Touch events blocked

### Loading States
- **Circular Progress Indicator**: Primary color, 48dp size
- **Linear Progress Indicator**: Primary color, 4dp height, full width
- **Skeleton Loading**: Surface Variant background with shimmer animation
- **Placeholder Text**: "Loading..." with OnSurface Variant color

### Selection States
- **Single Selection**: Primary Container background (12% opacity)
- **Multi-Selection**: Check icon appears, Primary Container background
- **Selected Item Border**: 2dp Primary color (left accent)

## Animations & Transitions

### Duration (Material Design)
- **Enter**: 200-300ms (Content appearing)
- **Exit**: 150-200ms (Content disappearing)
- **Emphasized**: 400-500ms (Important state changes)

### Easing Curves
- **Standard**: Cubic bezier(0.4, 0.0, 0.2, 1) - Default transitions
- **Emphasized**: Cubic bezier(0.0, 0.0, 0.2, 1) - Elements entering screen
- **Emphasized Accelerate**: Cubic bezier(0.3, 0.0, 0.8, 0.15) - Elements exiting

### Common Animations
- **Fade In/Out**: Opacity 0 ↔ 1, 200ms
- **Slide Up** (Bottom Sheet): TranslateY 100% → 0%, 300ms emphasized
- **Expand/Collapse**: Height animation, 300ms standard
- **Shared Element**: Hero transition between screens, 300ms emphasized

### Vendor-Specific Animations
- **Stats Counter**: Number incrementing animation on load (1 second)
- **Chart Reveal**: Staggered bar/line drawing (500ms per element)
- **List Item Enter**: Fade + slide up, 200ms, staggered by 50ms per item
- **Pull to Refresh**: Circular indicator with rotation, indeterminate duration

## Icons & Imagery

### Icon Sizes
- **Small**: 18dp (Inline with text, chips)
- **Standard**: 24dp (Buttons, list items, app bar)
- **Large**: 40dp (FAB icons, feature highlights)
- **Extra Large**: 48-64dp (Empty states, placeholders)

### Icon Style
- **Outlined**: Default for most UI elements
- **Filled**: For selected states, active navigation
- **Rounded**: For friendly, approachable feel
- **Sharp**: For technical, data-focused interfaces (vendor use)

### Avatar Sizes
- **Extra Small**: 24dp (Inline mentions, small chips)
- **Small**: 32dp (Dense lists)
- **Medium**: 40dp (Standard list items)
- **Large**: 56dp (Profile headers)
- **Extra Large**: 96dp (Profile pages, onboarding)

### Product Images
- **Thumbnail**: 48dp x 48dp (List items)
- **Small**: 80dp x 80dp (Grid items)
- **Medium**: 120dp x 120dp (Detail cards)
- **Large**: 240dp x 240dp (Product detail pages)
- **Aspect Ratio**: 1:1 (square), 16:9 (landscape), 3:4 (portrait)

## Accessibility

### Color Contrast Ratios (WCAG AA)
- **Normal Text** (< 18sp): Minimum 4.5:1
- **Large Text** (≥ 18sp or ≥14sp bold): Minimum 3:1
- **UI Components**: Minimum 3:1

### Focus Indicators
- **Visible Focus Ring**: 2dp border, Primary color
- **Focus Order**: Logical top-to-bottom, left-to-right flow

### Touch Target Sizing
- **Minimum**: 48dp x 48dp for all interactive elements
- **Spacing**: 8dp minimum between adjacent touch targets

### Screen Reader Support
- **Content Descriptions**: All icons, images, and interactive elements
- **State Announcements**: Loading, success, error states
- **Headings**: Proper semantic heading structure

### Text Accessibility
- **Minimum Size**: 12sp (avoid smaller than this)
- **Line Height**: 1.5x for body text (improves readability)
- **Line Length**: 40-60 characters per line for optimal reading

## Patterns (Vendor-Specific)

### Empty States
```
┌─────────────────────┐
│                     │
│    📦 (64dp icon)   │
│                     │
│   No Orders Yet     │  ← Title Large
│                     │
│  Orders will appear │  ← Body Medium, OnSurface Variant
│  here once customers│
│   place them        │
│                     │
│  ┌───────────────┐  │
│  │  Create Order │  │  ← Filled Button
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

### Error States
- **Icon**: Error color, 48dp (⚠️ warning triangle or ⛔ error circle)
- **Title**: Title Medium, "Something went wrong"
- **Message**: Body Medium, specific error description
- **Action Button**: Outlined button, "Try Again" or "Go Back"
- **Background**: Surface with subtle Error Light tint (optional)

### Success Feedback
- **Snackbar**: Green Success background, white text, "✓ Order created successfully"
- **Duration**: 4 seconds
- **Action**: Optional "View" or "Undo" button
- **Position**: Bottom, 16dp margin

### Search & Filtering
- **Search Bar**: Outlined Text Field, Leading search icon, Trailing clear icon
- **Filter Chips**: Row of Filter Chips above content
- **Active Filters**: Selected state (Primary Container background)
- **Clear All**: Text button, "Clear filters"
- **Result Count**: Body Small, OnSurface Variant, "Showing 24 of 156 orders"

### Confirmation Dialogs
```
┌─────────────────────────┐
│  Delete Order?          │  ← Headline Small
│                         │
│  This action cannot be  │  ← Body Medium
│  undone. Order #12345   │
│  will be permanently    │
│  removed.               │
│                         │
│          ┌────────────┐ │
│  Cancel  │   Delete   │ │  ← Text Button + Filled Button (Error color)
│          └────────────┘ │
└─────────────────────────┘
```

### Loading Overlays
- **Background Scrim**: OnSurface at 12% opacity
- **Progress Indicator**: Circular, Primary color, centered
- **Text**: Body Medium, "Processing order..." below spinner
- **Prevents**: All interactions while loading

## Vendor Dashboard Components

### Order Card
```
┌─────────────────────────────────┐
│ Order #12345        [•••]       │  ← Title Medium + Icon Button
│ Customer: John Doe              │  ← Body Medium
│ Total: $249.99                  │  ← Body Medium, Semi-bold
│                                 │
│ ┌───────┐ In Progress           │  ← Chip (Orange)
│                                 │
│ 2 hours ago                     │  ← Label Small, OnSurface Variant
├─────────────────────────────────┤
│ [View Details] [Mark Complete]  │  ← Text Button + Tonal Button
└─────────────────────────────────┘
```

### Stats Card
```
┌──────────────────┐
│ 📊              │  ← Icon, 40dp
│                  │
│ 127              │  ← Display Small, Primary color
│                  │
│ Total Orders     │  ← Label Medium, OnSurface Variant
│                  │
│ ↑ 12% this week  │  ← Label Small, Success color
└──────────────────┘
```

### Activity Timeline
```
┌─────────────────────────────────┐
│ ● 10:30 AM  Order #123 created  │  ← Blue dot, Label Medium
│ │                               │
│ ● 10:45 AM  Payment received    │  ← Green dot
│ │                               │
│ ● 11:00 AM  Shipped             │  ← Orange dot
│                                 │
└─────────────────────────────────┘
```

## Implementation Notes (Jetpack Compose)

### Theme Definition
```kotlin
val VendorLightColorScheme = lightColorScheme(
    primary = Color(0xFF667EEA),
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFE8EBFA),
    onPrimaryContainer = Color(0xFF764BA2),
    
    secondary = Color(0xFF5E72E4),
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFE5E8FB),
    onSecondaryContainer = Color(0xFF4F5FD8),
    
    tertiary = Color(0xFF8B5CF6),
    onTertiary = Color(0xFFFFFFFF),
    
    error = Color(0xFFEF4444),
    onError = Color(0xFFFFFFFF),
    errorContainer = Color(0xFFFEE2E2),
    onErrorContainer = Color(0xFFDC2626),
    
    background = Color(0xFFF1F5F9),
    onBackground = Color(0xFF1E293B),
    
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF1E293B),
    surfaceVariant = Color(0xFFF8FAFC),
    onSurfaceVariant = Color(0xFF64748B),
    
    outline = Color(0xFFCBD5E1),
    outlineVariant = Color(0xFFE2E8F0),
)
```

### Usage in Compose
```kotlin
// Card with vendor theme
Card(
    modifier = Modifier.fillMaxWidth(),
    colors = CardDefaults.elevatedCardColors(),
    elevation = CardDefaults.elevatedCardElevation(defaultElevation = 1.dp),
    shape = RoundedCornerShape(12.dp)
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(
            text = "Order #12345",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface
        )
    }
}

// Status chip
FilterChip(
    selected = true,
    onClick = { },
    label = { Text("In Progress") },
    colors = FilterChipDefaults.filterChipColors(
        selectedContainerColor = MaterialTheme.colorScheme.secondaryContainer,
        selectedLabelColor = MaterialTheme.colorScheme.onSecondaryContainer
    )
)
```

### Resource XML Values
All design tokens should be defined in:
- `res/values/colors.xml` - Color palette
- `res/values/dimens.xml` - Spacing, sizing
- `res/values/styles.xml` - Text styles, component styles
- `res/values/themes.xml` - Material theme configuration

---

**Document Version**: 1.0 (Vendor/Admin Android)
**Last Updated**: 2024
**Target SDK**: Android API 33+ (Material Design 3)
**UI Framework**: Jetpack Compose recommended, XML Views supported

