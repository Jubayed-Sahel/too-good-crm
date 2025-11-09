# MCP Servers Status for Cursor IDE

## ✅ Current Configuration

The following MCP servers are configured in `.vscode/mcp.json`:

1. **django-crm** - Django CRM MCP server
   - Status: ✅ Configured
   - Type: Python-based (stdio)
   - Requires: MCP SDK installed in Python venv
   - Path: `${workspaceFolder}/shared-backend/venv/Scripts/python.exe`

2. **sequential-thinking** - Sequential Thinking MCP server
   - Status: ✅ Configured
   - Type: npx-based (stdio)
   - Requires: Node.js installed
   - Package: `@modelcontextprotocol/server-sequential-thinking`

3. **edge-devtools** - Edge DevTools MCP server
   - Status: ✅ Configured
   - Type: npx-based (stdio)
   - Requires: Node.js + Edge running in debug mode (port 9222)
   - Package: `@syunnrai/edge-devtools-mcp`

4. **chrome-devtools** - Chrome DevTools MCP server
   - Status: ✅ Configured
   - Type: npx-based (stdio)
   - Requires: Node.js + Chrome running in debug mode (port 9223)
   - Package: `chrome-devtools-mcp@latest`

## 🔧 Configuration Issues Fixed

### Issue 1: Absolute Path in Config ❌ → ✅
**Problem:** Diagnostic script was writing absolute paths instead of workspace variables.

**Fix:** Updated to always use `${workspaceFolder}` variable for portability.

### Issue 2: Chakra UI Server Removed ❌ → ✅
**Problem:** Chakra UI server requires API key which was not configured.

**Fix:** Removed from configuration (can be added back when API key is available).

## 🚀 How to Use

1. **Restart Cursor IDE** - MCP configuration is loaded on startup
2. **Check MCP Status** - Go to `Settings > Features > MCP`
3. **View Logs** - Go to `View > Output > MCP` for server logs
4. **Start Browser Debug Mode** (for DevTools servers):
   ```powershell
   .\launch-edge-debug.bat
   # or
   .\launch-chrome-debug.bat
   ```

## 🔍 Diagnostic Tool

Run the diagnostic script to check server status:

```powershell
python scripts/diagnose_mcp_cursor.py
```

This will:
- ✅ Check Python MCP installation
- ✅ Check Node.js installation
- ✅ Verify npx-based servers
- ✅ Check browser debug ports
- ✅ Fix configuration file issues

## 📝 Next Steps

1. **Restart Cursor** to load the updated configuration
2. **Verify servers** in Cursor Settings > Features > MCP
3. **Check logs** in View > Output > MCP if any servers show errors
4. **Start browsers** in debug mode if using DevTools servers

## 🐛 Troubleshooting

See [CURSOR_MCP_TROUBLESHOOTING.md](./CURSOR_MCP_TROUBLESHOOTING.md) for detailed troubleshooting guide.

## ✅ Verification Checklist

- [x] Configuration file exists (`.vscode/mcp.json`)
- [x] JSON is valid
- [x] All paths use `${workspaceFolder}` variable
- [x] Django MCP server configured
- [x] Sequential Thinking server configured
- [x] Edge DevTools server configured
- [x] Chrome DevTools server configured
- [ ] Cursor IDE restarted (user action required)
- [ ] MCP servers visible in Cursor Settings (user action required)
- [ ] No errors in Cursor MCP logs (user action required)
