@echo off
REM Quick setup script for BrightSUM - Run this once after cloning

echo ========================================
echo BrightSUM Setup Script
echo ========================================
echo.

echo [1/4] Setting up Backend (Python)...
cd src\apps\api
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
)
echo Installing Python dependencies...
.venv\Scripts\python.exe -m pip install --upgrade pip -q
.venv\Scripts\python.exe -m pip install -r ..\..\..\requirements.txt -q

if not exist .env (
    echo Copying .env.example to .env...
    copy .env.example .env
)
cd ..\..\..

echo.
echo [2/4] Setting up Frontend (Node.js)...
cd src\apps\web
echo Installing npm packages...
call npm install

cd ..\..\..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend:  cd src\apps\api ^&^& .venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload
echo To start the frontend: cd src\apps\web ^&^& npm run dev
echo.
echo See docs/setup.md for more details.
pause
