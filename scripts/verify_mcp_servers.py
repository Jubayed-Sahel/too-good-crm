#!/usr/bin/env python
"""
Verify MCP Servers are running and configured correctly
"""
import requests
import sys
import subprocess
import os

def check_edge_debug():
    """Check if Edge is running in debug mode"""
    try:
        response = requests.get("http://localhost:9222/json", timeout=2)
        if response.status_code == 200:
            tabs = response.json()
            return True, len(tabs), tabs
        return False, 0, []
    except:
        return False, 0, []

def check_django_mcp():
    """Check if Django MCP server dependencies are installed"""
    try:
        result = subprocess.run(
            [sys.executable, "-c", "import mcp; print('OK')"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except:
        return False

def check_node():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0, result.stdout.strip() if result.returncode == 0 else None
    except:
        return False, None

def main():
    import sys
    import io
    # Fix Windows console encoding
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 70)
    print("  MCP Servers Status Check")
    print("=" * 70)
    print()
    
    # Check Edge
    print("🔍 Checking Edge DevTools...")
    edge_running, tab_count, tabs = check_edge_debug()
    if edge_running:
        print(f"✅ Edge is running in debug mode (port 9222)")
        print(f"   Found {tab_count} tab(s)")
        if tabs:
            print("   Open tabs:")
            for i, tab in enumerate(tabs[:5], 1):
                title = tab.get('title', 'Unknown')[:50]
                url = tab.get('url', 'Unknown')
                print(f"     {i}. {title}")
                print(f"        {url}")
    else:
        print("❌ Edge is not running in debug mode")
        print("   Run: .\\start_mcp_servers.ps1")
        print("   Or: .\\launch-edge-debug.bat")
    print()
    
    # Check Django MCP
    print("🔍 Checking Django MCP Server...")
    if check_django_mcp():
        print("✅ Django MCP Server dependencies installed")
        print("   Location: shared-backend\\mcp_server.py")
    else:
        print("❌ Django MCP Server dependencies not installed")
        print("   Install with: pip install mcp")
    print()
    
    # Check Node.js
    print("🔍 Checking Node.js...")
    node_installed, node_version = check_node()
    if node_installed:
        print(f"✅ Node.js is installed: {node_version}")
        print("   Edge DevTools MCP will use npx")
    else:
        print("❌ Node.js is not installed")
        print("   Install Node.js to use Edge DevTools MCP")
    print()
    
    # Summary
    print("=" * 70)
    print("  Summary")
    print("=" * 70)
    print()
    
    all_ready = edge_running and check_django_mcp() and node_installed
    
    if all_ready:
        print("✅ All MCP servers are ready!")
        print()
        print("Next steps:")
        print("1. Configure Claude Desktop (see MCP_SETUP.md)")
        print("2. Restart Claude Desktop")
        print("3. MCP servers will start automatically when Claude connects")
    else:
        print("⚠️  Some components are missing")
        print()
        if not edge_running:
            print("  - Start Edge in debug mode: .\\start_mcp_servers.ps1")
        if not check_django_mcp():
            print("  - Install MCP: pip install mcp")
        if not node_installed:
            print("  - Install Node.js: https://nodejs.org/")
    print()
    
    return 0 if all_ready else 1

if __name__ == "__main__":
    sys.exit(main())

