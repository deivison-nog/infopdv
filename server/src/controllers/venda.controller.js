const Venda = require('../models/Venda.model');
const Configuracao = require('../models/Configuracao.model');

class VendaController {
  // Listar vendas
  async index(req, res) {
    try {
      const filters = {
        status: req.query.status,
        data_inicial: req.query.data_inicial,
        data_final: req.query.data_final,
        numero_venda: req.query.numero_venda,
        page: req.query.page,
        limit: req.query.limit,
      };

      const result = await Venda.findAll(filters);
      res.json(result);
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      res.status(500).json({ error: 'Erro ao listar vendas' });
    }
  }

  // Buscar venda por ID
  async show(req, res) {
    try {
      const { id } = req.params;
      const venda = await Venda.findById(id);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      res.json(venda);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro ao buscar venda' });
    }
  }

  // Buscar por número da venda
  async findByNumero(req, res) {
    try {
      const { numero } = req.params;
      const venda = await Venda.findByNumero(numero);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      res.json(venda);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro ao buscar venda' });
    }
  }

  // Criar venda
  async store(req, res) {
    try {
      const { itens, forma_pagamento, valor_pago, desconto, observacoes } = req.body;

      console.log('📥 Dados recebidos:', { itens, forma_pagamento, valor_pago, desconto });

      // Validações
      if (!itens || itens.length === 0) {
        return res.status(400).json({ error: 'Adicione pelo menos um item à venda' });
      }

      if (!forma_pagamento) {
        return res.status(400).json({ error: 'Forma de pagamento é obrigatória' });
      }

      // Calcular totais
      const subtotal = itens.reduce((acc, item) => {
        return acc + (parseFloat(item.preco_venda) * parseInt(item.quantidade));
      }, 0);

      const descontoValor = parseFloat(desconto) || 0;
      const total = subtotal - descontoValor;

      // Calcular troco
      const valorPagoNum = parseFloat(valor_pago) || 0;
      const troco = forma_pagamento === 'dinheiro' ? Math.max(0, valorPagoNum - total) : 0;

      console.log('💰 Cálculos:', {
        subtotal,
        desconto: descontoValor,
        total,
        valor_pago: valorPagoNum,
        troco
      });

      const vendaData = {
        usuario_id: req.user.id,
        itens: itens.map(item => ({
          produto_id: item.id,
          produto_nome: item.nome,
          produto_codigo: item.codigo_barras || null,
          quantidade: parseInt(item.quantidade),
          preco_unitario: parseFloat(item.preco_venda),
          subtotal: parseFloat(item.preco_venda) * parseInt(item.quantidade),
        })),
        subtotal,
        desconto: descontoValor,
        total,
        forma_pagamento,
        valor_pago: valorPagoNum,
        troco,
        observacoes,
      };

      const venda = await Venda.create(vendaData);
      
      console.log('✅ Venda criada:', venda);
      
      res.status(201).json(venda);
    } catch (error) {
      console.error('❌ Erro ao criar venda:', error);
      res.status(500).json({ error: 'Erro ao criar venda' });
    }
  }

  // Cancelar venda
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({ error: 'Motivo do cancelamento é obrigatório' });
      }

      const venda = await Venda.cancel(id, req.user.id, motivo);
      res.json(venda);
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      res.status(500).json({ 
        error: error.message || 'Erro ao cancelar venda' 
      });
    }
  }

  // Estatísticas
  async estatisticas(req, res) {
    try {
      const hoje = new Date();
      const dataInicial = req.query.data_inicial || hoje.toISOString().split('T')[0];
      const dataFinal = req.query.data_final || hoje.toISOString().split('T')[0];

      const stats = await Venda.getEstatisticas(dataInicial, dataFinal);
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }

  // Produtos mais vendidos
  async produtosMaisVendidos(req, res) {
    try {
      const limite = parseInt(req.query.limite) || 10;
      const produtos = await Venda.getProdutosMaisVendidos(limite);
      res.json(produtos);
    } catch (error) {
      console.error('Erro ao buscar produtos mais vendidos:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos mais vendidos' });
    }
  }

  // Gerar cupom para impressão (ATUALIZADO - Usa configurações do banco)
  async gerarCupom(req, res) {
    try {
      const { id } = req.params;
      const venda = await Venda.findById(id);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      // Buscar configurações da empresa no banco
      const { empresa, cupom } = await Configuracao.getEmpresaConfig();

      // Formatar cupom
      const cupomData = {
        empresa: {
          nome: empresa.nome || 'INFO PDV',
          cnpj: empresa.cnpj || '',
          endereco: empresa.endereco || '',
          cidade: empresa.cidade || '',
          telefone: empresa.telefone || '',
          email: empresa.email || '',
          site: empresa.site || '',
        },
        cupom: {
          mensagem_rodape: cupom.mensagem_rodape || 'OBRIGADO PELA PREFERENCIA!\nVOLTE SEMPRE!',
          impressao_automatica: cupom.impressao_automatica || false,
          numero_vias: cupom.numero_vias || 1,
        },
        venda: {
          ...venda,
          data_venda_formatada: new Date(venda.data_venda).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      };

      res.json(cupomData);
    } catch (error) {
      console.error('Erro ao gerar cupom:', error);
      res.status(500).json({ error: 'Erro ao gerar cupom' });
    }
  }
}

module.exports = new VendaController();