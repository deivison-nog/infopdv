import api from './api';

const relatorioService = {
  // Dashboard
  async getDashboard() {
    const response = await api.get('/relatorios/dashboard');
    return response.data;
  },

  // Vendas por período
  async getVendasPorPeriodo(dataInicial, dataFinal) {
    const response = await api.get('/relatorios/vendas-periodo', {
      params: { data_inicial: dataInicial, data_final: dataFinal },
    });
    return response.data;
  },

  // Vendas por forma de pagamento
  async getVendasPorFormaPagamento(dataInicial, dataFinal) {
    const response = await api.get('/relatorios/vendas-forma-pagamento', {
      params: { data_inicial: dataInicial, data_final: dataFinal },
    });
    return response.data;
  },

  // Produtos mais vendidos
  async getProdutosMaisVendidos(dataInicial, dataFinal, limite = 10) {
    const response = await api.get('/relatorios/produtos-mais-vendidos', {
      params: { 
        data_inicial: dataInicial, 
        data_final: dataFinal,
        limite,
      },
    });
    return response.data;
  },

  // Vendas por categoria
  async getVendasPorCategoria(dataInicial, dataFinal) {
    const response = await api.get('/relatorios/vendas-categoria', {
      params: { data_inicial: dataInicial, data_final: dataFinal },
    });
    return response.data;
  },

  // Vendas por vendedor
  async getVendasPorVendedor(dataInicial, dataFinal) {
    const response = await api.get('/relatorios/vendas-vendedor', {
      params: { data_inicial: dataInicial, data_final: dataFinal },
    });
    return response.data;
  },
};

export default relatorioService;