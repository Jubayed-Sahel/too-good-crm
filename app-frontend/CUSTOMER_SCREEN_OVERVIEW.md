# 📱 Customer Screen Overview

## 🎨 **Visual Layout**

The Customer screen is a comprehensive view for managing customers with the following structure:

```
┌─────────────────────────────────────────┐
│  [☰]  Customers              [Profile]  │ ← App Bar with Drawer
├─────────────────────────────────────────┤
│                                         │
│  Customers                              │ ← Header
│  Manage your customer relationships...  │ ← Subtitle
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ TOTAL    │ │ ACTIVE   │ │ TOTAL    ││ ← Stats Cards (3)
│  │ CUSTOMERS│ │          │ │ VALUE    ││
│  │   25     │ │   18     │ │  $125K   ││
│  │  +12%    │ │  +8%     │ │  +23%    ││
│  └──────────┘ └──────────┘ └──────────┘│
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🔍 Search customers...        [X] │ │ ← Search Bar
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [A]  John Doe                    │ │ ← Customer Card 1
│  │       Acme Corporation            │ │
│  │       john@acme.com               │ │
│  │                    [Active] $50K  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [J]  Jane Smith                  │ │ ← Customer Card 2
│  │       Tech Solutions              │ │
│  │       jane@tech.com               │ │
│  │                    [Active] $30K  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [B]  Bob Johnson                 │ │ ← Customer Card 3
│  │       Global Inc                  │ │
│  │       bob@global.com              │ │
│  │                    [Pending] $20K │ │
│  └───────────────────────────────────┘ │
│                                         │
│                                         │
│                                    [+]  │ ← Floating Action Button
└─────────────────────────────────────────┘
```

---

## 📋 **Screen Components**

### 1. **Header Section** (Lines 178-207)
- **Title**: "Customers"
- **Subtitle**: "Manage your customer relationships and track activity"
- **Loading Indicator**: Shows spinner when loading

### 2. **Error Banner** (Lines 209-236)
- **Red background** with error message
- **Dismissible** with X button
- **Only shows when error exists**

### 3. **Stats Grid** (Lines 238-287)
Three stat cards showing:
- **Total Customers**: Count with percentage change
- **Active Customers**: Count of active status
- **Total Value**: Sum of all customer values

### 4. **Search Bar** (Lines 289-325)
- **Search icon** on left
- **Clear button** (X) when text entered
- **Filters by**: Name, Company, Email

### 5. **Customer List** (Lines 327-373)
- **Loading State**: Shows spinner + "Loading customers..."
- **Empty State**: Shows "No customers found" message
- **Customer Cards**: Scrollable list of customer cards

### 6. **Floating Action Button** (Lines 109-119)
- **Purple + button** in bottom right
- **Opens** Create Customer Dialog

---

## 🎨 **Customer Card Design**

Each customer card shows:

```
┌─────────────────────────────────────────┐
│  [A]  Customer Name                     │
│       Company Name                      │
│       customer@email.com                │
│                          [Active] $50K  │
└─────────────────────────────────────────┘
```

**Left Side**:
- **Avatar Circle**: First letter of name (e.g., "J" for John)
- **Customer Name**: Bold, large text
- **Company Name**: Medium text, gray
- **Email**: Small text, gray

**Right Side**:
- **Status Badge**: Color-coded (Active/Inactive/Pending)
- **Total Value**: Formatted currency (e.g., "$50,000")

---

## 🎯 **Features**

### ✅ **Implemented**:
- ✅ View all customers
- ✅ Search customers (name, company, email)
- ✅ Filter by status (Active/Inactive/Pending)
- ✅ View customer stats
- ✅ Create new customer (FAB button)
- ✅ Loading states
- ✅ Error handling
- ✅ Empty states
- ✅ Responsive design

### ⏳ **To Be Added**:
- ⏳ Click customer card → View details
- ⏳ Edit customer
- ⏳ Delete customer
- ⏳ Filter dropdown (status filter)
- ⏳ Sort options
- ⏳ Pull to refresh

---

## 🔧 **Key Functions**

### State Management:
```kotlin
val uiState by viewModel.uiState.collectAsState()
// Contains:
// - customers: List<Customer>
// - isLoading: Boolean
// - error: String?
// - showAddCustomerDialog: Boolean
// - isCreatingCustomer: Boolean
// - successMessage: String?
```

### Search & Filter:
```kotlin
val filteredCustomers = uiState.customers.filter { customer ->
    val matchesSearch = searchQuery.isEmpty() ||
        customer.name.contains(searchQuery, ignoreCase = true) ||
        customer.company.contains(searchQuery, ignoreCase = true) ||
        customer.email.contains(searchQuery, ignoreCase = true)
    val matchesFilter = filterStatus == null || customer.status == filterStatus
    matchesSearch && matchesFilter
}
```

### Create Customer:
```kotlin
FloatingActionButton(
    onClick = { viewModel.showAddCustomerDialog() }
) {
    Icon(Icons.Default.Add, "Add Customer")
}
```

---

## 🎨 **Color Scheme**

- **Primary**: Purple (buttons, accents)
- **Success**: Green (active status)
- **Warning**: Orange (pending status)
- **Error**: Red (error messages)
- **Surface**: White (cards, background)
- **OnSurface**: Dark gray (text)

---

## 📱 **Responsive Design**

The screen adapts to different screen sizes:

- **Compact** (phones): 1 column stats, smaller padding
- **Medium** (tablets): 2-3 column stats, medium padding
- **Expanded** (large tablets): 3 column stats, larger padding

---

## 🔄 **User Flow**

1. **User opens Customers screen**
   - Shows loading spinner
   - Fetches customers from backend

2. **Customers load**
   - Stats cards update
   - Customer list displays

3. **User searches**
   - Types in search bar
   - List filters in real-time

4. **User creates customer**
   - Clicks FAB (+)
   - Dialog opens
   - Fills form
   - Submits
   - List refreshes

5. **Error occurs**
   - Red banner appears
   - User can dismiss

---

## 📊 **Data Flow**

```
ViewModel
    ↓
Repository
    ↓
API Service
    ↓
Backend API
    ↓
Response
    ↓
Repository (parse)
    ↓
ViewModel (convert to UI model)
    ↓
UI State
    ↓
Screen (display)
```

---

## 🎯 **Status Badge Colors**

| Status | Color | Badge Text |
|--------|-------|------------|
| Active | Green | "Active" |
| Inactive | Gray | "Inactive" |
| Pending | Orange | "Pending" |

---

## 💡 **Code Highlights**

### Customer Card Component:
```kotlin
@Composable
fun ResponsiveCustomerCard(customer: Customer) {
    ResponsiveCard(
        modifier = Modifier.clickable { /* Navigate */ }
    ) {
        Row {
            // Avatar + Info (left)
            // Status + Value (right)
        }
    }
}
```

### Stats Grid:
```kotlin
StatsGrid(
    stats = listOf(
        StatData("TOTAL CUSTOMERS", count, icon, change),
        StatData("ACTIVE", activeCount, icon, change),
        StatData("TOTAL VALUE", value, icon, change)
    )
)
```

---

## 🚀 **Next Steps**

To enhance the customer screen:

1. **Add Customer Detail Screen**
   - Click card → Navigate to detail
   - Show full customer information
   - Edit/Delete actions

2. **Add Filter Dropdown**
   - Status filter (All/Active/Inactive/Pending)
   - Sort options (Name/Value/Date)

3. **Add Pull to Refresh**
   - Swipe down to refresh list

4. **Add Pagination**
   - Load more customers on scroll

5. **Add Bulk Actions**
   - Select multiple customers
   - Bulk delete/export

---

**The Customer screen is fully functional and ready to use!** 🎉

