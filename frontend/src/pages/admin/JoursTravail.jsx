import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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
    date: '',
    heure_debut: '08:00',
    heure_fin: '18:00'
  });

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      date: jour.date,
      heure_debut: jour.heure_debut,
      heure_fin: jour.heure_fin
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

  const resetForm = () => {
    setFormData({
      medecin: '',
      date: '',
      heure_debut: '08:00',
      heure_fin: '18:00'
    });
    setEditingJour(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getJourSemaine = (dateString) => {
    const date = new Date(dateString);
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return jours[date.getDay()];
  };

  const getJoursParMedecin = () => {
    const grouped = {};
    medecins.forEach(medecin => {
      grouped[medecin.id_med] = {
        medecin: medecin,
        jours: joursTravail.filter(j => j.medecin === medecin.id_med)
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
          <CalendarTodayIcon className="text-blue-600" />
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
              <option key="all" value="">Tous les médecins</option>
              {medecins.map(medecin => (
                <option key={medecin.id_med} value={medecin.id_med}>
                  Dr. {medecin.prenom_med} {medecin.nom_med} - {medecin.specialite_med}
                </option>
              ))}
            </select>
          </div>
          <div className="self-end">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <AddIcon />
              Ajouter un Jour
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Total Plannings</p>
          <p className="text-3xl font-bold text-blue-700">{joursTravail.length}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-orange-600 text-sm font-medium">Médecins</p>
          <p className="text-3xl font-bold text-orange-700">{medecins.length}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Jours/Médecin</p>
          <p className="text-3xl font-bold text-purple-700">
            {medecins.length > 0 
              ? (joursTravail.length / medecins.length).toFixed(1)
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
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horaires
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
                      Aucun jour de travail défini pour ce médecin
                    </td>
                  </tr>
                ) : (
                  filteredJours.map((jour) => (
                    <tr key={jour.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(jour.date).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarTodayIcon className="text-blue-500" sx={{ fontSize: 20 }} />
                          <span className="text-sm font-medium text-gray-900">
                            {getJourSemaine(jour.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <AccessTimeIcon className="text-green-500" sx={{ fontSize: 20 }} />
                          {jour.heure_debut} - {jour.heure_fin}
                        </div>
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
            <div key={medecin.id_med} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarTodayIcon />
                  Dr. {medecin.prenom_med} {medecin.nom_med}
                  <span className="text-blue-100 text-sm font-normal ml-2">
                    - {medecin.specialite_med}
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
                        className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">
                            {getJourSemaine(jour.date)}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-200 text-blue-800">
                            {new Date(jour.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <AccessTimeIcon sx={{ fontSize: 18 }} />
                          {jour.heure_debut} - {jour.heure_fin}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(jour)}
                            className="flex-1 bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-200 flex items-center justify-center gap-1"
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(jour.id)}
                            className="flex-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200 flex items-center justify-center gap-1"
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
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
                      <option key="empty" value="">Sélectionner un médecin...</option>
                      {medecins.map(medecin => (
                        <option key={medecin.id_med} value={medecin.id_med}>
                          Dr. {medecin.prenom_med} {medecin.nom_med} - {medecin.specialite_med}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
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