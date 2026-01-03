import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Chip, Divider, List, ListItem, ListItemText
} from '@mui/material';
import api from '../services/api';

function DossierMedicalDetail({ open, onClose, dossier }) {
  const [maladies, setMaladies] = useState([]);
  const [vaccins, setVaccins] = useState([]);
  const [allergies, setAllergies] = useState([]);

  useEffect(() => {
    if (open && dossier) {
      fetchDetails();
    }
  }, [open, dossier]);

  const fetchDetails = async () => {
    try {
      const [maladiesRes, vaccinsRes, allergiesRes] = await Promise.all([
        api.get(`http://127.0.0.1:8000/api/maladie-dossiers/?dossier=${dossier.id_dossier}`),
        api.get(`http://127.0.0.1:8000/api/vaccin-dossiers/?dossier=${dossier.id_dossier}`),
        api.get(`http://127.0.0.1:8000/api/allergie-dossiers/?dossier=${dossier.id_dossier}`)
      ]);
      
      setMaladies(maladiesRes.data);
      setVaccins(vaccinsRes.data);
      setAllergies(allergiesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des détails:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        📋 Dossier Médical - {dossier?.patient_nom}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* MALADIES */}
          <Typography variant="h6" sx={{ mb: 2, color: '#e91e63' }}>
            🦠 Maladies / Antécédents
          </Typography>
          {maladies.length === 0 ? (
            <Typography color="text.secondary">Aucune maladie enregistrée</Typography>
          ) : (
            <List>
              {maladies.map((maladie, index) => (
                <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={<Chip label={maladie.maladie_nom} color="error" size="small" />}
                    secondary={maladie.duree_maladie_patient || 'Aucune remarque'}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 3 }} />

          {/* VACCINS */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
            💉 Vaccins
          </Typography>
          {vaccins.length === 0 ? (
            <Typography color="text.secondary">Aucun vaccin enregistré</Typography>
          ) : (
            <List>
              {vaccins.map((vaccin, index) => (
                <ListItem key={index} sx={{ bgcolor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={<Chip label={vaccin.vaccin_nom} color="success" size="small" />}
                    secondary={vaccin.date_vacc_patient ? `Date: ${vaccin.date_vacc_patient}` : 'Date non renseignée'}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ my: 3 }} />

          {/* ALLERGIES */}
          <Typography variant="h6" sx={{ mb: 2, color: '#ff9800' }}>
            ⚠️ Allergies
          </Typography>
          {allergies.length === 0 ? (
            <Typography color="text.secondary">Aucune allergie enregistrée</Typography>
          ) : (
            <List>
              {allergies.map((allergie, index) => (
                <ListItem key={index} sx={{ bgcolor: '#fff3e0', mb: 1, borderRadius: 1, border: '1px solid #ff9800' }}>
                  <ListItemText
                    primary={<Chip label={allergie.allergie_nom} color="warning" size="small" />}
                    secondary={allergie.precautions_patient || 'Aucune précaution spécifiée'}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DossierMedicalDetail;