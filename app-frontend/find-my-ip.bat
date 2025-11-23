@echo off
echo ========================================
echo    Finding Your Computer's IP Address
echo ========================================
echo.

REM Get the IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    REM Remove leading space
    set IP=!IP:~1!
    echo Found IP Address: !IP!
    echo.
)

REM Alternative method if above doesn't work
echo All Network Adapters:
echo.
ipconfig | findstr /i "IPv4"

echo.
echo ========================================
echo.
echo To setup your phone:
echo 1. Make sure your phone is on the SAME WiFi as this computer
echo 2. Edit this file: gradle.properties
echo 3. Update this line:
echo    BACKEND_URL=http://YOUR_IP:8000/api/
echo.
echo Example with your IP:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo    BACKEND_URL=http://!IP!:8000/api/
    goto :done
)
:done
echo.
echo 4. Start your Django backend with:
echo    python manage.py runserver 0.0.0.0:8000
echo.
echo 5. Test on phone's browser: http://YOUR_IP:8000/admin
echo.
echo ========================================
pause

