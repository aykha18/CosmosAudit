@echo off
echo Starting CosmosAudit Landing Page...
echo.

echo [1/2] Starting Backend Server...
start "CosmosAudit Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend Server...
start "CosmosAudit Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   AuditGPT Landing Page Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
