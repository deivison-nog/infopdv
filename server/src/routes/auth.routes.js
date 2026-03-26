const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// ========== ROTAS PÚBLICAS (não precisa estar logado) ==========

// Registrar novo usuário
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout (apenas limpa token no frontend, mas deixamos a rota)
router.post('/logout', authController.logout);

// ========== ROTAS PROTEGIDAS (precisa estar logado) ==========

// Verificar token (validar sessão)
router.get('/verify', authMiddleware, authController.verifyToken);

// Trocar senha
router.post('/change-password', authMiddleware, authController.changePassword);

// ========== ROTAS DE TESTE ==========

// Rota de teste básica
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth routes working!',
    database: 'MySQL (XAMPP)'
  });
});

// Rota de teste de conexão com banco
router.get('/test-db', async (req, res) => {
  try {
    const db = require('../config/database');
    const result = await db.query('SELECT DATABASE() as db, NOW() as now');
    res.json({ 
      message: 'Conexão com MySQL OK!',
      data: result[0]
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao conectar com MySQL',
      details: error.message 
    });
  }
});

// ========== ROTA TEMPORÁRIA (REMOVER EM PRODUÇÃO) ==========

// 🆘 ROTA TEMPORÁRIA - Resetar senha do admin
// ⚠️ ATENÇÃO: Remover esta rota antes de ir para produção!
router.post('/reset-admin', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const db = require('../config/database');
    
    // Senha padrão: admin123
    const novaSenha = await bcrypt.hash('admin123', 10);
    
    const sql = 'UPDATE usuarios SET senha = ? WHERE email = ?';
    await db.query(sql, [novaSenha, 'admin@infopdv.com']);
    
    res.json({ 
      message: 'Senha resetada com sucesso!',
      email: 'admin@infopdv.com',
      senha: 'admin123'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;