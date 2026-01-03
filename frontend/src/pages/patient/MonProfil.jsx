// src/pages/patient/MonProfil.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Divider,
  Button,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../services/api';
import authService from '../../services/authService';

function MonProfil() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    nom_patient: '',
    prenom_patient: '',
    telephone: '',
    adresse: '',
    situation_familiale: ''
  });

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const patientsResponse = await api.get(`http://127.0.0.1:8000/api/patients/?cin=${user.cin}`);
      
      if (!patientsResponse.data || patientsResponse.data.length === 0) {
        setError('Patient introuvable');
        setLoading(false);
        return;
      }
      
      const patientData = patientsResponse.data[0];
      setPatient(patientData);
      
      // Initialiser le formulaire
      setFormData({
        nom_patient: patientData.nom_patient || '',
        prenom_patient: patientData.prenom_patient || '',
        telephone: patientData.telephone || '',
        adresse: patientData.adresse || '',
        situation_familiale: patientData.situation_familiale || ''
      });
      
      // Charger l'organisme d'assurance
      try {
        const patientOrganismeResponse = await api.get(`http://127.0.0.1:8000/api/patient-organismes/?patient=${patientData.id_patient}`);
        
        if (patientOrganismeResponse.data && patientOrganismeResponse.data.length > 0) {
          const organismeData = patientOrganismeResponse.data[0];
          setPatient({
            ...patientData,
            organisme_nom: organismeData.organisme_nom,
            organisme_type: organismeData.organisme_type
          });
        }
      } catch (err) {
        console.warn('⚠️ Pas d\'organisme d\'assurance');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Erreur chargement profil:', err);
      setError(`Erreur lors du chargement: ${err.message}`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');
      
      await api.patch(`http://127.0.0.1:8000/api/patients/${patient.id_patient}/`, formData);
      
      setSuccess('Profil mis à jour avec succès !');
      setEditMode(false);
      fetchPatientData(); // Recharger les données
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('❌ Erreur mise à jour:', err);
      setError(`Erreur lors de la mise à jour: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError('');
    setSuccess('');
    // Réinitialiser le formulaire
    setFormData({
      nom_patient: patient.nom_patient || '',
      prenom_patient: patient.prenom_patient || '',
      telephone: patient.telephone || '',
      adresse: patient.adresse || '',
      situation_familiale: patient.situation_familiale || ''
    });
  };

  if (loading) {
    return (
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/patient')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>Mon Profil</Typography>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Chargement du profil...</Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/patient')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Mon Profil
          </Typography>
          {!editMode && (
            <Button
              color="inherit"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(true)}
            >
              Modifier
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
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

        {/* Carte profil */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {patient?.prenom_patient?.[0]}{patient?.nom_patient?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {patient?.prenom_patient} {patient?.nom_patient}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Patient
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Informations personnelles */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              Informations Personnelles
            </Typography>

            <Grid container spacing={3}>
              {editMode ? (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="nom_patient"
                      value={formData.nom_patient}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="prenom_patient"
                      value={formData.prenom_patient}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Situation familiale"
                      name="situation_familiale"
                      value={formData.situation_familiale}
                      onChange={handleChange}
                    />
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
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">CIN</Typography>
                    <Typography variant="h6">{patient?.cin}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Date de naissance</Typography>
                    <Typography variant="h6">
                      {patient?.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Sexe</Typography>
                    <Typography variant="h6">{patient?.sexe === 'M' ? 'Masculin' : 'Féminin'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Téléphone</Typography>
                    <Typography variant="h6">{patient?.telephone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Situation familiale</Typography>
                    <Typography variant="h6">{patient?.situation_familiale || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Organisme d'assurance</Typography>
                    <Typography variant="h6">
                      {patient?.organisme_nom ? `${patient.organisme_nom} (${patient.organisme_type})` : 'Aucun'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Adresse</Typography>
                    <Typography variant="h6">{patient?.adresse || '-'}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* Boutons d'action en mode édition */}
          {editMode && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            </Box>
          )}
        </Paper>

        {/* Informations compte */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Informations du Compte
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Nom d'utilisateur</Typography>
              <Typography variant="h6">{user?.username}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="h6">{user?.email || '-'}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default MonProfil;