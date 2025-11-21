"""
Gemini AI Service
Integrates Google Gemini with MCP server for AI-powered CRM operations
"""

import os
import logging
import asyncio
from typing import Optional, Dict, Any, AsyncIterator
from django.conf import settings
from asgiref.sync import sync_to_async
from fastmcp import Client as MCPClient
from google import genai

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for handling Gemini AI interactions with MCP tools"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not configured. Gemini features will not be available.")
        
        self.model_name = "gemini-2.0-flash-exp"  # Using Gemini 2.0 Flash
        self.mcp_server_path = os.path.join(settings.BASE_DIR, 'mcp_server.py')
    
    @sync_to_async
    def _get_user_context_sync(self, user) -> Dict[str, Any]:
        """
        Synchronous helper to build user context from database.
        This is wrapped by get_user_context for async compatibility.
        """
        # Get active user profile
        active_profile = user.user_profiles.filter(
            is_primary=True,
            status='active'
        ).first() or user.user_profiles.filter(status='active').first()
        
        if not active_profile:
            raise ValueError("No active profile found for user")
        
        # Get user permissions
        permissions = []
        
        try:
            # Get all permissions for user's role
            user_roles = user.user_roles.filter(
                organization=active_profile.organization,
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
            'organization_id': active_profile.organization_id,
            'role': active_profile.profile_type,
            'permissions': permissions
        }
        
        logger.info(
            f"Built user context: user={user.id}, org={active_profile.organization_id}, "
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
        return await self._get_user_context_sync(user)
    
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
        if not self.api_key:
            yield "Error: Gemini API key not configured. Please set GEMINI_API_KEY in your environment."
            return
        
        try:
            # Build user context (async operation)
            user_context = await self.get_user_context(user)
            
            # Initialize Gemini client (sync)
            gemini_client = genai.Client(api_key=self.api_key)
            
            # Note: For now, we'll skip MCP integration to test basic Gemini functionality
            # MCP integration requires running the MCP server as a separate process
            # TODO: Start MCP server as subprocess or use HTTP transport
            
            # For testing without MCP:
            if False:  # Disable MCP for now
                # Initialize MCP client with user context
                mcp_client = MCPClient(self.mcp_server_path)
                
                # Set user context in MCP server
                async with mcp_client:
                    # Pass user context to MCP server
                    mcp_client.context = user_context
                
            # Build conversation contents
            contents = []
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history:
                    contents.append(msg)
            
            # Add current message
            contents.append(message)
            
            # System instruction to guide Gemini
            system_instruction = self._build_system_prompt(user_context)
            
            logger.info(f"Sending message to Gemini (user: {user_context['user_id']})")
            
            # Generate response with streaming (without MCP tools for now)
            response = await gemini_client.aio.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=genai.types.GenerateContentConfig(
                    temperature=0.7,
                    top_p=0.95,
                    max_output_tokens=2048,
                    system_instruction=system_instruction,
                )
            )
            
            # Stream the response
            if hasattr(response, 'text'):
                # Non-streaming response
                yield response.text
            else:
                # Streaming response
                async for chunk in response:
                    if hasattr(chunk, 'text'):
                        yield chunk.text
            
            logger.info("Gemini response completed")
                
        except Exception as e:
            error_msg = f"Error in Gemini chat: {str(e)}"
            logger.error(error_msg, exc_info=True)
            yield f"\n\nError: {error_msg}"
    
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

