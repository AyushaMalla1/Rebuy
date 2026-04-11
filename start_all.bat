@echo off
echo =========================================
echo       Starting Rebuy Platform Services
echo =========================================

echo.
echo [1/3] Starting Backend Server (Node.js)...
start "Rebuy Backend" cmd /k "cd Backend && npm run dev"

echo [2/3] Starting Frontend App (React)...
start "Rebuy Frontend" cmd /k "cd Frontend && npm start"

echo [3/3] Starting AI Chatbot (Python)...
start "Rebuy AI Chatbot" cmd /k "cd AIChatbot && python chatbot_server.py"

echo.
echo All services have been launched in separate windows!
echo You can close this particular window, but keep the new windows open while developing.
echo =========================================
pause
