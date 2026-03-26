import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpar erro ao digitar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({
        email: formData.email,
        senha: formData.password // Backend espera 'senha'
      });
      
      // Redirecionar para dashboard
      navigate('/');
      
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao fazer login. Tente novamente.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        
        {/* Left Side - Info */}
        <div className="login-left">
          <div className="login-logo">
            <div className="logo-circle">
              <span>P</span>
            </div>
          </div>
          
          <h1>Info <span className="pdv-text">PDV</span></h1>
          <p className="subtitle">Sistema de Ponto de Venda</p>
          
          <div className="features">
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Funciona sem internet</span>
            </div>
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Sincronização automática</span>
            </div>
            <div className="feature-item">
              <span className="check-icon">✓</span>
              <span>Instalável como app</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-right">
          <div className="login-card">
            <div className="card-header">
              <h2>Bem-vindo!</h2>
              <p>Entre com suas credenciais para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              
              <Input
                label="E-mail"
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                icon="👤"
                required
                autoFocus
              />

              <Input
                label="Senha"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon="🔒"
                required
              />

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Entrar
              </Button>

            </form>
          </div>

          <div className="login-footer">
            <p>
              ℹ️ Primeiro acesso? Entre em contato com o administrador
            </p>
          </div>
        </div>
      </div>

      <div className="page-footer">
        <p>v1.0.0 | © 2026 PDV Offline</p>
      </div>
    </div>
  );
};

export default LoginPage;