// src/pages/patient/MesRendezVous.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import api from '../../services/api';
import authService from '../../services/authService';


function MesRendezVous() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog pour annulation
  const [openDialog, setOpenDialog] = useState(false);
  const [rdvToCancel, setRdvToCancel] = useState(null);

  useEffect(() => {
    fetchRdvs();
  }, []);

  const fetchRdvs = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'ID du patient
      const patientsResponse = await api.get(`http://127.0.0.1:8000/api/patients/?cin=${user.cin}`);
      
      if (!patientsResponse.data || patientsResponse.data.length === 0) {
        setError('Patient introuvable');
        setLoading(false);
        return;
      }
      
      const patientId = patientsResponse.data[0].id_patient;
      
      // Récupérer tous les RDV du patient
      const rdvsResponse = await api.get(`http://127.0.0.1:8000/api/rdvs/?patient=${patientId}`);
      
      setRdvs(rdvsResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des rendez-vous');
      setLoading(false);
    }
  };

  const handleCancelClick = (rdv) => {
    setRdvToCancel(rdv);
    setOpenDialog(true);
  };

  const handleCancelConfirm = async () => {
    try {
      // Supprimer le RDV
      await api.delete(`http://127.0.0.1:8000/api/rdvs/${rdvToCancel.id}/`);
      
      // Marquer le créneau comme libre
      await api.patch(`http://127.0.0.1:8000/api/creneaux/${rdvToCancel.creneau}/`, {
        libre: true
      });
      
      setSuccess('Rendez-vous annulé avec succès');
      setOpenDialog(false);
      setRdvToCancel(null);
      
      // Recharger les RDV
      fetchRdvs();
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de l\'annulation du rendez-vous');
      setOpenDialog(false);
    }
  };

  // Filtrer les RDV selon leur statut
  const today = new Date().toISOString().split('T')[0];
  
  const rdvsAVenir = rdvs.filter(rdv => {
    const rdvDate = rdv.creneau_details?.date || '';
    return rdvDate >= today;
  }).sort((a, b) => {
    const dateA = a.creneau_details?.date || '';
    const dateB = b.creneau_details?.date || '';
    return dateA.localeCompare(dateB);
  });

  const rdvsPasses = rdvs.filter(rdv => {
    const rdvDate = rdv.creneau_details?.date || '';
    return rdvDate < today;
  }).sort((a, b) => {
    const dateA = a.creneau_details?.date || '';
    const dateB = b.creneau_details?.date || '';
    return dateB.localeCompare(dateA);
  });

  const RDVCard = ({ rdv, isPast }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Médecin */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalHospitalIcon color="primary" />
              <Box>
                <Typography variant="h6" color="primary">
                  Dr {rdv.medecin_nom} {rdv.medecin_prenom}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {rdv.creneau_details?.medecin_nom || 'Spécialiste'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Date et Heure */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip
                icon={<CalendarMonthIcon />}
                label={new Date(rdv.creneau_details?.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                color="primary"
                size="small"
              />
              <Chip
                icon={<AccessTimeIcon />}
                label={`${rdv.creneau_details?.heure_debut || ''}`}
                color="secondary"
                size="small"
              />
            </Box>
          </Grid>

          {/* Actions */}
          <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
            {!isPast ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleCancelClick(rdv)}
              >
                Annuler
              </Button>
            ) : (
              <Chip
                icon={<CheckCircleIcon />}
                label="Effectué"
                color="success"
                variant="outlined"
              />
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

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
            Mes Rendez-vous
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        {/* Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={`À venir (${rdvsAVenir.length})`} 
              icon={<CalendarMonthIcon />} 
              iconPosition="start"
            />
            <Tab 
              label={`Passés (${rdvsPasses.length})`} 
              icon={<HistoryIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Contenu des tabs */}
        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Chargement...</Typography>
          </Paper>
        ) : (
          <Box>
            {/* Tab 0: RDV à venir */}
            {tabValue === 0 && (
              <Box>
                {rdvsAVenir.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <CalendarMonthIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      Aucun rendez-vous à venir
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/patient/prendre-rdv')}
                      sx={{ mt: 2 }}
                    >
                      Prendre un rendez-vous
                    </Button>
                  </Paper>
                ) : (
                  rdvsAVenir.map(rdv => (
                    <RDVCard key={rdv.id} rdv={rdv} isPast={false} />
                  ))
                )}
              </Box>
            )}

            {/* Tab 1: RDV passés */}
            {tabValue === 1 && (
              <Box>
                {rdvsPasses.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Aucun rendez-vous passé
                    </Typography>
                  </Paper>
                ) : (
                  rdvsPasses.map(rdv => (
                    <RDVCard key={rdv.id} rdv={rdv} isPast={true} />
                  ))
                )}
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* Dialog de confirmation d'annulation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir annuler ce rendez-vous ?
          </Typography>
          {rdvToCancel && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Médecin:</strong> Dr {rdvToCancel.medecin_nom} {rdvToCancel.medecin_prenom}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong> {new Date(rdvToCancel.creneau_details?.date).toLocaleDateString('fr-FR')}
              </Typography>
              <Typography variant="body2">
                <strong>Heure:</strong> {rdvToCancel.creneau_details?.heure_debut}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Non, garder
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MesRendezVous;