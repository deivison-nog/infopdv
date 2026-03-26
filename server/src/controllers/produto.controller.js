const Produto = require('../models/Produto.model');

class ProdutoController {
  // Listar todos
  async index(req, res) {
    try {
      const filters = {
        categoria_id: req.query.categoria_id,
        busca: req.query.busca,
        estoque_baixo: req.query.estoque_baixo === 'true',
      };

      const produtos = await Produto.findAll(filters);
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  // Buscar por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const produto = await Produto.findById(id);
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // Buscar por código de barras
  async findByBarcode(req, res) {
    try {
      const { codigo } = req.params;
      const produto = await Produto.findByCodigoBarras(codigo);
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json(produto);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // Criar
  async store(req, res) {
    try {
      const { nome, preco_venda } = req.body;

      if (!nome || !preco_venda) {
        return res.status(400).json({ error: 'Nome e preço de venda são obrigatórios' });
      }

      // Verificar se código de barras já existe
      if (req.body.codigo_barras) {
        const produtoExistente = await Produto.findByCodigoBarras(req.body.codigo_barras);
        if (produtoExistente) {
          return res.status(400).json({ error: 'Código de barras já cadastrado' });
        }
      }

      const produto = await Produto.create(req.body);
      res.status(201).json(produto);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  // Atualizar
  async update(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Verificar código de barras duplicado
      if (req.body.codigo_barras && req.body.codigo_barras !== produto.codigo_barras) {
        const produtoExistente = await Produto.findByCodigoBarras(req.body.codigo_barras);
        if (produtoExistente) {
          return res.status(400).json({ error: 'Código de barras já cadastrado' });
        }
      }

      const produtoAtualizado = await Produto.update(id, req.body);
      res.json(produtoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  // Atualizar estoque
  async updateEstoque(req, res) {
    try {
      const { id } = req.params;
      const { quantidade, operacao } = req.body;

      if (!quantidade || !operacao) {
        return res.status(400).json({ error: 'Quantidade e operação são obrigatórios' });
      }

      const produto = await Produto.updateEstoque(id, quantidade, operacao);
      res.json(produto);
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }

  // Deletar
  async destroy(req, res) {
    try {
      const { id } = req.params;

      const produto = await Produto.findById(id);
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      await Produto.delete(id);
      res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      res.status(500).json({ error: 'Erro ao excluir produto' });
    }
  }

  // Produtos com estoque baixo
  async estoqueBaixo(req, res) {
    try {
      const produtos = await Produto.findEstoqueBaixo();
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos com estoque baixo' });
    }
  }
}

module.exports = new ProdutoController();