const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas as rotas de categoria requerem autenticação
router.use(authMiddleware);

// Listar todas as categorias
router.get('/', categoriaController.index);

// Buscar categoria por ID
router.get('/:id', categoriaController.show);

// Criar nova categoria
router.post('/', categoriaController.store);

// Atualizar categoria
router.put('/:id', categoriaController.update);

// Deletar categoria
router.delete('/:id', categoriaController.destroy);

module.exports = router;