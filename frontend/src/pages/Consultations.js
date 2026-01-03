import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton
} from '@mui/material';
import { consultationService } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConsultationForm from '../components/ConsultationForm';

function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await consultationService.getAll();
      setConsultations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette consultation ?')) {
      try {
        await consultationService.delete(id);
        fetchConsultations();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la consultation');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          🏥 Liste des Consultations ({consultations.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#9c27b0' }}
        >
          Nouvelle Consultation
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Médecin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Prix</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nb Actes</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune consultation trouvée
                </TableCell>
              </TableRow>
            ) : (
              consultations.map((consultation) => (
                <TableRow key={consultation.id_cons} hover>
                  <TableCell>{consultation.id_cons}</TableCell>
                  <TableCell>
                    {consultation.patient_nom} {consultation.patient_prenom}
                  </TableCell>
                  <TableCell>
                    Dr {consultation.medecin_nom}
                  </TableCell>
                  <TableCell>{consultation.date_cons}</TableCell>
                  <TableCell>{consultation.prix_cons} MAD</TableCell>
                  <TableCell>{consultation.actes_list?.length || 0}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(consultation.id_cons)}
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

      <ConsultationForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchConsultations}
      />
    </Box>
  );
}

export default Consultations;