import React from 'react';
import './CupomTermico.css';

const CupomTermico = React.forwardRef(({ cupom }, ref) => {
  const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(parseFloat(valor) || 0);
  };

  const getFormaPagamento = (forma) => {
    const formas = {
      dinheiro: 'DINHEIRO',
      debito: 'DEBITO',
      credito: 'CREDITO',
      pix: 'PIX',
    };
    return formas[forma] || forma.toUpperCase();
  };

  if (!cupom) return null;

  const { empresa, venda, cupom: cupomConfig } = cupom;

  console.log('📊 CupomTermico dados:', {
    empresa_nome: empresa?.nome,
    numero_venda: venda?.numero_venda,
    total_itens: venda?.itens?.length,
    numero_vias: cupomConfig?.numero_vias
  });

  return (
    <div ref={ref} className="cupom-termico">
      {/* Cabeçalho */}
      <div className="cupom-header">
        <div className="empresa-nome">{empresa.nome}</div>
        <div className="empresa-info">
          {empresa.cnpj && `CNPJ: ${empresa.cnpj}`}
          {empresa.cnpj && <br />}
          {empresa.endereco}
          {empresa.endereco && <br />}
          {empresa.cidade}
          {empresa.cidade && <br />}
          {empresa.telefone && `Tel: ${empresa.telefone}`}
        </div>
      </div>

      <div className="cupom-linha">================================</div>

      {/* Título */}
      <div className="cupom-titulo">CUPOM NAO FISCAL</div>
      
      <div className="cupom-linha">================================</div>

      {/* Informações da Venda */}
      <div className="cupom-info">
        <div className="info-row">
          <span>Venda:</span>
          <span>{venda.numero_venda}</span>
        </div>
        <div className="info-row">
          <span>Data:</span>
          <span>{venda.data_venda_formatada}</span>
        </div>
        <div className="info-row">
          <span>Vendedor:</span>
          <span>{venda.vendedor_nome}</span>
        </div>
      </div>

      <div className="cupom-linha">================================</div>

      {/* Itens */}
      <div className="cupom-itens">
        <div className="itens-header">
          <span className="col-desc">ITEM / DESCRICAO</span>
          <span className="col-qtd">QTD</span>
          <span className="col-valor">VALOR</span>
        </div>
        
        {venda.itens && venda.itens.map((item, index) => (
          <div key={index} className="item-grupo">
            <div className="item-linha1">
              <span className="item-numero">{String(index + 1).padStart(3, '0')}</span>
              <span className="item-nome">{item.produto_nome}</span>
            </div>
            <div className="item-linha2">
              <span className="item-codigo">
                {item.produto_codigo ? `Cod: ${item.produto_codigo}` : ''}
              </span>
            </div>
            <div className="item-linha3">
              <span className="item-qtd">{item.quantidade} x {formatMoeda(item.preco_unitario)}</span>
              <span className="item-subtotal">{formatMoeda(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cupom-linha">================================</div>

      {/* Totais */}
      <div className="cupom-totais">
        <div className="total-row">
          <span>SUBTOTAL:</span>
          <span>{formatMoeda(venda.subtotal)}</span>
        </div>
        
        {parseFloat(venda.desconto) > 0 && (
          <div className="total-row">
            <span>DESCONTO:</span>
            <span>-{formatMoeda(venda.desconto)}</span>
          </div>
        )}
        
        <div className="total-row total-final">
          <span>TOTAL:</span>
          <span>{formatMoeda(venda.total)}</span>
        </div>
      </div>

      <div className="cupom-linha">================================</div>

      {/* Pagamento */}
      <div className="cupom-pagamento">
        <div className="pag-row">
          <span>FORMA DE PAGAMENTO:</span>
          <span>{getFormaPagamento(venda.forma_pagamento)}</span>
        </div>
        
        {venda.forma_pagamento === 'dinheiro' && (
          <>
            <div className="pag-row">
              <span>VALOR PAGO:</span>
              <span>{formatMoeda(venda.valor_pago)}</span>
            </div>
            <div className="pag-row">
              <span>TROCO:</span>
              <span>{formatMoeda(venda.troco)}</span>
            </div>
          </>
        )}
      </div>

      <div className="cupom-linha">================================</div>

      {/* Rodapé */}
      <div className="cupom-footer">
        {cupomConfig?.mensagem_rodape && cupomConfig.mensagem_rodape.split('\n').map((linha, index) => (
          <div key={index} className="footer-msg">{linha}</div>
        ))}
        <br />
        <div className="footer-info">
          Este nao e um documento fiscal
        </div>
        <div className="footer-info">
          Sistema: Info PDV v1.0
        </div>
      </div>

      {/* Espaço para corte */}
      <div className="cupom-corte">

      </div>
    </div>
  );
});

CupomTermico.displayName = 'CupomTermico';

export default CupomTermico;