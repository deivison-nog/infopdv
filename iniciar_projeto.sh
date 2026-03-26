#!/bin/bash

# --- Configurações de Caminho ---
# No Git Bash, caminhos C:\ viram /c/
CLIENT_PATH="/c/xampp/htdocs/infopdv/client/src"
SERVER_PATH="/c/xampp/htdocs/infopdv/server"

echo "🚀 Iniciando o ambiente do projeto..."

# --- Iniciar o Client ---
echo "📦 Iniciando Client (npm run dev)..."
cd "$CLIENT_PATH" || exit
# O '&' ao final faz o comando rodar em segundo plano
npm run dev & 

# --- Iniciar o Server ---
echo "⚙️  Iniciando Server (npm run restart)..."
cd "$SERVER_PATH" || exit
npm run restart &

echo "✅ Ambos os processos foram disparados!"
# Mantém o terminal aberto para ver os logs
wait