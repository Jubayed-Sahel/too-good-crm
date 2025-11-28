"""
FastMCP Server for Too Good CRM
Provides AI assistant tools for Gemini integration
"""

import os
import sys
import django
import asyncio
from typing import Optional, Dict, Any, List, Callable
from contextvars import ContextVar
import logging

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from fastmcp import FastMCP
from django.contrib.auth import get_user_model

# Import tool modules
from mcp_tools.customer_tools import register_customer_tools
from mcp_tools.lead_tools import register_lead_tools
from mcp_tools.deal_tools import register_deal_tools
from mcp_tools.issue_tools import register_issue_tools
from mcp_tools.order_tools import register_order_tools
from mcp_tools.employee_tools import register_employee_tools
from mcp_tools.organization_tools import register_organization_tools

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP(name="CRM Assistant", version="1.0.0")

# Thread-safe user context storage using ContextVar (fixes data leakage in concurrent requests)
_user_context_var: ContextVar[Dict[str, Any]] = ContextVar('user_context', default={})

def set_user_context(context: Dict[str, Any], token: Optional[str] = None):
    """
    Set the current user context for tool execution (thread-safe).
    
    Args:
        context: User context dictionary with user_id, organization_id, role, permissions
        token: Optional JWT token for validation
    
    Security:
        - Uses ContextVar for thread-safe storage (no data leakage between requests)
        - Optionally validates JWT token if provided
        - Logs all context changes for audit trail
    """
    # Optional: Validate JWT token if provided
    if token:
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            decoded_token = AccessToken(token)
            
            # Verify user_id matches
            if decoded_token['user_id'] != context.get('user_id'):
                logger.error(f"JWT validation failed: user_id mismatch. Token: {decoded_token['user_id']}, Context: {context.get('user_id')}")
                raise PermissionError("User ID mismatch in token validation")
            
            # Verify organization_id matches if present in token
            token_org_id = decoded_token.get('organization_id')
            context_org_id = context.get('organization_id')
            if token_org_id and context_org_id and token_org_id != context_org_id:
                logger.error(f"JWT validation failed: organization_id mismatch. Token: {token_org_id}, Context: {context_org_id}")
                raise PermissionError("Organization ID mismatch in token validation")
            
            logger.info(f"JWT token validated successfully for user {context.get('user_id')}")
        except Exception as e:
            logger.error(f"JWT token validation failed: {str(e)}", exc_info=True)
            raise PermissionError(f"Invalid JWT token: {str(e)}")
    
    # Set context in thread-safe ContextVar
    _user_context_var.set(context)
    
    logger.info(
        f"MCP Context Set: user_id={context.get('user_id')}, "
        f"org_id={context.get('organization_id')}, "
        f"role={context.get('role')}, "
        f"is_superuser={context.get('is_superuser', False)}, "
        f"is_staff={context.get('is_staff', False)}, "
        f"permissions_count={len(context.get('permissions', []))}"
    )

def get_user_context() -> Dict[str, Any]:
    """
    Get the current user context (thread-safe).
    
    Returns:
        User context dictionary for the current request context.
        Each thread/async task has its own isolated context.
    """
    return _user_context_var.get()

def check_permission(resource: str, action: str) -> bool:
    """
    Check if current user has permission for resource:action.
    
    Authorization hierarchy (checked in order):
    1. Superusers (is_superuser=True) → FULL access to EVERYTHING
    2. Staff users (is_staff=True) → FULL access to EVERYTHING
    3. Vendors (role='vendor') → FULL access to THEIR organization
    4. Employees (role='employee') → Based on assigned permissions
    5. Customers (role='customer') → Limited read access + issue creation
    
    Args:
        resource: Resource type (customer, lead, deal, issue, etc.)
        action: Action type (read, create, update, delete)
    
    Returns:
        bool: True if user has permission
    
    Raises:
        PermissionError: If user lacks permission
    """
    context = get_user_context()
    
    if not context:
        logger.warning("MCP permission check failed: No user context available")
        raise PermissionError("No user context available. Please authenticate.")
    
    user_id = context.get('user_id')
    org_id = context.get('organization_id')
    role = context.get('role', '')
    
    # ===== PRIORITY 1: SUPERUSER CHECK =====
    # Superusers have ALL permissions across ALL organizations
    if context.get('is_superuser'):
        logger.info(f"MCP Permission GRANTED (superuser): user={user_id}, resource={resource}:{action}")
        return True
    
    # ===== PRIORITY 2: STAFF USER CHECK =====
    # Staff users (Django admins) have ALL permissions across ALL organizations
    if context.get('is_staff'):
        logger.info(f"MCP Permission GRANTED (staff): user={user_id}, resource={resource}:{action}")
        return True
    
    # ===== PRIORITY 3: PERMISSION-BASED CHECK =====
    permissions = context.get('permissions', [])
    required_permission = f"{resource}:{action}"
    
    # Check if user has the specific permission
    if required_permission in permissions:
        logger.debug(f"MCP Permission GRANTED (explicit): user={user_id}, resource={resource}:{action}")
        return True
    
    # Check for wildcard permissions
    if f"{resource}:*" in permissions or "*:*" in permissions:
        logger.debug(f"MCP Permission GRANTED (wildcard): user={user_id}, resource={resource}:{action}")
        return True
    
    # ===== PRIORITY 4: ROLE-BASED SHORTCUTS =====
    
    # Vendors have full access to their organization
    if role == 'vendor':
        logger.debug(f"MCP Permission GRANTED (vendor): user={user_id}, resource={resource}:{action}")
        return True
    
    # Employees have read access to most resources in their organization
    if role == 'employee' and action == 'read':
        logger.debug(f"MCP Permission GRANTED (employee read): user={user_id}, resource={resource}:{action}")
        return True
    
    # Customers can only read their own data and create issues
    if role == 'customer':
        if resource == 'issue' and action in ['create', 'read']:
            logger.debug(f"MCP Permission GRANTED (customer issue): user={user_id}, resource={resource}:{action}")
            return True
        if action == 'read' and resource in ['customer', 'order', 'payment']:
            logger.debug(f"MCP Permission GRANTED (customer read): user={user_id}, resource={resource}:{action}")
            return True
    
    # ===== PERMISSION DENIED =====
    logger.warning(
        f"MCP Permission DENIED: user={user_id}, org={org_id}, role={role}, "
        f"resource={resource}:{action}, permissions={len(permissions)}"
    )
    
    raise PermissionError(
        f"Permission denied: You don't have '{required_permission}' permission. "
        f"Your role: {role}, Available permissions: {permissions}"
    )

def get_organization_id() -> Optional[int]:
    """Get the organization ID from user context"""
    context = get_user_context()
    return context.get('organization_id')

def get_user_id() -> Optional[int]:
    """Get the user ID from user context"""
    context = get_user_context()
    return context.get('user_id')

def get_user_role() -> Optional[str]:
    """Get the user role from user context"""
    context = get_user_context()
    return context.get('role')

# Make helper functions available to tool modules
mcp.check_permission = check_permission
mcp.get_organization_id = get_organization_id
mcp.get_user_id = get_user_id
mcp.get_user_role = get_user_role
mcp.get_user_context = get_user_context
mcp.set_user_context = set_user_context

# Register all tool modules
logger.info("Registering MCP tools...")
register_customer_tools(mcp)
register_lead_tools(mcp)
register_deal_tools(mcp)
register_issue_tools(mcp)
register_order_tools(mcp)
register_employee_tools(mcp)
register_organization_tools(mcp)
logger.info("All MCP tools registered successfully")

# Global tool registry for direct access
_tool_registry: Dict[str, Callable] = {}

# Access registered tools from FastMCP and store in registry
if hasattr(mcp, '_tools'):
    _tool_registry.update(mcp._tools)
elif hasattr(mcp, 'tools'):
    _tool_registry.update(mcp.tools)
elif hasattr(mcp, '_registered_tools'):
    _tool_registry.update(mcp._registered_tools)
else:
    logger.warning("Could not find tools in FastMCP instance. Tools may not be accessible.")

logger.info(f"Tool registry initialized with {len(_tool_registry)} tools: {list(_tool_registry.keys())[:10]}...")

def get_tool_function(tool_name: str) -> Optional[Callable]:
    """Get a tool function by name"""
    return _tool_registry.get(tool_name)

def list_tool_names() -> List[str]:
    """List all registered tool names"""
    return list(_tool_registry.keys())

if __name__ == "__main__":
    # Run the MCP server
    mcp.run()

