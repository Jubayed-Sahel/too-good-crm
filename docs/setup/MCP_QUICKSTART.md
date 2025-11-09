# MCP Quick Start Guide

Quick reference for setting up and using Model Context Protocol (MCP) with Too Good CRM.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install MCP Python Package

```bash
cd shared-backend
pip install mcp
```

### Step 2: Configure Claude Desktop

**Windows:** Edit `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration (update the path to match your project location):

```json
{
  "mcpServers": {
    "django-crm": {
      "command": "python",
      "args": ["D:\\LearnAppDev\\too-good-crm\\shared-backend\\mcp_server.py"],
      "env": {
        "DJANGO_SETTINGS_MODULE": "crmAdmin.settings"
      }
    },
    "edge-devtools": {
      "command": "npx",
      "args": ["-y", "@syunnrai/edge-devtools-mcp"],
      "env": {
        "EDGE_DEBUG_PORT": "9222",
        "EDGE_DEBUG_HOST": "localhost",
        "EDGE_HEADLESS": "false"
      }
    }
  }
}
```

### Step 3: Launch Edge in Debug Mode

**Option A:** Double-click `launch-edge-debug.bat`

**Option B:** Run PowerShell script:
```powershell
.\launch-edge-debug.ps1
```

**Option C:** Manual command:
```cmd
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"
```

### Step 4: Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP servers.

## ✅ Verify Setup

In Claude Desktop, ask:

1. **Test Django CRM MCP:**
   - "List all models in the CRM"
   - "Show me the Customer model schema"

2. **Test Edge DevTools MCP:**
   - "Take a screenshot of the current page"
   - "Get the page title"

## 📖 Common Commands

### Django CRM MCP

| Ask Claude... | What it does |
|--------------|-------------|
| "List all models in the CRM" | Shows all Django models |
| "Show me the Customer model schema" | Displays Customer model fields |
| "Query all active customers" | Retrieves active customer data |
| "Get stats for closed deals" | Aggregates deal statistics |
| "Search for leads with 'John'" | Full-text search in leads |

### Edge DevTools MCP

| Ask Claude... | What it does |
|--------------|-------------|
| "Take a screenshot" | Captures current page |
| "Navigate to https://example.com" | Opens URL in Edge |
| "Click button with id 'submit'" | Clicks element |
| "Get all links on the page" | Lists all links |
| "Execute: document.title" | Runs JavaScript |
| "Fill form field 'email' with 'test@example.com'" | Fills input field |

## 🔧 Troubleshooting

### Django MCP Not Working?

1. Check Python MCP package is installed:
   ```bash
   pip list | grep mcp
   ```

2. Verify path in Claude config matches your project location

3. Ensure backend database is migrated:
   ```bash
   cd shared-backend
   python manage.py migrate
   ```

### Edge DevTools MCP Not Working?

1. ✅ Is Edge running in debug mode? (Check for Edge window with blank profile)
2. ✅ Is port 9222 open? Try: `netstat -an | findstr 9222`
3. ✅ Is Node.js installed? Run: `node --version`
4. ✅ Restart Claude Desktop after making config changes

### Common Errors

| Error | Solution |
|-------|----------|
| "Cannot connect to Edge" | Launch Edge with `--remote-debugging-port=9222` |
| "MCP SDK not installed" | Run `pip install mcp` in shared-backend |
| "Module not found" | Check Python path in Claude config |
| "Port already in use" | Change port to 9223 in both config and launch command |

## 🎯 Use Cases

### Data Analysis
```
"Show me all customers created in the last 30 days"
"What's the average deal value for won deals?"
"List all employees with their assigned customer count"
```

### Web Automation
```
"Navigate to http://localhost:5173 and take a screenshot"
"Fill in the login form with my test credentials"
"Click all buttons on the page and report any errors"
"Monitor network requests when I click the submit button"
```

### Development Workflow
```
"Query the Lead model and show me all fields"
"Test if the Customer API returns correct data"
"Navigate to the frontend and verify the login page works"
```

## 📚 Full Documentation

For detailed setup instructions, configuration options, and advanced features, see:
- [MCP_SETUP.md](MCP_SETUP.md) - Complete setup guide
- [mcp-config.json](mcp-config.json) - Configuration reference

## 🆘 Still Need Help?

1. Read the full setup guide: [MCP_SETUP.md](MCP_SETUP.md)
2. Check the [MCP Documentation](https://modelcontextprotocol.io/)
3. Verify your configuration matches the examples in [mcp-config.json](mcp-config.json)

---

**Pro Tip:** Keep Edge running in debug mode while using MCP for instant browser automation! 🚀

