import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton, Chip
} from '@mui/material';
import api from '../services/api';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DossierMedicalForm from '../components/DossierMedicalForm';
import DossierMedicalDetail from '../components/DossierMedicalDetail';
import DossierMedicalEdit from '../components/DossierMedicalEdit';

function DossiersMedicaux() {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);

  useEffect(() => {
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    try {
      const response = await api.get('dossiers/');
      setDossiers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier médical ?')) {
      try {
        await api.delete(`dossiers/${id}/`);
        fetchDossiers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du dossier');
      }
    }
  };

  const handleViewDetail = (dossier) => {
    setSelectedDossier(dossier);
    setOpenDetail(true);
  };

  const handleEdit = (dossier) => {
    setSelectedDossier(dossier);
    setOpenEdit(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          📋 Dossiers Médicaux ({dossiers.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#e91e63' }}
        >
          Nouveau Dossier
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dossiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucun dossier médical trouvé
                </TableCell>
              </TableRow>
            ) : (
              dossiers.map((dossier) => (
                <TableRow key={dossier.id_dossier} hover>
                  <TableCell>
                    <Chip label={`#${dossier.id_dossier}`} color="secondary" size="small" />
                  </TableCell>
                  <TableCell>{dossier.patient_nom} {dossier.patient_prenom}</TableCell>
                  <TableCell>
                    <Chip label="Actif" color="success" size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewDetail(dossier)}
                      title="Voir les détails"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="warning"
                      onClick={() => handleEdit(dossier)}
                      title="Modifier"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(dossier.id_dossier)}
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

      <DossierMedicalForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchDossiers}
      />

      {selectedDossier && (
        <>
          <DossierMedicalDetail
            open={openDetail}
            onClose={() => setOpenDetail(false)}
            dossier={selectedDossier}
          />
          
          <DossierMedicalEdit
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            onSuccess={fetchDossiers}
            dossier={selectedDossier}
          />
        </>
      )}
    </Box>
  );
}

export default DossiersMedicaux;