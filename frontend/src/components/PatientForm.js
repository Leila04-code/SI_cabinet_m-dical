import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem
} from '@mui/material';
import { patientService } from '../services/api';

function PatientForm({ open, onClose, onSuccess, patient = null }) {
  const [formData, setFormData] = useState({
    nom_patient: '',
    prenom_patient: '',
    sexe: '',
    cin: '',
    adresse: '',
    date_naissance: '',
    telephone: '',
    situation_familiale: '',
    employe: null
  });

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (patient) {
        await patientService.update(patient.id_patient, formData);
      } else {
        await patientService.create(formData);
      }
      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Erreur lors de l\'enregistrement du patient');
    }
  };

  const resetForm = () => {
    setFormData({
      nom_patient: '',
      prenom_patient: '',
      sexe: '',
      cin: '',
      adresse: '',
      date_naissance: '',
      telephone: '',
      situation_familiale: '',
      employe: null
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {patient ? 'Modifier le patient' : 'Nouveau patient'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom_patient"
                value={formData.nom_patient}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="prenom_patient"
                value={formData.prenom_patient}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Sexe"
                name="sexe"
                value={formData.sexe}
                onChange={handleChange}
                required
              >
                <MenuItem value="Masculin">Masculin</MenuItem>
                <MenuItem value="Féminin">Féminin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CIN"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date de naissance"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Situation familiale"
                name="situation_familiale"
                value={formData.situation_familiale}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained">
            {patient ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default PatientForm;