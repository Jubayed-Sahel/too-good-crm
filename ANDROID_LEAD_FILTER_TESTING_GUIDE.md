# Android Lead Filter Testing Guide

## Overview
This document provides comprehensive testing procedures for the new advanced Lead Filter functionality implemented in the Android CRM app.

## Feature Summary
**Task 1.2.5: Enhanced Lead Search & Filters**
- Modern FilterDrawer composable with Material 3 ModalBottomSheet
- Lead score range slider (0-100 with 5-point increments)
- Qualification status filter (8 options: new, contacted, qualified, unqualified, proposal, negotiation, converted, lost)
- Multi-select status filter (active, inactive, pending)
- Multi-select source filter (8 options: website, referral, cold_call, email, social_media, advertisement, event, other)
- Date range picker for created date filtering
- Active filter badge counter
- Filter state persistence during session
- Clear all filters functionality

## Components Modified/Created

### New Files
- `FilterDrawer.kt` - Advanced filter UI component (679 lines)
- Includes `LeadFilters` data class with utility methods

### Modified Files
- `LeadsViewModel.kt` - Added `applyFilters()` and `clearFilters()` methods
- `LeadsViewModel.kt` - Added `FilterState` data class to track active filters
- `LeadsScreen.kt` - Integrated FilterDrawer with modern search/filter UI
- `LeadsScreen.kt` - Replaced old dropdown filters with filter button + drawer

## Test Environment Setup

### Prerequisites
1. Android Studio with latest SDK
2. Android emulator or physical device (API 26+)
3. Backend server running with lead data
4. At least 10-15 leads with varied:
   - Lead scores (0-100 range)
   - Different qualification statuses
   - Multiple sources
   - Different creation dates
   - Various status values

### Test Data Requirements
Create test leads with the following characteristics:

**High Score Leads (80-100)**
- Lead 1: Score 95, qualified, website, created 2 days ago
- Lead 2: Score 87, converted, referral, created 1 week ago
- Lead 3: Score 92, negotiation, email, created 3 days ago

**Medium Score Leads (40-79)**
- Lead 4: Score 65, contacted, cold_call, created 5 days ago
- Lead 5: Score 58, proposal, social_media, created 2 weeks ago
- Lead 6: Score 72, qualified, advertisement, created 1 month ago

**Low Score Leads (0-39)**
- Lead 7: Score 25, new, website, created today
- Lead 8: Score 18, unqualified, event, created 3 weeks ago
- Lead 9: Score 31, lost, other, created 2 months ago

**Edge Cases**
- Lead 10: Score 0, new, referral, created yesterday
- Lead 11: Score 100, converted, email, created 6 months ago
- Lead 12: Null score, contacted, cold_call, created 1 hour ago

## Testing Procedures

### Test 1: Filter Drawer Access
**Objective:** Verify filter drawer opens and closes correctly

**Steps:**
1. Launch app and navigate to Leads screen
2. Observe filter button (should be gray/SurfaceVariant color)
3. Tap filter button
4. **Expected:** ModalBottomSheet slides up from bottom
5. Verify "Filter Leads" header is visible
6. Verify all 5 filter sections are present:
   - Lead Score Range
   - Qualification Status  
   - Status
   - Source
   - Created Date Range
7. Tap outside drawer or drag down
8. **Expected:** Drawer dismisses smoothly

**Pass Criteria:**
- ✅ Drawer opens with animation
- ✅ All filter sections visible
- ✅ Drawer dismisses on outside tap
- ✅ No crashes or layout issues

---

### Test 2: Lead Score Range Filter
**Objective:** Test score range slider functionality

**Steps:**
1. Open filter drawer
2. Observe initial score range (should be "0 - 100")
3. Drag left slider thumb to 30
4. Drag right slider thumb to 80
5. Observe badge updates to "30 - 80"
6. Tap "Apply Filters"
7. **Expected:** Only leads with scores 30-80 are displayed
8. Verify filter button turns purple (Primary color)
9. Verify badge shows "1" (one active filter)

**Specific Test Cases:**
- **Test 2a:** Set range to 0-100 (should show all leads)
- **Test 2b:** Set range to 90-100 (should show only Leads 1, 3, 11)
- **Test 2c:** Set range to 0-20 (should show only Lead 8)
- **Test 2d:** Set range to 50-50 (should show leads with exactly score 50)

**Pass Criteria:**
- ✅ Slider responds smoothly to touch
- ✅ Badge updates in real-time
- ✅ Filtering works accurately
- ✅ Edge cases handled (0, 100, same value)

---

### Test 3: Qualification Status Filter
**Objective:** Test single-select qualification status filter

**Steps:**
1. Open filter drawer
2. Tap "Qualified" chip
3. Observe chip highlights in purple with checkmark
4. Tap "Apply Filters"
5. **Expected:** Only qualified leads displayed
6. Re-open drawer
7. Tap "Qualified" again (deselect)
8. **Expected:** Chip returns to gray, checkmark removed
9. Apply filters again
10. **Expected:** All leads displayed again

**Specific Test Cases:**
- **Test 3a:** Filter by "New" (should show Leads 7, 10, 12)
- **Test 3b:** Filter by "Converted" (should show Leads 2, 11)
- **Test 3c:** Filter by "Lost" (should show Lead 9)
- **Test 3d:** Select and deselect same status 3 times (toggle test)

**Pass Criteria:**
- ✅ Only one status can be selected at a time
- ✅ Chips highlight correctly
- ✅ Filtering works for all 8 statuses
- ✅ Deselection removes filter

---

### Test 4: Multi-Select Status Filter
**Objective:** Test multiple status selection

**Steps:**
1. Open filter drawer
2. Tap "Active" chip
3. Tap "Pending" chip (both should be highlighted)
4. Observe both chips have checkmarks
5. Tap "Apply Filters"
6. **Expected:** Leads with status "active" OR "pending" displayed
7. Verify filter count increments
8. Tap "Clear" button next to "Status" label
9. **Expected:** Both chips deselect

**Pass Criteria:**
- ✅ Multiple chips can be selected
- ✅ OR logic works (shows any matching status)
- ✅ Clear button removes all status selections
- ✅ No maximum selection limit

---

### Test 5: Multi-Select Source Filter
**Objective:** Test source filter with 8 options

**Steps:**
1. Open filter drawer
2. Select "Website", "Email", and "Referral"
3. Verify all 3 chips highlighted
4. Apply filters
5. **Expected:** Only leads from those 3 sources displayed
6. Verify leads: 1, 2, 3, 7, 11 are shown

**Specific Test Cases:**
- **Test 5a:** Select all 8 sources (should show all leads)
- **Test 5b:** Select only "Other" (should show Lead 9)
- **Test 5c:** Select 4 sources, apply, then add 2 more sources
- **Test 5d:** Use "Clear" button to reset

**Pass Criteria:**
- ✅ All 8 source options work
- ✅ Multi-select logic correct
- ✅ Chips layout properly in 3-column grid
- ✅ Clear button works

---

### Test 6: Date Range Filter
**Objective:** Test date picker and range filtering

**Steps:**
1. Open filter drawer
2. Tap "From" date card
3. **Expected:** Date picker dialog opens with "Select Start Date" title
4. Select a date 1 month ago
5. Tap "OK"
6. Observe "From" card updates with selected date
7. Tap "To" date card
8. Select today's date
9. Tap "OK"
10. Apply filters
11. **Expected:** Only leads created in last month displayed

**Specific Test Cases:**
- **Test 6a:** Set start date only (should show leads from that date forward)
- **Test 6b:** Set end date only (should show leads up to that date)
- **Test 6c:** Set same date for both (should show leads from that day)
- **Test 6d:** Set start date AFTER end date (should show no results)
- **Test 6e:** Tap "Clear" to remove date range

**Pass Criteria:**
- ✅ Both date pickers open correctly
- ✅ Date cards update with formatted dates (MMM dd, yyyy)
- ✅ Cards highlight when dates selected
- ✅ Filtering logic works correctly
- ✅ Cancel button works in date picker

---

### Test 7: Combined Filter Testing
**Objective:** Test multiple filters working together

**Test Scenario 1: Find High-Value Recent Leads**
1. Score range: 80-100
2. Qualification status: "Qualified" OR "Negotiation"
3. Date range: Last 7 days
4. **Expected Result:** Leads 1 and 3 only

**Test Scenario 2: Find Problematic Leads**
1. Score range: 0-30
2. Qualification status: "Unqualified" OR "Lost"
3. Source: "Event" OR "Other"
4. **Expected Result:** Leads 8 and 9

**Test Scenario 3: Website Conversions**
1. Source: "Website"
2. Qualification status: "Converted"
3. **Expected Result:** Leads that match both criteria

**Pass Criteria:**
- ✅ All filters apply simultaneously (AND logic between filter types)
- ✅ Filter count badge shows correct number (e.g., "3" for 3 filter types)
- ✅ Results update immediately after applying
- ✅ No performance issues with multiple filters

---

### Test 8: Filter Persistence
**Objective:** Verify filters persist during navigation

**Steps:**
1. Apply multiple filters (score range, status, source)
2. Navigate to a lead detail page
3. Press back to return to leads list
4. **Expected:** Filters still active, filtered results still shown
5. Tap filter button
6. **Expected:** Filter drawer shows previously selected values
7. Navigate to different screen (e.g., Dashboard)
8. Return to Leads screen
9. **Expected:** Filters cleared (fresh state)

**Pass Criteria:**
- ✅ Filters persist within screen session
- ✅ Filter state visible in drawer
- ✅ Filters reset on screen exit/entry

---

### Test 9: Reset Functionality
**Objective:** Test filter reset behaviors

**Steps:**
1. Apply all 5 filter types with various values
2. Verify filter badge shows "5"
3. Open filter drawer
4. Tap "Reset All" button in header
5. **Expected:** All filter controls reset to defaults:
   - Score range: 0-100
   - All chips deselected
   - Date cards empty
6. Verify "Apply Filters" button still enabled
7. Apply filters (should show all leads)

**Alternative: Clear All Button**
1. With active filters, tap "Clear All" in active filters row
2. **Expected:** All filters removed, all leads displayed
3. Filter button returns to gray

**Pass Criteria:**
- ✅ Reset All clears all filter controls
- ✅ Clear All removes active filters
- ✅ Both methods return to showing all leads
- ✅ No residual filter state

---

### Test 10: UI/UX Verification
**Objective:** Verify design matches specifications

**Visual Checks:**
- ✅ Filter button 56dp × 56dp
- ✅ Badge visible when filters active (red, top-right)
- ✅ Badge shows correct count (1-5)
- ✅ Purple (Primary) color when filters active
- ✅ Gray (SurfaceVariant) when no filters
- ✅ Active filter info row shows below search
- ✅ Info icon (Primary color, 16dp)
- ✅ "Clear All" in red (Error color)

**Drawer Checks:**
- ✅ Drag handle at top (32×4dp, OutlineVariant)
- ✅ Header "Filter Leads" (headlineSmall, Bold)
- ✅ "Reset All" button (Primary color)
- ✅ Horizontal divider after header
- ✅ All sections properly spaced (24dp)
- ✅ Apply button full width, Primary color
- ✅ Apply button has FilterList icon

**Filter Section Checks:**
- ✅ Section titles (titleMedium, SemiBold)
- ✅ Score badge shows current range
- ✅ Slider colored purple (Primary)
- ✅ Selected chips purple with white text
- ✅ Unselected chips gray with outline
- ✅ Checkmark icons (18dp) on selected chips
- ✅ Date cards highlight when selected
- ✅ Calendar icons in date cards
- ✅ Clear buttons visible when applicable

**Interactions:**
- ✅ Smooth animations (drawer slide, chip selection)
- ✅ Haptic feedback on button taps (device-dependent)
- ✅ No layout shifts or jumps
- ✅ Scrollable content in drawer
- ✅ Touch targets minimum 48dp

---

### Test 11: Search + Filter Integration
**Objective:** Test search working with filters

**Steps:**
1. Type "John" in search field
2. **Expected:** Leads with "John" in name displayed
3. Without clearing search, tap filter button
4. Apply score filter 80-100
5. **Expected:** Results show leads matching "John" AND score 80-100
6. Clear search field
7. **Expected:** Only score filter active, shows all high-score leads
8. Apply filters again
9. **Expected:** Search and filter work independently

**Pass Criteria:**
- ✅ Search and filters combine (AND logic)
- ✅ Can apply either independently
- ✅ Clearing one doesn't affect the other
- ✅ Both indicators show when active

---

### Test 12: Edge Cases & Error Handling
**Objective:** Test boundary conditions

**Test Cases:**

**12a: No Leads Match Filters**
1. Apply impossible filter combination (e.g., score 0-10, status "converted")
2. **Expected:** Empty state with message "No leads found"
3. **Expected:** Suggestion "Try adjusting your filters"

**12b: Network Error During Filter**
1. Turn off backend server
2. Apply filters
3. **Expected:** Error message displayed
4. **Expected:** Previous leads still visible or error card shown

**12c: Very Large Date Range**
1. Set date range: 10 years ago to today
2. **Expected:** All leads shown, no performance issues

**12d: Rapid Filter Changes**
1. Open drawer, change multiple filters quickly
2. Close drawer without applying
3. Re-open drawer
4. **Expected:** Previous active filters still shown, changes discarded

**12e: Null/Missing Lead Data**
1. Filter by score range when some leads have null leadScore
2. **Expected:** Null scores treated as 0 or excluded gracefully

**Pass Criteria:**
- ✅ Graceful error handling
- ✅ Helpful error messages
- ✅ App doesn't crash
- ✅ Empty states informative
- ✅ Null data handled

---

### Test 13: Performance Testing
**Objective:** Verify performance with various data sizes

**Test with 10 Leads:**
- Apply filters: < 100ms response
- Open drawer: Instant
- Scroll drawer: Smooth 60fps

**Test with 50 Leads:**
- Apply filters: < 200ms response
- UI remains responsive
- No visible lag

**Test with 100+ Leads:**
- Apply filters: < 500ms response
- Consider pagination if available
- Memory usage acceptable

**Pass Criteria:**
- ✅ No ANR (Application Not Responding)
- ✅ Smooth animations
- ✅ Quick filter application
- ✅ No memory leaks

---

### Test 14: Accessibility Testing
**Objective:** Verify accessibility features

**Steps:**
1. Enable TalkBack
2. Navigate to Leads screen
3. **Expected:** "Filter leads" button announced
4. Tap filter button
5. **Expected:** Each filter section has proper content descriptions
6. Navigate through filters with TalkBack
7. **Expected:** Current values announced
8. Apply filters
9. **Expected:** Confirmation or result count announced

**Additional Checks:**
- ✅ All interactive elements have content descriptions
- ✅ Touch targets meet minimum 48dp
- ✅ Color contrast meets WCAG AA (4.5:1)
- ✅ Works with large font sizes
- ✅ No reliance on color alone for information

---

### Test 15: Rotation & Configuration Changes
**Objective:** Test behavior on device rotation

**Steps:**
1. Apply multiple filters
2. Rotate device to landscape
3. **Expected:** Filters remain active, UI adapts
4. Open filter drawer in landscape
5. **Expected:** Drawer displays properly, content scrollable
6. Rotate back to portrait
7. **Expected:** Everything still works

**Pass Criteria:**
- ✅ Filter state preserved across rotation
- ✅ Drawer adapts to landscape
- ✅ No crashes or data loss
- ✅ UI remains usable in both orientations

---

## Regression Testing

### Verify Existing Functionality Still Works:
1. **Lead List Display** - All lead cards render correctly
2. **Lead Metrics** - Top metrics cards show correct data
3. **View Lead** - Tapping "View" navigates to detail page
4. **Edit Lead** - Tapping "Edit" navigates to edit page
5. **New Lead Button** - Still functional
6. **Navigation Drawer** - Profile switching still works
7. **Mode Toggle** - Vendor/Client mode still functional
8. **Pull to Refresh** - Still refreshes lead list

---

## Known Issues & Limitations

### Current Limitations:
1. Date range filtering done client-side (backend may add support)
2. Multi-select status/source filtering done client-side
3. Pagination not implemented (loads first 50 leads)
4. No filter presets/saved filters
5. Filter state not persisted across app restarts

### Future Enhancements (Not in Scope):
- Save filter presets
- Share filter configurations
- Export filtered results
- Advanced query builder
- Filter by assigned employee
- Filter by estimated value range

---

## Bug Reporting Template

If you find a bug during testing, report it with:

**Bug Title:** [Brief description]

**Severity:** Critical | High | Medium | Low

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots/Logs:**
[Attach if available]

**Environment:**
- Device: [e.g., Pixel 7 Emulator]
- Android Version: [e.g., Android 13]
- App Version: [e.g., 1.2.5]

---

## Test Sign-Off

### Test Execution Summary

**Tester Name:** _________________

**Date:** _________________

**Build Version:** _________________

**Device(s) Tested:** _________________

### Test Results

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Filter Drawer Access | ☐ Pass ☐ Fail | |
| 2 | Lead Score Range | ☐ Pass ☐ Fail | |
| 3 | Qualification Status | ☐ Pass ☐ Fail | |
| 4 | Multi-Select Status | ☐ Pass ☐ Fail | |
| 5 | Multi-Select Source | ☐ Pass ☐ Fail | |
| 6 | Date Range Filter | ☐ Pass ☐ Fail | |
| 7 | Combined Filters | ☐ Pass ☐ Fail | |
| 8 | Filter Persistence | ☐ Pass ☐ Fail | |
| 9 | Reset Functionality | ☐ Pass ☐ Fail | |
| 10 | UI/UX Verification | ☐ Pass ☐ Fail | |
| 11 | Search Integration | ☐ Pass ☐ Fail | |
| 12 | Edge Cases | ☐ Pass ☐ Fail | |
| 13 | Performance | ☐ Pass ☐ Fail | |
| 14 | Accessibility | ☐ Pass ☐ Fail | |
| 15 | Rotation | ☐ Pass ☐ Fail | |
| - | Regression Tests | ☐ Pass ☐ Fail | |

**Overall Result:** ☐ Pass ☐ Fail

**Blocker Issues Found:** _________________

**Approved for Release:** ☐ Yes ☐ No

**Signature:** _________________

---

## Automation Test Cases (Future)

```kotlin
// Example Espresso test for filter drawer
@Test
fun testFilterDrawerOpens() {
    onView(withId(R.id.filter_button)).perform(click())
    onView(withText("Filter Leads")).check(matches(isDisplayed()))
}

@Test
fun testScoreRangeFilter() {
    onView(withId(R.id.filter_button)).perform(click())
    onView(withId(R.id.score_range_slider)).perform(setSliderValue(50f, 80f))
    onView(withText("Apply Filters")).perform(click())
    onView(withId(R.id.lead_list)).check(matches(hasChildCount(greaterThan(0))))
}
```

---

## Appendix

### Filter Logic Reference

**Score Range Filter:**
```kotlin
leadScoreMin <= lead.leadScore <= leadScoreMax
```

**Multi-Select Filters (Status, Source):**
```kotlin
lead.status IN selectedStatuses OR
lead.source IN selectedSources
```

**Date Range Filter:**
```kotlin
createdAfter <= lead.createdAt <= createdBefore
```

**Combined Filters:**
```kotlin
(Score AND Qualification AND Status AND Source AND DateRange)
```

### API Endpoints Used
- `GET /api/leads/` - Get leads with filters
- Query parameters: `status`, `source`, `qualification_status`, `page`, `pageSize`, `ordering`

### Related Files
- `FilterDrawer.kt` - Main filter UI
- `LeadsViewModel.kt` - Filter logic
- `LeadsScreen.kt` - Integration
- `LeadRepository.kt` - API calls
- `Lead.kt` - Data model

---

**Document Version:** 1.0
**Last Updated:** 2024
**Author:** Android Development Team
