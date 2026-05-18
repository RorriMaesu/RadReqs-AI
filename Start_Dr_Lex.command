#!/bin/bash
echo "=============================================="
echo "Activating Dr. Lex (RadReqs-AI Tutor)"
echo "=============================================="
echo ""
echo "Setting secure browser connection permissions..."
export OLLAMA_ORIGINS="https://rorrimaesu.github.io"

echo "Downloading AI Model (this may take a few minutes the first time)..."
open "https://RorriMaesu.github.io/RadReqs-AI/"
ollama run gemma4-26b
