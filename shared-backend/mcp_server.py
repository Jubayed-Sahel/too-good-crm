"""
FastMCP Server for Too Good CRM
Provides AI assistant tools for Gemini integration
"""

import os
import sys
import django
import asyncio
from typing import Optional, Dict, Any, List
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
from mcp_tools.analytics_tools import register_analytics_tools
from mcp_tools.order_tools import register_order_tools
from mcp_tools.employee_tools import register_employee_tools
from mcp_tools.organization_tools import register_organization_tools

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP(
    name="CRM Assistant",
    version="1.0.0",
    description="AI-powered CRM assistant with access to customer, lead, deal, issue, and analytics data"
)

# Global user context storage (set by Gemini proxy)
_user_context: Dict[str, Any] = {}

def set_user_context(context: Dict[str, Any]):
    """Set the current user context for tool execution"""
    global _user_context
    _user_context = context
    logger.info(f"User context set: user_id={context.get('user_id')}, org_id={context.get('organization_id')}, role={context.get('role')}")

def get_user_context() -> Dict[str, Any]:
    """Get the current user context"""
    return _user_context

def check_permission(resource: str, action: str) -> bool:
    """
    Check if current user has permission for resource:action
    
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
    
    # Employees have read access to most resources
    if role == 'employee' and action == 'read':
        return True
    
    # Customers can only read their own data and create issues
    if role == 'customer':
        if resource == 'issue' and action in ['create', 'read']:
            return True
        if action == 'read' and resource in ['customer', 'order', 'payment']:
            return True
    
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
register_analytics_tools(mcp)
register_order_tools(mcp)
register_employee_tools(mcp)
register_organization_tools(mcp)
logger.info("All MCP tools registered successfully")

if __name__ == "__main__":
    # Run the MCP server
    mcp.run()

