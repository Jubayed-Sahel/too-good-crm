# Responsive Development Quick Reference

## For Developers: Creating New Screens

This guide shows you **exactly how to build new screens** that match the web-frontend's responsive design.

---

## 1. Screen Template

Every screen should follow this structure:

```kotlin
@Composable
fun YourScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    var activeMode by remember { mutableStateOf(UserSession.activeMode) }

    AppScaffoldWithDrawer(
        title = "Screen Title",
        activeMode = activeMode,
        onModeChanged = { newMode ->
            activeMode = newMode
            UserSession.activeMode = newMode
            // Navigate based on mode
            if (newMode == ActiveMode.CLIENT) {
                onNavigate("client-dashboard")
            } else {
                onNavigate("dashboard")
            }
        },
        onNavigate = onNavigate,
        onLogout = onBack
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space4,   // 16dp mobile
                        medium = DesignTokens.Spacing.Space5,    // 20dp tablet
                        expanded = DesignTokens.Spacing.Space6   // 24dp desktop
                    )
                ),
            verticalArrangement = Arrangement.spacedBy(
                responsiveSpacing(
                    compact = DesignTokens.Spacing.Space4,   // 16dp mobile
                    medium = DesignTokens.Spacing.Space5     // 20dp tablet+
                )
            )
        ) {
            // 1. Header Section
            PageHeader(
                title = "Screen Title",
                description = "Brief description of what this screen does"
            )

            // 2. Stats Grid (if needed)
            StatsGrid(stats = yourStatsData)

            // 3. Search/Filters (if needed)
            SearchBar(...)

            // 4. Main Content
            YourContent()
        }
    }
}
```

---

## 2. Common Components Usage

### Page Header
```kotlin
@Composable
fun PageHeader(title: String, description: String) {
    Column(
        verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = DesignTokens.Typography.FontWeightBold,
            color = DesignTokens.Colors.OnSurface
        )
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = DesignTokens.Colors.OnSurfaceVariant
        )
    }
}
```

### Stats Grid
```kotlin
StatsGrid(
    stats = listOf(
        StatData(
            title = "TOTAL ITEMS",
            value = "142",
            icon = { Icon(Icons.Default.Dashboard, null, tint = DesignTokens.Colors.Primary) },
            change = "+12%",
            isPositive = true
        ),
        StatData(
            title = "ACTIVE",
            value = "128",
            icon = { Icon(Icons.Default.CheckCircle, null, tint = DesignTokens.Colors.Success) },
            change = "+8%",
            isPositive = true
        ),
        StatData(
            title = "REVENUE",
            value = "$2.4M",
            icon = { Icon(Icons.Default.AttachMoney, null, tint = DesignTokens.Colors.Secondary) },
            change = "+15%",
            isPositive = true
        )
    )
)
```

### Search Bar
```kotlin
OutlinedTextField(
    value = searchQuery,
    onValueChange = { searchQuery = it },
    modifier = Modifier.fillMaxWidth(),
    placeholder = {
        Text(
            "Search items...",
            style = MaterialTheme.typography.bodyMedium
        )
    },
    leadingIcon = {
        Icon(
            Icons.Default.Search,
            contentDescription = null,
            tint = DesignTokens.Colors.OnSurfaceVariant
        )
    },
    trailingIcon = {
        if (searchQuery.isNotEmpty()) {
            IconButton(onClick = { searchQuery = "" }) {
                Icon(
                    Icons.Default.Clear,
                    contentDescription = "Clear",
                    tint = DesignTokens.Colors.OnSurfaceVariant
                )
            }
        }
    },
    shape = RoundedCornerShape(DesignTokens.Radius.Medium),
    colors = OutlinedTextFieldDefaults.colors(
        focusedContainerColor = DesignTokens.Colors.Surface,
        unfocusedContainerColor = DesignTokens.Colors.Surface,
        focusedBorderColor = DesignTokens.Colors.Primary,
        unfocusedBorderColor = DesignTokens.Colors.Outline
    )
)
```

### Responsive Card
```kotlin
ResponsiveCard(
    modifier = Modifier.fillMaxWidth()
) {
    // Your card content
    Text(
        text = "Card Title",
        style = MaterialTheme.typography.titleMedium,
        fontWeight = DesignTokens.Typography.FontWeightSemiBold,
        color = DesignTokens.Colors.OnSurface
    )
    Text(
        text = "Card description or content",
        style = MaterialTheme.typography.bodyMedium,
        color = DesignTokens.Colors.OnSurfaceVariant
    )
}
```

### Empty State
```kotlin
EmptyState(
    title = "No items found",
    message = "Try adjusting your search or add a new item.",
    icon = {
        Icon(
            Icons.Default.SearchOff,
            contentDescription = null,
            modifier = Modifier.size(DesignTokens.Heights.IconXl),
            tint = DesignTokens.Colors.OnSurfaceVariant
        )
    }
)
```

### Status Badge
```kotlin
StatusBadge(
    text = "Active",
    color = DesignTokens.Colors.Success
)

// Other status options:
// "Pending" → DesignTokens.Colors.Warning
// "Inactive" → DesignTokens.Colors.OnSurfaceVariant
// "Error" → DesignTokens.Colors.Error
```

---

## 3. Color Usage Rules

### ✅ DO: Always use DesignTokens
```kotlin
// ✅ CORRECT
color = DesignTokens.Colors.Primary
containerColor = DesignTokens.Colors.Surface
tint = DesignTokens.Colors.Success
```

### ❌ DON'T: Use hardcoded colors
```kotlin
// ❌ WRONG
color = Color(0xFF8B5CF6)
containerColor = Color.White
tint = Color(0xFF10B981)
```

### Color Reference Table
| Use Case | DesignToken | When to Use |
|----------|-------------|-------------|
| Primary actions | `Primary` | Buttons, primary icons, vendor mode |
| Client mode | `Info` | Client-specific UI, info messages |
| Success states | `Success` | Positive changes, active status |
| Errors | `Error` | Negative changes, error messages |
| Warnings | `Warning` | Pending states, caution messages |
| Text (main) | `OnSurface` | Primary text content |
| Text (secondary) | `OnSurfaceVariant` | Descriptions, labels |
| Backgrounds | `Background` | Screen background |
| Cards | `Surface` | Card backgrounds |
| Borders | `Outline` | TextField borders, dividers |

---

## 4. Responsive Spacing Patterns

### Padding (Around Containers)
```kotlin
// Use responsivePadding() for container padding
.padding(
    responsivePadding(
        compact = DesignTokens.Spacing.Space4,   // Mobile: 16dp
        medium = DesignTokens.Spacing.Space5,    // Tablet: 20dp
        expanded = DesignTokens.Spacing.Space6   // Desktop: 24dp
    )
)
```

### Spacing (Between Items)
```kotlin
// Use responsiveSpacing() for gaps between elements
verticalArrangement = Arrangement.spacedBy(
    responsiveSpacing(
        compact = DesignTokens.Spacing.Space3,   // Mobile: 12dp
        medium = DesignTokens.Spacing.Space4     // Tablet+: 16dp
    )
)
```

### Fixed Spacing (For Small Gaps)
```kotlin
// Use fixed spacing for small, consistent gaps
Column(
    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)  // 8dp everywhere
)
```

---

## 5. Grid Layouts

### Stats Grid (Responsive Columns)
The `StatsGrid` component automatically adjusts columns:
- **Mobile (< 600dp):** 1 column
- **Tablet (600-840dp):** 2 columns
- **Desktop (> 840dp):** 3 columns

```kotlin
StatsGrid(
    stats = listOf(
        StatData(...),
        StatData(...),
        StatData(...)
    )
)
```

### Custom Grid
If you need a custom grid:
```kotlin
val windowSize = getWindowSize()
val columns = when (windowSize) {
    WindowSize.COMPACT -> 1
    WindowSize.MEDIUM -> 2
    WindowSize.EXPANDED -> 3
}

LazyVerticalGrid(
    columns = GridCells.Fixed(columns),
    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4),
    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
) {
    items(yourList) { item ->
        YourCard(item)
    }
}
```

---

## 6. List Layouts

### Simple List
```kotlin
LazyColumn(
    verticalArrangement = Arrangement.spacedBy(
        responsiveSpacing(
            compact = DesignTokens.Spacing.Space3,
            medium = DesignTokens.Spacing.Space4
        )
    )
) {
    items(yourList) { item ->
        ResponsiveCard {
            // Item content
        }
    }
}
```

### List with Empty State
```kotlin
if (filteredList.isEmpty()) {
    EmptyState(
        title = "No items found",
        message = "Try adjusting your search.",
        icon = { Icon(Icons.Default.SearchOff, null) }
    )
} else {
    LazyColumn(...) {
        items(filteredList) { item ->
            YourCard(item)
        }
    }
}
```

---

## 7. Typography Patterns

### Headers
```kotlin
// Page Title
Text(
    text = "Page Title",
    style = MaterialTheme.typography.headlineMedium,
    fontWeight = DesignTokens.Typography.FontWeightBold,
    color = DesignTokens.Colors.OnSurface
)

// Section Title
Text(
    text = "Section Title",
    style = MaterialTheme.typography.titleLarge,
    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
    color = DesignTokens.Colors.OnSurface
)

// Card Title
Text(
    text = "Card Title",
    style = MaterialTheme.typography.titleMedium,
    fontWeight = DesignTokens.Typography.FontWeightSemiBold,
    color = DesignTokens.Colors.OnSurface
)
```

### Body Text
```kotlin
// Description
Text(
    text = "Description or subtitle text",
    style = MaterialTheme.typography.bodyMedium,
    color = DesignTokens.Colors.OnSurfaceVariant
)

// Small Text / Labels
Text(
    text = "Label or metadata",
    style = MaterialTheme.typography.bodySmall,
    color = DesignTokens.Colors.OnSurfaceVariant
)
```

---

## 8. Common Patterns Cheat Sheet

### Filter Chips
```kotlin
Row(
    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
) {
    FilterChip(
        selected = filterStatus == Status.ALL,
        onClick = { filterStatus = Status.ALL },
        label = { Text("All") },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = DesignTokens.Colors.Primary,
            selectedLabelColor = DesignTokens.Colors.OnPrimary
        )
    )
    FilterChip(
        selected = filterStatus == Status.ACTIVE,
        onClick = { filterStatus = Status.ACTIVE },
        label = { Text("Active") }
    )
}
```

### Action Buttons
```kotlin
Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
) {
    // Primary Action
    Button(
        onClick = { /* action */ },
        modifier = Modifier.weight(1f),
        colors = ButtonDefaults.buttonColors(
            containerColor = DesignTokens.Colors.Primary,
            contentColor = DesignTokens.Colors.OnPrimary
        )
    ) {
        Icon(Icons.Default.Add, null)
        Spacer(Modifier.width(DesignTokens.Spacing.Space2))
        Text("Add New")
    }

    // Secondary Action
    OutlinedButton(
        onClick = { /* action */ },
        modifier = Modifier.weight(1f)
    ) {
        Icon(Icons.Default.FileDownload, null)
        Spacer(Modifier.width(DesignTokens.Spacing.Space2))
        Text("Export")
    }
}
```

### Avatar with Initial
```kotlin
Surface(
    modifier = Modifier.size(DesignTokens.Heights.AvatarMd),
    shape = CircleShape,
    color = DesignTokens.Colors.PrimaryContainer
) {
    Box(contentAlignment = Alignment.Center) {
        Text(
            text = name.take(1).uppercase(),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = DesignTokens.Typography.FontWeightBold,
            color = DesignTokens.Colors.Primary
        )
    }
}
```

### Icon with Background
```kotlin
Surface(
    shape = RoundedCornerShape(DesignTokens.Radius.Medium),
    color = DesignTokens.Colors.SecondaryContainer,
    modifier = Modifier.size(DesignTokens.Heights.IconMd)
) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.fillMaxSize()
    ) {
        Icon(
            Icons.Default.Dashboard,
            contentDescription = null,
            tint = DesignTokens.Colors.Secondary
        )
    }
}
```

---

## 9. Testing Your Screen

### Visual Checklist
- [ ] Screen uses `responsivePadding()` for main container
- [ ] Items have `responsiveSpacing()` between them
- [ ] All colors use `DesignTokens.Colors.*`
- [ ] Typography uses `MaterialTheme.typography.*`
- [ ] Cards use `ResponsiveCard` component
- [ ] Stats use `StatsGrid` component
- [ ] Empty states use `EmptyState` component
- [ ] Status indicators use `StatusBadge` component
- [ ] Search bars follow the standard pattern

### Responsive Checklist
- [ ] Test on mobile size (< 600dp)
- [ ] Test on tablet size (600-840dp)
- [ ] Test on large tablet/desktop (> 840dp)
- [ ] Stats grid shows correct number of columns
- [ ] Padding increases on larger screens
- [ ] Spacing feels consistent at all sizes

---

## 10. Quick Reference: Import Statements

```kotlin
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

// Your app imports
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession
import too.good.crm.ui.components.*
import too.good.crm.ui.theme.DesignTokens
import too.good.crm.ui.utils.*
```

---

## Summary

**To create a responsive screen matching web-frontend:**

1. Use `AppScaffoldWithDrawer` as the root
2. Wrap content in `Column` with `responsivePadding()` and `responsiveSpacing()`
3. Add `PageHeader` for title and description
4. Use `StatsGrid` for metrics (auto-responsive)
5. Use `ResponsiveCard` for all cards
6. Use `DesignTokens.Colors.*` for ALL colors
7. Use `MaterialTheme.typography.*` for text
8. Use `EmptyState` when lists are empty
9. Follow the patterns in `CustomersScreen.kt` as reference

**Key Files to Reference:**
- `CustomersScreen.kt` - Perfect example of responsive screen
- `StyledCard.kt` - All card component variants
- `ResponsiveGrid.kt` - Stats grid implementation
- `DesignTokens.kt` - All colors, spacing, typography

---

**Need help?** Check existing screens in `features/` folder for real-world examples!
