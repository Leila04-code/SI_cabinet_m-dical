import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';

function Actes() {
  const [actes, setActes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentActe, setCurrentActe] = useState(null);
  
  const [formData, setFormData] = useState({
    nom_acte: '',
    code_acte: '',
    prix_acte: '',
    description: ''
  });

  useEffect(() => {
    fetchActes();
  }, []);

  const fetchActes = async () => {
    try {
      const response = await api.get('actes/');
      setActes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des actes:', error);
      setLoading(false);
    }
  };

  const handleOpenForm = (acte = null) => {
    if (acte) {
      setEditMode(true);
      setCurrentActe(acte);
      setFormData({
        nom_acte: acte.nom_acte,
        code_acte: acte.code_acte,
        prix_acte: acte.prix_acte,
        description: acte.description || ''
      });
    } else {
      setEditMode(false);
      setCurrentActe(null);
      setFormData({
        nom_acte: '',
        code_acte: '',
        prix_acte: '',
        description: ''
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditMode(false);
    setCurrentActe(null);
    setFormData({
      nom_acte: '',
      code_acte: '',
      prix_acte: '',
      description: ''
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
      if (editMode) {
        await api.put(`actes/${currentActe.id_acte}/`, formData);
        alert('Acte modifié avec succès !');
      } else {
        await api.post('actes/', formData);
        alert('Acte créé avec succès !');
      }
      fetchActes();
      handleCloseForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'acte');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet acte ?')) {
      try {
        await api.delete(`actes/${id}/`);
        alert('Acte supprimé avec succès !');
        fetchActes();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'acte');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          💉 Liste des Actes Médicaux ({actes.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ backgroundColor: '#2196f3' }}
        >
          Nouvel Acte
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom de l'acte</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Prix (MAD)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucun acte trouvé
                </TableCell>
              </TableRow>
            ) : (
              actes.map((acte) => (
                <TableRow key={acte.id_acte} hover>
                  <TableCell>{acte.code_acte}</TableCell>
                  <TableCell>{acte.nom_acte}</TableCell>
                  <TableCell>{acte.prix_acte} MAD</TableCell>
                  <TableCell>{acte.description || '-'}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenForm(acte)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(acte.id_acte)}
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

      {/* Dialog de formulaire */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Modifier l\'acte médical' : 'Nouvel acte médical'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Code de l'acte"
                  name="code_acte"
                  value={formData.code_acte}
                  onChange={handleChange}
                  required
                  placeholder="Ex: ACT001"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Prix (MAD)"
                  name="prix_acte"
                  value={formData.prix_acte}
                  onChange={handleChange}
                  required
                  inputProps={{ min: 0, step: '0.01' }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de l'acte"
                  name="nom_acte"
                  value={formData.nom_acte}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Consultation générale"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description (optionnel)"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description détaillée de l'acte médical"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Actes;