# Responsive Design Quick Reference

## 🎯 Cheat Sheet for Mobile App Responsive Components

---

## Window Size Detection

```kotlin
val windowSize = getWindowSize()

when (windowSize) {
    WindowSize.COMPACT -> { /* Phone (< 600dp) */ }
    WindowSize.MEDIUM -> { /* Tablet Portrait (600-840dp) */ }
    WindowSize.EXPANDED -> { /* Tablet Landscape (> 840dp) */ }
}

// Or use helpers
if (isCompactScreen()) { /* Mobile only */ }
if (isTabletOrLarger()) { /* Tablet+ */ }
```

---

## Responsive Spacing

```kotlin
// Padding
modifier = Modifier.padding(
    responsivePadding(
        compact = 16.dp,
        medium = 20.dp,
        expanded = 24.dp
    )
)

// Spacing between items
verticalArrangement = Arrangement.spacedBy(
    responsiveSpacing(
        compact = DesignTokens.Spacing.Space4,
        medium = DesignTokens.Spacing.Space5
    )
)
```

---

## Responsive Cards

```kotlin
// Basic responsive card
ResponsiveCard {
    Text("Content adapts padding automatically")
}

// Stat card (like web-frontend)
StatCard(
    title = "TOTAL CUSTOMERS",
    value = "1,234",
    icon = { Icon(Icons.Default.People, null) },
    change = "+12%",
    isPositive = true
)

// Welcome banner
WelcomeBannerCard(
    greeting = "Good Evening",
    title = "Welcome",
    onAnalyticsClick = { },
    onNewDealClick = { }
)
```

---

## Responsive Grids

```kotlin
// Auto-adaptive grid
ResponsiveGrid(
    compactColumns = 1,
    mediumColumns = 2,
    expandedColumns = 3
) {
    items.forEach { item ->
        ItemCard(item, modifier = Modifier.weight(1f))
    }
}

// Stats grid (pre-configured)
StatsGrid(
    stats = listOf(
        StatData("Title", "Value", { Icon(...) }, "+12%", true)
    )
)
```

---

## Responsive Lists

```kotlin
// Adaptive list (card on mobile, table on tablet)
ResponsiveList(
    items = customers,
    compactView = { customer ->
        CustomerCard(customer)  // Mobile: Card
    },
    expandedView = { customers ->
        CustomerTable(customers)  // Tablet: Table
    }
)
```

---

## State Components

```kotlin
// Empty state
EmptyState(
    title = "No items found",
    message = "Try adjusting your filters",
    icon = { Icon(Icons.Default.Search, null) },
    action = { Button(...) }
)

// Loading state
LoadingState(message = "Loading customers...")

// Error state
ErrorState(
    title = "Something went wrong",
    message = error.message,
    onRetry = { retry() }
)
```

---

## Responsive Buttons

```kotlin
// Primary button with icon
ResponsivePrimaryButton(
    text = "Create Deal",
    onClick = { },
    icon = { Icon(Icons.Default.Add, null) }
)

// Outlined button
ResponsiveOutlinedButton(
    text = "Cancel",
    onClick = { },
    icon = { Icon(Icons.Default.Close, null) }
)

// Text button
ResponsiveTextButton(
    text = "View All",
    onClick = { }
)
```

---

## Common Patterns

### Dashboard Layout
```kotlin
Column(
    modifier = Modifier
        .padding(responsivePadding(
            compact = DesignTokens.Spacing.Space4,
            medium = DesignTokens.Spacing.Space5,
            expanded = DesignTokens.Spacing.Space6
        )),
    verticalArrangement = Arrangement.spacedBy(
        responsiveSpacing(
            compact = DesignTokens.Spacing.Space4,
            medium = DesignTokens.Spacing.Space5
        )
    )
) {
    WelcomeBannerCard(...)
    StatsGrid(stats = ...)
    ResponsiveCard { /* Recent activity */ }
}
```

### List Screen
```kotlin
ResponsiveList(
    items = items,
    compactView = { ItemCard(it) },
    expandedView = { ItemTable(it) }
)
```

### Detail Screen
```kotlin
val windowSize = getWindowSize()

when (windowSize) {
    WindowSize.COMPACT -> {
        Column {
            HeaderSection()
            DetailsSection()
            ActionsSection()
        }
    }
    else -> {
        Row {
            Column(Modifier.weight(2f)) {
                HeaderSection()
                DetailsSection()
            }
            Column(Modifier.weight(1f)) {
                ActionsSection()
            }
        }
    }
}
```

---

## Design Tokens Quick Access

```kotlin
// Colors
DesignTokens.Colors.Primary
DesignTokens.Colors.Success
DesignTokens.Colors.Error

// Spacing
DesignTokens.Spacing.Space4  // 16dp
DesignTokens.Spacing.Space5  // 20dp
DesignTokens.Spacing.Space6  // 24dp

// Typography
MaterialTheme.typography.titleLarge
MaterialTheme.typography.bodyMedium

// Elevation
DesignTokens.Elevation.Level1
DesignTokens.Elevation.Level2

// Radius
DesignTokens.Radius.Medium  // 12dp
DesignTokens.Radius.Large   // 16dp
```

---

## Migration Examples

### Before (Fixed)
```kotlin
Card(
    modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp)
) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Title")
        Spacer(modifier = Modifier.height(8.dp))
        Text("Content")
    }
}
```

### After (Responsive)
```kotlin
ResponsiveCard {
    Text(
        "Title",
        style = MaterialTheme.typography.titleMedium
    )
    Text(
        "Content",
        style = MaterialTheme.typography.bodyMedium
    )
}
// Spacing and padding adapt automatically!
```

---

## Testing Checklist

- [ ] Test on phone (< 600dp)
- [ ] Test on tablet portrait (600-840dp)
- [ ] Test on tablet landscape (> 840dp)
- [ ] Test orientation changes
- [ ] Verify touch targets (48dp minimum)
- [ ] Check text overflow/ellipsis
- [ ] Verify scrolling behavior

---

## Import Statements

```kotlin
import too.good.crm.ui.components.*
import too.good.crm.ui.utils.*
import too.good.crm.ui.theme.DesignTokens
```

---

## Pro Tips

1. **Always use responsive spacing** instead of fixed dp values
2. **Leverage design tokens** for consistency
3. **Test on multiple screen sizes** during development
4. **Use window size helpers** for conditional layouts
5. **Prefer responsive components** over manual padding
6. **Check touch targets** (minimum 48dp)
7. **Use built-in state components** (Empty, Loading, Error)

---

## Need Help?

- Full Analysis: `MOBILE_APP_RESPONSIVE_DESIGN_ANALYSIS.md`
- API Reference: `MOBILE_RESPONSIVE_IMPLEMENTATION_COMPLETE.md`
- Example: `ResponsiveDashboardScreen.kt`
