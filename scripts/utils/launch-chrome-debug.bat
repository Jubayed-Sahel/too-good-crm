@echo off
REM Launch Google Chrome in debug mode for MCP
echo Starting Google Chrome in debug mode...
echo Port: 9223
echo User Data Dir: C:\temp\chrome-dev-debug
echo.
echo You can now use Chrome DevTools MCP in Claude Desktop
echo Press Ctrl+C to stop
echo.

"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9223 --user-data-dir="C:\temp\chrome-dev-debug"

