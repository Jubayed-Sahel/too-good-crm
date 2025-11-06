# Hardcoded Data Analysis & Migration Plan

## Executive Summary

**Analysis Date:** November 6, 2025  
**Status:** ⚠️ REQUIRES DATABASE SCHEMA CHANGES - AWAITING USER APPROVAL

This document identifies all hardcoded/mock data in the frontend application and outlines the migration plan to replace them with real API endpoints backed by the database.

---

## 🔍 DISCOVERED HARDCODED DATA

### 1. **MOCK DATA FILES**

#### `web-frontend/src/services/mockData.ts`
Large file containing extensive mock data for:
- **Mock Customers** (8 customer records with full details)
- **Mock Activities** (per-customer activity history)
- **Mock Notes** (per-customer notes)
- **Mock Pipeline Deals** (15 deal records across all stages)
- **Pipeline Statistics** helpers

**Impact:** HIGH - This entire file needs to be deprecated

---

### 2. **CLIENT ISSUES PAGE** 
**Files:** `ClientIssuesPage.tsx`, `ClientIssueDetailPage.tsx`, `IssueFilters.tsx`

#### Hardcoded Data:
```javascript
// Mock issues array (4 issues)
const issues: Issue[] = [...]

// Vendors list
const vendors = ['Tech Solutions Inc', 'Marketing Pro', 'Design Studio', 'Cloud Services', 'Content Creators']

// Issue categories
const categories = [
  { value: 'general', label: 'General Issue' },
  { value: 'delivery', label: 'Delivery Delay' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'billing', label: 'Billing Problem' },
  { value: 'communication', label: 'Communication Issue' },
  { value: 'technical', label: 'Technical Problem' },
  { value: 'other', label: 'Other' },
]

// Status options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

// Priority options
const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]
```

**Database Status:** ❌ **NO `Issue` MODEL EXISTS**

---

### 3. **CLIENT VENDORS PAGE**
**Files:** `ClientVendorsPage.tsx`

#### Hardcoded Data:
```javascript
// Mock vendor data (5 vendors)
const vendors: Vendor[] = [...]
```

**Database Status:** ✅ `Vendor` model EXISTS

---

### 4. **CLIENT ORDERS PAGE**
**Files:** `ClientOrdersPage.tsx`, `ClientOrderDetailPage.tsx`

#### Hardcoded Data:
```javascript
// Mock orders array (7 orders)
const orders: Order[] = [...]
```

**Database Status:** ❌ **NO `Order` MODEL EXISTS**

---

### 5. **CLIENT PAYMENTS PAGE**
**Files:** `ClientPaymentsPage.tsx`

#### Hardcoded Data:
```javascript
// Mock payments array (7 payments)
const payments: Payment[] = [...]
```

**Database Status:** ❌ **NO `Payment` MODEL EXISTS**

---

### 6. **CLIENT DASHBOARD PAGE**
**Files:** `ClientDashboardPage.tsx`

#### Hardcoded Data:
```javascript
// Dashboard stats
const stats = [
  { label: 'Total Vendors', value: '12', icon: FiUsers, change: '+2 this month' },
  { label: 'Active Orders', value: '8', icon: FiShoppingCart, change: '3 pending' },
  { label: 'Total Spent', value: '$45,230', icon: FiDollarSign, change: '+$5,200 this month' },
  { label: 'Open Issues', value: '3', icon: FiAlertCircle, change: '1 urgent' },
]

// Recent vendors
const recentVendors = [...]

// Recent orders
const recentOrders = [...]
```

**Database Status:** Partial - Vendors exist, Orders/Issues don't

---

### 7. **SALES PAGE**
**Files:** `SalesPage.tsx`

#### Hardcoded Data:
```javascript
// Uses mockPipelineDeals from mockData.ts
const [deals, setDeals] = useState<Deal[]>(mockPipelineDeals);

// Pipeline stages
const pipelineStages = [
  { id: 'lead', name: 'Lead', color: 'blue' },
  { id: 'qualified', name: 'Qualified', color: 'purple' },
  { id: 'proposal', name: 'Proposal', color: 'orange' },
  { id: 'negotiation', name: 'Negotiation', color: 'yellow' },
  { id: 'closed-won', name: 'Closed Won', color: 'green' },
  { id: 'closed-lost', name: 'Closed Lost', color: 'red' },
]
```

**Database Status:** ✅ `Deal`, `Pipeline`, `PipelineStage` models EXIST

---

### 8. **LEADS PAGE**
**Files:** `EditLeadPage.tsx`, `CreateLeadDialog.tsx`, `LeadFilters.tsx`

#### Hardcoded Data:
```javascript
// Source options
const sourceOptions = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'event', label: 'Event' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
]

// Status options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
```

**Database Status:** ✅ `Lead` model EXISTS with LEAD_SOURCE_CHOICES

---

### 9. **DEALS PAGE**
**Files:** `EditDealPage.tsx`, `CreateDealDialog.tsx`, `EditDealDialog.tsx`

#### Hardcoded Data:
```javascript
// Stage options
const stageOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
]

// Probability options
const probabilityOptions = [
  { value: '10', label: '10%' },
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
]
```

**Database Status:** ✅ Pipeline/Stage system EXISTS

---

### 10. **CUSTOMERS PAGE**
**Files:** `EditCustomerPage.tsx`, `CreateCustomerDialog.tsx`, `CustomerDetailPage.tsx`

#### Hardcoded Data:
```javascript
// Status options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'vip', label: 'VIP' },
]
```

**Database Status:** ✅ `Customer` model EXISTS with STATUS_CHOICES

---

### 11. **ACTIVITIES PAGE**
**Files:** `ActivitiesPage.tsx`, `ActivityFiltersBar.tsx`

#### Hardcoded Data:
```javascript
// Type options
const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'call', label: 'Calls' },
  { value: 'email', label: 'Emails' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'meeting', label: 'Meetings' },
  { value: 'note', label: 'Notes' },
  { value: 'task', label: 'Tasks' },
]

// Status options
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
]
```

**Database Status:** ❌ **NO `Activity` MODEL EXISTS**

---

### 12. **SETTINGS PAGE**
**Files:** `ProfileSettings.tsx`, `OrganizationSettings.tsx`, `TeamSettings.tsx`

#### Hardcoded Data:
```javascript
// Timezone options
const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  // ... 15 more timezones
]

// Language options
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  // ... more languages
]

// Industry options (in OrganizationSettings)
// Employee size options
// Currency options
// Date format options
// Role options (in TeamSettings)
```

**Database Status:** Partial - Settings system not fully implemented

---

### 13. **ANALYTICS/CHARTS**
**Files:** `RevenueChart.tsx`

#### Hardcoded Data:
```javascript
// Mock revenue data
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const values = [65000, 75000, 82000, 98000, 115000, 125000];
```

**Database Status:** Should aggregate from real deal/payment data

---

## 🚨 CRITICAL MISSING DATABASE MODELS

### ❌ **1. Issue Model** (REQUIRED)
```python
# Proposed model structure:
class Issue(TimestampedModel, CodeMixin, StatusMixin):
    organization = ForeignKey('Organization')
    vendor = ForeignKey('Vendor', null=True, blank=True)
    order = ForeignKey('Order', null=True, blank=True)  # If Order model exists
    
    title = CharField(max_length=255)
    description = TextField()
    issue_number = CharField(max_length=50, unique=True)
    
    priority = CharField(choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ])
    
    status = CharField(choices=[
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ])
    
    category = CharField(choices=[
        ('general', 'General'),
        ('delivery', 'Delivery'),
        ('quality', 'Quality'),
        ('billing', 'Billing'),
        ('communication', 'Communication'),
        ('technical', 'Technical'),
        ('other', 'Other'),
    ])
    
    assigned_to = ForeignKey('Employee', null=True, blank=True)
    created_by = ForeignKey('User')
```

---

### ❌ **2. Order Model** (REQUIRED)
```python
# Proposed model structure:
class Order(TimestampedModel, CodeMixin, StatusMixin):
    organization = ForeignKey('Organization')
    vendor = ForeignKey('Vendor')
    customer = ForeignKey('Customer', null=True, blank=True)
    
    order_number = CharField(max_length=50, unique=True)
    title = CharField(max_length=255)
    description = TextField(null=True, blank=True)
    
    order_type = CharField(choices=[
        ('purchase', 'Purchase Order'),
        ('service', 'Service Order'),
        ('subscription', 'Subscription'),
    ])
    
    status = CharField(choices=[
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ])
    
    total_amount = DecimalField(max_digits=12, decimal_places=2)
    currency = CharField(max_length=3, default='USD')
    
    order_date = DateField()
    expected_delivery = DateField(null=True, blank=True)
    actual_delivery = DateField(null=True, blank=True)
    
    assigned_to = ForeignKey('Employee', null=True, blank=True)
```

---

### ❌ **3. Payment Model** (REQUIRED)
```python
# Proposed model structure:
class Payment(TimestampedModel, CodeMixin):
    organization = ForeignKey('Organization')
    order = ForeignKey('Order', null=True, blank=True)
    vendor = ForeignKey('Vendor', null=True, blank=True)
    customer = ForeignKey('Customer', null=True, blank=True)
    
    payment_number = CharField(max_length=50, unique=True)
    invoice_number = CharField(max_length=50, null=True, blank=True)
    
    amount = DecimalField(max_digits=12, decimal_places=2)
    currency = CharField(max_length=3, default='USD')
    
    payment_date = DateField()
    due_date = DateField(null=True, blank=True)
    
    status = CharField(choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ])
    
    payment_method = CharField(choices=[
        ('bank_transfer', 'Bank Transfer'),
        ('credit_card', 'Credit Card'),
        ('check', 'Check'),
        ('cash', 'Cash'),
        ('other', 'Other'),
    ])
    
    notes = TextField(null=True, blank=True)
```

---

### ❌ **4. Activity Model** (REQUIRED)
```python
# Proposed model structure:
class Activity(TimestampedModel):
    organization = ForeignKey('Organization')
    
    activity_type = CharField(choices=[
        ('call', 'Call'),
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
        ('task', 'Task'),
    ])
    
    title = CharField(max_length=255)
    description = TextField(null=True, blank=True)
    
    # Relations (can be related to customer, lead, deal, etc.)
    customer = ForeignKey('Customer', null=True, blank=True)
    lead = ForeignKey('Lead', null=True, blank=True)
    deal = ForeignKey('Deal', null=True, blank=True)
    
    # Activity-specific fields
    phone_number = CharField(max_length=20, null=True, blank=True)  # for calls
    email_subject = CharField(max_length=255, null=True, blank=True)  # for emails
    email_body = TextField(null=True, blank=True)  # for emails
    telegram_username = CharField(max_length=100, null=True, blank=True)  # for telegram
    
    status = CharField(choices=[
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('scheduled', 'Scheduled'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    
    scheduled_at = DateTimeField(null=True, blank=True)
    completed_at = DateTimeField(null=True, blank=True)
    
    assigned_to = ForeignKey('Employee', null=True, blank=True)
    created_by = ForeignKey('User')
```

---

### ❌ **5. OrderItem Model** (OPTIONAL but RECOMMENDED)
```python
# For detailed order line items
class OrderItem(TimestampedModel):
    order = ForeignKey('Order', related_name='items')
    
    product_name = CharField(max_length=255)
    description = TextField(null=True, blank=True)
    quantity = DecimalField(max_digits=10, decimal_places=2)
    unit_price = DecimalField(max_digits=12, decimal_places=2)
    total_price = DecimalField(max_digits=12, decimal_places=2)
    
    notes = TextField(null=True, blank=True)
```

---

## 📋 MIGRATION STEPS REQUIRED

### Phase 1: Database Schema Updates (⚠️ REQUIRES APPROVAL)

1. **Create new models:**
   - Issue model
   - Order model
   - Payment model
   - Activity model
   - OrderItem model (optional)

2. **Generate migrations:**
   ```bash
   python manage.py makemigrations
   ```

3. **Review migration files** - STOP and show to user

4. **Run migrations** (after approval):
   ```bash
   python manage.py migrate
   ```

---

### Phase 2: Backend API Development

1. **Create Serializers:**
   - IssueSerializer
   - OrderSerializer
   - PaymentSerializer
   - ActivitySerializer

2. **Create ViewSets:**
   - IssueViewSet (CRUD operations)
   - OrderViewSet (CRUD operations)
   - PaymentViewSet (CRUD operations)
   - ActivityViewSet (CRUD operations)

3. **Add URL Routes:**
   - `/api/issues/`
   - `/api/orders/`
   - `/api/payments/`
   - `/api/activities/`

4. **Create Lookup Endpoints:**
   - `/api/lookups/issue-categories/`
   - `/api/lookups/issue-statuses/`
   - `/api/lookups/issue-priorities/`
   - `/api/lookups/order-statuses/`
   - `/api/lookups/payment-statuses/`
   - `/api/lookups/activity-types/`
   - `/api/lookups/activity-statuses/`

---

### Phase 3: Frontend Service Layer

1. **Create new service files:**
   - `issue.service.ts`
   - `order.service.ts`
   - `payment.service.ts`
   
2. **Update existing services:**
   - `activity.service.ts` (currently exists but may use mock data)

3. **Create lookup service:**
   - `lookup.service.ts` for all dropdown options

---

### Phase 4: Frontend Component Updates

1. **Replace hardcoded data with API calls:**
   - ClientIssuesPage
   - ClientOrdersPage
   - ClientPaymentsPage
   - ActivitiesPage
   - All filter components
   - All dialog/form components

2. **Add loading states and error handling**

3. **Deprecate `mockData.ts`**

---

## 📊 SUMMARY

### Total Hardcoded Data Found:
- ✅ **5 pages** with existing backend support (Customers, Leads, Deals, Vendors)
- ❌ **4 pages** requiring NEW models (Issues, Orders, Payments, Activities)
- 🔧 **12+ dropdown/option lists** needing API endpoints
- 📦 **300+ lines** of mock data in `mockData.ts`

### Database Impact:
- **4 NEW TABLES** required (Issue, Order, Payment, Activity)
- **1 OPTIONAL TABLE** (OrderItem)
- **Estimated migration time:** 2-3 hours (coding) + testing

---

## ⚠️ NEXT STEPS - AWAITING YOUR APPROVAL

**I've identified the following database changes needed:**

1. Create `Issue` model with fields for tracking vendor/order issues
2. Create `Order` model for purchase/service orders
3. Create `Payment` model for payment tracking
4. Create `Activity` model for customer interactions

**Before I proceed, I need your approval to:**
1. Create these new Django models
2. Generate the database migrations
3. Show you the migration files for review
4. Execute the migrations (only after your review)

**Would you like me to:**
- A) Proceed with creating the models and show you the migration plan?
- B) Start with just one module (e.g., Issues) as a proof of concept?
- C) Review the proposed model structures first before I create anything?
- D) Something else?

Please let me know how you'd like to proceed!
