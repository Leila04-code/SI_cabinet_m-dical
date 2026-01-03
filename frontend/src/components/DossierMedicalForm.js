import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, Typography, Box,
  IconButton, Divider, Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';

function DossierMedicalForm({ open, onClose, onSuccess, dossier = null }) {
  const [formData, setFormData] = useState({
    patient: ''
  });
  
  const [patients, setPatients] = useState([]);
  const [maladiesDisponibles, setMaladiesDisponibles] = useState([]);
  const [vaccinsDisponibles, setVaccinsDisponibles] = useState([]);
  const [allergiesDisponibles, setAllergiesDisponibles] = useState([]);
  
  const [maladiesSelectionnees, setMaladiesSelectionnees] = useState([]);
  const [vaccinsSelectionnes, setVaccinsSelectionnes] = useState([]);
  const [allergiesSelectionnees, setAllergiesSelectionnees] = useState([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      const [patientsRes, maladiesRes, vaccinsRes, allergiesRes] = await Promise.all([
        api.get('patients/'),
        api.get('http://127.0.0.1:8000/api/maladies/'),
        api.get('http://127.0.0.1:8000/api/vaccins/'),
        api.get('http://127.0.0.1:8000/api/allergies/')
      ]);
      
      setPatients(patientsRes.data);
      setMaladiesDisponibles(maladiesRes.data);
      setVaccinsDisponibles(vaccinsRes.data);
      setAllergiesDisponibles(allergiesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // MALADIES
  const ajouterMaladie = () => {
    setMaladiesSelectionnees([...maladiesSelectionnees, { maladie: null, nom_custom: '', duree_maladie_patient: '' }]);
  };

  const supprimerMaladie = (index) => {
    setMaladiesSelectionnees(maladiesSelectionnees.filter((_, i) => i !== index));
  };

  const handleMaladieChange = (index, field, value) => {
    const newMaladies = [...maladiesSelectionnees];
    newMaladies[index][field] = value;
    setMaladiesSelectionnees(newMaladies);
  };

  // VACCINS
  const ajouterVaccin = () => {
    setVaccinsSelectionnes([...vaccinsSelectionnes, { vaccin: null, nom_custom: '', date_vacc_patient: '' }]);
  };

  const supprimerVaccin = (index) => {
    setVaccinsSelectionnes(vaccinsSelectionnes.filter((_, i) => i !== index));
  };

  const handleVaccinChange = (index, field, value) => {
    const newVaccins = [...vaccinsSelectionnes];
    newVaccins[index][field] = value;
    setVaccinsSelectionnes(newVaccins);
  };

  // ALLERGIES
  const ajouterAllergie = () => {
    setAllergiesSelectionnees([...allergiesSelectionnees, { allergie: null, nom_custom: '', precautions_patient: '' }]);
  };

  const supprimerAllergie = (index) => {
    setAllergiesSelectionnees(allergiesSelectionnees.filter((_, i) => i !== index));
  };

  const handleAllergieChange = (index, field, value) => {
    const newAllergies = [...allergiesSelectionnees];
    newAllergies[index][field] = value;
    setAllergiesSelectionnees(newAllergies);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Créer le dossier médical
      const dossierRes = await api.post('http://127.0.0.1:8000/api/dossiers/', {
        patient: formData.patient
      });
      const dossierId = dossierRes.data.id_dossier;

      // Ajouter les maladies
      for (const maladie of maladiesSelectionnees) {
        let maladieId;
        
        // Si c'est une nouvelle maladie (saisie libre), la créer d'abord
        if (typeof maladie.maladie === 'string' && !maladie.maladie.id_maladie) {
          const nouvelleMaladie = await api.post('http://127.0.0.1:8000/api/maladies/', {
            nom_malad: maladie.maladie
          });
          maladieId = nouvelleMaladie.data.id_maladie;
        } else if (maladie.maladie) {
          maladieId = maladie.maladie.id_maladie;
        }
        
        if (maladieId) {
          await api.post('http://127.0.0.1:8000/api/maladie-dossiers/', {
            dossier: dossierId,
            maladie: maladieId,
            duree_maladie_patient: maladie.duree_maladie_patient
          });
        }
      }

      // Ajouter les vaccins
      for (const vaccin of vaccinsSelectionnes) {
        let vaccinId;
        
        if (typeof vaccin.vaccin === 'string' && !vaccin.vaccin.id_vacc) {
          const nouveauVaccin = await api.post('http://127.0.0.1:8000/api/vaccins/', {
            nom_vacc: vaccin.vaccin
          });
          vaccinId = nouveauVaccin.data.id_vacc;
        } else if (vaccin.vaccin) {
          vaccinId = vaccin.vaccin.id_vacc;
        }
        
        if (vaccinId) {
          await api.post('http://127.0.0.1:8000/api/vaccin-dossiers/', {
            dossier: dossierId,
            vaccin: vaccinId,
            date_vacc_patient: vaccin.date_vacc_patient
          });
        }
      }

      // Ajouter les allergies
      for (const allergie of allergiesSelectionnees) {
        let allergieId;
        
        if (typeof allergie.allergie === 'string' && !allergie.allergie.id_allerg) {
          const nouvelleAllergie = await api.post('http://127.0.0.1:8000/api/allergies/', {
            nom_allerg: allergie.allergie
          });
          allergieId = nouvelleAllergie.data.id_allerg;
        } else if (allergie.allergie) {
          allergieId = allergie.allergie.id_allerg;
        }
        
        if (allergieId) {
          await api.post('http://127.0.0.1:8000/api/allergie-dossiers/', {
            dossier: dossierId,
            allergie: allergieId,
            precautions_patient: allergie.precautions_patient
          });
        }
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
      alert('Erreur lors de la création du dossier médical');
    }
  };

  const resetForm = () => {
    setFormData({ patient: '' });
    setMaladiesSelectionnees([]);
    setVaccinsSelectionnes([]);
    setAllergiesSelectionnees([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Nouveau Dossier Médical</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Patient"
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                required
              >
                <MenuItem value="">Sélectionnez un patient</MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.id_patient} value={patient.id_patient}>
                    {patient.nom_patient} {patient.prenom_patient} - {patient.cin}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* ===== MALADIES ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">🦠 Maladies / Antécédents</Typography>
                <Button startIcon={<AddIcon />} onClick={ajouterMaladie} size="small" variant="outlined">
                  Ajouter une maladie
                </Button>
              </Box>
              {maladiesSelectionnees.map((maladie, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Autocomplete
                    freeSolo
                    options={maladiesDisponibles}
                    getOptionLabel={(option) => option.nom_malad || option}
                    value={maladie.maladie}
                    onChange={(e, newValue) => handleMaladieChange(index, 'maladie', newValue)}
                    onInputChange={(e, newInputValue) => {
                      if (typeof newInputValue === 'string') {
                        handleMaladieChange(index, 'maladie', newInputValue);
                      }
                    }}
                    sx={{ flex: 2 }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Maladie" 
                        placeholder="Tapez ou sélectionnez..."
                      />
                    )}
                  />
                  <TextField
                    label="Durée / Remarques"
                    value={maladie.duree_maladie_patient}
                    onChange={(e) => handleMaladieChange(index, 'duree_maladie_patient', e.target.value)}
                    placeholder="Ex: Depuis 5 ans..."
                    sx={{ flex: 2 }}
                  />
                  <IconButton color="error" onClick={() => supprimerMaladie(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* ===== VACCINS ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">💉 Vaccins</Typography>
                <Button startIcon={<AddIcon />} onClick={ajouterVaccin} size="small" variant="outlined">
                  Ajouter un vaccin
                </Button>
              </Box>
              {vaccinsSelectionnes.map((vaccin, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Autocomplete
                    freeSolo
                    options={vaccinsDisponibles}
                    getOptionLabel={(option) => option.nom_vacc || option}
                    value={vaccin.vaccin}
                    onChange={(e, newValue) => handleVaccinChange(index, 'vaccin', newValue)}
                    onInputChange={(e, newInputValue) => {
                      if (typeof newInputValue === 'string') {
                        handleVaccinChange(index, 'vaccin', newInputValue);
                      }
                    }}
                    sx={{ flex: 2 }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Vaccin" 
                        placeholder="Tapez ou sélectionnez..."
                      />
                    )}
                  />
                  <TextField
                    type="date"
                    label="Date de vaccination"
                    value={vaccin.date_vacc_patient}
                    onChange={(e) => handleVaccinChange(index, 'date_vacc_patient', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ flex: 1 }}
                  />
                  <IconButton color="error" onClick={() => supprimerVaccin(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>

            {/* ===== ALLERGIES ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">⚠️ Allergies</Typography>
                <Button startIcon={<AddIcon />} onClick={ajouterAllergie} size="small" variant="outlined" color="error">
                  Ajouter une allergie
                </Button>
              </Box>
              {allergiesSelectionnees.map((allergie, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Autocomplete
                    freeSolo
                    options={allergiesDisponibles}
                    getOptionLabel={(option) => option.nom_allerg || option}
                    value={allergie.allergie}
                    onChange={(e, newValue) => handleAllergieChange(index, 'allergie', newValue)}
                    onInputChange={(e, newInputValue) => {
                      if (typeof newInputValue === 'string') {
                        handleAllergieChange(index, 'allergie', newInputValue);
                      }
                    }}
                    sx={{ flex: 2 }}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Allergie" 
                        placeholder="Tapez ou sélectionnez..."
                      />
                    )}
                  />
                  <TextField
                    label="Précautions"
                    value={allergie.precautions_patient}
                    onChange={(e) => handleAllergieChange(index, 'precautions_patient', e.target.value)}
                    placeholder="Ex: Éviter l'exposition..."
                    multiline
                    rows={1}
                    sx={{ flex: 2 }}
                  />
                  <IconButton color="error" onClick={() => supprimerAllergie(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            Créer le Dossier
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default DossierMedicalForm;