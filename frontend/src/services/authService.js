// src/services/authService.js
const authService = {
  login: (userData, token) => {
    console.log('🔑 AuthService - Connexion pour:', userData.first_name, userData.last_name);
    console.log('📋 CIN:', userData.cin);
    
    // NETTOYER
    localStorage.clear();
    sessionStorage.clear();
    
    // SAUVEGARDER IMMÉDIATEMENT (sans setTimeout)
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    
    console.log('✅ Données sauvegardées');
    console.log('✅ User vérifié:', JSON.parse(localStorage.getItem('user')).first_name);
  },

  logout: () => {
    console.log('🚪 AuthService - Déconnexion');
    localStorage.clear();
    sessionStorage.clear();
  },

  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authService;
