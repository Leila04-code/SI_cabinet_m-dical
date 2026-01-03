// src/pages/RegisterMedecin.jsx
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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import api from '../services/api';

function RegisterMedecin() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Compte
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    // Personnel
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    // Professionnel
    specialite: '',
    numero_ordre: '', // Numéro d'ordre des médecins
    adresse_cabinet: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const steps = ['Informations du compte', 'Informations personnelles', 'Informations professionnelles'];

  const specialites = [
    'Généraliste',
    'Cardiologue',
    'Dermatologue',
    'Pédiatre',
    'Gynécologue',
    'ORL',
    'Ophtalmologue',
    'Psychiatre',
    'Chirurgien',
    'Radiologue',
    'Anesthésiste',
    'Autre'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.username || !formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
      if (formData.password !== formData.password_confirm) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Endpoint pour créer un compte médecin
      await api.post('http://127.0.0.1:8000/api/auth/register-medecin/', formData);
      
      alert('Inscription réussie ! Votre compte est en attente de validation par un administrateur. Vous recevrez un email de confirmation.');
      navigate('/login');
    } catch (err) {
      console.error('Erreur:', err);
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        setError(errorMessages);
      } else {
        setError('Erreur lors de l\'inscription');
      }
    } finally {
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
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        padding: 2
      }}
    >
      <Paper
        elevation={10}
        sx={{
          padding: 4,
          maxWidth: 700,
          width: '100%',
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <LocalHospitalIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
            Inscription Médecin
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rejoignez notre équipe médicale
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Step 1: Compte */}
          {activeStep === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email professionnel"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Mot de passe"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  helperText="Minimum 6 caractères"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmer le mot de passe"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2: Personnel */}
          {activeStep === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CIN"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                />
              </Grid>
            </Grid>
          )}

          {/* Step 3: Professionnel */}
          {activeStep === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Spécialité"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  required
                >
                  {specialites.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Numéro d'ordre des médecins"
                  name="numero_ordre"
                  value={formData.numero_ordre}
                  onChange={handleChange}
                  helperText="Pour vérification de votre inscription"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse du cabinet (optionnel)"
                  name="adresse_cabinet"
                  value={formData.adresse_cabinet}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Retour
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={<LocalHospitalIcon />}
                >
                  {loading ? 'Inscription...' : "S'inscrire"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Box>
        </form>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
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

export default RegisterMedecin;