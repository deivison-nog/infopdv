import React, { useState, useEffect } from 'react';
import Button from '../Common/Button';
import Input from '../Common/Input';
import produtoService from '../../services/produto.service';
import './ProdutoModal.css';

const ProdutoModal = ({ produto, categorias, onClose }) => {
  const [formData, setFormData] = useState({
    codigo_barras: '',
    nome: '',
    descricao: '',
    categoria_id: '',
    preco_custo: '',
    preco_venda: '',
    estoque_atual: '',
    estoque_minimo: '5',
    unidade: 'UN',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (produto) {
      setFormData({
        codigo_barras: produto.codigo_barras || '',
        nome: produto.nome || '',
        descricao: produto.descricao || '',
        categoria_id: produto.categoria_id || '',
        preco_custo: produto.preco_custo || '',
        preco_venda: produto.preco_venda || '',
        estoque_atual: produto.estoque_atual || '',
        estoque_minimo: produto.estoque_minimo || '5',
        unidade: produto.unidade || 'UN',
      });
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!formData.nome || !formData.preco_venda) {
      setError('Nome e preço de venda são obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const data = {
        ...formData,
        preco_custo: parseFloat(formData.preco_custo) || 0,
        preco_venda: parseFloat(formData.preco_venda),
        estoque_atual: parseInt(formData.estoque_atual) || 0,
        estoque_minimo: parseInt(formData.estoque_minimo) || 5,
        categoria_id: formData.categoria_id ? parseInt(formData.categoria_id) : null,
      };

      if (produto) {
        await produtoService.update(produto.id, data);
      } else {
        await produtoService.create(data);
      }

      onClose(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{produto ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <Input
              label="Código de Barras"
              name="codigo_barras"
              placeholder="Digite o código de barras"
              value={formData.codigo_barras}
              onChange={handleChange}
            />

            <div className="input-group">
              <label className="input-label">Categoria</label>
              <select
                name="categoria_id"
                className="input"
                value={formData.categoria_id}
                onChange={handleChange}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icone} {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Nome do Produto *"
            name="nome"
            placeholder="Ex: Coca-Cola 2L"
            value={formData.nome}
            onChange={handleChange}
            required
          />

          <div className="input-group">
            <label className="input-label">Descrição</label>
            <textarea
              name="descricao"
              className="input"
              placeholder="Descrição do produto (opcional)"
              value={formData.descricao}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-row">
            <Input
              label="Preço de Custo"
              name="preco_custo"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.preco_custo}
              onChange={handleChange}
            />

            <Input
              label="Preço de Venda *"
              name="preco_venda"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.preco_venda}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <Input
              label="Estoque Atual"
              name="estoque_atual"
              type="number"
              placeholder="0"
              value={formData.estoque_atual}
              onChange={handleChange}
            />

            <Input
              label="Estoque Mínimo"
              name="estoque_minimo"
              type="number"
              placeholder="5"
              value={formData.estoque_minimo}
              onChange={handleChange}
            />

            <div className="input-group">
              <label className="input-label">Unidade</label>
              <select
                name="unidade"
                className="input"
                value={formData.unidade}
                onChange={handleChange}
              >
                <option value="UN">UN - Unidade</option>
                <option value="KG">KG - Quilograma</option>
                <option value="LT">LT - Litro</option>
                <option value="CX">CX - Caixa</option>
                <option value="PC">PC - Peça</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}

          <div className="modal-footer">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              {produto ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProdutoModal;