# Lead Filter Quick Reference

## 🎯 Filter Types at a Glance

### 1. Lead Score Range
- **Type:** Range slider
- **Range:** 0-100
- **Steps:** 5-point increments (20 steps)
- **Visual:** Real-time badge showing "MIN - MAX"
- **Logic:** Client-side filtering
- **Example:** `leadScore >= 30 AND leadScore <= 80`

### 2. Qualification Status
- **Type:** Single-select FilterChips
- **Options:** 8 choices
  - New
  - Contacted
  - Qualified
  - Unqualified
  - Proposal
  - Negotiation
  - Converted
  - Lost
- **Visual:** Purple chip with checkmark when selected
- **Logic:** Server-side filtering
- **Example:** `qualification_status = "qualified"`

### 3. Status (Multi-Select)
- **Type:** Multi-select FilterChips
- **Options:** 3 choices
  - Active
  - Inactive
  - Pending
- **Visual:** Multiple purple chips can be selected
- **Logic:** Client-side filtering (OR)
- **Example:** `status IN ["active", "pending"]`

### 4. Source (Multi-Select)
- **Type:** Multi-select FilterChips (3-column grid)
- **Options:** 8 choices
  - Website
  - Referral
  - Cold Call
  - Email
  - Social Media
  - Advertisement
  - Event
  - Other
- **Visual:** Multiple purple chips, 3 per row
- **Logic:** Client-side filtering (OR)
- **Example:** `source IN ["website", "email", "referral"]`

### 5. Created Date Range
- **Type:** Date picker cards (From/To)
- **Visual:** Two cards side-by-side with calendar icons
- **Interaction:** Opens Material DatePicker dialog
- **Format:** MMM dd, yyyy (e.g., "Nov 29, 2025")
- **Logic:** Client-side filtering
- **Example:** `createdAt >= "2025-10-01" AND createdAt <= "2025-11-29"`

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────┐
│           LeadsScreen.kt                    │
│  ┌───────────────────────────────────────┐  │
│  │  Search Bar + Filter Button           │  │
│  │  [  Search...  ] [🔽 Badge: 3]       │  │
│  ├───────────────────────────────────────┤  │
│  │  Active Filters Row (when active)     │  │
│  │  ℹ️ 3 filter(s) active  [Clear All]   │  │
│  ├───────────────────────────────────────┤  │
│  │  Lead Cards (filtered results)        │  │
│  │  - Lead 1                              │  │
│  │  - Lead 2                              │  │
│  │  - Lead 3                              │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    │ Tap Filter Button
                    ▼
┌─────────────────────────────────────────────┐
│        FilterDrawer.kt (Bottom Sheet)       │
│  ┌───────────────────────────────────────┐  │
│  │  ═══ Drag Handle ═══                  │  │
│  │  Filter Leads          [Reset All]    │  │
│  │  ─────────────────────────────────    │  │
│  │                                        │  │
│  │  🎯 Lead Score Range                  │  │
│  │     [0 ▬▬▬●━━━━●▬▬▬ 100]             │  │
│  │                                        │  │
│  │  📊 Qualification Status              │  │
│  │     [New] [Contacted] [Qualified]...  │  │
│  │                                        │  │
│  │  📌 Status                             │  │
│  │     [Active] [Inactive] [Pending]     │  │
│  │                                        │  │
│  │  📍 Source                             │  │
│  │     [Website] [Referral] [Cold Call]  │  │
│  │     [Email] [Social] [Advert]...      │  │
│  │                                        │  │
│  │  📅 Created Date Range                │  │
│  │     [From: Nov 01, 25] [To: Nov 29]   │  │
│  │                                        │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  🔽 Apply Filters                │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    │ Apply Filters
                    ▼
┌─────────────────────────────────────────────┐
│          LeadsViewModel.kt                  │
│  ┌───────────────────────────────────────┐  │
│  │  applyFilters()                        │  │
│  │  - Update FilterState                  │  │
│  │  - Call Repository                     │  │
│  │  - Apply client-side filters           │  │
│  │  - Update leads list                   │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          LeadRepository.kt                  │
│  ┌───────────────────────────────────────┐  │
│  │  getLeads(status, source, qual...)     │  │
│  │  - Build API query                     │  │
│  │  - Call backend                        │  │
│  │  - Return NetworkResult                │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    │
                    ▼
        Backend API: /api/leads/?status=...
```

---

## 🔄 Data Flow

### 1. Opening Filter Drawer
```
User taps filter button
    → showFilterDrawer = true
    → FilterDrawer renders with currentFilters
```

### 2. Changing Filter Values
```
User interacts with filter controls
    → Local state updates (e.g., leadScoreRange)
    → UI updates immediately (visual feedback)
    → No API call yet (pending Apply)
```

### 3. Applying Filters
```
User taps "Apply Filters"
    → Create LeadFilters object
    → Convert LocalDate to ISO strings
    → Call viewModel.applyFilters(...)
    → showFilterDrawer = false (dismiss drawer)
    → ViewModel updates FilterState
    → Repository called with filter params
    → Server-side filters applied
    → Results returned
    → Client-side filters applied (score, multi-select, dates)
    → Filtered leads displayed
    → Filter button turns purple
    → Badge shows filter count
    → Active filter row appears
```

### 4. Clearing Filters
```
User taps "Clear All"
    → currentFilters = LeadFilters() (default)
    → viewModel.clearFilters()
    → FilterState reset
    → Repository called with no filters
    → All leads displayed
    → Filter button turns gray
    → Badge removed
    → Active filter row hidden
```

---

## 💾 State Management

### LeadFilters (UI State)
```kotlin
data class LeadFilters(
    val leadScoreRange: ClosedFloatingPointRange<Float> = 0f..100f,
    val statuses: Set<String> = emptySet(),
    val sources: Set<String> = emptySet(),
    val dateRange: Pair<LocalDate?, LocalDate?> = null to null,
    val qualificationStatus: String? = null
)
```

### FilterState (ViewModel State)
```kotlin
data class FilterState(
    val statuses: Set<String> = emptySet(),
    val sources: Set<String> = emptySet(),
    val leadScoreMin: Int? = null,
    val leadScoreMax: Int? = null,
    val qualificationStatus: String? = null,
    val createdAfter: String? = null,
    val createdBefore: String? = null
)
```

### LeadsUiState
```kotlin
data class LeadsUiState(
    val leads: List<LeadListItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val activeFilters: FilterState = FilterState()
)
```

---

## 🎨 Visual States

### Filter Button States

#### No Filters Active
```
┌────────────┐
│     🔽     │  Gray (SurfaceVariant)
│            │  No badge
└────────────┘
```

#### Filters Active
```
┌────────────┐
│     🔽  ③  │  Purple (Primary)
│            │  Red badge with count
└────────────┘
```

### FilterChip States

#### Unselected
```
┌──────────┐
│  Active  │  Gray outline, gray text
└──────────┘
```

#### Selected
```
┌──────────────┐
│ ✓  Active    │  Purple background, white text
└──────────────┘
```

### Date Card States

#### Empty
```
┌─────────────────┐
│ 📅 From         │  Gray border
│ Select date     │  Gray text
└─────────────────┘
```

#### With Date
```
┌─────────────────┐
│ 📅 From         │  Purple border
│ Nov 29, 2025    │  Black text (SemiBold)
└─────────────────┘
```

---

## 🧪 Quick Test Checklist

### Smoke Tests (5 minutes)
- [ ] Open filter drawer
- [ ] Change lead score range
- [ ] Select qualification status
- [ ] Select multiple sources
- [ ] Pick date range
- [ ] Apply filters
- [ ] Verify filtered results
- [ ] Clear all filters
- [ ] Verify all leads shown

### Regression Tests (5 minutes)
- [ ] Search still works
- [ ] View lead detail
- [ ] Edit lead
- [ ] Create new lead
- [ ] Navigate back to leads
- [ ] Filters persisted?
- [ ] Navigate to different screen
- [ ] Return to leads - filters cleared?

---

## 🐛 Common Issues & Solutions

### Issue: "No leads found" after filtering
**Solution:** Check filter combinations aren't too restrictive. Try:
1. Increase score range
2. Select more statuses/sources
3. Widen date range
4. Use "Reset All" to start fresh

### Issue: Filter button not turning purple
**Cause:** No filters actually active (all defaults)
**Check:** 
- Score range not 0-100
- At least one chip selected
- Date range has values

### Issue: Filters not applying
**Check:**
1. Network connection
2. Backend API response
3. Error message displayed?
4. ViewModel logs

### Issue: Date picker not opening
**Cause:** State management issue
**Solution:** Verify `showDatePicker` state updates correctly

---

## 📊 Performance Benchmarks

### Target Performance
- **Filter drawer open:** < 50ms
- **Filter application (10 leads):** < 100ms
- **Filter application (50 leads):** < 200ms
- **Filter application (100+ leads):** < 500ms
- **UI frame rate:** 60fps (16.67ms/frame)

### Optimization Tips
1. Use `remember` for filter state
2. Debounce rapid filter changes
3. Use `LaunchedEffect` for API calls
4. Consider pagination for large lists
5. Profile with Android Studio Profiler

---

## 🔧 Customization Guide

### Adding New Filter Type
1. Add filter section to `FilterDrawer.kt`
2. Add state variable in `FilterDrawer` composable
3. Update `LeadFilters` data class
4. Update `FilterState` data class
5. Modify `applyFilters()` in `LeadsViewModel`
6. Add client-side filtering logic (if needed)
7. Add to `activeFilterCount()` calculation
8. Update testing guide

### Changing Filter Layout
- Edit individual filter composables in `FilterDrawer.kt`
- Modify spacing in `Column(verticalArrangement = Arrangement.spacedBy(24.dp))`
- Adjust chip grid layout (`.chunked(3)` for 3 columns)

### Styling Changes
- Colors: Update `DesignTokens` usage
- Shapes: Modify `MaterialTheme.shapes.*`
- Typography: Change `MaterialTheme.typography.*`
- Sizes: Adjust `.size()`, `.padding()`, etc.

---

## 📚 Additional Resources

### Files to Reference
- `FilterDrawer.kt` - Complete filter UI
- `LeadsViewModel.kt` - Filter logic
- `LeadsScreen.kt` - Integration example
- `DesignTokens.kt` - Color/spacing system

### Documentation
- `ANDROID_LEAD_FILTER_TESTING_GUIDE.md` - Full testing procedures
- `ANDROID_LEAD_FILTER_IMPLEMENTATION_COMPLETE.md` - Detailed summary
- `ANDROID_FEATURE_PARITY_ROADMAP.md` - Project roadmap

### Material 3 References
- [ModalBottomSheet](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary#ModalBottomSheet)
- [FilterChip](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary#FilterChip)
- [RangeSlider](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary#RangeSlider)
- [DatePicker](https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary#DatePicker)

---

**Last Updated:** November 29, 2025  
**Version:** 1.0  
**Maintained By:** Android Development Team
