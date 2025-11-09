@echo off
echo ====================================
echo   Fixing IDE Indexing Errors
echo ====================================
echo.
echo This script will clean and rebuild the project
echo to help resolve IDE indexing issues.
echo.
echo Current directory: %cd%
echo.

cd /d "%~dp0"

echo Step 1: Cleaning project...
call gradlew.bat clean

echo.
echo Step 2: Building project...
call gradlew.bat assembleDebug -x test

echo.
echo ====================================
echo   Build Complete!
echo ====================================
echo.
echo Next steps in Android Studio/IntelliJ:
echo 1. Go to File ^> Invalidate Caches...
echo 2. Select "Invalidate and Restart"
echo 3. Wait for IDE to restart and re-index
echo.
echo Or simply:
echo - File ^> Sync Project with Gradle Files
echo.
pause

