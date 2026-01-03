import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, IconButton, Chip
} from '@mui/material';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';

function Ordonnances() {
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdonnances();
  }, []);

  const fetchOrdonnances = async () => {
    try {
      const response = await api.get('ordonnances/');
      setOrdonnances(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des ordonnances:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
      try {
        await api.delete(`ordonnances/${id}/`);
        fetchOrdonnances();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handlePrint = (ordonnance) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ordonnance</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1976d2; padding-bottom: 20px; }
            .info { margin: 20px 0; }
            .medicaments { margin-top: 30px; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏥 Cabinet Médical</h1>
            <h2>Ordonnance Médicale</h2>
          </div>
          <div class="info">
            <p><strong>Patient:</strong> ${ordonnance.patient_nom}</p>
            <p><strong>Date:</strong> ${ordonnance.date_ord}</p>
          </div>
          <div class="medicaments">
            <h3>Médicaments prescrits:</h3>
            <p>${ordonnance.medicaments}</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          💊 Ordonnances de Médicaments ({ordonnances.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#00bcd4' }}
        >
          Nouvelle Ordonnance
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Médicaments</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordonnances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucune ordonnance trouvée
                </TableCell>
              </TableRow>
            ) : (
              ordonnances.map((ordonnance) => (
                <TableRow key={ordonnance.id_ordonnance} hover>
                  <TableCell>
                    <Chip label={`#${ordonnance.id_ordonnance}`} color="info" size="small" />
                  </TableCell>
                  <TableCell>{ordonnance.patient_nom}</TableCell>
                  <TableCell>{ordonnance.date_ord}</TableCell>
                  <TableCell>
                    {ordonnance.medicaments.substring(0, 50)}...
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handlePrint(ordonnance)}
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(ordonnance.id_ordonnance)}
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
    </Box>
  );
}

export default Ordonnances;