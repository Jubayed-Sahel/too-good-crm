# 📚 Frontend Reorganization - Complete Context Guide

> **Purpose**: Comprehensive guide for continuing and completing the frontend reorganization effort.

## 📊 Current Status

### ✅ **Completed Features** (5/15+)

1. **Customers** - ✅ Complete
   - Components: `features/customers/components/`
   - Hooks: `features/customers/hooks/`
   - Services: `features/customers/services/`
   - Schemas: `features/customers/schemas/`
   - Pages: `features/customers/pages/`

2. **Deals** - ✅ Complete
   - Components: `features/deals/components/`
   - Hooks: `features/deals/hooks/`
   - Services: `features/deals/services/`
   - Schemas: `features/deals/schemas/`
   - Pages: `features/deals/pages/`

3. **Leads** - ✅ Complete
   - Components: `features/leads/components/`
   - Hooks: `features/leads/hooks/`
   - Services: `features/leads/services/`
   - Schemas: `features/leads/schemas/`
   - Pages: `features/leads/pages/`

4. **Employees** - ✅ Complete
   - Components: `features/employees/components/`
   - Hooks: `features/employees/hooks/`
   - Services: `features/employees/services/`
   - Schemas: `features/employees/schemas/`
   - Pages: `features/employees/pages/`

5. **Activities** - ✅ Complete
   - Components: `features/activities/components/`
   - Services: `features/activities/services/` (activity.service.ts, auditLog.service.ts)
   - Pages: `features/activities/pages/`

### ⏳ **Remaining Features** (To Be Organized)

#### High Priority (Business Logic Features)
- **Issues** - Components, hooks, service, pages
- **Orders** - Components, hooks, service, pages  
- **Payments** - Components, hooks, service, pages
- **Vendors** - Components, hooks, service, pages

#### Medium Priority (User-Facing Features)
- **Messages/Chat** - Components (GeminiChatWindow, VoiceChat, etc.), hooks (useGemini, useMessages, useSpeechToText, useTextToSpeech), service (gemini.service.ts)
- **Video Calls** - Components (VideoCallManager, VideoCallWindow), hooks (useVideoCallWebSocket, usePusherVideoCall), service (video.service.ts)
- **Settings** - Components, pages (SettingsPage, ClientSettingsPage)

#### Lower Priority (Infrastructure/Shared)
- **Auth** - Components (LoginForm, SignupForm, ProtectedRoute, etc.), hooks (useAuth), service (auth.service.ts)
- **Dashboard** - Components (DashboardWidgets, StatsGrid, etc.), hooks (useDashboardStats, useSalesPage)
- **RBAC/Permissions** - Components (PermissionGuard, RequirePermission), hooks (useRBAC, usePermissions, usePermissionActions), services (rbac.service.ts, permission.service.ts, role.service.ts)
- **Organization** - Components (OrganizationSwitcher), hooks (useOrganization), services (organization.service.ts)
- **User Management** - Hooks (useUser), services (userProfile.service.ts, role-selection.service.ts)

#### Special Cases
- **Client Portal Features** - `client-*` components (client-dashboard, client-issues, client-orders, client-payments, client-vendors)
- **Team Management** - Components (TeamMembersTab, ManagePermissionsDialog, etc.)
- **Common/Shared Components** - Should stay in `components/common/` (truly shared)
- **UI Components** - Should stay in `components/ui/` (base UI primitives)

## 🏗️ Established Pattern

### Directory Structure Template

```
features/{feature-name}/
├── components/          # Feature-specific UI components
│   ├── {Feature}Table.tsx
│   ├── {Feature}Filters.tsx
│   ├── Create{Feature}Dialog.tsx
│   ├── Edit{Feature}Dialog.tsx
│   └── index.ts        # Barrel export
│
├── hooks/              # React Query hooks & custom hooks
│   ├── use{Features}.ts
│   ├── use{Feature}Actions.ts
│   ├── use{Feature}Mutations.ts
│   └── index.ts        # Barrel export
│
├── services/           # API communication layer
│   └── {feature}.service.ts
│
├── types/              # TypeScript types (if feature-specific)
│   └── {feature}.types.ts
│
├── schemas/            # Validation schemas (Zod)
│   └── {feature}.schema.ts
│
├── pages/              # Page components (optional)
│   ├── {Feature}sPage.tsx
│   ├── {Feature}DetailPage.tsx
│   └── Edit{Feature}Page.tsx
│
├── index.ts            # Public API - exports everything
└── README.md           # Feature documentation (optional)
```

### Import Patterns

#### ✅ Within Feature (Relative Imports)
```typescript
// In features/customers/pages/CustomersPage.tsx
import { CustomerTable } from '../components';
import { useCustomers } from '../hooks';
import { customerService } from '../services/customer.service';
```

#### ✅ Cross-Feature (Absolute Imports)
```typescript
// Importing from shared/common components
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
```

#### ✅ Backwards Compatible (Legacy Imports Still Work)
```typescript
// Old code still works via re-exports
import { useCustomers } from '@/hooks';
import { CustomerTable } from '@/components/customers';
import { customerService } from '@/services';
```

### File Creation Checklist

For each feature migration:

1. **Create directory structure**
   ```powershell
   New-Item -ItemType Directory -Path "features\{feature}\{components,hooks,services,pages,types,schemas}" -Force
   ```

2. **Move files**
   - Components: `components/{feature}/*` → `features/{feature}/components/`
   - Hooks: `hooks/use{Feature}*.ts` → `features/{feature}/hooks/`
   - Services: `services/{feature}.service.ts` → `features/{feature}/services/`
   - Schemas: `schemas/{feature}.schema.ts` → `features/{feature}/schemas/`
   - Pages: `pages/*{Feature}*.tsx` → `features/{feature}/pages/`

3. **Create barrel exports**
   - `features/{feature}/hooks/index.ts`
   - `features/{feature}/components/index.ts`
   - `features/{feature}/index.ts`

4. **Fix imports**
   - `../ui/` → `@/components/ui/`
   - `../common` → `@/components/common`
   - `../dashboard` → `@/components/dashboard`
   - `./common.schema` → `@/schemas/common.schema`

5. **Update re-exports**
   - `hooks/index.ts` - Add feature hooks re-export
   - `components/index.ts` - Add feature components re-export
   - `services/index.ts` - Add feature service re-export

## 📝 Step-by-Step Migration Guide

### Phase 1: Preparation

1. **Identify feature files**
   ```powershell
   # Find all feature-related files
   Get-ChildItem -Path "components\{feature}" -Recurse
   Get-ChildItem -Path "hooks" -Filter "*{feature}*"
   Get-ChildItem -Path "services" -Filter "*{feature}*"
   Get-ChildItem -Path "schemas" -Filter "*{feature}*"
   Get-ChildItem -Path "pages" -Filter "*{Feature}*"
   ```

2. **Create feature directory**
   ```powershell
   New-Item -ItemType Directory -Path "features\{feature}\components" -Force
   New-Item -ItemType Directory -Path "features\{feature}\hooks" -Force
   New-Item -ItemType Directory -Path "features\{feature}\services" -Force
   New-Item -ItemType Directory -Path "features\{feature}\schemas" -Force
   New-Item -ItemType Directory -Path "features\{feature}\pages" -Force
   ```

### Phase 2: File Migration

3. **Copy files (not move initially - for safety)**
   ```powershell
   Copy-Item "components\{feature}\*" "features\{feature}\components\" -Force -Recurse
   Copy-Item "hooks\use{Feature}*.ts" "features\{feature}\hooks\" -Force
   Copy-Item "services\{feature}.service.ts" "features\{feature}\services\" -Force
   Copy-Item "schemas\{feature}.schema.ts" "features\{feature}\schemas\" -Force
   Copy-Item "pages\*{Feature}*.tsx" "features\{feature}\pages\" -Force
   ```

### Phase 3: Create Barrel Exports

4. **Create hooks/index.ts**
   ```typescript
   /**
    * {Feature} Feature - Hooks
    */
   export * from './use{Features}';
   export { 
     useCreate{Feature},
     useUpdate{Feature},
     useDelete{Feature}
   } from './use{Feature}Mutations';
   ```

5. **Create components/index.ts**
   ```typescript
   export { default as {Feature}Table } from './{Feature}Table';
   export { default as {Feature}Filters } from './{Feature}Filters';
   // ... other components
   ```

6. **Create feature index.ts**
   ```typescript
   /**
    * {Feature} Feature - Public API
    */
   export * from './components';
   export * from './hooks';
   export { {feature}Service } from './services/{feature}.service';
   export * from './schemas/{feature}.schema';
   export { default as {Feature}sPage } from './pages/{Feature}sPage';
   ```

### Phase 4: Fix Imports

7. **Fix component imports (PowerShell script)**
   ```powershell
   Get-ChildItem -Path "features\{feature}\components" -Filter "*.tsx" | ForEach-Object {
     $content = Get-Content $_.FullName -Raw
     $content = $content -replace "from ['`"]\.\.\/ui\/", "from '@/components/ui/"
     $content = $content -replace "from ['`"]\.\.\/common['`"]", "from '@/components/common'"
     $content = $content -replace "from ['`"]\.\.\/dashboard['`"]", "from '@/components/dashboard'"
     Set-Content $_.FullName $content -NoNewline
   }
   ```

8. **Fix schema imports**
   ```powershell
   Get-ChildItem -Path "features\{feature}\schemas" -Filter "*.ts" | ForEach-Object {
     $content = Get-Content $_.FullName -Raw
     $content = $content -replace "from ['`"]\.\.\/common\.schema['`"]", "from '@/schemas/common.schema'"
     Set-Content $_.FullName $content -NoNewline
   }
   ```

9. **Fix page imports**
   ```powershell
   Get-ChildItem -Path "features\{feature}\pages" -Filter "*.tsx" | ForEach-Object {
     $content = Get-Content $_.FullName -Raw
     $content = $content -replace "from ['`"]\.\.\/components\/", "from '@/components/"
     $content = $content -replace "from ['`"]\.\.\/hooks", "from '../hooks"
     Set-Content $_.FullName $content -NoNewline
   }
   ```

### Phase 5: Backwards Compatibility

10. **Update hooks/index.ts**
    ```typescript
    // {Feature} hooks - RE-EXPORTED from features/{feature} (MIGRATED)
    export * from '../features/{feature}/hooks';
    ```

11. **Update components/index.ts**
    ```typescript
    // {Feature} components - RE-EXPORTED from features/{feature} (MIGRATED)
    export * from '../features/{feature}/components';
    ```

12. **Update services/index.ts**
    ```typescript
    // {Feature} service - RE-EXPORTED from features/{feature} (MIGRATED)
    export { {feature}Service } from '../features/{feature}/services/{feature}.service';
    ```

### Phase 6: Testing

13. **Check dev server**
    - Wait for HMR updates
    - Check terminal for errors
    - Test feature in browser

14. **Fix any remaining import errors**
    - Check terminal output
    - Fix missing exports
    - Fix wrong import paths

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to resolve import '../{feature}'"
**Error**: `Failed to resolve import "../deals" from "src/features/deals/components/DealsPageContent.tsx"`

**Solution**: Change to relative import within feature:
```typescript
// ❌ Wrong
import { Component } from '../deals';

// ✅ Correct
import { Component } from './index';  // or '../components'
```

### Issue 2: "Failed to resolve import './common.schema'"
**Error**: Schema files trying to import from relative path

**Solution**: Use absolute path to shared schemas:
```typescript
// ❌ Wrong
import { validator } from './common.schema';

// ✅ Correct
import { validator } from '@/schemas/common.schema';
```

### Issue 3: Missing exports
**Error**: `doesn't provide an export named: 'use{Feature}'`

**Solution**: Add missing export to `hooks/index.ts`:
```typescript
export { useCustomers, useCustomer } from './useCustomers';
// Make sure both are exported!
```

### Issue 4: Circular dependencies
**Error**: Module imports create circular reference

**Solution**: 
- Use shared components for cross-feature dependencies
- Avoid feature-to-feature direct imports
- Use barrel exports properly

### Issue 5: Type errors
**Error**: TypeScript type not found

**Solution**: Export types properly:
```typescript
// In index.ts
export type { Customer, CustomerStatus } from './types/customer.types';
```

### Issue 6: Browser cache showing old errors
**Solution**: Hard refresh browser:
- Windows: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## 📋 Feature Inventory

### ✅ Migrated Features

| Feature | Components | Hooks | Services | Schemas | Pages | Status |
|---------|-----------|-------|----------|---------|-------|--------|
| Customers | 8 | 4 | 1 | 1 | 3 | ✅ Complete |
| Deals | 8 | 4 | 1 | 1 | 3 | ✅ Complete |
| Leads | 7 | 2 | 1 | 1 | 2 | ✅ Complete |
| Employees | 6 | 2 | 1 | 1 | Multiple | ✅ Complete |
| Activities | 8 | 0 | 2 | 0 | 3 | ✅ Complete |

### ⏳ Remaining Features

#### Business Features
| Feature | Components | Hooks | Services | Schemas | Pages | Priority |
|---------|-----------|-------|----------|---------|-------|----------|
| Issues | 7 | 1 | 1 | 1 | 2 | High |
| Orders | 4 | 1 | 1 | 1 | 2 | High |
| Payments | 4 | 1 | 1 | 0 | 1 | High |
| Vendors | 4 | 1 | 1 | 0 | 1 | High |

#### User Features
| Feature | Components | Hooks | Services | Pages | Priority |
|---------|-----------|-------|----------|-------|----------|
| Messages | 5 | 4 | 1 | 1 | Medium |
| Video | 2 | 3 | 1 | 0 | Medium |
| Settings | 14 | 0 | 1 | 2 | Medium |

#### Infrastructure
| Feature | Components | Hooks | Services | Pages | Priority |
|---------|-----------|-------|----------|-------|----------|
| Auth | 7 | 1 | 1 | 2 | Low |
| Dashboard | 15 | 2 | 0 | 1 | Low |
| RBAC | 5 | 3 | 3 | 1 | Low |
| Organization | 1 | 1 | 1 | 0 | Low |
| User Management | 0 | 1 | 2 | 0 | Low |

## 🎯 Best Practices

### 1. **Preserve Logic**
- ✅ **DO**: Only change import paths
- ❌ **DON'T**: Modify business logic
- ❌ **DON'T**: Change function signatures
- ❌ **DON'T**: Refactor component structure

### 2. **Use Relative Imports Within Features**
```typescript
// ✅ Within feature
import { Component } from '../components';
import { useHook } from '../hooks';

// ❌ Don't use absolute paths within feature
import { Component } from '@/features/customers/components';
```

### 3. **Use Absolute Imports for Cross-Feature**
```typescript
// ✅ Cross-feature or shared
import { DashboardLayout } from '@/components/dashboard';
import { Button } from '@/components/ui/button';
```

### 4. **Create Proper Barrel Exports**
- Export everything public from `index.ts`
- Keep internal implementation details private
- Use `export type` for type-only exports

### 5. **Maintain Backwards Compatibility**
- Always create re-exports in old locations
- Don't remove old files until migration is complete
- Test that old imports still work

### 6. **Test After Each Feature**
- Check dev server for errors
- Test feature functionality in browser
- Verify all imports resolve correctly

## 🔄 Migration Order Recommendation

### Suggested Sequence

1. **Issues** - Business logic, straightforward
2. **Orders** - Business logic, straightforward
3. **Payments** - Business logic, straightforward
4. **Vendors** - Business logic, straightforward
5. **Messages** - More complex (AI integration)
6. **Video Calls** - More complex (WebSocket, Pusher)
7. **Settings** - Many components, needs careful handling
8. **Dashboard** - Shared components, needs careful separation
9. **Auth** - Core infrastructure, needs careful testing
10. **RBAC/Permissions** - Core infrastructure, used everywhere

## 📁 Files to Keep in Root

### Should NOT be migrated to features/:

- **`components/common/`** - Truly shared components (Card, Button, Dialog, etc.)
- **`components/ui/`** - Base UI primitives
- **`components/dashboard/`** - Core dashboard layout (DashboardLayout, Sidebar, TopBar)
- **`components/guards/`** - Permission guards (used everywhere)
- **`components/auth/`** - Core auth components (ProtectedRoute, etc.)
- **`contexts/`** - React contexts (shared across app)
- **`core/`** - Core infrastructure (API client, router)
- **`shared/`** - Shared utilities and types
- **`utils/`** - Utility functions
- **`types/`** - Shared TypeScript types
- **`schemas/`** - Shared validation schemas

### Client Portal Considerations

The `client-*` components could either:
- **Option A**: Stay in `components/client-*` (client-specific views)
- **Option B**: Move to `features/client-portal/` (if treated as one feature)

Recommendation: **Option A** - Keep client portal components separate as they're vendor-specific views, not a feature.

## 📊 Progress Tracking

### Migration Checklist Template

```markdown
## Feature: {Feature Name}

### Files to Move
- [ ] Components: `components/{feature}/*` → `features/{feature}/components/`
- [ ] Hooks: `hooks/use{Feature}*.ts` → `features/{feature}/hooks/`
- [ ] Services: `services/{feature}.service.ts` → `features/{feature}/services/`
- [ ] Schemas: `schemas/{feature}.schema.ts` → `features/{feature}/schemas/`
- [ ] Pages: `pages/*{Feature}*.tsx` → `features/{feature}/pages/`

### Files to Create
- [ ] `features/{feature}/hooks/index.ts`
- [ ] `features/{feature}/components/index.ts`
- [ ] `features/{feature}/index.ts`

### Imports to Fix
- [ ] Fix component imports (`../ui/` → `@/components/ui/`)
- [ ] Fix schema imports (`./common.schema` → `@/schemas/common.schema`)
- [ ] Fix page imports

### Re-exports to Update
- [ ] Update `hooks/index.ts`
- [ ] Update `components/index.ts`
- [ ] Update `services/index.ts`

### Testing
- [ ] Dev server runs without errors
- [ ] Feature works in browser
- [ ] All imports resolve correctly
```

## 🔍 Debugging Commands

### Find Files to Migrate
```powershell
# Find all component files
Get-ChildItem -Path "components\{feature}" -Recurse -File

# Find all hook files
Get-ChildItem -Path "hooks" -Filter "*{feature}*"

# Find all service files
Get-ChildItem -Path "services" -Filter "*{feature}*"

# Find all pages
Get-ChildItem -Path "pages" -Filter "*{Feature}*"
```

### Check for Import Errors
```powershell
# Find relative imports that need fixing
Select-String -Path "features\{feature}\**\*.tsx" -Pattern "from ['\"]\.\.\/ui\/"
Select-String -Path "features\{feature}\**\*.tsx" -Pattern "from ['\"]\.\.\/common"
```

### Verify Exports
```powershell
# Check if all hooks are exported
Get-Content "features\{feature}\hooks\index.ts"
Get-Content "features\{feature}\index.ts"
```

## 📚 Reference Examples

### Complete Feature Example: Customers

See `features/customers/` for a complete reference implementation:
- ✅ Proper directory structure
- ✅ Barrel exports configured
- ✅ Imports fixed correctly
- ✅ Backwards compatibility maintained

### Hook Export Example

```typescript
// features/{feature}/hooks/index.ts
export { use{Features} } from './use{Features}';
export { use{Feature} } from './use{Features}';  // If both exist
export { use{Features}Page } from './use{Features}Page';
export { use{Feature}Actions } from './use{Feature}Actions';
export { 
  useCreate{Feature},
  useUpdate{Feature},
  useDelete{Feature}
} from './use{Feature}Mutations';
```

### Component Export Example

```typescript
// features/{feature}/components/index.ts
export { default as {Feature}Table } from './{Feature}Table';
export { default as {Feature}Filters } from './{Feature}Filters';
export { default as {Feature}Stats } from './{Feature}Stats';
export { default as Create{Feature}Dialog } from './Create{Feature}Dialog';
export { default as Edit{Feature}Dialog } from './Edit{Feature}Dialog';
```

## 🎓 Lessons Learned

### What Worked Well

1. **Incremental Migration** - One feature at a time was manageable
2. **Backwards Compatibility** - Re-exports prevented breaking changes
3. **Automated Import Fixes** - PowerShell scripts saved time
4. **Copy, Don't Move** - Safer to copy first, then delete later

### What to Watch For

1. **Schema Imports** - Always need to change `./common.schema` → `@/schemas/common.schema`
2. **Missing Exports** - Easy to forget to export a hook in the barrel export
3. **Browser Cache** - Hard refresh needed after import changes
4. **Relative vs Absolute** - Use relative within feature, absolute for cross-feature

### Common Mistakes to Avoid

1. ❌ Changing business logic during migration
2. ❌ Using absolute paths within a feature
3. ❌ Forgetting to create barrel exports
4. ❌ Not maintaining backwards compatibility
5. ❌ Moving shared components to features

## 🚀 Quick Start: Next Feature Migration

```powershell
# 1. Set feature name
$feature = "issues"  # or "orders", "payments", etc.

# 2. Create structure
New-Item -ItemType Directory -Path "features\$feature\components","features\$feature\hooks","features\$feature\services","features\$feature\pages" -Force

# 3. Copy files
Copy-Item "components\$feature\*" "features\$feature\components\" -Force -Recurse
Copy-Item "hooks\use*$($feature.Substring(0,1).ToUpper() + $feature.Substring(1))*" "features\$feature\hooks\" -Force
Copy-Item "services\$feature.service.ts" "features\$feature\services\" -Force

# 4. Then follow the step-by-step guide above!
```

## 📖 Related Documentation

- `REORGANIZATION_COMPLETE.md` - Summary of completed work
- `ERRORS_FIXED.md` - Record of errors encountered and fixed
- `REORGANIZATION_PLAN.md` - Original reorganization plan

---

**Last Updated**: 2025-12-02  
**Status**: 5 features migrated, 10+ remaining  
**Next Priority**: Issues, Orders, Payments, Vendors

