# Cursor IDE MCP Server Troubleshooting Guide

This guide helps you diagnose and fix MCP server issues in Cursor IDE.

## 🔍 Quick Diagnosis

Run the diagnostic script to check all MCP servers:

```powershell
python scripts/diagnose_mcp_cursor.py
```

This will:
- ✅ Check Python MCP installation
- ✅ Check Node.js installation
- ✅ Verify npx-based servers
- ✅ Check browser debug ports
- ✅ Fix configuration file issues

## 📋 MCP Servers Configured

The following MCP servers are configured in `.vscode/mcp.json`:

1. **django-crm** - Django CRM MCP server (Python-based)
2. **sequential-thinking** - Sequential Thinking MCP server (npx-based)
3. **edge-devtools** - Edge DevTools MCP server (npx-based, requires Edge in debug mode)
4. **chrome-devtools** - Chrome DevTools MCP server (npx-based, requires Chrome in debug mode)

## 🚨 Common Issues & Fixes

### Issue 1: MCP Servers Not Showing in Cursor

**Symptoms:**
- MCP servers don't appear in Cursor Settings > Features > MCP
- No MCP tools available in chat

**Solutions:**
1. **Restart Cursor IDE** - MCP configuration is loaded on startup
2. **Check configuration file** - Verify `.vscode/mcp.json` exists and is valid JSON
3. **Check Cursor logs** - Go to `View > Output` and select "MCP" from the dropdown
4. **Verify file paths** - Ensure all paths in `.vscode/mcp.json` are correct

### Issue 2: Django MCP Server Not Starting

**Symptoms:**
- Django MCP server shows error in Cursor
- Error: "MCP SDK not installed" or "Django settings module not found"

**Solutions:**
1. **Install MCP in Python:**
   ```powershell
   pip install mcp
   ```
   
2. **Install MCP in venv (if using venv):**
   ```powershell
   cd shared-backend
   venv\Scripts\pip install mcp
   ```

3. **Verify Django settings:**
   ```powershell
   cd shared-backend
   python manage.py check
   ```

4. **Check Python path in `.vscode/mcp.json`:**
   - Should point to Python with MCP installed
   - Venv path: `${workspaceFolder}/shared-backend/venv/Scripts/python.exe`
   - System Python: Full path to Python executable

### Issue 3: npx-based Servers Not Working

**Symptoms:**
- Sequential Thinking, Edge DevTools, or Chrome DevTools servers show errors
- Error: "npx not found" or "Command failed"

**Solutions:**
1. **Verify Node.js is installed:**
   ```powershell
   node --version
   npm --version
   ```

2. **Install Node.js if missing:**
   - Download from: https://nodejs.org/
   - Restart Cursor after installation

3. **Verify npx works:**
   ```powershell
   npx --version
   ```

4. **Test server manually:**
   ```powershell
   npx -y @modelcontextprotocol/server-sequential-thinking --help
   ```

### Issue 4: Browser DevTools MCP Not Working

**Symptoms:**
- Edge/Chrome DevTools MCP shows connection errors
- Error: "Cannot connect to browser" or "Debug port not available"

**Solutions:**
1. **Start Edge in debug mode:**
   ```powershell
   .\launch-edge-debug.bat
   # or
   .\start_mcp_servers.ps1
   ```

2. **Start Chrome in debug mode:**
   ```powershell
   .\launch-chrome-debug.bat
   ```

3. **Verify debug port is accessible:**
   ```powershell
   # Check Edge (port 9222)
   curl http://localhost:9222/json
   
   # Check Chrome (port 9223)
   curl http://localhost:9223/json
   ```

4. **Check firewall settings** - Ensure ports 9222 and 9223 are not blocked

### Issue 5: Configuration File Errors

**Symptoms:**
- Invalid JSON errors
- Path resolution errors
- Environment variable issues

**Solutions:**
1. **Validate JSON:**
   ```powershell
   # Use Python to validate
   python -c "import json; json.load(open('.vscode/mcp.json'))"
   ```

2. **Fix paths:**
   - Use `${workspaceFolder}` for workspace-relative paths
   - Use absolute paths for system executables
   - Use forward slashes `/` or escaped backslashes `\\`

3. **Check environment variables:**
   - Verify `DJANGO_SETTINGS_MODULE` is correct
   - Verify `PYTHONPATH` includes the backend directory

## 🔧 Manual Configuration Fix

If the diagnostic script doesn't fix the issue, manually edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "django-crm": {
      "type": "stdio",
      "command": "${workspaceFolder}/shared-backend/venv/Scripts/python.exe",
      "args": [
        "${workspaceFolder}/shared-backend/mcp_server.py"
      ],
      "cwd": "${workspaceFolder}/shared-backend",
      "env": {
        "DJANGO_SETTINGS_MODULE": "crmAdmin.settings",
        "PYTHONPATH": "${workspaceFolder}/shared-backend"
      }
    },
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
  },
  "inputs": []
}
```

## 📊 Checking MCP Server Status in Cursor

1. **Open Cursor Settings:**
   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Go to `Features > MCP`

2. **View MCP Logs:**
   - Go to `View > Output`
   - Select "MCP" from the dropdown
   - Look for error messages or connection issues

3. **Test MCP Tools:**
   - Open Cursor Chat
   - Try using MCP tools (they should appear automatically)
   - Check if tools are responding

## 🎯 Step-by-Step Setup

1. **Install Dependencies:**
   ```powershell
   # Install MCP in Python
   pip install mcp
   
   # Verify Node.js (should be installed)
   node --version
   ```

2. **Run Diagnostic:**
   ```powershell
   python scripts/diagnose_mcp_cursor.py
   ```

3. **Start Browser Debug Mode (if needed):**
   ```powershell
   .\launch-edge-debug.bat
   ```

4. **Restart Cursor IDE**

5. **Verify in Cursor:**
   - Settings > Features > MCP
   - Check that servers are listed
   - Check for any error indicators

## 🐛 Debugging Tips

1. **Check Cursor Logs:**
   - `View > Output > MCP` - MCP server logs
   - `View > Output > Cursor` - General Cursor logs

2. **Test Servers Manually:**
   ```powershell
   # Test Django MCP
   cd shared-backend
   python mcp_server.py
   
   # Test Sequential Thinking
   npx -y @modelcontextprotocol/server-sequential-thinking
   ```

3. **Verify File Permissions:**
   - Ensure Cursor has read/write access to `.vscode/mcp.json`
   - Ensure Python scripts are executable

4. **Check Network/Firewall:**
   - Browser debug ports (9222, 9223) should be accessible
   - No firewall blocking localhost connections

## 📝 Notes

- **Cursor reads MCP config from:** `.vscode/mcp.json`
- **Config format:** VS Code MCP configuration format
- **Servers start automatically** when Cursor loads the workspace
- **Browser DevTools servers** require browsers to be running in debug mode
- **npx servers** download packages on first use (requires internet)

## 🆘 Still Having Issues?

1. **Check Cursor Version:** Ensure you're using the latest version
2. **Check MCP Server Versions:** Some servers may have compatibility issues
3. **Review Cursor Documentation:** https://cursor.sh/docs
4. **Check MCP Server Logs:** Look for specific error messages
5. **Try Disabling Servers:** Disable servers one by one to isolate the issue

## ✅ Verification Checklist

- [ ] Python has MCP installed (`pip install mcp`)
- [ ] Node.js is installed (`node --version`)
- [ ] `.vscode/mcp.json` exists and is valid JSON
- [ ] All file paths in config are correct
- [ ] Browser debug mode is running (for DevTools servers)
- [ ] Cursor IDE has been restarted after configuration changes
- [ ] MCP servers appear in Cursor Settings > Features > MCP
- [ ] No errors in Cursor Output > MCP logs

