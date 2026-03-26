const express = require('express');
const router = express.Router();
const configuracaoController = require('../controllers/configuracao.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar todas as configurações
router.get('/', configuracaoController.index);

// Buscar configurações da empresa
router.get('/empresa', configuracaoController.getEmpresaConfig);

// Buscar configurações por prefixo
router.get('/prefix/:prefix', configuracaoController.findByPrefix);

// Buscar configuração por chave
router.get('/:chave', configuracaoController.show);

// Atualizar configuração
router.put('/:chave', configuracaoController.update);

// Atualizar múltiplas configurações
router.post('/batch', configuracaoController.updateMany);

// Resetar para valores padrão
router.post('/reset', configuracaoController.reset);

module.exports = router;