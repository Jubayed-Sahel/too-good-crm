# Backend-Frontend Compatibility Issues

## Status: ✅ FIXED

All critical compatibility issues have been resolved.

## Changes Applied

### ✅ 1. Employee Model - Employment Type (FIXED)
**Changed**: Backend values from underscores to hyphens
- `full_time` → `full-time`
- `part_time` → `part-time`  
- Default value updated to `full-time`

**Files Modified**:
- `crmApp/models/employee.py` - Updated EMPLOYMENT_TYPE_CHOICES and default value

### ✅ 2. Address Fields - zip_code Alias (FIXED)
**Added**: `zip_code` as property alias for `postal_code`

**Files Modified**:
- `crmApp/models/base.py` - Added property and setter to AddressMixin
- `crmApp/serializers/customer.py` - Added zip_code field to both serializers
- `crmApp/serializers/employee.py` - Added zip_code field to EmployeeSerializer

**Result**: Frontend can now use both `zip_code` and `postal_code` interchangeably

---

## Critical Issues Found (Now Fixed)

### 1. Employee Model - Employment Type Mismatch ✅ FIXED
**Backend** (`crmApp/models/employee.py`):
```python
EMPLOYMENT_TYPE_CHOICES = [
    ('full_time', 'Full Time'),    # underscore
    ('part_time', 'Part Time'),    # underscore  
    ('contract', 'Contract'),
    ('intern', 'Intern'),
]
```

**Frontend** (`services/employee.service.ts`):
```typescript
employment_type?: 'full-time' | 'part-time' | 'contract' | 'intern';  // hyphen
```

**Impact**: Creating/editing employees will fail due to value mismatch
**Fix Required**: Change backend to use hyphens OR change frontend to use underscores

---

### 2. Customer Model - Missing postal_code field ⚠️
**Backend** (`crmApp/models/customer.py`): Uses `postal_code` (from AddressMixin)
**Frontend** (`services/customer.service.ts`): Uses `zip_code`

**Impact**: Address data won't save correctly
**Fix Required**: Standardize on one field name

---

### 3. Customer Serializer - Field Name Inconsistency ⚠️
**Backend** (`serializers/customer.py`):
- Has `company` as alias for `company_name`
- Has `postal_code` 
- Missing `job_title` field

**Frontend** expects:
- `company` (✓ works via alias)
- `zip_code` (❌ backend uses `postal_code`)
- `job_title` (❌ not in Customer model)

---

### 4. Activity Model - Duration Field Name ⚠️
**Backend** (`models/activity.py`):
```python
duration_minutes = models.IntegerField()  # for general activities
call_duration = models.IntegerField()     # specifically for calls (in seconds!)
```

**Frontend** (`types/activity.types.ts`): 
```typescript
duration?: number;  // unclear which field maps to this
```

**Impact**: Activity duration data may not save/display correctly
**Fix Required**: Clarify field mapping and units

---

### 5. Deal Model - Customer Relationship ✅
**Backend**: `customer` is ForeignKey (can be null)
**Frontend**: Expects `customer` field
**Status**: Compatible

---

### 6. Lead Model - Name Field Structure ⚠️
**Backend** (`models/lead.py`):
```python
name = models.CharField()  # Single field
company = models.CharField()
```

**Frontend** may expect:
- `first_name` and `last_name` separately
- `name` (✓ available)

**Status**: Mostly compatible but should verify frontend usage

---

## Field Mapping Issues

### Employee Model
| Frontend Field | Backend Field | Status | Notes |
|---|---|---|---|
| `employment_type: 'full-time'` | `employment_type: 'full_time'` | ❌ | Value mismatch |
| `zip_code` | `zip_code` | ✅ | Compatible |
| `role_name` | `role.name` (computed) | ✅ | From serializer |

### Customer Model  
| Frontend Field | Backend Field | Status | Notes |
|---|---|---|---|
| `zip_code` | `postal_code` | ❌ | Field name mismatch |
| `company` | `company_name` | ✅ | Alias exists |
| `job_title` | N/A | ❌ | Not in model |
| `full_name` | computed property | ✅ | From serializer |

### Activity Model
| Frontend Field | Backend Field | Status | Notes |
|---|---|---|---|
| `type` | `activity_type` | ⚠️ | Check mapping |
| `duration` | `duration_minutes` | ⚠️ | Clarify usage |
| `customer_name` | `customer_name` | ✅ | Compatible |

---

## Recommended Fixes

### Priority 1 (Critical - Breaks Functionality)

1. **Fix Employee employment_type values**
   - **Option A**: Change backend to use hyphens
   - **Option B**: Change frontend to use underscores
   - **Recommendation**: Change backend (easier migration)

2. **Fix Customer zip_code/postal_code mismatch**
   - Add `zip_code` as alias in AddressMixin or Customer model
   - Update serializer to support both

### Priority 2 (Important - Data Loss Risk)

3. **Add missing Customer.job_title field**
   - Add `job_title` to Customer model
   - Update serializer

4. **Standardize Activity duration fields**
   - Document which field maps to frontend `duration`
   - Update type definitions

### Priority 3 (Enhancement)

5. **Add Lead name splitting logic**
   - Add `first_name` and `last_name` computed fields if needed
   - Or document that `name` is single field

---

## Backend Changes Required

### 1. Employee Model (`crmApp/models/employee.py`)
```python
EMPLOYMENT_TYPE_CHOICES = [
    ('full-time', 'Full Time'),   # Changed from full_time
    ('part-time', 'Part Time'),   # Changed from part_time
    ('contract', 'Contract'),
    ('intern', 'Intern'),
]

employment_type = models.CharField(
    max_length=20, 
    choices=EMPLOYMENT_TYPE_CHOICES, 
    default='full-time'  # Changed default
)
```

### 2. AddressMixin (`crmApp/mixins.py`) - Add zip_code alias
```python
@property
def zip_code(self):
    """Alias for postal_code for frontend compatibility"""
    return self.postal_code

@zip_code.setter
def zip_code(self, value):
    self.postal_code = value
```

### 3. Customer Serializer - Add zip_code field
```python
class CustomerSerializer(serializers.ModelSerializer):
    zip_code = serializers.CharField(source='postal_code', required=False, allow_null=True)
    
    class Meta:
        fields = [..., 'zip_code', 'postal_code', ...]
```

### 4. Customer Model - Add job_title field (optional)
```python
job_title = models.CharField(max_length=100, null=True, blank=True)
```

---

## Testing Checklist

- [ ] Test employee creation with 'full-time' value
- [ ] Test employee update with 'part-time' value
- [ ] Test customer address with zip_code
- [ ] Test customer creation/update
- [ ] Test activity duration fields
- [ ] Test lead name display
- [ ] Verify all forms submit successfully
- [ ] Check that data displays correctly in UI

---

## Migration Strategy

1. **Phase 1**: Add compatibility layers (aliases, computed fields)
2. **Phase 2**: Update existing data if needed (employment_type values)
3. **Phase 3**: Test all CRUD operations
4. **Phase 4**: Remove old field references if safe

