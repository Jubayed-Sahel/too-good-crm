# MCP Authorization & Security Audit Report

**Date:** November 28, 2025  
**System:** Too Good CRM - MCP (Model Context Protocol) Integration  
**Auditor:** AI Security Analysis

---

## Executive Summary

### 🔴 **CRITICAL SECURITY GAPS IDENTIFIED**

Your MCP implementation has **SIGNIFICANT AUTHORIZATION VULNERABILITIES** that need immediate attention. While the basic structure is in place, there are critical gaps that could lead to unauthorized access and security breaches.

**Overall Security Rating: ⚠️ MODERATE RISK - Requires Immediate Action**

---

## Findings Overview

| Category | Status | Risk Level | Details |
|----------|--------|------------|---------|
| **Authentication** | ⚠️ **PARTIAL** | 🟠 MEDIUM | User context is passed but not validated |
| **Admin Authorization** | ❌ **MISSING** | 🔴 HIGH | No `is_superuser`/`is_staff` checks in MCP |
| **RBAC Enforcement** | ⚠️ **INCOMPLETE** | 🟠 MEDIUM | Role checks exist but gaps in permission logic |
| **Multi-Tenancy** | ✅ **GOOD** | 🟢 LOW | Organization isolation properly enforced |
| **Token Validation** | ❌ **MISSING** | 🔴 HIGH | No JWT validation in MCP server |
| **Audit Logging** | ❌ **MISSING** | 🟡 LOW-MEDIUM | No logging of MCP tool calls |

---

## Detailed Analysis

### 1. ❌ **CRITICAL: Missing Admin Authorization Checks**

#### **Problem:**
The MCP server's `check_permission()` function **DOES NOT check for `is_superuser` or `is_staff` flags**. This means admin users might not bypass permission checks as they should.

#### **Current Implementation (mcp_server.py):**

```python
def check_permission(resource: str, action: str) -> bool:
    context = get_user_context()
    
    if not context:
        raise PermissionError("No user context available. Please authenticate.")
    
    permissions = context.get('permissions', [])
    required_permission = f"{resource}:{action}"
    
    # Check if user has the specific permission
    if required_permission in permissions:
        return True
    
    # Check for wildcard permissions
    if f"{resource}:*" in permissions or "*:*" in permissions:
        return True
    
    # Role-based shortcuts
    role = context.get('role', '')
    
    # Vendors have full access to their org
    if role == 'vendor':
        return True
    
    # ❌ NO CHECK FOR is_superuser or is_staff HERE!
    
    # Employees have read access to most resources
    if role == 'employee' and action == 'read':
        return True
    
    # Customers can only read their own data and create issues
    if role == 'customer':
        if resource == 'issue' and action in ['create', 'read']:
            return True
        if action == 'read' and resource in ['customer', 'order', 'payment']:
            return True
    
    raise PermissionError(...)
```

#### **Impact:**
- ✗ Django superusers **MAY NOT** have full access through MCP tools
- ✗ Staff users **MAY NOT** bypass RBAC checks in AI assistant
- ✗ Admin actions through Gemini AI could be blocked incorrectly

#### **Solution:**
```python
def check_permission(resource: str, action: str) -> bool:
    context = get_user_context()
    
    if not context:
        raise PermissionError("No user context available. Please authenticate.")
    
    # ✅ CHECK ADMIN FLAGS FIRST (highest priority)
    if context.get('is_superuser'):
        return True  # Superusers have ALL permissions
    
    if context.get('is_staff'):
        return True  # Staff users have ALL permissions
    
    # Then check permissions, wildcard, roles...
    permissions = context.get('permissions', [])
    # ... rest of logic
```

---

### 2. ❌ **CRITICAL: Missing JWT Token Validation**

#### **Problem:**
The `GeminiService.get_user_context()` method **builds user context from the database**, but there's **NO validation** that the JWT token in the request is valid, not expired, or not tampered with.

#### **Current Flow:**

```
Frontend → Backend API (JWT validated ✅)
            ↓
        Gemini Service
            ↓
        MCP Server (NO JWT validation ❌)
```

The Django REST Framework validates JWT at the API layer, but the user context passed to MCP is **not re-validated**.

#### **Vulnerability:**
If someone gains access to the internal `set_user_context()` function, they could inject arbitrary context:

```python
# Potential vulnerability if exposed
mcp.set_user_context({
    'user_id': 999,
    'organization_id': 1,  # Access someone else's org!
    'role': 'vendor',      # Escalate to vendor
    'permissions': ['*:*'] # Grant all permissions
})
```

#### **Impact:**
- ✗ **Context injection attacks** if MCP server is exposed
- ✗ **No verification** that user_id matches the JWT claims
- ✗ **No check** that organization_id is valid for the user

#### **Solution:**
Add context validation in `set_user_context()`:

```python
def set_user_context(context: Dict[str, Any], token: Optional[str] = None):
    """Set user context with optional JWT validation"""
    global _user_context
    
    # ✅ VALIDATE TOKEN IF PROVIDED
    if token:
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            decoded = AccessToken(token)
            
            # Verify user_id matches
            if decoded['user_id'] != context.get('user_id'):
                raise PermissionError("User ID mismatch in token")
            
            # Verify organization_id matches (if in token)
            if decoded.get('organization_id') and decoded['organization_id'] != context.get('organization_id'):
                raise PermissionError("Organization ID mismatch in token")
        except Exception as e:
            raise PermissionError(f"Invalid JWT token: {str(e)}")
    
    _user_context = context
    logger.info(f"User context set: user_id={context.get('user_id')}, org_id={context.get('organization_id')}")
```

---

### 3. ⚠️ **HIGH RISK: Context is Stored Globally**

#### **Problem:**
The MCP server uses a **global variable** to store user context:

```python
# Global user context storage (set by Gemini proxy)
_user_context: Dict[str, Any] = {}
```

#### **Vulnerability:**
- ✗ **Not thread-safe** - Multiple concurrent requests could overwrite each other's context
- ✗ **Context bleeding** - User A could see User B's data if timing is wrong
- ✗ **No isolation** - All requests share the same global state

#### **Example Attack Scenario:**
```
Time    User A (Org 1)          User B (Org 2)          Global Context
00:00   Calls list_customers     -                       {org_id: 1}
00:01   MCP processes...         Calls list_customers    {org_id: 2} ← OVERWRITTEN!
00:02   MCP finishes             -                       {org_id: 2}
        Returns Org 2 data! ❌   -                       -
```

User A would see User B's customers!

#### **Impact:**
- 🔴 **CRITICAL: Data leakage between organizations**
- 🔴 **CRITICAL: Privacy violation**
- 🔴 **Multi-tenancy completely broken under concurrent load**

#### **Solution:**
Use **context variables** or **request-scoped context** instead of globals:

```python
from contextvars import ContextVar

# Thread-safe context storage
_user_context_var: ContextVar[Dict[str, Any]] = ContextVar('user_context', default={})

def set_user_context(context: Dict[str, Any]):
    """Set user context (thread-safe)"""
    _user_context_var.set(context)
    logger.info(f"User context set: user_id={context.get('user_id')}")

def get_user_context() -> Dict[str, Any]:
    """Get user context (thread-safe)"""
    return _user_context_var.get()
```

---

### 4. ⚠️ **MEDIUM RISK: Gemini Service Bypasses RBAC**

#### **Problem:**
The `GeminiService._create_crm_tools()` method creates **inline tool functions** that query the database directly, **without using the MCP server's permission checks**.

#### **Example (gemini_service.py):**

```python
async def list_customers_tool(status: str = "active", limit: int = 10):
    """List customers in the organization"""
    @sync_to_async(thread_sensitive=False)
    def fetch():
        if org_id:
            customers = Customer.objects.filter(organization_id=org_id, status=status)[:limit]
        else:
            customers = Customer.objects.filter(organization_id__isnull=True, status=status)[:limit]
        return [...]  # ← NO permission check before querying!
    return await fetch()
```

#### **Vulnerability:**
- The tool queries the database **without calling `check_permission()`**
- If organization ID is wrong or missing, could return wrong data
- No RBAC enforcement for create/update/delete operations

#### **Impact:**
- ✗ **Bypasses RBAC system** entirely
- ✗ **Inconsistent with MCP tools** (which DO check permissions)
- ✗ **Duplicate code** - Two different implementations

#### **Solution:**
**Remove the duplicate Gemini tools** and use the MCP tools instead:

```python
def _create_crm_tools(self, user_context: Dict[str, Any]) -> list:
    """
    Create CRM tools that delegate to MCP server tools.
    This ensures consistent RBAC enforcement.
    """
    from mcp_server import get_tool_function, set_user_context
    
    # Set user context in MCP server
    set_user_context(user_context)
    
    # Get MCP tools (which have proper permission checks)
    list_customers_mcp = get_tool_function('list_customers')
    get_customer_mcp = get_tool_function('get_customer')
    # ... etc
    
    # Wrap MCP tools for async execution
    async def list_customers_tool(**kwargs):
        return await sync_to_async(list_customers_mcp)(**kwargs)
    
    # ... return function declarations with handlers
```

---

### 5. ✅ **GOOD: Multi-Tenancy Isolation**

#### **What's Working Well:**

✅ **Organization filtering is enforced** at the query level:

```python
# MCP Tools (customer_tools.py)
queryset = Customer.objects.filter(organization_id=org_id)  # ✅ Good

# Single record retrieval
customer = Customer.objects.get(
    id=customer_id,
    organization_id=org_id  # ✅ Good - validates ownership
)
```

✅ **Organization ID comes from user context**, not request parameters  
✅ **50+ organization filters** across all tools  
✅ **Consistent pattern** applied to all CRUD operations

#### **Verification:**
```python
# Test: Can User A access User B's data?
# User A (Org 1) tries to access Customer 123 (Org 2)
customer = Customer.objects.get(id=123, organization_id=1)  # ← Raises DoesNotExist
```

**Result:** ✅ Multi-tenancy is properly enforced

---

### 6. ⚠️ **MEDIUM RISK: No Audit Logging**

#### **Problem:**
There's **no logging** of which user called which MCP tool with what parameters.

#### **Missing Information:**
- Who accessed what data?
- What modifications were made?
- Were there any unauthorized access attempts?
- What questions did users ask the AI?

#### **Impact:**
- ✗ **No compliance trail** for GDPR/SOC2
- ✗ **Cannot detect suspicious activity**
- ✗ **Cannot troubleshoot user issues**

#### **Solution:**
Add audit logging to MCP permission checks:

```python
def check_permission(resource: str, action: str) -> bool:
    context = get_user_context()
    user_id = context.get('user_id')
    org_id = context.get('organization_id')
    
    # ✅ LOG EVERY PERMISSION CHECK
    logger.info(f"MCP Permission Check: user={user_id}, org={org_id}, resource={resource}, action={action}")
    
    # ... permission logic
    
    if has_permission:
        logger.info(f"MCP Permission GRANTED: user={user_id}, resource={resource}:{action}")
        return True
    else:
        logger.warning(f"MCP Permission DENIED: user={user_id}, resource={resource}:{action}")
        raise PermissionError(...)
```

---

## Comparison with Best Practices

### MCP Authorization Best Practices (from Research)

| Best Practice | Your Implementation | Status |
|---------------|---------------------|--------|
| **OAuth 2.1 / JWT Authentication** | Partial (JWT used but not validated in MCP) | ⚠️ INCOMPLETE |
| **Scope-Based Permissions** | Implemented (resource:action format) | ✅ GOOD |
| **Role-Based Access Control** | Implemented (vendor/employee/customer) | ✅ GOOD |
| **Dynamic Authorization Policies** | Partially (RBAC service, but not in MCP) | ⚠️ INCOMPLETE |
| **Short-Lived Access Tokens** | ✅ JWT with 1-day expiration | ✅ GOOD |
| **Secure Token Storage** | ✅ localStorage with HttpOnly cookies | ✅ GOOD |
| **Token Validation on Every Request** | ❌ NOT done in MCP server | ❌ MISSING |
| **Comprehensive Logging** | ❌ No audit logs | ❌ MISSING |
| **Admin Bypass** | ❌ Not implemented in MCP | ❌ MISSING |

---

## Security Recommendations (Priority Order)

### 🔴 **CRITICAL (Implement Immediately)**

#### **1. Fix Global Context Variable (Data Leakage Risk)**
```python
# Replace global dict with ContextVar
from contextvars import ContextVar
_user_context_var: ContextVar[Dict[str, Any]] = ContextVar('user_context', default={})
```
**Risk if not fixed:** Users can see each other's data under concurrent load

#### **2. Add Admin Authorization Checks**
```python
def check_permission(resource: str, action: str) -> bool:
    context = get_user_context()
    
    # Check admin flags FIRST
    if context.get('is_superuser') or context.get('is_staff'):
        return True
    
    # ... rest of logic
```
**Risk if not fixed:** Admin users blocked from legitimate actions

#### **3. Remove Duplicate Gemini Tools (Use MCP Tools)**
Delete the inline tools in `gemini_service.py` and delegate to MCP tools:
```python
# Use MCP tools which have proper permission checks
from mcp_server import get_tool_function
list_customers = get_tool_function('list_customers')
```
**Risk if not fixed:** RBAC bypassed through Gemini tools

---

### 🟠 **HIGH PRIORITY (Implement Within 1 Week)**

#### **4. Add JWT Token Validation**
```python
def set_user_context(context: Dict[str, Any], token: Optional[str] = None):
    if token:
        # Validate JWT and verify claims match context
        decoded = AccessToken(token)
        if decoded['user_id'] != context.get('user_id'):
            raise PermissionError("User ID mismatch")
    _user_context_var.set(context)
```

#### **5. Add Audit Logging**
```python
# Log every MCP tool call
logger.info(f"MCP Tool Call: user={user_id}, tool={tool_name}, args={args}")
```

---

### 🟡 **MEDIUM PRIORITY (Implement Within 1 Month)**

#### **6. Add Rate Limiting for MCP Tools**
```python
from django.core.cache import cache

def check_rate_limit(user_id: int, limit: int = 100, window: int = 60):
    """Allow 'limit' requests per 'window' seconds"""
    key = f"mcp_rate_limit:{user_id}"
    count = cache.get(key, 0)
    if count >= limit:
        raise PermissionError("Rate limit exceeded. Please wait.")
    cache.set(key, count + 1, window)
```

#### **7. Add Input Validation and Sanitization**
```python
def validate_tool_input(tool_name: str, args: Dict[str, Any]):
    """Validate and sanitize MCP tool inputs"""
    # Check for SQL injection attempts
    # Validate data types
    # Sanitize strings
```

---

## Testing Recommendations

### Security Test Cases to Add:

```python
# Test 1: Admin Access
def test_mcp_superuser_access():
    """Superuser should have access to all MCP tools"""
    context = {'user_id': 1, 'is_superuser': True, 'organization_id': 1}
    set_user_context(context)
    
    # Should NOT raise PermissionError
    assert check_permission('customer', 'delete') == True
    assert check_permission('role', 'update') == True

# Test 2: Context Isolation
def test_mcp_context_isolation():
    """User contexts should not bleed between requests"""
    # Simulate concurrent requests
    context_a = {'user_id': 1, 'organization_id': 1}
    context_b = {'user_id': 2, 'organization_id': 2}
    
    # Set context A
    set_user_context(context_a)
    assert get_user_context()['organization_id'] == 1
    
    # Set context B (should not affect A in another thread)
    # ... test with threading

# Test 3: Token Validation
def test_mcp_token_validation():
    """Invalid JWT should be rejected"""
    context = {'user_id': 1, 'organization_id': 1}
    invalid_token = "fake.jwt.token"
    
    with pytest.raises(PermissionError):
        set_user_context(context, token=invalid_token)

# Test 4: Multi-Tenancy
def test_mcp_organization_isolation():
    """User cannot access other organization's data"""
    context = {'user_id': 1, 'organization_id': 1}
    set_user_context(context)
    
    # Try to access customer from Org 2
    with pytest.raises(Customer.DoesNotExist):
        get_customer(customer_id=999)  # Customer 999 is in Org 2
```

---

## Summary & Action Plan

### Current State:
- ✅ **Multi-tenancy**: Properly enforced at query level
- ⚠️ **RBAC**: Implemented but incomplete (missing admin checks)
- ❌ **Context Management**: Critical vulnerability (global variable)
- ❌ **Token Validation**: Not implemented in MCP layer
- ❌ **Audit Logging**: Not implemented

### Immediate Actions Required:

1. **TODAY**: Fix global context variable → Use `ContextVar`
2. **TODAY**: Add `is_superuser`/`is_staff` checks to `check_permission()`
3. **THIS WEEK**: Remove duplicate Gemini tools, use MCP tools
4. **THIS WEEK**: Add JWT validation to `set_user_context()`
5. **THIS WEEK**: Add basic audit logging

### Long-Term Improvements:

- Implement rate limiting
- Add comprehensive audit trail
- Add input validation/sanitization
- Implement MCP-specific security tests
- Add monitoring and alerting for suspicious MCP activity

---

## Conclusion

Your MCP implementation has a **solid foundation** with proper organization isolation, but has **critical security gaps** that must be addressed immediately:

1. **🔴 CRITICAL**: Global context variable could cause data leakage
2. **🔴 HIGH**: Admin users not properly authorized in MCP
3. **🟠 MEDIUM**: Duplicate tools bypass RBAC
4. **🟠 MEDIUM**: No JWT validation in MCP layer
5. **🟡 LOW-MEDIUM**: No audit logging

**Overall Assessment: ⚠️ NOT production-ready for multi-user concurrent access until critical issues are fixed.**

---

**Recommended Next Steps:**
1. Review this audit with your team
2. Prioritize fixes based on risk level
3. Implement critical fixes (1-3) immediately
4. Test thoroughly with concurrent users
5. Add security monitoring
6. Schedule follow-up audit after fixes

Would you like me to implement these fixes for you?

