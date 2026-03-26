import api from './api';

const configuracaoService = {
  // Listar todas as configurações
  async getAll() {
    const response = await api.get('/configuracoes');
    return response.data;
  },

  // Buscar configuração por chave
  async getByChave(chave) {
    const response = await api.get(`/configuracoes/${chave}`);
    return response.data;
  },

  // Buscar configurações por prefixo
  async getByPrefix(prefix) {
    const response = await api.get(`/configuracoes/prefix/${prefix}`);
    return response.data;
  },

  // Buscar configurações da empresa
  async getEmpresaConfig() {
    const response = await api.get('/configuracoes/empresa');
    return response.data;
  },

  // Atualizar configuração
  async update(chave, valor) {
    const response = await api.put(`/configuracoes/${chave}`, { valor });
    return response.data;
  },

  // Atualizar múltiplas configurações
  async updateMany(configuracoes) {
    const response = await api.post('/configuracoes/batch', { configuracoes });
    return response.data;
  },

  // Resetar para valores padrão
  async reset() {
    const response = await api.post('/configuracoes/reset');
    return response.data;
  },
};

export default configuracaoService;