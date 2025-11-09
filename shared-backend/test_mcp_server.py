#!/usr/bin/env python
"""
Test script to verify MCP server can be initialized.
Run this to verify the MCP server setup is correct.
"""

import os
import sys
from pathlib import Path

# Set up Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')

import django
django.setup()

def test_mcp_server():
    """Test that the MCP server can be imported and initialized."""
    print("Testing MCP Server Setup...")
    print("=" * 50)
    
    try:
        # Import the MCP server
        from mcp_server import app
        print(f"[OK] MCP Server imported successfully")
        print(f"[OK] Server name: {app.name}")
        
        # Verify Django is set up
        from django.apps import apps
        models = apps.get_app_config('crmApp').get_models()
        print(f"[OK] Django setup verified - {len(list(models))} models found")
        
        # Verify MCP dependencies
        from mcp.server import Server
        from mcp.types import Tool
        print(f"[OK] MCP SDK dependencies verified")
        
        print("\n" + "=" * 50)
        print("[SUCCESS] MCP Server is ready to use!")
        print("\nThe server will be started by Cursor when needed.")
        print("Tools available:")
        print("  - list_models: List all Django models")
        print("  - get_model_schema: Get model schema details")
        print("  - query_model: Query models with filters")
        print("  - get_model_stats: Get aggregated statistics")
        print("  - get_related_data: Get related data")
        print("  - search_models: Full-text search")
        return True
        
    except Exception as e:
        print(f"\n[ERROR] Error testing MCP server: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_mcp_server()
    sys.exit(0 if success else 1)

