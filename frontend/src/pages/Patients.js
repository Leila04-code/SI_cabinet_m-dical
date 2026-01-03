import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, TextField, IconButton
} from '@mui/material';
import { patientService } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PatientForm from '../components/PatientForm';

function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientService.getAll();
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des patients:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await patientService.delete(id);
        fetchPatients();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du patient');
      }
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedPatient(null);
  };

  const filteredPatients = patients.filter(patient =>
    patient.nom_patient.toLowerCase().includes(search.toLowerCase()) ||
    patient.prenom_patient.toLowerCase().includes(search.toLowerCase()) ||
    patient.cin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          👥 Liste des Patients ({patients.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#1976d2' }}
        >
          Nouveau Patient
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher un patient (nom, prénom, CIN)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />
          }}
        />
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Prénom</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>CIN</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sexe</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de naissance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun patient trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id_patient} hover>
                  <TableCell>{patient.nom_patient}</TableCell>
                  <TableCell>{patient.prenom_patient}</TableCell>
                  <TableCell>{patient.cin}</TableCell>
                  <TableCell>{patient.sexe}</TableCell>
                  <TableCell>{patient.date_naissance}</TableCell>
                  <TableCell>{patient.telephone}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleEdit(patient)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(patient.id_patient)}
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

      <PatientForm
        open={openForm}
        onClose={handleCloseForm}
        onSuccess={fetchPatients}
        patient={selectedPatient}
      />
    </Box>
  );
}

export default Patients;