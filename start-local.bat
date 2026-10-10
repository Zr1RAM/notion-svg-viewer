@echo off
echo ========================================================
echo   Notion Diagrams & Docs Hub - Local Development Server
echo ========================================================
echo.
echo Starting local test server at: http://localhost:8080
echo Opening default web browser...
echo.
echo Press Ctrl+C in this terminal window to stop the server.
echo.

start http://localhost:8080/index.html
python -m http.server 8080
