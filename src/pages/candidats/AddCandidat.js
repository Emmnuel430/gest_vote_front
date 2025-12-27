import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup"; // Importation du modal de confirmation
import ToastMessage from "../../components/Layout/ToastMessage"; // Importation du composant de message toast
import { fetchWithToken } from "../../utils/fetchWithToken"; // Importation d'une fonction utilitaire pour les requêtes avec token

const AddCandidat = () => {
  // États pour stocker les données du formulaire et d'autres informations d'état
  const [nom, setNom] = useState(""); // Nom de le candidat
  const [prenom, setPrenom] = useState(""); // Prénom de le candidat
  const [parti, setParti] = useState(""); // Parti de le candidat
  const [photo, setPhoto] = useState(null); // Photo de le candidat
  const [codeCandidat, setCodeCandidat] = useState(""); // Code candidat

  const [loading, setLoading] = useState(false); // Indicateur de chargement lors de la soumission
  const [error, setError] = useState(""); // Message d'erreur en cas de problème
  const [showModal, setShowModal] = useState(false); // Contrôle l'affichage du modal de confirmation
  const navigate = useNavigate(); // Hook pour la navigation

  // Récupération de le candidat actuellement connecté depuis le sessionStorage
  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null;

  // Si aucun candidat n'est authentifié, on redirige vers la page de connexion
  if (!userId) {
    alert("Utilisateur non authentifié. Veuillez vous connecter.");
    navigate("/admin-gest");
    return;
  }

  // Fonction pour confirmer l'inscription
  const handleConfirm = () => {
    setShowModal(false); // Ferme le modal
    signUp(); // Lance la fonction d'inscription
  };

  // Fonction pour annuler l'inscription et fermer le modal
  const handleCancel = () => {
    setShowModal(false);
  };

  const disabled = !nom || !prenom || !parti;

  // Fonction pour envoyer les données du formulaire au backend
  const signUp = async () => {
    // Vérification que tous les champs sont remplis
    if (disabled) {
      setError("Tous les champs étoilés sont requis.");
      return;
    }

    setError(""); // Réinitialise l'erreur
    setLoading(true); // Active le chargement

    try {
      setLoading(true);

      // Création du FormData pour gérer la photo
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("prenom", prenom);
      formData.append("parti", parti);
      if (photo) formData.append("photo", photo); // photo est un File depuis input
      if (codeCandidat) formData.append("code_candidat", codeCandidat);

      // Envoi des données au backend
      let result = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/candidats`,
        {
          method: "POST",
          body: formData, // FormData pour upload fichier
        }
      );

      result = await result.json();

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setLoading(false);
      alert("Candidat créé avec succès");
      // Réinitialisation du formulaire
      setNom("");
      setPrenom("");
      setParti("");
      setPhoto(null);
      setCodeCandidat("");
      navigate("/admin-gest/candidats");
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Back>admin-gest/utilisateurs</Back>
      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Création d'un nouvel candidat</h1>

        {/* Affichage d'un message d'erreur si nécessaire */}
        {error && (
          <ToastMessage
            message={error}
            onClose={() => {
              setError(null);
            }}
          />
        )}

        {/* Formulaire d'inscription */}
        <div className="row g-3">
          {/* Photo */}
          <div className="col-12 col-md-12">
            <label htmlFor="photo" className="form-label">
              Photo
            </label>
            <input
              disabled={loading}
              type="file"
              id="photo"
              className="form-control"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </div>

          {/* Nom */}
          <div className="col-12 col-md-6">
            <label htmlFor="nom" className="form-label">
              Nom*
            </label>
            <input
              disabled={loading}
              type="text"
              id="nom"
              className="form-control"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>

          {/* Prénom */}
          <div className="col-12 col-md-6">
            <label htmlFor="prenom" className="form-label">
              Prénom*
            </label>
            <input
              disabled={loading}
              type="text"
              id="prenom"
              className="form-control"
              placeholder="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
            />
          </div>

          {/* Parti */}
          <div className="col-12 col-md-6">
            <label htmlFor="parti" className="form-label">
              Parti*
            </label>
            <input
              disabled={loading}
              type="text"
              id="parti"
              className="form-control"
              placeholder="Parti"
              value={parti}
              onChange={(e) => setParti(e.target.value)}
              required
            />
          </div>

          {/* Code candidat */}
          <div className="col-12 col-md-6">
            <label htmlFor="code_candidat" className="form-label">
              Code candidat
            </label>
            <input
              disabled={loading}
              type="text"
              id="code_candidat"
              className="form-control"
              placeholder="Code candidat"
              value={codeCandidat}
              onChange={(e) => setCodeCandidat(e.target.value)}
            />
          </div>
        </div>

        {/* Bouton pour soumettre le formulaire avec un modal de confirmation */}
        <button
          onClick={() => setShowModal(true)} // Ouvre le modal de confirmation
          className="btn btn-primary w-100 mt-4"
          disabled={disabled || loading}
        >
          {loading ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Chargement...
            </span>
          ) : (
            <span>Ajouter</span>
          )}
        </button>
      </div>

      {/* Modal de confirmation avant de soumettre l'inscription */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCancel} // Annule et ferme le modal
        onConfirm={handleConfirm} // Confirme l'inscription et ferme le modal
        title="Confirmer l'inscription"
        body={<p>Voulez-vous vraiment ajouter cet candidat ?</p>}
        btnColor="primary"
      />
    </Layout>
  );
};

export default AddCandidat;
