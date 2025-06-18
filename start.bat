@echo off
title Ejecutando Django y Angular
color 0a

REM Verificar si npm está instalado
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm no está instalado o no está en el PATH
    pause
    exit /b
)

REM Verificar si python está instalado
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python no está instalado o no está en el PATH
    pause
    exit /b
)

REM Iniciar backend Django en una nueva ventana
start "Backend Django" cmd /k "cd /d %~dp0 && .\venv\Scripts\activate && cd Alfcos_backend && python manage.py runserver && pause"

REM Iniciar frontend Angular en una nueva ventana
start "Frontend Angular" cmd /k "cd /d %~dp0Alfcos && npm start && pause"

REM Esperar unos segundos para que los servidores tengan tiempo de iniciarse
timeout /t 11 /nobreak >nul

REM Abrir navegador URLs
start "" "http://localhost:4200"  # Angular
echo Ambos servidores se están iniciando en ventanas separadas...
pause