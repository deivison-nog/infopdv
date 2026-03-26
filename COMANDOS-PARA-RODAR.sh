# ========== BACKEND ==========
cd server
npm install
cp .env.example .env
# Edite o .env com suas configurações
npm run dev

# ========== FRONTEND ==========
# Em outro terminal
cd client
npm install
cp .env.example .env
npm run dev

# ========== BANCO DE DADOS ==========
# Criar database no PostgreSQL
psql -U postgres
CREATE DATABASE pdv_offline;
\q