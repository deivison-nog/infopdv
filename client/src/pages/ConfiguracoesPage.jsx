import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import configuracaoService from '../services/configuracao.service';
import './ConfiguracoesPage.css';

const ConfiguracoesPage = () => {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('empresa');
  
  // Configurações da Empresa
  const [empresaNome, setEmpresaNome] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [empresaEndereco, setEmpresaEndereco] = useState('');
  const [empresaCidade, setEmpresaCidade] = useState('');
  const [empresaTelefone, setEmpresaTelefone] = useState('');
  const [empresaEmail, setEmpresaEmail] = useState('');
  const [empresaSite, setEmpresaSite] = useState('');

  // Configurações do Cupom
  const [cupomMensagemRodape, setCupomMensagemRodape] = useState('');
  const [cupomImpressaoAutomatica, setCupomImpressaoAutomatica] = useState(false);
  const [cupomNumeroVias, setCupomNumeroVias] = useState(1);

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const loadConfiguracoes = async () => {
    try {
      setLoading(true);
      const configs = await configuracaoService.getAll();
      
      configs.forEach(config => {
        switch (config.chave) {
          case 'empresa_nome':
            setEmpresaNome(config.valor);
            break;
          case 'empresa_cnpj':
            setEmpresaCnpj(config.valor);
            break;
          case 'empresa_endereco':
            setEmpresaEndereco(config.valor);
            break;
          case 'empresa_cidade':
            setEmpresaCidade(config.valor);
            break;
          case 'empresa_telefone':
            setEmpresaTelefone(config.valor);
            break;
          case 'empresa_email':
            setEmpresaEmail(config.valor);
            break;
          case 'empresa_site':
            setEmpresaSite(config.valor);
            break;
          case 'cupom_mensagem_rodape':
            setCupomMensagemRodape(config.valor);
            break;
          case 'cupom_impressao_automatica':
            setCupomImpressaoAutomatica(config.valor === 'true');
            break;
          case 'cupom_numero_vias':
            setCupomNumeroVias(parseInt(config.valor) || 1);
            break;
        }
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      alert('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      setSalvando(true);

      const configuracoes = [
        { chave: 'empresa_nome', valor: empresaNome },
        { chave: 'empresa_cnpj', valor: empresaCnpj },
        { chave: 'empresa_endereco', valor: empresaEndereco },
        { chave: 'empresa_cidade', valor: empresaCidade },
        { chave: 'empresa_telefone', valor: empresaTelefone },
        { chave: 'empresa_email', valor: empresaEmail },
        { chave: 'empresa_site', valor: empresaSite },
        { chave: 'cupom_mensagem_rodape', valor: cupomMensagemRodape },
        { chave: 'cupom_impressao_automatica', valor: cupomImpressaoAutomatica.toString() },
        { chave: 'cupom_numero_vias', valor: cupomNumeroVias.toString() },
      ];

      await configuracaoService.updateMany(configuracoes);
      alert('✅ Configurações salvas com sucesso!');
      loadConfiguracoes();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  const handleResetar = async () => {
    if (!window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      return;
    }

    try {
      setSalvando(true);
      await configuracaoService.reset();
      alert('✅ Configurações restauradas com sucesso!');
      loadConfiguracoes();
    } catch (error) {
      console.error('Erro ao resetar configurações:', error);
      alert('Erro ao resetar configurações');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>⚙️ Configurações do Sistema</h1>
          <p>Personalize as configurações da sua loja</p>
        </div>
        <div className="page-header-actions">
          <Button variant="outline" onClick={handleResetar} disabled={salvando}>
            🔄 Restaurar Padrão
          </Button>
          <Button variant="primary" onClick={handleSalvar} disabled={salvando} loading={salvando}>
            💾 Salvar Alterações
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Carregando configurações...</div>
      ) : (
        <>
          {/* Abas */}
          <div className="config-tabs">
            <button
              className={`tab-btn ${abaAtiva === 'empresa' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('empresa')}
            >
              🏢 Dados da Empresa
            </button>
            <button
              className={`tab-btn ${abaAtiva === 'cupom' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('cupom')}
            >
              🖨️ Configurações de Cupom
            </button>
            <button
              className={`tab-btn ${abaAtiva === 'sistema' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('sistema')}
            >
              🔧 Sistema
            </button>
          </div>

          {/* Conteúdo das Abas */}
          {abaAtiva === 'empresa' && (
            <Card title="🏢 Dados da Empresa">
              <div className="config-form">
                <div className="form-section">
                  <h3>Informações Básicas</h3>
                  <div className="form-grid">
                    <Input
                      label="Nome da Empresa"
                      placeholder="Ex: Minha Loja LTDA"
                      value={empresaNome}
                      onChange={(e) => setEmpresaNome(e.target.value)}
                    />
                    <Input
                      label="CNPJ"
                      placeholder="00.000.000/0001-00"
                      value={empresaCnpj}
                      onChange={(e) => setEmpresaCnpj(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Endereço</h3>
                  <div className="form-grid">
                    <Input
                      label="Endereço"
                      placeholder="Rua, Número"
                      value={empresaEndereco}
                      onChange={(e) => setEmpresaEndereco(e.target.value)}
                    />
                    <Input
                      label="Cidade / Estado"
                      placeholder="São Paulo - SP"
                      value={empresaCidade}
                      onChange={(e) => setEmpresaCidade(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contato</h3>
                  <div className="form-grid">
                    <Input
                      label="Telefone"
                      placeholder="(11) 1234-5678"
                      value={empresaTelefone}
                      onChange={(e) => setEmpresaTelefone(e.target.value)}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="contato@empresa.com.br"
                      value={empresaEmail}
                      onChange={(e) => setEmpresaEmail(e.target.value)}
                    />
                    <Input
                      label="Site"
                      placeholder="www.empresa.com.br"
                      value={empresaSite}
                      onChange={(e) => setEmpresaSite(e.target.value)}
                    />
                  </div>
                </div>

                <div className="config-info">
                  <div className="info-icon">ℹ️</div>
                  <div className="info-text">
                    <strong>Importante:</strong> Estas informações serão exibidas no cupom fiscal e em relatórios.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {abaAtiva === 'cupom' && (
            <Card title="🖨️ Configurações de Cupom">
              <div className="config-form">
                <div className="form-section">
                  <h3>Mensagem no Rodapé</h3>
                  <div className="input-group">
                    <label className="input-label">Mensagem personalizada</label>
                    <textarea
                      className="input textarea"
                      rows="4"
                      placeholder="Ex: OBRIGADO PELA PREFERÊNCIA!&#10;VOLTE SEMPRE!"
                      value={cupomMensagemRodape}
                      onChange={(e) => setCupomMensagemRodape(e.target.value)}
                    />
                    <small className="input-hint">
                      Use \n para quebra de linha (Enter)
                    </small>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Opções de Impressão</h3>
                  
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={cupomImpressaoAutomatica}
                        onChange={(e) => setCupomImpressaoAutomatica(e.target.checked)}
                      />
                      <span>Imprimir cupom automaticamente após finalizar venda</span>
                    </label>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Número de vias do cupom</label>
                    <select
                      className="input"
                      value={cupomNumeroVias}
                      onChange={(e) => setCupomNumeroVias(parseInt(e.target.value))}
                    >
                      <option value="1">1 via</option>
                      <option value="2">2 vias</option>
                      <option value="3">3 vias</option>
                    </select>
                  </div>
                </div>

                <div className="config-preview">
                  <h4>👁️ Prévia do Rodapé</h4>
                  <div className="preview-box">
                    {cupomMensagemRodape.split('\n').map((linha, index) => (
                      <div key={index}>{linha || '\u00A0'}</div>
                    ))}
                  </div>
                </div>

                <div className="config-info">
                  <div className="info-icon">ℹ️</div>
                  <div className="info-text">
                    <strong>Dica:</strong> Personalize a mensagem do rodapé com informações importantes como telefone para pedidos, horário de funcionamento, etc.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {abaAtiva === 'sistema' && (
            <Card title="🔧 Informações do Sistema">
              <div className="config-form">
                <div className="sistema-info">
                  <div className="sistema-item">
                    <div className="sistema-icon">📦</div>
                    <div className="sistema-content">
                      <div className="sistema-label">Versão do Sistema</div>
                      <div className="sistema-value">1.0.0</div>
                    </div>
                  </div>

                  <div className="sistema-item">
                    <div className="sistema-icon">💾</div>
                    <div className="sistema-content">
                      <div className="sistema-label">Banco de Dados</div>
                      <div className="sistema-value">MySQL (XAMPP)</div>
                    </div>
                  </div>

                  <div className="sistema-item">
                    <div className="sistema-icon">🌐</div>
                    <div className="sistema-content">
                      <div className="sistema-label">Servidor Backend</div>
                      <div className="sistema-value">http://localhost:3000</div>
                    </div>
                  </div>

                  <div className="sistema-item">
                    <div className="sistema-icon">⚛️</div>
                    <div className="sistema-content">
                      <div className="sistema-label">Frontend</div>
                      <div className="sistema-value">React + Vite</div>
                    </div>
                  </div>
                </div>

                <div className="sistema-acoes">
                  <h3>🛠️ Manutenção</h3>
                  <div className="acoes-grid">
                    <button className="acao-btn" onClick={() => window.location.reload()}>
                      <span className="acao-icon">🔄</span>
                      <span className="acao-label">Recarregar Sistema</span>
                    </button>
                    
                    <button className="acao-btn" onClick={() => {
                      localStorage.clear();
                      alert('Cache limpo! Recarregue a página.');
                    }}>
                      <span className="acao-icon">🗑️</span>
                      <span className="acao-label">Limpar Cache</span>
                    </button>
                  </div>
                </div>

                <div className="config-info">
                  <div className="info-icon">ℹ️</div>
                  <div className="info-text">
                    <strong>Info PDV</strong> - Sistema de Gestão e Vendas desenvolvido com React, Node.js e MySQL.
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </Layout>
  );
};

export default ConfiguracoesPage;