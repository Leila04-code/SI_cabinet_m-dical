import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const JoursTravail = () => {
  const [joursTravail, setJoursTravail] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [filteredJours, setFilteredJours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedecin, setSelectedMedecin] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingJour, setEditingJour] = useState(null);
  const [formData, setFormData] = useState({
    medecin: '',
    jour: 'LUNDI',
    heure_debut: '08:00',
    heure_fin: '18:00',
    actif: true
  });

  const jours = [
    { value: 'LUNDI', label: 'Lundi' },
    { value: 'MARDI', label: 'Mardi' },
    { value: 'MERCREDI', label: 'Mercredi' },
    { value: 'JEUDI', label: 'Jeudi' },
    { value: 'VENDREDI', label: 'Vendredi' },
    { value: 'SAMEDI', label: 'Samedi' },
    { value: 'DIMANCHE', label: 'Dimanche' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterJours();
  }, [selectedMedecin, joursTravail]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [joursRes, medecinsRes] = await Promise.all([
        api.get('/jours-travail/'),
        api.get('/medecins/')
      ]);
      setJoursTravail(joursRes.data);
      setMedecins(medecinsRes.data);
      setFilteredJours(joursRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setLoading(false);
    }
  };

  const filterJours = () => {
    if (!selectedMedecin) {
      setFilteredJours(joursTravail);
      return;
    }
    const filtered = joursTravail.filter(jour => jour.medecin === parseInt(selectedMedecin));
    setFilteredJours(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJour) {
        await api.patch(`/jours-travail/${editingJour.id}/`, formData);
      } else {
        await api.post('/jours-travail/', formData);
      }
      fetchData();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde jour de travail:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (jour) => {
    setEditingJour(jour);
    setFormData({
      medecin: jour.medecin,
      jour: jour.jour,
      heure_debut: jour.heure_debut,
      heure_fin: jour.heure_fin,
      actif: jour.actif
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce jour de travail ?')) {
      try {
        await api.delete(`/jours-travail/${id}/`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression jour de travail:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const toggleActif = async (jour) => {
    try {
      await api.patch(`/jours-travail/${jour.id}/`, {
        ...jour,
        actif: !jour.actif
      });
      fetchData();
    } catch (error) {
      console.error('Erreur modification statut:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      medecin: '',
      jour: 'LUNDI',
      heure_debut: '08:00',
      heure_fin: '18:00',
      actif: true
    });
    setEditingJour(null);
  };

  const getMedecinNom = (medecinId) => {
    const medecin = medecins.find(m => m.id === medecinId);
    return medecin ? `Dr. ${medecin.prenom} ${medecin.nom}` : 'N/A';
  };

  const getJoursParMedecin = () => {
    const grouped = {};
    medecins.forEach(medecin => {
      grouped[medecin.id] = {
        medecin: medecin,
        jours: joursTravail.filter(j => j.medecin === medecin.id)
      };
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <CalendarTodayIcon sx={{ fontSize: 20 }} />
          Gestion des Jours de Travail
        </h1>
        <p className="text-gray-600 mt-2">Planifiez les horaires de travail des médecins</p>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par médecin
            </label>
            <select
              value={selectedMedecin}
              onChange={(e) => setSelectedMedecin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les médecins</option>
              {medecins.map(medecin => (
                <option key={medecin.id} value={medecin.id}>
                  Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                </option>
              ))}
            </select>
          </div>
          <div className="self-end">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <AddIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              Ajouter un Jour
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Total Plannings</p>
          <p className="text-3xl font-bold text-blue-700">{joursTravail.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-sm font-medium">Jours Actifs</p>
          <p className="text-3xl font-bold text-green-700">
            {joursTravail.filter(j => j.actif).length}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-orange-600 text-sm font-medium">Médecins</p>
          <p className="text-3xl font-bold text-orange-700">{medecins.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Jours/Semaine</p>
          <p className="text-3xl font-bold text-purple-700">
            {medecins.length > 0 
              ? (joursTravail.filter(j => j.actif).length / medecins.length).toFixed(1)
              : 0}
          </p>
        </div>
      </div>

      {/* Vue par médecin */}
      {selectedMedecin ? (
        // Vue détaillée pour un médecin
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaires
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJours.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Aucun jour de travail défini
                    </td>
                  </tr>
                ) : (
                  filteredJours.map((jour) => (
                    <tr key={jour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarTodayIcon sx={{ fontSize: 20 }} />
                          <span className="text-sm font-medium text-gray-900">
                            {jours.find(j => j.value === jour.jour)?.label || jour.jour}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <AccessTimeIcon sx={{ fontSize: 20 }} />
                          {jour.heure_debut} - {jour.heure_fin}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActif(jour)}
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer
                            ${jour.actif 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                          {jour.actif ? 'Actif' : 'Inactif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(jour)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <EditIcon sx={{ fontSize: 20 }} />
                          </button>
                          <button
                            onClick={() => handleDelete(jour.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <DeleteIcon sx={{ fontSize: 20 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Vue globale - Planning par médecin
        <div className="space-y-6">
          {Object.values(getJoursParMedecin()).map(({ medecin, jours: joursDoc }) => (
            <div key={medecin.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarTodayIcon sx={{ fontSize: 20 }} />
                  Dr. {medecin.prenom} {medecin.nom}
                  <span className="text-blue-100 text-sm font-normal ml-2">
                    - {medecin.specialite}
                  </span>
                </h3>
              </div>
              <div className="p-6">
                {joursDoc.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucun jour de travail défini pour ce médecin
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {joursDoc.map((jour) => (
                      <div
                        key={jour.id}
                        className={`p-4 rounded-lg border-2 ${
                          jour.actif 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {jours.find(j => j.value === jour.jour)?.label || jour.jour}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            jour.actif 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {jour.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <AccessTimeIcon sx={{ fontSize: 20 }} />
                          {jour.heure_debut} - {jour.heure_fin}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(jour)}
                            className="flex-1 bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(jour.id)}
                            className="flex-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingJour ? 'Modifier le Jour de Travail' : 'Ajouter un Jour de Travail'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Médecin *
                    </label>
                    <select
                      name="medecin"
                      value={formData.medecin}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sélectionner un médecin...</option>
                      {medecins.map(medecin => (
                        <option key={medecin.id} value={medecin.id}>
                          Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jour *
                    </label>
                    <select
                      name="jour"
                      value={formData.jour}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {jours.map(jour => (
                        <option key={jour.value} value={jour.value}>
                          {jour.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure Début *
                      </label>
                      <input
                        type="time"
                        name="heure_debut"
                        value={formData.heure_debut}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heure Fin *
                      </label>
                      <input
                        type="time"
                        name="heure_fin"
                        value={formData.heure_fin}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={formData.actif}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Jour actif
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingJour ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoursTravail;