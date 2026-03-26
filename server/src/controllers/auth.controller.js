const Usuario = require('../models/Usuario.model');
const jwt = require('jsonwebtoken');
const config = require('../config/environment');

class AuthController {
  // Registrar novo usuário
  async register(req, res) {
    try {
      const { nome, email, senha } = req.body;

      // Validações básicas
      if (!nome || !email || !senha) {
        return res.status(400).json({ 
          error: 'Nome, email e senha são obrigatórios' 
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({ 
          error: 'A senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Verificar se email já existe
      const usuarioExistente = await Usuario.findByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ 
          error: 'Email já cadastrado' 
        });
      }

      // Criar usuário
      const novoUsuario = await Usuario.create({ nome, email, senha });

      // Gerar token
      const token = jwt.sign(
        { id: novoUsuario.id, email: novoUsuario.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        user: novoUsuario,
        token,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validações
      if (!email || !senha) {
        return res.status(400).json({ 
          error: 'Email e senha são obrigatórios' 
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findByEmail(email);
      if (!usuario) {
        return res.status(401).json({ 
          error: 'Email ou senha inválidos' 
        });
      }

      // Verificar senha
      const senhaValida = await Usuario.verificarSenha(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ 
          error: 'Email ou senha inválidos' 
        });
      }

      // Gerar token
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Remover senha do objeto de retorno
      delete usuario.senha;

      res.json({
        message: 'Login realizado com sucesso',
        user: usuario,
        token,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  // Verificar token (validar sessão)
  async verifyToken(req, res) {
    try {
      // O middleware auth já validou o token
      // req.user contém os dados do usuário
      const usuario = await Usuario.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ user: usuario });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      res.status(500).json({ error: 'Erro ao verificar token' });
    }
  }

  // Trocar senha
  async changePassword(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const userId = req.user.id; // Vem do middleware de autenticação

      // Validações
      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ 
          error: 'Senha atual e nova senha são obrigatórias' 
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ 
          error: 'A nova senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Buscar usuário
      const usuario = await Usuario.findByEmail(req.user.email);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const senhaValida = await Usuario.verificarSenha(senhaAtual, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      // Atualizar senha
      await Usuario.updatePassword(userId, novaSenha);

      res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
      console.error('Erro ao trocar senha:', error);
      res.status(500).json({ error: 'Erro ao alterar senha' });
    }
  }

  // Logout (no frontend limpa o token)
  async logout(req, res) {
    res.json({ message: 'Logout realizado com sucesso' });
  }
}

module.exports = new AuthController();