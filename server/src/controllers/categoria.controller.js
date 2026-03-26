const Categoria = require('../models/Categoria.model');

class CategoriaController {
  // Listar todas
  async index(req, res) {
    try {
      const categorias = await Categoria.findAll();
      res.json(categorias);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao listar categorias' });
    }
  }

  // Buscar por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const categoria = await Categoria.findById(id);
      
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Contar produtos
      const totalProdutos = await Categoria.countProdutos(id);
      
      res.json({ ...categoria, total_produtos: totalProdutos });
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  // Criar
  async store(req, res) {
    try {
      const { nome, descricao, cor, icone } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const categoria = await Categoria.create({ 
        nome, 
        descricao, 
        cor: cor || '#2196F3', 
        icone: icone || '📦' 
      });

      res.status(201).json(categoria);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  // Atualizar
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nome, descricao, cor, icone } = req.body;

      const categoria = await Categoria.findById(id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      const categoriaAtualizada = await Categoria.update(id, { 
        nome, 
        descricao, 
        cor, 
        icone 
      });

      res.json(categoriaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  // Deletar
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const categoria = await Categoria.findById(id);
      if (!categoria) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Verificar se há produtos vinculados
      const totalProdutos = await Categoria.countProdutos(id);
      if (totalProdutos > 0) {
        return res.status(400).json({ 
          error: `Não é possível excluir. Existem ${totalProdutos} produto(s) nesta categoria.` 
        });
      }

      await Categoria.delete(id);
      res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  }
}

module.exports = new CategoriaController();