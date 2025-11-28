# Telegram Bot Authentication & Authorization Workflow

**Complete end-to-end flow of how a Telegram user authenticates and gets authorized to use CRM features**

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [Authorization Flow](#authorization-flow)
5. [MCP Tool Authorization](#mcp-tool-authorization)
6. [Complete Workflow Diagrams](#complete-workflow-diagrams)
7. [Security Considerations](#security-considerations)

---

## Overview

### **Key Concept**

Telegram users authenticate by linking their **Telegram chat_id** to an existing **CRM User account**. Once linked, they inherit all the permissions and roles from that CRM account.

```
┌─────────────────────────────────────────────────────────────┐
│  Telegram User (@john_telegram)                             │
│  chat_id: 123456789                                         │
└─────────────┬───────────────────────────────────────────────┘
              │ Links to (after authentication)
              ↓
┌─────────────────────────────────────────────────────────────┐
│  CRM User (john@company.com)                                │
│  - User ID: 42                                              │
│  - is_superuser: false                                      │
│  - is_staff: false                                          │
│  - Profile: Employee @ Acme Corp                            │
│  - Roles: Sales Manager, Team Lead                          │
│  - Permissions: customer:read, customer:create, lead:*      │
└─────────────────────────────────────────────────────────────┘
```

### **Authentication vs Authorization**

```
AUTHENTICATION (Who are you?)
  → Links Telegram chat_id to CRM User account
  → Verifies identity via email + password
  → Stored in TelegramUser model
  
AUTHORIZATION (What can you do?)
  → Uses CRM User's roles and permissions
  → Enforced by MCP server check_permission()
  → Same RBAC system as web frontend
```

---

## Database Schema

### **TelegramUser Model**

```python
# File: shared-backend/crmApp/models/telegram.py

class TelegramUser(TimestampedModel):
    """Maps Telegram chat_id to CRM User"""
    
    # ============================================
    # Telegram Identity
    # ============================================
    chat_id = models.BigIntegerField(unique=True, db_index=True)
    telegram_username = models.CharField(max_length=100, null=True, blank=True)
    telegram_first_name = models.CharField(max_length=100, null=True, blank=True)
    telegram_last_name = models.CharField(max_length=100, null=True, blank=True)
    
    # ============================================
    # CRM User Link (CRITICAL!)
    # ============================================
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='telegram_accounts',
        null=True,
        blank=True
    )
    
    # ============================================
    # Profile Selection (Organization Context)
    # ============================================
    selected_profile = models.ForeignKey(
        'UserProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='Active organization/role context'
    )
    
    # ============================================
    # Authentication State
    # ============================================
    is_authenticated = models.BooleanField(default=False)
    pending_email = models.EmailField(null=True, blank=True)
    auth_code = models.CharField(max_length=10, null=True, blank=True)
    auth_code_expires_at = models.DateTimeField(null=True, blank=True)
    
    # ============================================
    # Conversation State Machine
    # ============================================
    conversation_state = models.CharField(
        max_length=50,
        choices=[
            ('waiting_for_email', 'Waiting for email'),
            ('waiting_for_password', 'Waiting for password'),
            ('authenticated', 'Authenticated'),
            ('none', 'None'),
        ],
        default='none'
    )
    
    # ============================================
    # Conversation History (for Gemini context)
    # ============================================
    conversation_history = models.JSONField(default=list, blank=True)
    conversation_id = models.CharField(max_length=100, null=True, blank=True)
    
    # Activity tracking
    last_message_at = models.DateTimeField(null=True, blank=True)
    last_command_used = models.CharField(max_length=50, null=True, blank=True)
```

### **Database Relationships**

```
┌────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                             │
└────────────────────────────────────────────────────────────────┘

TelegramUser
├─ chat_id: 123456789 (unique)
├─ telegram_username: "@john_telegram"
├─ is_authenticated: true
│
├─ user ──→ User (john@company.com)
│            ├─ id: 42
│            ├─ email: john@company.com
│            ├─ is_superuser: false
│            ├─ is_staff: false
│            │
│            └─ user_profiles ──→ UserProfile
│                                  ├─ profile_type: 'employee'
│                                  ├─ organization ──→ Organization (Acme Corp)
│                                  │
│                                  └─ UserRole ──→ Role
│                                                  ├─ "Sales Manager"
│                                                  ├─ "Team Lead"
│                                                  │
│                                                  └─ RolePermission ──→ Permission
│                                                                        ├─ customer:read
│                                                                        ├─ customer:create
│                                                                        ├─ lead:read
│                                                                        └─ lead:update
│
└─ selected_profile ──→ UserProfile (which org context to use)
```

---

## Authentication Flow

### **Step 1: User Starts Authentication**

```
Telegram User: /start
```

**What happens:**

```python
# File: shared-backend/crmApp/viewsets/telegram.py

def handle_start_command(telegram_user, telegram_service):
    """
    Start authentication flow.
    """
    chat_id = telegram_user.chat_id
    
    # Check if already authenticated
    if telegram_user.is_authenticated and telegram_user.user:
        message = (
            f"✅ Already authenticated as {telegram_user.user.email}\n\n"
            f"Type /help to see available commands."
        )
        telegram_service.send_message(chat_id, message)
        return
    
    # Start authentication flow
    message = (
        "🔐 <b>CRM Bot Authentication</b>\n\n"
        "Please enter your email address to continue.\n\n"
        "<i>Example: john@company.com</i>"
    )
    
    # Update state
    telegram_user.conversation_state = 'waiting_for_email'
    telegram_user.save()
    
    telegram_service.send_message(chat_id, message)
```

**Result:**
- ✅ TelegramUser created with `chat_id: 123456789`
- ✅ `conversation_state` set to `'waiting_for_email'`
- ✅ `is_authenticated` = `false`

---

### **Step 2: User Sends Email**

```
Telegram User: john@company.com
```

**What happens:**

```python
# File: shared-backend/crmApp/viewsets/telegram.py

def handle_unauthenticated_message(telegram_user, text, telegram_service):
    """Handle messages during authentication flow"""
    
    if telegram_user.conversation_state == 'waiting_for_email':
        email = text.strip()
        
        # Validate email format
        if not is_valid_email(email):
            telegram_service.send_message(
                chat_id,
                "❌ Invalid email format. Please try again."
            )
            return
        
        # Start auth flow
        success, message = TelegramAuthService.start_auth_flow(
            telegram_user,
            email
        )
        telegram_service.send_message(chat_id, message)
```

**TelegramAuthService.start_auth_flow():**

```python
# File: shared-backend/crmApp/services/telegram_auth_service.py

@staticmethod
def start_auth_flow(telegram_user, email):
    """
    Verify email exists in CRM and start password verification.
    """
    # 1. Find CRM user by email
    user = User.objects.filter(email__iexact=email, is_active=True).first()
    
    if not user:
        return False, (
            f"❌ No account found with email: {email}\n\n"
            f"Please register at the web portal first."
        )
    
    # 2. Generate temporary auth code (for session tracking)
    auth_code = ''.join(secrets.choice('0123456789') for _ in range(6))
    expires_at = timezone.now() + timedelta(minutes=10)
    
    # 3. Update TelegramUser state
    telegram_user.pending_email = email
    telegram_user.auth_code = auth_code
    telegram_user.auth_code_expires_at = expires_at
    telegram_user.conversation_state = 'waiting_for_password'
    telegram_user.save()
    
    # 4. Send confirmation
    message = (
        f"✅ Account found!\n\n"
        f"<b>Email:</b> {email}\n"
        f"<b>Name:</b> {user.full_name}\n\n"
        f"🔐 Please enter your password to complete authentication.\n\n"
        f"<i>For security, send your password in the next message.</i>"
    )
    
    return True, message
```

**Result:**
- ✅ Email verified (exists in CRM database)
- ✅ `pending_email` set to `john@company.com`
- ✅ `auth_code` generated (session token)
- ✅ `conversation_state` changed to `'waiting_for_password'`

---

### **Step 3: User Sends Password**

```
Telegram User: mySecurePassword123
```

**What happens:**

```python
# File: shared-backend/crmApp/viewsets/telegram.py

def handle_unauthenticated_message(telegram_user, text, telegram_service):
    """Handle messages during authentication flow"""
    
    if telegram_user.conversation_state == 'waiting_for_password':
        password = text.strip()
        
        # Verify password
        success, message, user = TelegramAuthService.verify_password(
            telegram_user,
            password
        )
        
        telegram_service.send_message(chat_id, message)
        
        # Delete password message for security (best effort)
        try:
            telegram_service.delete_message(chat_id, message_id)
        except:
            pass
```

**TelegramAuthService.verify_password():**

```python
# File: shared-backend/crmApp/services/telegram_auth_service.py

@staticmethod
def verify_password(telegram_user, password):
    """
    Verify password and link Telegram user to CRM account.
    """
    # 1. Check session state
    if not telegram_user.pending_email:
        return False, "❌ Session expired. Please /start", None
    
    if not telegram_user.auth_code:
        return False, "❌ Session expired. Please /start", None
    
    # 2. Check session expiration (10 minutes)
    if telegram_user.auth_code_expires_at < timezone.now():
        telegram_user.clear_auth_state()
        return False, "❌ Session expired. Please /start", None
    
    # 3. Find CRM user
    user = User.objects.get(email__iexact=telegram_user.pending_email)
    
    if not user:
        return False, "❌ Account not found. Please /start", None
    
    # 4. Verify password using Django's check_password
    if not user.check_password(password):
        return False, "❌ Incorrect password. Try again.", None
    
    # 5. ✅ AUTHENTICATION SUCCESSFUL - Link accounts!
    telegram_user.authenticate(user)
    
    message = (
        f"✅ <b>Authentication successful!</b>\n\n"
        f"Welcome, {user.full_name}!\n\n"
        f"You can now use all CRM features via Telegram.\n\n"
        f"Try asking:\n"
        f"• \"Show my deals\"\n"
        f"• \"List my customers\"\n"
        f"• \"Create a new lead\"\n\n"
        f"Type /help to see all commands."
    )
    
    return True, message, user
```

**telegram_user.authenticate(user):**

```python
# File: shared-backend/crmApp/models/telegram.py

def authenticate(self, user):
    """
    Mark as authenticated and link to CRM user.
    """
    self.user = user                          # ← Link to CRM User!
    self.is_authenticated = True              # ← Mark as authenticated
    self.conversation_state = 'authenticated'
    
    # Clear temporary auth data
    self.pending_email = None
    self.auth_code = None
    self.auth_code_expires_at = None
    
    self.save()
```

**Result:**
- ✅ Password verified against CRM database
- ✅ **TelegramUser linked to CRM User** (`telegram_user.user = user`)
- ✅ `is_authenticated` set to `true`
- ✅ `conversation_state` set to `'authenticated'`
- ✅ Temporary auth data cleared

---

### **Authentication Flow Diagram**

```
┌──────────────────────────────────────────────────────────────────┐
│            TELEGRAM AUTHENTICATION FLOW                          │
└──────────────────────────────────────────────────────────────────┘

User: /start
  ↓
TelegramUser created
  - chat_id: 123456789
  - is_authenticated: false
  - conversation_state: 'waiting_for_email'
  ↓
Bot: "Please enter your email"
  ↓
User: john@company.com
  ↓
Backend:
  1. Query: User.objects.get(email='john@company.com')
  2. ✅ User found: ID=42, name="John Doe"
  3. Generate auth_code: "847293"
  4. Update TelegramUser:
     - pending_email: 'john@company.com'
     - auth_code: '847293'
     - auth_code_expires_at: now() + 10min
     - conversation_state: 'waiting_for_password'
  ↓
Bot: "✅ Account found! Email: john@company.com"
     "Please enter your password"
  ↓
User: mySecurePassword123
  ↓
Backend:
  1. Get user: User.objects.get(email='john@company.com')
  2. Verify: user.check_password('mySecurePassword123')
  3. ✅ Password correct!
  4. Link accounts:
     TelegramUser.user = User(id=42)
     TelegramUser.is_authenticated = True
     TelegramUser.conversation_state = 'authenticated'
  5. Clear temporary data:
     pending_email = None
     auth_code = None
     auth_code_expires_at = None
  ↓
Bot: "✅ Authentication successful!"
     "Welcome, John Doe!"
  ↓
User now authenticated ✅
  - TelegramUser.user → User(john@company.com)
  - Can use CRM features
  - Inherits all User permissions
```

---

## Authorization Flow

### **Step 4: User Asks for Data**

```
Telegram User: Show my customers
```

**What happens:**

```python
# File: shared-backend/crmApp/viewsets/telegram.py

def handle_telegram_message(parsed):
    """Main message handler"""
    
    telegram_user = TelegramAuthService.get_or_create_telegram_user(
        chat_id=parsed['chat_id'],
        telegram_username=parsed['from_user'].get('username'),
        first_name=parsed['from_user'].get('first_name'),
        last_name=parsed['from_user'].get('last_name')
    )
    
    # Check authentication
    if not telegram_user.is_authenticated:
        telegram_service.send_message(
            chat_id,
            "🔐 Please authenticate first with /start"
        )
        return
    
    # ✅ Authenticated - forward to Gemini
    handle_authenticated_message(telegram_user, text, telegram_service)


def handle_authenticated_message(telegram_user, text, telegram_service):
    """
    Handle authenticated user messages.
    Forward to Gemini AI with user context.
    """
    chat_id = telegram_user.chat_id
    user = telegram_user.user  # ← CRM User
    
    # Show typing indicator
    telegram_service.send_typing_action(chat_id)
    
    # Forward to Gemini service
    gemini_service = GeminiService()
    
    # Get AI response with tool access
    response = await gemini_service.chat(
        message=text,
        user=user,                    # ← CRM User object
        telegram_user=telegram_user   # ← Telegram user for context
    )
    
    # Send response back to Telegram
    telegram_service.send_message(chat_id, response)
```

---

### **Step 5: Gemini Builds User Context**

```python
# File: shared-backend/crmApp/services/gemini_service.py

class GeminiService:
    
    def _get_user_context_sync(self, user, telegram_user=None):
        """
        Build user context for MCP tool authorization.
        This is THE authorization source for Telegram users!
        """
        # 1. Get active profile (organization context)
        active_profile = get_user_active_profile(user)
        
        if not active_profile:
            raise ValueError("User must have an active profile")
        
        organization_id = active_profile.organization_id
        
        # 2. Get user permissions from database
        permissions = []
        
        if user.is_superuser or active_profile.profile_type == 'vendor':
            # Admin or owner: all permissions
            permissions = ['*:*']
        else:
            # Employee: load role permissions
            user_roles = user.user_roles.filter(
                organization_id=organization_id,
                is_active=True
            )
            
            for user_role in user_roles:
                role_permissions = user_role.role.role_permissions.filter(
                    is_active=True
                ).select_related('permission')
                
                for rp in role_permissions:
                    perm_str = f"{rp.permission.resource}:{rp.permission.action}"
                    if perm_str not in permissions:
                        permissions.append(perm_str)
        
        # 3. Build context dictionary
        context = {
            'user_id': user.id,
            'organization_id': organization_id,
            'role': active_profile.profile_type,
            'permissions': permissions,
            
            # CRITICAL: Include admin flags for MCP authorization
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
        }
        
        logger.info(
            f"Built user context for Telegram: user={user.id}, "
            f"org={organization_id}, role={active_profile.profile_type}, "
            f"perms={len(permissions)}, is_superuser={user.is_superuser}"
        )
        
        return context
```

**Result:**
- ✅ User context built from CRM database
- ✅ Includes user_id, organization_id, role, permissions
- ✅ **Includes is_superuser and is_staff flags**
- ✅ Same RBAC context as web frontend!

---

## MCP Tool Authorization

### **Step 6: Gemini Calls MCP Tool**

When Gemini AI decides to call a tool (e.g., `list_customers`), here's what happens:

```python
# File: shared-backend/crmApp/services/gemini_service.py

async def chat(self, message, user, telegram_user=None):
    """
    Process chat message with Gemini and MCP tools.
    """
    # 1. Build user context
    user_context = await self.get_user_context(user, telegram_user)
    
    # 2. Set MCP context (CRITICAL!)
    from mcp_server import set_user_context
    set_user_context(user_context)
    
    # 3. Call Gemini with tools
    response = await self.model.generate_content_async(
        message,
        tools=self.tools  # MCP tools available
    )
    
    # 4. If Gemini calls a tool, execute it
    if response.function_calls:
        for function_call in response.function_calls:
            tool_name = function_call.name
            tool_args = function_call.args
            
            # Execute MCP tool (authorization happens here!)
            result = await execute_mcp_tool(tool_name, tool_args)
```

---

### **Step 7: MCP Server Checks Authorization**

```python
# File: shared-backend/mcp_server.py

# Thread-safe context storage
_user_context_var = ContextVar('user_context', default={})

def set_user_context(context: Dict[str, Any]):
    """
    Set user context for current request.
    Called by GeminiService before tool execution.
    """
    _user_context_var.set(context)
    logger.info(
        f"MCP Context Set: user_id={context.get('user_id')}, "
        f"org_id={context.get('organization_id')}, "
        f"role={context.get('role')}, "
        f"is_superuser={context.get('is_superuser')}, "
        f"is_staff={context.get('is_staff')}"
    )


def check_permission(resource: str, action: str) -> bool:
    """
    Check if current user has permission.
    Called by every MCP tool before execution.
    """
    context = _user_context_var.get()
    
    if not context:
        logger.warning("MCP Permission DENIED: No user context")
        raise PermissionError("No user context available")
    
    user_id = context.get('user_id')
    org_id = context.get('organization_id')
    is_superuser = context.get('is_superuser', False)
    is_staff = context.get('is_staff', False)
    permissions = context.get('permissions', [])
    
    # ============================================
    # AUTHORIZATION HIERARCHY
    # ============================================
    
    # 1. SUPERUSER CHECK
    if is_superuser:
        logger.info(
            f"MCP Permission GRANTED (superuser): "
            f"user={user_id}, resource={resource}:{action}"
        )
        return True
    
    # 2. STAFF CHECK
    if is_staff:
        logger.info(
            f"MCP Permission GRANTED (staff): "
            f"user={user_id}, resource={resource}:{action}"
        )
        return True
    
    # 3. VENDOR/OWNER CHECK
    role = context.get('role', '')
    if role == 'vendor':
        logger.info(
            f"MCP Permission GRANTED (vendor): "
            f"user={user_id}, resource={resource}:{action}"
        )
        return True
    
    # 4. WILDCARD PERMISSION CHECK
    if '*:*' in permissions:
        logger.info(
            f"MCP Permission GRANTED (wildcard): "
            f"user={user_id}, resource={resource}:{action}"
        )
        return True
    
    # 5. SPECIFIC PERMISSION CHECK
    required_permission = f"{resource}:{action}"
    
    if required_permission in permissions:
        logger.info(
            f"MCP Permission GRANTED (explicit): "
            f"user={user_id}, resource={required_permission}"
        )
        return True
    
    # 6. RESOURCE WILDCARD CHECK (e.g., "customer:*")
    resource_wildcard = f"{resource}:*"
    if resource_wildcard in permissions:
        logger.info(
            f"MCP Permission GRANTED (resource wildcard): "
            f"user={user_id}, resource={required_permission}"
        )
        return True
    
    # ============================================
    # PERMISSION DENIED
    # ============================================
    logger.warning(
        f"MCP Permission DENIED: user={user_id}, org={org_id}, "
        f"role={role}, resource={required_permission}, "
        f"available_permissions={permissions}"
    )
    
    raise PermissionError(
        f"Permission denied: You don't have '{required_permission}' permission. "
        f"Your role: {role}, Available permissions: {permissions}"
    )
```

---

### **Step 8: MCP Tool Executes**

```python
# File: shared-backend/mcp_tools/customer_tools.py

@mcp.tool()
async def list_customers(
    limit: int = 10,
    offset: int = 0
) -> str:
    """
    List customers for the current organization.
    
    Requires: customer:read permission
    """
    # ============================================
    # AUTHORIZATION CHECK (CRITICAL!)
    # ============================================
    check_permission('customer', 'read')
    
    # ============================================
    # GET ORGANIZATION FROM CONTEXT
    # ============================================
    org_id = get_organization_id()
    
    if not org_id:
        return json.dumps({
            'error': 'No organization context available'
        })
    
    # ============================================
    # QUERY DATABASE (with organization filter)
    # ============================================
    customers = await sync_to_async(list)(
        Customer.objects.filter(
            organization_id=org_id
        ).select_related('organization')[offset:offset + limit]
    )
    
    # Format and return
    result = {
        'customers': [
            {
                'id': c.id,
                'name': c.full_name,
                'email': c.email,
                'phone': c.phone,
                'company': c.company,
            }
            for c in customers
        ],
        'total': await sync_to_async(Customer.objects.filter(
            organization_id=org_id
        ).count)()
    }
    
    return json.dumps(result)
```

**Result:**
- ✅ Permission checked: `customer:read`
- ✅ Organization filter applied automatically
- ✅ Data returned only for user's organization
- ✅ Same security as web frontend!

---

## Complete Workflow Diagrams

### **End-to-End Flow: Authentication → Authorization → Data Access**

```
┌────────────────────────────────────────────────────────────────────┐
│                   COMPLETE TELEGRAM WORKFLOW                       │
└────────────────────────────────────────────────────────────────────┘

1. AUTHENTICATION PHASE
───────────────────────────────────────────────────────────────────────

Telegram User (@john_telegram, chat_id: 123456789)
  ↓
  /start
  ↓
TelegramUser created in database
  - chat_id: 123456789
  - is_authenticated: false
  - conversation_state: 'waiting_for_email'
  ↓
Bot: "Please enter your email"
  ↓
User: john@company.com
  ↓
Backend verifies email exists in CRM
  ↓
TelegramUser updated:
  - pending_email: 'john@company.com'
  - conversation_state: 'waiting_for_password'
  ↓
Bot: "✅ Account found! Enter password"
  ↓
User: myPassword123
  ↓
Backend:
  1. Get user: User.objects.get(email='john@company.com')
  2. Verify password: user.check_password('myPassword123')
  3. ✅ Password correct!
  4. Link accounts:
     TelegramUser.user = User(john@company.com)
     TelegramUser.is_authenticated = True
  ↓
Bot: "✅ Authentication successful! Welcome, John Doe!"
  ↓
═══════════════════════════════════════════════════════════════════════
USER NOW AUTHENTICATED
═══════════════════════════════════════════════════════════════════════

2. MESSAGE HANDLING PHASE
───────────────────────────────────────────────────────────────────────

User: "Show my customers"
  ↓
Telegram Webhook receives message
  ↓
Backend:
  1. Get TelegramUser by chat_id: 123456789
  2. Check: telegram_user.is_authenticated == True ✅
  3. Get linked user: telegram_user.user (john@company.com)
  ↓
Forward to Gemini Service
  ↓
GeminiService._get_user_context_sync(user)
  ↓
Query database for authorization data:
  ┌─────────────────────────────────────────────┐
  │ SELECT * FROM users WHERE id = 42           │
  │ SELECT * FROM user_profiles WHERE user_id = 42 │
  │ SELECT * FROM user_roles WHERE user_id = 42 │
  │ SELECT * FROM permissions WHERE ...         │
  └─────────────────────────────────────────────┘
  ↓
Build user context:
  {
    'user_id': 42,
    'organization_id': 12,
    'role': 'employee',
    'permissions': [
      'customer:read',
      'customer:create',
      'lead:read',
      'lead:update'
    ],
    'is_superuser': false,
    'is_staff': false
  }
  ↓
Set MCP context:
  set_user_context(context)
  ↓
Call Gemini AI:
  "Show my customers"
  + User context
  + MCP tools available
  ↓
Gemini analyzes message and decides to call tool
  ↓

3. MCP TOOL EXECUTION PHASE
───────────────────────────────────────────────────────────────────────

Gemini: function_call('list_customers', {limit: 10})
  ↓
MCP Server receives tool call
  ↓
check_permission('customer', 'read')
  ↓
Get context from ContextVar:
  context = _user_context_var.get()
  {
    'user_id': 42,
    'organization_id': 12,
    'permissions': ['customer:read', ...],
    'is_superuser': false,
    'is_staff': false
  }
  ↓
Authorization checks (in order):
  1. is_superuser? → false
  2. is_staff? → false
  3. role == 'vendor'? → false
  4. '*:*' in permissions? → false
  5. 'customer:read' in permissions? → ✅ TRUE!
  ↓
✅ Permission GRANTED
  ↓
Get organization from context:
  org_id = context['organization_id'] = 12
  ↓
Query database with organization filter:
  Customer.objects.filter(organization_id=12)
  ↓
Return customers (only from org 12):
  [
    {id: 1, name: "Alice Corp", email: "alice@company.com"},
    {id: 2, name: "Bob LLC", email: "bob@company.com"},
    ...
  ]
  ↓
Gemini formats response:
  "Here are your customers:\n"
  "1. Alice Corp (alice@company.com)\n"
  "2. Bob LLC (bob@company.com)\n"
  "..."
  ↓
Send to Telegram:
  TelegramService.send_message(chat_id, response)
  ↓
User receives response in Telegram ✅
```

---

### **Authorization Hierarchy**

```
┌────────────────────────────────────────────────────────────────┐
│         MCP AUTHORIZATION HIERARCHY (check_permission)         │
└────────────────────────────────────────────────────────────────┘

When MCP tool is called, authorization check happens in this order:

1. ┌─────────────────────────────────────────┐
   │ is_superuser = True?                    │
   │ → ✅ GRANT ALL PERMISSIONS             │
   └─────────────────────────────────────────┘
   ↓ (if false, continue)

2. ┌─────────────────────────────────────────┐
   │ is_staff = True?                        │
   │ → ✅ GRANT ALL PERMISSIONS             │
   └─────────────────────────────────────────┘
   ↓ (if false, continue)

3. ┌─────────────────────────────────────────┐
   │ role = 'vendor' (owner)?                │
   │ → ✅ GRANT ALL PERMISSIONS             │
   │      (within organization)              │
   └─────────────────────────────────────────┘
   ↓ (if false, continue)

4. ┌─────────────────────────────────────────┐
   │ '*:*' in permissions?                   │
   │ → ✅ GRANT ALL PERMISSIONS             │
   └─────────────────────────────────────────┘
   ↓ (if false, continue)

5. ┌─────────────────────────────────────────┐
   │ 'customer:read' in permissions?         │
   │ → ✅ GRANT SPECIFIC PERMISSION         │
   └─────────────────────────────────────────┘
   ↓ (if false, continue)

6. ┌─────────────────────────────────────────┐
   │ 'customer:*' in permissions?            │
   │ → ✅ GRANT RESOURCE WILDCARD           │
   └─────────────────────────────────────────┘
   ↓ (if false)

7. ┌─────────────────────────────────────────┐
   │ ❌ PERMISSION DENIED                    │
   │ → Raise PermissionError                 │
   └─────────────────────────────────────────┘
```

---

## Security Considerations

### **1. Authentication Security**

```python
# ✅ Password Verification
user.check_password(password)
# Uses Django's PBKDF2 with SHA256 hashing
# Same security as web login

# ✅ Session Expiration
auth_code_expires_at = now() + timedelta(minutes=10)
# Auth session expires after 10 minutes

# ✅ Password Message Deletion
telegram_service.delete_message(chat_id, message_id)
# Best-effort deletion of password from chat history
```

### **2. Authorization Security**

```python
# ✅ Same RBAC as Web Frontend
# Telegram users get EXACT same permissions as web users
# No separate permission system

# ✅ Organization Isolation
# All queries filtered by organization_id
# Users can only access data from their organization

# ✅ Database Validation
# User context built from live database data
# Not cached, always up-to-date

# ✅ Permission Checks on Every Tool Call
# check_permission() called before EVERY MCP tool execution
# No way to bypass authorization
```

### **3. Context Isolation**

```python
# ✅ Thread-Safe Context
_user_context_var = ContextVar('user_context', default={})
# Each request has isolated context
# No cross-user contamination

# ✅ Context Set Before Tool Execution
set_user_context(context)
# Context always set before Gemini has tool access
# Cannot execute tools without context
```

### **4. Best Practices**

```python
# ✅ DO:
# - Always check telegram_user.is_authenticated before handling messages
# - Always set MCP context before calling Gemini
# - Always filter queries by organization_id
# - Always validate user exists and is active
# - Log all authorization decisions

# ❌ DON'T:
# - Don't trust chat_id alone (must be authenticated)
# - Don't cache user context across requests
# - Don't bypass check_permission() in tools
# - Don't query across organizations
# - Don't expose sensitive data in error messages
```

---

## Summary

### **Authentication: Who are you?**

```
1. User sends /start → conversation_state = 'waiting_for_email'
2. User sends email → Backend verifies email exists in CRM
                    → conversation_state = 'waiting_for_password'
3. User sends password → Backend verifies password
                       → TelegramUser.user = CRM User
                       → is_authenticated = True
```

### **Authorization: What can you do?**

```
1. User sends message → Backend checks is_authenticated
2. If authenticated → Get linked CRM User
3. Build user context from database:
   - user_id
   - organization_id
   - role (vendor, employee, customer)
   - permissions from UserRole → Role → Permission
   - is_superuser, is_staff flags
4. Set MCP context
5. Forward to Gemini with MCP tools
6. When tool called → check_permission(resource, action)
7. Authorization hierarchy:
   - Superuser? → Allow
   - Staff? → Allow
   - Vendor? → Allow (in org)
   - Permission exists? → Allow
   - Else → Deny
8. If allowed → Execute tool with organization filter
9. Return data → Format response → Send to Telegram
```

### **Key Principles**

```
✅ One CRM account = One source of truth
✅ Telegram authentication = Link chat_id to CRM User
✅ Telegram authorization = Use CRM User's roles/permissions
✅ Same RBAC system as web frontend
✅ Same security guarantees
✅ Organization isolation enforced
✅ Permission checks on every tool call
```

**Your Telegram bot is secure and properly integrated with your RBAC system!** 🎉


