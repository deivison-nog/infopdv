import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import Layout from '../components/Layout/Layout';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import relatorioService from '../services/relatorio.service';
import './RelatoriosPage.css';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const RelatoriosPage = () => {
  const [periodo, setPeriodo] = useState({
    data_inicial: new Date().toISOString().split('T')[0],
    data_final: new Date().toISOString().split('T')[0],
  });

  const [vendasPorPeriodo, setVendasPorPeriodo] = useState([]);
  const [vendasPorFormaPagamento, setVendasPorFormaPagamento] = useState([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [vendasPorCategoria, setVendasPorCategoria] = useState([]);
  const [vendasPorVendedor, setVendasPorVendedor] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelatorios();
  }, [periodo]);

  const loadRelatorios = async () => {
    try {
      setLoading(true);
      
      const [
        periodo_data,
        forma_pagamento,
        produtos,
        categorias,
        vendedores,
      ] = await Promise.all([
        relatorioService.getVendasPorPeriodo(periodo.data_inicial, periodo.data_final),
        relatorioService.getVendasPorFormaPagamento(periodo.data_inicial, periodo.data_final),
        relatorioService.getProdutosMaisVendidos(periodo.data_inicial, periodo.data_final, 10),
        relatorioService.getVendasPorCategoria(periodo.data_inicial, periodo.data_final),
        relatorioService.getVendasPorVendedor(periodo.data_inicial, periodo.data_final),
      ]);

      setVendasPorPeriodo(periodo_data);
      setVendasPorFormaPagamento(forma_pagamento);
      setProdutosMaisVendidos(produtos);
      setVendasPorCategoria(categorias);
      setVendasPorVendedor(vendedores);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      alert('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const setPeriodoRapido = (tipo) => {
    const hoje = new Date();
    let dataInicial = '';
    let dataFinal = hoje.toISOString().split('T')[0];

    switch (tipo) {
      case 'hoje':
        dataInicial = dataFinal;
        break;
      case 'ontem':
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);
        dataInicial = dataFinal = ontem.toISOString().split('T')[0];
        break;
      case 'semana':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        dataInicial = inicioSemana.toISOString().split('T')[0];
        break;
      case 'mes':
        dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        break;
      case '30dias':
        const dias30 = new Date(hoje);
        dias30.setDate(dias30.getDate() - 30);
        dataInicial = dias30.toISOString().split('T')[0];
        break;
    }

    setPeriodo({ data_inicial: dataInicial, data_final: dataFinal });
  };

  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(valor) || 0);
  };

  const formatData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Gráfico de Vendas por Período (Linha)
  const graficoVendasPorPeriodo = {
    labels: vendasPorPeriodo.map((v) => formatData(v.data)),
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: vendasPorPeriodo.map((v) => parseFloat(v.total_faturado)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Número de Vendas',
        data: vendasPorPeriodo.map((v) => v.total_vendas),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const opcoesGraficoLinha = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Vendas por Período',
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Faturamento (R$)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Quantidade',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Gráfico de Formas de Pagamento (Pizza)
  const graficoFormaPagamento = {
    labels: vendasPorFormaPagamento.map((v) => {
      const formas = {
        dinheiro: '💵 Dinheiro',
        debito: '💳 Débito',
        credito: '💳 Crédito',
        pix: '📱 PIX',
      };
      return formas[v.forma_pagamento] || v.forma_pagamento;
    }),
    datasets: [
      {
        label: 'Total (R$)',
        data: vendasPorFormaPagamento.map((v) => parseFloat(v.total_faturado)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const opcoesGraficoPizza = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Vendas por Forma de Pagamento',
        font: { size: 16 },
      },
    },
  };

  // Gráfico de Produtos Mais Vendidos (Barra Horizontal)
  const graficoProdutosMaisVendidos = {
    labels: produtosMaisVendidos.map((p) => p.produto_nome),
    datasets: [
      {
        label: 'Quantidade Vendida',
        data: produtosMaisVendidos.map((p) => p.total_vendido),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const opcoesGraficoBarraHorizontal = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top 10 Produtos Mais Vendidos',
        font: { size: 16 },
      },
    },
  };

  // Gráfico de Vendas por Categoria (Rosca)
  const graficoVendasPorCategoria = {
    labels: vendasPorCategoria.map((c) => `${c.icone} ${c.categoria}`),
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: vendasPorCategoria.map((c) => parseFloat(c.total_faturado)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const opcoesGraficoRosca = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Vendas por Categoria',
        font: { size: 16 },
      },
    },
  };

  // Gráfico de Vendas por Vendedor (Barra)
  const graficoVendasPorVendedor = {
    labels: vendasPorVendedor.map((v) => v.vendedor),
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: vendasPorVendedor.map((v) => parseFloat(v.total_faturado)),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const opcoesGraficoBarra = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Vendas por Vendedor',
        font: { size: 16 },
      },
    },
  };

  // Calcular totais
  const totalFaturado = vendasPorPeriodo.reduce(
    (acc, v) => acc + parseFloat(v.total_faturado),
    0
  );
  const totalVendas = vendasPorPeriodo.reduce((acc, v) => acc + v.total_vendas, 0);
  const totalCanceladas = vendasPorPeriodo.reduce(
    (acc, v) => acc + v.total_canceladas,
    0
  );

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>📊 Relatórios e Gráficos</h1>
          <p>Análise detalhada das vendas e performance</p>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card>
        <div className="relatorio-filtros">
          <div className="filtros-rapidos">
            <button
              className="filtro-btn"
              onClick={() => setPeriodoRapido('hoje')}
            >
              Hoje
            </button>
            <button
              className="filtro-btn"
              onClick={() => setPeriodoRapido('ontem')}
            >
              Ontem
            </button>
            <button
              className="filtro-btn"
              onClick={() => setPeriodoRapido('semana')}
            >
              Esta Semana
            </button>
            <button
              className="filtro-btn"
              onClick={() => setPeriodoRapido('mes')}
            >
              Este Mês
            </button>
            <button
              className="filtro-btn"
              onClick={() => setPeriodoRapido('30dias')}
            >
              Últimos 30 Dias
            </button>
          </div>

          <div className="filtros-customizados">
            <Input
              type="date"
              label="Data Inicial"
              value={periodo.data_inicial}
              onChange={(e) =>
                setPeriodo((prev) => ({ ...prev, data_inicial: e.target.value }))
              }
            />
            <Input
              type="date"
              label="Data Final"
              value={periodo.data_final}
              onChange={(e) =>
                setPeriodo((prev) => ({ ...prev, data_final: e.target.value }))
              }
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="loading-state">Carregando relatórios...</div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="relatorio-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F5E9' }}>
                💰
              </div>
              <div className="stat-info">
                <div className="stat-label">Total Faturado</div>
                <div className="stat-value">{formatMoeda(totalFaturado)}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E3F2FD' }}>
                📊
              </div>
              <div className="stat-info">
                <div className="stat-label">Total de Vendas</div>
                <div className="stat-value">{totalVendas}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFF3E0' }}>
                🎯
              </div>
              <div className="stat-info">
                <div className="stat-label">Ticket Médio</div>
                <div className="stat-value">
                  {formatMoeda(totalVendas > 0 ? totalFaturado / totalVendas : 0)}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#FFEBEE' }}>
                ❌
              </div>
              <div className="stat-info">
                <div className="stat-label">Canceladas</div>
                <div className="stat-value">{totalCanceladas}</div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="relatorio-graficos">
            {/* Vendas por Período */}
            <Card className="grafico-card grafico-full">
              <div className="grafico-container">
                <Line data={graficoVendasPorPeriodo} options={opcoesGraficoLinha} />
              </div>
            </Card>

            {/* Formas de Pagamento */}
            <Card className="grafico-card">
              <div className="grafico-container">
                {vendasPorFormaPagamento.length > 0 ? (
                  <Pie data={graficoFormaPagamento} options={opcoesGraficoPizza} />
                ) : (
                  <div className="grafico-vazio">Sem dados</div>
                )}
              </div>
            </Card>

            {/* Vendas por Categoria */}
            <Card className="grafico-card">
              <div className="grafico-container">
                {vendasPorCategoria.length > 0 ? (
                  <Doughnut data={graficoVendasPorCategoria} options={opcoesGraficoRosca} />
                ) : (
                  <div className="grafico-vazio">Sem dados</div>
                )}
              </div>
            </Card>

            {/* Produtos Mais Vendidos */}
            <Card className="grafico-card grafico-full">
              <div className="grafico-container">
                {produtosMaisVendidos.length > 0 ? (
                  <Bar
                    data={graficoProdutosMaisVendidos}
                    options={opcoesGraficoBarraHorizontal}
                  />
                ) : (
                  <div className="grafico-vazio">Sem dados</div>
                )}
              </div>
            </Card>

            {/* Vendas por Vendedor */}
            {vendasPorVendedor.length > 0 && (
              <Card className="grafico-card">
                <div className="grafico-container">
                  <Bar data={graficoVendasPorVendedor} options={opcoesGraficoBarra} />
                </div>
              </Card>
            )}
          </div>

          {/* Tabelas de Dados */}
          <div className="relatorio-tabelas">
            {/* Produtos Mais Vendidos */}
            {produtosMaisVendidos.length > 0 && (
              <Card title="📦 Top 10 Produtos Mais Vendidos">
                <div className="tabela-simples">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd Vendida</th>
                        <th>Nº Vendas</th>
                        <th>Faturamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosMaisVendidos.map((produto, index) => (
                        <tr key={index}>
                          <td>{produto.produto_nome}</td>
                          <td className="text-center">{produto.total_vendido}</td>
                          <td className="text-center">{produto.numero_vendas}</td>
                          <td className="text-right valor-destaque">
                            {formatMoeda(produto.total_faturado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Vendas por Categoria */}
            {vendasPorCategoria.length > 0 && (
              <Card title="📂 Vendas por Categoria">
                <div className="tabela-simples">
                  <table>
                    <thead>
                      <tr>
                        <th>Categoria</th>
                        <th>Qtd Vendida</th>
                        <th>Nº Vendas</th>
                        <th>Faturamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasPorCategoria.map((categoria, index) => (
                        <tr key={index}>
                          <td>
                            {categoria.icone} {categoria.categoria}
                          </td>
                          <td className="text-center">{categoria.total_vendido}</td>
                          <td className="text-center">{categoria.numero_vendas}</td>
                          <td className="text-right valor-destaque">
                            {formatMoeda(categoria.total_faturado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default RelatoriosPage;