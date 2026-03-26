import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import produtoService from '../services/produto.service';
import vendaService from '../services/venda.service';
import configuracaoService from '../services/configuracao.service';
import CupomModal from '../components/Vendas/CupomModal';
import './PdvPage.css';

const PdvPage = () => {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [busca, setBusca] = useState('');
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [mostrarProdutos, setMostrarProdutos] = useState(false);
  const [desconto, setDesconto] = useState(0);
  const [formaPagamento, setFormaPagamento] = useState('dinheiro');
  const [valorPago, setValorPago] = useState('');
  const [finalizando, setFinalizando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendaFinalizadaId, setVendaFinalizadaId] = useState(null);
  const [mostrarCupom, setMostrarCupom] = useState(false);
  const [configCupom, setConfigCupom] = useState(null);
  
  const buscaInputRef = useRef(null);

  useEffect(() => {
    loadProdutos();
    loadConfiguracoes();
    buscaInputRef.current?.focus();
  }, []);

  useEffect(() => {
    filtrarProdutos();
  }, [busca, produtos]);

  const loadProdutos = async () => {
    try {
      const data = await produtoService.getAll();
      setProdutos(data);
      console.log('Produtos carregados:', data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
    }
  };

  const loadConfiguracoes = async () => {
    try {
      const config = await configuracaoService.getEmpresaConfig();
      setConfigCupom(config.cupom);
      console.log('📋 Configurações de cupom:', config.cupom);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const filtrarProdutos = () => {
    if (!busca.trim()) {
      setProdutosFiltrados([]);
      setMostrarProdutos(false);
      return;
    }

    const termo = busca.toLowerCase();
    const filtrados = produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        p.codigo_barras?.includes(termo)
    );

    console.log('🔍 Busca:', busca);
    console.log('📦 Produtos filtrados:', filtrados);
    console.log('👁️ Mostrar lista:', true);

    setProdutosFiltrados(filtrados);
    setMostrarProdutos(true);
  };

  const adicionarAoCarrinho = (produto) => {
    console.log('➕ Adicionando ao carrinho:', produto);
    
    const itemExistente = carrinho.find((item) => item.id === produto.id);

    if (itemExistente) {
      setCarrinho(
        carrinho.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
    }

    setBusca('');
    setMostrarProdutos(false);
    setTimeout(() => {
      buscaInputRef.current?.focus();
    }, 100);
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho(carrinho.filter((item) => item.id !== produtoId));
  };

  const alterarQuantidade = (produtoId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }

    setCarrinho(
      carrinho.map((item) =>
        item.id === produtoId
          ? { ...item, quantidade: parseInt(novaQuantidade) }
          : item
      )
    );
  };

  const calcularSubtotal = () => {
    return carrinho.reduce(
      (acc, item) => acc + item.preco_venda * item.quantidade,
      0
    );
  };

  const calcularTotal = () => {
    return calcularSubtotal() - desconto;
  };

  const calcularTroco = () => {
    if (formaPagamento !== 'dinheiro') return 0;
    const valor = parseFloat(valorPago) || 0;
    return Math.max(0, valor - calcularTotal());
  };

  const limparVenda = () => {
    setCarrinho([]);
    setDesconto(0);
    setFormaPagamento('dinheiro');
    setValorPago('');
    setFinalizando(false);
    setBusca('');
    setTimeout(() => {
      buscaInputRef.current?.focus();
    }, 100);
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('Adicione produtos ao carrinho');
      return;
    }

    if (formaPagamento === 'dinheiro') {
      const valor = parseFloat(valorPago) || 0;
      if (valor < calcularTotal()) {
        alert('Valor pago insuficiente');
        return;
      }
    }

    setLoading(true);

    try {
      const vendaData = {
        itens: carrinho,
        forma_pagamento: formaPagamento,
        valor_pago: parseFloat(valorPago) || 0,
        desconto: desconto,
        observacoes: null,
      };

      console.log('📤 Enviando venda:', vendaData);
      const venda = await vendaService.create(vendaData);
      console.log('📥 Venda recebida:', venda);
      
      const total = parseFloat(venda.total) || 0;
      const troco = parseFloat(venda.troco) || 0;
      const valorPagoVenda = parseFloat(venda.valor_pago) || 0;
      
      let mensagem = `✅ Venda ${venda.numero_venda} finalizada com sucesso!\n\n`;
      mensagem += `Total: R$ ${total.toFixed(2)}\n`;
      
      if (formaPagamento === 'dinheiro') {
        mensagem += `Valor Pago: R$ ${valorPagoVenda.toFixed(2)}\n`;
        mensagem += `Troco: R$ ${troco.toFixed(2)}`;
      } else {
        mensagem += `Pagamento: ${formaPagamento.toUpperCase()}`;
      }
      
      alert(mensagem);
      
      // Verificar se impressão automática está ativada
      const imprimirAutomatico = configCupom?.impressao_automatica || false;
      
      if (imprimirAutomatico) {
        // Imprimir automaticamente
        setVendaFinalizadaId(venda.id);
        setMostrarCupom(true);
      } else {
        // Perguntar se deseja imprimir
        const imprimirCupom = window.confirm('Deseja imprimir o cupom?');
        if (imprimirCupom) {
          setVendaFinalizadaId(venda.id);
          setMostrarCupom(true);
        }
      }
      
      limparVenda();
      loadProdutos();
    } catch (error) {
      console.error('❌ Erro ao finalizar venda:', error);
      console.error('Detalhes:', error.response?.data);
      alert(error.response?.data?.error || 'Erro ao finalizar venda');
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

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        buscaInputRef.current?.focus();
      }
      if (e.key === 'F10') {
        e.preventDefault();
        if (carrinho.length > 0 && !finalizando) {
          setFinalizando(true);
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (finalizando) {
          setFinalizando(false);
        } else if (carrinho.length > 0) {
          if (window.confirm('Cancelar venda?')) {
            limparVenda();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [carrinho, finalizando]);

  return (
    <Layout>
      <div className="pdv-container">
        <div className="pdv-header">
          <h1>🛒 Caixa - PDV</h1>
          <div className="pdv-info">
            <span>🕐 {new Date().toLocaleTimeString('pt-BR')}</span>
            {configCupom && (
              <span className="config-badge">
                🖨️ {configCupom.numero_vias || 1} via{configCupom.numero_vias > 1 ? 's' : ''}
                {configCupom.impressao_automatica && ' | Auto'}
              </span>
            )}
          </div>
        </div>

        <div className="pdv-content">
          <div className="pdv-main">
            <Card className="allow-overflow">
              <div className="busca-produto">
                <Input
                  ref={buscaInputRef}
                  placeholder="🔍 Buscar produto (Nome ou Código de Barras) - F2"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  autoFocus
                />
                
                {console.log('Renderizando - mostrarProdutos:', mostrarProdutos, 'filtrados:', produtosFiltrados.length)}
                
                {mostrarProdutos && produtosFiltrados.length > 0 && (
                  <div className="produtos-lista">
                    {produtosFiltrados.map((produto) => (
                      <div
                        key={produto.id}
                        className="produto-item"
                        onClick={() => adicionarAoCarrinho(produto)}
                      >
                        <div className="produto-item-info">
                          <div className="produto-item-nome">{produto.nome}</div>
                          <div className="produto-item-codigo">
                            {produto.codigo_barras}
                          </div>
                        </div>
                        <div className="produto-item-preco">
                          {formatMoeda(produto.preco_venda)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mostrarProdutos && produtosFiltrados.length === 0 && (
                  <div className="produtos-lista">
                    <div className="produto-nao-encontrado">
                      ⚠️ Produto não encontrado
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Carrinho" className="carrinho-card">
              {carrinho.length === 0 ? (
                <div className="carrinho-vazio">
                  🛒 Carrinho vazio<br />
                  <small>Busque e adicione produtos</small>
                </div>
              ) : (
                <div className="carrinho-itens">
                  {carrinho.map((item) => (
                    <div key={item.id} className="carrinho-item">
                      <div className="item-info">
                        <div className="item-nome">{item.nome}</div>
                        <div className="item-preco">
                          {formatMoeda(item.preco_venda)} x
                        </div>
                      </div>
                      
                      <div className="item-controles">
                        <input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) =>
                            alterarQuantidade(item.id, e.target.value)
                          }
                          className="item-quantidade"
                        />
                        <div className="item-subtotal">
                          {formatMoeda(item.preco_venda * item.quantidade)}
                        </div>
                        <button
                          className="btn-remover"
                          onClick={() => removerDoCarrinho(item.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="pdv-sidebar">
            <Card className="totais-card">
              <div className="totais">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatMoeda(calcularSubtotal())}</span>
                </div>
                
                <div className="total-row desconto-row">
                  <span>Desconto:</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                    className="input-desconto"
                    placeholder="0,00"
                  />
                </div>

                <div className="total-divider"></div>

                <div className="total-row total-final">
                  <span>TOTAL:</span>
                  <span className="valor-total">
                    {formatMoeda(calcularTotal())}
                  </span>
                </div>
              </div>

              {carrinho.length > 0 && !finalizando && (
                <div className="acoes-venda">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={limparVenda}
                  >
                    Cancelar (ESC)
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setFinalizando(true)}
                  >
                    Finalizar (F10)
                  </Button>
                </div>
              )}

              {finalizando && (
                <div className="pagamento-form">
                  <h3>💳 Forma de Pagamento</h3>
                  
                  <div className="formas-pagamento">
                    <button
                      className={`forma-btn ${formaPagamento === 'dinheiro' ? 'active' : ''}`}
                      onClick={() => setFormaPagamento('dinheiro')}
                    >
                      💵 Dinheiro
                    </button>
                    <button
                      className={`forma-btn ${formaPagamento === 'debito' ? 'active' : ''}`}
                      onClick={() => setFormaPagamento('debito')}
                    >
                      💳 Débito
                    </button>
                    <button
                      className={`forma-btn ${formaPagamento === 'credito' ? 'active' : ''}`}
                      onClick={() => setFormaPagamento('credito')}
                    >
                      💳 Crédito
                    </button>
                    <button
                      className={`forma-btn ${formaPagamento === 'pix' ? 'active' : ''}`}
                      onClick={() => setFormaPagamento('pix')}
                    >
                      📱 PIX
                    </button>
                  </div>

                  {formaPagamento === 'dinheiro' && (
                    <>
                      <Input
                        label="Valor Pago"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={valorPago}
                        onChange={(e) => setValorPago(e.target.value)}
                        autoFocus
                      />
                      
                      {valorPago && (
                        <div className="troco-info">
                          <span>Troco:</span>
                          <span className="troco-valor">
                            {formatMoeda(calcularTroco())}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="acoes-finalizacao">
                    <Button
                      variant="outline"
                      onClick={() => setFinalizando(false)}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="success"
                      onClick={finalizarVenda}
                      loading={loading}
                      disabled={loading}
                    >
                      Confirmar Venda
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {mostrarCupom && vendaFinalizadaId && (
        <CupomModal
          vendaId={vendaFinalizadaId}
          numeroVias={configCupom?.numero_vias || 1}
          onClose={() => {
            setMostrarCupom(false);
            setVendaFinalizadaId(null);
          }}
        />
      )}
    </Layout>
  );
};

export default PdvPage;