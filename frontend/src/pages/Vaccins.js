import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function Vaccins() {
  const [vaccins, setVaccins] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ 
    nom_vacc: '', 
    description: '',
    date_recommandee: ''
  });

  useEffect(() => {
    fetchVaccins();
  }, []);

  const fetchVaccins = async () => {
    try {
      const response = await api.get('http://127.0.0.1:8000/api/vaccins/');
      setVaccins(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('http://127.0.0.1:8000/api/vaccins/', formData);
      fetchVaccins();
      setOpenForm(false);
      setFormData({ nom_vacc: '', description: '', date_recommandee: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer ce vaccin ?')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/vaccins/${id}/`);
        fetchVaccins();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          💉 Vaccins ({vaccins.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#4caf50' }}
        >
          Nouveau Vaccin
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom du vaccin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vaccins.map((vaccin) => (
              <TableRow key={vaccin.id_vacc} hover>
                <TableCell>{vaccin.id_vacc}</TableCell>
                <TableCell>{vaccin.nom_vacc}</TableCell>
                <TableCell>{vaccin.description || '-'}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(vaccin.id_vacc)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Vaccin</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du vaccin"
                  value={formData.nom_vacc}
                  onChange={(e) => setFormData({ ...formData, nom_vacc: e.target.value })}
                  required
                  placeholder="Ex: BCG, Hépatite B..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenForm(false)}>Annuler</Button>
            <Button type="submit" variant="contained">Ajouter</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Vaccins;