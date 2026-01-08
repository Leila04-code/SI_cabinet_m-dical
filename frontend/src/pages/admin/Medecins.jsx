import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Medecins = () => {
  const [medecins, setMedecins] = useState([]);
  const [filteredMedecins, setFilteredMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedecin, setEditingMedecin] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    specialite: '',
    telephone: '',
    email: '',
    adresse: '',
    numero_ordre: '',
    tarif_consultation: ''
  });

  const specialites = [
    'Médecine Générale',
    'Cardiologie',
    'Dermatologie',
    'Pédiatrie',
    'Gynécologie',
    'Orthopédie',
    'ORL',
    'Ophtalmologie',
    'Psychiatrie',
    'Radiologie',
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
      const response = await api.get('/api/medecins/');
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
      medecin.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medecin.specialite.toLowerCase().includes(searchTerm.toLowerCase())
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
        await api.patch(`/medecins/${editingMedecin.id}/`, formData);
      } else {
        await api.post('/medecins/', formData);
      }
      fetchMedecins();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde médecin:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (medecin) => {
    setEditingMedecin(medecin);
    setFormData(medecin);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce médecin ?')) {
      try {
        await api.delete(`/medecins/${id}/`);
        fetchMedecins();
      } catch (error) {
        console.error('Erreur suppression médecin:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      specialite: '',
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
            <SearchIcon sx={{ fontSize: 20 }} />
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
            {new Set(medecins.map(m => m.specialite)).size}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-sm font-medium">Tarif Moyen</p>
          <p className="text-3xl font-bold text-purple-700">
            {medecins.length > 0
              ? Math.round(medecins.reduce((acc, m) => acc + (parseFloat(m.tarif_consultation) || 0), 0) / medecins.length)
              : 0} DH
          </p>
        </div>
      </div>

      {/* Liste des médecins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedecins.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
            <LocalHospitalIcon sx={{ fontSize: 20 }} />
            <p className="text-gray-500 text-lg">Aucun médecin trouvé</p>
          </div>
        ) : (
          filteredMedecins.map((medecin) => (
            <div
              key={medecin.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                {/* Avatar et nom */}
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Dr. {medecin.prenom} {medecin.nom}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      {medecin.specialite}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    {medecin.telephone}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <EmailIcon sx={{ fontSize: 20 }} />
                    {medecin.email}
                  </div>
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
                    onClick={() => handleEdit(medecin)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
                  >                    <LocalHospitalIcon sx={{ color: '#4caf50', fontSize: 30 }} />

                    <EditIcon sx={{ fontSize: 20 }} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(medecin.id)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
                  >
                    <DeleteIcon sx={{ fontSize: 20 }} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
                      name="nom"
                      value={formData.nom}
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
                      name="prenom"
                      value={formData.prenom}
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
                      name="specialite"
                      value={formData.specialite}
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
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro d'Ordre
                    </label>
                    <input
                      type="text"
                      name="numero_ordre"
                      value={formData.numero_ordre}
                      onChange={handleInputChange}
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