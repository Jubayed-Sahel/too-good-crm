# Multi-Vendor Customer Support Fix

## Overview
This document explains the fix implemented to properly support **many-to-many relationships** between customers and vendors, allowing:
- A **vendor** to add multiple customers (create new OR link existing)
- A **customer** to be associated with multiple vendors
- Proper use of the `CustomerOrganization` junction table

## Problem Statement

### The Issue
When trying to add the same customer (with the same email) from a different vendor profile, the system would fail because:

1. **Overly Restrictive Email Validation**: The `CustomerCreateSerializer` validated email uniqueness **per organization**, which prevented linking existing customers to new vendors.

2. **No Auto-Linking Logic**: The system had no mechanism to automatically detect and link existing customers when a different vendor tried to add them.

3. **Duplicate Customer Records**: The database schema allowed duplicate customer emails, but the serializer tried to prevent it, leading to confusion.

### The Root Cause
```python
# OLD CODE - In CustomerCreateSerializer.validate_email()
if Customer.objects.filter(
    organization_id=organization,  # Only checked current vendor's org
    email__iexact=value
).exists():
    raise serializers.ValidationError(
        "A customer with this email already exists in your organization."
    )
```

This validation:
- ❌ Only checked if customer existed in **current vendor's organization**
- ❌ Did NOT check if customer existed **globally**
- ❌ Did NOT auto-link to existing customer from other vendors

---

## The Fix

### 1. Updated `CustomerViewSet.perform_create()` 
**File**: `shared-backend/crmApp/viewsets/customer.py`

**What Changed**:
```python
def perform_create(self, serializer):
    """
    Create customer or link to existing customer.
    Multi-vendor support: If a customer with the same email exists,
    create a CustomerOrganization link instead of a duplicate customer.
    """
    email = serializer.validated_data.get('email')
    organization_id = get_organization_from_context()
    
    # CHECK FOR EXISTING CUSTOMER
    if email and organization_id:
        existing_customer = Customer.objects.filter(email__iexact=email).first()
        
        if existing_customer:
            # CREATE OR UPDATE CustomerOrganization LINK
            customer_org, created = CustomerOrganization.objects.get_or_create(
                customer=existing_customer,
                organization_id=organization_id,
                defaults={'relationship_status': 'active'}
            )
            
            # RETURN EXISTING CUSTOMER (no duplicate)
            serializer.instance = existing_customer
            return existing_customer
    
    # CREATE NEW CUSTOMER
    return serializer.save(organization_id=organization_id)
```

**Benefits**:
- ✅ Checks if customer exists **globally** (by email)
- ✅ Auto-creates `CustomerOrganization` link if customer exists
- ✅ Prevents duplicate customer records
- ✅ Returns existing customer data to caller

---

### 2. Simplified `CustomerCreateSerializer.validate_email()`
**File**: `shared-backend/crmApp/serializers/customer.py`

**What Changed**:
```python
def validate_email(self, value):
    """
    Validate email format and handle multi-vendor scenarios.
    
    Note: Email is NOT unique per organization to support multi-vendor.
    The same customer email can exist across multiple vendor organizations
    through the CustomerOrganization junction table.
    """
    if not value:
        return value
    
    # Just validate format and normalize - uniqueness handled in perform_create
    return value.lower() if value else value
```

**Benefits**:
- ✅ Removed restrictive per-organization uniqueness check
- ✅ Allows same email across vendors (handled by junction table)
- ✅ Validation logic moved to `perform_create` where it belongs

---

### 3. Updated `get_customer_vendor_organizations()`
**File**: `shared-backend/crmApp/utils/profile_context.py`

**What Changed**:
```python
def get_customer_vendor_organizations(user: User) -> List[Organization]:
    """
    Get all vendor organizations where the user is a customer.
    Uses the CustomerOrganization junction table for proper many-to-many support.
    """
    # Get organization IDs from CustomerOrganization (proper M2M)
    organization_ids = Customer.objects.filter(
        user=user
    ).values_list('organizations__id', flat=True).distinct()
    
    # Get organization objects
    organizations = Organization.objects.filter(id__in=organization_ids)
    return list(organizations)
```

**Benefits**:
- ✅ Uses `organizations` M2M field (through `CustomerOrganization`)
- ✅ Returns ALL vendor organizations customer is linked to
- ✅ Properly supports multiple vendors per customer

---

## How It Works Now

### Scenario 1: Vendor A Creates Customer
```
1. Vendor A creates customer: john@example.com
2. System creates:
   - Customer(id=1, email="john@example.com", organization=Vendor_A)
   - CustomerOrganization(customer=1, organization=Vendor_A)
3. Result: ✅ Customer created successfully
```

### Scenario 2: Vendor B Adds Same Customer
```
1. Vendor B tries to add: john@example.com
2. System detects existing customer (id=1)
3. System creates/updates:
   - CustomerOrganization(customer=1, organization=Vendor_B)
4. Result: ✅ Customer linked to Vendor B (NO DUPLICATE)
```

### Scenario 3: Customer Views Their Vendors
```
1. Customer john@example.com logs in
2. System queries CustomerOrganization:
   - customer=1, organization=Vendor_A
   - customer=1, organization=Vendor_B
3. Result: ✅ Customer sees BOTH vendors in "My Vendors" page
```

---

## API Endpoints

### For Vendors (Adding Customers)
```bash
# POST /api/customers/
# Automatically creates OR links existing customer
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company_name": "Acme Corp"
}

Response:
- If customer exists: Returns existing customer + creates CustomerOrganization link
- If customer new: Creates new customer + CustomerOrganization
```

### For Customers (Viewing Vendors)
```bash
# GET /api/customers/{customer_id}/vendors/
# Returns all vendors the customer is associated with

Response:
[
  {
    "id": 1,
    "customer": 123,
    "organization": 10,
    "organization_name": "Vendor A",
    "relationship_status": "active",
    ...
  },
  {
    "id": 2,
    "customer": 123,
    "organization": 20,
    "organization_name": "Vendor B",
    "relationship_status": "active",
    ...
  }
]
```

### Alternative: List Vendors (Customer Profile)
```bash
# GET /api/vendors/?organization={org_id}
# Customer sees vendors they're linked to through OrganizationFilterMixin
```

---

## Database Schema

### Customer Model
```python
class Customer(models.Model):
    email = models.EmailField()  # NOT unique - allows M2M
    organization = ForeignKey('Organization')  # Primary org (backward compat)
    organizations = ManyToManyField('Organization', through='CustomerOrganization')
    user = ForeignKey('User')  # Link to User account
```

### CustomerOrganization (Junction Table)
```python
class CustomerOrganization(models.Model):
    customer = ForeignKey('Customer')
    organization = ForeignKey('Organization')
    relationship_status = CharField()  # active/inactive/prospect
    vendor_notes = TextField()  # Vendor-specific notes
    credit_limit = DecimalField()  # Vendor-specific terms
    
    class Meta:
        unique_together = [('customer', 'organization')]  # One link per pair
```

---

## Key Features

### 1. Automatic Customer Linking
- ✅ No duplicate customers with same email
- ✅ Seamless linking across vendors
- ✅ Maintains separate vendor-specific relationship data

### 2. Per-Vendor Relationship Metadata
Each `CustomerOrganization` can have:
- Different `relationship_status` (active/inactive/prospect)
- Different `assigned_employee`
- Different `vendor_notes`
- Different `credit_limit` and `payment_terms`
- Separate `relationship_started` and `last_interaction` timestamps

### 3. Multi-Vendor Customer Portal
Customers can:
- See all vendors they're associated with
- Have one User account across all vendors
- Maintain separate relationships with each vendor
- Access data from all vendors they work with

---

## Testing

### Test Case 1: Same Email, Different Vendors
```python
# Vendor A creates customer
response = client.post('/api/customers/', {
    'email': 'test@example.com',
    'name': 'Test User'
}, headers={'X-Active-Organization': vendor_a_id})

customer_id = response.json()['id']

# Vendor B adds same customer
response = client.post('/api/customers/', {
    'email': 'test@example.com',
    'name': 'Test User'
}, headers={'X-Active-Organization': vendor_b_id})

# Should return SAME customer_id
assert response.json()['id'] == customer_id

# Verify CustomerOrganization links
links = CustomerOrganization.objects.filter(customer_id=customer_id)
assert links.count() == 2
assert {link.organization_id for link in links} == {vendor_a_id, vendor_b_id}
```

### Test Case 2: Customer Sees Multiple Vendors
```python
# Customer logs in
customer_user = User.objects.get(email='test@example.com')

# Get vendors
response = client.get(f'/api/customers/{customer_id}/vendors/', 
                      headers={'Authorization': f'Bearer {customer_token}'})

vendors = response.json()
assert len(vendors) == 2
assert {v['organization'] for v in vendors} == {vendor_a_id, vendor_b_id}
```

---

## Migration Notes

### No Database Migration Required
- ✅ No schema changes needed
- ✅ Existing `CustomerOrganization` table already supports M2M
- ✅ Backward compatible with existing data

### Existing Data Compatibility
- ✅ Customers with `organization` field still work (backward compat)
- ✅ New customers automatically get `CustomerOrganization` entry
- ✅ Multi-vendor linking works for both old and new customers

---

## Summary

### What Was Fixed
1. ✅ Removed overly restrictive email validation
2. ✅ Added automatic customer linking logic
3. ✅ Updated customer-vendor relationship query to use M2M
4. ✅ Proper support for `CustomerOrganization` junction table

### Benefits
- 🎯 True multi-vendor CRM platform
- 🎯 No duplicate customer records
- 🎯 Seamless vendor linking
- 🎯 Customer sees all their vendors
- 🎯 Vendor-specific relationship metadata
- 🎯 Backward compatible with existing data

### Impact
- **Vendors**: Can now add customers without worrying about duplicates
- **Customers**: Can see all vendors they work with in one portal
- **System**: Properly leverages M2M relationship design
- **Data**: Clean, normalized, no duplicates

---

## Implementation Date
**Date**: November 29, 2025  
**Version**: 1.0  
**Status**: ✅ IMPLEMENTED AND TESTED

