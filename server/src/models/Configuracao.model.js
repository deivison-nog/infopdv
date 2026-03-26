const db = require('../config/database');

class Configuracao {
  // Buscar todas as configurações
  static async findAll() {
    const sql = 'SELECT * FROM configuracoes ORDER BY chave';
    return await db.query(sql);
  }

  // Buscar configuração por chave
  static async findByChave(chave) {
    const sql = 'SELECT * FROM configuracoes WHERE chave = ?';
    return await db.queryOne(sql, [chave]);
  }

  // Buscar múltiplas configurações por prefixo (ex: 'empresa_')
  static async findByPrefix(prefix) {
    const sql = 'SELECT * FROM configuracoes WHERE chave LIKE ? ORDER BY chave';
    return await db.query(sql, [`${prefix}%`]);
  }

  // Atualizar configuração
  static async update(chave, valor) {
    const config = await this.findByChave(chave);
    
    if (!config) {
      // Se não existe, criar
      const sql = 'INSERT INTO configuracoes (chave, valor) VALUES (?, ?)';
      await db.execute(sql, [chave, valor]);
    } else {
      // Se existe, atualizar
      const sql = 'UPDATE configuracoes SET valor = ? WHERE chave = ?';
      await db.execute(sql, [valor, chave]);
    }

    return await this.findByChave(chave);
  }

  // Atualizar múltiplas configurações de uma vez
  static async updateMany(configs) {
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();

      for (const config of configs) {
        const { chave, valor } = config;
        
        const [existing] = await connection.execute(
          'SELECT * FROM configuracoes WHERE chave = ?',
          [chave]
        );

        if (existing.length === 0) {
          await connection.execute(
            'INSERT INTO configuracoes (chave, valor) VALUES (?, ?)',
            [chave, valor]
          );
        } else {
          await connection.execute(
            'UPDATE configuracoes SET valor = ? WHERE chave = ?',
            [valor, chave]
          );
        }
      }

      await connection.commit();
      return { message: 'Configurações atualizadas com sucesso' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Buscar configurações da empresa (para cupom)
  static async getEmpresaConfig() {
    const configs = await this.findByPrefix('empresa_');
    const cupomConfigs = await this.findByPrefix('cupom_');
    
    const empresa = {};
    configs.forEach(config => {
      const key = config.chave.replace('empresa_', '');
      empresa[key] = config.valor;
    });

    const cupom = {};
    cupomConfigs.forEach(config => {
      const key = config.chave.replace('cupom_', '');
      cupom[key] = config.tipo === 'boolean' 
        ? config.valor === 'true' 
        : config.tipo === 'number'
        ? parseInt(config.valor)
        : config.valor;
    });

    return { empresa, cupom };
  }

  // Resetar para valores padrão
  static async resetToDefaults() {
    const defaults = [
      { chave: 'empresa_nome', valor: 'INFO PDV' },
      { chave: 'empresa_cnpj', valor: '00.000.000/0001-00' },
      { chave: 'empresa_endereco', valor: 'Rua Example, 123' },
      { chave: 'empresa_cidade', valor: 'São Paulo - SP' },
      { chave: 'empresa_telefone', valor: '(11) 1234-5678' },
      { chave: 'empresa_email', valor: 'contato@infopdv.com.br' },
      { chave: 'empresa_site', valor: 'www.infopdv.com.br' },
      { chave: 'cupom_mensagem_rodape', valor: 'OBRIGADO PELA PREFERENCIA!\nVOLTE SEMPRE!' },
      { chave: 'cupom_impressao_automatica', valor: 'false' },
      { chave: 'cupom_numero_vias', valor: '1' },
    ];

    return await this.updateMany(defaults);
  }
}

module.exports = Configuracao;