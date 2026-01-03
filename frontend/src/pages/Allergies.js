import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function Allergies() {
  const [allergies, setAllergies] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ nom_allerg: '' });

  useEffect(() => {
    fetchAllergies();
  }, []);

  const fetchAllergies = async () => {
    try {
      const response = await api.get('http://127.0.0.1:8000/api/allergies/');
      setAllergies(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('http://127.0.0.1:8000/api/allergies/', formData);
      fetchAllergies();
      setOpenForm(false);
      setFormData({ nom_allerg: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette allergie ?')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/allergies/${id}/`);
        fetchAllergies();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          ⚠️ Allergies ({allergies.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#ff9800' }}
        >
          Nouvelle Allergie
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom de l'allergie</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allergies.map((allergie) => (
              <TableRow key={allergie.id_allerg} hover>
                <TableCell>{allergie.id_allerg}</TableCell>
                <TableCell>{allergie.nom_allerg}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(allergie.id_allerg)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Nouvelle Allergie</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nom de l'allergie"
              value={formData.nom_allerg}
              onChange={(e) => setFormData({ nom_allerg: e.target.value })}
              required
              placeholder="Ex: Pénicilline, Arachide, Pollen..."
            />
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

export default Allergies;