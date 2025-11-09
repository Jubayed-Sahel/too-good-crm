#!/usr/bin/env python
"""
Console Error Checker using Edge DevTools Protocol
Connects to Edge browser in debug mode and captures console errors
"""
import requests
import json
import time
import sys
from typing import List, Dict, Optional
from datetime import datetime

EDGE_DEBUG_PORT = 9222
EDGE_DEBUG_HOST = "localhost"
FRONTEND_URL = "http://localhost:5173"  # Vite dev server default


class EdgeDevToolsClient:
    """Client for Edge DevTools Protocol"""
    
    def __init__(self, host: str = EDGE_DEBUG_HOST, port: int = EDGE_DEBUG_PORT):
        self.base_url = f"http://{host}:{port}"
        self.session_id = None
        self.target_id = None
        
    def get_tabs(self) -> List[Dict]:
        """Get list of open browser tabs"""
        try:
            response = requests.get(f"{self.base_url}/json")
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to Edge on {self.base_url}")
            print("   Make sure Edge is running with: --remote-debugging-port=9222")
            return []
        except Exception as e:
            print(f"❌ Error getting tabs: {e}")
            return []
    
    def connect_to_tab(self, url: Optional[str] = None) -> bool:
        """Connect to a browser tab, optionally creating one with the given URL"""
        tabs = self.get_tabs()
        
        if not tabs:
            print("❌ No browser tabs found")
            return False
        
        # Find existing tab with the URL, or use first tab
        target_tab = None
        if url:
            for tab in tabs:
                if url in tab.get('url', ''):
                    target_tab = tab
                    break
        
        if not target_tab:
            target_tab = tabs[0]
        
        self.target_id = target_tab['id']
        websocket_url = target_tab.get('webSocketDebuggerUrl', '')
        
        if not websocket_url:
            print("❌ No WebSocket debugger URL found")
            return False
        
        print(f"✅ Connected to tab: {target_tab.get('title', 'Unknown')}")
        print(f"   URL: {target_tab.get('url', 'Unknown')}")
        return True
    
    def create_tab(self, url: str) -> bool:
        """Create a new tab with the given URL"""
        try:
            response = requests.get(f"{self.base_url}/json/new?{url}")
            response.raise_for_status()
            tab = response.json()
            self.target_id = tab['id']
            print(f"✅ Created new tab: {url}")
            return True
        except Exception as e:
            print(f"❌ Error creating tab: {e}")
            return False
    
    def execute_command(self, method: str, params: Dict = None) -> Optional[Dict]:
        """Execute a Chrome DevTools Protocol command"""
        if not self.target_id:
            print("❌ No target connected")
            return None
        
        url = f"{self.base_url}/json/runtime/evaluate"
        payload = {
            "targetId": self.target_id,
            "expression": f"({method})"
        }
        
        try:
            # Use WebSocket-like API via HTTP
            # For full protocol, we'd need websocket library
            # This is a simplified version using HTTP endpoints
            
            # Get console logs via JavaScript execution
            if method == "getConsoleLogs":
                js_code = """
                (function() {
                    const logs = [];
                    const originalLog = console.log;
                    const originalError = console.error;
                    const originalWarn = console.warn;
                    
                    console.log = function(...args) {
                        logs.push({type: 'log', args: args.map(String)});
                        originalLog.apply(console, args);
                    };
                    
                    console.error = function(...args) {
                        logs.push({type: 'error', args: args.map(String)});
                        originalError.apply(console, args);
                    };
                    
                    console.warn = function(...args) {
                        logs.push({type: 'warn', args: args.map(String)});
                        originalWarn.apply(console, args);
                    };
                    
                    return logs;
                })()
                """
                
                response = requests.post(
                    f"{self.base_url}/json/runtime/evaluate",
                    json={
                        "targetId": self.target_id,
                        "expression": js_code,
                        "returnByValue": True
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get('result', {}).get('value', [])
            
            return None
        except Exception as e:
            print(f"❌ Error executing command: {e}")
            return None
    
    def get_console_messages(self) -> List[Dict]:
        """Get console messages using Log domain"""
        # This requires WebSocket connection for real-time logs
        # For now, we'll use a simpler approach
        return []
    
    def navigate_to(self, url: str) -> bool:
        """Navigate to a URL"""
        if not self.target_id:
            return False
        
        try:
            response = requests.get(f"{self.base_url}/json/runtime/evaluate", params={
                "targetId": self.target_id,
                "expression": f"window.location.href = '{url}'"
            })
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Error navigating: {e}")
            return False


def check_edge_connection():
    """Check if Edge is running in debug mode"""
    try:
        response = requests.get(f"http://{EDGE_DEBUG_HOST}:{EDGE_DEBUG_PORT}/json", timeout=2)
        return response.status_code == 200
    except:
        return False


def main():
    """Main function to check console errors"""
    import sys
    import io
    # Fix Windows console encoding
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 70)
    print("  Edge DevTools Console Error Checker")
    print("=" * 70)
    print()
    
    # Check if Edge is running in debug mode
    print("🔍 Checking Edge connection...")
    if not check_edge_connection():
        print("❌ Edge is not running in debug mode")
        print()
        print("To start Edge in debug mode, run:")
        print("  .\\launch-edge-debug.bat")
        print("  OR")
        print("  .\\launch-edge-debug.ps1")
        print()
        print("Or manually:")
        print(f'  msedge.exe --remote-debugging-port={EDGE_DEBUG_PORT} --user-data-dir="C:\\temp\\edge-dev-debug"')
        return 1
    
    print("✅ Edge is running in debug mode")
    print()
    
    # Connect to Edge
    client = EdgeDevToolsClient()
    
    print("🔍 Looking for browser tabs...")
    tabs = client.get_tabs()
    
    if not tabs:
        print("❌ No browser tabs found")
        print("   Please open Edge and navigate to your frontend")
        return 1
    
    print(f"✅ Found {len(tabs)} tab(s)")
    print()
    
    # Show available tabs
    print("Available tabs:")
    for i, tab in enumerate(tabs, 1):
        title = tab.get('title', 'Unknown')[:50]
        url = tab.get('url', 'Unknown')
        print(f"  {i}. {title}")
        print(f"     {url}")
    print()
    
    # Try to find or create frontend tab
    frontend_tab = None
    for tab in tabs:
        if FRONTEND_URL in tab.get('url', ''):
            frontend_tab = tab
            break
    
    if not frontend_tab:
        print(f"⚠️  Frontend tab not found ({FRONTEND_URL})")
        print("   Using first available tab")
        print("   You can manually navigate to your frontend")
        frontend_tab = tabs[0]
    
    client.target_id = frontend_tab['id']
    print(f"✅ Connected to: {frontend_tab.get('title', 'Unknown')}")
    print(f"   URL: {frontend_tab.get('url', 'Unknown')}")
    print()
    
    # Note: Full console log capture requires WebSocket connection
    # This is a simplified version that shows the approach
    print("=" * 70)
    print("  CONSOLE ERROR CHECKING")
    print("=" * 70)
    print()
    print("📝 Note: Full console log capture requires WebSocket connection")
    print("   For complete error detection, use:")
    print("   1. Open Edge DevTools manually (F12)")
    print("   2. Check Console tab for errors")
    print("   3. Or use the Edge DevTools MCP in Claude Desktop")
    print()
    print("💡 To use Edge DevTools MCP in Claude Desktop:")
    print("   1. Make sure Edge is running in debug mode")
    print("   2. Configure MCP in Claude Desktop (see MCP_SETUP.md)")
    print("   3. Ask Claude to:")
    print("      - 'Navigate to http://localhost:5173'")
    print("      - 'Get console errors from the current page'")
    print("      - 'Capture console logs'")
    print("      - 'Check for JavaScript errors'")
    print()
    
    # Try to get basic page info
    try:
        response = requests.get(
            f"http://{EDGE_DEBUG_HOST}:{EDGE_DEBUG_PORT}/json/runtime/evaluate",
            params={
                "targetId": client.target_id,
                "expression": "JSON.stringify({title: document.title, url: window.location.href, errors: window.onerror ? 'error handler exists' : 'no error handler'})",
                "returnByValue": True
            },
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            page_info = json.loads(result.get('result', {}).get('value', '{}'))
            print("📄 Page Information:")
            print(f"   Title: {page_info.get('title', 'Unknown')}")
            print(f"   URL: {page_info.get('url', 'Unknown')}")
            print()
    except Exception as e:
        print(f"⚠️  Could not get page info: {e}")
        print()
    
    print("=" * 70)
    print("  NEXT STEPS")
    print("=" * 70)
    print()
    print("1. Open Edge DevTools (F12) to see console errors manually")
    print("2. Use Claude Desktop with Edge DevTools MCP for automated checking")
    print("3. Check browser console for:")
    print("   - JavaScript errors (red)")
    print("   - Warnings (yellow)")
    print("   - Network errors")
    print("   - React errors (if using React)")
    print()
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

