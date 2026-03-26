# Criar pasta do projeto
mkdir pdv-offline
cd pdv-offline

# Criar estrutura básica
mkdir -p server/src/{controllers,models,routes,middlewares,services,config}
mkdir -p database/{migrations,seeds}
mkdir -p docs
mkdir -p scripts

# Inicializar Git
git init
echo "# PDV Offline - Info PDV" > README.md
git add README.md
git commit -m "Initial commit"