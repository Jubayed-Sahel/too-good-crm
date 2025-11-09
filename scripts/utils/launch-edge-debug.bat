@echo off
REM Launch Microsoft Edge in debug mode for MCP
echo Starting Microsoft Edge in debug mode...
echo Port: 9222
echo User Data Dir: C:\temp\edge-dev-debug
echo.
echo You can now use Edge DevTools MCP in Claude Desktop
echo Press Ctrl+C to stop
echo.

"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"

