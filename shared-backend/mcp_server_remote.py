#!/usr/bin/env python
"""
Remote Django MCP (Model Context Protocol) Server
Connects to a deployed Heroku Django API via REST API instead of direct database access.
This is safer for production environments and allows proper authentication.
"""

import os
import sys
import json
import asyncio
import aiohttp
from typing import Any, Dict, List, Optional
from pathlib import Path

try:
    from mcp.server import Server
    from mcp.types import Tool, TextContent
    import mcp.server.stdio
except ImportError:
    print("Error: MCP SDK not installed. Install with: pip install mcp aiohttp", file=sys.stderr)
    sys.exit(1)

# Initialize MCP server
app = Server("django-crm-remote-mcp-server")

# Configuration from environment variables
API_BASE_URL = os.getenv('HEROKU_APP_URL', os.getenv('DJANGO_API_URL', 'http://localhost:8000'))
API_TOKEN = os.getenv('DJANGO_API_TOKEN', '')  # Optional: API token for authentication


async def api_request(method: str, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Dict:
    """Make an async HTTP request to the Django API."""
    url = f"{API_BASE_URL.rstrip('/')}{endpoint}"
    
    default_headers = {
        'Content-Type': 'application/json',
    }
    if API_TOKEN:
        default_headers['Authorization'] = f'Token {API_TOKEN}'
    
    if headers:
        default_headers.update(headers)
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, json=data, headers=default_headers) as response:
                response_text = await response.text()
                try:
                    return {
                        'status': response.status,
                        'data': json.loads(response_text) if response_text else {},
                        'success': response.status < 400
                    }
                except json.JSONDecodeError:
                    return {
                        'status': response.status,
                        'data': {'raw': response_text},
                        'success': response.status < 400
                    }
    except Exception as e:
        return {
            'status': 0,
            'data': {'error': str(e)},
            'success': False
        }


# MCP Tools
@app.list_tools()
async def list_tools() -> List[Tool]:
    """List all available MCP tools."""
    return [
        Tool(
            name="list_api_endpoints",
            description="List available API endpoints from the Django REST API",
            inputSchema={
                "type": "object",
                "properties": {
                    "app_name": {
                        "type": "string",
                        "description": "Filter by app name (e.g., 'customers', 'deals')",
                    }
                },
            },
        ),
        Tool(
            name="query_api",
            description="Query a Django API endpoint with filters, ordering, and pagination",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint path (e.g., '/api/customers/', '/api/deals/')",
                    },
                    "method": {
                        "type": "string",
                        "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"],
                        "description": "HTTP method",
                        "default": "GET",
                    },
                    "filters": {
                        "type": "object",
                        "description": "Query parameters as key-value pairs (e.g., {'status': 'active', 'organization_id': 1})",
                        "additionalProperties": True,
                    },
                    "data": {
                        "type": "object",
                        "description": "Request body data for POST/PUT/PATCH requests",
                        "additionalProperties": True,
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results (for pagination)",
                        "default": 25,
                    },
                    "offset": {
                        "type": "integer",
                        "description": "Offset for pagination",
                        "default": 0,
                    },
                },
                "required": ["endpoint"],
            },
        ),
        Tool(
            name="get_api_resource",
            description="Get a specific resource by ID from an API endpoint",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint path (e.g., '/api/customers/')",
                    },
                    "resource_id": {
                        "type": "integer",
                        "description": "ID of the resource to retrieve",
                    },
                },
                "required": ["endpoint", "resource_id"],
            },
        ),
        Tool(
            name="create_api_resource",
            description="Create a new resource via API",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint path (e.g., '/api/customers/')",
                    },
                    "data": {
                        "type": "object",
                        "description": "Resource data to create",
                        "additionalProperties": True,
                    },
                },
                "required": ["endpoint", "data"],
            },
        ),
        Tool(
            name="update_api_resource",
            description="Update an existing resource via API",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint path (e.g., '/api/customers/')",
                    },
                    "resource_id": {
                        "type": "integer",
                        "description": "ID of the resource to update",
                    },
                    "data": {
                        "type": "object",
                        "description": "Resource data to update (partial updates supported)",
                        "additionalProperties": True,
                    },
                },
                "required": ["endpoint", "resource_id", "data"],
            },
        ),
        Tool(
            name="delete_api_resource",
            description="Delete a resource via API",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint path (e.g., '/api/customers/')",
                    },
                    "resource_id": {
                        "type": "integer",
                        "description": "ID of the resource to delete",
                    },
                },
                "required": ["endpoint", "resource_id"],
            },
        ),
        Tool(
            name="search_api",
            description="Search across API endpoints with a query string",
            inputSchema={
                "type": "object",
                "properties": {
                    "endpoint": {
                        "type": "string",
                        "description": "API endpoint path (e.g., '/api/customers/')",
                    },
                    "query": {
                        "type": "string",
                        "description": "Search query string",
                    },
                    "search_fields": {
                        "type": "array",
                        "description": "Fields to search in (if API supports field-specific search)",
                        "items": {"type": "string"},
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results",
                        "default": 25,
                    },
                },
                "required": ["endpoint", "query"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> List[TextContent]:
    """Handle tool calls."""
    
    try:
        if name == "list_api_endpoints":
            # Try to fetch API root or schema
            result = await api_request('GET', '/api/')
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        elif name == "query_api":
            endpoint = arguments["endpoint"]
            method = arguments.get("method", "GET")
            filters = arguments.get("filters", {})
            data = arguments.get("data")
            limit = arguments.get("limit", 25)
            offset = arguments.get("offset", 0)
            
            # Add pagination and filters to query params for GET requests
            if method == "GET":
                params = {**filters, 'limit': limit, 'offset': offset}
                # Convert to query string
                query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
                if query_string:
                    endpoint = f"{endpoint}?{query_string}"
                result = await api_request(method, endpoint)
            else:
                result = await api_request(method, endpoint, data=data)
            
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        elif name == "get_api_resource":
            endpoint = arguments["endpoint"]
            resource_id = arguments["resource_id"]
            
            result = await api_request('GET', f"{endpoint.rstrip('/')}/{resource_id}/")
            
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        elif name == "create_api_resource":
            endpoint = arguments["endpoint"]
            data = arguments["data"]
            
            result = await api_request('POST', endpoint, data=data)
            
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        elif name == "update_api_resource":
            endpoint = arguments["endpoint"]
            resource_id = arguments["resource_id"]
            data = arguments["data"]
            
            result = await api_request('PATCH', f"{endpoint.rstrip('/')}/{resource_id}/", data=data)
            
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        elif name == "delete_api_resource":
            endpoint = arguments["endpoint"]
            resource_id = arguments["resource_id"]
            
            result = await api_request('DELETE', f"{endpoint.rstrip('/')}/{resource_id}/")
            
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        elif name == "search_api":
            endpoint = arguments["endpoint"]
            query = arguments["query"]
            search_fields = arguments.get("search_fields", [])
            limit = arguments.get("limit", 25)
            
            # Build search query
            search_params = {'search': query, 'limit': limit}
            if search_fields:
                search_params['search_fields'] = ','.join(search_fields)
            
            query_string = '&'.join([f"{k}={v}" for k, v in search_params.items()])
            endpoint = f"{endpoint}?{query_string}"
            
            result = await api_request('GET', endpoint)
            
            return [TextContent(
                type="text",
                text=json.dumps(result, indent=2)
            )]
        
        else:
            return [TextContent(
                type="text",
                text=f"Unknown tool: {name}"
            )]
    
    except Exception as e:
        return [TextContent(
            type="text",
            text=json.dumps({
                "error": str(e),
                "type": type(e).__name__,
            }, indent=2)
        )]


async def main():
    """Run the MCP server."""
    print(f"Starting Remote Django MCP Server...", file=sys.stderr)
    print(f"API Base URL: {API_BASE_URL}", file=sys.stderr)
    
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    asyncio.run(main())

