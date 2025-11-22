"""
MCP Proxy Service
Bridges Gemini service with MCP server tools
"""

import logging
from typing import Dict, Any, Optional, List, Callable
from mcp_server import mcp, set_user_context, get_tool_function, list_tool_names
import asyncio
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


class MCPProxy:
    """Proxy service to execute MCP tools from Gemini service"""
    
    def __init__(self):
        self.tools_registered = True  # Assume tools are registered by mcp_server.py
    
    def set_user_context(self, user_context: Dict[str, Any]):
        """Set user context for MCP tools"""
        set_user_context(user_context)
        logger.debug(f"MCP proxy context set: user={user_context.get('user_id')}, org={user_context.get('organization_id')}")
    
    def get_tool_declarations(self) -> List[Dict[str, Any]]:
        """
        Get function declarations for all registered MCP tools.
        This is used to inform Gemini about available tools.
        
        Returns:
            List of tool declaration dictionaries
        """
        declarations = []
        
        # Access tools from FastMCP instance
        if hasattr(mcp, '_tools'):
            tools = mcp._tools
        elif hasattr(mcp, 'tools'):
            tools = mcp.tools
        else:
            logger.warning("Could not find tools in MCP instance")
            return declarations
        
        # Convert MCP tools to Gemini function declarations
        for tool_name, tool_func in tools.items():
            try:
                # Get tool metadata from function
                if hasattr(tool_func, '__annotations__'):
                    annotations = tool_func.__annotations__
                else:
                    annotations = {}
                
                # Get docstring for description
                docstring = tool_func.__doc__ or f"Tool: {tool_name}"
                
                # Extract parameters from annotations
                properties = {}
                required = []
                
                import inspect
                sig = inspect.signature(tool_func)
                for param_name, param in sig.parameters.items():
                    if param_name == 'return':
                        continue
                    
                    param_type = param.annotation if param.annotation != inspect.Parameter.empty else str
                    param_default = param.default if param.default != inspect.Parameter.empty else None
                    
                    # Convert Python types to Gemini types
                    gemini_type = "STRING"
                    if param_type in [int, float]:
                        gemini_type = "NUMBER"
                    elif param_type == bool:
                        gemini_type = "BOOLEAN"
                    
                    properties[param_name] = {
                        "type": gemini_type,
                        "description": f"Parameter: {param_name}"
                    }
                    
                    if param_default is None:
                        required.append(param_name)
                
                declarations.append({
                    "name": tool_name,
                    "description": docstring.split('\n')[0] if docstring else f"Tool: {tool_name}",
                    "parameters": {
                        "type": "OBJECT",
                        "properties": properties,
                        "required": required
                    }
                })
                
            except Exception as e:
                logger.warning(f"Error processing tool {tool_name}: {e}")
                continue
        
        logger.info(f"Generated {len(declarations)} tool declarations for Gemini")
        return declarations
    
    async def execute_tool(self, tool_name: str, **kwargs) -> Any:
        """
        Execute an MCP tool with given arguments.
        
        Args:
            tool_name: Name of the tool to execute
            **kwargs: Arguments to pass to the tool
        
        Returns:
            Tool execution result
        """
        try:
            tool_func = get_tool_function(tool_name)
            
            if not tool_func:
                available = list_tool_names()
                raise ValueError(f"Tool '{tool_name}' not found. Available tools: {available}")
            
            logger.info(f"Executing MCP tool '{tool_name}' with args: {kwargs}")
            
            # Execute tool (handle both sync and async)
            if asyncio.iscoroutinefunction(tool_func):
                result = await tool_func(**kwargs)
            else:
                result = await sync_to_async(tool_func)(**kwargs)
            
            logger.info(f"MCP tool '{tool_name}' executed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error executing MCP tool '{tool_name}': {str(e)}", exc_info=True)
            raise


# Global MCP proxy instance
_mcp_proxy = None

def get_mcp_proxy() -> MCPProxy:
    """Get or create global MCP proxy instance"""
    global _mcp_proxy
    if _mcp_proxy is None:
        _mcp_proxy = MCPProxy()
    return _mcp_proxy

