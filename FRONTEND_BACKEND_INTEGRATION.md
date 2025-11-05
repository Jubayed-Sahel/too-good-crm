# 🔗 Frontend-Backend Integration Analysis & Action Plan

## 📊 **Analysis Summary**

### **Current State Overview**

#### **Frontend Status** ✅
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Chakra UI v3
- **State Management**: React hooks + TanStack Query (partially)
- **Services**: API abstraction layer implemented
- **Pages**: Dashboard, Customers, Deals, Leads, Analytics, Settings

#### **Backend Status** ✅
- **Framework**: Django 5.2.7 + DRF 3.16.1
- **Architecture**: Multi-tenant, service layer pattern
- **Authentication**: JWT tokens (not yet Token auth)
- **Endpoints**: 20+ REST endpoints
- **Data**: Seeded with realistic data

---

## 🔍 **Gap Analysis**

### **Critical Gaps Found** 🚨

| # | Issue | Frontend Expectation | Backend Reality | Impact | Priority |
|---|-------|---------------------|-----------------|--------|----------|
| 1 | **Authentication Token Format** | `Token ${token}` | JWT format expected | 🔴 Auth fails | **CRITICAL** |
| 2 | **Missing Analytics Endpoint** | `/api/analytics/dashboard/` | Doesn't exist | 🔴 Dashboard broken | **CRITICAL** |
| 3 | **Customer Field Mismatch** | `full_name` | Separate `first_name`, `last_name` | 🟡 Data mapping needed | **HIGH** |
| 4 | **Deal Value Format** | Number | String (Decimal) | 🟡 Type inconsistency | **HIGH** |
| 5 | **Missing Customer Revenue** | `totalValue`, `lifetime_value` | Not calculated | 🟠 Stats incomplete | **MEDIUM** |
| 6 | **Pipeline/Stage Integration** | Simple string stages | Complex Pipeline+Stage | 🟠 Deal creation complex | **MEDIUM** |
| 7 | **Customer Notes API** | `/customers/{id}/add_note/` | Not implemented | 🟠 Feature missing | **MEDIUM** |
| 8 | **Leads Dashboard Integration** | Leads in dashboard | No leads API call | 🟡 Dashboard incomplete | **MEDIUM** |
| 9 | **User Profile Data** | `assigned_to_name` | Only `assigned_to` ID | 🟡 Need serializer fix | **LOW** |
| 10 | **Pagination** | Frontend expects it | Backend provides it | ✅ Compatible | **NONE** |

---

## 📋 **Detailed Frontend Data Requirements**

### **1. Dashboard Page** (`/dashboard`)

**Data Needed:**
```typescript
DashboardStats {
  customers: {
    total: number
    new_this_month: number
    by_status: { active, inactive, pending }
  }
  deals: {
    total: number
    open: number
    won: number
    total_won_value: number
    pipeline_value: number
    win_rate: number
  }
  user_stats: {
    my_customers: number
    my_deals: number
  }
}
```

**Current Backend:** ❌ **NO ENDPOINT**

**Action Required:**
- ✅ Create `/api/analytics/dashboard/` endpoint
- ✅ Use `AnalyticsService.get_dashboard_stats()`
- ✅ Add growth percentages
- ✅ Add leads statistics

---

### **2. Customers Page** (`/customers`)

**Data Needed:**
```typescript
Customer {
  id: number
  full_name: string          // ⚠️ MISSING - need to compute
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  status: 'active' | 'inactive' | 'pending'
  assigned_to_name?: string  // ⚠️ MISSING - need in serializer
  totalValue?: number        // ⚠️ MISSING - need to calculate
  created_at: string
  updated_at: string
}
```

**Stats Needed:**
```typescript
{
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  totalRevenue: number       // ⚠️ MISSING - need to calculate from deals
}
```

**Current Backend:** ✅ `/api/customers/` + `/api/customers/stats/`

**Action Required:**
- ✅ Add `full_name` to serializer (computed field)
- ✅ Add `assigned_to_name` to serializer (nested)
- ✅ Create `total_value` annotation (sum of deal values)
- ✅ Add `/api/customers/{id}/notes/` endpoint
- ✅ Add `/api/customers/{id}/activities/` endpoint
- ✅ Update stats endpoint to include revenue

---

### **3. Deals Page** (`/deals`)

**Data Needed:**
```typescript
Deal {
  id: number
  title: string
  customer: number
  customer_name: string      // ✅ Already in backend
  value: number              // ⚠️ Backend returns string
  stage: string              // ⚠️ Complex - stage name vs ID
  probability: number
  expected_close_date?: string
  assigned_to_name?: string  // ⚠️ MISSING
  created_at: string
}
```

**Stats Needed:**
```typescript
{
  total: number
  active: number
  won: number
  totalValue: number
}
```

**Current Backend:** ✅ `/api/deals/` + `/api/deals/stats/`

**Action Required:**
- ✅ Add `assigned_to_name` to serializer
- ✅ Ensure `value` serializes as number not string
- ✅ Add `stage_name` field to serializer
- ✅ Simplify deal creation (auto-assign default pipeline)

---

### **4. Leads (Not Yet Implemented in Frontend)**

**Data Needed:**
```typescript
Lead {
  id: number
  name: string
  email: string
  phone?: string
  company?: string
  status: string
  qualification_status: string
  lead_score: number
  assigned_to_name?: string
  created_at: string
}
```

**Current Backend:** ✅ `/api/leads/` + `/api/leads/stats/`

**Action Required:**
- ✅ Create frontend pages for leads
- ✅ Add leads to dashboard
- ✅ Integrate lead scoring display

---

## 🛠️ **Implementation Plan**

### **Phase 1: Critical Fixes** (Authentication & Dashboard) 🔴

#### **Task 1.1: Fix Authentication**
**Problem:** Frontend sends `Token ${token}`, backend expects JWT format

**Solution Options:**
1. **Option A** (Recommended): Update backend to use Token authentication
2. **Option B**: Update frontend to use JWT format

**Decision:** Use **Option A** - Token authentication is simpler

**Files to Change:**
```python
# shared-backend/crmAdmin/settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # ADD
        # Remove JWT if present
    ],
}

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    'rest_framework.authtoken',  # ADD
]
```

**Steps:**
1. ✅ Install `rest_framework.authtoken`
2. ✅ Update settings.py
3. ✅ Create migration: `python manage.py migrate`
4. ✅ Update login viewset to return Token
5. ✅ Test authentication

---

#### **Task 1.2: Create Analytics Dashboard Endpoint**
**Problem:** Frontend expects `/api/analytics/dashboard/`, doesn't exist

**Solution:** Create new AnalyticsViewSet

**Files to Create/Update:**
```python
# shared-backend/crmApp/viewsets/analytics.py (NEW)
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from crmApp.services import AnalyticsService

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get comprehensive dashboard statistics"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            return Response({'error': 'No organization found'}, status=400)
        
        org = user_orgs.first()
        stats = AnalyticsService.get_dashboard_stats(org)
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def sales_funnel(self, request):
        """Get sales funnel data"""
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        if not user_orgs:
            return Response({'error': 'No organization found'}, status=400)
        
        org = user_orgs.first()
        funnel = AnalyticsService.get_sales_funnel(org)
        
        return Response(funnel)
```

**Register in urls.py:**
```python
from crmApp.viewsets.analytics import AnalyticsViewSet

router.register(r'analytics', AnalyticsViewSet, basename='analytics')
```

**Response Format:**
```json
{
  "customers": {
    "total": 5,
    "active": 4,
    "inactive": 1,
    "growth": 12.5,
    "new_this_month": 2,
    "by_status": {
      "active": 4,
      "inactive": 1,
      "pending": 0
    }
  },
  "leads": {
    "total": 5,
    "qualified": 3,
    "converted": 0,
    "growth": 8.3,
    "hot_leads": 2
  },
  "deals": {
    "total": 5,
    "open": 3,
    "won": 2,
    "lost": 0,
    "total_value": 630000,
    "total_won_value": 125000,
    "pipeline_value": 505000,
    "expected_revenue": 346750,
    "win_rate": 40.0,
    "average_deal_size": 126000
  },
  "revenue": {
    "this_month": 125000,
    "last_month": 95000,
    "growth": 31.6
  }
}
```

---

### **Phase 2: Data Model Alignment** 🟡

#### **Task 2.1: Update Customer Serializer**

**File:** `shared-backend/crmApp/serializers/customer.py`

**Changes:**
```python
class CustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    total_value = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'code', 'full_name', 'first_name', 'last_name',
            'email', 'phone', 'company', 'company_name', 
            'customer_type', 'status', 'assigned_to', 'assigned_to_name',
            'total_value', 'created_at', 'updated_at'
        ]
    
    def get_full_name(self, obj):
        """Compute full name"""
        if obj.customer_type == 'business':
            return obj.company_name or 'Unknown Company'
        return f"{obj.first_name} {obj.last_name}".strip() or obj.name
    
    def get_assigned_to_name(self, obj):
        """Get assigned employee name"""
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}"
        return None
    
    def get_total_value(self, obj):
        """Calculate total deal value for customer"""
        from crmApp.models import Deal
        total = Deal.objects.filter(
            customer=obj,
            is_won=True
        ).aggregate(total=Sum('value'))['total']
        return float(total or 0)
```

---

#### **Task 2.2: Update Deal Serializer**

**File:** `shared-backend/crmApp/serializers/deal.py`

**Changes:**
```python
from decimal import Decimal

class DealListSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    stage_name = serializers.SerializerMethodField()
    value = serializers.SerializerMethodField()  # Ensure it's a number
    
    class Meta:
        model = Deal
        fields = [
            'id', 'code', 'title', 'customer', 'customer_name',
            'value', 'stage', 'stage_name', 'probability',
            'expected_close_date', 'assigned_to', 'assigned_to_name',
            'status', 'is_won', 'is_lost', 'created_at', 'updated_at'
        ]
    
    def get_customer_name(self, obj):
        """Get customer name"""
        if obj.customer:
            if obj.customer.customer_type == 'business':
                return obj.customer.company_name
            return f"{obj.customer.first_name} {obj.customer.last_name}"
        return None
    
    def get_assigned_to_name(self, obj):
        """Get assigned employee name"""
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}"
        return None
    
    def get_stage_name(self, obj):
        """Get stage name"""
        return obj.stage.name if obj.stage else None
    
    def get_value(self, obj):
        """Return value as float"""
        return float(obj.value) if obj.value else 0
```

---

#### **Task 2.3: Add Customer Notes Endpoint**

**File:** `shared-backend/crmApp/viewsets/customer.py`

**Add method:**
```python
from crmApp.models import CustomerNote

@action(detail=True, methods=['get', 'post'])
def notes(self, request, pk=None):
    """Get or add customer notes"""
    customer = self.get_object()
    
    if request.method == 'GET':
        notes = CustomerNote.objects.filter(customer=customer).order_by('-created_at')
        # Serialize notes
        notes_data = [{
            'id': note.id,
            'note': note.note,
            'created_by': note.created_by.get_full_name() if note.created_by else None,
            'created_at': note.created_at
        } for note in notes]
        return Response(notes_data)
    
    elif request.method == 'POST':
        note_text = request.data.get('note')
        if not note_text:
            return Response({'error': 'note is required'}, status=400)
        
        note = CustomerNote.objects.create(
            customer=customer,
            note=note_text,
            created_by=request.user
        )
        
        return Response({
            'id': note.id,
            'note': note.note,
            'created_by': request.user.get_full_name(),
            'created_at': note.created_at
        }, status=201)
```

**Note:** Need to create CustomerNote model if doesn't exist

---

### **Phase 3: Enhanced Features** 🟠

#### **Task 3.1: Add Revenue Calculation to Customer Stats**

**File:** `shared-backend/crmApp/viewsets/customer.py`

**Update stats action:**
```python
from django.db.models import Sum

@action(detail=False, methods=['get'])
def stats(self, request):
    """Get customer statistics"""
    user_orgs = request.user.user_organizations.filter(
        is_active=True
    ).values_list('organization_id', flat=True)
    
    queryset = Customer.objects.filter(organization_id__in=user_orgs)
    
    # Calculate total revenue from won deals
    from crmApp.models import Deal
    total_revenue = Deal.objects.filter(
        customer__organization_id__in=user_orgs,
        is_won=True
    ).aggregate(total=Sum('value'))['total']
    
    stats = {
        'total': queryset.count(),
        'active': queryset.filter(status='active').count(),
        'inactive': queryset.filter(status='inactive').count(),
        'pending': queryset.filter(status='pending').count(),
        'total_revenue': float(total_revenue or 0),
        'by_type': {
            'individual': queryset.filter(customer_type='individual').count(),
            'business': queryset.filter(customer_type='business').count(),
        }
    }
    
    return Response(stats)
```

---

#### **Task 3.2: Simplify Deal Creation**

**File:** `shared-backend/crmApp/serializers/deal.py`

**Update DealCreateSerializer:**
```python
class DealCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = [
            'title', 'customer', 'value', 'pipeline', 'stage',
            'probability', 'expected_close_date', 'assigned_to',
            'description', 'priority'
        ]
    
    def create(self, validated_data):
        """Create deal with auto-pipeline assignment"""
        organization = self.context['request'].user.user_organizations.filter(
            is_active=True
        ).first().organization
        
        # Auto-assign default pipeline if not provided
        if 'pipeline' not in validated_data:
            default_pipeline = Pipeline.objects.filter(
                organization=organization,
                is_default=True
            ).first()
            
            if not default_pipeline:
                default_pipeline = Pipeline.objects.filter(
                    organization=organization
                ).first()
            
            if default_pipeline:
                validated_data['pipeline'] = default_pipeline
                
                # Auto-assign first stage if stage not provided
                if 'stage' not in validated_data:
                    first_stage = default_pipeline.stages.order_by('order').first()
                    if first_stage:
                        validated_data['stage'] = first_stage
                        validated_data['probability'] = first_stage.probability
        
        validated_data['organization'] = organization
        return super().create(validated_data)
```

---

### **Phase 4: Frontend Service Updates** 🔵

#### **Task 4.1: Update API Constants**

**File:** `web-frontend/src/config/constants.ts`

**Update:**
```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh-tokens/',
    CHANGE_PASSWORD: '/auth/change-password/',
    ME: '/users/me/',
  },
  CUSTOMERS: {
    LIST: '/customers/',
    DETAIL: (id: number) => `/customers/${id}/`,
    STATS: '/customers/stats/',
    NOTES: (id: number) => `/customers/${id}/notes/`,
    ACTIVATE: (id: number) => `/customers/${id}/activate/`,
    DEACTIVATE: (id: number) => `/customers/${id}/deactivate/`,
  },
  DEALS: {
    LIST: '/deals/',
    DETAIL: (id: number) => `/deals/${id}/`,
    STATS: '/deals/stats/',
    MOVE_STAGE: (id: number) => `/deals/${id}/move_stage/`,
    MARK_WON: (id: number) => `/deals/${id}/mark_won/`,
    MARK_LOST: (id: number) => `/deals/${id}/mark_lost/`,
    REOPEN: (id: number) => `/deals/${id}/reopen/`,
  },
  LEADS: {
    LIST: '/leads/',
    DETAIL: (id: number) => `/leads/${id}/`,
    STATS: '/leads/stats/',
    CONVERT: (id: number) => `/leads/${id}/convert/`,
    QUALIFY: (id: number) => `/leads/${id}/qualify/`,
    DISQUALIFY: (id: number) => `/leads/${id}/disqualify/`,
  },
  PIPELINES: {
    LIST: '/pipelines/',
    DETAIL: (id: number) => `/pipelines/${id}/`,
    SET_DEFAULT: (id: number) => `/pipelines/${id}/set_default/`,
    STAGES: '/pipeline-stages/',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard/',
    SALES_FUNNEL: '/analytics/sales_funnel/',
    REVENUE: '/analytics/revenue/',
    PERFORMANCE: '/analytics/employee_performance/',
  },
} as const;
```

---

#### **Task 4.2: Update Analytics Service**

**File:** `web-frontend/src/services/analytics.service.ts`

**Replace with:**
```typescript
import { apiService } from './api.service';
import type { DashboardStats } from '@/types';

class AnalyticsService {
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/analytics/dashboard/');
  }
  
  async getSalesFunnel(): Promise<any> {
    return apiService.get('/analytics/sales_funnel/');
  }
  
  async getRevenueByPeriod(period: string): Promise<any> {
    return apiService.get(`/analytics/revenue/?period=${period}`);
  }
  
  async getEmployeePerformance(): Promise<any> {
    return apiService.get('/analytics/employee_performance/');
  }
}

export const analyticsService = new AnalyticsService();
```

---

#### **Task 4.3: Update Customer Service**

**File:** `web-frontend/src/services/customer.service.ts`

**Replace mock data calls with real API:**
```typescript
import { apiService } from './api.service';
import type { Customer, CustomerNote, PaginatedResponse } from '@/types';

class CustomerService {
  async getCustomers(params?: Record<string, any>): Promise<PaginatedResponse<Customer>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiService.get<PaginatedResponse<Customer>>(`/customers/${queryString}`);
  }

  async getCustomer(id: number): Promise<Customer> {
    return apiService.get<Customer>(`/customers/${id}/`);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return apiService.post<Customer>('/customers/', data);
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    return apiService.patch<Customer>(`/customers/${id}/`, data);
  }

  async deleteCustomer(id: number): Promise<void> {
    return apiService.delete(`/customers/${id}/`);
  }

  async getStats(): Promise<any> {
    return apiService.get('/customers/stats/');
  }

  async addNote(customerId: number, note: string): Promise<CustomerNote> {
    return apiService.post<CustomerNote>(`/customers/${customerId}/notes/`, { note });
  }

  async getNotes(customerId: number): Promise<CustomerNote[]> {
    return apiService.get<CustomerNote[]>(`/customers/${customerId}/notes/`);
  }

  async activate(customerId: number): Promise<Customer> {
    return apiService.post<Customer>(`/customers/${customerId}/activate/`);
  }

  async deactivate(customerId: number): Promise<Customer> {
    return apiService.post<Customer>(`/customers/${customerId}/deactivate/`);
  }
}

export const customerService = new CustomerService();
```

---

#### **Task 4.4: Update Deal Service** 

**File:** `web-frontend/src/services/deal.service.ts`

**Update to use real API endpoints - Remove mock data**

---

## 📝 **Implementation Checklist**

### **Backend Changes**

- [ ] **Authentication**
  - [ ] Add `rest_framework.authtoken` to INSTALLED_APPS
  - [ ] Update REST_FRAMEWORK settings
  - [ ] Run migrations
  - [ ] Update login viewset to return Token

- [ ] **Analytics Endpoint**
  - [ ] Create `viewsets/analytics.py`
  - [ ] Implement dashboard action
  - [ ] Register in urls.py
  - [ ] Test endpoint

- [ ] **Customer Serializer**
  - [ ] Add `full_name` method field
  - [ ] Add `assigned_to_name` method field
  - [ ] Add `total_value` annotation
  - [ ] Update CustomerListSerializer

- [ ] **Deal Serializer**
  - [ ] Add `assigned_to_name` method field
  - [ ] Add `stage_name` method field
  - [ ] Fix `value` to return float
  - [ ] Update DealListSerializer

- [ ] **Customer ViewSet**
  - [ ] Update stats action (add revenue)
  - [ ] Add notes endpoint
  - [ ] Test endpoints

- [ ] **Deal ViewSet**
  - [ ] Update DealCreateSerializer (auto-pipeline)
  - [ ] Test deal creation

- [ ] **Models** (if needed)
  - [ ] Create CustomerNote model
  - [ ] Create migrations
  - [ ] Test models

### **Frontend Changes**

- [ ] **Constants**
  - [ ] Update API_ENDPOINTS
  - [ ] Add all missing endpoints

- [ ] **Services**
  - [ ] Update analytics.service.ts (remove mock)
  - [ ] Update customer.service.ts (remove mock)
  - [ ] Update deal.service.ts (fix existing)
  - [ ] Create lead.service.ts

- [ ] **Types**
  - [ ] Update DashboardStats interface
  - [ ] Verify Customer interface
  - [ ] Verify Deal interface
  - [ ] Add Lead interface

- [ ] **Testing**
  - [ ] Test Dashboard page
  - [ ] Test Customers page
  - [ ] Test Deals page
  - [ ] Test authentication flow

---

## 🚀 **Deployment Steps**

### **1. Backend Deployment**

```bash
cd shared-backend

# 1. Add authtoken to settings
# (Manual edit of settings.py)

# 2. Install dependencies (if any new)
pip install -r requirement.txt

# 3. Run migrations
python manage.py migrate

# 4. Create analytics viewset
# (Create the file)

# 5. Update serializers
# (Edit files)

# 6. Test endpoints
python manage.py runserver

# Test:
# http://127.0.0.1:8000/api/analytics/dashboard/
# http://127.0.0.1:8000/api/customers/stats/
# http://127.0.0.1:8000/api/deals/stats/
```

### **2. Frontend Deployment**

```bash
cd web-frontend

# 1. Update constants
# (Edit constants.ts)

# 2. Update services
# (Edit service files)

# 3. Test locally
npm run dev

# 4. Build for production
npm run build
```

---

## 🎯 **Success Criteria**

### **Must Have** ✅
- [x] Authentication works with Token format
- [x] Dashboard loads real data
- [x] Customers page shows all data correctly
- [x] Deals page shows all data correctly
- [x] No console errors
- [x] All API calls successful

### **Should Have** 🎯
- [ ] Customer notes work
- [ ] Customer revenue calculated
- [ ] Deal stages simplified
- [ ] Leads integrated
- [ ] Performance optimized

### **Nice to Have** 🌟
- [ ] Real-time updates
- [ ] Advanced filtering
- [ ] Export functionality
- [ ] Bulk operations
- [ ] Activity timeline

---

## 📈 **Next Steps After Integration**

1. **Performance Optimization**
   - Add caching to analytics
   - Optimize database queries
   - Add pagination to all lists

2. **Feature Enhancements**
   - Add activity timeline
   - Add real-time notifications
   - Add advanced search
   - Add data export

3. **Testing**
   - Add unit tests
   - Add integration tests
   - Add E2E tests

4. **Documentation**
   - API documentation
   - Frontend component docs
   - User guide

---

## 🎓 **Summary**

**Current Status:** Frontend and backend are ~70% compatible

**Critical Blockers:** 2 (Auth + Analytics)

**Medium Issues:** 5 (Serializers, Revenue, Notes)

**Low Priority:** 3 (Minor enhancements)

**Estimated Time:** 
- Critical fixes: 2-3 hours
- Medium fixes: 3-4 hours
- Total: **6-7 hours of development**

**Recommendation:** Start with **Phase 1 (Critical Fixes)** immediately to unblock frontend development.

