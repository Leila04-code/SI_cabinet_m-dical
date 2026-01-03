// src/pages/Register.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Grid,
  MenuItem,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    date_naissance: '',
    sexe: 'M',
    adresse: '',
    situation_familiale: 'Célibataire'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.password_confirm) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    // Vérifier la longueur du mot de passe
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Envoi des données d\'inscription:', formData);
      
      // Appel API d'inscription
      const response = await api.post('http://127.0.0.1:8000/api/auth/register/', formData);
      
      console.log('✅ Inscription réussie:', response.data);
      
      // Afficher le message de succès
      setSuccess(true);
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur d\'inscription:', err);
      console.error('❌ Réponse complète:', err.response?.data);
      
      // Afficher les erreurs de manière détaillée
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = '';
        
        // Parcourir toutes les erreurs
        Object.keys(errors).forEach(key => {
          const errorValue = errors[key];
          if (Array.isArray(errorValue)) {
            errorMessage += `${errorValue.join(', ')}\n`;
          } else if (typeof errorValue === 'object') {
            Object.keys(errorValue).forEach(subKey => {
              errorMessage += `${errorValue[subKey]}\n`;
            });
          } else {
            errorMessage += `${errorValue}\n`;
          }
        });
        
        setError(errorMessage || 'Erreur lors de l\'inscription');
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
      
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
          maxWidth: 800,
          width: '100%',
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            🏥 Inscription Patient
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez votre compte pour gérer vos rendez-vous en ligne
          </Typography>
        </Box>

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            ✅ Inscription réussie ! Redirection vers la page de connexion...
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Informations de compte */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Informations de compte
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
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
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                name="password_confirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={handleChange}
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
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        edge="end"
                      >
                        {showPasswordConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Informations personnelles */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Informations personnelles
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="CIN"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de naissance"
                name="date_naissance"
                type="date"
                value={formData.date_naissance}
                onChange={handleChange}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                required
              >
                <MenuItem value="M">Masculin</MenuItem>
                <MenuItem value="F">Féminin</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Situation familiale"
                name="situation_familiale"
                value={formData.situation_familiale}
                onChange={handleChange}
              >
                <MenuItem value="Célibataire">Célibataire</MenuItem>
                <MenuItem value="Marié(e)">Marié(e)</MenuItem>
                <MenuItem value="Divorcé(e)">Divorcé(e)</MenuItem>
                <MenuItem value="Veuf(ve)">Veuf(ve)</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={<HowToRegIcon />}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              fontSize: '1.1rem',
              textTransform: 'none'
            }}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </form>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Vous avez déjà un compte ?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
              sx={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              Se connecter
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;