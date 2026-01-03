import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function MedecinHoraires({ open, onClose, medecin }) {
  const [joursTravail, setJoursTravail] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [openAddJour, setOpenAddJour] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    heure_debut: '',
    heure_fin: ''
  });

  useEffect(() => {
    if (open && medecin) {
      fetchHoraires();
    }
  }, [open, medecin]);

  const fetchHoraires = async () => {
    try {
      const [joursRes, creneauxRes] = await Promise.all([
        api.get(`http://127.0.0.1:8000/api/jours-travail/?medecin=${medecin.id_med}`),
        api.get(`http://127.0.0.1:8000/api/creneaux/?medecin=${medecin.id_med}`)
      ]);
      
      setJoursTravail(joursRes.data);
      setCreneaux(creneauxRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des horaires:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('http://127.0.0.1:8000/api/jours-travail/', {
        medecin: medecin.id_med,
        ...formData
      });
      
      fetchHoraires();
      setOpenAddJour(false);
      setFormData({ date: '', heure_debut: '', heure_fin: '' });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajout du jour de travail');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce jour de travail ? Les créneaux associés seront aussi supprimés.')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/jours-travail/${id}/`);
        fetchHoraires();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const groupCreneauxByDate = () => {
    const grouped = {};
    creneaux.forEach(creneau => {
      if (!grouped[creneau.date]) {
        grouped[creneau.date] = [];
      }
      grouped[creneau.date].push(creneau);
    });
    return grouped;
  };

  const creneauxGroupes = groupCreneauxByDate();

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          📅 Horaires de travail - Dr {medecin?.nom_med} {medecin?.prenom_med}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => setOpenAddJour(true)}
              fullWidth
            >
              Ajouter un jour de travail
            </Button>
          </Box>

          {/* JOURS DE TRAVAIL */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Jours de travail programmés
          </Typography>
          
          {joursTravail.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Aucun jour de travail programmé
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Horaires</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Créneaux générés</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {joursTravail.map((jour) => (
                    <TableRow key={jour.id} hover>
                      <TableCell>{jour.date}</TableCell>
                      <TableCell>
                        {jour.heure_debut} - {jour.heure_fin}
                      </TableCell>
                      <TableCell>
                        {creneauxGroupes[jour.date]?.length || 0} créneaux
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(jour.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* CRÉNEAUX DÉTAILLÉS */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Créneaux de consultation
          </Typography>

          {Object.keys(creneauxGroupes).length === 0 ? (
            <Typography color="text.secondary">
              Aucun créneau disponible
            </Typography>
          ) : (
            Object.keys(creneauxGroupes).sort().map((date) => (
              <Box key={date} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                  📆 {date}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {creneauxGroupes[date].map((creneau) => (
                    <Chip
                      key={creneau.id}
                      label={`${creneau.heure_debut} - ${creneau.heure_fin}`}
                      color={creneau.libre ? 'success' : 'error'}
                      size="small"
                      variant={creneau.libre ? 'outlined' : 'filled'}
                    />
                  ))}
                </Box>
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG AJOUTER JOUR DE TRAVAIL */}
      <Dialog open={openAddJour} onClose={() => setOpenAddJour(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter un jour de travail</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddJour(false)}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              Créer et générer les créneaux
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default MedecinHoraires;