import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem
} from '@mui/material';
import { medecinService } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MedecinHoraires from '../components/MedecinHoraires';

function Medecins() {
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [openHoraires, setOpenHoraires] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom_med: '',
    prenom_med: '',
    specialite_med: ''
  });

  const specialites = [
    'Généraliste',
    'Pédiatre',
    'Cardiologue',
    'Dermatologue',
    'Ophtalmologue',
    'ORL',
    'Gynécologue',
    'Psychiatre',
    'Radiologue',
    'Chirurgien',
    'Dentiste',
    'Gastro-Entérologue',
    'Neurologue',
    'Urologue',
    'Autre'
  ];

  useEffect(() => {
    fetchMedecins();
  }, []);

  const fetchMedecins = async () => {
    try {
      const response = await medecinService.getAll();
      setMedecins(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedMedecin) {
        await medecinService.update(selectedMedecin.id_med, formData);
      } else {
        await medecinService.create(formData);
      }
      fetchMedecins();
      setOpenForm(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce médecin ?')) {
      try {
        await medecinService.delete(id);
        fetchMedecins();
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleView = (medecin) => {
    setSelectedMedecin(medecin);
    setOpenView(true);
  };

  const handleEdit = (medecin) => {
    setSelectedMedecin(medecin);
    setFormData({
      nom_med: medecin.nom_med,
      prenom_med: medecin.prenom_med,
      specialite_med: medecin.specialite_med
    });
    setIsEditing(true);
    setOpenForm(true);
  };

  const handleViewHoraires = (medecin) => {
    setSelectedMedecin(medecin);
    setOpenHoraires(true);
  };

  const resetForm = () => {
    setFormData({
      nom_med: '',
      prenom_med: '',
      specialite_med: ''
    });
    setSelectedMedecin(null);
    setIsEditing(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          👨‍⚕️ Liste des Médecins ({medecins.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenForm(true);
          }}
          sx={{ backgroundColor: '#4caf50' }}
        >
          Nouveau Médecin
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom et Prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Spécialité</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medecins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Aucun médecin trouvé
                </TableCell>
              </TableRow>
            ) : (
              medecins.map((medecin) => (
                <TableRow key={medecin.id_med} hover>
                  <TableCell>
                    <strong>Dr {medecin.nom_med} {medecin.prenom_med}</strong>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={medecin.specialite_med} 
                      color="primary" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleView(medecin)}
                      title="Voir les détails"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="warning"
                      onClick={() => handleEdit(medecin)}
                      title="Modifier"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="info"
                      onClick={() => handleViewHoraires(medecin)}
                      title="Voir les horaires"
                    >
                      <ScheduleIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(medecin.id_med)}
                      title="Supprimer"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* FORMULAIRE AJOUT/MODIFICATION */}
      <Dialog open={openForm} onClose={() => { setOpenForm(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Modifier le Médecin' : 'Nouveau Médecin'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.nom_med}
                  onChange={(e) => setFormData({ ...formData, nom_med: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom_med}
                  onChange={(e) => setFormData({ ...formData, prenom_med: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Spécialité"
                  value={formData.specialite_med}
                  onChange={(e) => setFormData({ ...formData, specialite_med: e.target.value })}
                  required
                >
                  <MenuItem value="">Sélectionnez une spécialité</MenuItem>
                  {specialites.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenForm(false); resetForm(); }}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG VOIR DÉTAILS */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Détails du Médecin
        </DialogTitle>
        <DialogContent>
          {selectedMedecin && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" color="primary">
                    Dr {selectedMedecin.nom_med} {selectedMedecin.prenom_med}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Spécialité</Typography>
                  <Chip 
                    label={selectedMedecin.specialite_med} 
                    color="primary" 
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">ID Médecin</Typography>
                  <Typography variant="body1"><strong>#{selectedMedecin.id_med}</strong></Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)} variant="contained">Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG HORAIRES */}
      {selectedMedecin && (
        <MedecinHoraires
          open={openHoraires}
          onClose={() => setOpenHoraires(false)}
          medecin={selectedMedecin}
        />
      )}
    </Box>
  );
}

export default Medecins;