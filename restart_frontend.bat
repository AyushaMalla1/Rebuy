@echo off
echo Stopping any running React servers...
taskkill /F /IM node.exe 2>nul

echo Clearing React cache...
cd Frontend
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist build rmdir /s /q build

echo Starting React development server...
start cmd /k "npm start"

echo.
echo ============================================
echo IMPORTANT: After the server starts:
echo 1. Open your browser
echo 2. Press Ctrl+Shift+Delete
echo 3. Clear "Cached images and files"
echo 4. Close and reopen your browser
echo 5. Navigate to http://localhost:3000
echo ============================================
pause
