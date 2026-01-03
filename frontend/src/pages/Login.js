// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Avatar,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Person,
  Business,
  Visibility,
  VisibilityOff,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';

function Login() {
  const navigate = useNavigate();
  const { type } = useParams(); // 'patient' ou 'personnel'
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showForm, setShowForm] = useState(false);

  // Redirection si déjà connecté
  useEffect(() => {
    try {
      const userString = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      console.log('🔍 localStorage user:', userString);
      console.log('🔍 localStorage token:', token);
      
      // Vérifier si user est un JSON valide
      let user = null;
      if (userString) {
        try {
          user = JSON.parse(userString);
          console.log('✅ User parsé:', user);
        } catch (e) {
          console.error('❌ User n\'est pas un JSON valide:', userString);
          // Nettoyer les données corrompues
          localStorage.clear();
          sessionStorage.clear();
          setShowForm(true);
          return;
        }
      }
      
      // Seulement rediriger si user valide ET a un ID
      if (user && user.id && token) {
        console.log('🔄 Utilisateur valide détecté, redirection dans 1 seconde...');
        setTimeout(() => {
          redirectByRole(user);
        }, 1000);
      } else {
        console.log('🧹 Pas d\'utilisateur valide, affichage du formulaire');
        localStorage.clear();
        sessionStorage.clear();
        setShowForm(true);
      }
    } catch (error) {
      console.error('❌ Erreur dans useEffect:', error);
      localStorage.clear();
      sessionStorage.clear();
      setShowForm(true);
    }
  }, []);

  const redirectByRole = (user) => {
    console.log('🔄 Redirection pour:', user);
    
    // Vérifier si c'est un patient (a un CIN)
    if (user.cin) {
      console.log('👤 Redirection → Dashboard Patient');
      navigate('/dashboard/patient');
    } else if (user.role === 'MEDECIN') {
      console.log('👨‍⚕️ Redirection → Dashboard Médecin');
      navigate('/dashboard/medecin');
    } else if (user.role === 'RECEPTIONNISTE') {
      console.log('🏥 Redirection → Réception');
      navigate('/admin/reception');
    } else if (user.role === 'ADMIN') {
      console.log('👑 Redirection → Admin Dashboard');
      navigate('/admin/dashboard');
    } else {
      console.log('❓ Redirection par défaut → Dashboard Patient');
      navigate('/dashboard/patient');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vider le localStorage AVANT la connexion
    console.log('🧹 Nettoyage avant connexion');
    localStorage.clear();
    sessionStorage.clear();
    
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Tentative de connexion pour:', credentials.username);
      
      // Appel API Django (URL CORRIGÉE)
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
        username: credentials.username,
        password: credentials.password
      });

      console.log('✅ Réponse serveur:', response.data);

      const { user, token } = response.data;

      // Vérification du type de connexion (patient vs personnel)
      const isPatient = user.cin || user.role === 'PATIENT'; // A un CIN = patient
      
      if (type === 'patient' && !isPatient) {
        setError('Accès patient uniquement. Veuillez utiliser l\'espace personnel.');
        setLoading(false);
        return;
      }

      if (type === 'personnel' && isPatient) {
        setError('Accès réservé au personnel. Veuillez utiliser l\'espace patient.');
        setLoading(false);
        return;
      }

      // Sauvegarder dans localStorage via authService
      authService.login(user, token);

      console.log('✅ Connexion réussie, redirection...');

      // Redirection selon le rôle
      redirectByRole(user);
      
    } catch (err) {
      console.error('❌ Erreur login:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
      
      setLoading(false);
    }
  };

  const isPatientLogin = type === 'patient';
  const color = isPatientLogin ? 'primary' : 'secondary';
  const title = isPatientLogin ? 'Espace Patient' : 'Espace Personnel';
  const icon = isPatientLogin ? <Person sx={{ fontSize: 40 }} /> : <Business sx={{ fontSize: 40 }} />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: isPatientLogin 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            position: 'relative'
          }}
        >
          {/* Bouton retour */}
          <IconButton
            sx={{ position: 'absolute', top: 16, left: 16 }}
            onClick={() => navigate('/')}
          >
            <ArrowBack />
          </IconButton>

          {/* En-tête */}
          <Box textAlign="center" mb={4} mt={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: `${color}.main`,
                mx: 'auto',
                mb: 2
              }}
            >
              {icon}
            </Avatar>
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connectez-vous pour accéder à votre espace
            </Typography>
          </Box>

          {/* Message d'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Message de chargement si redirection */}
          {!showForm && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1">
                Redirection en cours...
              </Typography>
            </Box>
          )}

          {/* Formulaire */}
          {showForm && (
            <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Nom d'utilisateur"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              placeholder={isPatientLogin ? "Votre nom d'utilisateur" : "Identifiant"}
            />
            
            <TextField
              fullWidth
              label="Mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color={color}
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

            {/* Lien inscription (seulement pour patients) */}
            {isPatientLogin && (
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Pas encore de compte ?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    underline="hover"
                    color="primary"
                  >
                    Créer un compte
                  </Link>
                </Typography>
              </Box>
            )}

            {/* Lien mot de passe oublié */}
            <Box textAlign="center" mt={1}>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                underline="hover"
                color="text.secondary"
              >
                Mot de passe oublié ?
              </Link>
            </Box>
          </form>
          )}
        </Paper>

        {/* Footer */}
        <Box mt={3} textAlign="center">
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Cabinet Médical © 2025
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Login;