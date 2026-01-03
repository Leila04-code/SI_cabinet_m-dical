import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, Chip, IconButton
} from '@mui/material';
import { rdvService } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RDVForm from '../components/RDVForm';

function RDV() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchRdvs();
  }, []);

  const fetchRdvs = async () => {
    try {
      const response = await rdvService.getAll();
      setRdvs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des RDV:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await rdvService.delete(id);
        fetchRdvs();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de l\'annulation du rendez-vous');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          📅 Liste des Rendez-vous ({rdvs.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#ff9800' }}
        >
          Nouveau RDV
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Médecin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Heure</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rdvs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun rendez-vous trouvé
                </TableCell>
              </TableRow>
            ) : (
              rdvs.map((rdv) => (
                <TableRow key={rdv.id} hover>
                  <TableCell>
                    {rdv.patient_nom} {rdv.patient_prenom}
                  </TableCell>
                  <TableCell>
                    Dr {rdv.medecin_nom} {rdv.medecin_prenom}
                  </TableCell>
                  <TableCell>
                    {rdv.creneau_details?.date || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {rdv.creneau_details?.heure_debut || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={rdv.creneau_details?.libre === false ? "Confirmé" : "En attente"} 
                      color={rdv.creneau_details?.libre === false ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(rdv.id)}
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

      <RDVForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchRdvs}
      />
    </Box>
  );
}

export default RDV;