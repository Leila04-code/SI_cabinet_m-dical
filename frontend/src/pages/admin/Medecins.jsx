import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CloseIcon from '@mui/icons-material/Close';

const Medecins = () => {
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [editingMedecin, setEditingMedecin] = useState(null);
  const [formData, setFormData] = useState({
    nom_med: '',
    prenom_med: '',
    specialite_med: '',
    telephone: '',
    email: '',
    adresse: '',
    numero_ordre: '',
    tarif_consultation: ''
  });

  const specialites = [
    'Généraliste',
    'Cardiologue',
    'Dermatologue',
    'Pédiatre',
    'Gynécologue',
    'Orthopédiste',
    'ORL',
    'Ophtalmologue',
    'Psychiatre',
    'Radiologue',
    'Gastro-Entérologue',
    'Autre'
  ];

  useEffect(() => {
    fetchMedecins();
  }, []);

  useEffect(() => {
    filterMedecins();
  }, [searchTerm, medecins]);

  const fetchMedecins = async () => {
    try {
      setLoading(true);
      const response = await api.get('medecins/');
      setMedecins(response.data);
      setFilteredMedecins(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
      setLoading(false);
    }
  };

  const filterMedecins = () => {
    if (!searchTerm.trim()) {
      setFilteredMedecins(medecins);
      return;
    }
    const filtered = medecins.filter(medecin =>
      (medecin.nom_med || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medecin.prenom_med || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medecin.specialite_med || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMedecins(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMedecin) {
        await api.patch(`medecins/${editingMedecin.id_med}/`, formData);
      } else {
        await api.post('medecins/', formData);
      }
      fetchMedecins();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde médecin:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleView = (medecin) => {
    setSelectedMedecin(medecin);
    setShowDetailsModal(true);
  };

  const handleEdit = (medecin) => {
    setEditingMedecin(medecin);
    setFormData({
      nom_med: medecin.nom_med,
      prenom_med: medecin.prenom_med,
      specialite_med: medecin.specialite_med,
      telephone: medecin.telephone || '',
      email: medecin.email || '',
      adresse: medecin.adresse || '',
      numero_ordre: medecin.numero_ordre || '',
      tarif_consultation: medecin.tarif_consultation || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      try {
        await api.delete(`medecins/${id}/`);
        fetchMedecins();
      } catch (error) {
        console.error('Erreur suppression médecin:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom_med: '',
      prenom_med: '',
      specialite_med: '',
      telephone: '',
      email: '',
      adresse: '',
      numero_ordre: '',
      tarif_consultation: ''
    });
    setEditingMedecin(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <LocalHospitalIcon sx={{ fontSize: 40, color: '#4caf50' }} />
          Gestion des Médecins
        </h1>
        <p className="text-gray-600 mt-2">Gérez le corps médical du cabinet</p>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou spécialité..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
          >
            <AddIcon sx={{ fontSize: 20 }} />
            Nouveau Médecin
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-sm font-medium">Total Médecins</p>
          <p className="text-3xl font-bold text-green-700">{medecins.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Spécialités</p>
          <p className="text-3xl font-bold text-blue-700">
            {new Set(medecins.map(m => m.specialite_med)).size}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Tarif Moyen</p>
          <p className="text-3xl font-bold text-purple-700">
            {medecins.length > 0 && medecins.some(m => m.tarif_consultation)
              ? Math.round(medecins.filter(m => m.tarif_consultation).reduce((acc, m) => acc + parseFloat(m.tarif_consultation), 0) / medecins.filter(m => m.tarif_consultation).length)
              : 0} DH
          </p>
        </div>
      </div>

      {/* Liste des médecins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedecins.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
            <LocalHospitalIcon sx={{ fontSize: 60, color: '#9ca3af' }} />
            <p className="text-gray-500 text-lg mt-4">Aucun médecin trouvé</p>
          </div>
        ) : (
          filteredMedecins.map((medecin) => (
            <div
              key={medecin.id_med}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                {/* Avatar et nom */}
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <LocalHospitalIcon sx={{ color: '#4caf50', fontSize: 30 }} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Dr. {medecin.prenom_med} {medecin.nom_med}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      {medecin.specialite_med}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-2 mb-4">
                  {medecin.telephone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon sx={{ fontSize: 16, marginRight: 1 }} />
                      {medecin.telephone}
                    </div>
                  )}
                  {medecin.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <EmailIcon sx={{ fontSize: 16, marginRight: 1 }} />
                      {medecin.email}
                    </div>
                  )}
                  {medecin.numero_ordre && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">N° Ordre:</span> {medecin.numero_ordre}
                    </div>
                  )}
                  {medecin.tarif_consultation && (
                    <div className="text-sm font-semibold text-green-600">
                      Tarif: {medecin.tarif_consultation} DH
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleView(medecin)}
                    className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-1 transition-colors"
                    title="Voir les détails"
                  >
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                    Voir
                  </button>
                  <button
                    onClick={() => handleEdit(medecin)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(medecin.id_med)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1 transition-colors"
                  >
                    <DeleteIcon sx={{ fontSize: 18 }} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Détails Médecin */}
      {showDetailsModal && selectedMedecin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* En-tête du modal */}
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  Détails du Médecin
                </h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedMedecin(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Nom complet - Section principale */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-center mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">
                  Dr {selectedMedecin.prenom_med} {selectedMedecin.nom_med}
                </h3>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-green-700">
                  {selectedMedecin.specialite_med}
                </span>
              </div>

              {/* Toutes les informations */}
              <div className="space-y-6">
                {/* Section Identification */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Identification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        ID Médecin
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        #{selectedMedecin.id_med}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Numéro d'Ordre
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedMedecin.numero_ordre || 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Contact */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Coordonnées
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Téléphone
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedMedecin.telephone || 'Non renseigné'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Email
                      </label>
                      <p className="text-base font-semibold text-gray-900 break-all">
                        {selectedMedecin.email || 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <label className="text-sm font-medium text-gray-500 block mb-1">
                      Adresse
                    </label>
                    <p className="text-base text-gray-900">
                      {selectedMedecin.adresse || 'Non renseignée'}
                    </p>
                  </div>
                </div>

                {/* Section Professionnelle */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informations Professionnelles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Spécialité
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedMedecin.specialite_med}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-medium text-gray-500 block mb-1">
                        Tarif Consultation
                      </label>
                      <p className="text-base font-semibold text-green-600">
                        {selectedMedecin.tarif_consultation 
                          ? `${selectedMedecin.tarif_consultation} DH` 
                          : 'Non renseigné'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton Fermer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedMedecin(null);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingMedecin ? 'Modifier le Médecin' : 'Nouveau Médecin'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom_med"
                      value={formData.nom_med}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom_med"
                      value={formData.prenom_med}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Spécialité *
                    </label>
                    <select
                      name="specialite_med"
                      value={formData.specialite_med}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sélectionner...</option>
                      {specialites.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro d'Ordre *
                    </label>
                    <input
                      type="text"
                      name="numero_ordre"
                      value={formData.numero_ordre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarif Consultation (DH)
                    </label>
                    <input
                      type="number"
                      name="tarif_consultation"
                      value={formData.tarif_consultation}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse
                    </label>
                    <textarea
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingMedecin ? 'Modifier' : 'Créer'}
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

export default Medecins;