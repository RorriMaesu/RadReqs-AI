#!/bin/bash
echo "=============================================="
echo "Activating Dr. Lex (RadReqs-AI Tutor)"
echo "=============================================="
echo ""
echo "Setting secure browser permissions (CORS)..."
launchctl setenv OLLAMA_ORIGINS "*"

echo "Restarting Ollama..."
osascript -e 'quit app "Ollama"' 2>/dev/null
sleep 2
open -a Ollama

echo "Opening RadReqs-AI..."
open "https://RorriMaesu.github.io/RadReqs-AI/"

echo "Downloading AI Model (this may take a few minutes the first time)..."
ollama run gemma4-26b
