#!/usr/bin/env python
"""
Django MCP (Model Context Protocol) Server
Provides AI assistants with structured access to Django models, queries, and data.
"""

import os
import sys
import json
import asyncio
from typing import Any, Dict, List, Optional
from pathlib import Path

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')

import django
django.setup()

from django.apps import apps
from django.db import models
from django.core import serializers
from django.db.models import Q, Count, Sum, Avg, Max, Min
from django.contrib.contenttypes.models import ContentType

try:
    from mcp.server import Server
    from mcp.types import Tool, TextContent, ImageContent, EmbeddedResource
    import mcp.server.stdio
except ImportError:
    print("Error: MCP SDK not installed. Install with: pip install mcp", file=sys.stderr)
    sys.exit(1)


# Initialize MCP server
app = Server("django-crm-mcp-server")


# Helper functions
def get_model_fields(model_class) -> List[Dict[str, Any]]:
    """Get all fields for a Django model."""
    fields = []
    for field in model_class._meta.get_fields():
        field_info = {
            "name": field.name,
            "type": field.__class__.__name__,
            "verbose_name": getattr(field, 'verbose_name', field.name),
        }
        
        if hasattr(field, 'null'):
            field_info["nullable"] = field.null
        if hasattr(field, 'blank'):
            field_info["blank"] = field.blank
        if hasattr(field, 'choices') and field.choices:
            field_info["choices"] = [{"value": k, "label": v} for k, v in field.choices]
        if hasattr(field, 'max_length'):
            field_info["max_length"] = field.max_length
        if hasattr(field, 'related_model') and field.related_model:
            field_info["related_model"] = field.related_model.__name__
            
        fields.append(field_info)
    
    return fields


def serialize_queryset(queryset, max_results: int = 100) -> List[Dict]:
    """Serialize Django queryset to JSON-serializable dict."""
    results = []
    for obj in queryset[:max_results]:
        data = {}
        for field in obj._meta.get_fields():
            if field.many_to_many or field.one_to_many:
                continue
            try:
                value = getattr(obj, field.name)
                if hasattr(value, 'pk'):
                    data[field.name] = str(value)
                elif isinstance(value, (str, int, float, bool, type(None))):
                    data[field.name] = value
                else:
                    data[field.name] = str(value)
            except Exception:
                pass
        results.append(data)
    return results


# MCP Tools
@app.list_tools()
async def list_tools() -> List[Tool]:
    """List all available MCP tools."""
    return [
        Tool(
            name="list_models",
            description="List all Django models in the CRM application with their fields and relationships",
            inputSchema={
                "type": "object",
                "properties": {
                    "app_label": {
                        "type": "string",
                        "description": "Filter models by Django app label (e.g., 'crmApp')",
                    }
                },
            },
        ),
        Tool(
            name="get_model_schema",
            description="Get detailed schema information for a specific Django model including all fields, relationships, and constraints",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the Django model (e.g., 'User', 'Customer', 'Deal')",
                    }
                },
                "required": ["model_name"],
            },
        ),
        Tool(
            name="query_model",
            description="Query a Django model with filters, ordering, and limits. Returns serialized data.",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the Django model to query",
                    },
                    "filters": {
                        "type": "object",
                        "description": "Django ORM filter parameters as key-value pairs (e.g., {'status': 'active', 'organization_id': 1})",
                        "additionalProperties": True,
                    },
                    "order_by": {
                        "type": "array",
                        "description": "Fields to order by (prefix with '-' for descending)",
                        "items": {"type": "string"},
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default: 100, max: 1000)",
                        "default": 100,
                    },
                },
                "required": ["model_name"],
            },
        ),
        Tool(
            name="get_model_stats",
            description="Get aggregated statistics for a Django model (count, sum, avg, min, max)",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the Django model",
                    },
                    "filters": {
                        "type": "object",
                        "description": "Django ORM filter parameters",
                        "additionalProperties": True,
                    },
                    "aggregations": {
                        "type": "object",
                        "description": "Aggregations to perform (e.g., {'total_revenue': 'sum__amount', 'avg_deal_value': 'avg__amount'})",
                        "additionalProperties": {"type": "string"},
                    },
                },
                "required": ["model_name"],
            },
        ),
        Tool(
            name="get_related_data",
            description="Get related data for a specific model instance (foreign keys, reverse relations)",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the Django model",
                    },
                    "instance_id": {
                        "type": "integer",
                        "description": "Primary key of the instance",
                    },
                    "relation_name": {
                        "type": "string",
                        "description": "Name of the relation to fetch (e.g., 'customers', 'deals', 'assigned_to')",
                    },
                },
                "required": ["model_name", "instance_id", "relation_name"],
            },
        ),
        Tool(
            name="search_models",
            description="Full-text search across specified fields in a model",
            inputSchema={
                "type": "object",
                "properties": {
                    "model_name": {
                        "type": "string",
                        "description": "Name of the Django model to search",
                    },
                    "query": {
                        "type": "string",
                        "description": "Search query string",
                    },
                    "fields": {
                        "type": "array",
                        "description": "Fields to search in (e.g., ['name', 'email', 'company_name'])",
                        "items": {"type": "string"},
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results",
                        "default": 50,
                    },
                },
                "required": ["model_name", "query", "fields"],
            },
        ),
    ]


@app.call_tool()
async def call_tool(name: str, arguments: Any) -> List[TextContent]:
    """Handle tool calls."""
    
    try:
        if name == "list_models":
            app_label = arguments.get("app_label", "crmApp")
            app_config = apps.get_app_config(app_label)
            models_info = []
            
            for model in app_config.get_models():
                models_info.append({
                    "name": model.__name__,
                    "app_label": model._meta.app_label,
                    "table_name": model._meta.db_table,
                    "verbose_name": str(model._meta.verbose_name),
                    "field_count": len(model._meta.get_fields()),
                })
            
            return [TextContent(
                type="text",
                text=json.dumps(models_info, indent=2)
            )]
        
        elif name == "get_model_schema":
            model_name = arguments["model_name"]
            model_class = apps.get_model("crmApp", model_name)
            
            schema = {
                "name": model_class.__name__,
                "app_label": model_class._meta.app_label,
                "table_name": model_class._meta.db_table,
                "verbose_name": str(model_class._meta.verbose_name),
                "verbose_name_plural": str(model_class._meta.verbose_name_plural),
                "fields": get_model_fields(model_class),
                "unique_together": [list(ut) for ut in model_class._meta.unique_together],
                "indexes": [idx.name for idx in model_class._meta.indexes],
            }
            
            return [TextContent(
                type="text",
                text=json.dumps(schema, indent=2)
            )]
        
        elif name == "query_model":
            model_name = arguments["model_name"]
            model_class = apps.get_model("crmApp", model_name)
            
            filters = arguments.get("filters", {})
            order_by = arguments.get("order_by", [])
            limit = min(arguments.get("limit", 100), 1000)
            
            queryset = model_class.objects.filter(**filters)
            if order_by:
                queryset = queryset.order_by(*order_by)
            
            results = serialize_queryset(queryset, max_results=limit)
            
            return [TextContent(
                type="text",
                text=json.dumps({
                    "count": queryset.count(),
                    "results": results,
                }, indent=2)
            )]
        
        elif name == "get_model_stats":
            model_name = arguments["model_name"]
            model_class = apps.get_model("crmApp", model_name)
            
            filters = arguments.get("filters", {})
            aggregations = arguments.get("aggregations", {})
            
            queryset = model_class.objects.filter(**filters)
            
            stats = {
                "count": queryset.count(),
            }
            
            if aggregations:
                agg_dict = {}
                for key, field_agg in aggregations.items():
                    agg_type, field_name = field_agg.split("__")
                    if agg_type == "sum":
                        agg_dict[key] = Sum(field_name)
                    elif agg_type == "avg":
                        agg_dict[key] = Avg(field_name)
                    elif agg_type == "min":
                        agg_dict[key] = Min(field_name)
                    elif agg_type == "max":
                        agg_dict[key] = Max(field_name)
                    elif agg_type == "count":
                        agg_dict[key] = Count(field_name)
                
                stats.update(queryset.aggregate(**agg_dict))
            
            return [TextContent(
                type="text",
                text=json.dumps(stats, indent=2, default=str)
            )]
        
        elif name == "get_related_data":
            model_name = arguments["model_name"]
            instance_id = arguments["instance_id"]
            relation_name = arguments["relation_name"]
            
            model_class = apps.get_model("crmApp", model_name)
            instance = model_class.objects.get(pk=instance_id)
            
            related_data = getattr(instance, relation_name)
            
            if hasattr(related_data, 'all'):
                # Many-to-many or reverse foreign key
                results = serialize_queryset(related_data.all())
            else:
                # Foreign key
                results = serialize_queryset([related_data] if related_data else [])
            
            return [TextContent(
                type="text",
                text=json.dumps(results, indent=2)
            )]
        
        elif name == "search_models":
            model_name = arguments["model_name"]
            query = arguments["query"]
            fields = arguments["fields"]
            limit = min(arguments.get("limit", 50), 1000)
            
            model_class = apps.get_model("crmApp", model_name)
            
            # Build Q objects for OR search across fields
            q_objects = Q()
            for field in fields:
                q_objects |= Q(**{f"{field}__icontains": query})
            
            queryset = model_class.objects.filter(q_objects)[:limit]
            results = serialize_queryset(queryset)
            
            return [TextContent(
                type="text",
                text=json.dumps({
                    "query": query,
                    "results_count": len(results),
                    "results": results,
                }, indent=2)
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
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await app.run(
            read_stream,
            write_stream,
            app.create_initialization_options()
        )


if __name__ == "__main__":
    print("Starting Django MCP Server...", file=sys.stderr)
    asyncio.run(main())
