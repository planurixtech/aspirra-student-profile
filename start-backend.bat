@echo off
title Aspirra Backend API
echo ========================================
echo   Starting Aspirra C# Backend API...
echo ========================================
cd /d "%~dp0"
dotnet run --project backend\src\Aspirra.Api
pause
