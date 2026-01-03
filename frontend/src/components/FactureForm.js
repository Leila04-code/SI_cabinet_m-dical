import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, Typography, Box, Chip
} from '@mui/material';
import { factureService, consultationService } from '../services/api';
import api from '../services/api';

function FactureForm({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    consultation: '',
    date_fact: new Date().toISOString().split('T')[0],
    type_facture: 'CONSULTATION'
  });
  
  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [montantTotal, setMontantTotal] = useState(0);

  useEffect(() => {
    if (open) {
      fetchConsultations();
    }
  }, [open]);

  useEffect(() => {
    if (formData.consultation) {
      calculerMontantTotal();
    }
  }, [formData.consultation]);

  const fetchConsultations = async () => {
    try {
      const response = await consultationService.getAll();
      // Filtrer les consultations qui n'ont pas encore de facture
      const consultationsSansFact = response.data.filter(c => !c.a_facture);
      setConsultations(response.data); // On affiche toutes pour l'instant
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
    }
  };

  const calculerMontantTotal = async () => {
    try {
      const consultationRes = await api.get(`consultations/${formData.consultation}/`);
      const consultation = consultationRes.data;
      
      // Récupérer les actes médicaux de cette consultation
      const actesRes = await api.get(`consultation-actes/?consultation=${formData.consultation}`);
      const actes = actesRes.data;
      
      let total = consultation.prix_cons;
      
      actes.forEach(acte => {
        total += acte.prix_applique * acte.quantite;
      });
      
      setMontantTotal(total);
      setSelectedConsultation(consultation);
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
    }
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
      await factureService.create({
        ...formData,
        montant: montantTotal // On envoie le montant total calculé
      });
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
      alert('Erreur lors de la création de la facture');
    }
  };

  const resetForm = () => {
    setFormData({
      consultation: '',
      date_fact: new Date().toISOString().split('T')[0],
      type_facture: 'CONSULTATION'
    });
    setMontantTotal(0);
    setSelectedConsultation(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nouvelle Facture</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Consultation"
                name="consultation"
                value={formData.consultation}
                onChange={handleChange}
                required
                helperText="Sélectionnez une consultation pour générer la facture"
              >
                <MenuItem value="">Sélectionnez une consultation</MenuItem>
                {consultations.map((consultation) => (
                  <MenuItem key={consultation.id_cons} value={consultation.id_cons}>
                    {consultation.patient_nom} {consultation.patient_prenom} - {consultation.date_cons} - {consultation.prix_cons} MAD
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date de facture"
                name="date_fact"
                value={formData.date_fact}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Type de facture"
                name="type_facture"
                value={formData.type_facture}
                onChange={handleChange}
                required
              >
                <MenuItem value="CONSULTATION">Consultation</MenuItem>
                <MenuItem value="URGENCE">Urgence</MenuItem>
                <MenuItem value="SUIVI">Suivi</MenuItem>
                <MenuItem value="AUTRE">Autre</MenuItem>
              </TextField>
            </Grid>

            {selectedConsultation && (
              <Grid item xs={12}>
                <Box sx={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: 2, 
                  borderRadius: 2,
                  border: '1px solid #ddd'
                }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    Détails de la facture
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Patient:</strong> {selectedConsultation.patient_nom} {selectedConsultation.patient_prenom}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      <strong>Médecin:</strong> Dr {selectedConsultation.medecin_nom}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Prix consultation:</Typography>
                    <Typography variant="body2">{selectedConsultation.prix_cons} MAD</Typography>
                  </Box>
                  
                  {selectedConsultation.actes_list && selectedConsultation.actes_list.length > 0 && (
                    <>
                      <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                        <strong>Actes médicaux:</strong>
                      </Typography>
                      {selectedConsultation.actes_list.map((acte, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', ml: 2, mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            • {acte.acte_nom} {acte.quantite > 1 ? `(x${acte.quantite})` : ''}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {acte.prix_applique * acte.quantite} MAD
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 2, 
                    pt: 2, 
                    borderTop: '2px solid #1976d2'
                  }}>
                    <Typography variant="h6" color="primary">
                      <strong>MONTANT TOTAL:</strong>
                    </Typography>
                    <Chip 
                      label={`${montantTotal} MAD`}
                      color="primary"
                      sx={{ fontSize: '16px', fontWeight: 'bold', height: '32px' }}
                    />
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.consultation}
          >
            Créer la Facture
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default FactureForm;