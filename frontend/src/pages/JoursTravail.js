import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  Grid, MenuItem, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../services/api';

function JoursTravail() {
  const [joursTravail, setJoursTravail] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [creneaux, setCreneaux] = useState({});
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedJour, setSelectedJour] = useState(null);
  const [formData, setFormData] = useState({
    medecin: '',
    date: '',
    heure_debut: '',
    heure_fin: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [joursRes, medecinsRes] = await Promise.all([
        api.get('http://127.0.0.1:8000/api/jours-travail/'),
        api.get('http://127.0.0.1:8000/api/medecins/')
      ]);
      
      setJoursTravail(joursRes.data);
      setMedecins(medecinsRes.data);
      
      // Charger les créneaux pour chaque jour de travail
      const creneauxPromises = joursRes.data.map(jour =>
        api.get(`http://127.0.0.1:8000/api/creneaux/?medecin=${jour.medecin}&date=${jour.date}`)
      );
      
      const creneauxResults = await Promise.all(creneauxPromises);
      const creneauxMap = {};
      joursRes.data.forEach((jour, index) => {
        const key = `${jour.medecin}-${jour.date}`;
        creneauxMap[key] = creneauxResults[index].data;
      });
      
      setCreneaux(creneauxMap);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Vérifier que l'heure de fin est après l'heure de début
      if (formData.heure_debut >= formData.heure_fin) {
        alert('L\'heure de fin doit être après l\'heure de début');
        return;
      }

      console.log('Données envoyées:', formData); // Pour debug
      
      if (isEditing && selectedJour) {
        await api.put(`http://127.0.0.1:8000/api/jours-travail/${selectedJour.id}/`, formData);
        alert('Jour de travail modifié avec succès !');
      } else {
        const response = await api.post('http://127.0.0.1:8000/api/jours-travail/', formData);
        console.log('Réponse du serveur:', response.data);
        alert('Jour de travail créé avec succès ! Les créneaux ont été générés automatiquement.');
      }
      fetchData();
      setOpenForm(false);
      resetForm();
    } catch (error) {
      console.error('Erreur complète:', error);
      console.error('Détails de la réponse:', error.response?.data);
      
      let errorMessage = 'Erreur lors de l\'enregistrement';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data, null, 2);
        } else {
          errorMessage = error.response.data;
        }
      }
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce jour de travail ? Tous les créneaux associés seront également supprimés.')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/jours-travail/${id}/`);
        alert('Jour de travail supprimé avec succès !');
        fetchData();
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (jour) => {
    setSelectedJour(jour);
    setFormData({
      medecin: jour.medecin,
      date: jour.date,
      heure_debut: jour.heure_debut,
      heure_fin: jour.heure_fin
    });
    setIsEditing(true);
    setOpenForm(true);
  };

  const resetForm = () => {
    setFormData({
      medecin: '',
      date: '',
      heure_debut: '',
      heure_fin: ''
    });
    setSelectedJour(null);
    setIsEditing(false);
  };

  const getMedecinInfo = (medecinId) => {
    const medecin = medecins.find(m => m.id_med === medecinId);
    return medecin ? `Dr ${medecin.nom_med} ${medecin.prenom_med}` : 'N/A';
  };

  const getCreneauxInfo = (medecinId, date) => {
    const key = `${medecinId}-${date}`;
    const creneauxList = creneaux[key] || [];
    const libres = creneauxList.filter(c => c.libre).length;
    const total = creneauxList.length;
    return { libres, total };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Grouper les jours de travail par médecin
  const groupedByMedecin = joursTravail.reduce((acc, jour) => {
    if (!acc[jour.medecin]) {
      acc[jour.medecin] = [];
    }
    acc[jour.medecin].push(jour);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          📅 Jours de Travail des Médecins ({joursTravail.length})
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
          Ajouter un Jour de Travail
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Note :</strong> Lors de l'ajout d'un jour de travail, des créneaux de 30 minutes sont automatiquement générés pour permettre la prise de rendez-vous.
      </Alert>

      {Object.keys(groupedByMedecin).length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Aucun jour de travail programmé
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Commencez par ajouter des jours de travail pour vos médecins
          </Typography>
        </Paper>
      ) : (
        Object.keys(groupedByMedecin).map(medecinId => (
          <Paper key={medecinId} sx={{ mb: 3, p: 2 }} elevation={3}>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              👨‍⚕️ {getMedecinInfo(parseInt(medecinId))}
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>📆 Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>🕐 Horaires</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>📊 Créneaux</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedByMedecin[medecinId]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map((jour) => {
                      const { libres, total } = getCreneauxInfo(jour.medecin, jour.date);
                      return (
                        <TableRow key={jour.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarMonthIcon fontSize="small" color="action" />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {jour.date}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(jour.date)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {jour.heure_debut} → {jour.heure_fin}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip 
                                label={`${total} créneaux`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip 
                                label={`${libres} libres`}
                                size="small"
                                color="success"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="warning"
                              onClick={() => handleEdit(jour)}
                              title="Modifier"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(jour.id)}
                              title="Supprimer"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}

      {/* FORMULAIRE AJOUT/MODIFICATION */}
      <Dialog open={openForm} onClose={() => { setOpenForm(false); resetForm(); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? '✏️ Modifier le Jour de Travail' : '➕ Nouveau Jour de Travail'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Médecin"
                  value={formData.medecin}
                  onChange={(e) => setFormData({ ...formData, medecin: e.target.value })}
                  required
                  disabled={isEditing}
                >
                  <MenuItem value="">Sélectionnez un médecin</MenuItem>
                  {medecins.map((medecin) => (
                    <MenuItem key={medecin.id_med} value={medecin.id_med}>
                      Dr {medecin.nom_med} {medecin.prenom_med} - {medecin.specialite_med}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                  helperText="Les créneaux de 30 minutes seront générés automatiquement"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Heure de début"
                  value={formData.heure_debut}
                  onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Heure de fin"
                  value={formData.heure_fin}
                  onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 2 }}>
              {isEditing 
                ? "⚠️ La modification des horaires recréera les créneaux. Les rendez-vous existants pourraient être affectés."
                : "✅ Des créneaux de consultation de 30 minutes seront créés automatiquement pour cette journée."}
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenForm(false); resetForm(); }}>
              Annuler
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Modifier' : 'Créer et Générer les Créneaux'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default JoursTravail;