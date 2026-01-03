import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, MenuItem
} from '@mui/material';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

function Employes() {
  const [employes, setEmployes] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedEmploye, setSelectedEmploye] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom_empl: '',
    prenom_empl: '',
    cin_empl: '',
    date_naissance: '',
    telephone: '',
    role: 'RECEPTIONNISTE'
  });

  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      const response = await api.get('employes/');
      setEmployes(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedEmploye) {
        await api.put(`employes/${selectedEmploye.id_employe}/`, formData);
      } else {
        await api.post('employes/', formData);
      }
      fetchEmployes();
      setOpenForm(false);
      resetForm();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet employé ?')) {
      try {
        await api.delete(`employes/${id}/`);
        fetchEmployes();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleView = (employe) => {
    setSelectedEmploye(employe);
    setOpenView(true);
  };

  const handleEdit = (employe) => {
    setSelectedEmploye(employe);
    setFormData({
      nom_empl: employe.nom_empl,
      prenom_empl: employe.prenom_empl,
      cin_empl: employe.cin_empl,
      date_naissance: employe.date_naissance,
      telephone: employe.telephone,
      role: employe.role || 'RECEPTIONNISTE'
    });
    setIsEditing(true);
    setOpenForm(true);
  };

  const resetForm = () => {
    setFormData({
      nom_empl: '',
      prenom_empl: '',
      cin_empl: '',
      date_naissance: '',
      telephone: '',
      role: 'RECEPTIONNISTE'
    });
    setSelectedEmploye(null);
    setIsEditing(false);
  };

  const getRoleColor = (role) => {
    const colors = {
      'RECEPTIONNISTE': 'primary',
      'SECRETAIRE': 'secondary',
      'ADMIN': 'error',
      'INFIRMIER': 'success'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'RECEPTIONNISTE': 'Réceptionniste',
      'SECRETAIRE': 'Secrétaire Médicale',
      'ADMIN': 'Administrateur',
      'INFIRMIER': 'Infirmier(ère)'
    };
    return labels[role] || role;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          👥 Employés ({employes.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenForm(true);
          }}
        >
          Nouvel Employé
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom et Prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CIN</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rôle</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              employes.map((employe) => (
                <TableRow key={employe.id_employe} hover>
                  <TableCell>
                    <strong>{employe.nom_empl} {employe.prenom_empl}</strong>
                  </TableCell>
                  <TableCell>{employe.cin_empl}</TableCell>
                  <TableCell>{employe.telephone}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRoleLabel(employe.role)} 
                      color={getRoleColor(employe.role)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleView(employe)}
                      title="Voir les détails"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="warning" 
                      onClick={() => handleEdit(employe)}
                      title="Modifier"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDelete(employe.id_employe)}
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
          {isEditing ? 'Modifier l\'Employé' : 'Nouvel Employé'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  value={formData.nom_empl}
                  onChange={(e) => setFormData({ ...formData, nom_empl: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  value={formData.prenom_empl}
                  onChange={(e) => setFormData({ ...formData, prenom_empl: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CIN"
                  value={formData.cin_empl}
                  onChange={(e) => setFormData({ ...formData, cin_empl: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de naissance"
                  value={formData.date_naissance}
                  onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Rôle"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <MenuItem value="RECEPTIONNISTE">Réceptionniste</MenuItem>
                  <MenuItem value="SECRETAIRE">Secrétaire Médicale</MenuItem>
                  <MenuItem value="ADMIN">Administrateur</MenuItem>
                  <MenuItem value="INFIRMIER">Infirmier(ère)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setOpenForm(false); resetForm(); }}>Annuler</Button>
            <Button type="submit" variant="contained">
              {isEditing ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG VOIR DÉTAILS */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Détails de l'Employé
        </DialogTitle>
        <DialogContent>
          {selectedEmploye && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary">
                    {selectedEmploye.nom_empl} {selectedEmploye.prenom_empl}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">CIN</Typography>
                  <Typography variant="body1"><strong>{selectedEmploye.cin_empl}</strong></Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date de naissance</Typography>
                  <Typography variant="body1"><strong>{selectedEmploye.date_naissance}</strong></Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Téléphone</Typography>
                  <Typography variant="body1"><strong>{selectedEmploye.telephone}</strong></Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Rôle</Typography>
                  <Chip 
                    label={getRoleLabel(selectedEmploye.role)} 
                    color={getRoleColor(selectedEmploye.role)} 
                    size="small" 
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)} variant="contained">Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Employes;