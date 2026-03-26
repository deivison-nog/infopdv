import React, { useState, useEffect, useRef } from 'react';
import Button from '../Common/Button';
import CupomTermico from './CupomTermico';
import vendaService from '../../services/venda.service';
import './CupomModal.css';

const CupomModal = ({ vendaId, numeroVias = 1, onClose }) => {
  const [cupom, setCupom] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // CONTADOR DE IMPRESSÕES
  const printCountRef = useRef(0);

  console.log('🔵 CupomModal renderizado - vendaId:', vendaId, 'numeroVias:', numeroVias);

  useEffect(() => {
    loadCupom();
  }, [vendaId]);

  const loadCupom = async () => {
    try {
      setLoading(true);
      console.log('📡 Buscando cupom da venda:', vendaId);
      const data = await vendaService.getCupom(vendaId);
      console.log('📄 Dados do cupom recebidos:', data);
      setCupom(data);
    } catch (error) {
      console.error('❌ Erro ao carregar cupom:', error);
      alert('Erro ao carregar cupom');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    printCountRef.current += 1;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖨️ BOTÃO IMPRIMIR CLICADO');
    console.log('🔢 CHAMADA Nº:', printCountRef.current);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Número de vias configurado:', numeroVias);
    console.log('🆔 Venda ID:', vendaId);
    
    // Verificar quantos cupons existem no DOM
    const cupons = document.querySelectorAll('.cupom-termico');
    console.log('📄 Elementos .cupom-termico encontrados no DOM:', cupons.length);
    
    if (cupons.length > 1) {
      console.error('⚠️ PROBLEMA DETECTADO: Há', cupons.length, 'cupons no DOM!');
      console.error('Deveria haver apenas 1 cupom!');
      cupons.forEach((cupom, index) => {
        console.log(`Cupom ${index + 1}:`, cupom);
      });
    } else {
      console.log('✅ OK: Apenas 1 cupom no DOM');
    }
    
    // Verificar quantos modais existem
    const modais = document.querySelectorAll('.cupom-modal');
    console.log('🪟 Modais .cupom-modal encontrados:', modais.length);
    
    if (modais.length > 1) {
      console.error('⚠️ PROBLEMA DETECTADO: Há', modais.length, 'modais abertos!');
    } else {
      console.log('✅ OK: Apenas 1 modal aberto');
    }
    
    // Verificar configurações do cupom
    if (cupom) {
      console.log('📋 Configurações do cupom:');
      console.log('  - Empresa:', cupom.empresa?.nome);
      console.log('  - Número de vias (backend):', cupom.cupom?.numero_vias);
      console.log('  - Impressão automática:', cupom.cupom?.impressao_automatica);
      console.log('  - Total de itens:', cupom.venda?.itens?.length);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖨️ EXECUTANDO window.print()...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // ANTES DE IMPRIMIR - Adicionar marca única
    const timestamp = Date.now();
    console.log('⏰ Timestamp desta impressão:', timestamp);
    document.body.setAttribute('data-print-id', timestamp);
    
    // Executar impressão
    window.print();
    
    console.log('✅ window.print() EXECUTADO');
    console.log('🔢 Total de vezes que handlePrint foi chamado:', printCountRef.current);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cupom-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header no-print">
          <h2>🖨️ Visualizar Cupom</h2>
          {numeroVias > 1 && (
            <span className="vias-badge">{numeroVias} vias</span>
          )}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body cupom-modal-body">
          {loading ? (
            <div className="loading-state no-print">Carregando cupom...</div>
          ) : (
            <div className="cupom-preview">
              <CupomTermico cupom={cupom} />
            </div>
          )}
        </div>

        <div className="modal-footer no-print">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePrint} 
            disabled={loading}
          >
            🖨️ Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CupomModal;