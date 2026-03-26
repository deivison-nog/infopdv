import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = () => {
    navigate('/change-password');
    setShowUserMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span className="brand-icon">🅿️</span>
          <span className="brand-text">Info PDV</span>
          <span className="brand-subtitle">Sistema de Vendas</span>
        </div>

        {/* Menu Desktop */}
        <div className={`navbar-menu ${showMobileMenu ? 'mobile-active' : ''}`}>
          <button className="nav-link" onClick={() => navigate('/')}>
            🏠 Dashboard
          </button>
          <button className="nav-link" onClick={() => navigate('/produtos')}>
            📦 Produtos
          </button>
          <button className="nav-link" onClick={() => navigate('/vendas')}>
            💰 Vendas
          </button>
          <button className="nav-link" onClick={() => navigate('/vendas/historico')}>
            📊 Histórico
          </button>
          <button className="nav-link" onClick={() => navigate('/relatorios')}>
            📈 Relatórios
          </button>
          <button className="nav-link" onClick={() => navigate('/configuracoes')}>
            ⚙️ Configurações
          </button>
        </div>

        {/* Menu de Usuário */}
        <div className="navbar-user">
          <button
            className="user-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.nome?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.nome || 'Administrador'}</div>
              <div className="user-role">{user?.email}</div>
            </div>
            <span className="user-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-menu-name">{user?.nome}</div>
                <div className="user-menu-email">{user?.email}</div>
              </div>
              <div className="user-menu-divider"></div>
              <button className="user-menu-item" onClick={handleChangePassword}>
                🔑 Alterar Senha
              </button>
              <button className="user-menu-item" onClick={() => navigate('/configuracoes')}>
                ⚙️ Configurações
              </button>
              <div className="user-menu-divider"></div>
              <button className="user-menu-item logout" onClick={handleLogout}>
                🚪 Sair
              </button>
            </div>
          )}
        </div>

        {/* Botão Mobile */}
        <button
          className="mobile-menu-btn"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          ☰
        </button>
      </div>

      {/* Overlay para fechar menus */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="menu-overlay"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;