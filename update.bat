@echo off
setlocal
cd /d "%~dp0"
if exist ".git" (
  git pull --ff-only
)
call "%~dp0install.bat" %*
