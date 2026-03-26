import api from './api';

const authService = {
  // Registrar novo usuário
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Fazer login
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Fazer logout
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  // Obter usuário atual
  getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Verificar token
  async verifyToken() {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  },
};

export default authService;