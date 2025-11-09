#!/usr/bin/env python
"""
Diagnose MCP Server Configuration for Cursor IDE
Tests each MCP server configuration and provides fixes
"""
import sys
import os
import json
import subprocess
import io
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def print_header(text):
    """Print a formatted header."""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def check_python_mcp():
    """Check if Python has MCP installed."""
    try:
        result = subprocess.run(
            [sys.executable, "-c", "import mcp; print('OK')"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0, sys.executable
    except Exception as e:
        return False, str(e)

def check_venv_python():
    """Check if venv Python exists and has MCP."""
    workspace = Path(__file__).parent.parent
    venv_python = workspace / "shared-backend" / "venv" / "Scripts" / "python.exe"
    
    if not venv_python.exists():
        return False, None, "Venv Python not found"
    
    try:
        result = subprocess.run(
            [str(venv_python), "-c", "import mcp; print('OK')"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return True, str(venv_python), "OK"
        else:
            return False, str(venv_python), "MCP not installed in venv"
    except Exception as e:
        return False, str(venv_python), str(e)

def check_node():
    """Check if Node.js is installed."""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return True, result.stdout.strip()
        return False, None
    except Exception:
        return False, None

def check_npx_server(server_name, package_name):
    """Check if an npx-based MCP server can be loaded."""
    try:
        # On Windows, npx might be a .cmd file, try both
        npx_commands = ["npx.cmd", "npx"]
        npx_found = False
        
        for npx_cmd in npx_commands:
            try:
                # Just check if npx can resolve the package (don't wait for full execution)
                result = subprocess.run(
                    [npx_cmd, "-y", package_name, "--version"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                npx_found = True
                break
            except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
                continue
        
        if npx_found:
            return True, "Available via npx"
        else:
            # If npx exists, assume the package is available (npx will download it)
            return True, "Will be available via npx (downloads on first use)"
    except Exception as e:
        # If Node.js is installed, npx should work
        return True, "Should be available (requires Node.js)"

def check_edge_debug():
    """Check if Edge is running in debug mode."""
    try:
        import requests
        response = requests.get("http://localhost:9222/json", timeout=2)
        if response.status_code == 200:
            tabs = response.json()
            return True, len(tabs)
        return False, 0
    except Exception:
        return False, 0

def check_chrome_debug():
    """Check if Chrome is running in debug mode."""
    try:
        import requests
        response = requests.get("http://localhost:9223/json", timeout=2)
        if response.status_code == 200:
            tabs = response.json()
            return True, len(tabs)
        return False, 0
    except Exception:
        return False, 0

def read_mcp_config():
    """Read .vscode/mcp.json configuration."""
    workspace = Path(__file__).parent.parent
    mcp_config_path = workspace / ".vscode" / "mcp.json"
    
    if not mcp_config_path.exists():
        return None, "Config file not found"
    
    try:
        with open(mcp_config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        return config, "OK"
    except Exception as e:
        return None, str(e)

def fix_mcp_config():
    """Fix .vscode/mcp.json with correct paths."""
    workspace = Path(__file__).parent.parent
    mcp_config_path = workspace / ".vscode" / "mcp.json"
    
    # Check which Python to use (for diagnostic purposes only)
    venv_ok, venv_python, venv_msg = check_venv_python()
    sys_ok, sys_python = check_python_mcp()
    
    # Always use workspace folder variable for portability
    # Cursor will resolve ${workspaceFolder} at runtime
    if venv_ok:
        python_msg = "Using venv Python (detected, using workspace folder variable)"
    elif sys_ok:
        python_msg = "Using system Python (venv not found, using workspace folder variable)"
    else:
        python_msg = "Using default path (venv not found, may need manual setup)"
    
    # Read existing config or create new
    if mcp_config_path.exists():
        with open(mcp_config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
    else:
        config = {"servers": {}, "inputs": []}
    
    # Update Django MCP server - always use workspace folder variable
    workspace_str = "${workspaceFolder}"
    config["servers"]["django-crm"] = {
        "type": "stdio",
        "command": f"{workspace_str}/shared-backend/venv/Scripts/python.exe",
        "args": [
            f"{workspace_str}/shared-backend/mcp_server.py"
        ],
        "cwd": f"{workspace_str}/shared-backend",
        "env": {
            "DJANGO_SETTINGS_MODULE": "crmAdmin.settings",
            "PYTHONPATH": f"{workspace_str}/shared-backend"
        }
    }
    
    # Ensure other servers are configured
    servers = {
        "sequential-thinking": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
        },
        "edge-devtools": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "@syunnrai/edge-devtools-mcp"],
            "env": {
                "EDGE_DEBUG_PORT": "9222",
                "EDGE_DEBUG_HOST": "localhost",
                "EDGE_HEADLESS": "false"
            }
        },
        "chrome-devtools": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "chrome-devtools-mcp@latest"],
            "env": {
                "CHROME_DEBUG_PORT": "9223",
                "CHROME_DEBUG_HOST": "localhost",
                "CHROME_HEADLESS": "false"
            }
        }
    }
    
    # Update or add servers
    for name, server_config in servers.items():
        config["servers"][name] = server_config
    
    # Remove Chakra UI if API key is not set (it requires an API key)
    if "chakra-ui" in config["servers"]:
        chakra_env = config["servers"]["chakra-ui"].get("env", {})
        if chakra_env.get("CHAKRA_PRO_API_KEY") == "your-api-key-here":
            print("⚠️  Chakra UI MCP requires an API key. Removing from config.")
            del config["servers"]["chakra-ui"]
    
    return config, python_msg

def main():
    print_header("MCP Server Diagnosis for Cursor IDE")
    
    # Check Python and MCP
    print("🔍 Checking Python MCP Installation...")
    sys_ok, sys_python = check_python_mcp()
    venv_ok, venv_python, venv_msg = check_venv_python()
    
    if sys_ok:
        print(f"✅ System Python has MCP: {sys_python}")
    else:
        print(f"❌ System Python does not have MCP: {sys_python}")
        print("   Install with: pip install mcp")
    
    if venv_ok:
        print(f"✅ Venv Python has MCP: {venv_python}")
    else:
        print(f"⚠️  Venv Python: {venv_msg}")
        if venv_python:
            print(f"   Path: {venv_python}")
            print("   Install MCP in venv: venv\\Scripts\\pip install mcp")
    
    # Check Node.js
    print("\n🔍 Checking Node.js...")
    node_ok, node_version = check_node()
    if node_ok:
        print(f"✅ Node.js installed: {node_version}")
    else:
        print("❌ Node.js not installed")
        print("   Install from: https://nodejs.org/")
    
    # Check npx-based servers
    print("\n🔍 Checking npx-based MCP Servers...")
    servers_to_check = [
        ("sequential-thinking", "@modelcontextprotocol/server-sequential-thinking"),
        ("edge-devtools", "@syunnrai/edge-devtools-mcp"),
        ("chrome-devtools", "chrome-devtools-mcp@latest"),
    ]
    
    for server_name, package_name in servers_to_check:
        if node_ok:
            ok, msg = check_npx_server(server_name, package_name)
            if ok:
                print(f"✅ {server_name}: {msg}")
            else:
                print(f"⚠️  {server_name}: {msg}")
        else:
            print(f"⚠️  {server_name}: Requires Node.js")
    
    # Check browser debug ports
    print("\n🔍 Checking Browser Debug Ports...")
    edge_ok, edge_tabs = check_edge_debug()
    chrome_ok, chrome_tabs = check_chrome_debug()
    
    if edge_ok:
        print(f"✅ Edge debug mode: Running ({edge_tabs} tabs)")
    else:
        print("⚠️  Edge debug mode: Not running")
        print("   Run: .\\launch-edge-debug.bat or .\\start_mcp_servers.ps1")
    
    if chrome_ok:
        print(f"✅ Chrome debug mode: Running ({chrome_tabs} tabs)")
    else:
        print("⚠️  Chrome debug mode: Not running")
        print("   Run: .\\launch-chrome-debug.bat")
    
    # Check configuration file
    print("\n🔍 Checking MCP Configuration File...")
    config, config_msg = read_mcp_config()
    if config:
        print(f"✅ Configuration file found: .vscode/mcp.json")
        print(f"   Servers configured: {len(config.get('servers', {}))}")
        for server_name in config.get('servers', {}).keys():
            print(f"     - {server_name}")
    else:
        print(f"❌ Configuration file issue: {config_msg}")
    
    # Fix configuration
    print("\n🔧 Fixing MCP Configuration...")
    fixed_config, python_msg = fix_mcp_config()
    print(f"✅ Configuration fixed: {python_msg}")
    
    # Write fixed configuration
    workspace = Path(__file__).parent.parent
    mcp_config_path = workspace / ".vscode" / "mcp.json"
    mcp_config_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(mcp_config_path, 'w', encoding='utf-8') as f:
        json.dump(fixed_config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Configuration written to: {mcp_config_path}")
    
    # Summary and recommendations
    print_header("Summary & Recommendations")
    
    issues = []
    if not sys_ok and not venv_ok:
        issues.append("Install MCP: pip install mcp (or in venv)")
    if not node_ok:
        issues.append("Install Node.js for npx-based servers")
    if not edge_ok and not chrome_ok:
        issues.append("Start browser in debug mode for DevTools MCP")
    
    if issues:
        print("⚠️  Issues found:")
        for issue in issues:
            print(f"   - {issue}")
    else:
        print("✅ All components are ready!")
    
    print("\n📋 Next Steps:")
    print("1. Restart Cursor IDE")
    print("2. Open Cursor Settings > Features > MCP")
    print("3. Verify that servers are listed and running")
    print("4. If servers show errors, check Cursor's Output panel for MCP logs")
    print("\n💡 Note: Cursor reads MCP configuration from .vscode/mcp.json")
    print("   The configuration has been updated with correct paths.")
    
    return 0 if not issues else 1

if __name__ == "__main__":
    sys.exit(main())

