@echo off
REM Start MCP Servers for Too Good CRM
echo Starting MCP Servers...
echo.

REM Check if PowerShell is available
where powershell >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    powershell -ExecutionPolicy Bypass -File "%~dp0start_mcp_servers.ps1"
) else (
    echo PowerShell is required to run this script.
    echo Please install PowerShell or run start_mcp_servers.ps1 manually.
    pause
    exit /b 1
)

