import api from './api';

const vendaService = {
  // Listar vendas (com filtros e paginação)
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.data_inicial) {
      params.append('data_inicial', filters.data_inicial);
    }
    if (filters.data_final) {
      params.append('data_final', filters.data_final);
    }
    if (filters.numero_venda) {
      params.append('numero_venda', filters.numero_venda);
    }
    if (filters.page) {
      params.append('page', filters.page);
    }
    if (filters.limit) {
      params.append('limit', filters.limit);
    }

    const response = await api.get(`/vendas?${params.toString()}`);
    return response.data;
  },

  // Buscar venda por ID
  async getById(id) {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },

  // Buscar por número da venda
  async getByNumero(numero) {
    const response = await api.get(`/vendas/numero/${numero}`);
    return response.data;
  },

  // Criar venda
  async create(data) {
    const response = await api.post('/vendas', data);
    return response.data;
  },

  // Cancelar venda
  async cancel(id, motivo) {
    const response = await api.post(`/vendas/${id}/cancelar`, { motivo });
    return response.data;
  },

  // Estatísticas
  async getEstatisticas(dataInicial, dataFinal) {
    const params = new URLSearchParams();
    if (dataInicial) params.append('data_inicial', dataInicial);
    if (dataFinal) params.append('data_final', dataFinal);
    
    const response = await api.get(`/vendas/estatisticas?${params.toString()}`);
    return response.data;
  },

  // Produtos mais vendidos
  async getProdutosMaisVendidos(limite = 10) {
    const response = await api.get(`/vendas/produtos-mais-vendidos?limite=${limite}`);
    return response.data;
  },

  // Gerar cupom
  async getCupom(id) {
    const response = await api.get(`/vendas/${id}/cupom`);
    return response.data;
  },
};

export default vendaService;