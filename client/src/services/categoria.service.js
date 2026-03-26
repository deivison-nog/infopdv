import api from './api';

const categoriaService = {
  // Listar todas as categorias
  async getAll() {
    const response = await api.get('/categorias');
    return response.data;
  },

  // Buscar categoria por ID
  async getById(id) {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  // Criar categoria
  async create(data) {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  // Atualizar categoria
  async update(id, data) {
    const response = await api.put(`/categorias/${id}`, data);
    return response.data;
  },

  // Deletar categoria
  async delete(id) {
    const response = await api.delete(`/categorias/${id}`);
    return response.data;
  },
};

export default categoriaService;