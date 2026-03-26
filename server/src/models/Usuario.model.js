const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Buscar todos os usuários
  static async findAll() {
    const sql = 'SELECT id, nome, email, ativo, created_at FROM usuarios WHERE ativo = 1';
    return await db.query(sql);
  }

  // Buscar usuário por ID
  static async findById(id) {
    const sql = 'SELECT id, nome, email, ativo, created_at FROM usuarios WHERE id = ? AND ativo = 1';
    return await db.queryOne(sql, [id]);
  }

  // Buscar usuário por email (para login)
  static async findByEmail(email) {
    const sql = 'SELECT * FROM usuarios WHERE email = ? AND ativo = 1';
    return await db.queryOne(sql, [email]);
  }

  // Criar novo usuário
  static async create({ nome, email, senha }) {
    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    const result = await db.query(sql, [nome, email, senhaCriptografada]);
    
    return {
      id: result.insertId,
      nome,
      email,
    };
  }

  // Atualizar usuário
  static async update(id, { nome, email }) {
    const sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
    await db.query(sql, [nome, email, id]);
    return await this.findById(id);
  }

  // Atualizar senha
  static async updatePassword(id, novaSenha) {
    const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
    const sql = 'UPDATE usuarios SET senha = ? WHERE id = ?';
    await db.query(sql, [senhaCriptografada, id]);
  }

  // Desativar usuário (soft delete)
  static async delete(id) {
    const sql = 'UPDATE usuarios SET ativo = 0 WHERE id = ?';
    await db.query(sql, [id]);
  }

  // Verificar senha
  static async verificarSenha(senhaDigitada, senhaHash) {
    return await bcrypt.compare(senhaDigitada, senhaHash);
  }
}

module.exports = Usuario;