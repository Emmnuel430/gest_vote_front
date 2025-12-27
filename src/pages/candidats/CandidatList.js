import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout"; // Composant Layout qui contient la structure générale de la page
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter"; // Composant pour l'en-tête avec filtre
import Loader from "../../components/Layout/Loader"; // Composant pour le loader
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Composant de modal de confirmation pour la suppression d'candidat
import SearchBar from "../../components/Layout/SearchBar"; // Composant pour la barre de recherche
import { fetchWithToken } from "../../utils/fetchWithToken"; // Importation d'une fonction utilitaire pour les requêtes avec token

const CandidatList = () => {
  // États locaux pour gérer les candidats, l'état de chargement, les erreurs et les modals
  const [candidats, setCandidats] = useState([]); // Liste des candidats
  const [loading, setLoading] = useState(false); // État de chargement
  const [error, setError] = useState(""); // État pour les erreurs
  const [showModal, setShowModal] = useState(false); // État pour afficher ou cacher le modal de confirmation
  const [selectedCandidat, setSelectedCandidat] = useState(null); // Candidat sélectionné pour suppression
  const [sortOption, setSortOption] = useState(""); // État pour l'option de tri
  const [sortedCandidats, setSortedCandidats] = useState([]); // Liste des candidats triés
  const [searchQuery, setSearchQuery] = useState(""); // Requête de recherche pour filtrer les candidats

  // Récupérer la liste des candidats lors du premier rendu
  useEffect(() => {
    const fetchCandidats = async () => {
      setLoading(true); // On commence par définir l'état de chargement à true
      setError(""); // Réinitialiser l'erreur

      try {
        // Requête pour récupérer la liste des candidats
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/candidats`
        );
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des candidats.");
        }
        const data = await response.json(); // Convertir la réponse en JSON
        setCandidats(data); // Mettre à jour l'état candidats avec les données récupérées
      } catch (err) {
        setError("Impossible de charger les données : " + err.message); // Si erreur, la définir dans l'état
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchCandidats(); // Appel de la fonction pour récupérer les candidats
  }, []); // Dépendances vides, donc ce code est exécuté au premier rendu seulement

  // Ouvrir le modal de confirmation de suppression avec le candidat sélectionné
  const handleOpenModal = (candidat) => {
    setSelectedCandidat(candidat); // On définit le candidat sélectionné
    setShowModal(true); // On affiche le modal
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setShowModal(false); // Cacher le modal
    setSelectedCandidat(null); // Réinitialiser le candidat sélectionné
  };

  // Fonction pour supprimer le candidat sélectionné
  const handleDelete = async () => {
    if (!selectedCandidat) return; // Si aucun candidat sélectionné, on ne fait rien

    try {
      // Requête DELETE pour supprimer le candidat
      const response = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/candidats/${selectedCandidat.id}`,
        {
          method: "DELETE", // Méthode de suppression
        }
      );

      const result = await response.json(); // Convertir la réponse en JSON

      // Si le candidat a été supprimé
      if (result.status === "deleted") {
        alert("Candidat supprimé !"); // Afficher un message de succès
        setCandidats(
          candidats.filter((candidat) => candidat.id !== selectedCandidat.id)
        ); // Mettre à jour la liste des candidats
      } else {
        alert("Échec de la suppression."); // Si l'échec
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression."); // En cas d'erreur
    } finally {
      handleCloseModal(); // Fermer le modal après la suppression
    }
  };

  const filteredCandidats = sortedCandidats.filter(
    (candidat) =>
      candidat.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidat.prenom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mt-2">
        {/* Affichage des erreurs s'il y en a */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Affichage du loader si on est en train de charger les données */}
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }} // Centrer Loader au milieu de l'écran
          >
            <Loader />
          </div>
        ) : (
          <>
            {/* Barre de recherche */}
            <SearchBar
              placeholder="Rechercher un candidat..."
              onSearch={(query) => setSearchQuery(query)}
              delay={300}
            />
            {/* Affichage de l'en-tête avec filtre et le bouton pour ajouter un candidat */}
            <HeaderWithFilter
              allowedRoles={["dev", "super_admin"]}
              title="Candidats"
              link="/admin-gest/candidats/add"
              linkText="Ajouter"
              main={candidats.length || null}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={candidats}
              setSortedList={setSortedCandidats}
              alphaField="nom"
              dateField="created_at"
            />
            {/* Affichage de la liste des candidats dans un tableau */}
            <Table hover responsive className="centered-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nom</th>
                  <th>Prénom(s)</th>
                  <th>Parti</th>
                  <th>Opérations</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidats.length > 0 ? (
                  // Si des candidats existent, on les affiche dans des lignes de tableau
                  filteredCandidats.map((candidat, index) => (
                    <tr key={index + 1}>
                      <td className="d-flex align-items-center gap-2">
                        {candidat.photo ? (
                          <img
                            src={candidat.photo}
                            alt={candidat.nom}
                            width="40"
                            height="40"
                            className="rounded"
                          />
                        ) : (
                          <div
                            className="bg-secondary text-white d-flex justify-content-center align-items-center rounded"
                            style={{ width: 40, height: 40 }}
                          >
                            <i className="fa fa-user"></i>{" "}
                            {/* Icône FontAwesome */}
                          </div>
                        )}
                      </td>

                      <td>{candidat.nom}</td>
                      <td>{candidat.prenom}</td>
                      <td>{candidat.parti}</td>
                      <td className="table-operations">
                        <div className="d-flex align-items-stretch justify-content-center gap-2 h-100">
                          {/* Lien pour modifier le candidat */}
                          <Link
                            to={`/admin-gest/candidat/update/${candidat.id}`}
                            className="btn btn-warning btn-sm me-2"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          {/* Bouton pour supprimer le candidat (si ce n'est pas le candidat connecté) */}

                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenModal(candidat)} // Ouvre le modal pour la suppression
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  // Si aucun candidat n'est trouvé
                  <tr>
                    <td colSpan="6" className="text-center">
                      Aucun candidat trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </div>

      {/* Modal de confirmation pour la suppression d'un candidat */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={handleDelete}
        title="Confirmer la suppression"
        body={
          <p>
            Voulez-vous vraiment supprimer le candidat{" "}
            <strong>{selectedCandidat?.nom || "Inconnu"}</strong> ?
          </p>
        }
      />
    </Layout>
  );
};

export default CandidatList;
