import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";

const ImportLieu = () => {
  const [files, setFiles] = useState([]); // 🔹 tableau pour plusieurs fichiers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null;

  if (!userId) {
    alert("Utilisateur non authentifié. Veuillez vous connecter.");
    navigate("/admin-gest");
    return;
  }

  const handleConfirm = () => {
    setShowModal(false);
    handleImport();
  };

  const handleCancel = () => setShowModal(false);

  const disabled = files.length === 0;

  const handleImport = async () => {
    if (disabled) {
      setError("Veuillez sélectionner au moins un fichier JSON.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // 🔹 Ajouter tous les fichiers au FormData
      Array.from(files).forEach((file) => {
        formData.append("files[]", file); // 🔹 nom attendu par ton API : files[]
      });

      let res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        setError(result.error || "Erreur lors de l'importation.");
        setLoading(false);
        return;
      }

      alert(result.message || "Importation réussie !");
      setFiles([]); // 🔹 réinitialiser les fichiers sélectionnés
      setLoading(false);
      navigate("/admin-gest/lieux-de-vote");
    } catch (e) {
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Back>admin-gest/lieux-de-vote</Back>
      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Charger un lieu de vote</h1>

        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        <div className="mb-3">
          <label htmlFor="files" className="form-label">
            Fichiers JSON*
          </label>
          <input
            disabled={loading}
            type="file"
            id="files"
            className="form-control"
            accept=".json"
            multiple // 🔹 autorise plusieurs fichiers
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary w-100 mt-3"
          disabled={disabled || loading}
        >
          {loading ? (
            <span>
              <i className="fas fa-spinner fa-spin"></i> Importation...
            </span>
          ) : (
            <span>Importer</span>
          )}
        </button>
      </div>

      <ConfirmPopup
        show={showModal}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title="Confirmer l'importation"
        body={<p>Voulez-vous vraiment importer ce fichier JSON ?</p>}
        btnColor="primary"
      />
    </Layout>
  );
};

export default ImportLieu;
