const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produto.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas de produto requerem autenticação
router.use(authMiddleware);

// Listar todos os produtos (com filtros opcionais)
router.get('/', produtoController.index);

// Produtos com estoque baixo
router.get('/estoque-baixo', produtoController.estoqueBaixo);

// Buscar produto por código de barras
router.get('/barcode/:codigo', produtoController.findByBarcode);

// Buscar produto por ID
router.get('/:id', produtoController.show);

// Criar novo produto
router.post('/', produtoController.store);

// Atualizar produto
router.put('/:id', produtoController.update);

// Atualizar estoque
router.patch('/:id/estoque', produtoController.updateEstoque);

// Deletar produto
router.delete('/:id', produtoController.destroy);

module.exports = router;