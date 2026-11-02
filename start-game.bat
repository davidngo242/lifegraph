@echo off
title LifeGraph Launcher
echo ===================================================
echo       Khoi chay LifeGraph AI Simulation RPG
echo ===================================================

:: Them thu muc Node.js vao PATH
set "PATH=C:\Users\ADMIN\AppData\Local\Author Software\nvm\.nodejs;%PATH%"

echo 1. Dang khoi dong Backend (Port 3001)...
start "LifeGraph Backend" cmd /k "cd /d ""%~dp0backend"" && node src/index.js"

echo 2. Dang khoi dong Frontend Next.js (Port 3000)...
start "LifeGraph Frontend" cmd /k "cd /d ""%~dp0frontend"" && npx next dev"

echo 3. Dang cho server san sang va mo trinh duyet...
timeout /t 4 /nobreak >nul

echo 4. Mo trinh duyet tai http://localhost:3000
start http://localhost:3000

echo ===================================================
echo  He thong da khoi chay xong!
echo  Hay giu 2 cua so Backend va Frontend dang mo.
echo ===================================================
