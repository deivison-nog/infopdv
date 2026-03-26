import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import api from '../services/api';
import './ChangePasswordPage.css';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (formData.novaSenha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.novaSenha.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/change-password', {
        senhaAtual: formData.senhaAtual,
        novaSenha: formData.novaSenha,
      });
      
      setSuccess(response.data.message);
      
      // Limpar formulário
      setFormData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });

      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao alterar senha';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        
        <div className="page-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Voltar
          </button>
        </div>

        <div className="change-password-card">
          <div className="card-icon">🔒</div>
          
          <h2>Alterar Senha</h2>
          <p className="subtitle">Digite sua senha atual e a nova senha</p>

          <form onSubmit={handleSubmit} className="password-form">
            
            <Input
              label="Senha Atual"
              type="password"
              name="senhaAtual"
              placeholder="Digite sua senha atual"
              value={formData.senhaAtual}
              onChange={handleChange}
              required
              autoFocus
            />

            <Input
              label="Nova Senha"
              type="password"
              name="novaSenha"
              placeholder="Digite a nova senha (mín. 6 caracteres)"
              value={formData.novaSenha}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirmar Nova Senha"
              type="password"
              name="confirmarSenha"
              placeholder="Digite novamente a nova senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="message error-message">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="message success-message">
                ✅ {success}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Alterar Senha
            </Button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default ChangePasswordPage;