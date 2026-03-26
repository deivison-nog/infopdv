import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Badge from '../components/Common/Badge';
import vendaService from '../services/venda.service';
import VendaDetalhesModal from '../components/Vendas/VendaDetalhesModal';
import CupomModal from '../components/Vendas/CupomModal';
import './VendasHistoricoPage.css';

const VendasHistoricoPage = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [filtros, setFiltros] = useState({
    status: '',
    data_inicial: '',
    data_final: '',
    numero_venda: '',
  });
  const [estatisticas, setEstatisticas] = useState(null);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cupomVendaId, setCupomVendaId] = useState(null);
  const [mostrarCupom, setMostrarCupom] = useState(false);

  useEffect(() => {
    loadVendas();
    loadEstatisticas();
  }, [filtros, pagination.page]);

  const loadVendas = async () => {
    try {
      setLoading(true);
      const result = await vendaService.getAll({
        ...filtros,
        page: pagination.page,
        limit: pagination.limit,
      });
      
      setVendas(result.vendas || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      alert('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const loadEstatisticas = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const data = await vendaService.getEstatisticas(
        filtros.data_inicial || hoje,
        filtros.data_final || hoje
      );
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const setFiltroRapido = (tipo) => {
    const hoje = new Date();
    let dataInicial = '';
    let dataFinal = '';

    switch (tipo) {
      case 'hoje':
        dataInicial = dataFinal = hoje.toISOString().split('T')[0];
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
        dataFinal = hoje.toISOString().split('T')[0];
        break;
      case 'mes':
        dataInicial = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        dataFinal = hoje.toISOString().split('T')[0];
        break;
      case 'todas':
        dataInicial = '';
        dataFinal = '';
        break;
    }

    setFiltros((prev) => ({
      ...prev,
      data_inicial: dataInicial,
      data_final: dataFinal,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleVerDetalhes = async (venda) => {
    try {
      const vendaCompleta = await vendaService.getById(venda.id);
      setVendaSelecionada(vendaCompleta);
      setModalOpen(true);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      alert('Erro ao buscar detalhes da venda');
    }
  };

  const handleCancelarVenda = async (vendaId) => {
    const motivo = window.prompt('Digite o motivo do cancelamento:');
    if (!motivo) return;

    try {
      await vendaService.cancel(vendaId, motivo);
      alert('Venda cancelada com sucesso!');
      loadVendas();
      loadEstatisticas();
      if (modalOpen) {
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      alert(error.response?.data?.error || 'Erro ao cancelar venda');
    }
  };

  const handleImprimirCupom = (vendaId) => {
    setCupomVendaId(vendaId);
    setMostrarCupom(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const formatData = (data) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFormaPagamentoLabel = (forma) => {
    const formas = {
      dinheiro: '💵 Dinheiro',
      debito: '💳 Débito',
      credito: '💳 Crédito',
      pix: '📱 PIX',
    };
    return formas[forma] || forma;
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>📊 Histórico de Vendas</h1>
          <p>Visualize e gerencie as vendas realizadas</p>
        </div>
      </div>

      <div className="filtros-rapidos">
        <button
          className={`filtro-btn ${!filtros.data_inicial && !filtros.data_final ? 'active' : ''}`}
          onClick={() => setFiltroRapido('todas')}
        >
          Todas
        </button>
        <button
          className="filtro-btn"
          onClick={() => setFiltroRapido('hoje')}
        >
          Hoje
        </button>
        <button
          className="filtro-btn"
          onClick={() => setFiltroRapido('ontem')}
        >
          Ontem
        </button>
        <button
          className="filtro-btn"
          onClick={() => setFiltroRapido('semana')}
        >
          Esta Semana
        </button>
        <button
          className="filtro-btn"
          onClick={() => setFiltroRapido('mes')}
        >
          Este Mês
        </button>
      </div>

      {estatisticas && (
        <div className="vendas-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E3F2FD' }}>
              📊
            </div>
            <div className="stat-info">
              <div className="stat-label">Total de Vendas</div>
              <div className="stat-value">{estatisticas.total_vendas || 0}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E8F5E9' }}>
              💰
            </div>
            <div className="stat-info">
              <div className="stat-label">Total Faturado</div>
              <div className="stat-value">
                {formatMoeda(parseFloat(estatisticas.total_faturado) || 0)}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF3E0' }}>
              🎯
            </div>
            <div className="stat-info">
              <div className="stat-label">Ticket Médio</div>
              <div className="stat-value">
                {formatMoeda(parseFloat(estatisticas.ticket_medio) || 0)}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFEBEE' }}>
              ❌
            </div>
            <div className="stat-info">
              <div className="stat-label">Canceladas</div>
              <div className="stat-value">
                {estatisticas.total_canceladas || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <div className="filtros-avancados">
          <Input
            placeholder="🔍 Buscar por número da venda..."
            value={filtros.numero_venda}
            onChange={(e) => {
              setFiltros((prev) => ({ ...prev, numero_venda: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />

          <Input
            type="date"
            label="Data Inicial"
            value={filtros.data_inicial}
            onChange={(e) => {
              setFiltros((prev) => ({ ...prev, data_inicial: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />

          <Input
            type="date"
            label="Data Final"
            value={filtros.data_final}
            onChange={(e) => {
              setFiltros((prev) => ({ ...prev, data_final: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          />

          <div className="input-group">
            <label className="input-label">Status</label>
            <select
              className="input"
              value={filtros.status}
              onChange={(e) => {
                setFiltros((prev) => ({ ...prev, status: e.target.value }));
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <option value="">Todos</option>
              <option value="concluida">Concluídas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </Card>

      <Card 
        title={`Vendas (${pagination.total} total${pagination.total !== 1 ? 's' : ''} - Página ${pagination.page} de ${pagination.totalPages})`}
      >
        {loading ? (
          <div className="loading-state">Carregando vendas...</div>
        ) : vendas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Nenhuma venda encontrada</h3>
            <p>Não há vendas para os filtros selecionados</p>
          </div>
        ) : (
          <>
            <div className="vendas-lista">
              {vendas.map((venda) => (
                <div key={venda.id} className="venda-card">
                  <div className="venda-header">
                    <div className="venda-numero">
                      <strong>#{venda.numero_venda}</strong>
                    </div>
                    <Badge
                      variant={
                        venda.status === 'concluida' ? 'success' : 'danger'
                      }
                    >
                      {venda.status === 'concluida' ? '✅ Concluída' : '❌ Cancelada'}
                    </Badge>
                  </div>

                  <div className="venda-info">
                    <div className="info-item">
                      <span className="info-label">🕐 Data/Hora:</span>
                      <span>{formatData(venda.data_venda)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">👤 Vendedor:</span>
                      <span>{venda.vendedor_nome}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💳 Pagamento:</span>
                      <span>{getFormaPagamentoLabel(venda.forma_pagamento)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">💰 Total:</span>
                      <span className="valor-destaque">
                        {formatMoeda(parseFloat(venda.total))}
                      </span>
                    </div>
                  </div>

                  <div className="venda-acoes">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerDetalhes(venda)}
                    >
                      👁️ Ver Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImprimirCupom(venda.id)}
                    >
                      🖨️ Imprimir
                    </Button>
                    {venda.status === 'concluida' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelarVenda(venda.id)}
                      >
                        ❌ Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  ← Anterior
                </Button>

                <div className="pagination-info">
                  <span>
                    Página <strong>{pagination.page}</strong> de{' '}
                    <strong>{pagination.totalPages}</strong>
                  </span>
                  <span className="pagination-total">
                    ({pagination.total} venda{pagination.total !== 1 ? 's' : ''})
                  </span>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Próxima →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {modalOpen && vendaSelecionada && (
        <VendaDetalhesModal
          venda={vendaSelecionada}
          onClose={() => setModalOpen(false)}
          onCancelar={handleCancelarVenda}
          onImprimir={handleImprimirCupom}
        />
      )}

      {mostrarCupom && cupomVendaId && (
        <CupomModal
          vendaId={cupomVendaId}
          onClose={() => {
            setMostrarCupom(false);
            setCupomVendaId(null);
          }}
        />
      )}
    </Layout>
  );
};

export default VendasHistoricoPage;