const db = require('../config/database');

class Categoria {
  // Buscar todas as categorias
  static async findAll() {
    const sql = 'SELECT * FROM categorias WHERE ativo = 1 ORDER BY nome';
    return await db.query(sql);
  }

  // Buscar categoria por ID
  static async findById(id) {
    const sql = 'SELECT * FROM categorias WHERE id = ? AND ativo = 1';
    return await db.queryOne(sql, [id]);
  }

  // Criar nova categoria
  static async create({ nome, descricao, cor, icone }) {
    const sql = 'INSERT INTO categorias (nome, descricao, cor, icone) VALUES (?, ?, ?, ?)';
    const result = await db.query(sql, [nome, descricao, cor, icone]);
    return await this.findById(result.insertId);
  }

  // Atualizar categoria
  static async update(id, { nome, descricao, cor, icone }) {
    const sql = 'UPDATE categorias SET nome = ?, descricao = ?, cor = ?, icone = ? WHERE id = ?';
    await db.query(sql, [nome, descricao, cor, icone, id]);
    return await this.findById(id);
  }

  // Desativar categoria (soft delete)
  static async delete(id) {
    const sql = 'UPDATE categorias SET ativo = 0 WHERE id = ?';
    await db.query(sql, [id]);
  }

  // Contar produtos por categoria
  static async countProdutos(id) {
    const sql = 'SELECT COUNT(*) as total FROM produtos WHERE categoria_id = ? AND ativo = 1';
    const result = await db.queryOne(sql, [id]);
    return result.total;
  }
}

module.exports = Categoria;