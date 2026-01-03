import React, { useEffect, useState } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Button, Box, Chip, IconButton
} from '@mui/material';
import { factureService } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';
import FactureForm from '../components/FactureForm';

function Factures() {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchFactures();
  }, []);

  const fetchFactures = async () => {
    try {
      const response = await factureService.getAll();
      setFactures(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des factures:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        await factureService.delete(id);
        fetchFactures();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la facture');
      }
    }
  };

  const handlePrint = async (facture) => {
    try {
      const consultationResponse = await fetch(`http://127.0.0.1:8000/api/consultations/${facture.consultation}/`);
      const consultation = await consultationResponse.json();
      
      const actesResponse = await fetch(`http://127.0.0.1:8000/api/consultation-actes/?consultation=${facture.consultation}`);
      const actes = await actesResponse.json();
      
      let totalActes = 0;
      let lignesActes = '';
      
      if (actes.length > 0) {
        actes.forEach(acte => {
          const montantActe = acte.prix_applique * acte.quantite;
          totalActes += montantActe;
          lignesActes += `
            <tr>
              <td>${acte.acte_nom}${acte.quantite > 1 ? ` (x${acte.quantite})` : ''}</td>
              <td>${acte.prix_applique} MAD</td>
              <td>${acte.quantite}</td>
              <td>${montantActe} MAD</td>
            </tr>
          `;
        });
      }
      
      const montantConsultation = consultation.prix_cons;
      const montantTotal = montantConsultation + totalActes;
      
      const printWindow = window.open('', '', 'height=800,width=900');
      printWindow.document.write(`
        <html>
          <head>
            <title>Facture ${facture.id_facture}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Arial, sans-serif; 
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                margin-bottom: 40px;
                border-bottom: 3px solid #1976d2;
                padding-bottom: 20px;
              }
              .header h1 {
                color: #1976d2;
                margin: 10px 0;
              }
              .info { 
                margin: 30px 0;
                background-color: #f5f5f5;
                padding: 20px;
                border-radius: 8px;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin: 10px 0;
              }
              .info p { 
                margin: 8px 0;
                font-size: 14px;
              }
              .info strong {
                color: #333;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 30px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              th { 
                background-color: #1976d2;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: 600;
              }
              td { 
                border: 1px solid #ddd; 
                padding: 12px;
              }
              tr:nth-child(even) {
                background-color: #f9f9f9;
              }
              .total-section {
                margin-top: 30px;
                text-align: right;
              }
              .total-row {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                margin: 10px 0;
                font-size: 16px;
              }
              .total-row.grand-total {
                font-size: 20px;
                font-weight: bold;
                color: #1976d2;
                border-top: 2px solid #1976d2;
                padding-top: 15px;
                margin-top: 15px;
              }
              .total-label {
                margin-right: 30px;
                min-width: 200px;
              }
              .total-amount {
                min-width: 150px;
                text-align: right;
              }
              .footer {
                margin-top: 50px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🏥 Cabinet Médical</h1>
              <h2>Facture N° ${facture.id_facture}</h2>
            </div>
            
            <div class="info">
              <div class="info-row">
                <div>
                  <p><strong>Patient:</strong> ${facture.patient_nom} ${facture.patient_prenom}</p>
                  <p><strong>Date:</strong> ${new Date(facture.date_fact).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p><strong>Médecin:</strong> Dr ${facture.medecin_nom} ${facture.medecin_prenom}</p>
                  <p><strong>Type:</strong> ${facture.type_facture}</p>
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Prix unitaire</th>
                  <th>Quantité</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Consultation</strong></td>
                  <td>${montantConsultation} MAD</td>
                  <td>1</td>
                  <td>${montantConsultation} MAD</td>
                </tr>
                ${lignesActes}
              </tbody>
            </table>
            
            <div class="total-section">
              <div class="total-row">
                <div class="total-label">Consultation:</div>
                <div class="total-amount">${montantConsultation} MAD</div>
              </div>
              ${totalActes > 0 ? `
                <div class="total-row">
                  <div class="total-label">Actes médicaux:</div>
                  <div class="total-amount">${totalActes} MAD</div>
                </div>
              ` : ''}
              <div class="total-row grand-total">
                <div class="total-label">TOTAL À PAYER:</div>
                <div class="total-amount">${montantTotal} MAD</div>
              </div>
            </div>
            
            <div class="footer">
              <p>Merci de votre confiance</p>
              <p>Cette facture est générée automatiquement par le système</p>
            </div>
            
            <script>
              window.onload = function() { 
                window.print(); 
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      alert('Erreur lors de la génération de la facture');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          💰 Liste des Factures ({factures.length})
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenForm(true)}
          sx={{ backgroundColor: '#2e7d32' }}
        >
          Nouvelle Facture
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>N° Facture</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Patient</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Médecin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Montant Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune facture trouvée
                </TableCell>
              </TableRow>
            ) : (
              factures.map((facture) => (
                <TableRow key={facture.id_facture} hover>
                  <TableCell>
                    <Chip label={`#${facture.id_facture}`} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{facture.patient_nom} {facture.patient_prenom}</TableCell>
                  <TableCell>Dr {facture.medecin_nom} {facture.medecin_prenom}</TableCell>
                  <TableCell>{facture.date_fact}</TableCell>
                  <TableCell>{facture.type_facture}</TableCell>
                  <TableCell>
                    <strong>{facture.montant_calcule || facture.montant} MAD</strong>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handlePrint(facture)}
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(facture.id_facture)}
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

      <FactureForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={fetchFactures}
      />
    </Box>
  );
}

export default Factures;