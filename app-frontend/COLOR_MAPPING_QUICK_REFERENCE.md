# Web to Mobile Color Mapping Reference

## Quick Reference Guide for Developers

This document provides a quick lookup for converting web frontend colors to mobile app equivalents.

---

## Dashboard & Stats Cards

### Card Container
```kotlin
// Mobile (Compose)
Card(
    colors = CardDefaults.cardColors(
        containerColor = DesignTokens.Colors.White
    ),
    border = BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant),
    shape = RoundedCornerShape(DesignTokens.Radius.Large)
)
```

```tsx
// Web (Chakra UI)
<Box
  bg="white"
  borderRadius="xl"
  borderWidth="1px"
  borderColor="gray.200"
/>
```

---

## Stat Card Icon Backgrounds

### Purple Theme (Primary Metrics)
**Use for:** Total counts, main metrics

```kotlin
// Mobile
iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f)
iconTintColor = DesignTokens.Colors.Primary
```

```tsx
// Web
iconBg="purple.100"
iconColor="purple.600"
```

---

### Blue Theme (Qualified/Info Metrics)
**Use for:** Status indicators, information metrics

```kotlin
// Mobile
iconBackgroundColor = DesignTokens.Colors.InfoLight
iconTintColor = DesignTokens.Colors.Info
```

```tsx
// Web
iconBg="blue.100"
iconColor="blue.600"
```

---

### Pink Theme (Conversion/Special Metrics)
**Use for:** Conversion rates, special KPIs

```kotlin
// Mobile
iconBackgroundColor = Color(0xFFFCE7F3) // Pink 100
iconTintColor = DesignTokens.Colors.PinkAccent
```

```tsx
// Web
iconBg="pink.100"
iconColor="pink.600"
```

---

### Green Theme (Success/Completed Metrics)
**Use for:** Completed items, success metrics

```kotlin
// Mobile
iconBackgroundColor = DesignTokens.Colors.SuccessLight
iconTintColor = DesignTokens.Colors.Success
```

```tsx
// Web
iconBg="green.100"
iconColor="green.600"
```

---

### Orange Theme (Warning/Active Metrics)
**Use for:** Active items, pending actions

```kotlin
// Mobile
iconBackgroundColor = DesignTokens.Colors.WarningLight
iconTintColor = DesignTokens.Colors.Warning
```

```tsx
// Web
iconBg="orange.100"
iconColor="orange.600"
```

---

### Secondary/Indigo Theme (Value Metrics)
**Use for:** Financial metrics, secondary KPIs

```kotlin
// Mobile
iconBackgroundColor = DesignTokens.Colors.SecondaryContainer
iconTintColor = DesignTokens.Colors.Secondary
```

```tsx
// Web
iconBg="indigo.100"
iconColor="indigo.600"
```

---

## Complete Color Palette Reference

| Color Name | Mobile (Hex) | Web (Chakra) | Usage |
|-----------|--------------|--------------|-------|
| Primary | #667EEA | purple.500 | Main brand color |
| Primary Light | #8A9DF0 | purple.300 | Light variants |
| Primary Container | #E8EBFA | purple.50 | Light backgrounds |
| Secondary | #5E72E4 | indigo.500 | Secondary actions |
| Secondary Container | #E5E8FB | indigo.50 | Secondary backgrounds |
| Success | #10B981 | green.500 | Success states |
| Success Light | #D1FAE5 | green.100 | Success backgrounds |
| Warning | #F59E0B | orange.500 | Warning states |
| Warning Light | #FEF3C7 | orange.100 | Warning backgrounds |
| Error | #EF4444 | red.500 | Error states |
| Error Light | #FEE2E2 | red.100 | Error backgrounds |
| Info | #3B82F6 | blue.500 | Info states |
| Info Light | #DBEAFE | blue.100 | Info backgrounds |
| Pink Accent | #EC4899 | pink.500 | Special accents |
| White | #FFFFFF | white | Card backgrounds |
| Background | #F1F5F9 | gray.100 | Page backgrounds |
| Surface | #FFFFFF | white | Surface elements |
| Outline | #CBD5E1 | gray.300 | Borders |
| Outline Variant | #E2E8F0 | gray.200 | Light borders |

---

## Usage Examples

### Dashboard Card - Total Customers
```kotlin
// Mobile
MetricCard(
    title = "TOTAL CUSTOMERS",
    value = "1234",
    change = "+12%",
    icon = Icons.Default.People,
    isPositive = true,
    iconBackgroundColor = DesignTokens.Colors.PrimaryLight.copy(alpha = 0.2f),
    iconTintColor = DesignTokens.Colors.Primary
)
```

```tsx
// Web
<StatCard
  title="Total Customers"
  value="1,234"
  icon={<FiUsers />}
  iconBg="purple.100"
  iconColor="purple.600"
  change="+12%"
/>
```

---

### Lead Card - Qualified
```kotlin
// Mobile
LeadMetricCard(
    title = "QUALIFIED",
    value = "87",
    change = "+15%",
    icon = Icons.Default.EmojiEvents,
    iconBackgroundColor = DesignTokens.Colors.InfoLight,
    iconTintColor = DesignTokens.Colors.Info
)
```

```tsx
// Web
<StatCard
  title="Qualified"
  value="87"
  icon={<FiAward />}
  iconBg="blue.100"
  iconColor="blue.600"
  change="+15%"
/>
```

---

## Typography Matching

### Card Title (Uppercase Labels)
```kotlin
// Mobile
Text(
    text = title,
    style = MaterialTheme.typography.labelMedium,
    color = DesignTokens.Colors.OnSurfaceVariant,
    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
    letterSpacing = 0.5.sp
)
```

```tsx
// Web
<Text
  fontSize="sm"
  fontWeight="semibold"
  color="gray.600"
  textTransform="uppercase"
  letterSpacing="wider"
>
  {title}
</Text>
```

---

### Card Value (Large Numbers)
```kotlin
// Mobile
Text(
    text = value,
    style = MaterialTheme.typography.headlineMedium,
    fontWeight = DesignTokens.Typography.FontWeightBold,
    color = DesignTokens.Colors.OnSurface
)
```

```tsx
// Web
<Heading 
  size={{ base: '3xl', md: '4xl' }} 
  color="gray.900"
  fontWeight="bold"
>
  {value}
</Heading>
```

---

## Spacing & Layout

### Card Padding
```kotlin
// Mobile
.padding(DesignTokens.Padding.CardPaddingComfortable) // 20dp
```

```tsx
// Web
p={{ base: 5, md: 6 }} // 20px / 24px
```

### Icon Container Size
```kotlin
// Mobile
.size(56.dp)
```

```tsx
// Web
w={{ base: 14, md: 14 }} // 56px
h={{ base: 14, md: 14 }} // 56px
```

---

## Migration Checklist

When creating a new card component:

- [ ] Use `DesignTokens.Colors.White` for card background
- [ ] Add `BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)` for border
- [ ] Set elevation to `DesignTokens.Elevation.Level1`
- [ ] Use `RoundedCornerShape(DesignTokens.Radius.Large)` for corners
- [ ] Apply appropriate icon background color from table above
- [ ] Match icon tint color with background
- [ ] Use proper typography weights and spacing
- [ ] Test on multiple screen sizes

---

## Common Patterns

### Success Card (Green)
Use for: Completed, Won, Active users
- Background: `SuccessLight`
- Icon: `Success`

### Warning Card (Orange)
Use for: Pending, In Progress, Attention needed
- Background: `WarningLight`
- Icon: `Warning`

### Info Card (Blue)
Use for: Qualified, Verified, Information
- Background: `InfoLight`
- Icon: `Info`

### Primary Card (Purple)
Use for: Total counts, Main metrics
- Background: `PrimaryLight.copy(alpha=0.2f)`
- Icon: `Primary`

---

This guide ensures consistent color usage across web and mobile platforms.
