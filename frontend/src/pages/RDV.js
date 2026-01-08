// src/pages/RDV.js
import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, Chip, IconButton,
  Menu, MenuItem
} from '@mui/material';
import { rdvService } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RDVForm from '../components/RDVForm';

function RDV() {
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRDV, setSelectedRDV] = useState(null);

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

  const handleMenuOpen = (event, rdv) => {
    setAnchorEl(event.currentTarget);
    setSelectedRDV(rdv);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRDV(null);
  };

  const handleChangeStatut = async (action) => {
    try {
      switch(action) {
        case 'confirmer':
          await rdvService.confirmer(selectedRDV.id);
          break;
        case 'consultation':
          await rdvService.marquerEnConsultation(selectedRDV.id);
          break;
        case 'terminer':
          await rdvService.marquerTermine(selectedRDV.id);
          break;
        default:
          break;
      }
      handleMenuClose();
      fetchRdvs();
      alert('✅ Statut mis à jour');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const getStatutColor = (statut) => {
    switch(statut) {
      case 'RESERVE': return 'warning';
      case 'CONFIRME': return 'success';
      case 'EN_CONSULTATION': return 'primary';
      case 'TERMINE': return 'default';
      case 'ANNULE': return 'error';
      default: return 'default';
    }
  };

  const getStatutLabel = (statut) => {
    switch(statut) {
      case 'RESERVE': return 'En attente';
      case 'CONFIRME': return 'Confirmé';
      case 'EN_CONSULTATION': return 'En consultation';
      case 'TERMINE': return 'Terminé';
      case 'ANNULE': return 'Annulé';
      default: return statut || 'Inconnu';
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
                      label={getStatutLabel(rdv.statut)} 
                      color={getStatutColor(rdv.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuOpen(e, rdv)}
                    >
                      <MoreVertIcon />
                    </IconButton>
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

      {/* Menu contextuel pour changer le statut */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedRDV?.statut === 'RESERVE' && (
          <MenuItem onClick={() => handleChangeStatut('confirmer')}>
            ✅ Confirmer (Patient arrivé)
          </MenuItem>
        )}
        {selectedRDV?.statut === 'CONFIRME' && (
          <MenuItem onClick={() => handleChangeStatut('consultation')}>
            👨‍⚕️ Entrer en consultation
          </MenuItem>
        )}
        {selectedRDV?.statut === 'EN_CONSULTATION' && (
          <MenuItem onClick={() => handleChangeStatut('terminer')}>
            ✔️ Marquer comme terminé
          </MenuItem>
        )}
      </Menu>

      <RDVForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchRdvs}
      />
    </Box>
  );
}

export default RDV;