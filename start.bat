@echo off
title Project Akrit - Digital E-Waste Supply Chain
cd /d "%~dp0"

echo =========================================================
echo    Project Akrit - Digital E-Waste Supply Chain
echo    "Zomato for India's E-Waste"
echo =========================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if node_modules exists, if not install
if not exist "node_modules\" (
    echo [1/3] First-time setup: Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies verified.
)

:: Ensure latest assembled index.html
if not exist "index.html" (
    echo [2/3] Building index.html...
    python assemble.py
) else (
    echo [2/3] Web app ready.
)

:: Open browser automatically after 2 seconds
echo [3/3] Launching server on http://localhost:3000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start Express server
node server/index.js
pause
