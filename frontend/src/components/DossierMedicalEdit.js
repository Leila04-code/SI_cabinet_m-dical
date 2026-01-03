import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Typography, Box,
  IconButton, Divider, Autocomplete, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function DossierMedicalEdit({ open, onClose, onSuccess, dossier }) {
  const [maladiesDisponibles, setMaladiesDisponibles] = useState([]);
  const [vaccinsDisponibles, setVaccinsDisponibles] = useState([]);
  const [allergiesDisponibles, setAllergiesDisponibles] = useState([]);
  
  const [maladiesActuelles, setMaladiesActuelles] = useState([]);
  const [vaccinsActuels, setVaccinsActuels] = useState([]);
  const [allergiesActuelles, setAllergiesActuelles] = useState([]);

  useEffect(() => {
    if (open && dossier) {
      fetchData();
      fetchDossierData();
    }
  }, [open, dossier]);

  const fetchData = async () => {
    try {
      const [maladiesRes, vaccinsRes, allergiesRes] = await Promise.all([
        api.get('http://127.0.0.1:8000/api/maladies/'),
        api.get('http://127.0.0.1:8000/api/vaccins/'),
        api.get('http://127.0.0.1:8000/api/allergies/')
      ]);
      
      setMaladiesDisponibles(maladiesRes.data);
      setVaccinsDisponibles(vaccinsRes.data);
      setAllergiesDisponibles(allergiesRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchDossierData = async () => {
    try {
      const [maladiesRes, vaccinsRes, allergiesRes] = await Promise.all([
        api.get(`http://127.0.0.1:8000/api/maladie-dossiers/?dossier=${dossier.id_dossier}`),
        api.get(`http://127.0.0.1:8000/api/vaccin-dossiers/?dossier=${dossier.id_dossier}`),
        api.get(`http://127.0.0.1:8000/api/allergie-dossiers/?dossier=${dossier.id_dossier}`)
      ]);
      
      setMaladiesActuelles(maladiesRes.data);
      setVaccinsActuels(vaccinsRes.data);
      setAllergiesActuelles(allergiesRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const ajouterMaladie = () => {
    setMaladiesActuelles([...maladiesActuelles, { maladie: null, duree_maladie_patient: '', isNew: true }]);
  };

  const supprimerMaladie = async (index, maladieId) => {
    if (maladieId) {
      await api.delete(`http://127.0.0.1:8000/api/maladie-dossiers/${maladieId}/`);
    }
    setMaladiesActuelles(maladiesActuelles.filter((_, i) => i !== index));
  };

  const handleMaladieChange = (index, field, value) => {
    const newMaladies = [...maladiesActuelles];
    newMaladies[index][field] = value;
    setMaladiesActuelles(newMaladies);
  };

  // Même logique pour vaccins et allergies...
  const ajouterVaccin = () => {
    setVaccinsActuels([...vaccinsActuels, { vaccin: null, date_vacc_patient: '', isNew: true }]);
  };

  const supprimerVaccin = async (index, vaccinId) => {
    if (vaccinId) {
      await api.delete(`http://127.0.0.1:8000/api/vaccin-dossiers/${vaccinId}/`);
    }
    setVaccinsActuels(vaccinsActuels.filter((_, i) => i !== index));
  };

  const handleVaccinChange = (index, field, value) => {
    const newVaccins = [...vaccinsActuels];
    newVaccins[index][field] = value;
    setVaccinsActuels(newVaccins);
  };

  const ajouterAllergie = () => {
    setAllergiesActuelles([...allergiesActuelles, { allergie: null, precautions_patient: '', isNew: true }]);
  };

  const supprimerAllergie = async (index, allergieId) => {
    if (allergieId) {
      await api.delete(`http://127.0.0.1:8000/api/allergie-dossiers/${allergieId}/`);
    }
    setAllergiesActuelles(allergiesActuelles.filter((_, i) => i !== index));
  };

  const handleAllergieChange = (index, field, value) => {
    const newAllergies = [...allergiesActuelles];
    newAllergies[index][field] = value;
    setAllergiesActuelles(newAllergies);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ajouter nouvelles maladies
      for (const maladie of maladiesActuelles.filter(m => m.isNew)) {
        let maladieId;
        
        if (typeof maladie.maladie === 'string') {
          const nouvelle = await api.post('http://127.0.0.1:8000/api/maladies/', { nom_malad: maladie.maladie });
          maladieId = nouvelle.data.id_maladie;
        } else if (maladie.maladie) {
          maladieId = maladie.maladie.id_maladie;
        }
        
        if (maladieId) {
          await api.post('http://127.0.0.1:8000/api/maladie-dossiers/', {
            dossier: dossier.id_dossier,
            maladie: maladieId,
            duree_maladie_patient: maladie.duree_maladie_patient
          });
        }
      }

      // Même logique pour vaccins et allergies...

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Modifier le Dossier Médical - {dossier?.patient_nom}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Même structure que DossierMedicalForm mais avec données pré-remplies */}
          
          {/* MALADIES */}
          <Typography variant="h6" sx={{ mb: 2 }}>🦠 Maladies</Typography>
          {maladiesActuelles.map((maladie, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip label={maladie.maladie_nom || maladie.maladie} />
              <TextField
                label="Durée"
                value={maladie.duree_maladie_patient}
                onChange={(e) => handleMaladieChange(index, 'duree_maladie_patient', e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton color="error" onClick={() => supprimerMaladie(index, maladie.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={ajouterMaladie}>
            Ajouter une maladie
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* VACCINS */}
          <Typography variant="h6" sx={{ mb: 2 }}>💉 Vaccins</Typography>
          {vaccinsActuels.map((vaccin, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip label={vaccin.vaccin_nom || vaccin.vaccin} />
              <TextField
                type="date"
                label="Date de vaccination"
                value={vaccin.date_vacc_patient}
                onChange={(e) => handleVaccinChange(index, 'date_vacc_patient', e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Date à laquelle le patient a été vacciné"
                sx={{ flex: 1 }}
              />
              <IconButton color="error" onClick={() => supprimerVaccin(index, vaccin.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={ajouterVaccin}>
            Ajouter un vaccin
          </Button>

          <Divider sx={{ my: 3 }} />

          {/* ALLERGIES */}
          <Typography variant="h6" sx={{ mb: 2 }}>⚠️ Allergies</Typography>
          {allergiesActuelles.map((allergie, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip label={allergie.allergie_nom || allergie.allergie} color="warning" />
              <TextField
                label="Précautions"
                value={allergie.precautions_patient}
                onChange={(e) => handleAllergieChange(index, 'precautions_patient', e.target.value)}
                sx={{ flex: 1 }}
              />
              <IconButton color="error" onClick={() => supprimerAllergie(index, allergie.id)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={ajouterAllergie} color="error">
            Ajouter une allergie
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">Enregistrer</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default DossierMedicalEdit;