import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    nom_patient: '',
    prenom_patient: '',
    date_naissance: '',
    sexe: 'M',
    cin: '',
    telephone: '',
    adresse: '',
    situation_familiale: 'CELIBATAIRE'
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients/');
      setPatients(response.data);
      setFilteredPatients(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement patients:', error);
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const filtered = patients.filter(patient =>
      (patient.nom_patient || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.prenom_patient || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.cin || '').includes(searchTerm) ||
      (patient.telephone || '').includes(searchTerm)
    );
    setFilteredPatients(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await api.patch(`/patients/${editingPatient.id_patient}/`, formData);
      } else {
        await api.post('/patients/', formData);
      }
      fetchPatients();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde patient:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      nom_patient: patient.nom_patient,
      prenom_patient: patient.prenom_patient,
      date_naissance: patient.date_naissance,
      sexe: patient.sexe,
      cin: patient.cin,
      telephone: patient.telephone,
      adresse: patient.adresse,
      situation_familiale: patient.situation_familiale
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await api.delete(`/patients/${id}/`);
        fetchPatients();
      } catch (error) {
        console.error('Erreur suppression patient:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom_patient: '',
      prenom_patient: '',
      date_naissance: '',
      sexe: 'M',
      cin: '',
      telephone: '',
      adresse: '',
      situation_familiale: 'CELIBATAIRE'
    });
    setEditingPatient(null);
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
          <PersonAddIcon sx={{ fontSize: 40, color: '#2196f3' }} />
          Gestion des Patients
        </h1>
        <p className="text-gray-600 mt-2">Gérez tous les patients du cabinet</p>
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
              placeholder="Rechercher par nom, prénom, CIN ou téléphone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <AddIcon sx={{ fontSize: 20 }} />
            Nouveau Patient
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-sm font-medium">Hommes</p>
          <p className="text-3xl font-bold text-green-700">
            {patients.filter(p => ['M', 'Masculin', 'Homme'].includes(p.sexe)).length}
          </p>
        </div>
        <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
          <p className="text-pink-600 text-sm font-medium">Femmes</p>
          <p className="text-3xl font-bold text-pink-700">
            {patients.filter(p => ['F', 'Féminin', 'Femme'].includes(p.sexe)).length}
          </p>
        </div>
      </div>

      {/* Table des patients */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CIN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Naissance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Situation
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Aucun patient trouvé
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id_patient} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {patient.prenom_patient?.[0] || '?'}{patient.nom_patient?.[0] || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.prenom_patient || 'N/A'} {patient.nom_patient || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{patient.sexe === 'M' ? 'Homme' : 'Femme'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.cin || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.date_naissance ? new Date(patient.date_naissance).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.telephone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {patient.situation_familiale || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Modifier"
                        >
                          <EditIcon sx={{ fontSize: 20 }} />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id_patient)}
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

      {/* Modal Ajout/Édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {editingPatient ? 'Modifier le Patient' : 'Nouveau Patient'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom_patient"
                      value={formData.nom_patient}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom_patient"
                      value={formData.prenom_patient}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CIN *
                    </label>
                    <input
                      type="text"
                      name="cin"
                      value={formData.cin}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de Naissance *
                    </label>
                    <input
                      type="date"
                      name="date_naissance"
                      value={formData.date_naissance}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexe *
                    </label>
                    <select
                      name="sexe"
                      value={formData.sexe}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Situation Familiale
                    </label>
                    <select
                      name="situation_familiale"
                      value={formData.situation_familiale}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CELIBATAIRE">Célibataire</option>
                      <option value="MARIE">Marié(e)</option>
                      <option value="DIVORCE">Divorcé(e)</option>
                      <option value="VEUF">Veuf/Veuve</option>
                    </select>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPatient ? 'Modifier' : 'Créer'}
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

export default Patients;