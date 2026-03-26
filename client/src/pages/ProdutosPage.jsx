import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/Common/Card';
import Table from '../components/Common/Table';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Badge from '../components/Common/Badge';
import produtoService from '../services/produto.service';
import categoriaService from '../services/categoria.service';
import ProdutoModal from '../components/Produtos/ProdutoModal';
import './ProdutosPage.css';

const ProdutosPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [estoqueBaixo, setEstoqueBaixo] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState(null);

  useEffect(() => {
    loadCategorias();
    loadProdutos();
  }, []);

  useEffect(() => {
    loadProdutos();
  }, [busca, categoriaFiltro, estoqueBaixo]);

  const loadCategorias = async () => {
    try {
      const data = await categoriaService.getAll();
      setCategorias(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const filters = {
        busca: busca || undefined,
        categoria_id: categoriaFiltro || undefined,
        estoque_baixo: estoqueBaixo || undefined,
      };
      const data = await produtoService.getAll(filters);
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoProduto = () => {
    setProdutoEdit(null);
    setModalOpen(true);
  };

  const handleEditProduto = (produto) => {
    setProdutoEdit(produto);
    setModalOpen(true);
  };

  const handleDeleteProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await produtoService.delete(id);
      loadProdutos();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao excluir produto');
    }
  };

  const handleModalClose = (saved) => {
    setModalOpen(false);
    setProdutoEdit(null);
    if (saved) {
      loadProdutos();
    }
  };

  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const columns = [
    {
      header: 'Produto',
      field: 'nome',
      render: (row) => (
        <div className="produto-info">
          <div className="produto-nome">{row.nome}</div>
          {row.codigo_barras && (
            <div className="produto-codigo">🔖 {row.codigo_barras}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Categoria',
      field: 'categoria_nome',
      width: '150px',
      render: (row) => (
        row.categoria_nome ? (
          <Badge variant="primary">
            {row.categoria_icone} {row.categoria_nome}
          </Badge>
        ) : (
          <Badge variant="default">Sem categoria</Badge>
        )
      ),
    },
    {
      header: 'Preço Venda',
      field: 'preco_venda',
      width: '120px',
      render: (row) => (
        <span className="preco">{formatMoeda(row.preco_venda)}</span>
      ),
    },
    {
      header: 'Estoque',
      field: 'estoque_atual',
      width: '100px',
      render: (row) => (
        <Badge
          variant={
            row.estoque_atual <= row.estoque_minimo
              ? 'danger'
              : row.estoque_atual <= row.estoque_minimo * 2
              ? 'warning'
              : 'success'
          }
        >
          {row.estoque_atual} {row.unidade}
        </Badge>
      ),
    },
    {
      header: 'Ações',
      width: '150px',
      render: (row) => (
        <div className="table-actions">
          <button
            className="btn-icon btn-edit"
            onClick={() => handleEditProduto(row)}
            title="Editar"
          >
            ✏️
          </button>
          <button
            className="btn-icon btn-delete"
            onClick={() => handleDeleteProduto(row.id)}
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>📦 Produtos</h1>
          <p>Gerencie o catálogo de produtos</p>
        </div>
        <Button onClick={handleNovoProduto}>
          ➕ Novo Produto
        </Button>
      </div>

      <div className="produtos-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E3F2FD' }}>📦</div>
          <div className="stat-info">
            <div className="stat-label">Total de Produtos</div>
            <div className="stat-value">{produtos.length}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF3E0' }}>⚠️</div>
          <div className="stat-info">
            <div className="stat-label">Estoque Baixo</div>
            <div className="stat-value">
              {produtos.filter(p => p.estoque_atual <= p.estoque_minimo).length}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F5E9' }}>📂</div>
          <div className="stat-info">
            <div className="stat-label">Categorias</div>
            <div className="stat-value">{categorias.length}</div>
          </div>
        </div>
      </div>

      <Card>
        <div className="produtos-filters">
          <Input
            placeholder="🔍 Buscar por nome ou código de barras..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          <select
            className="filter-select"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icone} {cat.nome}
              </option>
            ))}
          </select>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={estoqueBaixo}
              onChange={(e) => setEstoqueBaixo(e.target.checked)}
            />
            <span>Apenas estoque baixo</span>
          </label>
        </div>

        {loading ? (
          <div className="loading-state">Carregando produtos...</div>
        ) : (
          <Table
            columns={columns}
            data={produtos}
            emptyMessage="Nenhum produto encontrado. Clique em 'Novo Produto' para começar!"
          />
        )}
      </Card>

      {modalOpen && (
        <ProdutoModal
          produto={produtoEdit}
          categorias={categorias}
          onClose={handleModalClose}
        />
      )}
    </Layout>
  );
};

export default ProdutosPage;