const db = require('../config/database');

class Venda {
  // Gerar número de venda único
  static async gerarNumeroVenda() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const prefixo = `V${ano}${mes}${dia}`;

    // Buscar última venda do dia
    const sql = `
      SELECT numero_venda 
      FROM vendas 
      WHERE numero_venda LIKE ? 
      ORDER BY numero_venda DESC 
      LIMIT 1
    `;
    const ultima = await db.queryOne(sql, [`${prefixo}%`]);

    if (ultima) {
      const sequencia = parseInt(ultima.numero_venda.slice(-3)) + 1;
      return `${prefixo}${String(sequencia).padStart(3, '0')}`;
    }

    return `${prefixo}001`;
  }

  // Listar todas as vendas COM PAGINAÇÃO
  static async findAll(filters = {}) {
    // Paginação
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT v.*, u.nome as vendedor_nome
      FROM vendas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filtro por status
    if (filters.status) {
      sql += ' AND v.status = ?';
      params.push(filters.status);
    }

    // Filtro por data inicial
    if (filters.data_inicial) {
      sql += ' AND DATE(v.data_venda) >= ?';
      params.push(filters.data_inicial);
    }

    // Filtro por data final
    if (filters.data_final) {
      sql += ' AND DATE(v.data_venda) <= ?';
      params.push(filters.data_final);
    }

    // Filtro por número da venda
    if (filters.numero_venda) {
      sql += ' AND v.numero_venda LIKE ?';
      params.push(`%${filters.numero_venda}%`);
    }

    // Contar total de registros (antes de aplicar limit)
    const countSql = sql.replace(
      'SELECT v.*, u.nome as vendedor_nome',
      'SELECT COUNT(*) as total'
    );
    const countResult = await db.queryOne(countSql, params);
    const total = countResult.total;

    // Ordenar e paginar
    sql += ' ORDER BY v.data_venda DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const vendas = await db.query(sql, params);

    return {
      vendas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  // Buscar venda por ID com itens
  static async findById(id) {
    const sql = `
      SELECT v.*, u.nome as vendedor_nome
      FROM vendas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.id = ?
    `;
    const venda = await db.queryOne(sql, [id]);

    if (venda) {
      // Buscar itens da venda
      const itens = await db.query(
        'SELECT * FROM vendas_itens WHERE venda_id = ?',
        [id]
      );
      venda.itens = itens;
    }

    return venda;
  }

  // Buscar por número da venda
  static async findByNumero(numero) {
    const sql = `
      SELECT v.*, u.nome as vendedor_nome
      FROM vendas v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.numero_venda = ?
    `;
    const venda = await db.queryOne(sql, [numero]);

    if (venda) {
      const itens = await db.query(
        'SELECT * FROM vendas_itens WHERE venda_id = ?',
        [venda.id]
      );
      venda.itens = itens;
    }

    return venda;
  }

  // Criar nova venda
  static async create(data) {
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Gerar número da venda
      const numeroVenda = await this.gerarNumeroVenda();

      // Inserir venda
      const sqlVenda = `
        INSERT INTO vendas 
        (numero_venda, usuario_id, subtotal, desconto, total, forma_pagamento, valor_pago, troco, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [resultVenda] = await connection.execute(sqlVenda, [
        numeroVenda,
        data.usuario_id,
        data.subtotal,
        data.desconto || 0,
        data.total,
        data.forma_pagamento,
        data.valor_pago || 0,
        data.troco || 0,
        data.observacoes || null,
      ]);

      const vendaId = resultVenda.insertId;

      // Inserir itens da venda
      const sqlItem = `
        INSERT INTO vendas_itens 
        (venda_id, produto_id, produto_nome, produto_codigo, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      for (const item of data.itens) {
        await connection.execute(sqlItem, [
          vendaId,
          item.produto_id,
          item.produto_nome,
          item.produto_codigo || null,
          item.quantidade,
          item.preco_unitario,
          item.subtotal,
        ]);

        // Atualizar estoque do produto
        await connection.execute(
          'UPDATE produtos SET estoque_atual = estoque_atual - ? WHERE id = ?',
          [item.quantidade, item.produto_id]
        );
      }

      await connection.commit();
      return await this.findById(vendaId);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Cancelar venda
  static async cancel(id, usuarioId, motivo) {
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Buscar venda
      const venda = await this.findById(id);
      if (!venda) {
        throw new Error('Venda não encontrada');
      }

      if (venda.status === 'cancelada') {
        throw new Error('Venda já está cancelada');
      }

      // Atualizar status da venda
      await connection.execute(
        `UPDATE vendas 
         SET status = 'cancelada', cancelada_em = NOW(), cancelada_por = ?, motivo_cancelamento = ?
         WHERE id = ?`,
        [usuarioId, motivo, id]
      );

      // Devolver produtos ao estoque
      for (const item of venda.itens) {
        await connection.execute(
          'UPDATE produtos SET estoque_atual = estoque_atual + ? WHERE id = ?',
          [item.quantidade, item.produto_id]
        );
      }

      await connection.commit();
      return await this.findById(id);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Estatísticas de vendas
  static async getEstatisticas(dataInicial, dataFinal) {
    const sql = `
      SELECT 
        COUNT(*) as total_vendas,
        SUM(CASE WHEN status = 'concluida' THEN total ELSE 0 END) as total_faturado,
        SUM(CASE WHEN status = 'cancelada' THEN 1 ELSE 0 END) as total_canceladas,
        AVG(CASE WHEN status = 'concluida' THEN total ELSE NULL END) as ticket_medio
      FROM vendas
      WHERE DATE(data_venda) BETWEEN ? AND ?
    `;
    return await db.queryOne(sql, [dataInicial, dataFinal]);
  }

  // Produtos mais vendidos
  static async getProdutosMaisVendidos(limite = 10) {
    const sql = `
      SELECT 
        vi.produto_id,
        vi.produto_nome,
        SUM(vi.quantidade) as total_vendido,
        SUM(vi.subtotal) as total_faturado
      FROM vendas_itens vi
      INNER JOIN vendas v ON vi.venda_id = v.id
      WHERE v.status = 'concluida'
      GROUP BY vi.produto_id, vi.produto_nome
      ORDER BY total_vendido DESC
      LIMIT ?
    `;
    return await db.query(sql, [limite]);
  }
}

module.exports = Venda;