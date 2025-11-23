"""
Gemini AI Service
Integrates Google Gemini with MCP server for AI-powered CRM operations
"""

import os
import logging
import asyncio
from typing import Optional, Dict, Any, AsyncIterator, Callable
from django.conf import settings
from asgiref.sync import sync_to_async
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for handling Gemini AI interactions with MCP tools"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
        
        # Ensure empty string is treated as None
        if self.api_key and not self.api_key.strip():
            self.api_key = None
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. Gemini features will not be available.")
        
        self.model_name = "gemini-2.5-flash"  # Using Gemini 2.5 Flash (latest, separate quota)
    
    def _get_user_context_sync(self, user) -> Dict[str, Any]:
        """
        Synchronous helper to build user context from database.
        Can be called directly from sync contexts or wrapped for async.
        """
        # Get active user profile
        active_profile = user.user_profiles.filter(
            is_primary=True,
            status='active'
        ).first()
        
        if not active_profile:
            active_profile = user.user_profiles.filter(status='active').first()
        
        if not active_profile:
            # Try to get any profile at all
            active_profile = user.user_profiles.first()
            
        if not active_profile:
            logger.error(f"No profile found for user {user.id}")
            raise ValueError(f"No profile found for user {user.username}. Please create a profile first.")
        
        # Get organization
        organization_id = active_profile.organization_id if active_profile.organization else None
        
        if not organization_id:
            logger.error(f"No organization for profile {active_profile.id}, user {user.id}")
            raise ValueError(f"Profile has no organization assigned. Please assign an organization to your profile.")
        
        # Get user permissions
        permissions = []
        
        try:
            # Get all permissions for user's role
            user_roles = user.user_roles.filter(
                organization_id=organization_id,
                is_active=True
            )
            
            for user_role in user_roles:
                role = user_role.role
                role_permissions = role.role_permissions.filter(
                    is_active=True
                ).select_related('permission')
                
                for rp in role_permissions:
                    perm_str = f"{rp.permission.resource}:{rp.permission.action}"
                    if perm_str not in permissions:
                        permissions.append(perm_str)
        except Exception as e:
            logger.warning(f"Could not load permissions for user {user.id}: {str(e)}")
        
        context = {
            'user_id': user.id,
            'organization_id': organization_id,
            'role': active_profile.profile_type,
            'permissions': permissions
        }
        
        logger.info(
            f"Built user context: user={user.id}, org={organization_id}, "
            f"role={active_profile.profile_type}, perms={len(permissions)}"
        )
        
        return context
    
    async def get_user_context(self, user) -> Dict[str, Any]:
        """
        Build user context for MCP server authentication and RBAC (async).
        
        Args:
            user: Django user object
        
        Returns:
            Dictionary with user context (user_id, organization_id, role, permissions)
        """
        from asgiref.sync import sync_to_async
        # Use thread_sensitive=False to avoid deadlocks in async context
        return await sync_to_async(self._get_user_context_sync, thread_sensitive=False)(user)
    
    def get_user_context_sync(self, user) -> Dict[str, Any]:
        """
        Build user context synchronously (for non-async views).
        
        Args:
            user: Django user object
        
        Returns:
            Dictionary with user context (user_id, organization_id, role, permissions)
        """
        return self._get_user_context_sync(user)
    
    def _build_system_prompt(self, user_context: Dict[str, Any]) -> str:
        """
        Build a comprehensive system prompt for Gemini based on user context.
        
        Args:
            user_context: Dictionary with user_id, organization_id, role, permissions
        
        Returns:
            System instruction string for Gemini
        """
        role = user_context.get('role', 'user')
        org_id = user_context.get('organization_id', 'Not assigned')
        user_id = user_context.get('user_id', 'Unknown')
        permissions_count = len(user_context.get('permissions', []))
        
        # Role-specific capabilities and restrictions
        role_capabilities = {
            'vendor': """
You have FULL ACCESS to all CRM data and operations within your organization:
- View, create, update, and delete customers, leads, deals, and issues
- Assign tasks to employees
- Access all analytics and reports
- Manage orders and payments
- View employee information

You can perform any CRM operation within your organization's boundaries.""",
            
            'employee': """
You have LIMITED ACCESS to CRM data within your vendor's organization:
- View all customers, leads, deals, and issues in the organization
- Create new records (customers, leads, deals, issues)
- Update records that are assigned to you
- Access analytics and reports
- View your colleagues' information

You CANNOT delete records or modify data that's not assigned to you.""",
            
            'customer': """
You have RESTRICTED ACCESS to your own data only:
- View your own customer profile
- View your orders and payment history
- Create and view support issues/tickets
- Track your interactions with the company

You CANNOT access other customers' data or company-wide information."""
        }
        
        capabilities = role_capabilities.get(role, "You have standard user access.")
        
        # Build the comprehensive system prompt
        system_prompt = f"""# CRM AI Assistant - System Instructions

## Your Role
You are an intelligent AI assistant for a Customer Relationship Management (CRM) system called "Too Good CRM". Your purpose is to help users manage their business relationships, sales pipeline, customer support, and analytics through natural conversation.

## Current User Context
- **User ID**: {user_id}
- **Organization ID**: {org_id}
- **Role**: {role.upper()}
- **Permissions**: {permissions_count} active permissions

## User Capabilities
{capabilities}

## Critical Security Rules
1. **Data Isolation**: You can ONLY access data within organization ID {org_id}. Never reference or access data from other organizations.
2. **Role Boundaries**: Respect the user's role limitations. If a {role} cannot perform an action, politely decline and explain why.
3. **Permission Checks**: All your tool calls are automatically checked for permissions. If denied, explain the limitation to the user.
4. **No Assumptions**: If you need information (like customer ID, employee ID), always ask the user rather than guessing.

## Available CRM Tools (MCP Integration)

### Customer Management
- `list_customers`: Search and list customers with filters (status, type, assigned employee)
- `get_customer`: Get detailed customer information
- `create_customer`: Create new customer records
- `update_customer`: Update customer information
- `deactivate_customer`: Deactivate a customer (soft delete)
- `get_customer_stats`: Get customer statistics

### Lead Management
- `list_leads`: Search and filter leads (qualification status, source, conversion status)
- `get_lead`: Get detailed lead information
- `create_lead`: Create new lead records
- `update_lead`: Update lead information
- `qualify_lead` / `disqualify_lead`: Change lead qualification status
- `update_lead_score`: Update lead scoring
- `assign_lead`: Assign lead to an employee
- `get_lead_stats`: Get lead statistics and conversion rates

### Deal Management
- `list_deals`: Search and filter deals (stage, priority, status)
- `get_deal`: Get detailed deal information
- `create_deal`: Create new deals
- `update_deal`: Update deal information
- `move_deal_to_stage`: Move deal through sales pipeline
- `mark_deal_won` / `mark_deal_lost`: Close deals
- `reopen_deal`: Reopen closed deals
- `get_deal_stats`: Get deal statistics and revenue metrics

### Issue/Support Management
- `list_issues`: Search and filter support issues
- `get_issue`: Get issue details
- `create_issue`: Create new support tickets
- `update_issue`: Update issue information
- `resolve_issue` / `reopen_issue`: Change issue status
- `assign_issue`: Assign issue to support staff
- `add_issue_comment`: Add comments to issues
- `get_issue_comments`: Retrieve issue comment history
- `get_issue_stats`: Get support metrics

### Order & Payment Management
- `list_orders`: View customer orders
- `get_order`: Get order details
- `create_order`: Create new orders
- `list_payments`: View payment records
- `get_payment`: Get payment details
- `create_payment`: Record new payments

### Employee Management
- `list_employees`: View employees in the organization
- `get_employee`: Get employee details

### Analytics & Reporting
- `get_dashboard_stats`: Comprehensive dashboard metrics
- `get_sales_funnel`: Sales conversion funnel analysis
- `get_revenue_by_period`: Revenue trends over time
- `get_employee_performance`: Employee productivity metrics
- `get_quick_stats`: Quick overview of key metrics

### Organization & Context
- `get_current_user_context`: View your own context and permissions
- `get_current_organization`: View organization details
- `get_user_permissions`: View your permission list

## Response Guidelines

### 1. Be Proactive
- When users ask about data, immediately use the appropriate tool to fetch it
- Don't just describe what you *could* do—actually do it
- Example: "Show me customers" → Call `list_customers()` and display results

### 2. Format Responses Clearly
- Use **bullet points** for lists
- Use **tables** for structured data (customers, deals, leads)
- Use **numbers and metrics** prominently for statistics
- Use **emojis sparingly** for visual clarity (✅ ✗ 📊 💰 👤)

### 3. Provide Context
- When showing filtered results, mention the filters applied
- When showing stats, add brief insights ("Your conversion rate of 45% is above industry average")
- When operations succeed, confirm clearly ("✅ Customer created successfully: John Doe (ID: 123)")

### 4. Handle Errors Gracefully
- If a tool fails, explain why in user-friendly terms
- Suggest alternatives if an action isn't permitted
- Example: "You don't have permission to delete customers, but I can help you deactivate them instead."

### 5. Ask Clarifying Questions
- If a request is ambiguous, ask for clarification
- Example: "I found 15 customers. Would you like to see active customers only, or all of them?"
- Offer specific options when multiple paths are possible

### 6. Maintain Conversation Context
- Remember what was discussed earlier in the conversation
- Reference previous results when relevant
- Build on prior queries naturally

### 7. Data Privacy
- Never fabricate data—only show what tools return
- Never mention other organizations or cross-organization data
- Respect the user's role limitations

### 8. Use Natural Language
- Avoid technical jargon unless the user uses it first
- Explain CRM concepts when needed
- Be conversational but professional

## Example Interactions

**Good Response Pattern:**
```
User: "Show me my top customers"
Assistant: "Let me fetch your customer data... 

📊 Top 5 Customers by Value:
1. **Acme Corp** - $125,000 (25 orders)
2. **TechStart Inc** - $98,500 (18 orders)
3. **Global Ventures** - $87,200 (31 orders)
4. **Digital Solutions** - $76,800 (12 orders)
5. **Innovation Labs** - $65,400 (22 orders)

Your top 5 customers represent $453,900 in total revenue. Would you like details about any specific customer?"
```

**Good Error Handling:**
```
User: "Delete customer 123"
Assistant: "I cannot delete customer records because your role (Employee) doesn't have deletion permissions. However, I can help you:
- Deactivate the customer (soft delete)
- Update their status to 'inactive'
- Add notes explaining why they should be removed

Would you like me to deactivate them instead?"
```

## Important Notes
- Always use tools to fetch real data—never make up information
- Confirm destructive actions (delete, deactivate) before executing
- When creating records, ask for all required fields if not provided
- Keep responses concise but informative
- Prioritize user's immediate need over exhaustive explanations

## Current Status
- ✅ Authentication verified (User {user_id})
- ✅ Organization context loaded (Org {org_id})
- ✅ Role permissions applied ({role})
- ✅ MCP tools available: {permissions_count > 0 and "Ready" or "Limited"}

You are now ready to assist the user with their CRM needs. Be helpful, efficient, and respectful of their permissions!"""
        
        return system_prompt
    
    def _create_crm_tools(self, user_context: Dict[str, Any]) -> list:
        """
        Create CRM query tools with user context bound.
        These tools allow Gemini to fetch and modify CRM data directly.
        """
        from crmApp.models import Customer, Lead, Deal, Issue
        
        org_id = user_context.get('organization_id')
        role = user_context.get('role')
        
        # === CUSTOMER TOOLS ===
        async def list_customers_tool(status: str = "active", limit: int = 10):
            """List customers in the organization"""
            @sync_to_async
            def fetch():
                if org_id:
                    customers = Customer.objects.filter(organization_id=org_id, status=status)[:limit]
                else:
                    customers = Customer.objects.filter(organization_id__isnull=True, status=status)[:limit]
                return [
                    {
                        "id": c.id,
                        "name": c.name,
                        "email": c.email,
                        "phone": c.phone,
                        "status": c.status,
                        "customer_type": c.customer_type,
                        "company_name": c.company_name,
                    }
                    for c in customers
                ]
            return await fetch()
        
        async def get_customer_count_tool():
            """Get total customer count"""
            @sync_to_async
            def fetch():
                if org_id:
                    return Customer.objects.filter(organization_id=org_id).count()
                else:
                    return Customer.objects.filter(organization_id__isnull=True).count()
            return await fetch()
        
        async def create_customer_tool(name: str, email: str, phone: str = "", customer_type: str = "individual", company_name: str = ""):
            """Create a new customer"""
            @sync_to_async
            def create():
                customer = Customer.objects.create(
                    organization_id=org_id,
                    name=name,
                    email=email,
                    phone=phone or "",
                    customer_type=customer_type,
                    company_name=company_name or "",
                    status="active"
                )
                return {
                    "success": True,
                    "id": customer.id,
                    "name": customer.name,
                    "message": f"Customer '{name}' created successfully"
                }
            return await create()
        
        async def get_customer_tool(customer_id: int):
            """Get detailed customer information"""
            @sync_to_async
            def fetch():
                try:
                    if org_id:
                        customer = Customer.objects.get(id=customer_id, organization_id=org_id)
                    else:
                        customer = Customer.objects.get(id=customer_id, organization_id__isnull=True)
                    return {
                        "id": customer.id,
                        "name": customer.name,
                        "email": customer.email,
                        "phone": customer.phone,
                        "status": customer.status,
                        "customer_type": customer.customer_type,
                        "company_name": customer.company_name,
                        "address": customer.address,
                        "city": customer.city,
                        "country": customer.country,
                    }
                except Customer.DoesNotExist:
                    return {"error": "Customer not found"}
            return await fetch()
        
        async def update_customer_tool(customer_id: int, name: str = None, email: str = None, phone: str = None, status: str = None):
            """Update an existing customer"""
            @sync_to_async
            def update():
                try:
                    if org_id:
                        customer = Customer.objects.get(id=customer_id, organization_id=org_id)
                    else:
                        customer = Customer.objects.get(id=customer_id, organization_id__isnull=True)
                    
                    if name:
                        customer.name = name
                    if email:
                        customer.email = email
                    if phone is not None:
                        customer.phone = phone
                    if status:
                        customer.status = status
                    
                    customer.save()
                    return {
                        "success": True,
                        "id": customer.id,
                        "name": customer.name,
                        "message": f"Customer '{customer.name}' updated successfully"
                    }
                except Customer.DoesNotExist:
                    return {"error": "Customer not found"}
            return await update()
        
        async def delete_customer_tool(customer_id: int):
            """Delete a customer"""
            @sync_to_async
            def delete():
                try:
                    if org_id:
                        customer = Customer.objects.get(id=customer_id, organization_id=org_id)
                    else:
                        customer = Customer.objects.get(id=customer_id, organization_id__isnull=True)
                    name = customer.name
                    customer.delete()
                    return {
                        "success": True,
                        "message": f"Customer '{name}' deleted successfully"
                    }
                except Customer.DoesNotExist:
                    return {"error": "Customer not found"}
            return await delete()
        
        # === LEAD TOOLS ===
        async def list_leads_tool(status: str = "all", limit: int = 10):
            """List leads in the organization. Leads are in any stage of the sales pipeline. Organization ID is automatically determined from the user context."""
            @sync_to_async
            def fetch():
                # Ensure we have org_id (should always be set from user context)
                if not org_id:
                    return {"error": "No organization context found. Please ensure you're logged in."}
                
                # Get ALL leads for the organization (regardless of stage)
                # Leads are any record in the Lead model, regardless of stage
                queryset = Lead.objects.filter(organization_id=org_id, status='active')
                
                # Optionally filter by qualification_status if specified
                if status and status.lower() not in ["all", ""]:
                    queryset = queryset.filter(qualification_status=status.lower())
                
                leads = queryset.select_related('stage').order_by('-created_at')[:limit]
                lead_list = list(leads)  # Convert to list to check count
                
                logger.info(f"Found {len(lead_list)} leads for organization_id={org_id}")
                
                if len(lead_list) == 0:
                    logger.warning(f"No leads found for organization_id={org_id}")
                    return []
                
                return [
                    {
                        "id": l.id,
                        "name": l.name,
                        "email": l.email or "",
                        "phone": l.phone or "",
                        "stage": l.stage.name if l.stage else "No stage",
                        "qualification_status": l.qualification_status,
                        "status": l.status,
                        "source": l.source,
                        "is_converted": l.is_converted,
                    }
                    for l in leads
                ]
            return await fetch()
        
        async def create_lead_tool(name: str, email: str, phone: str = "", source: str = "website"):
            """Create a new lead"""
            @sync_to_async
            def create():
                lead = Lead.objects.create(
                    organization_id=org_id,
                    name=name,
                    email=email,
                    phone=phone or "",
                    source=source,
                    status="new",
                    score=0
                )
                return {
                    "success": True,
                    "id": lead.id,
                    "name": lead.name,
                    "message": f"Lead '{name}' created successfully"
                }
            return await create()
        
        async def update_lead_tool(lead_id: int, name: str = None, status: str = None, score: int = None):
            """Update an existing lead"""
            @sync_to_async
            def update():
                try:
                    lead = Lead.objects.get(id=lead_id, organization_id=org_id)
                    if name:
                        lead.name = name
                    if status:
                        lead.status = status
                    if score is not None:
                        lead.score = score
                    lead.save()
                    return {
                        "success": True,
                        "id": lead.id,
                        "name": lead.name,
                        "message": f"Lead '{lead.name}' updated successfully"
                    }
                except Lead.DoesNotExist:
                    return {"error": "Lead not found"}
            return await update()
        
        async def qualify_lead_tool(lead_id: int):
            """Mark a lead as qualified"""
            @sync_to_async
            def qualify():
                try:
                    lead = Lead.objects.get(id=lead_id, organization_id=org_id)
                    lead.status = "qualified"
                    lead.score = max(lead.score, 70)
                    lead.save()
                    return {
                        "success": True,
                        "id": lead.id,
                        "name": lead.name,
                        "message": f"Lead '{lead.name}' marked as qualified"
                    }
                except Lead.DoesNotExist:
                    return {"error": "Lead not found"}
            return await qualify()
        
        async def convert_lead_to_customer_tool(lead_id: int):
            """Convert a lead to a customer"""
            @sync_to_async
            def convert():
                try:
                    lead = Lead.objects.get(id=lead_id, organization_id=org_id)
                    customer = Customer.objects.create(
                        organization_id=org_id,
                        name=lead.name,
                        email=lead.email,
                        phone=lead.phone,
                        status="active",
                        customer_type="individual"
                    )
                    lead.status = "converted"
                    lead.save()
                    return {
                        "success": True,
                        "customer_id": customer.id,
                        "customer_name": customer.name,
                        "message": f"Lead '{lead.name}' converted to customer successfully"
                    }
                except Lead.DoesNotExist:
                    return {"error": "Lead not found"}
            return await convert()
        
        # === DEAL TOOLS ===
        async def list_deals_tool(stage: str = "negotiation", limit: int = 10):
            """List deals in the organization"""
            @sync_to_async
            def fetch():
                deals = Deal.objects.filter(organization_id=org_id, stage=stage)[:limit]
                return [
                    {
                        "id": d.id,
                        "title": d.title,
                        "value": float(d.value),
                        "stage": d.stage,
                        "status": d.status,
                        "customer_name": d.customer.name if d.customer else None,
                    }
                    for d in deals
                ]
            return await fetch()
        
        async def create_deal_tool(title: str, value: float, customer_id: int = None, stage: str = "prospecting"):
            """Create a new deal"""
            @sync_to_async
            def create():
                deal = Deal.objects.create(
                    organization_id=org_id,
                    title=title,
                    value=value,
                    customer_id=customer_id,
                    stage=stage,
                    status="open"
                )
                return {
                    "success": True,
                    "id": deal.id,
                    "title": deal.title,
                    "value": float(deal.value),
                    "message": f"Deal '{title}' created successfully"
                }
            return await create()
        
        async def update_deal_tool(deal_id: int, title: str = None, value: float = None, stage: str = None, status: str = None):
            """Update an existing deal"""
            @sync_to_async
            def update():
                try:
                    deal = Deal.objects.get(id=deal_id, organization_id=org_id)
                    if title:
                        deal.title = title
                    if value is not None:
                        deal.value = value
                    if stage:
                        deal.stage = stage
                    if status:
                        deal.status = status
                    deal.save()
                    return {
                        "success": True,
                        "id": deal.id,
                        "title": deal.title,
                        "message": f"Deal '{deal.title}' updated successfully"
                    }
                except Deal.DoesNotExist:
                    return {"error": "Deal not found"}
            return await update()
        
        async def mark_deal_won_tool(deal_id: int):
            """Mark a deal as won"""
            @sync_to_async
            def mark_won():
                try:
                    deal = Deal.objects.get(id=deal_id, organization_id=org_id)
                    deal.status = "won"
                    deal.stage = "closed"
                    deal.save()
                    return {
                        "success": True,
                        "id": deal.id,
                        "title": deal.title,
                        "value": float(deal.value),
                        "message": f"Deal '{deal.title}' marked as won! 🎉"
                    }
                except Deal.DoesNotExist:
                    return {"error": "Deal not found"}
            return await mark_won()
        
        async def mark_deal_lost_tool(deal_id: int, reason: str = ""):
            """Mark a deal as lost"""
            @sync_to_async
            def mark_lost():
                try:
                    deal = Deal.objects.get(id=deal_id, organization_id=org_id)
                    deal.status = "lost"
                    deal.stage = "closed"
                    if reason:
                        deal.lost_reason = reason
                    deal.save()
                    return {
                        "success": True,
                        "id": deal.id,
                        "title": deal.title,
                        "message": f"Deal '{deal.title}' marked as lost"
                    }
                except Deal.DoesNotExist:
                    return {"error": "Deal not found"}
            return await mark_lost()
        
        async def get_deal_stats_tool():
            """Get deal statistics"""
            @sync_to_async
            def fetch():
                from django.db.models import Sum, Count
                deals = Deal.objects.filter(organization_id=org_id)
                return {
                    "total_deals": deals.count(),
                    "total_value": float(deals.aggregate(Sum('value'))['value__sum'] or 0),
                    "won_deals": deals.filter(status='won').count(),
                    "lost_deals": deals.filter(status='lost').count(),
                    "active_deals": deals.filter(status='open').count(),
                }
            return await fetch()
        
        # === ISSUE TOOLS ===
        async def list_issues_tool(status: str = None, priority: str = None, limit: int = 20):
            """List issues/tickets in the organization. If no status is specified, returns all issues."""
            @sync_to_async
            def fetch():
                if not org_id:
                    return {"error": "No organization context found. Please ensure you're logged in."}
                
                logger.info(f"Listing issues for organization_id={org_id}, status={status}, priority={priority}, limit={limit}")
                
                # Start with organization filter
                queryset = Issue.objects.filter(organization_id=org_id)
                
                # Apply optional filters
                if status and status.lower() != "all":
                    queryset = queryset.filter(status=status.lower())
                
                if priority:
                    queryset = queryset.filter(priority=priority.lower())
                
                # Order by most recent first
                issues = queryset.order_by('-created_at')[:limit]
                
                logger.info(f"Found {issues.count()} issues for org {org_id}")
                
                result = [
                    {
                        "id": i.id,
                        "title": i.title,
                        "priority": i.priority,
                        "status": i.status,
                        "category": i.category,
                        "customer_name": i.customer.name if i.customer else None,
                        "created_at": str(i.created_at) if hasattr(i, 'created_at') else None,
                    }
                    for i in issues
                ]
                
                logger.debug(f"Returning {len(result)} issues")
                return result if result else []
            return await fetch()
        
        async def create_issue_tool(title: str, description: str, priority: str = "medium", category: str = "other", customer_id: int = None):
            """Create a new issue/ticket"""
            @sync_to_async
            def create():
                if not org_id:
                    return {"error": "No organization context found. Please ensure you're logged in."}
                
                logger.info(f"Creating issue for organization_id={org_id}: {title}")
                
                try:
                    # Get customer if customer_id provided
                    customer = None
                    if customer_id:
                        from crmApp.models import Customer
                        try:
                            customer = Customer.objects.get(id=customer_id, organization_id=org_id)
                        except Customer.DoesNotExist:
                            return {"error": f"Customer with ID {customer_id} not found in your organization"}
                    
                    issue = Issue.objects.create(
                        organization_id=org_id,
                        title=title,
                        description=description,
                        priority=priority.lower() if priority else "medium",
                        category=category.lower() if category else "other",
                        customer=customer,
                        status="open"
                    )
                    
                    logger.info(f"Issue {issue.id} created successfully")
                    
                    return {
                        "success": True,
                        "id": issue.id,
                        "title": issue.title,
                        "message": f"Issue '{title}' created successfully"
                    }
                except Exception as e:
                    logger.error(f"Error creating issue: {e}", exc_info=True)
                    return {"error": f"Failed to create issue: {str(e)}"}
            return await create()
        
        async def update_issue_tool(issue_id: int, status: str = None, priority: str = None, title: str = None, description: str = None):
            """Update an existing issue"""
            @sync_to_async
            def update():
                if not org_id:
                    return {"error": "No organization context found. Please ensure you're logged in."}
                
                logger.info(f"Updating issue {issue_id} for organization_id={org_id}")
                
                try:
                    issue = Issue.objects.get(id=issue_id, organization_id=org_id)
                    
                    if status:
                        issue.status = status.lower()
                    if priority:
                        issue.priority = priority.lower()
                    if title:
                        issue.title = title
                    if description:
                        issue.description = description
                    
                    issue.save()
                    
                    logger.info(f"Issue {issue.id} updated successfully")
                    
                    return {
                        "success": True,
                        "id": issue.id,
                        "title": issue.title,
                        "status": issue.status,
                        "priority": issue.priority,
                        "message": f"Issue '{issue.title}' updated successfully"
                    }
                except Issue.DoesNotExist:
                    logger.warning(f"Issue {issue_id} not found in org {org_id}")
                    return {"error": f"Issue with ID {issue_id} not found in your organization"}
                except Exception as e:
                    logger.error(f"Error updating issue: {e}", exc_info=True)
                    return {"error": f"Failed to update issue: {str(e)}"}
            return await update()
        
        async def get_issue_tool(issue_id: int):
            """Get detailed information about a specific issue"""
            @sync_to_async
            def fetch():
                if not org_id:
                    return {"error": "No organization context found. Please ensure you're logged in."}
                
                try:
                    issue = Issue.objects.select_related('customer', 'assigned_to').get(id=issue_id, organization_id=org_id)
                    return {
                        "id": issue.id,
                        "title": issue.title,
                        "description": issue.description,
                        "priority": issue.priority,
                        "status": issue.status,
                        "category": issue.category,
                        "customer_name": issue.customer.name if issue.customer else None,
                        "created_at": str(issue.created_at) if hasattr(issue, 'created_at') else None,
                    }
                except Issue.DoesNotExist:
                    return {"error": f"Issue with ID {issue_id} not found in your organization"}
            return await fetch()
        
        async def resolve_issue_tool(issue_id: int):
            """Mark an issue as resolved"""
            @sync_to_async
            def resolve():
                if not org_id:
                    return {"error": "No organization context found. Please ensure you're logged in."}
                
                logger.info(f"Resolving issue {issue_id} for organization_id={org_id}")
                
                try:
                    issue = Issue.objects.get(id=issue_id, organization_id=org_id)
                    issue.status = "resolved"
                    issue.save()
                    
                    logger.info(f"Issue {issue.id} resolved successfully")
                    
                    return {
                        "success": True,
                        "id": issue.id,
                        "title": issue.title,
                        "status": issue.status,
                        "message": f"Issue '{issue.title}' marked as resolved ✓"
                    }
                except Issue.DoesNotExist:
                    logger.warning(f"Issue {issue_id} not found in org {org_id}")
                    return {"error": f"Issue with ID {issue_id} not found in your organization"}
                except Exception as e:
                    logger.error(f"Error resolving issue: {e}", exc_info=True)
                    return {"error": f"Failed to resolve issue: {str(e)}"}
            return await resolve()
        
        # === ANALYTICS TOOLS ===
        async def get_dashboard_stats_tool():
            """Get comprehensive dashboard statistics"""
            @sync_to_async
            def fetch():
                from django.db.models import Sum, Count
                return {
                    "customers": {
                        "total": Customer.objects.filter(organization_id=org_id).count(),
                        "active": Customer.objects.filter(organization_id=org_id, status='active').count(),
                    },
                    "leads": {
                        "total": Lead.objects.filter(organization_id=org_id).count(),
                        "new": Lead.objects.filter(organization_id=org_id, status='new').count(),
                        "qualified": Lead.objects.filter(organization_id=org_id, status='qualified').count(),
                    },
                    "deals": {
                        "total": Deal.objects.filter(organization_id=org_id).count(),
                        "total_value": float(Deal.objects.filter(organization_id=org_id).aggregate(Sum('value'))['value__sum'] or 0),
                        "won": Deal.objects.filter(organization_id=org_id, status='won').count(),
                    },
                    "issues": {
                        "total": Issue.objects.filter(organization_id=org_id).count(),
                        "open": Issue.objects.filter(organization_id=org_id, status='open').count(),
                    }
                }
            return await fetch()
        
        # Define all function declarations
        function_declarations = [
            # Customer functions
            types.FunctionDeclaration(
                name="list_customers",
                description="List customers in the organization. Returns customer names, emails, phones, and status.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "status": types.Schema(type=types.Type.STRING, description="Filter by status: active, inactive, prospect, vip (default: active)"),
                        "limit": types.Schema(type=types.Type.INTEGER, description="Maximum number to return (default: 10, max: 50)"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="get_customer_count",
                description="Get the total number of customers in the organization",
                parameters=types.Schema(type=types.Type.OBJECT, properties={}),
            ),
            types.FunctionDeclaration(
                name="create_customer",
                description="Create a new customer in the CRM",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "name": types.Schema(type=types.Type.STRING, description="Customer name (required)"),
                        "email": types.Schema(type=types.Type.STRING, description="Email address (required)"),
                        "phone": types.Schema(type=types.Type.STRING, description="Phone number (optional)"),
                        "customer_type": types.Schema(type=types.Type.STRING, description="Type: individual or business (default: individual)"),
                        "company_name": types.Schema(type=types.Type.STRING, description="Company name for business customers (optional)"),
                    },
                    required=["name", "email"],
                ),
            ),
            types.FunctionDeclaration(
                name="get_customer",
                description="Get detailed information about a specific customer",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "customer_id": types.Schema(type=types.Type.INTEGER, description="Customer ID"),
                    },
                    required=["customer_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="update_customer",
                description="Update an existing customer's information",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "customer_id": types.Schema(type=types.Type.INTEGER, description="Customer ID (required)"),
                        "name": types.Schema(type=types.Type.STRING, description="New name (optional)"),
                        "email": types.Schema(type=types.Type.STRING, description="New email (optional)"),
                        "phone": types.Schema(type=types.Type.STRING, description="New phone (optional)"),
                        "status": types.Schema(type=types.Type.STRING, description="New status: active, inactive, prospect, vip (optional)"),
                    },
                    required=["customer_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="delete_customer",
                description="Delete a customer from the CRM",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "customer_id": types.Schema(type=types.Type.INTEGER, description="Customer ID to delete"),
                    },
                    required=["customer_id"],
                ),
            ),
            # Lead functions
            types.FunctionDeclaration(
                name="list_leads",
                description="List leads in the user's organization. IMPORTANT: Organization ID is automatically determined from the user context - you do NOT need to pass any organization ID. This function will automatically filter leads based on the authenticated user's organization. Leads are any records in the Lead model, regardless of their pipeline stage (Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost). When a lead reaches 'Closed Won' stage, they become both a lead and a customer. Use this function whenever the user asks about 'my leads', 'show leads', 'list leads', etc.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "status": types.Schema(type=types.Type.STRING, description="Optional filter by qualification status: new, contacted, qualified, unqualified, converted, lost, or 'all' for all leads regardless of qualification status (default: all)"),
                        "limit": types.Schema(type=types.Type.INTEGER, description="Maximum number to return (default: 10, max: 100)"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="create_lead",
                description="Create a new lead in the CRM",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "name": types.Schema(type=types.Type.STRING, description="Lead name (required)"),
                        "email": types.Schema(type=types.Type.STRING, description="Email address (required)"),
                        "phone": types.Schema(type=types.Type.STRING, description="Phone number (optional)"),
                        "source": types.Schema(type=types.Type.STRING, description="Lead source: website, referral, campaign, etc (default: website)"),
                    },
                    required=["name", "email"],
                ),
            ),
            types.FunctionDeclaration(
                name="update_lead",
                description="Update an existing lead's information",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "lead_id": types.Schema(type=types.Type.INTEGER, description="Lead ID (required)"),
                        "name": types.Schema(type=types.Type.STRING, description="New name (optional)"),
                        "status": types.Schema(type=types.Type.STRING, description="New status: new, contacted, qualified, disqualified (optional)"),
                        "score": types.Schema(type=types.Type.INTEGER, description="Lead score 0-100 (optional)"),
                    },
                    required=["lead_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="qualify_lead",
                description="Mark a lead as qualified (sets status to qualified and increases score)",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "lead_id": types.Schema(type=types.Type.INTEGER, description="Lead ID to qualify"),
                    },
                    required=["lead_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="convert_lead_to_customer",
                description="Convert a qualified lead into a customer",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "lead_id": types.Schema(type=types.Type.INTEGER, description="Lead ID to convert"),
                    },
                    required=["lead_id"],
                ),
            ),
            # Deal functions
            types.FunctionDeclaration(
                name="list_deals",
                description="List deals in the organization",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "stage": types.Schema(type=types.Type.STRING, description="Filter by stage: prospecting, qualification, proposal, negotiation, closed"),
                        "limit": types.Schema(type=types.Type.INTEGER, description="Maximum number to return (default: 10)"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="create_deal",
                description="Create a new deal in the CRM",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(type=types.Type.STRING, description="Deal title (required)"),
                        "value": types.Schema(type=types.Type.NUMBER, description="Deal value in dollars (required)"),
                        "customer_id": types.Schema(type=types.Type.INTEGER, description="Associated customer ID (optional)"),
                        "stage": types.Schema(type=types.Type.STRING, description="Deal stage: prospecting, qualification, proposal, negotiation, closed (default: prospecting)"),
                    },
                    required=["title", "value"],
                ),
            ),
            types.FunctionDeclaration(
                name="update_deal",
                description="Update an existing deal's information",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "deal_id": types.Schema(type=types.Type.INTEGER, description="Deal ID (required)"),
                        "title": types.Schema(type=types.Type.STRING, description="New title (optional)"),
                        "value": types.Schema(type=types.Type.NUMBER, description="New value (optional)"),
                        "stage": types.Schema(type=types.Type.STRING, description="New stage (optional)"),
                        "status": types.Schema(type=types.Type.STRING, description="New status: open, won, lost (optional)"),
                    },
                    required=["deal_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="mark_deal_won",
                description="Mark a deal as won and close it",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "deal_id": types.Schema(type=types.Type.INTEGER, description="Deal ID to mark as won"),
                    },
                    required=["deal_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="mark_deal_lost",
                description="Mark a deal as lost and close it",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "deal_id": types.Schema(type=types.Type.INTEGER, description="Deal ID to mark as lost"),
                        "reason": types.Schema(type=types.Type.STRING, description="Reason for losing the deal (optional)"),
                    },
                    required=["deal_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="get_deal_stats",
                description="Get deal statistics including total value, won/lost counts",
                parameters=types.Schema(type=types.Type.OBJECT, properties={}),
            ),
            # Issue functions
            types.FunctionDeclaration(
                name="list_issues",
                description="List issues/tickets in the user's organization. Organization ID is automatically determined from user context. Returns all issues by default unless status filter is specified. Use this function when user asks about 'my issues', 'show issues', 'list issues', 'open issues', etc.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "status": types.Schema(type=types.Type.STRING, description="Optional filter by status: open, in_progress, resolved, closed, or 'all' for all statuses (default: all if not specified)"),
                        "priority": types.Schema(type=types.Type.STRING, description="Optional filter by priority: low, medium, high, critical"),
                        "limit": types.Schema(type=types.Type.INTEGER, description="Maximum number to return (default: 20, max: 100)"),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="get_issue",
                description="Get detailed information about a specific issue by ID. Organization ID is automatically determined from user context.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "issue_id": types.Schema(type=types.Type.INTEGER, description="Issue ID (required)"),
                    },
                    required=["issue_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="create_issue",
                description="Create a new issue/support ticket in the CRM. Organization ID is automatically determined from user context.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(type=types.Type.STRING, description="Issue title (required)"),
                        "description": types.Schema(type=types.Type.STRING, description="Issue description (required)"),
                        "priority": types.Schema(type=types.Type.STRING, description="Priority: low, medium, high, critical (default: medium)"),
                        "category": types.Schema(type=types.Type.STRING, description="Category: quality, delivery, payment, communication, other (default: other)"),
                        "customer_id": types.Schema(type=types.Type.INTEGER, description="Associated customer ID (optional)"),
                    },
                    required=["title", "description"],
                ),
            ),
            types.FunctionDeclaration(
                name="update_issue",
                description="Update an existing issue's status, priority, title, or description. Organization ID is automatically determined from user context.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "issue_id": types.Schema(type=types.Type.INTEGER, description="Issue ID (required)"),
                        "status": types.Schema(type=types.Type.STRING, description="New status: open, in_progress, resolved, closed (optional)"),
                        "priority": types.Schema(type=types.Type.STRING, description="New priority: low, medium, high, critical (optional)"),
                        "title": types.Schema(type=types.Type.STRING, description="New title (optional)"),
                        "description": types.Schema(type=types.Type.STRING, description="New description (optional)"),
                    },
                    required=["issue_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="resolve_issue",
                description="Mark an issue as resolved. Organization ID is automatically determined from user context.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "issue_id": types.Schema(type=types.Type.INTEGER, description="Issue ID to resolve (required)"),
                    },
                    required=["issue_id"],
                ),
            ),
            # Analytics functions
            types.FunctionDeclaration(
                name="get_dashboard_stats",
                description="Get comprehensive dashboard statistics for customers, leads, deals, and issues",
                parameters=types.Schema(type=types.Type.OBJECT, properties={}),
            ),
        ]
        
        # Return tools with all function declarations
        tools = [types.Tool(function_declarations=function_declarations)]
        
        # Store tool handlers for execution
        self._tool_handlers = {
            # Customer tools
            "list_customers": list_customers_tool,
            "get_customer_count": get_customer_count_tool,
            "create_customer": create_customer_tool,
            "get_customer": get_customer_tool,
            "update_customer": update_customer_tool,
            "delete_customer": delete_customer_tool,
            # Lead tools
            "list_leads": list_leads_tool,
            "create_lead": create_lead_tool,
            "update_lead": update_lead_tool,
            "qualify_lead": qualify_lead_tool,
            "convert_lead_to_customer": convert_lead_to_customer_tool,
            # Deal tools
            "list_deals": list_deals_tool,
            "create_deal": create_deal_tool,
            "update_deal": update_deal_tool,
            "mark_deal_won": mark_deal_won_tool,
            "mark_deal_lost": mark_deal_lost_tool,
            "get_deal_stats": get_deal_stats_tool,
            # Issue tools
            "list_issues": list_issues_tool,
            "get_issue": get_issue_tool,
            "create_issue": create_issue_tool,
            "update_issue": update_issue_tool,
            "resolve_issue": resolve_issue_tool,
            # Analytics tools
            "get_dashboard_stats": get_dashboard_stats_tool,
        }
        
        return tools
    
    async def chat_stream(
        self,
        message: str,
        user,
        conversation_history: Optional[list] = None
    ) -> AsyncIterator[str]:
        """
        Stream Gemini responses with MCP tool access.
        
        Args:
            message: User's message
            user: Django user object
            conversation_history: Optional previous conversation messages
        
        Yields:
            Response chunks from Gemini
        """
        if not self.api_key or not self.api_key.strip():
            logger.error("Gemini chat attempted without API key configured")
            yield "❌ Error: Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables or .env file."
            return
        
        try:
            # Build user context (async operation)
            logger.info("Building user context...")
            user_context = await self.get_user_context(user)
            logger.info(f"User context built: {user_context.get('user_id')}")
            
            # Initialize Gemini client (sync)
            logger.info("Initializing Gemini client...")
            gemini_client = genai.Client(api_key=self.api_key)
            logger.info("Gemini client initialized")
            
            # Create CRM tools with user context
            logger.info("Creating CRM tools...")
            crm_tools = self._create_crm_tools(user_context)
            logger.info(f"CRM tools created: {len(crm_tools)} tools")
            
            # Build conversation contents with history
            logger.info("Building conversation contents...")
            contents = []
            if conversation_history:
                # Add conversation history (already in Gemini format from frontend)
                for msg in conversation_history:
                    if msg.get('role') and msg.get('content'):
                        contents.append(
                            types.Content(
                                role="user" if msg['role'] == 'user' else "model",
                                parts=[types.Part(text=msg['content'])]
                            )
                        )
            
            # Add current message
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part(text=message)]
                )
            )
            
            # System instruction to guide Gemini
            logger.info("Building system prompt...")
            system_instruction = self._build_system_prompt(user_context)
            logger.info(f"System prompt built, length: {len(system_instruction)}")
            
            logger.info(f"Sending message to Gemini with CRM tools (user: {user_context['user_id']}, org: {user_context.get('organization_id')}, history: {len(contents)-1} messages)")
            logger.info(f"Using model: {self.model_name}, API key length: {len(self.api_key) if self.api_key else 0}")
            logger.info(f"Number of CRM tools: {len(crm_tools)}")
            
            # Generate response with streaming and CRM tools
            try:
                logger.info("About to call gemini_client.aio.models.generate_content_stream...")
                # The generate_content_stream returns a coroutine that resolves to an async iterator
                response_stream = await gemini_client.aio.models.generate_content_stream(
                    model=self.model_name,
                    contents=contents,
                    config=genai.types.GenerateContentConfig(
                        temperature=0.7,
                        top_p=0.95,
                        max_output_tokens=2048,
                        system_instruction=system_instruction,
                        tools=crm_tools,
                        tool_config={"function_calling_config": {"mode": "AUTO"}},
                    )
                )
                logger.info("Successfully received response_stream from Gemini")
            except Exception as stream_error:
                logger.error(f"Failed to initiate Gemini stream: {stream_error}", exc_info=True)
                error_type = type(stream_error).__name__
                error_str = str(stream_error)
                
                # Provide helpful error messages
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    yield "❌ Rate limit exceeded. Please wait a moment and try again. Free tier has limited requests per minute."
                elif "401" in error_str or "UNAUTHENTICATED" in error_str:
                    yield "❌ Authentication failed. Please check your GEMINI_API_KEY configuration."
                elif "404" in error_str or "NOT_FOUND" in error_str:
                    yield f"❌ Model '{self.model_name}' not found. Please check the model name."
                else:
                    yield f"❌ Failed to connect to Gemini API ({error_type}): {error_str[:200]}"
                return
            
            # Stream the response chunks
            function_call_detected = False
            function_call = None
            accumulated_parts = []
            
            logger.info("Starting to iterate over response_stream chunks...")
            chunk_count = 0
            async for chunk in response_stream:
                chunk_count += 1
                logger.debug(f"Received chunk {chunk_count}")
                
                if not chunk.candidates:
                    logger.debug(f"Chunk {chunk_count} has no candidates")
                    continue
                    
                candidate = chunk.candidates[0]
                
                # Log finish reason and safety ratings
                if hasattr(candidate, 'finish_reason'):
                    logger.info(f"Chunk {chunk_count} finish_reason: {candidate.finish_reason}")
                if hasattr(candidate, 'safety_ratings'):
                    logger.debug(f"Chunk {chunk_count} safety_ratings: {candidate.safety_ratings}")
                
                if not candidate.content or not candidate.content.parts:
                    logger.warning(f"Chunk {chunk_count} has no content or parts (finish_reason: {getattr(candidate, 'finish_reason', 'N/A')})")
                    continue
                
                for part in candidate.content.parts:
                    # Check for function call
                    if hasattr(part, 'function_call') and part.function_call:
                        function_call_detected = True
                        function_call = part.function_call
                        accumulated_parts.append(candidate.content)
                        logger.info(f"Gemini called function: {function_call.name}")
                        break
                    
                    # Stream text content
                    if hasattr(part, 'text') and part.text:
                        logger.debug(f"Yielding text: {part.text[:50]}...")
                        yield part.text
            
            logger.info(f"Finished iterating over response_stream. Total chunks: {chunk_count}")
            
            # Handle function call if detected
            if function_call_detected and function_call:
                function_name = function_call.name
                function_args = dict(function_call.args)
                
                logger.info(f"Executing function: {function_name} with args: {function_args}")
                
                # Execute the tool
                if function_name in self._tool_handlers:
                    try:
                        tool_result = await self._tool_handlers[function_name](**function_args)
                        logger.info(f"Tool result: {str(tool_result)[:200]}...")
                        
                        # Send function response back to Gemini
                        function_response = types.Content(
                            role="function",
                            parts=[
                                types.Part(
                                    function_response=types.FunctionResponse(
                                        name=function_name,
                                        response={"result": tool_result}
                                    )
                                )
                            ]
                        )
                        
                        # Build full conversation with function call and response
                        full_contents = contents + accumulated_parts + [function_response]
                        
                        # Get final response from Gemini with function result (streaming)
                        final_response_stream = gemini_client.aio.models.generate_content_stream(
                            model=self.model_name,
                            contents=full_contents,
                            config=genai.types.GenerateContentConfig(
                                temperature=0.7,
                                top_p=0.95,
                                max_output_tokens=2048,
                                system_instruction=system_instruction,
                                tools=crm_tools,
                            ),
                        )
                        
                        # Stream the final response
                        async for chunk in final_response_stream:
                            if chunk.candidates and chunk.candidates[0].content:
                                for part in chunk.candidates[0].content.parts:
                                    if hasattr(part, 'text') and part.text:
                                        yield part.text
                    
                    except Exception as tool_error:
                        logger.error(f"Error executing tool {function_name}: {tool_error}")
                        yield f"\n\n❌ Error executing {function_name}: {str(tool_error)}"
                else:
                    yield f"\n\n❌ Unknown function: {function_name}"
            
            logger.info("Gemini response completed")
                
        except Exception as e:
            # Handle different types of errors with user-friendly messages
            error_str = str(e)
            
            if "validation errors" in error_str.lower():
                error_msg = "Sorry, there was an issue with the message format. Please try again with a simple question."
            elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                error_msg = "⏸️ Rate limit exceeded. Please wait a moment and try again."
            elif "401" in error_str or "UNAUTHORIZED" in error_str:
                error_msg = "⚠️ API authentication failed. Please check your Gemini API key configuration."
            elif "404" in error_str or "NOT_FOUND" in error_str:
                error_msg = "⚠️ The AI model is not available. Please contact support."
            else:
                error_msg = f"Sorry, I encountered an error: {error_str[:200]}"
            
            logger.error(f"Error in Gemini chat: {error_str}", exc_info=True)
            yield error_msg
    
    async def chat(
        self,
        message: str,
        user,
        conversation_history: Optional[list] = None
    ) -> str:
        """
        Get a complete Gemini response (non-streaming).
        
        Args:
            message: User's message
            user: Django user object
            conversation_history: Optional previous conversation messages
        
        Returns:
            Complete response from Gemini
        """
        response_parts = []
        async for chunk in self.chat_stream(message, user, conversation_history):
            response_parts.append(chunk)
        
        return ''.join(response_parts)

