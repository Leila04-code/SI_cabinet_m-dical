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
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
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
  const [searchSpecialite, setSearchSpecialite] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [datesDisponibles, setDatesDisponibles] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
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
      
      // Filtrer les doublons basés sur id_med
      const uniqueMedecins = response.data.filter((medecin, index, self) =>
        index === self.findIndex((m) => m.id_med === medecin.id_med)
      );
      
      setMedecins(uniqueMedecins);
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

  const fetchDatesDisponibles = async (medecinId) => {
    try {
      setLoading(true);
      const response = await api.get(
        `http://127.0.0.1:8000/api/creneaux/?medecin=${medecinId}&libre=true`
      );
      
      // Extraire les dates uniques et les trier
      const dates = [...new Set(response.data.map(creneau => creneau.date))];
      setDatesDisponibles(dates);
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors du chargement des dates disponibles');
      setLoading(false);
    }
  };

  // Fonction pour obtenir toutes les spécialités uniques
  const getSpecialites = () => {
    const specialites = [...new Set(medecins.map(m => m.specialite_med))];
    return specialites.sort();
  };

  // Fonction pour filtrer les médecins
  const getFilteredMedecins = () => {
    let filtered = medecins;

    // Filtre par spécialité sélectionnée (chip)
    if (selectedSpecialite) {
      filtered = filtered.filter(m => m.specialite_med === selectedSpecialite);
    }
    // Sinon, filtre par recherche textuelle
    else if (searchSpecialite.trim()) {
      filtered = filtered.filter(m => 
        m.specialite_med.toLowerCase().includes(searchSpecialite.toLowerCase()) ||
        m.nom_med.toLowerCase().includes(searchSpecialite.toLowerCase()) ||
        m.prenom_med.toLowerCase().includes(searchSpecialite.toLowerCase())
      );
    }

    return filtered;
  };

  const handleMedecinSelect = (medecin) => {
    setSelection({ ...selection, medecin, date: '', creneau: null });
    fetchDatesDisponibles(medecin.id_med);
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

  const handleSpecialiteClick = (specialite) => {
    if (selectedSpecialite === specialite) {
      setSelectedSpecialite('');
    } else {
      setSelectedSpecialite(specialite);
      setSearchSpecialite('');
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      // Vérifier que le créneau est toujours disponible
      const creneauCheck = await api.get(
        `http://127.0.0.1:8000/api/creneaux/${selection.creneau.id}/`
      );
      
      if (!creneauCheck.data.libre) {
        setError('Désolé, ce créneau vient d\'être réservé par un autre patient. Veuillez en choisir un autre.');
        setLoading(false);
        // Retourner à l'étape de sélection des horaires
        setActiveStep(2);
        // Recharger les créneaux disponibles
        fetchCreneaux(selection.medecin.id_med, selection.date);
        return;
      }

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
      
      // Gérer les erreurs spécifiques
      if (err.response?.status === 400 && err.response?.data?.error) {
        setError(err.response.data.error);
        // Si le créneau n'est plus disponible, retourner à l'étape de sélection
        if (err.response.data.error.includes('disponible')) {
          setActiveStep(2);
          fetchCreneaux(selection.medecin.id_med, selection.date);
        }
      } else {
        setError('Erreur lors de la prise de rendez-vous. Veuillez réessayer.');
      }
      
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep === 2) {
      setCreneaux([]);
    }
    if (activeStep === 1) {
      setDatesDisponibles([]);
      setCurrentMonth(new Date());
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

  // Vérifier si une date est disponible
  const isDateDisponible = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return datesDisponibles.includes(dateStr);
  };

  // Vérifier si une date est dans le passé ou aujourd'hui
  const isDatePast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Générer les jours du calendrier
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Jours vides avant le début du mois
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const filteredMedecins = getFilteredMedecins();

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
            
            {/* Barre de recherche */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Rechercher par spécialité ou nom du médecin..."
                value={searchSpecialite}
                onChange={(e) => {
                  setSearchSpecialite(e.target.value);
                  setSelectedSpecialite('');
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {/* Filtres par spécialité */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Filtrer par spécialité :
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getSpecialites().map((specialite) => (
                    <Chip
                      key={specialite}
                      label={specialite}
                      onClick={() => handleSpecialiteClick(specialite)}
                      color={selectedSpecialite === specialite ? "primary" : "default"}
                      variant={selectedSpecialite === specialite ? "filled" : "outlined"}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: selectedSpecialite === specialite ? 'primary.dark' : 'action.hover'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : !searchSpecialite && !selectedSpecialite ? (
              <Alert severity="info" sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Recherchez un médecin
                </Typography>
                <Typography>
                  Utilisez la barre de recherche ci-dessus ou cliquez sur une spécialité pour afficher les médecins disponibles.
                </Typography>
              </Alert>
            ) : filteredMedecins.length === 0 ? (
              <Alert severity="warning">
                Aucun médecin trouvé avec ces critères de recherche.
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {filteredMedecins.length} médecin{filteredMedecins.length > 1 ? 's' : ''} trouvé{filteredMedecins.length > 1 ? 's' : ''}
                </Typography>
                <Grid container spacing={3}>
                  {filteredMedecins.map((medecin) => (
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
              </>
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Médecin sélectionné :
                </Typography>
                <Typography variant="h6">
                  Dr {selection.medecin?.nom_med} {selection.medecin?.prenom_med}
                </Typography>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Chargement du calendrier...</Typography>
                </Box>
              ) : (
                <>
                  {/* Navigation du calendrier */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <IconButton onClick={goToPreviousMonth}>
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">
                      {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </Typography>
                    <IconButton onClick={goToNextMonth}>
                      <ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />
                    </IconButton>
                  </Box>

                  {/* En-tête des jours */}
                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((jour) => (
                      <Grid item xs={12/7} key={jour}>
                        <Box sx={{ textAlign: 'center', fontWeight: 'bold', color: 'text.secondary', py: 1 }}>
                          {jour}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Grille des jours */}
                  <Grid container spacing={1}>
                    {generateCalendarDays().map((date, index) => {
                      if (!date) {
                        return <Grid item xs={12/7} key={`empty-${index}`}><Box sx={{ height: 60 }} /></Grid>;
                      }

                      const isDisponible = isDateDisponible(date);
                      const isPast = isDatePast(date);
                      const isSelected = selection.date === date.toISOString().split('T')[0];

                      return (
                        <Grid item xs={12/7} key={index}>
                          <Box
                            onClick={() => {
                              if (isDisponible && !isPast) {
                                handleDateSelect(date.toISOString().split('T')[0]);
                              }
                            }}
                            sx={{
                              height: 60,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                              cursor: isDisponible && !isPast ? 'pointer' : 'not-allowed',
                              backgroundColor: isSelected
                                ? 'primary.main'
                                : isDisponible && !isPast
                                ? '#4caf50'
                                : isPast
                                ? '#f5f5f5'
                                : 'transparent',
                              color: isSelected
                                ? 'white'
                                : isDisponible && !isPast
                                ? 'white'
                                : isPast
                                ? '#ccc'
                                : 'text.primary',
                              border: isDisponible && !isPast ? '2px solid #4caf50' : '1px solid #e0e0e0',
                              fontWeight: isSelected || isDisponible ? 'bold' : 'normal',
                              transition: 'all 0.2s',
                              '&:hover': isDisponible && !isPast ? {
                                backgroundColor: isSelected ? 'primary.dark' : '#45a049',
                                transform: 'scale(1.05)',
                                boxShadow: 2
                              } : {}
                            }}
                          >
                            {date.getDate()}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Légende */}
                  <Box sx={{ mt: 3, display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', borderRadius: 1 }} />
                      <Typography variant="body2">Disponible</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: 'primary.main', borderRadius: 1 }} />
                      <Typography variant="body2">Sélectionné</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 20, height: 20, backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 1 }} />
                      <Typography variant="body2">Non disponible</Typography>
                    </Box>
                  </Box>

                  {datesDisponibles.length === 0 && (
                    <Alert severity="warning" sx={{ mt: 3 }}>
                      Aucune date disponible pour ce médecin dans les prochains jours.
                    </Alert>
                  )}
                </>
              )}
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