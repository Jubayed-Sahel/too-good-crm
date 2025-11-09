# Browser Interaction Guide

This guide explains how to enable browser interaction through Chrome DevTools MCP in Cursor.

## ✅ Current Setup Status

- ✅ Chrome DevTools MCP configured in `mcp-config.json`
- ✅ Chrome DevTools MCP configured in `.vscode/mcp.json` (Cursor)
- ✅ Launch scripts created (`launch-chrome-debug.ps1` and `launch-chrome-debug.bat`)

## 🚀 Quick Start

### Step 1: Launch Chrome in Debug Mode

**Option A: Use PowerShell Script (Recommended)**
```powershell
.\launch-chrome-debug.ps1
```

**Option B: Use Batch Script**
```cmd
.\launch-chrome-debug.bat
```

**Option C: Manual Launch**
```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\temp\chrome-dev-debug"
```

### Step 2: Restart Cursor

After launching Chrome, **restart Cursor** to load the MCP configuration and connect to the browser.

### Step 3: Verify Connection

Once Cursor restarts, the Chrome DevTools MCP server should automatically connect to your running Chrome instance.

## 🎯 What I Can Do With Browser Interaction

Once Chrome is running in debug mode and Cursor has loaded the MCP server, I can:

### Navigation
- Navigate to URLs
- Go back/forward in browser history
- Reload pages
- Wait for page loads

### Page Interaction
- Click buttons and links
- Fill in form fields
- Select dropdown options
- Scroll pages
- Take screenshots

### DOM Operations
- Query elements by CSS selectors, XPath, or text
- Get element properties and attributes
- Modify DOM elements
- Execute JavaScript in page context

### Performance & Debugging
- Monitor network requests
- Capture console logs
- Analyze page performance
- Debug JavaScript errors

### Automation
- Automate user workflows
- Test form submissions
- Verify page functionality
- Check for errors and warnings

## 📝 Example Use Cases

### 1. Test Your Web Frontend
```
"Navigate to http://localhost:5173 and take a screenshot"
"Click the login button and check for errors"
"Fill in the customer form and submit it"
```

### 2. Debug Issues
```
"Take a screenshot of the current page"
"Get all console errors from the page"
"Check the network requests when I click submit"
```

### 3. Verify Functionality
```
"Navigate to the CRM dashboard and verify all buttons work"
"Check if the customer list page loads correctly"
"Test the search functionality"
```

## 🔧 Troubleshooting

### Chrome Not Connecting?

1. **Check if Chrome is running in debug mode:**
   ```powershell
   netstat -an | findstr "9223"
   ```
   You should see port 9223 in LISTENING state.

2. **Verify Chrome launched correctly:**
   - Chrome should open with a separate profile (no extensions/bookmarks)
   - Check Chrome taskbar icon - it should show a separate window

3. **Check Cursor MCP logs:**
   - Look for MCP-related errors in Cursor's output panel
   - Verify `.vscode/mcp.json` is properly formatted

### Port Already in Use?

If port 9223 is already in use:

1. **Find what's using the port:**
   ```powershell
   netstat -ano | findstr "9223"
   ```

2. **Kill the process** or **change the port** in:
   - `.vscode/mcp.json` (update `CHROME_DEBUG_PORT`)
   - `launch-chrome-debug.ps1` (update `--remote-debugging-port`)

### MCP Server Not Loading?

1. **Verify Node.js is installed:**
   ```powershell
   node --version
   npx --version
   ```

2. **Test MCP server manually:**
   ```powershell
   npx -y chrome-devtools-mcp@latest
   ```

3. **Check Cursor MCP configuration:**
   - Ensure `.vscode/mcp.json` is valid JSON
   - Verify file paths are correct
   - Restart Cursor after making changes

## 🔒 Security Notes

- **Remote debugging** opens a local port that allows browser control
- **Only use on trusted networks** - don't expose port 9223 to the internet
- **Separate profile** - The debug profile is isolated from your main Chrome profile
- **Development only** - This setup is for development/testing purposes

## 📚 Additional Resources

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Chrome DevTools Protocol Documentation](https://chromedevtools.github.io/devtools-protocol/)
- [MCP Documentation](https://modelcontextprotocol.io/)

## 🎉 Ready to Use!

Once Chrome is running in debug mode and Cursor has restarted, you can ask me to:

- "Navigate to http://localhost:5173"
- "Take a screenshot of the current page"
- "Click the button with id 'submit'"
- "Get all console errors"
- "Fill in the form with test data"

I'll be able to interact with your browser and help you test, debug, and automate your web application! 🚀

