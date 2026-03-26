const Configuracao = require('../models/Configuracao.model');

class ConfiguracaoController {
  // Listar todas as configurações
  async index(req, res) {
    try {
      const configuracoes = await Configuracao.findAll();
      res.json(configuracoes);
    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      res.status(500).json({ error: 'Erro ao listar configurações' });
    }
  }

  // Buscar configuração por chave
  async show(req, res) {
    try {
      const { chave } = req.params;
      const config = await Configuracao.findByChave(chave);
      
      if (!config) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }

      res.json(config);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      res.status(500).json({ error: 'Erro ao buscar configuração' });
    }
  }

  // Buscar configurações por prefixo
  async findByPrefix(req, res) {
    try {
      const { prefix } = req.params;
      const configs = await Configuracao.findByPrefix(prefix);
      res.json(configs);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  }

  // Atualizar configuração
  async update(req, res) {
    try {
      const { chave } = req.params;
      const { valor } = req.body;

      if (valor === undefined || valor === null) {
        return res.status(400).json({ error: 'Valor é obrigatório' });
      }

      const config = await Configuracao.update(chave, valor);
      res.json(config);
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      res.status(500).json({ error: 'Erro ao atualizar configuração' });
    }
  }

  // Atualizar múltiplas configurações
  async updateMany(req, res) {
    try {
      const { configuracoes } = req.body;

      if (!configuracoes || !Array.isArray(configuracoes)) {
        return res.status(400).json({ 
          error: 'Configurações devem ser um array' 
        });
      }

      const result = await Configuracao.updateMany(configuracoes);
      res.json(result);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  }

  // Buscar configurações da empresa
  async getEmpresaConfig(req, res) {
    try {
      const config = await Configuracao.getEmpresaConfig();
      res.json(config);
    } catch (error) {
      console.error('Erro ao buscar configurações da empresa:', error);
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  }

  // Resetar para valores padrão
  async reset(req, res) {
    try {
      const result = await Configuracao.resetToDefaults();
      res.json(result);
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      res.status(500).json({ error: 'Erro ao resetar configurações' });
    }
  }
}

module.exports = new ConfiguracaoController();