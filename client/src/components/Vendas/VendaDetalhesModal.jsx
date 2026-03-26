import React from 'react';
import Button from '../Common/Button';
import Badge from '../Common/Badge';
import './VendaDetalhesModal.css';

const VendaDetalhesModal = ({ venda, onClose, onCancelar, onImprimir }) => {
  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(valor) || 0);
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🧾 Detalhes da Venda</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="venda-detalhes-header">
            <div className="detalhe-item">
              <span className="detalhe-label">Número:</span>
              <span className="detalhe-valor destaque">#{venda.numero_venda}</span>
            </div>
            <div className="detalhe-item">
              <span className="detalhe-label">Status:</span>
              <Badge variant={venda.status === 'concluida' ? 'success' : 'danger'}>
                {venda.status === 'concluida' ? '✅ Concluída' : '❌ Cancelada'}
              </Badge>
            </div>
          </div>

          <div className="venda-detalhes-info">
            <div className="detalhe-item">
              <span className="detalhe-label">📅 Data/Hora:</span>
              <span className="detalhe-valor">{formatData(venda.data_venda)}</span>
            </div>
            <div className="detalhe-item">
              <span className="detalhe-label">👤 Vendedor:</span>
              <span className="detalhe-valor">{venda.vendedor_nome}</span>
            </div>
            <div className="detalhe-item">
              <span className="detalhe-label">💳 Pagamento:</span>
              <span className="detalhe-valor">
                {getFormaPagamentoLabel(venda.forma_pagamento)}
              </span>
            </div>
          </div>

          <div className="venda-itens-secao">
            <h3>📦 Itens da Venda</h3>
            <div className="venda-itens-lista">
              {venda.itens && venda.itens.map((item, index) => (
                <div key={index} className="venda-item">
                  <div className="item-principal">
                    <div className="item-nome">{item.produto_nome}</div>
                    {item.produto_codigo && (
                      <div className="item-codigo">🔖 {item.produto_codigo}</div>
                    )}
                  </div>
                  <div className="item-valores">
                    <div className="item-quantidade">
                      {item.quantidade}x {formatMoeda(item.preco_unitario)}
                    </div>
                    <div className="item-subtotal">
                      {formatMoeda(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="venda-totais">
            <div className="total-linha">
              <span>Subtotal:</span>
              <span>{formatMoeda(venda.subtotal)}</span>
            </div>
            {parseFloat(venda.desconto) > 0 && (
              <div className="total-linha">
                <span>Desconto:</span>
                <span className="valor-desconto">
                  - {formatMoeda(venda.desconto)}
                </span>
              </div>
            )}
            <div className="total-linha total-final">
              <span>TOTAL:</span>
              <span>{formatMoeda(venda.total)}</span>
            </div>
            {venda.forma_pagamento === 'dinheiro' && (
              <>
                <div className="total-linha">
                  <span>Valor Pago:</span>
                  <span>{formatMoeda(venda.valor_pago)}</span>
                </div>
                <div className="total-linha">
                  <span>Troco:</span>
                  <span className="valor-troco">
                    {formatMoeda(venda.troco)}
                  </span>
                </div>
              </>
            )}
          </div>

          {venda.status === 'cancelada' && (
            <div className="venda-cancelamento">
              <h4>❌ Informações do Cancelamento</h4>
              <p>
                <strong>Data:</strong> {formatData(venda.cancelada_em)}
              </p>
              <p>
                <strong>Motivo:</strong> {venda.motivo_cancelamento}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              onImprimir && onImprimir(venda.id);
              onClose();
            }}
          >
            🖨️ Imprimir Cupom
          </Button>
          {venda.status === 'concluida' && (
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja cancelar esta venda?')) {
                  onCancelar(venda.id);
                }
              }}
            >
              ❌ Cancelar Venda
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendaDetalhesModal;