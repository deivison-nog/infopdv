const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/venda.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Listar vendas (com filtros)
router.get('/', vendaController.index);

// Estatísticas
router.get('/estatisticas', vendaController.estatisticas);

// Produtos mais vendidos
router.get('/produtos-mais-vendidos', vendaController.produtosMaisVendidos);

// Buscar venda por número
router.get('/numero/:numero', vendaController.findByNumero);

// Gerar cupom para impressão
router.get('/:id/cupom', vendaController.gerarCupom);

// Buscar venda por ID
router.get('/:id', vendaController.show);

// Criar venda
router.post('/', vendaController.store);

// Cancelar venda
router.post('/:id/cancelar', vendaController.cancel);

module.exports = router;