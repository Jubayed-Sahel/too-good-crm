@echo off
echo Fixing IDE errors by cleaning build and removing duplicate files...

cd /d "%~dp0"

echo.
echo Step 1: Removing old duplicate package files...
rmdir /s /q "app\src\main\java\com\example" 2>nul

echo.
echo Step 2: Cleaning Gradle build...
call gradlew.bat clean

echo.
echo Step 3: Done! Now in Android Studio:
echo    - Click: File -^> Invalidate Caches
echo    - Select: "Invalidate and Restart"
echo    - Wait for indexing to complete
echo    - Click: Build -^> Rebuild Project
echo.
echo All errors should be resolved after these steps!

