const db = require('../config/database');

class RelatorioController {
  // Vendas por período (agrupado por dia)
  async vendasPorPeriodo(req, res) {
    try {
      const { data_inicial, data_final } = req.query;

      if (!data_inicial || !data_final) {
        return res.status(400).json({ 
          error: 'data_inicial e data_final são obrigatórios' 
        });
      }

      const sql = `
        SELECT 
          DATE(data_venda) as data,
          COUNT(*) as total_vendas,
          SUM(CASE WHEN status = 'concluida' THEN total ELSE 0 END) as total_faturado,
          SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as total_canceladas
        FROM vendas
        WHERE DATE(data_venda) BETWEEN ? AND ?
        GROUP BY DATE(data_venda)
        ORDER BY data ASC
      `;

      const resultado = await db.query(sql, [data_inicial, data_final]);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao gerar relatório por período:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  // Vendas por forma de pagamento
  async vendasPorFormaPagamento(req, res) {
    try {
      const { data_inicial, data_final } = req.query;

      if (!data_inicial || !data_final) {
        return res.status(400).json({ 
          error: 'data_inicial e data_final são obrigatórios' 
        });
      }

      const sql = `
        SELECT 
          forma_pagamento,
          COUNT(*) as total_vendas,
          SUM(total) as total_faturado
        FROM vendas
        WHERE status = 'concluida'
        AND DATE(data_venda) BETWEEN ? AND ?
        GROUP BY forma_pagamento
        ORDER BY total_faturado DESC
      `;

      const resultado = await db.query(sql, [data_inicial, data_final]);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao gerar relatório por forma de pagamento:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  // Produtos mais vendidos
  async produtosMaisVendidos(req, res) {
    try {
      const { data_inicial, data_final, limite } = req.query;

      if (!data_inicial || !data_final) {
        return res.status(400).json({ 
          error: 'data_inicial e data_final são obrigatórios' 
        });
      }

      const limit = parseInt(limite) || 10;

      const sql = `
        SELECT 
          vi.produto_nome,
          SUM(vi.quantidade) as total_vendido,
          SUM(vi.subtotal) as total_faturado,
          COUNT(DISTINCT v.id) as numero_vendas
        FROM vendas_itens vi
        INNER JOIN vendas v ON vi.venda_id = v.id
        WHERE v.status = 'concluida'
        AND DATE(v.data_venda) BETWEEN ? AND ?
        GROUP BY vi.produto_id, vi.produto_nome
        ORDER BY total_vendido DESC
        LIMIT ?
      `;

      const resultado = await db.query(sql, [data_inicial, data_final, limit]);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao gerar relatório de produtos mais vendidos:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  // Vendas por categoria
  async vendasPorCategoria(req, res) {
    try {
      const { data_inicial, data_final } = req.query;

      if (!data_inicial || !data_final) {
        return res.status(400).json({ 
          error: 'data_inicial e data_final são obrigatórios' 
        });
      }

      const sql = `
        SELECT 
          COALESCE(c.nome, 'Sem Categoria') as categoria,
          COALESCE(c.icone, '📦') as icone,
          SUM(vi.quantidade) as total_vendido,
          SUM(vi.subtotal) as total_faturado,
          COUNT(DISTINCT v.id) as numero_vendas
        FROM vendas_itens vi
        INNER JOIN vendas v ON vi.venda_id = v.id
        INNER JOIN produtos p ON vi.produto_id = p.id
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE v.status = 'concluida'
        AND DATE(v.data_venda) BETWEEN ? AND ?
        GROUP BY c.id, c.nome, c.icone
        ORDER BY total_faturado DESC
      `;

      const resultado = await db.query(sql, [data_inicial, data_final]);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao gerar relatório por categoria:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  // Vendas por vendedor
  async vendasPorVendedor(req, res) {
    try {
      const { data_inicial, data_final } = req.query;

      if (!data_inicial || !data_final) {
        return res.status(400).json({ 
          error: 'data_inicial e data_final são obrigatórios' 
        });
      }

      const sql = `
        SELECT 
          u.nome as vendedor,
          COUNT(*) as total_vendas,
          SUM(v.total) as total_faturado,
          AVG(v.total) as ticket_medio
        FROM vendas v
        INNER JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.status = 'concluida'
        AND DATE(v.data_venda) BETWEEN ? AND ?
        GROUP BY u.id, u.nome
        ORDER BY total_faturado DESC
      `;

      const resultado = await db.query(sql, [data_inicial, data_final]);
      res.json(resultado);
    } catch (error) {
      console.error('Erro ao gerar relatório por vendedor:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }

  // Dashboard - Resumo geral
  async dashboard(req, res) {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      // Vendas de hoje
      const vendasHoje = await db.queryOne(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'concluida' THEN total ELSE 0 END) as faturado
        FROM vendas
        WHERE DATE(data_venda) = ?
      `, [hoje]);

      // Vendas do mês
      const mesAtual = hoje.substring(0, 7); // YYYY-MM
      const vendasMes = await db.queryOne(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'concluida' THEN total ELSE 0 END) as faturado
        FROM vendas
        WHERE DATE_FORMAT(data_venda, '%Y-%m') = ?
      `, [mesAtual]);

      // Produtos com estoque baixo
      const produtosEstoqueBaixo = await db.queryOne(`
        SELECT COUNT(*) as total
        FROM produtos
        WHERE estoque_atual <= estoque_minimo
      `);

      // Total de produtos
      const totalProdutos = await db.queryOne(`
        SELECT COUNT(*) as total FROM produtos
      `);

      res.json({
        vendas_hoje: {
          total: vendasHoje.total || 0,
          faturado: parseFloat(vendasHoje.faturado) || 0,
        },
        vendas_mes: {
          total: vendasMes.total || 0,
          faturado: parseFloat(vendasMes.faturado) || 0,
        },
        produtos: {
          total: totalProdutos.total || 0,
          estoque_baixo: produtosEstoqueBaixo.total || 0,
        },
      });
    } catch (error) {
      console.error('Erro ao gerar dashboard:', error);
      res.status(500).json({ error: 'Erro ao gerar dashboard' });
    }
  }
}

module.exports = new RelatorioController();