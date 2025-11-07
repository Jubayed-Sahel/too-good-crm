# Color Mapping Guide: Hardcoded → DesignTokens

## 🎯 Purpose
This document maps all hardcoded color values found in the mobile app to their correct DesignTokens equivalents to match the web-frontend color scheme.

---

## 📊 Complete Color Mapping

### Gray Scale (Text & Borders)
| Hardcoded Value | DesignToken | Usage | Web Equivalent |
|-----------------|-------------|-------|----------------|
| `Color(0xFF111827)` | `DesignTokens.Colors.OnSurface` | Primary text, headings | gray.900 |
| `Color(0xFF1F2937)` | `DesignTokens.Colors.OnSurface` | Primary text | gray.800 |
| `Color(0xFF374151)` | `DesignTokens.Colors.OnSurface` | Body text | gray.700 |
| `Color(0xFF6B7280)` | `DesignTokens.Colors.OnSurfaceVariant` | Secondary text, labels | gray.500 |
| `Color(0xFF9CA3AF)` | `DesignTokens.Colors.OnSurfaceTertiary` | Tertiary text, placeholders | gray.400 |
| `Color(0xFFE5E7EB)` | `DesignTokens.Colors.OutlineVariant` | Borders, dividers | gray.200 |
| `Color(0xFFD1D5DB)` | `DesignTokens.Colors.Outline` | Borders | gray.300 |
| `Color(0xFFF9FAFB)` | `DesignTokens.Colors.Background` | Page background | gray.50 |
| `Color(0xFFCBD5E1)` | `DesignTokens.Colors.Outline` | Borders | gray.300 (chakra) |

### Primary/Purple Colors
| Hardcoded Value | DesignToken | Usage | Web Equivalent |
|-----------------|-------------|-------|----------------|
| `Color(0xFF667EEA)` | `DesignTokens.Colors.Primary` | Primary buttons, links | purple.600 |
| `Color(0xFF8B5CF6)` | `DesignTokens.Colors.StatusScheduled` | Scheduled status, violet accent | violet.500 |
| `Color(0xFFF3E5F5)` | `DesignTokens.Colors.PrimaryContainer` | Light purple background | purple.50 |
| `Color(0xFFEC4899)` | ❌ **Add New** | Pink accent | pink.500 |

### Success/Green Colors
| Hardcoded Value | DesignToken | Usage | Web Equivalent |
|-----------------|-------------|-------|----------------|
| `Color(0xFF22C55E)` | `DesignTokens.Colors.Success` | Success states, positive changes | green.500 |
| `Color(0xFF10B981)` | `DesignTokens.Colors.Success` | Success (slightly different shade) | green.500 |
| `Color(0xFF4CAF50)` | `DesignTokens.Colors.Success` | Success (Material Green) | green.500 |
| `Color(0xFFE8F5E9)` | `DesignTokens.Colors.SuccessLight` | Success background | green.100 |
| `Color(0xFF047857)` | `DesignTokens.Colors.SuccessDark` | Success dark | green.700 |

### Warning/Orange Colors
| Hardcoded Value | DesignToken | Usage | Web Equivalent |
|-----------------|-------------|-------|----------------|
| `Color(0xFFF59E0B)` | `DesignTokens.Colors.Warning` | Warning states, pending | orange.500 |
| `Color(0xFFFF9800)` | `DesignTokens.Colors.Warning` | Warning (Material Orange) | orange.500 |
| `Color(0xFFFEF3C7)` | `DesignTokens.Colors.WarningLight` | Warning background | orange.100 |

### Error/Red Colors  
| Hardcoded Value | DesignToken | Usage | Web Equivalent |
|-----------------|-------------|-------|----------------|
| `Color(0xFFEF4444)` | `DesignTokens.Colors.Error` | Error states, negative changes | red.500 |
| `Color(0xFFD32F2F)` | `DesignTokens.Colors.ErrorDark` | Error dark | red.600 |
| `Color(0xFFFFEBEE)` | `DesignTokens.Colors.ErrorLight` | Error background | red.100 |
| `Color(0xFFFEE2E2)` | `DesignTokens.Colors.ErrorLight` | Error background light | red.100 |

### Info/Blue Colors
| Hardcoded Value | DesignToken | Usage | Web Equivalent |
|-----------------|-------------|-------|----------------|
| `Color(0xFF3B82F6)` | `DesignTokens.Colors.Info` | Info states, blue accents | blue.500 |
| `Color(0xFFE3F2FD)` | `DesignTokens.Colors.InfoLight` | Info background | blue.100 |
| `Color(0xFF1E40AF)` | `DesignTokens.Colors.InfoDark` | Info dark | blue.700 |
| `Color(0xFFDBEAFE)` | `DesignTokens.Colors.InfoLight` | Info background | blue.100 |

### Activity Type Colors (Already in DesignTokens ✅)
| Type | DesignToken | Value |
|------|-------------|-------|
| Call | `DesignTokens.Colors.ActivityCall` | blue.500 |
| Email | `DesignTokens.Colors.ActivityEmail` | violet.500 |
| Telegram | `DesignTokens.Colors.ActivityTelegram` | cyan.500 |
| Meeting | `DesignTokens.Colors.ActivityMeeting` | orange.500 |
| Note | `DesignTokens.Colors.ActivityNote` | yellow.500 |
| Task | `DesignTokens.Colors.ActivityTask` | green.500 |

### Status Colors (Already in DesignTokens ✅)
| Status | DesignToken | Value |
|--------|-------------|-------|
| Open | `DesignTokens.Colors.StatusOpen` | blue.500 |
| In Progress | `DesignTokens.Colors.StatusInProgress` | orange.500 |
| Completed | `DesignTokens.Colors.StatusCompleted` | green.500 |
| Closed | `DesignTokens.Colors.StatusClosed` | gray.500 |
| Failed | `DesignTokens.Colors.StatusFailed` | red.500 |
| Pending | `DesignTokens.Colors.StatusPending` | orange.500 |
| Scheduled | `DesignTokens.Colors.StatusScheduled` | violet.500 |

---

## 🔧 Quick Replacement Guide

### Find & Replace Patterns

```kotlin
// ❌ WRONG - Hardcoded
Color(0xFF6B7280)
Color(0xFF22C55E)
Color(0xFF3B82F6)

// ✅ CORRECT - DesignTokens
DesignTokens.Colors.OnSurfaceVariant
DesignTokens.Colors.Success
DesignTokens.Colors.Info
```

### Common Patterns to Fix

#### 1. Text Colors
```kotlin
// ❌ Before
color = Color(0xFF111827)  // Heading
color = Color(0xFF374151)  // Body
color = Color(0xFF6B7280)  // Secondary
color = Color(0xFF9CA3AF)  // Tertiary

// ✅ After
color = DesignTokens.Colors.OnSurface  // Heading
color = DesignTokens.Colors.OnSurface  // Body
color = DesignTokens.Colors.OnSurfaceVariant  // Secondary
color = DesignTokens.Colors.OnSurfaceTertiary  // Tertiary
```

#### 2. Background Colors
```kotlin
// ❌ Before
.background(Color(0xFFF9FAFB))
bg = Color(0xFFFFFFFF)

// ✅ After
.background(DesignTokens.Colors.Background)
bg = DesignTokens.Colors.Surface
```

#### 3. Border/Divider Colors
```kotlin
// ❌ Before
borderColor = Color(0xFFE5E7EB)
HorizontalDivider(color = Color(0xFFE5E7EB))

// ✅ After
borderColor = DesignTokens.Colors.OutlineVariant
HorizontalDivider(color = DesignTokens.Colors.OutlineVariant)
```

#### 4. Status/State Colors
```kotlin
// ❌ Before
color = Color(0xFF22C55E)  // Success
color = Color(0xFFEF4444)  // Error
color = Color(0xFFF59E0B)  // Warning

// ✅ After
color = DesignTokens.Colors.Success
color = DesignTokens.Colors.Error
color = DesignTokens.Colors.Warning
```

#### 5. With Alpha/Opacity
```kotlin
// ❌ Before
Color(0xFF22C55E).copy(alpha = 0.1f)
Color(0xFF3B82F6).copy(alpha = 0.1f)

// ✅ After
DesignTokens.Colors.Success.copy(alpha = 0.1f)
DesignTokens.Colors.Info.copy(alpha = 0.1f)
```

---

## 📋 Screen-by-Screen Checklist

### CustomersScreen.kt
- [ ] Line 355: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- [ ] Line 369: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- [ ] Line 375: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- [ ] Line 383: `Color(0xFF22C55E)` → `DesignTokens.Colors.Success`
- [ ] Line 391: `Color(0xFF9CA3AF)` → `DesignTokens.Colors.OnSurfaceTertiary`
- [ ] Line 419: `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`

### DealsScreen.kt
- [ ] Line 240-331: Multiple `Color(0xFF6B7280)` → `DesignTokens.Colors.OnSurfaceVariant`
- [ ] Line 256, 291, 363-364: `Color(0xFF22C55E)` → `DesignTokens.Colors.Success`
- [ ] Line 292-293, 353-354: `Color(0xFFF59E0B)` → `DesignTokens.Colors.Warning`
- [ ] Line 293, 368-369: `Color(0xFFEF4444)` → `DesignTokens.Colors.Error`
- [ ] Line 343-344: `Color(0xFF3B82F6)` → `DesignTokens.Colors.Info`
- [ ] Line 348-349: `Color(0xFF8B5CF6)` → `DesignTokens.Colors.StatusScheduled`
- [ ] Line 358-359: `Color(0xFFEC4899)` → **Add to DesignTokens** as `PinkAccent`

### LeadsScreen.kt
- [ ] Line 76: `Color(0xFFF3E5F5)` → `DesignTokens.Colors.PrimaryContainer`
- [ ] Line 87: `Color(0xFFFFEBEE)` → `DesignTokens.Colors.ErrorLight`
- [ ] Line 98: `Color(0xFFE3F2FD)` → `DesignTokens.Colors.InfoLight`
- [ ] Line 109: `Color(0xFFE8F5E9)` → `DesignTokens.Colors.SuccessLight`
- [ ] Line 262, 321, 328: `Color(0xFF4CAF50)` → `DesignTokens.Colors.Success`
- [ ] Line 278: `Color(0xFFFF9800)` → `DesignTokens.Colors.Warning`
- [ ] Line 474, 479: Red colors → `DesignTokens.Colors.ErrorLight` & `ErrorDark`

### AnalyticsScreen.kt, SalesScreen.kt, TeamScreen.kt, SettingsScreen.kt
- [ ] Replace all `Color(0xFF...)` with appropriate DesignTokens
- [ ] Use semantic color names instead of hex values
- [ ] Ensure consistency across all screens

---

## 🎨 Missing Colors to Add to DesignTokens

Add these to `DesignTokens.kt`:

```kotlin
// Add to Colors object
val PinkAccent = Color(0xFFEC4899) // pink.500 - for special accents
val CyanAccent = Color(0xFF06B6D4) // cyan.500 - telegram/messaging
```

---

## ✅ Benefits of Using DesignTokens

1. **Consistency**: All screens use the same colors
2. **Maintainability**: Change color once, updates everywhere
3. **Web Alignment**: Colors match web-frontend exactly
4. **Theme Support**: Easy to add dark mode later
5. **Type Safety**: Compile-time checking of color names
6. **Readability**: `DesignTokens.Colors.Success` is clearer than `Color(0xFF22C55E)`

---

## 🚀 Automated Fix Script

For each screen file, run these replacements:

```kotlin
// Gray scale
Color(0xFF111827) → DesignTokens.Colors.OnSurface
Color(0xFF1F2937) → DesignTokens.Colors.OnSurface
Color(0xFF374151) → DesignTokens.Colors.OnSurface
Color(0xFF6B7280) → DesignTokens.Colors.OnSurfaceVariant
Color(0xFF9CA3AF) → DesignTokens.Colors.OnSurfaceTertiary
Color(0xFFE5E7EB) → DesignTokens.Colors.OutlineVariant
Color(0xFFD1D5DB) → DesignTokens.Colors.Outline
Color(0xFFF9FAFB) → DesignTokens.Colors.Background

// Semantic colors
Color(0xFF667EEA) → DesignTokens.Colors.Primary
Color(0xFF22C55E) → DesignTokens.Colors.Success
Color(0xFF10B981) → DesignTokens.Colors.Success
Color(0xFF4CAF50) → DesignTokens.Colors.Success
Color(0xFFF59E0B) → DesignTokens.Colors.Warning
Color(0xFFFF9800) → DesignTokens.Colors.Warning
Color(0xFFEF4444) → DesignTokens.Colors.Error
Color(0xFFD32F2F) → DesignTokens.Colors.ErrorDark
Color(0xFF3B82F6) → DesignTokens.Colors.Info
Color(0xFF8B5CF6) → DesignTokens.Colors.StatusScheduled

// Background colors
Color(0xFFE8F5E9) → DesignTokens.Colors.SuccessLight
Color(0xFFFEF3C7) → DesignTokens.Colors.WarningLight
Color(0xFFFFEBEE) → DesignTokens.Colors.ErrorLight
Color(0xFFE3F2FD) → DesignTokens.Colors.InfoLight
Color(0xFFF3E5F5) → DesignTokens.Colors.PrimaryContainer
```

---

## 📝 Notes

- **Primary color** (#667EEA) matches web-frontend's purple.600 exactly ✅
- **All semantic colors** match Tailwind/Chakra UI color system ✅
- **DesignTokens already has** 95% of needed colors ✅
- Only need to **replace hardcoded values** with DesignToken references
- Consider adding `PinkAccent` and `CyanAccent` for special use cases
