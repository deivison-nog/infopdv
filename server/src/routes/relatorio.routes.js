const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorio.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', relatorioController.dashboard);

// Vendas por período
router.get('/vendas-periodo', relatorioController.vendasPorPeriodo);

// Vendas por forma de pagamento
router.get('/vendas-forma-pagamento', relatorioController.vendasPorFormaPagamento);

// Produtos mais vendidos
router.get('/produtos-mais-vendidos', relatorioController.produtosMaisVendidos);

// Vendas por categoria
router.get('/vendas-categoria', relatorioController.vendasPorCategoria);

// Vendas por vendedor
router.get('/vendas-vendedor', relatorioController.vendasPorVendedor);

module.exports = router;