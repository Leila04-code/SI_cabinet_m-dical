import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Maladies() {
  const [maladies, setMaladies] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({ nom_malad: '' });

  useEffect(() => {
    fetchMaladies();
  }, []);

  const fetchMaladies = async () => {
    try {
      const response = await api.get('http://127.0.0.1:8000/api/maladies/');
      setMaladies(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('http://127.0.0.1:8000/api/maladies/', formData);
      fetchMaladies();
      setOpenForm(false);
      setFormData({ nom_malad: '' });
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette maladie ?')) {
      try {
        await api.delete(`http://127.0.0.1:8000/api/maladies/${id}/`);
        fetchMaladies();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          🦠 Maladies ({maladies.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#e91e63' }}
        >
          Nouvelle Maladie
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom de la maladie</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {maladies.map((maladie) => (
              <TableRow key={maladie.id_maladie} hover>
                <TableCell>{maladie.id_maladie}</TableCell>
                <TableCell>{maladie.nom_malad}</TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(maladie.id_maladie)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Nouvelle Maladie</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nom de la maladie"
              value={formData.nom_malad}
              onChange={(e) => setFormData({ nom_malad: e.target.value })}
              required
              placeholder="Ex: Diabète, Hypertension..."
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

export default Maladies;