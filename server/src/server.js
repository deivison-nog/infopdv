const express = require('express');
const cors = require('cors');
const config = require('./config/environment');
const db = require('./config/database');

const app = express();

// ========== MIDDLEWARES ==========

// CORS configurado para desenvolvimento
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROTAS ==========
const authRoutes = require('./routes/auth.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const produtoRoutes = require('./routes/produto.routes');
const vendaRoutes = require('./routes/venda.routes');
const relatorioRoutes = require('./routes/relatorio.routes');
const configuracaoRoutes = require('./routes/configuracao.routes');

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas de categorias
app.use('/api/categorias', categoriaRoutes);

// Rotas de produtos
app.use('/api/produtos', produtoRoutes);

// Rotas de vendas
app.use('/api/vendas', vendaRoutes);

// Rotas de relatórios
app.use('/api/relatorios', relatorioRoutes);

// Rotas de configurações
app.use('/api/configuracoes', configuracaoRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Info PDV Backend is running!',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// ========== TESTAR CONEXÃO E INICIAR SERVIDOR ==========
const PORT = config.port || 3000;

// Testar conexão com banco
db.query('SELECT DATABASE() as db, NOW() as now')
  .then((result) => {
    console.log('✅ Conectado ao MySQL (XAMPP)');
    console.log(`📊 Database: ${result[0].db}`);
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log('📦 Info PDV Backend');
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Server: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log(`🌐 CORS: Permitindo http://localhost:5173`);
      console.log('🚀 ========================================\n');
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao MySQL:', error);
    console.error('⚠️  Verifique se o MySQL está rodando no XAMPP!');
    process.exit(1);
  });

module.exports = app;