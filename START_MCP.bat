@echo off
echo ============================================================
echo   Starting MCP Servers for Too Good CRM
echo ============================================================
echo.

echo [1/2] Starting Edge in debug mode...
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\edge-dev-debug"

echo.
echo [2/2] Waiting for Edge to start...
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo   MCP Server Status
echo ============================================================
echo.

python scripts\verify_mcp_servers.py

echo.
echo ============================================================
echo   Next Steps
echo ============================================================
echo.
echo 1. Edge should now be running in debug mode
echo 2. Configure Claude Desktop (see MCP_SETUP.md)
echo 3. Restart Claude Desktop
echo 4. MCP servers will start automatically when Claude connects
echo.
echo Press any key to exit...
pause >nul

