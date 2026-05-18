@echo off
echo ==============================================
echo Activating Dr. Lex (RadReqs-AI Tutor)
echo ==============================================
echo.
echo Setting secure browser connection permissions...
set OLLAMA_ORIGINS=https://rorrimaesu.github.io

echo Downloading AI Model (this may take a few minutes the first time)...
start "" "https://RorriMaesu.github.io/RadReqs-AI/"
ollama run gemma4-26b
