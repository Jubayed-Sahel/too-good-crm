@echo off
echo ========================================
echo Starting Too Good CRM Backend Server
echo ========================================
echo.
echo Server will start on: http://localhost:8000
echo WebSocket endpoint: ws://localhost:8000/ws/video-call/{user_id}/
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
python -m daphne -b 0.0.0.0 -p 8000 crmAdmin.asgi:application
