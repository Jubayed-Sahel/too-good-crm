# Too Good CRM - Design Tokens

## Color Palette

### Brand Colors
- **Primary (Purple)**: `#667eea` - `#764ba2` (Gradient for vendor mode)
- **Primary (Blue)**: `#3b82f6` - `#1e40af` (Gradient for client mode)

### Semantic Colors
- **Success (Green)**: `green.50`, `green.100`, `green.600`
- **Warning (Orange)**: `orange.50`, `orange.100`, `orange.600`
- **Error (Red)**: `red.50`, `red.100`, `red.600`
- **Info (Blue)**: `blue.50`, `blue.100`, `blue.600`

### UI Colors
- **Gray Scale**:
  - `gray.50` - Background subtle
  - `gray.100` - Border light
  - `gray.200` - Border default
  - `gray.500` - Text muted
  - `gray.600` - Text secondary
  - `gray.700` - Text primary
  - `gray.900` - Text heading

### Priority Colors
- **Urgent**: `red` - High priority, immediate attention
- **High**: `orange` - Important, needs attention
- **Medium**: `blue` - Normal priority
- **Low**: `gray` - Can wait

### Status Colors
- **Open**: `blue` - New/unaddressed items
- **In Progress**: `orange` - Currently being worked on
- **Completed/Resolved**: `green` - Successfully finished
- **Closed**: `gray` - Archived/inactive
- **Failed**: `red` - Unsuccessful attempts
- **Pending**: `orange` - Awaiting action
- **Scheduled**: `blue` - Planned for future

### Activity Type Colors
- **Call**: `blue`
- **Email**: `purple`
- **Telegram**: `cyan`
- **Meeting**: `orange`
- **Note**: `yellow`
- **Task**: `green`

## Typography

### Font Families
- **Default**: System font stack (Chakra UI default)

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **md**: `1rem` (16px) - Base size
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)

### Font Weights
- **normal**: `400`
- **medium**: `500`
- **semibold**: `600`
- **bold**: `700`

### Heading Sizes (Chakra UI)
- **size="xl"**: Large page titles
- **size="lg"**: Section headings
- **size="md"**: Card/component titles
- **size="sm"**: Small headings

## Spacing

### Gap/Spacing Scale
- **1**: `0.25rem` (4px)
- **2**: `0.5rem` (8px)
- **3**: `0.75rem` (12px)
- **4**: `1rem` (16px)
- **5**: `1.25rem` (20px)
- **6**: `1.5rem` (24px)
- **8**: `2rem` (32px)
- **12**: `3rem` (48px)

### Common Spacing Usage
- **Card Padding**: `p={4}` to `p={6}` (16-24px)
- **Stack Gap**: `gap={3}` to `gap={5}` (12-20px)
- **Section Spacing**: `py={12}` (48px vertical)

## Border Radius

### Sizes
- **sm**: `0.125rem` (2px)
- **md**: `0.375rem` (6px) - Default
- **lg**: `0.5rem` (8px)
- **xl**: `0.75rem` (12px)
- **2xl**: `1rem` (16px)
- **full**: `9999px` - Circular/pill shape

### Usage
- **Cards**: `borderRadius="lg"` or `borderRadius="2xl"`
- **Buttons**: `borderRadius="md"`
- **Badges**: `borderRadius="full"` (pill shape)
- **Icons Boxes**: `borderRadius="md"` or `borderRadius="lg"`

## Shadows

### Elevation Levels
- **sm**: Subtle elevation for cards
- **md**: Default card shadow
- **lg**: Modal/dialog shadows
- **xl**: High elevation overlays

## Components

### Buttons
- **Sizes**: `sm`, `md`, `lg`
- **Variants**: 
  - `solid` - Filled background
  - `outline` - Border only
  - `ghost` - Transparent with hover
- **Color Palettes**: `blue`, `purple`, `green`, `red`, `gray`

### Badges
- **Sizes**: `sm`, `md`, `lg`
- **Variants**:
  - `solid` - Filled background
  - `subtle` - Light background
  - `outline` - Border only

### Cards
- **Standard Padding**: `p={4}` to `p={6}`
- **Border**: Optional `borderWidth="1px"` with `borderColor="gray.200"`
- **Background**: White by default
- **Shadow**: Subtle elevation

### Icon Buttons
- **Size**: `sm` for table actions
- **Variant**: `ghost` for desktop tables, `outline` for mobile
- **Colors**: Match action type (blue for view, green for complete, red for delete)

### Tables
- **Desktop**: Full table with columns
- **Mobile**: Card-based layout with responsive design
- **Pattern**: Uses `ResponsiveTable` wrapper component

### Gradients
- **Vendor Header**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` - Purple gradient
- **Client Header**: `linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)` - Blue gradient
- **Background Accents**: `whiteAlpha.100` with blur filters

## Layout

### Breakpoints (Chakra UI)
- **base**: `0px` - Mobile
- **sm**: `480px` - Small tablets
- **md**: `768px` - Tablets
- **lg**: `992px` - Desktop
- **xl**: `1280px` - Large desktop

### Grid Columns
- **Stats Cards**: `{ base: 1, sm: 2, md: 4 }` - 1 column mobile, 4 on desktop
- **Detail Grids**: `{ base: 1, lg: 'repeat(2, 1fr)' }` - 1 column mobile, 2 on desktop

### Container Max Width
- **Dashboard Content**: Full width with padding
- **Forms**: Centered with max-width constraints

## Interactions

### Hover States
- **Buttons**: Slight color darkening
- **Cards**: Optional shadow increase
- **Icon Buttons**: Background color appears

### Disabled States
- **Opacity**: `0.5` (50%)
- **Cursor**: `not-allowed`
- **Interaction**: Disabled attribute prevents clicks

### Active States
- **Selected Items**: Highlighted background
- **Active Filters**: Solid background with color palette

## Animations

### Transitions
- **Default**: Smooth transitions on hover/focus
- **Loading States**: Spinner with brand color
- **Modal/Dialog**: Fade in/out

## Accessibility

### Focus States
- **Visible Focus Ring**: Chakra UI default focus styles
- **Keyboard Navigation**: Full support for tab navigation

### Color Contrast
- **Text on Background**: Meets WCAG AA standards
- **Interactive Elements**: Clear visual distinction

### ARIA Labels
- **Icon Buttons**: Required `aria-label` attribute
- **Complex Widgets**: Proper ARIA attributes for screen readers

## Patterns

### Empty States
- **Icon/Emoji**: Large centered visual (48px or emoji)
- **Heading**: Brief, friendly message
- **Description**: Helpful text about next steps
- **Action**: Optional button to create first item

### Loading States
- **Spinner**: Centered with brand color
- **Text**: "Loading..." message below spinner
- **Container**: Full height centered alignment

### Error States
- **Color**: Red accent
- **Icon**: Warning/alert icon
- **Message**: Clear error description
- **Action**: Retry or back button

### Success Feedback
- **Toast Notifications**: Chakra UI toaster
- **Duration**: 3-5 seconds
- **Position**: Typically top or bottom of screen

## Mode-Specific Design

### Vendor Mode (B2B)
- **Primary Gradient**: Purple (`#667eea` to `#764ba2`)
- **Icon Boxes**: Purple accent colors
- **Navigation**: Purple highlights

### Client Mode (B2C)
- **Primary Gradient**: Blue (`#3b82f6` to `#1e40af`)
- **Icon Boxes**: Blue accent colors
- **Navigation**: Blue highlights

### Shared Components
- **Layouts**: Consistent structure across modes
- **Tables**: Same responsive patterns
- **Forms**: Identical input styling
- **Cards**: Same elevation and spacing
