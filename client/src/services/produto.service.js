import api from './api';

const produtoService = {
  // Listar todos os produtos (com filtros)
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.categoria_id) {
      params.append('categoria_id', filters.categoria_id);
    }
    if (filters.busca) {
      params.append('busca', filters.busca);
    }
    if (filters.estoque_baixo) {
      params.append('estoque_baixo', 'true');
    }

    const response = await api.get(`/produtos?${params.toString()}`);
    return response.data;
  },

  // Buscar produto por ID
  async getById(id) {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  // Buscar por código de barras
  async getByBarcode(codigo) {
    const response = await api.get(`/produtos/barcode/${codigo}`);
    return response.data;
  },

  // Produtos com estoque baixo
  async getEstoqueBaixo() {
    const response = await api.get('/produtos/estoque-baixo');
    return response.data;
  },

  // Criar produto
  async create(data) {
    const response = await api.post('/produtos', data);
    return response.data;
  },

  // Atualizar produto
  async update(id, data) {
    const response = await api.put(`/produtos/${id}`, data);
    return response.data;
  },

  // Atualizar estoque
  async updateEstoque(id, quantidade, operacao) {
    const response = await api.patch(`/produtos/${id}/estoque`, {
      quantidade,
      operacao,
    });
    return response.data;
  },

  // Deletar produto
  async delete(id) {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },
};

export default produtoService;