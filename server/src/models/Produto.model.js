const db = require('../config/database');

class Produto {
  // Buscar todos os produtos com informações da categoria
  static async findAll(filters = {}) {
    let sql = `
      SELECT p.*, c.nome as categoria_nome, c.cor as categoria_cor, c.icone as categoria_icone
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = 1
    `;
    const params = [];

    // Filtro por categoria
    if (filters.categoria_id) {
      sql += ' AND p.categoria_id = ?';
      params.push(filters.categoria_id);
    }

    // Filtro por busca (nome ou código de barras)
    if (filters.busca) {
      sql += ' AND (p.nome LIKE ? OR p.codigo_barras LIKE ?)';
      const searchTerm = `%${filters.busca}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filtro por estoque baixo
    if (filters.estoque_baixo) {
      sql += ' AND p.estoque_atual <= p.estoque_minimo';
    }

    sql += ' ORDER BY p.nome';

    return await db.query(sql, params);
  }

  // Buscar produto por ID
  static async findById(id) {
    const sql = `
      SELECT p.*, c.nome as categoria_nome, c.cor as categoria_cor, c.icone as categoria_icone
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ? AND p.ativo = 1
    `;
    return await db.queryOne(sql, [id]);
  }

  // Buscar por código de barras
  static async findByCodigoBarras(codigoBarras) {
    const sql = `
      SELECT p.*, c.nome as categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.codigo_barras = ? AND p.ativo = 1
    `;
    return await db.queryOne(sql, [codigoBarras]);
  }

  // Criar novo produto
  static async create(data) {
    const sql = `
      INSERT INTO produtos 
      (codigo_barras, nome, descricao, categoria_id, preco_custo, preco_venda, 
       estoque_atual, estoque_minimo, unidade, imagem_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.codigo_barras || null,
      data.nome,
      data.descricao || null,
      data.categoria_id || null,
      data.preco_custo || 0,
      data.preco_venda,
      data.estoque_atual || 0,
      data.estoque_minimo || 5,
      data.unidade || 'UN',
      data.imagem_url || null,
    ];
    
    const result = await db.query(sql, params);
    return await this.findById(result.insertId);
  }

  // Atualizar produto
  static async update(id, data) {
    const sql = `
      UPDATE produtos SET
        codigo_barras = ?,
        nome = ?,
        descricao = ?,
        categoria_id = ?,
        preco_custo = ?,
        preco_venda = ?,
        estoque_atual = ?,
        estoque_minimo = ?,
        unidade = ?,
        imagem_url = ?
      WHERE id = ?
    `;
    const params = [
      data.codigo_barras || null,
      data.nome,
      data.descricao || null,
      data.categoria_id || null,
      data.preco_custo || 0,
      data.preco_venda,
      data.estoque_atual || 0,
      data.estoque_minimo || 5,
      data.unidade || 'UN',
      data.imagem_url || null,
      id,
    ];
    
    await db.query(sql, params);
    return await this.findById(id);
  }

  // Atualizar estoque
  static async updateEstoque(id, quantidade, operacao = 'add') {
    const sql = operacao === 'add' 
      ? 'UPDATE produtos SET estoque_atual = estoque_atual + ? WHERE id = ?'
      : 'UPDATE produtos SET estoque_atual = estoque_atual - ? WHERE id = ?';
    
    await db.query(sql, [quantidade, id]);
    return await this.findById(id);
  }

  // Desativar produto (soft delete)
  static async delete(id) {
    const sql = 'UPDATE produtos SET ativo = 0 WHERE id = ?';
    await db.query(sql, [id]);
  }

  // Produtos com estoque baixo
  static async findEstoqueBaixo() {
    const sql = `
      SELECT p.*, c.nome as categoria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = 1 AND p.estoque_atual <= p.estoque_minimo
      ORDER BY p.estoque_atual ASC
    `;
    return await db.query(sql);
  }
}

module.exports = Produto;