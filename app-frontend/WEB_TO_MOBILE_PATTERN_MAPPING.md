# Web vs Mobile: Responsive Design Pattern Mapping

## 🎯 Direct Pattern Translations

This document shows the exact mapping between web-frontend (React/Chakra UI) patterns and mobile app (Kotlin/Jetpack Compose) patterns.

---

## 1. Responsive Spacing

### Web Frontend (Chakra UI)
```tsx
<Box p={{ base: 5, md: 6 }}>
  <VStack gap={{ base: 4, md: 5 }}>
    {content}
  </VStack>
</Box>
```

### Mobile App (Compose) ✅
```kotlin
Box(
    modifier = Modifier.padding(
        responsivePadding(
            compact = DesignTokens.Spacing.Space5,  // base
            medium = DesignTokens.Spacing.Space6    // md
        )
    )
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(
            responsiveSpacing(
                compact = DesignTokens.Spacing.Space4,  // base
                medium = DesignTokens.Spacing.Space5    // md
            )
        )
    ) {
        // content
    }
}
```

**Mapping:**
| Chakra UI | Compose | Value |
|-----------|---------|-------|
| `base` | `compact` | Phone |
| `md` | `medium` | Tablet |
| `lg` | `expanded` | Desktop |

---

## 2. Responsive Grid Layouts

### Web Frontend
```tsx
<SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
  {items.map(item => (
    <StatCard key={item.id} {...item} />
  ))}
</SimpleGrid>
```

### Mobile App ✅
```kotlin
// Option 1: Using StatsGrid (pre-configured)
StatsGrid(
    stats = listOf(
        StatData(...),
        StatData(...),
        StatData(...)
    )
)

// Option 2: Custom responsive grid
ResponsiveGrid(
    compactColumns = 1,   // base
    mediumColumns = 2,    // md
    expandedColumns = 3   // lg
) {
    items.forEach { item ->
        Box(modifier = Modifier.weight(1f)) {
            StatCard(item, modifier = Modifier.fillMaxWidth())
        }
    }
}
```

---

## 3. Stat Cards

### Web Frontend
```tsx
<StatCard 
  title="Total Customers"
  value="1,234"
  icon={<FiUsers />}
  change="+12%"
  iconBg="purple.100"
  iconColor="purple.600"
/>
```

### Mobile App ✅
```kotlin
StatCard(
    title = "TOTAL CUSTOMERS",
    value = "1,234",
    icon = {
        Icon(
            Icons.Default.People,
            contentDescription = null,
            tint = DesignTokens.Colors.Primary
        )
    },
    change = "+12%",
    isPositive = true
)
```

**Auto-includes:**
- ✅ Icon background with proper color
- ✅ Trending up/down indicator
- ✅ "vs last month" text
- ✅ Responsive padding
- ✅ Hover effect (on desktop)

---

## 4. Welcome Banner

### Web Frontend
```tsx
<Box
  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  borderRadius="2xl"
  p={{ base: 5, md: 6 }}
  color="white"
>
  <VStack align="start" gap={2}>
    <Text fontSize="md">Good Evening! 👋</Text>
    <Heading size={{ base: 'xl', md: '2xl' }}>
      Welcome to Your Dashboard
    </Heading>
    <Text>Track your sales pipeline...</Text>
  </VStack>
  
  <HStack gap={3}>
    <Button variant="outline">Analytics</Button>
    <Button bg="white" color="purple.600">New Deal</Button>
  </HStack>
</Box>
```

### Mobile App ✅
```kotlin
WelcomeBannerCard(
    greeting = "Good Evening",
    title = "Welcome to Your Dashboard",
    description = "Track your sales pipeline, manage customer relationships, and grow your business",
    onAnalyticsClick = { onNavigate("analytics") },
    onNewDealClick = { onNavigate("deals") }
)
```

**Features:**
- ✅ Gradient background (Primary color)
- ✅ Responsive padding
- ✅ Two action buttons
- ✅ Proper typography scale
- ✅ Rounded corners

---

## 5. Responsive Cards

### Web Frontend
```tsx
<Box
  bg="white"
  borderRadius="xl"
  boxShadow="sm"
  p={{ base: 5, md: 6 }}
  _hover={{ 
    boxShadow: 'md',
    transform: 'translateY(-2px)'
  }}
>
  {content}
</Box>
```

### Mobile App ✅
```kotlin
ResponsiveCard(
    elevation = DesignTokens.Elevation.Level2
) {
    // content - padding is automatic and responsive
}
```

**Auto-applies:**
- ✅ Responsive padding (16/20/24dp)
- ✅ Responsive spacing between children
- ✅ Elevation
- ✅ Rounded corners
- ✅ Surface color

---

## 6. Empty States

### Web Frontend
```tsx
<Box textAlign="center" py={12}>
  <Box w={16} h={16} bg="gray.100" borderRadius="full" mx="auto" mb={4}>
    <Icon as={FiSearchOff} />
  </Box>
  <Heading size="md">No customers found</Heading>
  <Text color="gray.600">Try adjusting your filters</Text>
</Box>
```

### Mobile App ✅
```kotlin
EmptyState(
    title = "No customers found",
    message = "Try adjusting your filters or add a new customer.",
    icon = {
        Icon(
            Icons.Default.SearchOff,
            contentDescription = null,
            modifier = Modifier.size(DesignTokens.Heights.IconXl),
            tint = DesignTokens.Colors.OnSurfaceVariant
        )
    },
    action = {
        ResponsivePrimaryButton(
            text = "Add Customer",
            onClick = { /* action */ }
        )
    }
)
```

---

## 7. Loading States

### Web Frontend
```tsx
<VStack gap={4} py={12}>
  <Spinner size="xl" color="purple.500" />
  <Text color="gray.600">Loading...</Text>
</VStack>
```

### Mobile App ✅
```kotlin
LoadingState(
    message = "Loading your customers..."
)
```

---

## 8. Error States

### Web Frontend
```tsx
<Box 
  textAlign="center" 
  py={12} 
  px={6}
  bg="red.50"
  borderRadius="xl"
>
  <Text fontSize="3xl">⚠️</Text>
  <Heading size="md" color="red.600">
    Failed to load data
  </Heading>
  <Text color="red.500">
    {error.message}
  </Text>
  <Button onClick={retry} colorScheme="red">
    Retry
  </Button>
</Box>
```

### Mobile App ✅
```kotlin
ErrorState(
    title = "Failed to load data",
    message = error.message,
    onRetry = { /* retry logic */ }
)
```

---

## 9. Responsive Tables/Lists

### Web Frontend
```tsx
<ResponsiveTable
  mobileView={
    <VStack gap={3}>
      {customers.map(c => (
        <CustomerCard key={c.id} customer={c} />
      ))}
    </VStack>
  }
>
  <Table>
    {/* Desktop table */}
  </Table>
</ResponsiveTable>
```

### Mobile App ✅
```kotlin
ResponsiveList(
    items = customers,
    compactView = { customer ->
        ResponsiveCard {
            // Mobile card view
            CustomerCardContent(customer)
        }
    },
    expandedView = { customers ->
        // Optional: Desktop table view
        CustomerTable(customers)
    }
)
```

---

## 10. Responsive Layout Changes

### Web Frontend
```tsx
<Flex 
  direction={{ base: 'column', md: 'row' }}
  align={{ base: 'start', md: 'center' }}
  gap={4}
>
  <VStack flex={1}>
    {/* Left content */}
  </VStack>
  <HStack>
    {/* Right actions */}
  </HStack>
</Flex>
```

### Mobile App ✅
```kotlin
val windowSize = getWindowSize()

when (windowSize) {
    WindowSize.COMPACT -> {
        // Mobile: Vertical layout
        Column {
            Column(modifier = Modifier.weight(1f)) {
                // Left content
            }
            Row {
                // Actions
            }
        }
    }
    else -> {
        // Tablet/Desktop: Horizontal layout
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                // Left content
            }
            Row {
                // Actions
            }
        }
    }
}
```

---

## 11. Conditional Visibility

### Web Frontend
```tsx
<Box display={{ base: 'none', lg: 'block' }}>
  {/* Desktop only */}
</Box>

<Box display={{ base: 'block', lg: 'none' }}>
  {/* Mobile only */}
</Box>
```

### Mobile App ✅
```kotlin
// Desktop only
if (!isCompactScreen()) {
    // Content
}

// Mobile only
if (isCompactScreen()) {
    // Content
}

// Or with when
when (getWindowSize()) {
    WindowSize.COMPACT -> {
        // Mobile content
    }
    else -> {
        // Desktop content
    }
}
```

---

## 12. Responsive Typography

### Web Frontend
```tsx
<Heading size={{ base: 'xl', md: '2xl' }}>
  Title
</Heading>

<Text fontSize={{ base: 'md', md: 'lg' }}>
  Description
</Text>
```

### Mobile App ✅
```kotlin
Text(
    text = "Title",
    style = responsiveValue(
        compact = MaterialTheme.typography.headlineMedium,
        medium = MaterialTheme.typography.headlineLarge
    ),
    fontWeight = DesignTokens.Typography.FontWeightBold
)

Text(
    text = "Description",
    style = responsiveValue(
        compact = MaterialTheme.typography.bodyMedium,
        medium = MaterialTheme.typography.bodyLarge
    )
)
```

---

## 13. Button Groups

### Web Frontend
```tsx
<HStack gap={3} width={{ base: 'full', md: 'auto' }}>
  <Button flex={{ base: 1, md: 'initial' }}>
    Analytics
  </Button>
  <Button flex={{ base: 1, md: 'initial' }}>
    New Deal
  </Button>
</HStack>
```

### Mobile App ✅
```kotlin
Row(
    modifier = if (isCompactScreen()) {
        Modifier.fillMaxWidth()
    } else {
        Modifier.wrapContentWidth()
    },
    horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
) {
    ResponsivePrimaryButton(
        text = "Analytics",
        onClick = { /* action */ },
        modifier = if (isCompactScreen()) {
            Modifier.weight(1f)
        } else {
            Modifier
        }
    )
    ResponsiveOutlinedButton(
        text = "New Deal",
        onClick = { /* action */ },
        modifier = if (isCompactScreen()) {
            Modifier.weight(1f)
        } else {
            Modifier
        }
    )
}
```

---

## 14. Search Bars

### Web Frontend
```tsx
<Input
  placeholder="Search customers..."
  size="lg"
  borderRadius="md"
/>
```

### Mobile App ✅
```kotlin
OutlinedTextField(
    value = searchQuery,
    onValueChange = { searchQuery = it },
    modifier = Modifier.fillMaxWidth(),
    placeholder = { 
        Text("Search customers...", style = MaterialTheme.typography.bodyMedium) 
    },
    leadingIcon = {
        Icon(Icons.Default.Search, null, tint = DesignTokens.Colors.OnSurfaceVariant)
    },
    trailingIcon = {
        if (searchQuery.isNotEmpty()) {
            IconButton(onClick = { searchQuery = "" }) {
                Icon(Icons.Default.Clear, null)
            }
        }
    },
    shape = RoundedCornerShape(DesignTokens.Radius.Medium),
    colors = OutlinedTextFieldDefaults.colors(
        focusedContainerColor = DesignTokens.Colors.Surface,
        unfocusedContainerColor = DesignTokens.Colors.Surface
    )
)
```

---

## 15. Status Badges

### Web Frontend
```tsx
<Badge 
  colorPalette={status === 'active' ? 'green' : 'red'}
  borderRadius="full"
>
  {status}
</Badge>
```

### Mobile App ✅
```kotlin
StatusBadge(
    text = status.name,
    color = when (status) {
        Status.ACTIVE -> DesignTokens.Colors.Success
        Status.INACTIVE -> DesignTokens.Colors.OnSurfaceVariant
        Status.PENDING -> DesignTokens.Colors.Warning
    }
)
```

---

## 📊 Complete Screen Example Comparison

### Web: CustomersPage.tsx
```tsx
export const CustomersPage = () => {
  return (
    <DashboardLayout title="Customers">
      <VStack gap={5} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl">Customers</Heading>
          <Text color="gray.600">Manage your customer relationships</Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
          <StatCard title="Total" value="1,234" icon={<FiUsers />} change="+12%" />
          <StatCard title="Active" value="856" icon={<FiCheckCircle />} change="+8%" />
          <StatCard title="Value" value="$450K" icon={<FiDollarSign />} change="+23%" />
        </SimpleGrid>

        {/* Search */}
        <Input placeholder="Search customers..." />

        {/* Table */}
        <CustomerTable customers={customers} />
      </VStack>
    </DashboardLayout>
  );
};
```

### Mobile: CustomersScreen.kt ✅
```kotlin
@Composable
fun CustomersScreen(onNavigate: (String) -> Unit, onBack: () -> Unit) {
    AppScaffoldWithDrawer(title = "Customers", ...) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(
                    responsivePadding(
                        compact = DesignTokens.Spacing.Space4,
                        medium = DesignTokens.Spacing.Space5
                    )
                ),
            verticalArrangement = Arrangement.spacedBy(
                responsiveSpacing(
                    compact = DesignTokens.Spacing.Space4,
                    medium = DesignTokens.Spacing.Space5
                )
            )
        ) {
            // Header
            Column {
                Text(
                    "Customers",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = DesignTokens.Typography.FontWeightBold
                )
                Text(
                    "Manage your customer relationships",
                    color = DesignTokens.Colors.OnSurfaceVariant
                )
            }

            // Stats (auto-responsive: 1/2/3 columns)
            StatsGrid(
                stats = listOf(
                    StatData("TOTAL", "1,234", { Icon(Icons.Default.People, null) }, "+12%", true),
                    StatData("ACTIVE", "856", { Icon(Icons.Default.CheckCircle, null) }, "+8%", true),
                    StatData("VALUE", "$450K", { Icon(Icons.Default.AttachMoney, null) }, "+23%", true)
                )
            )

            // Search
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search customers...") },
                modifier = Modifier.fillMaxWidth()
            )

            // List (auto-responsive: cards on mobile, table on desktop)
            ResponsiveList(
                items = customers,
                compactView = { customer -> CustomerCard(customer) }
            )
        }
    }
}
```

---

## 🎯 Key Takeaways

### What Maps 1:1
✅ Responsive spacing (`p={{ }}` → `responsivePadding()`)
✅ Grid layouts (`SimpleGrid` → `ResponsiveGrid` / `StatsGrid`)
✅ Stat cards (`StatCard` → `StatCard`)
✅ Empty/Loading/Error states
✅ Card components
✅ Design tokens (colors, spacing, typography)

### What's Different
- **Layouts**: Web uses `Flex`/`Stack`, Mobile uses `Row`/`Column`
- **Conditionals**: Web uses `display={{ }}`, Mobile uses `when(windowSize)`
- **Modifiers**: Web uses props, Mobile uses `Modifier` chain
- **Icons**: Web uses `react-icons`, Mobile uses `Material Icons`

### What's Better in Mobile
✅ Stronger type safety
✅ Compile-time checking
✅ More explicit state management
✅ Better performance (native)

---

## 📋 Migration Checklist

When converting a web component to mobile:

- [ ] Map breakpoints: `base` → `compact`, `md` → `medium`, `lg` → `expanded`
- [ ] Replace spacing props with `responsivePadding()` / `responsiveSpacing()`
- [ ] Use `StatsGrid` for stat cards
- [ ] Use `ResponsiveCard` for containers
- [ ] Use design tokens for all colors
- [ ] Add `EmptyState`, `LoadingState`, `ErrorState`
- [ ] Use `when(getWindowSize())` for conditional layouts
- [ ] Replace `Flex` with `Row`/`Column`
- [ ] Replace `Stack` with `Column`/`Row`
- [ ] Use Material Icons instead of react-icons
- [ ] Test on all screen sizes (compact, medium, expanded)

---

## 🚀 You're Ready!

With these patterns, you can now convert any web-frontend screen to mobile using the responsive components. The patterns are consistent, predictable, and follow the same design philosophy.

**Next step:** Pick a screen from `SCREEN_BY_SCREEN_RESPONSIVE_UPDATES.md` and apply these patterns!
