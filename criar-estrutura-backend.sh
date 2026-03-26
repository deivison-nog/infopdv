# Você está em C:\xampp\htdocs\infopdv
# Vamos criar a pasta server e estrutura

mkdir server
cd server

# Criar subpastas
mkdir src
cd src
mkdir controllers models routes middlewares services config jobs
cd ..

# Voltar para criar outras pastas
mkdir database
cd database
mkdir migrations seeds
cd ..

mkdir docs scripts

# Inicializar o npm no server
npm init -y