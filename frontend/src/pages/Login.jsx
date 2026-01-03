// src/pages/Login.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import authService from '../services/authService';
import api from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Appel API de connexion
      const response = await api.post('http://127.0.0.1:8000/api/auth/login/', {
        username: formData.username,
        password: formData.password
      });
      
      console.log('📥 Réponse:', response.data);
      
      // Sauvegarder avec authService (qui nettoie automatiquement)
      authService.login(response.data.user, response.data.token);
      
      console.log('✅ Connexion réussie pour:', response.data.user.first_name);
      
      // Redirection selon le rôle avec rechargement COMPLET
      const user = response.data.user;
      
      if (user.role === 'PATIENT') {
        window.location.href = '/dashboard/patient';
      } else if (user.role === 'MEDECIN') {
        window.location.href = '/dashboard/medecin';
      } else if (user.role === 'RECEPTIONNISTE' || user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/';
      }
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError(err.response?.data?.non_field_errors?.[0] || 'Identifiants incorrects');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          maxWidth: 450,
          width: '100%',
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            🏥 Cabinet Médical
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connectez-vous à votre espace
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<LoginIcon />}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none'
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Vous êtes patient ?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              Créer un compte
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
