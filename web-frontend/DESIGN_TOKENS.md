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
md: 6px     // Deprecated - use lg for consistency
lg: 8px     // ⭐ STANDARD for inputs, buttons, filters (most common)
xl: 12px    // ⭐ STANDARD for cards, dialogs, containers
2xl: 16px   // Large components
3xl: 24px   // Extra large components
full: 9999px // Pills, badges
```

**🎯 Consistency Rules:**
- **All inputs, buttons, filters**: Use `borderRadius="lg"` (8px)
- **All cards, dialogs, page containers**: Use `borderRadius="xl"` (12px)
- **All badges, pills**: Use `borderRadius="full"`

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

### Inputs & Form Elements
```typescript
// All inputs (text, email, select, search, etc.)
height: '40px'
padding: '0 12px' or '0 40px' (with icon inside)
fontSize: '0.875rem' (14px)
borderRadius: 'lg' (8px) ⭐ STANDARD
borderColor: 'gray.200' (#E5E7EB)
focusBorderColor: 'purple.500' (#8B5CF6)
fontWeight: 400 (normal)

// Icon inside input
iconPosition: 'absolute'
iconLeft: '12px'
iconSize: '18px'
inputPaddingLeft: '40px' (to accommodate icon)
```

### Buttons
```typescript
// All buttons (primary, secondary, outlined)
height: '40px'
padding: '0 16px'
fontSize: '0.875rem' (14px)
fontWeight: 500
borderRadius: 'lg' (8px) ⭐ STANDARD
colorPalette: 'purple' (for primary actions)
transition: 'all 0.2s ease-in-out'

// Button variants
- Primary: bg="purple.500", color="white"
- Secondary: variant="outline", borderColor="purple.500"
- Ghost: variant="ghost", color="gray.700"
```

### Cards & Containers
```typescript
// All cards (stat cards, info cards, page containers)
padding: '24px' (p={6})
borderRadius: 'xl' (12px) ⭐ STANDARD
backgroundColor: 'white'
borderWidth: '1px'
borderColor: 'gray.200'
shadow: 'sm'
transition: 'box-shadow 0.2s ease-in-out'

// Card hover state
_hover: {
  shadow: 'md',
  borderColor: 'gray.300'
}
```

### Tables
```typescript
// Chakra UI Table component (NOT div-based)
Table.Root: {
  variant: 'outline',
  size: 'sm'
}

// Header styling
Table.Header: {
  bg: 'gray.50' (#F9FAFB),
  borderBottom: '1px solid',
  borderColor: 'gray.200'
}
Table.ColumnHeader: {
  color: 'gray.500' (#6B7280),
  fontSize: '0.75rem' (12px),
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  py: '12px',
  px: '16px'
}

// Body styling
Table.Body: {
  bg: 'white'
}
Table.Row: {
  borderBottom: '1px solid',
  borderColor: 'gray.200',
  transition: 'background-color 0.15s ease',
  _hover: { bg: 'gray.50' }
}
Table.Cell: {
  color: 'gray.900',
  fontSize: '0.875rem' (14px),
  py: '12px',
  px: '16px'
}
```

### Stat Cards
```typescript
// 4-column grid layout
grid: 'repeat(4, 1fr)'
gap: '24px' (6)

// Individual stat card
Card.Root: {
  p: '24px' (6),
  borderRadius: 'xl' (12px),
  borderWidth: '1px',
  borderColor: 'gray.200'
}

// Icon box in stat card
IconBox: {
  width: '48px',
  height: '48px',
  borderRadius: 'lg' (8px),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

// Icon colors (semantic)
- Customers: bg="purple.100", color="purple.600"
- Deals: bg="blue.100", color="blue.600"
- Revenue: bg="green.100", color="green.600"
- Conversion: bg="yellow.100", color="yellow.600"
```

### Dialogs & Modals
```typescript
// Dialog backdrop
Dialog.Backdrop: {
  bg: 'blackAlpha.600'
}

// Dialog container
Dialog.Content: {
  borderRadius: 'xl' (12px) ⭐ STANDARD,
  maxW: 'md' (28rem / 448px),
  p: '24px' (6)
}

// Dialog header
Dialog.Header: {
  fontSize: 'lg',
  fontWeight: 600,
  pb: '16px'
}

// Dialog body
Dialog.Body: {
  py: '16px'
}

// Dialog footer
Dialog.Footer: {
  gap: '12px',
  pt: '16px'
}
```

### Filters & Search
```typescript
// Filter container
Stack: {
  direction: 'row',
  gap: '12px' (3),
  align: 'center',
  wrap: 'wrap'
}

// Filter inputs
Input/Select: {
  height: '40px',
  borderRadius: 'lg' (8px),
  fontSize: '0.875rem',
  minW: '200px'
}

// Search with icon inside
Input: {
  pl: '40px', // for search icon
  borderRadius: 'lg'
}
SearchIcon: {
  position: 'absolute',
  left: '12px',
  color: 'gray.400',
  size: '18px'
}
```

### Badges
```typescript
Badge: {
  px: '12px',
  py: '4px',
  fontSize: '0.75rem' (12px),
  fontWeight: 500,
  borderRadius: 'full',
  textTransform: 'capitalize'
}

// Status-based colors
- Active/Won: bg="green.100", color="green.700"
- Pending: bg="yellow.100", color="yellow.700"
- Inactive/Lost: bg="red.100", color="red.700"
- Qualified: bg="purple.100", color="purple.700"
```

### Checkboxes (Bulk Actions)
```typescript
Checkbox: {
  size: 'sm',
  colorPalette: 'purple',
  borderRadius: 'sm'
}

// In table header (select all)
Table.ColumnHeader: {
  width: '40px',
  px: '12px'
}

// In table cell (individual)
Table.Cell: {
  width: '40px',
  px: '12px'
}
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

## 🎨 Improved UI Patterns (Nov 2025)

### 1. Search & Filter Layout
**Consistent pattern across all list pages:**
```typescript
<Stack gap={6}>
  {/* Stats cards - 4 columns */}
  <SimpleGrid columns={4} gap={6}>
    <StatCard icon={Users} label="Total" value="1,234" />
    {/* ... more stat cards */}
  </SimpleGrid>

  {/* Main content card */}
  <Card.Root borderRadius="xl" p={6}>
    {/* Filters row */}
    <Stack direction="row" justify="space-between" mb={6}>
      {/* Left: Search & Filters */}
      <Stack direction="row" gap={3} flex={1}>
        <Box position="relative" flex={1} maxW="400px">
          <Icon position="absolute" left="12px" top="50%" />
          <Input pl="40px" borderRadius="lg" placeholder="Search..." />
        </Box>
        <Select borderRadius="lg" w="200px">...</Select>
        <Select borderRadius="lg" w="200px">...</Select>
      </Stack>

      {/* Right: Action buttons */}
      <Stack direction="row" gap={3}>
        <Button variant="outline" borderRadius="lg">Export</Button>
        <Button colorPalette="purple" borderRadius="lg">+ Add New</Button>
      </Stack>
    </Stack>

    {/* Bulk actions (when items selected) */}
    {selectedCount > 0 && (
      <Stack direction="row" gap={3} mb={4} p={3} bg="purple.50" borderRadius="lg">
        <Text>{selectedCount} selected</Text>
        <Button size="sm">Delete</Button>
        <Button size="sm">Export</Button>
      </Stack>
    )}

    {/* Table */}
    <Table.Root variant="outline" size="sm">...</Table.Root>
  </Card.Root>
</Stack>
```

### 2. Table Pattern with Bulk Selection
**Chakra UI Table with checkbox column:**
```typescript
<Table.Root variant="outline" size="sm">
  <Table.Header bg="gray.50">
    <Table.Row borderBottom="1px" borderColor="gray.200">
      {/* Checkbox column */}
      <Table.ColumnHeader w="40px" px="12px">
        <Checkbox 
          checked={allSelected}
          onChange={handleSelectAll}
          colorPalette="purple"
        />
      </Table.ColumnHeader>
      
      <Table.ColumnHeader>Name</Table.ColumnHeader>
      <Table.ColumnHeader>Email</Table.ColumnHeader>
      <Table.ColumnHeader>Status</Table.ColumnHeader>
      <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
    </Table.Row>
  </Table.Header>

  <Table.Body>
    {items.map(item => (
      <Table.Row 
        key={item.id}
        _hover={{ bg: 'gray.50' }}
        borderBottom="1px"
        borderColor="gray.200"
      >
        <Table.Cell w="40px" px="12px">
          <Checkbox 
            checked={isSelected(item.id)}
            onChange={() => handleSelect(item.id)}
            colorPalette="purple"
          />
        </Table.Cell>
        
        <Table.Cell fontWeight={500}>{item.name}</Table.Cell>
        <Table.Cell color="gray.600">{item.email}</Table.Cell>
        <Table.Cell>
          <Badge bg="green.100" color="green.700" borderRadius="full">
            {item.status}
          </Badge>
        </Table.Cell>
        <Table.Cell textAlign="right">
          <IconButton size="sm" variant="ghost">...</IconButton>
        </Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>
```

### 3. Stat Card Pattern
**Consistent across all dashboards:**
```typescript
<Card.Root
  p={6}
  borderRadius="xl"
  borderWidth="1px"
  borderColor="gray.200"
  transition="all 0.2s"
  _hover={{ shadow: 'md', borderColor: 'gray.300' }}
>
  <Stack direction="row" justify="space-between" align="flex-start">
    {/* Content */}
    <Stack gap={1}>
      <Text fontSize="sm" color="gray.500" fontWeight={500}>
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight={700} color="gray.900">
        {value}
      </Text>
      {change && (
        <HStack gap={1}>
          <Icon as={TrendingUp} size="sm" color="green.500" />
          <Text fontSize="sm" color="green.600">+{change}%</Text>
        </HStack>
      )}
    </Stack>

    {/* Icon box */}
    <Box
      w="48px"
      h="48px"
      borderRadius="lg"
      bg={iconBg}
      color={iconColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Icon as={icon} size="24px" />
    </Box>
  </Stack>
</Card.Root>
```

### 4. Dialog/Modal Pattern
**Consistent dialog structure:**
```typescript
<Dialog.Root open={isOpen} onOpenChange={onClose}>
  <Dialog.Backdrop bg="blackAlpha.600" />
  
  <Dialog.Positioner>
    <Dialog.Content borderRadius="xl" maxW="md" p={6}>
      <Dialog.Header pb={4}>
        <Dialog.Title fontSize="lg" fontWeight={600}>
          Add New Customer
        </Dialog.Title>
      </Dialog.Header>

      <Dialog.Body py={4}>
        <Stack gap={4}>
          <Field label="Name" required>
            <Input borderRadius="lg" h="40px" />
          </Field>
          
          <Field label="Email" required>
            <Input type="email" borderRadius="lg" h="40px" />
          </Field>
          
          <Field label="Status">
            <Select borderRadius="lg" h="40px">
              <option>Active</option>
              <option>Pending</option>
            </Select>
          </Field>
        </Stack>
      </Dialog.Body>

      <Dialog.Footer pt={4} gap={3}>
        <Button variant="outline" borderRadius="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button colorPalette="purple" borderRadius="lg" onClick={handleSubmit}>
          Add Customer
        </Button>
      </Dialog.Footer>

      <Dialog.CloseTrigger />
    </Dialog.Content>
  </Dialog.Positioner>
</Dialog.Root>
```

### 5. Input with Icon Inside Pattern
**Search and filter inputs:**
```typescript
{/* Search input with icon */}
<Box position="relative" flex={1} maxW="400px">
  <Icon 
    as={Search}
    position="absolute"
    left="12px"
    top="50%"
    transform="translateY(-50%)"
    color="gray.400"
    size="18px"
    pointerEvents="none"
  />
  <Input
    pl="40px"
    pr="12px"
    h="40px"
    borderRadius="lg"
    placeholder="Search customers..."
    borderColor="gray.200"
    _focus={{ borderColor: 'purple.500', boxShadow: 'focus' }}
  />
</Box>

{/* Date input with icon */}
<Box position="relative">
  <Icon 
    as={Calendar}
    position="absolute"
    left="12px"
    top="50%"
    transform="translateY(-50%)"
    color="gray.400"
    size="18px"
  />
  <Input
    type="date"
    pl="40px"
    h="40px"
    borderRadius="lg"
  />
</Box>
```

### 6. Page Layout Pattern
**Standard page container:**
```typescript
<PageContainer>
  <Stack gap={6}>
    {/* Page header */}
    <Stack direction="row" justify="space-between" align="center">
      <Box>
        <Heading size="xl" mb={1}>Customers</Heading>
        <Text color="gray.600">Manage your customer relationships</Text>
      </Box>
      <Button colorPalette="purple" borderRadius="lg">
        + Add Customer
      </Button>
    </Stack>

    {/* Stats */}
    <SimpleGrid columns={4} gap={6}>
      {/* Stat cards */}
    </SimpleGrid>

    {/* Main content */}
    <Card.Root borderRadius="xl" p={6}>
      {/* Content */}
    </Card.Root>
  </Stack>
</PageContainer>
```



## 🎨 Status Badge Examples

### Customer Status
```typescript
import { getCustomerStatusColors } from '@/theme/utils';

const colors = getCustomerStatusColors(customer.status);

<Badge 
  bg={colors.bg} 
  color={colors.color}
  px="12px"
  py="4px"
  borderRadius="full"
  fontSize="0.75rem"
  fontWeight={500}
>
  {formatCustomerStatus(customer.status)}
</Badge>
```

### Deal Stage
```typescript
import { getDealStageColors } from '@/theme/utils';

const colors = getDealStageColors(deal.stage);

<Badge 
  bg={colors.bg} 
  color={colors.color}
  px="12px"
  py="4px"
  borderRadius="full"
>
  {formatDealStage(deal.stage)}
</Badge>
```

### Lead Status
```typescript
// Active status
<Badge bg="green.100" color="green.700" borderRadius="full">
  Active
</Badge>

// Qualified status
<Badge bg="purple.100" color="purple.700" borderRadius="full">
  Qualified
</Badge>

// Pending status
<Badge bg="yellow.100" color="yellow.700" borderRadius="full">
  Pending
</Badge>
```

## 🚀 Best Practices

### 1. Always use tokens instead of hardcoded values
```typescript
// ❌ Bad
<Box p="24px" borderRadius="12px">

// ✅ Good
<Box p={6} borderRadius="xl">
```

### 2. Use semantic tokens for status-based styling
```typescript
// ❌ Bad
<Badge bg="#DCFCE7" color="#15803D">

// ✅ Good
const colors = getCustomerStatusColors('active');
<Badge bg={colors.bg} color={colors.color}>
```

### 3. Consistent border radius
```typescript
// ❌ Bad - mixing different radius values
<Input borderRadius="md" />
<Button borderRadius="6px" />

// ✅ Good - consistent lg for all inputs/buttons
<Input borderRadius="lg" />
<Button borderRadius="lg" />
<Select borderRadius="lg" />
```

### 4. Maintain consistency across similar components
```typescript
// All inputs and buttons
- height: '40px'
- borderRadius: 'lg' (8px)
- fontSize: '0.875rem'

// All cards and containers  
- p: {6} (24px)
- borderRadius: 'xl' (12px)
- borderColor: 'gray.200'

// All page layouts
- gap: {6} (24px between sections)
- Stack direction: 'column'
```

### 5. Use Chakra UI native components
```typescript
// ❌ Bad - div-based tables
<div className="table">
  <div className="row">...</div>
</div>

// ✅ Good - Chakra UI Table components
<Table.Root>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeader>...</Table.ColumnHeader>
    </Table.Row>
  </Table.Header>
  <Table.Body>...</Table.Body>
</Table.Root>
```

### 6. Icon positioning inside inputs
```typescript
// ❌ Bad - icon outside input
<HStack>
  <Icon />
  <Input />
</HStack>

// ✅ Good - icon inside with absolute positioning
<Box position="relative">
  <Icon position="absolute" left="12px" top="50%" transform="translateY(-50%)" />
  <Input pl="40px" />
</Box>
```

### 7. Use utility functions for complex logic
```typescript
import { getTransition } from '@/theme/utils';

<Box {...getTransition('colors', 'normal', 'easeInOut')}>
```

### 8. Consistent action button colors
```typescript
// ✅ All primary action buttons use purple
<Button colorPalette="purple">Add Customer</Button>
<Button colorPalette="purple">Add Deal</Button>
<Button colorPalette="purple">Add Lead</Button>

// Secondary actions use outline or ghost
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Reset</Button>
```

## 📊 Token Summary

| Category | Count | Usage | Standard Values |
|----------|-------|-------|----------------|
| Color Scales | 10+ | Brand, semantic, status colors | Purple (primary), Blue (secondary) |
| Font Sizes | 13 | Typography hierarchy | 14px (body), 12px (small), 16px (headings) |
| Spacing | 30+ | Margins, padding, gaps | 24px (6) most common |
| Shadows | 8 | Elevation, focus states | sm (cards), md (hovers), focus (purple glow) |
| Border Radius | 10 | Component corners | **lg (8px) for inputs/buttons**, **xl (12px) for cards** |
| Breakpoints | 6 | Responsive design | sm: 640px, md: 768px, lg: 1024px |

## 🎯 Quick Reference - Most Common Values

### Layout & Spacing
```typescript
- Page padding: p={6} (24px)
- Section gaps: gap={6} (24px)
- Card padding: p={6} (24px)
- Grid gaps: gap={6} (24px)
- Between elements: gap={3} or gap={4} (12px-16px)
```

### Border Radius (Critical for Consistency!)
```typescript
- Inputs, buttons, filters, search: borderRadius="lg" (8px)
- Cards, dialogs, page containers: borderRadius="xl" (12px)
- Badges, pills, avatars: borderRadius="full"
```

### Heights
```typescript
- All inputs: h="40px"
- All buttons: h="40px"
- All selects: h="40px"
- Table rows: auto (with py="12px" on cells)
- Icon boxes in stat cards: "48px"
```

### Colors
```typescript
- Primary actions: colorPalette="purple" or bg="purple.500"
- Border color: borderColor="gray.200"
- Text primary: color="gray.900"
- Text secondary: color="gray.500"
- Background: bg="white"
- Page background: bg="gray.50"
```

### Typography
```typescript
- Body text: fontSize="0.875rem" (14px)
- Small text/labels: fontSize="0.75rem" (12px)
- Headings: fontSize="lg" or "xl"
- Font weight normal: 400
- Font weight medium (buttons): 500
- Font weight semibold (headers): 600
```

## 🔄 Updates

When updating design tokens:
1. Update `tokens.ts` for base values
2. Update `semanticTokens.ts` for contextual mappings
3. Update `utils.ts` if adding new helper functions
4. Update this documentation
5. Test all components for visual consistency
6. **Verify border radius consistency** (lg for inputs, xl for cards)
7. **Check all action buttons use purple colorPalette**

## ✅ Recent Updates (Nov 2025)

### Border Radius Standardization
- **Changed**: All inputs/buttons now use `borderRadius="lg"` (8px) instead of mixed values
- **Changed**: All cards/dialogs now use `borderRadius="xl"` (12px) for consistency
- **Impact**: Customers, Deals, Leads pages all updated

### Component Consistency
- **Added**: Chakra UI Table.Root components replaced div-based tables
- **Added**: Bulk action checkboxes across all list pages
- **Added**: Icon positioning inside input fields (search, filters)
- **Standardized**: All dialog popups (CreateCustomerDialog, CreateDealDialog, CreateLeadDialog)

### Color Palette
- **Standardized**: All primary action buttons use `colorPalette="purple"`
- **Applied**: Consistent stat card icon colors (purple, blue, green, yellow)
- **Maintained**: Status badge colors (green=active/won, yellow=pending, red=lost/inactive)

---

**Design System Version**: 2.0.0  
**Last Updated**: 2025-11-02  
**Major Changes**: Border radius standardization, Chakra UI Table migration, Icon positioning improvements
