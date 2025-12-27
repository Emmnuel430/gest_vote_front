import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";

const LieuUpdate = () => {
  const { id } = useParams(); // id du lieu
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

  /* =========================
      AUTH CHECK
  ========================= */
  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo ? userInfo.id : null;

  useEffect(() => {
    if (!userId) {
      alert("Utilisateur non authentifié");
      navigate("/admin-gest");
    }
  }, [userId, navigate]);

  /* =========================
      LOAD DATA
  ========================= */
  const loadLieu = useCallback(async () => {
    try {
      const res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/lieux-votes/${id}`
      );
      const data = await res.json();

      setForm({
        code: data.code || "",
        nom: data.nom || "",
        nombre_electeurs: data.nombre_electeurs || "",
        commune_id: data.commune_id || "",
      });
    } catch {
      setError("Impossible de charger le lieu de vote");
    }
  }, [id]);
  useEffect(() => {
    loadLieu();
    loadCommunes();
  }, [loadLieu]);

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

  /* =========================
      FORM HANDLING
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleUpdate();
  };

  const handleUpdate = async () => {
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

      //   console.log(payload);

      const res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/lieux-votes/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Erreur lors de la mise à jour");
        setLoading(false);
        return;
      }

      alert("Lieu de vote mis à jour avec succès");
      navigate("/admin-gest/lieux-de-vote");
    } catch {
      setError("Une erreur inattendue est survenue");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      RENDER
  ========================= */
  return (
    <Layout>
      <Back>admin-gest/lieux-de-vote</Back>

      <div className="col-sm-6 offset-sm-3 mt-5">
        <h1>Modifier un lieu de vote</h1>

        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        <div className="mb-3">
          <label className="form-label">Code *</label>
          <input
            type="text"
            name="code"
            className="form-control"
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
                {c.nom}
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
              <i className="fas fa-spinner fa-spin"></i> Mise à jour...
            </>
          ) : (
            "Mettre à jour"
          )}
        </button>
      </div>

      <ConfirmPopup
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Confirmer la mise à jour"
        body={<p>Voulez-vous vraiment modifier ce lieu de vote ?</p>}
        btnColor="primary"
      />
    </Layout>
  );
};

export default LieuUpdate;
