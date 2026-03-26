import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import relatorioService from '../services/relatorio.service';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await relatorioService.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const menuItems = [
    {
      title: 'Produtos',
      icon: '📦',
      description: 'Gerenciar catálogo de produtos',
      color: '#2196F3',
      path: '/produtos',
    },
    {
      title: 'Vendas',
      icon: '💰',
      description: 'Realizar vendas e emitir cupons',
      color: '#4CAF50',
      path: '/vendas',
    },
    {
      title: 'Histórico',
      icon: '📊',
      description: 'Ver histórico de vendas',
      color: '#FF9800',
      path: '/vendas/historico',
    },
    {
      title: 'Relatórios',
      icon: '📈',
      description: 'Relatórios e gráficos de vendas',
      color: '#9C27B0',
      path: '/relatorios',
    },
  ];

  return (
    <Layout>
      <div className="dashboard-welcome">
        <h1>Olá, {user?.nome}! 👋</h1>
        <p>Bem-vindo ao sistema Info PDV</p>
      </div>

      {/* Estatísticas */}
      {!loading && dashboard && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E3F2FD' }}>
              📊
            </div>
            <div className="stat-info">
              <div className="stat-label">Vendas Hoje</div>
              <div className="stat-value">{dashboard.vendas_hoje.total}</div>
              <div className="stat-sub">
                {formatMoeda(dashboard.vendas_hoje.faturado)}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E8F5E9' }}>
              💰
            </div>
            <div className="stat-info">
              <div className="stat-label">Vendas do Mês</div>
              <div className="stat-value">{dashboard.vendas_mes.total}</div>
              <div className="stat-sub">
                {formatMoeda(dashboard.vendas_mes.faturado)}
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF3E0' }}>
              📦
            </div>
            <div className="stat-info">
              <div className="stat-label">Total Produtos</div>
              <div className="stat-value">{dashboard.produtos.total}</div>
              <div className="stat-sub">Cadastrados</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFEBEE' }}>
              ⚠️
            </div>
            <div className="stat-info">
              <div className="stat-label">Estoque Baixo</div>
              <div className="stat-value">{dashboard.produtos.estoque_baixo}</div>
              <div className="stat-sub">Produtos</div>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="dashboard-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(item.path)}
            style={{ borderTopColor: item.color }}
          >
            <div className="dashboard-icon" style={{ background: item.color }}>
              {item.icon}
            </div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <h4>Sistema de Gestão Completo</h4>
            <p>
              Gerencie produtos, realize vendas, acompanhe histórico e 
              visualize relatórios detalhados com gráficos. Tudo em um só lugar!
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;