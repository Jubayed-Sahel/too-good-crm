# Design Tokens Documentation

## 📋 Overview

This document describes the design token system for the Too Good CRM application. Design tokens are the core visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

## 🎨 Token Categories

### 1. Colors

#### Brand Colors
- **Primary (Purple)**: Used for primary actions, links, and brand elements
  - Range: `purple.50` to `purple.900`
  - Main: `purple.500` (#8B5CF6)

- **Secondary (Blue)**: Used for secondary actions and information
  - Range: `blue.50` to `blue.900`
  - Main: `blue.500` (#3B82F6)

#### Semantic Colors
- **Success (Green)**: Positive actions, successful states
- **Warning (Yellow)**: Warnings, pending states
- **Error (Red)**: Errors, destructive actions
- **Info (Blue)**: Informational messages

#### Status Colors
- **Active**: `#22C55E` (Green)
- **Pending**: `#F59E0B` (Orange)
- **Inactive**: `#6B7280` (Gray)
- **Won**: `#22C55E` (Green)
- **Lost**: `#EF4444` (Red)

### 2. Typography

#### Font Families
```typescript
body: "Inter, sans-serif"
heading: "Inter, sans-serif"
mono: "Fira Code, monospace"
```

#### Font Sizes
```typescript
xs: 12px    // Small labels, captions
sm: 14px    // Body text, form inputs
md: 16px    // Default body text
lg: 18px    // Subheadings
xl: 20px    // Section headings
2xl: 24px   // Page headings
3xl: 30px   // Large headings
```

#### Font Weights
```typescript
normal: 400    // Body text
medium: 500    // Emphasized text, buttons
semibold: 600  // Table headers, labels
bold: 700      // Strong emphasis
```

### 3. Spacing

Consistent spacing scale based on 4px increments:
```typescript
1: 4px      // Tight spacing
2: 8px      // Small gaps
3: 12px     // Default gaps
4: 16px     // Medium gaps
6: 24px     // Large gaps (most common)
8: 32px     // Extra large gaps
12: 48px    // Section spacing
```

**Common Usage:**
- Component padding: `6` (24px)
- Stack gaps: `6` (24px)
- Grid gaps: `6` (24px)
- Section spacing: `8` (32px)

### 4. Sizing

#### Input & Button Heights
```typescript
sm: 32px
md: 40px    // Standard (most common)
lg: 48px
xl: 56px
```

#### Icon Sizes
```typescript
xs: 12px
sm: 14px
md: 16px
lg: 20px
xl: 24px
```

### 5. Borders

#### Border Radius
```typescript
sm: 2px     // Subtle rounding
base: 4px   // Standard corners
md: 6px     // Inputs, buttons
lg: 8px     // Cards
xl: 12px    // Large components
full: 9999px // Pills, badges
```

#### Border Colors
```typescript
light: #E5E7EB    // Gray 200
medium: #D1D5DB   // Gray 300
focus: #8B5CF6    // Purple 500
```

### 6. Shadows

```typescript
sm: Subtle elevation
md: Standard cards
lg: Dropdowns, modals
focus: Focus indicator (purple glow)
```

## 🔧 Usage Examples

### Using Design Tokens Directly

```typescript
import { designTokens } from '@/theme/tokens';

// In your component
<Box
  p={designTokens.spacing[6]}
  borderRadius={designTokens.borders.radii.lg}
  boxShadow={designTokens.shadows.md}
>
  Content
</Box>
```

### Using Semantic Tokens

```typescript
import { semanticTokens } from '@/theme/semanticTokens';
import { getCustomerStatusColors } from '@/theme/utils';

// Get customer status colors
const statusColors = getCustomerStatusColors('active');

<Badge
  bg={statusColors.bg}
  color={statusColors.color}
>
  Active
</Badge>
```

### Using Chakra UI Props

```typescript
// With Chakra UI components
<Button
  colorScheme="purple"
  size="md"
  h="40px"
  borderRadius="md"
>
  Click Me
</Button>

<Input
  h="40px"
  borderRadius="md"
  borderColor="gray.200"
  _focus={{
    borderColor: "purple.500",
    boxShadow: "focus",
  }}
/>
```

## 🎯 Component-Specific Tokens

### Inputs
```typescript
height: '40px'
padding: '0 12px'
fontSize: '0.875rem' (14px)
borderRadius: '0.375rem' (6px)
borderColor: '#E5E7EB' (gray.200)
focusBorderColor: '#8B5CF6' (purple.500)
```

### Buttons
```typescript
height: '40px'
padding: '0 16px'
fontSize: '0.875rem' (14px)
fontWeight: 500
borderRadius: '0.375rem' (6px)
```

### Cards
```typescript
padding: '24px'
borderRadius: '0.75rem' (12px)
backgroundColor: '#FFFFFF'
borderColor: '#E5E7EB'
shadow: 'sm'
```

### Tables
```typescript
headerBg: '#F9FAFB' (gray.50)
headerColor: '#6B7280' (gray.500)
headerFontSize: '0.75rem' (12px)
headerFontWeight: 600
rowBorderColor: '#E5E7EB' (gray.200)
cellPadding: '12px 16px'
```

## 📱 Responsive Design

### Breakpoints
```typescript
xs: '320px'   // Mobile phones
sm: '640px'   // Large phones
md: '768px'   // Tablets
lg: '1024px'  // Laptops
xl: '1280px'  // Desktops
2xl: '1536px' // Large screens
```

### Responsive Spacing Example
```typescript
import { getResponsiveSpacing } from '@/theme/utils';

<Box p={getResponsiveSpacing(4, 6, 8)}>
  {/* 16px on mobile, 24px on tablet, 32px on desktop */}
</Box>
```

## 🎨 Status Badge Examples

### Customer Status
```typescript
import { getCustomerStatusColors } from '@/theme/utils';

const colors = getCustomerStatusColors(customer.status);

<Badge bg={colors.bg} color={colors.color}>
  {formatCustomerStatus(customer.status)}
</Badge>
```

### Deal Stage
```typescript
import { getDealStageColors } from '@/theme/utils';

const colors = getDealStageColors(deal.stage);

<Badge bg={colors.bg} color={colors.color}>
  {formatDealStage(deal.stage)}
</Badge>
```

## 🚀 Best Practices

1. **Always use tokens instead of hardcoded values**
   ```typescript
   // ❌ Bad
   <Box p="24px" borderRadius="12px">
   
   // ✅ Good
   <Box p={6} borderRadius="lg">
   ```

2. **Use semantic tokens for status-based styling**
   ```typescript
   // ❌ Bad
   <Badge bg="#DCFCE7" color="#15803D">
   
   // ✅ Good
   const colors = getCustomerStatusColors('active');
   <Badge bg={colors.bg} color={colors.color}>
   ```

3. **Use utility functions for complex logic**
   ```typescript
   import { getTransition } from '@/theme/utils';
   
   <Box {...getTransition('colors', 'normal', 'easeInOut')}>
   ```

4. **Maintain consistency across similar components**
   - All inputs: `h="40px"`
   - All buttons: `h="40px"`
   - All cards: `p={6}`, `borderRadius="lg"`
   - All page gaps: `gap={6}`

## 📊 Token Summary

| Category | Count | Usage |
|----------|-------|-------|
| Color Scales | 10+ | Brand, semantic, status colors |
| Font Sizes | 13 | Typography hierarchy |
| Spacing | 30+ | Margins, padding, gaps |
| Shadows | 8 | Elevation, focus states |
| Border Radius | 10 | Component corners |
| Breakpoints | 6 | Responsive design |

## 🔄 Updates

When updating design tokens:
1. Update `tokens.ts` for base values
2. Update `semanticTokens.ts` for contextual mappings
3. Update `utils.ts` if adding new helper functions
4. Update this documentation
5. Test all components for visual consistency

---

**Design System Version**: 1.0.0  
**Last Updated**: 2025-11-01
