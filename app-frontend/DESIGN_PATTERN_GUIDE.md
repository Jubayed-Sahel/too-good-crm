# App Frontend Design Pattern Guide

## Standard Card Pattern

All cards across the app should follow this consistent pattern:

### ✅ CORRECT Pattern (from Dashboard, Leads Screen)

```kotlin
Card(
    modifier = Modifier.fillMaxWidth(),
    elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1),  // ✅ 1.dp
    colors = CardDefaults.cardColors(
        containerColor = DesignTokens.Colors.White  // ✅ Using DesignTokens
    ),
    shape = MaterialTheme.shapes.large,  // ✅ Consistent shape
    border = BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)  // ✅ Has border
) {
    // Card content with DesignTokens padding
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(DesignTokens.Spacing.Space4)  // ✅ 16.dp using DesignTokens
    ) {
        // Content here
    }
}
```

### ❌ INCORRECT Patterns Found

**Activities Screen (Lines 188-195)**:
```kotlin
Card(
    modifier = Modifier.fillMaxWidth().clickable { },
    shape = RoundedCornerShape(12.dp),  // ❌ Hardcoded, should use MaterialTheme.shapes.large
    colors = CardDefaults.cardColors(containerColor = Color.White),  // ❌ Hardcoded Color.White
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)  // ❌ Hardcoded 2.dp
    // ❌ MISSING: border
)
```

**Customers Screen (Lines 685-687)**:
```kotlin
Card(
    shape = RoundedCornerShape(12.dp),  // ❌ Hardcoded
    colors = CardDefaults.cardColors(containerColor = Color.White),  // ❌ Hardcoded
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)  // ❌ Hardcoded
    // ❌ MISSING: border
)
```

**Deals Screen (Lines 257-259)**:
```kotlin
Card(
    shape = RoundedCornerShape(12.dp),  // ❌ Hardcoded
    colors = CardDefaults.cardColors(containerColor = Color.White),  // ❌ Hardcoded
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)  // ❌ Hardcoded
    // ❌ MISSING: border
)
```

---

## Standard Spacing Pattern

### ✅ CORRECT Spacing (from Customers Screen - Responsive)

```kotlin
// Spacing between elements
verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space1)  // ✅ 4.dp
verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)  // ✅ 8.dp
verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)  // ✅ 12.dp

// Individual spacers
Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))  // ✅ 4.dp
Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))  // ✅ 8.dp
Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space3))  // ✅ 12.dp
Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))  // ✅ 16.dp
Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space6))  // ✅ 24.dp
```

### ❌ INCORRECT Spacing

```kotlin
// Activities Screen
Spacer(modifier = Modifier.height(4.dp))   // ❌ Should be DesignTokens.Spacing.Space1
Spacer(modifier = Modifier.height(8.dp))   // ❌ Should be DesignTokens.Spacing.Space2
Spacer(modifier = Modifier.height(16.dp))  // ❌ Should be DesignTokens.Spacing.Space4
Spacer(modifier = Modifier.height(24.dp))  // ❌ Should be DesignTokens.Spacing.Space6

// Customers Screen (Line 692)
.padding(16.dp)  // ❌ Should be DesignTokens.Spacing.Space4 or DesignTokens.Padding.CardPaddingStandard

// Deals Screen (Line 264, 278)
.padding(16.dp)  // ❌ Should be DesignTokens.Spacing.Space4
Spacer(modifier = Modifier.height(4.dp))  // ❌ Should be DesignTokens.Spacing.Space1
```

---

## Standard Typography Pattern

### ✅ CORRECT Typography (from Leads, Dashboard)

```kotlin
Text(
    text = title,
    style = MaterialTheme.typography.labelMedium,  // ✅ Using MaterialTheme
    color = DesignTokens.Colors.OnSurfaceVariant,  // ✅ Using DesignTokens
    fontWeight = DesignTokens.Typography.FontWeightSemiBold,  // ✅ Using DesignTokens
    letterSpacing = 0.5.sp
)

Text(
    text = value,
    style = MaterialTheme.typography.headlineMedium,  // ✅
    fontWeight = DesignTokens.Typography.FontWeightBold,  // ✅ Using DesignTokens
    color = DesignTokens.Colors.OnSurface  // ✅
)

Text(
    text = name,
    style = MaterialTheme.typography.titleMedium,  // ✅
    fontWeight = DesignTokens.Typography.FontWeightBold,  // ✅ Using DesignTokens
    color = DesignTokens.Colors.OnSurface  // ✅
)
```

### ❌ INCORRECT Typography

```kotlin
// Activities, Customers, Deals Screens
fontWeight = FontWeight.Bold  // ❌ Should be DesignTokens.Typography.FontWeightBold
```

---

## Standard Shape Pattern

### ✅ CORRECT Shapes

```kotlin
// Cards
shape = MaterialTheme.shapes.large  // ✅ 16.dp rounded corners

// Status badges, small elements
shape = MaterialTheme.shapes.small  // ✅ 8.dp rounded corners

// Using DesignTokens directly
shape = RoundedCornerShape(DesignTokens.Radius.Medium)  // ✅ 12.dp
shape = RoundedCornerShape(DesignTokens.Radius.Small)  // ✅ 8.dp
shape = RoundedCornerShape(DesignTokens.Radius.Large)  // ✅ 16.dp
```

### ❌ INCORRECT Shapes

```kotlin
// Activities, Customers, Deals Screens
shape = RoundedCornerShape(12.dp)  // ❌ Should be MaterialTheme.shapes.large or DesignTokens.Radius.Medium
shape = RoundedCornerShape(8.dp)   // ❌ Should be MaterialTheme.shapes.small or DesignTokens.Radius.Small
```

---

## Standard Elevation Pattern

### ✅ CORRECT Elevation

```kotlin
// Standard cards (resting state)
elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level1)  // ✅ 1.dp

// Pressed/interactive cards
elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level2)  // ✅ 2.dp

// Elevated dialogs, modals
elevation = CardDefaults.cardElevation(defaultElevation = DesignTokens.Elevation.Level4)  // ✅ 4.dp
```

### ❌ INCORRECT Elevation

```kotlin
// Activities, Customers, Deals Screens
elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)  // ❌ Should be DesignTokens.Elevation.Level2
```

---

## Standard Color Pattern

### ✅ CORRECT Colors

```kotlin
// Backgrounds
.background(DesignTokens.Colors.Background)  // ✅ Gray 50

// Card backgrounds
containerColor = DesignTokens.Colors.White  // ✅ White
containerColor = DesignTokens.Colors.Surface  // ✅ White (alias)

// Text colors
color = DesignTokens.Colors.OnSurface  // ✅ Gray 900 (primary text)
color = DesignTokens.Colors.OnSurfaceVariant  // ✅ Gray 500 (secondary text)
color = DesignTokens.Colors.OnSurfaceTertiary  // ✅ Gray 400 (tertiary text)

// Borders
BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)  // ✅ Gray 200

// Status colors
color = DesignTokens.Colors.Success  // ✅ Green 500
color = DesignTokens.Colors.Warning  // ✅ Orange 500
color = DesignTokens.Colors.Error  // ✅ Red 500
color = DesignTokens.Colors.Info  // ✅ Sky 500
```

### ❌ INCORRECT Colors

```kotlin
containerColor = Color.White  // ❌ Should be DesignTokens.Colors.White
```

---

## Files That Need Updates

### Priority 1: Critical Design Inconsistencies

1. **`ActivitiesScreen.kt`** ⚠️⚠️⚠️
   - Lines 99, 108, 114, 192-195, 203-207, 218, 236
   - All hardcoded values, missing border, wrong elevation

2. **`CustomersScreen.kt` (CustomerCard component)** ⚠️⚠️
   - Lines 680-715
   - Hardcoded values, missing border

3. **`DealsScreen.kt` (DealCard component)** ⚠️⚠️
   - Lines 252-296
   - Hardcoded values, missing border

### Already Correct ✅

1. **Dashboard `MetricCard`** - Perfect implementation
2. **Leads `MetricCard`** - Perfect implementation  
3. **Leads `LeadCard`** - Perfect implementation
4. **Customers `ResponsiveCustomerCard`** - Perfect implementation

---

## Quick Fix Checklist

For each screen/component, check:

- [ ] Card uses `DesignTokens.Elevation.Level1` or `Level2` (not `2.dp`)
- [ ] Card uses `DesignTokens.Colors.White` (not `Color.White`)
- [ ] Card uses `MaterialTheme.shapes.large` (not `RoundedCornerShape(12.dp)`)
- [ ] Card has `border = BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)`
- [ ] Padding uses `DesignTokens.Spacing.*` (not `16.dp`)
- [ ] All spacers use `DesignTokens.Spacing.*` (not `4.dp`, `8.dp`, etc.)
- [ ] FontWeight uses `DesignTokens.Typography.FontWeight*` (not `FontWeight.Bold`)
- [ ] Icon sizes use `DesignTokens.Heights.*` where applicable
- [ ] Shapes use `DesignTokens.Radius.*` or `MaterialTheme.shapes.*`

---

## DesignTokens Quick Reference

### Spacing
```kotlin
DesignTokens.Spacing.Space1  // 4.dp
DesignTokens.Spacing.Space2  // 8.dp
DesignTokens.Spacing.Space3  // 12.dp
DesignTokens.Spacing.Space4  // 16.dp
DesignTokens.Spacing.Space6  // 24.dp
DesignTokens.Spacing.Space8  // 32.dp
```

### Padding
```kotlin
DesignTokens.Padding.CardPaddingStandard     // 16.dp
DesignTokens.Padding.CardPaddingComfortable  // 20.dp
DesignTokens.Padding.CardPaddingSpacious     // 24.dp
```

### Elevation
```kotlin
DesignTokens.Elevation.Level1  // 1.dp (cards resting)
DesignTokens.Elevation.Level2  // 2.dp (cards pressed)
DesignTokens.Elevation.Level4  // 4.dp (navigation drawer)
```

### Radius
```kotlin
DesignTokens.Radius.Small      // 8.dp
DesignTokens.Radius.Medium     // 12.dp
DesignTokens.Radius.Large      // 16.dp
DesignTokens.Radius.ExtraLarge // 28.dp
```

### Typography
```kotlin
DesignTokens.Typography.FontWeightLight     // 300
DesignTokens.Typography.FontWeightNormal    // 400
DesignTokens.Typography.FontWeightMedium    // 500
DesignTokens.Typography.FontWeightSemiBold  // 600
DesignTokens.Typography.FontWeightBold      // 700
```

### Heights
```kotlin
DesignTokens.Heights.IconSm          // 24.dp
DesignTokens.Heights.IconMd          // 40.dp
DesignTokens.Heights.ImageThumbnail  // 48.dp
DesignTokens.Heights.AvatarMd        // 40.dp
```

---

## Example: Perfect Card Implementation

```kotlin
@Composable
fun PerfectCard(
    title: String,
    value: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(
            defaultElevation = DesignTokens.Elevation.Level1
        ),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.White
        ),
        shape = MaterialTheme.shapes.large,
        border = BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Padding.CardPaddingStandard),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Icon
            Surface(
                shape = RoundedCornerShape(DesignTokens.Radius.Small),
                color = DesignTokens.Colors.Primary.copy(alpha = 0.1f),
                modifier = Modifier.size(DesignTokens.Heights.ImageThumbnail)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = DesignTokens.Colors.Primary,
                        modifier = Modifier.size(DesignTokens.Heights.IconSm)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space4))
            
            // Content
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    fontWeight = DesignTokens.Typography.FontWeightSemiBold
                )
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space1))
                Text(
                    text = value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold,
                    color = DesignTokens.Colors.OnSurface
                )
            }
        }
    }
}
```

---

## Implementation Priority

### Immediate (High Priority)
1. ✅ Fix `ActivitiesScreen.kt` - Most inconsistent
2. ✅ Fix `CustomersScreen.kt` - CustomerCard component
3. ✅ Fix `DealsScreen.kt` - DealCard component

### Next Sprint (Medium Priority)
4. Audit all other screens for hardcoded values
5. Create reusable card components
6. Add UI tests for design consistency

### Nice to Have (Low Priority)
7. Add dark mode support
8. Create Figma/design documentation
9. Add visual regression tests


