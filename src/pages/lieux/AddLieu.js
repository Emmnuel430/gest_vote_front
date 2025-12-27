import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";

const AddLieu = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    nom: "",
    nombre_electeurs: "",
    commune_id: "",
  });

  const [communes, setCommunes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null;

  useEffect(() => {
    if (!userId) {
      alert("Utilisateur non authentifié");
      navigate("/admin-gest");
    }
  }, [userId, navigate]);

  useEffect(() => {
    loadCommunes();
  }, []);

  const loadCommunes = async () => {
    try {
      const res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/communes`
      );
      const data = await res.json();
      setCommunes(data);
    } catch {
      setError("Impossible de charger les communes");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleCreate();
  };

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        code: form.code,
        nom: form.nom,
        nombre_electeurs: form.nombre_electeurs
          ? Number(form.nombre_electeurs)
          : null,
        commune_id: form.commune_id,
      };

      const res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/lieux-votes`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Erreur lors de la création");
        setLoading(false);
        return;
      }

      alert("Lieu de vote créé avec succès");
      navigate("/admin-gest/lieux-de-vote");
    } catch {
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Back>admin-gest/lieux-de-vote</Back>

      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Ajouter un lieu de vote</h1>

        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        <div className="mb-3">
          <label className="form-label">Code *</label>
          <input
            type="text"
            name="code"
            className="form-control"
            placeholder="Ex : 550"
            value={form.code}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Nom *</label>
          <input
            type="text"
            name="nom"
            className="form-control"
            value={form.nom}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre d'électeurs</label>
          <input
            type="number"
            name="nombre_electeurs"
            className="form-control"
            value={form.nombre_electeurs}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Commune *</label>
          <select
            name="commune_id"
            className="form-select"
            value={form.commune_id}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">-- Sélectionner --</option>
            {communes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.nom}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary w-100 mt-3"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Création...
            </>
          ) : (
            "Créer"
          )}
        </button>
      </div>

      <ConfirmPopup
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Confirmer la création"
        body={<p>Voulez-vous vraiment créer ce lieu de vote ?</p>}
        btnColor="primary"
      />
    </Layout>
  );
};

export default AddLieu;
