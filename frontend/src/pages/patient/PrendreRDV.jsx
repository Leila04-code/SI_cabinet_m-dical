// src/pages/patient/PrendreRDV.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../../services/api';
import authService from '../../services/authService';

function PrendreRDV() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [activeStep, setActiveStep] = useState(0);
  const [medecins, setMedecins] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [selection, setSelection] = useState({
    medecin: null,
    date: '',
    creneau: null
  });

  const steps = ['Choisir un médecin', 'Choisir la date', 'Choisir l\'heure', 'Confirmation'];

  useEffect(() => {
    fetchMedecins();
  }, []);

  const fetchMedecins = async () => {
    try {
      setLoading(true);
      const response = await api.get('http://127.0.0.1:8000/api/medecins/');
      setMedecins(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des médecins');
      setLoading(false);
    }
  };

  const fetchCreneaux = async (medecinId, date) => {
    try {
      setLoading(true);
      const response = await api.get(
        `http://127.0.0.1:8000/api/creneaux/?medecin=${medecinId}&date=${date}&libre=true`
      );
      setCreneaux(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des créneaux');
      setLoading(false);
    }
  };

  const handleMedecinSelect = (medecin) => {
    setSelection({ ...selection, medecin, date: '', creneau: null });
    setActiveStep(1);
  };

  const handleDateSelect = (date) => {
    setSelection({ ...selection, date, creneau: null });
    fetchCreneaux(selection.medecin.id_med, date);
    setActiveStep(2);
  };

  const handleCreneauSelect = (creneau) => {
    setSelection({ ...selection, creneau });
    setActiveStep(3);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      // Récupérer l'ID du patient à partir du CIN
      const patientsResponse = await api.get(`http://127.0.0.1:8000/api/patients/?cin=${user.cin}`);
      
      if (!patientsResponse.data || patientsResponse.data.length === 0) {
        setError('Patient introuvable. Veuillez contacter l\'accueil.');
        setLoading(false);
        return;
      }
      
      const patientId = patientsResponse.data[0].id_patient;

      // Créer le RDV
      await api.post('http://127.0.0.1:8000/api/rdvs/', {
        patient: patientId,
        medecin: selection.medecin.id_med,
        creneau: selection.creneau.id
      });

      setSuccess(true);
      setLoading(false);
      
      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/dashboard/patient');
      }, 2000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.error || 'Erreur lors de la prise de rendez-vous. Veuillez réessayer.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 2) {
      setCreneaux([]);
    }
    setActiveStep((prev) => prev - 1);
  };

  // Générer la date minimum (demain)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Générer la date maximum (30 jours)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard/patient')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Prendre un Rendez-vous
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircleIcon />}>
            <Typography variant="h6">✅ Rendez-vous confirmé !</Typography>
            <Typography>Redirection vers votre dashboard...</Typography>
          </Alert>
        )}

        {/* Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Step 0: Choisir un médecin */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              👨‍⚕️ Choisissez votre médecin
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : medecins.length === 0 ? (
              <Alert severity="warning">
                Aucun médecin disponible pour le moment.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {medecins.map((medecin) => (
                  <Grid item xs={12} sm={6} md={4} key={medecin.id_med}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: 6
                        }
                      }}
                      onClick={() => handleMedecinSelect(medecin)}
                    >
                      <CardContent>
                        <LocalHospitalIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Dr {medecin.nom_med} {medecin.prenom_med}
                        </Typography>
                        <Chip
                          label={medecin.specialite_med}
                          color="primary"
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                      <CardActions>
                        <Button size="small" fullWidth>
                          Choisir ce médecin
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Step 1: Choisir la date */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              📅 Choisissez une date
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Médecin sélectionné :
                </Typography>
                <Typography variant="h6">
                  Dr {selection.medecin?.nom_med} {selection.medecin?.prenom_med}
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="date"
                label="Date du rendez-vous"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: getMinDate(),
                  max: getMaxDate()
                }}
                value={selection.date}
                onChange={(e) => handleDateSelect(e.target.value)}
                helperText="Sélectionnez une date entre demain et 30 jours"
              />
            </Paper>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button onClick={handleBack} variant="outlined">
                Retour
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Choisir l'heure */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              🕐 Choisissez un horaire
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Médecin</Typography>
                  <Typography variant="h6">
                    Dr {selection.medecin?.nom_med} {selection.medecin?.prenom_med}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="h6">
                    {new Date(selection.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Chargement des créneaux disponibles...</Typography>
              </Box>
            ) : creneaux.length === 0 ? (
              <Alert severity="warning">
                Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {creneaux.map((creneau) => (
                  <Grid item xs={6} sm={4} md={3} key={creneau.id}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<AccessTimeIcon />}
                      onClick={() => handleCreneauSelect(creneau)}
                      sx={{ 
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white'
                        }
                      }}
                    >
                      {creneau.heure_debut}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button onClick={handleBack} variant="outlined">
                Retour
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              ✅ Confirmation de votre rendez-vous
            </Typography>
            <Paper sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Médecin
                  </Typography>
                  <Typography variant="h6">
                    Dr {selection.medecin?.nom_med} {selection.medecin?.prenom_med}
                  </Typography>
                  <Chip
                    label={selection.medecin?.specialite_med}
                    size="small"
                    color="primary"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <CalendarMonthIcon color="primary" />
                    <Typography variant="h6">
                      {new Date(selection.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Heure
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <AccessTimeIcon color="secondary" />
                    <Typography variant="h6">
                      {selection.creneau?.heure_debut}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                Veuillez vérifier vos informations avant de confirmer le rendez-vous.
              </Alert>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                onClick={handleBack} 
                variant="outlined"
                disabled={loading}
              >
                Retour
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleConfirm}
                disabled={loading}
                sx={{ flexGrow: 1 }}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {loading ? 'Confirmation en cours...' : 'Confirmer le rendez-vous'}
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default PrendreRDV;