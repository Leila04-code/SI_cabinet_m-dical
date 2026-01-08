// src/pages/medecin/MesHoraires.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Edit,
  AccessTime
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';

function MesHoraires() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const [medecin, setMedecin] = useState(null);
  const [joursTravail, setJoursTravail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedJour, setSelectedJour] = useState(null);
  
  const [formData, setFormData] = useState({
    date: '',
    heure_debut: '',
    heure_fin: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchMedecinData();
  }, []);

  const fetchMedecinData = async () => {
    try {
      setLoading(true);
      
      // Récupérer le médecin
      const medecinResponse = await api.get(`http://127.0.0.1:8000/api/medecins/?email=${user.email}`);
      const medecinData = medecinResponse.data[0];
      setMedecin(medecinData);
      
      if (medecinData) {
        // Récupérer les jours de travail
        const joursResponse = await api.get(`http://127.0.0.1:8000/api/jours-travail/?medecin=${medecinData.id_med}`);
        setJoursTravail(joursResponse.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      showSnackbar('Erreur lors du chargement', 'error');
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (jour = null) => {
    if (jour) {
      setEditMode(true);
      setSelectedJour(jour);
      setFormData({
        date: jour.date,
        heure_debut: jour.heure_debut,
        heure_fin: jour.heure_fin
      });
    } else {
      setEditMode(false);
      setSelectedJour(null);
      setFormData({
        date: '',
        heure_debut: '',
        heure_fin: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      date: '',
      heure_debut: '',
      heure_fin: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        medecin: medecin.id_med,
        date: formData.date,
        heure_debut: formData.heure_debut,
        heure_fin: formData.heure_fin
      };
      
      if (editMode && selectedJour) {
        // Modification
        await api.put(`http://127.0.0.1:8000/api/jours-travail/${selectedJour.id}/`, data);
        showSnackbar('Horaire modifié avec succès');
      } else {
        // Création
        const response = await api.post('http://127.0.0.1:8000/api/jours-travail/', data);
        showSnackbar(`Horaire créé ! ${response.data.creneaux_crees || 0} créneaux générés automatiquement`);
      }
      
      handleCloseDialog();
      fetchMedecinData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showSnackbar(error.response?.data?.error || 'Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce jour de travail ?')) {
      return;
    }
    
    try {
      await api.delete(`http://127.0.0.1:8000/api/jours-travail/${id}/`);
      showSnackbar('Jour de travail supprimé');
      fetchMedecinData();
    } catch (error) {
      console.error('Erreur suppression:', error);
      showSnackbar(error.response?.data?.error || 'Erreur lors de la suppression', 'error');
    }
  };

  const getJourSemaine = (date) => {
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[new Date(date).getDay()];
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard/medecin')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Gestion de mes horaires
          </Typography>
          <Button
            color="inherit"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un jour
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AccessTime sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Mes jours et heures de travail
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Les créneaux de 30 minutes sont générés automatiquement
              </Typography>
            </Box>
          </Box>

          {joursTravail.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              Aucun jour de travail défini. Cliquez sur "Ajouter un jour" pour commencer.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Jour</strong></TableCell>
                    <TableCell><strong>Heure début</strong></TableCell>
                    <TableCell><strong>Heure fin</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {joursTravail.map((jour) => (
                    <TableRow key={jour.id} hover>
                      <TableCell>{new Date(jour.date).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>
                        <Chip label={getJourSemaine(jour.date)} color="primary" size="small" />
                      </TableCell>
                      <TableCell>{jour.heure_debut}</TableCell>
                      <TableCell>{jour.heure_fin}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(jour)}
                          title="Modifier"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(jour.id)}
                          title="Supprimer"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Info box */}
        <Paper sx={{ p: 2, mt: 3, backgroundColor: '#e3f2fd' }}>
          <Typography variant="body2" color="primary">
            ℹ️ <strong>Important :</strong> Lorsque vous ajoutez un jour de travail, 
            des créneaux de 30 minutes sont automatiquement créés entre l'heure de début 
            et l'heure de fin. Les patients pourront ensuite prendre rendez-vous sur ces créneaux.
          </Typography>
        </Paper>
      </Container>

      {/* Dialog Ajouter/Modifier */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Modifier le jour de travail' : 'Ajouter un jour de travail'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="Sélectionnez le jour où vous souhaitez travailler"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Heure de début"
                  name="heure_debut"
                  value={formData.heure_debut}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="Ex: 08:00"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Heure de fin"
                  name="heure_fin"
                  value={formData.heure_fin}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  helperText="Ex: 18:00"
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  Des créneaux de 30 minutes seront automatiquement créés
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editMode ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MesHoraires;