@echo off
echo ===========================================
echo  Egovframe Total Runner
echo ===========================================

cd /d "%~dp0"

echo.
echo [1/2] Starting Backend Server...
call start-backend.bat

echo.
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /c "call start-frontend.bat"

echo.
echo ===========================================
echo Servers are starting!
echo Chrome will open shortly...
echo ===========================================
timeout /t 5 /nobreak > NUL
start chrome http://localhost:3000
