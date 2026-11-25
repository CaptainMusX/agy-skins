@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [agy-skins] Node.js 22+ is required.
  exit /b 1
)
if not exist "node_modules\esbuild" (
  echo [agy-skins] Installing build dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 exit /b 1
)
node scripts\install.mjs %*
