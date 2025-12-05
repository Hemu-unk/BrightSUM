@echo off
REM Start both backend and frontend in separate windows

echo Starting BrightSUM development servers...
echo.

start "BrightSUM Backend" cmd /k "cd src\apps\api && .venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload"

timeout /t 2 /nobreak >nul

start "BrightSUM Frontend" cmd /k "cd src\apps\web && npm run dev"

echo.
echo Both servers starting in separate windows!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
