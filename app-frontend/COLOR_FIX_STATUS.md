# Color Fix Summary

## ✅ Completed
1. **DesignTokens.kt** - Added `PinkAccent` color
2. **CustomersScreen.kt** - All hardcoded colors replaced
3. **DealsScreen.kt** - All hardcoded colors replaced
4. **COLOR_MAPPING_GUIDE.md** - Created comprehensive mapping guide

## 🔄 Remaining Screens to Fix

### LeadsScreen.kt
**Lines to fix:**
- Line 76: `Color(0xFFF3E5F5)` → `DesignTokens.Colors.PrimaryContainer`
- Line 87: `Color(0xFFFFEBEE)` → `DesignTokens.Colors.ErrorLight`
- Line 98: `Color(0xFFE3F2FD)` → `DesignTokens.Colors.InfoLight`
- Line 109: `Color(0xFFE8F5E9)` → `DesignTokens.Colors.SuccessLight`
- Line 262: `Color(0xFF4CAF50)` → `DesignTokens.Colors.Success`
- Line 278: `Color(0xFFFF9800)` → `DesignTokens.Colors.Warning`
- Lines 321, 328: `Color(0xFF4CAF50)` → `DesignTokens.Colors.Success`
- Lines 474, 479: `Color(0xFFFFEBEE)`, `Color(0xFFD32F2F)` → `DesignTokens.Colors.ErrorLight`, `ErrorDark`
- Line 563: `Color(0xFF4CAF50)` → `DesignTokens.Colors.Success`

###SalesScreen.kt
**Lines to fix:**
- Line 52: `Color(0xFFF9FAFB)` → `DesignTokens.Colors.Background`
- Line 66: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- Line 76: `Color(0xFF374151)` → `DesignTokens.Colors.OnSurface`
- Lines 90, 99, 116, 125: Metric colors → `DesignTokens.Colors.Success`, `StatusScheduled`, `Info`, `Warning`
- Lines 137, 173: `Color(0xFF374151)` → `DesignTokens.Colors.OnSurface`
- Lines 239, 245: Success/Error with alpha → `DesignTokens.Colors.Success`/`Error.copy(alpha = 0.1f)`
- Lines 258, 266: `Color(0xFF111827)`, `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurface`, `OnSurfaceVariant`
- Lines 308, 316, 330: Various colors → Design Tokens
- Lines 346-347: Progress colors → `DesignTokens.Colors.Success`, `Warning`

### AnalyticsScreen.kt
**Lines to fix:**
- Line 50: `Color(0xFFF9FAFB)` → `DesignTokens.Colors.Background`
- Line 64: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- Line 74: `Color(0xFF374151)` → `DesignTokens.Colors.OnSurface`
- Lines 88, 96, 112, 120: Metric colors → Design Tokens
- Lines 131-176: Various text colors → Design Tokens
- Lines 256-273: Card text colors → Design Tokens
- Lines 326-390: Chart/metric colors → Design Tokens

### TeamScreen.kt
**Lines to fix:**
- Line 65: `Color(0xFFF9FAFB)` → `DesignTokens.Colors.Background`
- Line 78: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- Lines 93, 100, 107: Metric colors → `DesignTokens.Colors.Primary`, `Success`, `StatusScheduled`
- Lines 128-144: TextField/Button colors → Design Tokens
- Lines 233-356: Team member card colors → Design Tokens
- Lines 377-387: Enum colors for Role and Status → Design Tokens

### SettingsScreen.kt
**Lines to fix:**
- Line 56: `Color(0xFFF9FAFB)` → `DesignTokens.Colors.Background`
- Line 70: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- Lines 116-391: All section colors → Design Tokens
- Multiple divider colors → `DesignTokens.Colors.OutlineVariant`
- Button colors → `DesignTokens.Colors.Error`
- Switch/toggle colors → Design Tokens

### Activities, Dashboard, and Client Screens
These screens likely also have hardcoded colors that need to be replaced.

## 📝 Manual Fix Required For Each File

For each screen, you need to:

1. **Add import** (if not already present):
   ```kotlin
   import too.good.crm.ui.theme.DesignTokens
   ```

2. **Replace colors** using find-replace or manual editing:
   - Find: `Color(0xFF[hex value])`
   - Replace with appropriate `DesignTokens.Colors.[ColorName]`

3. **Test** the screen to ensure colors look correct

## 🎨 Key Color Mappings (Quick Reference)

| Old Hex | New DesignToken |
|---------|----------------|
| `0xFF6B7280` | `DesignTokens.Colors.OnSurfaceVariant` |
| `0xFF22C55E` | `DesignTokens.Colors.Success` |
| `0xFFF59E0B` | `DesignTokens.Colors.Warning` |
| `0xFFEF4444` | `DesignTokens.Colors.Error` |
| `0xFF3B82F6` | `DesignTokens.Colors.Info` |
| `0xFF667EEA` | `DesignTokens.Colors.Primary` |
| `0xFFF9FAFB` | `DesignTokens.Colors.Background` |
| `0xFFE5E7EB` | `DesignTokens.Colors.OutlineVariant` |
| `0xFF111827` | `DesignTokens.Colors.OnSurface` |
| `0xFF9CA3AF` | `DesignTokens.Colors.OnSurfaceTertiary` |

## ✨ Result

Once all screens are fixed:
- ✅ Colors will match web-frontend exactly
- ✅ Consistent color scheme across all screens
- ✅ Easy to maintain and theme
- ✅ Type-safe color references
- ✅ Ready for dark mode implementation

## 🚀 Next Steps

1. Manually fix remaining 5 major screens (Leads, Sales, Analytics, Team, Settings)
2. Check Activities, Dashboard, and Client screens
3. Test all screens for visual correctness
4. Consider adding dark theme support using same DesignTokens

---

**Status**: 2/13 screens complete (CustomersScreen, DealsScreen)
**Remaining**: 11 screens to fix
