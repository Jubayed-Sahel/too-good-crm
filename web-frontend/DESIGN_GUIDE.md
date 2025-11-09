# Design System Guide

This document outlines the design system and standards for the Too Good CRM web frontend to ensure consistency across all pages.

## Table of Contents

1. [Design Constants](#design-constants)
2. [Standard Components](#standard-components)
3. [Page Structure](#page-structure)
4. [Color System](#color-system)
5. [Typography](#typography)
6. [Spacing](#spacing)
7. [Buttons](#buttons)
8. [Cards](#cards)
9. [Best Practices](#best-practices)

## Design Constants

All design constants are centralized in `src/config/design.constants.ts`. Use these constants to maintain consistency.

### Key Constants

- **Page Layout**: Standardized padding, max-width, and gaps
- **Card Styling**: Consistent padding, border-radius, shadows
- **Button Styles**: Primary, secondary, outline, ghost, danger variants
- **Typography**: Heading, body, caption styles
- **Spacing Scale**: XS, SM, MD, LG, XL, 2XL

## Standard Components

### PageHeader

Use `PageHeader` for all page headers to ensure consistency.

```tsx
import { PageHeader, StandardButton } from '@/components/common';
import { FiPlus } from 'react-icons/fi';

<PageHeader
  title="Page Title"
  description="Page description explaining what this page does"
  actions={
    <StandardButton
      variant="primary"
      leftIcon={<FiPlus />}
      onClick={handleAction}
    >
      Action Button
    </StandardButton>
  }
/>
```

**Props:**
- `title` (string, required): Page title
- `description` (string, optional): Page description
- `actions` (ReactNode, optional): Action buttons (typically in the header)
- `breadcrumbs` (ReactNode, optional): Breadcrumb navigation
- `size` ('sm' | 'md' | 'lg', optional): Header size

### StandardCard

Use `StandardCard` for all card containers.

```tsx
import { StandardCard } from '@/components/common';

<StandardCard
  title="Card Title"
  description="Card description"
  actions={<Button>Action</Button>}
  hover={true}
>
  Card content
</StandardCard>
```

**Props:**
- `children` (ReactNode, required): Card content
- `title` (string, optional): Card title
- `description` (string, optional): Card description
- `actions` (ReactNode, optional): Action buttons
- `hover` (boolean, optional): Enable hover effects
- `loading` (boolean, optional): Show loading state
- `variant` ('default' | 'elevated' | 'outlined', optional): Card variant

### StatCard

Use `StatCard` for statistics display.

```tsx
import { StatCard } from '@/components/common';

<StatCard
  label="Total Customers"
  value={1234}
  color="purple.600"
  trend={{ value: 12, isPositive: true }}
/>
```

**Props:**
- `label` (string, required): Stat label
- `value` (string | number, required): Stat value
- `icon` (ReactNode, optional): Icon to display
- `color` (string, optional): Value color
- `trend` (object, optional): Trend indicator

### StandardButton

Use `StandardButton` for all buttons to ensure consistent styling.

```tsx
import { StandardButton } from '@/components/common';
import { FiPlus } from 'react-icons/fi';

<StandardButton
  variant="primary"
  leftIcon={<FiPlus />}
  onClick={handleClick}
>
  Button Text
</StandardButton>
```

**Variants:**
- `primary`: Main action (gradient purple)
- `secondary`: Secondary action (white with border)
- `outline`: Outlined button
- `ghost`: Ghost button (no border/background)
- `danger`: Destructive action (red)

### PageContainer

Use `PageContainer` for consistent page layout (optional, as DashboardLayout already handles this).

```tsx
import { PageContainer } from '@/components/common';

<PageContainer gap={5} maxWidth="1600px">
  Page content
</PageContainer>
```

## Page Structure

All pages should follow this structure:

```tsx
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { PageHeader, StandardButton, StandardCard, StatCard } from '@/components/common';
import { VStack, SimpleGrid } from '@chakra-ui/react';

const MyPage = () => {
  return (
    <DashboardLayout title="Page Title">
      <VStack gap={5} align="stretch">
        {/* Page Header */}
        <PageHeader
          title="Page Title"
          description="Page description"
          actions={<StandardButton>Action</StandardButton>}
        />

        {/* Stats (if applicable) */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
          <StatCard label="Label" value={123} />
        </SimpleGrid>

        {/* Main Content */}
        <StandardCard>
          Content here
        </StandardCard>
      </VStack>
    </DashboardLayout>
  );
};
```

## Color System

### Brand Colors

- **Primary**: Purple gradient (`#667eea` to `#764ba2`)
- **Secondary**: Blue (`#3B82F6`)

### Semantic Colors

- **Success**: Green (`#22C55E`)
- **Warning**: Orange (`#F59E0B`)
- **Error**: Red (`#EF4444`)
- **Info**: Blue (`#0EA5E9`)

### Neutral Colors

- **Gray Scale**: Use Chakra UI gray scale (50-900)
- **Text Primary**: `gray.800`
- **Text Secondary**: `gray.600`
- **Text Tertiary**: `gray.500`

## Typography

### Headings

- **Page Title**: `2xl`, `bold`, `gray.800`
- **Section Title**: `xl`, `semibold`, `gray.800`
- **Card Title**: `lg`, `semibold`, `gray.800`

### Body Text

- **Body**: `md`, `normal`, `gray.600`
- **Caption**: `sm`, `normal`, `gray.500`
- **Label**: `sm`, `medium`, `gray.600`, `uppercase`, `letterSpacing="wider"`

## Spacing

Use consistent spacing throughout:

- **Page Gap**: `5` (20px) - Gap between page sections
- **Card Gap**: `5` (20px) - Gap between cards in a grid
- **Section Gap**: `5` (20px) - Gap between sections
- **Internal Gap**: `4` (16px) - Gap within components

### Spacing Scale

- `XS`: 2 (8px)
- `SM`: 3 (12px)
- `MD`: 4 (16px)
- `LG`: 5 (20px)
- `XL`: 6 (24px)
- `2XL`: 8 (32px)

## Buttons

### Button Variants

1. **Primary**: Main actions (Create, Save, Submit)
2. **Secondary**: Secondary actions (Cancel, Back)
3. **Outline**: Tertiary actions (Filter, Sort)
4. **Ghost**: Subtle actions (Edit, View)
5. **Danger**: Destructive actions (Delete, Remove)

### Button Sizes

- **Default**: `md` (40px height)
- **Small**: `sm` (32px height)
- **Large**: `lg` (48px height)

### Button Icons

Always use icons from `react-icons/fi` (Feather Icons):

```tsx
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

<StandardButton leftIcon={<FiPlus />}>Add</StandardButton>
```

## Cards

### Card Variants

1. **Default**: Standard card with shadow and border
2. **Elevated**: Card with stronger shadow (no border)
3. **Outlined**: Card with border only (no shadow)

### Card Usage

- **Stats Cards**: Use `StatCard` component
- **Content Cards**: Use `StandardCard` component
- **Table Cards**: Wrap tables in `StandardCard`

## Best Practices

### 1. Consistency

- Always use standardized components (`PageHeader`, `StandardCard`, `StandardButton`)
- Follow the page structure template
- Use design constants from `design.constants.ts`

### 2. Spacing

- Use consistent gaps (`gap={5}` for sections, `gap={4}` for internal)
- Maintain consistent padding (cards: `p={5}` or `p={6}`)
- Use responsive spacing (`{{ base: 4, md: 5, lg: 6 }}`)

### 3. Colors

- Use semantic colors for status indicators
- Use gray scale for text and backgrounds
- Use brand colors for primary actions

### 4. Typography

- Use consistent font sizes and weights
- Maintain hierarchy (heading > body > caption)
- Use uppercase labels with letter spacing

### 5. Responsive Design

- Always use responsive props (`{{ base: 1, md: 2, lg: 3 }}`)
- Test on mobile, tablet, and desktop
- Use `SimpleGrid` for responsive grids

### 6. Accessibility

- Use semantic HTML
- Provide proper labels and descriptions
- Ensure proper contrast ratios
- Support keyboard navigation

### 7. Loading States

- Show loading indicators for async operations
- Use `SkeletonCard` for loading states
- Provide error states with retry options

### 8. Error Handling

- Use `ErrorState` component for error display
- Provide clear error messages
- Offer retry mechanisms

## Updated Pages

The following pages have been updated to use the standardized design:

- ✅ DashboardPage
- ✅ CustomersPage
- ✅ DealsPage
- ✅ LeadsPage
- ✅ EmployeesPage
- ✅ IssuesPage
- ✅ ActivitiesPage
- ✅ AnalyticsPage

## Migration Guide

To update an existing page:

1. Replace custom header with `PageHeader`
2. Replace custom cards with `StandardCard` or `StatCard`
3. Replace custom buttons with `StandardButton`
4. Update spacing to use consistent gaps
5. Update colors to use semantic/brand colors
6. Update typography to use standard sizes/weights

## Resources

- Design Constants: `src/config/design.constants.ts`
- Design Tokens: `src/theme/tokens.ts`
- Common Components: `src/components/common/`

