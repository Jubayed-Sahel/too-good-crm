@echo off
echo.
echo ========================================
echo Finding your computer's IP address...
echo ========================================
echo.

:: Get IPv4 address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
:: Trim leading spaces
for /f "tokens=* delims= " %%a in ("%IP%") do set IP=%%a

echo Your computer's IP address: %IP%
echo.
echo ========================================
echo UPDATE REQUIRED
echo ========================================
echo.
echo To use your physical device:
echo.
echo 1. Make sure your phone is on the SAME WiFi network as this computer
echo 2. Open: gradle.properties
echo 3. Find the line: BACKEND_URL=http://10.0.2.2:8000/api/
echo 4. Change it to: BACKEND_URL=http://%IP%:8000/api/
echo 5. Rebuild your app (Ctrl+F9)
echo 6. Run the app on your device
echo.
echo ========================================
echo.
pause

