@echo off
echo ===========================================
echo  Egovframe React Frontend Runner
echo ===========================================

cd /d "%~dp0"
cd frontend

if not exist "node_modules" (
    echo [INFO] First run detected, installing packages...
    call npm install
)

echo Starting Frontend Server...
cmd /k "npm run dev"
