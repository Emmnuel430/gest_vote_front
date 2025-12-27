import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";

const ImportLieu = () => {
  const [file, setFile] = useState(null);
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

  const disabled = !file;

  const handleImport = async () => {
    if (disabled) {
      setError("Veuillez sélectionner un fichier JSON.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      let result = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/import`,
        {
          method: "POST",
          body: formData,
        }
      );

      result = await result.json();

      if (result.error) {
        setError(result.error || "Erreur lors de l'importation.");
        setLoading(false);
        return;
      }

      alert(result.message || "Importation réussie !");
      setFile(null); // réinitialise le fichier sélectionné
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
          <label htmlFor="file" className="form-label">
            Fichier JSON*
          </label>
          <input
            disabled={loading}
            type="file"
            id="file"
            className="form-control"
            accept=".json"
            onChange={(e) => setFile(e.target.files[0])}
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
