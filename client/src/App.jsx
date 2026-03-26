import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProdutosPage from './pages/ProdutosPage';
import PdvPage from './pages/PdvPage';
import VendasHistoricoPage from './pages/VendasHistoricoPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import './App.css';

// Componente de rota protegida
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Carregando...
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/produtos" 
            element={
              <PrivateRoute>
                <ProdutosPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/vendas" 
            element={
              <PrivateRoute>
                <PdvPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/vendas/historico" 
            element={
              <PrivateRoute>
                <VendasHistoricoPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/relatorios" 
            element={
              <PrivateRoute>
                <RelatoriosPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/configuracoes" 
            element={
              <PrivateRoute>
                <ConfiguracoesPage />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/change-password" 
            element={
              <PrivateRoute>
                <ChangePasswordPage />
              </PrivateRoute>
            } 
          />
          
          {/* Rota 404 - redireciona para dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;