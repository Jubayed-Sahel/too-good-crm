#!/usr/bin/env python
"""
Advanced Console Error Checker using Edge DevTools Protocol (CDP)
Connects to Edge browser via WebSocket and captures console errors in real-time
"""
import requests
import json
import time
import sys
import threading
from typing import List, Dict, Optional
from datetime import datetime

try:
    import websocket
    HAS_WEBSOCKET = True
except ImportError:
    HAS_WEBSOCKET = False
    print("⚠️  websocket-client not installed. Install with: pip install websocket-client")

EDGE_DEBUG_PORT = 9222
EDGE_DEBUG_HOST = "localhost"
FRONTEND_URL = "http://localhost:5173"


class CDPClient:
    """Chrome DevTools Protocol Client using WebSocket"""
    
    def __init__(self, host: str = EDGE_DEBUG_HOST, port: int = EDGE_DEBUG_PORT):
        self.host = host
        self.port = port
        self.base_url = f"http://{host}:{port}"
        self.ws = None
        self.target_id = None
        self.ws_url = None
        self.command_id = 0
        self.responses = {}
        self.console_logs = []
        self.errors = []
        self.warnings = []
        self.running = False
        
    def get_tabs(self) -> List[Dict]:
        """Get list of open browser tabs"""
        try:
            response = requests.get(f"{self.base_url}/json", timeout=2)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to Edge on {self.base_url}")
            return []
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def connect_to_tab(self, url: Optional[str] = None) -> bool:
        """Connect to a browser tab via WebSocket"""
        tabs = self.get_tabs()
        
        if not tabs:
            print("❌ No browser tabs found")
            return False
        
        # Find tab with URL or use first tab
        target_tab = None
        if url:
            for tab in tabs:
                if url in tab.get('url', ''):
                    target_tab = tab
                    break
        
        if not target_tab:
            target_tab = tabs[0]
        
        self.ws_url = target_tab.get('webSocketDebuggerUrl', '')
        self.target_id = target_tab['id']
        
        if not self.ws_url:
            print("❌ No WebSocket URL found")
            return False
        
        print(f"✅ Connecting to tab: {target_tab.get('title', 'Unknown')}")
        print(f"   URL: {target_tab.get('url', 'Unknown')}")
        
        return self._connect_websocket()
    
    def _connect_websocket(self) -> bool:
        """Connect to WebSocket"""
        if not HAS_WEBSOCKET:
            print("❌ websocket-client library not installed")
            print("   Install with: pip install websocket-client")
            return False
        
        try:
            self.ws = websocket.WebSocketApp(
                self.ws_url,
                on_message=self._on_message,
                on_error=self._on_error,
                on_close=self._on_close
            )
            
            # Start WebSocket in a thread
            ws_thread = threading.Thread(target=self.ws.run_forever)
            ws_thread.daemon = True
            ws_thread.start()
            
            # Wait for connection
            time.sleep(1)
            
            # Enable console and runtime domains
            self._send_command("Runtime.enable", {})
            self._send_command("Console.enable", {})
            self._send_command("Log.enable", {})
            
            self.running = True
            print("✅ WebSocket connected")
            return True
            
        except Exception as e:
            print(f"❌ Error connecting WebSocket: {e}")
            return False
    
    def _send_command(self, method: str, params: Dict = None) -> int:
        """Send a CDP command"""
        self.command_id += 1
        command = {
            "id": self.command_id,
            "method": method,
            "params": params or {}
        }
        
        if self.ws:
            self.ws.send(json.dumps(command))
        
        return self.command_id
    
    def _on_message(self, ws, message):
        """Handle WebSocket messages"""
        try:
            data = json.loads(message)
            
            # Handle console messages
            if 'method' in data:
                method = data['method']
                params = data.get('params', {})
                
                if method == 'Runtime.consoleAPICalled':
                    self._handle_console_api(params)
                elif method == 'Runtime.exceptionThrown':
                    self._handle_exception(params)
                elif method == 'Log.entryAdded':
                    self._handle_log_entry(params)
            
            # Handle command responses
            elif 'id' in data:
                self.responses[data['id']] = data
                
        except Exception as e:
            print(f"⚠️  Error parsing message: {e}")
    
    def _handle_console_api(self, params: Dict):
        """Handle console API calls"""
        log_type = params.get('type', 'log')
        args = params.get('args', [])
        
        # Extract message from args
        message = ' '.join([arg.get('value', str(arg)) for arg in args])
        
        log_entry = {
            'type': log_type,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'args': args
        }
        
        if log_type == 'error':
            self.errors.append(log_entry)
            print(f"❌ ERROR: {message}")
        elif log_type == 'warning':
            self.warnings.append(log_entry)
            print(f"⚠️  WARNING: {message}")
        else:
            self.console_logs.append(log_entry)
            if log_type in ['log', 'info']:
                print(f"ℹ️  LOG: {message}")
    
    def _handle_exception(self, params: Dict):
        """Handle JavaScript exceptions"""
        exception_details = params.get('exceptionDetails', {})
        exception = exception_details.get('exception', {})
        text = exception.get('description', exception_details.get('text', 'Unknown error'))
        line_number = exception_details.get('lineNumber', '?')
        column_number = exception_details.get('columnNumber', '?')
        url = exception_details.get('url', '?')
        
        error_entry = {
            'type': 'exception',
            'message': text,
            'line': line_number,
            'column': column_number,
            'url': url,
            'timestamp': datetime.now().isoformat()
        }
        
        self.errors.append(error_entry)
        print(f"❌ EXCEPTION: {text}")
        print(f"   Location: {url}:{line_number}:{column_number}")
    
    def _handle_log_entry(self, params: Dict):
        """Handle log entries"""
        entry = params.get('entry', {})
        level = entry.get('level', 'info')
        text = entry.get('text', '')
        
        if level in ['error', 'warning']:
            log_entry = {
                'type': level,
                'message': text,
                'timestamp': datetime.now().isoformat()
            }
            
            if level == 'error':
                self.errors.append(log_entry)
                print(f"❌ LOG ERROR: {text}")
            else:
                self.warnings.append(log_entry)
                print(f"⚠️  LOG WARNING: {text}")
    
    def _on_error(self, ws, error):
        """Handle WebSocket errors"""
        print(f"❌ WebSocket error: {error}")
    
    def _on_close(self, ws, close_status_code, close_msg):
        """Handle WebSocket close"""
        print("⚠️  WebSocket closed")
        self.running = False
    
    def navigate_to(self, url: str):
        """Navigate to a URL"""
        if not self.running:
            print("❌ Not connected")
            return False
        
        self._send_command("Page.navigate", {"url": url})
        print(f"🔍 Navigating to: {url}")
        time.sleep(2)  # Wait for page load
        return True
    
    def wait_for_logs(self, duration: int = 10):
        """Wait and collect logs for specified duration"""
        print(f"\n🔍 Monitoring console for {duration} seconds...")
        print("   (Interact with the page to trigger errors)\n")
        
        start_time = time.time()
        while time.time() - start_time < duration and self.running:
            time.sleep(0.5)
        
        return self.get_summary()
    
    def get_summary(self) -> Dict:
        """Get summary of collected logs"""
        return {
            'errors': self.errors,
            'warnings': self.warnings,
            'logs': self.console_logs,
            'error_count': len(self.errors),
            'warning_count': len(self.warnings),
            'log_count': len(self.console_logs)
        }
    
    def close(self):
        """Close WebSocket connection"""
        if self.ws:
            self.ws.close()
        self.running = False


def main():
    """Main function"""
    import sys
    import io
    # Fix Windows console encoding
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("=" * 70)
    print("  Edge DevTools Console Error Checker (Advanced)")
    print("=" * 70)
    print()
    
    # Check if Edge is running
    print("🔍 Checking Edge connection...")
    client = CDPClient()
    tabs = client.get_tabs()
    
    if not tabs:
        print("❌ Edge is not running in debug mode")
        print()
        print("To start Edge in debug mode, run:")
        print("  .\\launch-edge-debug.bat")
        print()
        return 1
    
    print(f"✅ Edge is running ({len(tabs)} tab(s) found)")
    print()
    
    # Connect to tab
    if not client.connect_to_tab(FRONTEND_URL):
        print("❌ Failed to connect to browser tab")
        return 1
    
    # Navigate to frontend if not already there
    current_url = None
    for tab in tabs:
        if client.target_id == tab['id']:
            current_url = tab.get('url', '')
            break
    
    if FRONTEND_URL not in current_url:
        print(f"\n🔍 Frontend not found in current tab")
        print(f"   Creating new tab with: {FRONTEND_URL}")
        # Note: Creating new tabs requires different approach
        print("   Please manually navigate to your frontend in Edge")
        print()
    
    # Monitor for errors
    print("=" * 70)
    print("  CONSOLE ERROR MONITORING")
    print("=" * 70)
    print()
    
    try:
        summary = client.wait_for_logs(duration=30)
        
        print()
        print("=" * 70)
        print("  SUMMARY")
        print("=" * 70)
        print()
        print(f"❌ Errors: {summary['error_count']}")
        print(f"⚠️  Warnings: {summary['warning_count']}")
        print(f"ℹ️  Logs: {summary['log_count']}")
        print()
        
        if summary['errors']:
            print("=" * 70)
            print("  ERRORS FOUND")
            print("=" * 70)
            for i, error in enumerate(summary['errors'], 1):
                print(f"\n{i}. {error.get('type', 'error').upper()}")
                print(f"   Message: {error.get('message', 'Unknown')}")
                if 'line' in error:
                    print(f"   Location: {error.get('url', '?')}:{error.get('line', '?')}:{error.get('column', '?')}")
                print(f"   Time: {error.get('timestamp', '?')}")
            print()
        
        if summary['warnings']:
            print("=" * 70)
            print("  WARNINGS FOUND")
            print("=" * 70)
            for i, warning in enumerate(summary['warnings'], 1):
                print(f"\n{i}. {warning.get('message', 'Unknown')}")
                print(f"   Time: {warning.get('timestamp', '?')}")
            print()
        
        # Save to file
        output_file = "console_errors_report.json"
        with open(output_file, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"📄 Full report saved to: {output_file}")
        print()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Monitoring stopped by user")
    finally:
        client.close()
    
    return 0 if summary['error_count'] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())

