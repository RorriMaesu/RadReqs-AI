@echo off
echo ==============================================
echo Activating Dr. Lex (RadReqs-AI Tutor)
echo ==============================================
echo.
echo Setting secure browser connection permissions (CORS)...
set OLLAMA_ORIGINS=*
setx OLLAMA_ORIGINS "*" >nul 2>&1

echo Restarting Ollama background service...
taskkill /f /im ollama.exe >nul 2>&1
taskkill /f /im "ollama app.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

echo Opening RadReqs-AI...
start "" "https://RorriMaesu.github.io/RadReqs-AI/"

echo Starting AI Server and Downloading Model (this may take a few minutes)...
ollama run gemma4-26b
