@echo off
chcp 65001 > NUL
echo ===========================================
echo  Egovframe React Backend Runner
echo ===========================================

cd /d "%~dp0"

echo.
echo Starting Backend (Spring Boot)...
where mvn >nul 2>nul
if %ERRORLEVEL% == 0 (
    start "Backend Server" cmd /k "title Backend Server && mvn spring-boot:run"
) else (
    echo [INFO] Maven not found, running jar directly...
    start "Backend Server" cmd /k "title Backend Server && java -jar target\sht_webapp.jar"
)
