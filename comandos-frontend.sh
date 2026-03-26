# Na raiz do projeto pdv-offline
npm create vite@latest client -- --template react
cd client
npm install

# Instalar dependências adicionais
npm install react-router-dom axios date-fns zustand
npm install -D vite-plugin-pwa workbox-window