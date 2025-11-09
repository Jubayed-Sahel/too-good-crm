# Model Context Protocol (MCP) Setup Guide

This document explains how to set up and use the Model Context Protocol (MCP) servers in this project.

## Available MCP Servers

### 1. Django CRM MCP Server
Provides AI assistants with structured access to Django models, queries, and data.

**Location:** `shared-backend/mcp_server.py`

**Features:**
- List all Django models
- Get model schemas
- Query models with filters
- Get aggregated statistics
- Search across model fields
- Access related data

### 2. Edge DevTools MCP Server
Enables advanced debugging and automation with Microsoft Edge browser.

**Features:**
- Connect and control Microsoft Edge browser
- Access full DevTools protocol support
- Capture page screenshots
- Perform DOM operations and queries
- Execute JavaScript in browser context
- Monitor network requests
- Automate page interactions

## Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (3.10 or higher)
3. **Microsoft Edge** browser installed

### Step 1: Install Python Dependencies

```bash
cd shared-backend
pip install mcp
```

### Step 2: Install Edge DevTools MCP (Optional)

The Edge DevTools MCP server is installed automatically when needed via `npx`, but you can pre-install it:

```bash
npm install -g @syunnrai/edge-devtools-mcp
```

### Step 3: Configure Claude Desktop (or other MCP Client)

#### For Windows:
1. Locate your Claude Desktop config file:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add or merge the MCP server configuration:

```json
{
  "mcpServers": {
    "django-crm": {
      "command": "python",
      "args": [
        "D:\\LearnAppDev\\too-good-crm\\shared-backend\\mcp_server.py"
      ],
      "env": {
        "DJANGO_SETTINGS_MODULE": "crmAdmin.settings"
      }
    },
    "edge-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@syunnrai/edge-devtools-mcp"
      ],
      "env": {
        "EDGE_DEBUG_PORT": "9222",
        "EDGE_DEBUG_HOST": "localhost",
        "EDGE_HEADLESS": "false"
      }
    }
  }
}
```

**Important:** Replace the path `D:\\LearnAppDev\\too-good-crm\\` with your actual project path, and make sure to use double backslashes (`\\`) on Windows.

#### For macOS/Linux:
1. Locate your Claude Desktop config file:
   ```
   ~/Library/Application Support/Claude/claude_desktop_config.json  # macOS
   ~/.config/Claude/claude_desktop_config.json                       # Linux
   ```

2. Add or merge the configuration (use forward slashes for paths):

```json
{
  "mcpServers": {
    "django-crm": {
      "command": "python",
      "args": [
        "/path/to/too-good-crm/shared-backend/mcp_server.py"
      ],
      "env": {
        "DJANGO_SETTINGS_MODULE": "crmAdmin.settings"
      }
    },
    "edge-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@syunnrai/edge-devtools-mcp"
      ],
      "env": {
        "EDGE_DEBUG_PORT": "9222",
        "EDGE_DEBUG_HOST": "localhost",
        "EDGE_HEADLESS": "false"
      }
    }
  }
}
```

### Step 4: Launch Edge in Debug Mode

Before using the Edge DevTools MCP server, you need to start Microsoft Edge with remote debugging enabled:

#### Windows:
```cmd
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"
```

Or via PowerShell:
```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"
```

#### macOS:
```bash
/Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge --remote-debugging-port=9222 --user-data-dir="/tmp/edge-dev-debug"
```

#### Linux:
```bash
microsoft-edge --remote-debugging-port=9222 --user-data-dir="/tmp/edge-dev-debug"
```

**Note:** The `--user-data-dir` flag creates a separate browser profile for debugging, which prevents conflicts with your regular browsing session.

### Step 5: Restart Claude Desktop

After updating the configuration file, restart Claude Desktop for the changes to take effect.

## Usage

### Using Django CRM MCP

Once configured, you can ask Claude to:
- "List all models in the CRM"
- "Show me the schema for the Customer model"
- "Query all active deals"
- "Search for customers with the name 'John'"
- "Get statistics for deals closed this month"

### Using Edge DevTools MCP

With Edge running in debug mode, you can ask Claude to:
- "Take a screenshot of the current page"
- "Navigate to https://example.com"
- "Click the button with id 'submit'"
- "Get all links on the page"
- "Execute JavaScript: document.title"
- "Monitor network requests"
- "Fill in the form field with name 'email'"

## Troubleshooting

### Django MCP Server Issues

1. **"MCP SDK not installed" error:**
   ```bash
   cd shared-backend
   pip install mcp
   ```

2. **Django setup errors:**
   - Ensure you're in the correct directory
   - Check that `DJANGO_SETTINGS_MODULE` is set correctly
   - Verify database migrations are up to date

### Edge DevTools MCP Issues

1. **"Cannot connect to Edge" error:**
   - Ensure Edge is running with `--remote-debugging-port=9222`
   - Check that port 9222 is not blocked by a firewall
   - Verify the `EDGE_DEBUG_PORT` matches the port Edge is using

2. **Edge not found:**
   - Set the `EDGE_BROWSER_PATH` environment variable to point to your Edge executable
   - Example (Windows): `"EDGE_BROWSER_PATH": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"`

3. **npx not found:**
   - Ensure Node.js is installed and `npx` is in your PATH
   - Try installing the package globally: `npm install -g @syunnrai/edge-devtools-mcp`

## Configuration Options

### Edge DevTools Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EDGE_DEBUG_PORT` | 9222 | Port for Edge remote debugging |
| `EDGE_DEBUG_HOST` | localhost | Host for Edge debugging |
| `EDGE_HEADLESS` | false | Run Edge in headless mode |
| `EDGE_BROWSER_PATH` | (auto-detect) | Path to Edge executable |

## Security Considerations

1. **Remote Debugging:** When Edge is running in debug mode, it opens a local port that can be used to control the browser. Only run this on trusted networks.

2. **Separate User Data Dir:** Always use a separate user data directory for debugging to isolate it from your regular browsing profile.

3. **MCP Access:** The MCP servers have access to your Django database and can control the browser. Only use them in development environments.

## Advanced Configuration

### Running Edge in Headless Mode

To run Edge without a visible window:

```json
{
  "mcpServers": {
    "edge-devtools": {
      "command": "npx",
      "args": ["-y", "@syunnrai/edge-devtools-mcp"],
      "env": {
        "EDGE_DEBUG_PORT": "9222",
        "EDGE_DEBUG_HOST": "localhost",
        "EDGE_HEADLESS": "true"
      }
    }
  }
}
```

Then launch Edge with the `--headless` flag:
```bash
msedge.exe --headless --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"
```

### Using a Different Port

If port 9222 is already in use, you can specify a different port:

1. Update the MCP configuration:
   ```json
   "env": {
     "EDGE_DEBUG_PORT": "9223"
   }
   ```

2. Launch Edge with the new port:
   ```bash
   msedge.exe --remote-debugging-port=9223 --user-data-dir="C:\temp\edge-dev-debug"
   ```

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Edge DevTools Protocol](https://docs.microsoft.com/en-us/microsoft-edge/devtools-protocol-chromium/)
- [Claude Desktop MCP Setup](https://docs.anthropic.com/claude/docs/model-context-protocol)
- [Edge DevTools MCP Package](https://www.npmjs.com/package/@syunnrai/edge-devtools-mcp)

## Quick Start Script

For convenience, you can create a script to launch Edge in debug mode:

### Windows (launch-edge-debug.bat):
```batch
@echo off
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"
```

### Windows (launch-edge-debug.ps1):
```powershell
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"
```

### macOS/Linux (launch-edge-debug.sh):
```bash
#!/bin/bash
# macOS
/Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge --remote-debugging-port=9222 --user-data-dir="/tmp/edge-dev-debug"

# Linux
# microsoft-edge --remote-debugging-port=9222 --user-data-dir="/tmp/edge-dev-debug"
```

Make the script executable (macOS/Linux):
```bash
chmod +x launch-edge-debug.sh
```

