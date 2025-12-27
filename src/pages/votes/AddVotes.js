import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import useSelectTheme from "./useSelectTheme";

const AddVotes = () => {
  const navigate = useNavigate();
  const { customTheme } = useSelectTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [lieux, setLieux] = useState([]);
  const [selectedLieu, setSelectedLieu] = useState(null);

  const [candidats, setCandidats] = useState([]);

  const [lieuVoteId, setLieuVoteId] = useState(null);
  const [resultats, setResultats] = useState([]);

  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo?.id;

  /* =======================
      FETCH DATA
  ======================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lieuxRes, candidatsRes] = await Promise.all([
          fetchWithToken(`${process.env.REACT_APP_API_BASE_URL}/lieux-vote`),
          fetchWithToken(`${process.env.REACT_APP_API_BASE_URL}/candidats`),
        ]);

        const lieuxData = await lieuxRes.json();
        const candidatsData = await candidatsRes.json();

        setLieux(
          lieuxData.map((l) => ({
            value: l.id,
            label: `${l.code} - ${l.nom}`,
            nombre_electeurs: l.nombre_electeurs,
          }))
        );

        setCandidats(
          candidatsData.map((c) => ({
            value: c.id,
            label: `${c.nom} ${c.prenom} - (${c.parti})`,
          }))
        );
      } catch {
        setError("Erreur lors du chargement des données.");
      }
    };

    fetchData();
  }, []);

  if (!userId) {
    alert("Utilisateur non authentifié.");
    navigate("/admin-gest");
    return;
  }

  /* =======================
      HANDLERS
  ======================= */
  const addCandidat = () => {
    if (resultats.length >= candidats.length) {
      setError("Vous avez déjà ajouté tous les candidats disponibles.");
      return;
    }

    setResultats([...resultats, { candidat_id: null, nombre_voix: 0 }]);
  };

  const updateResultat = (index, field, value) => {
    const updated = [...resultats];
    updated[index][field] = value;
    setResultats(updated);
  };

  const removeResultat = (index) => {
    setResultats(resultats.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    setShowModal(false);
    handleSubmit();
  };

  /* =======================
      SUBMIT
  ======================= */
  const handleSubmit = async () => {
    if (!lieuVoteId || resultats.length === 0) {
      setError("Veuillez sélectionner un lieu et au moins un candidat.");
      return;
    }

    if (selectedLieu && totalVoix > selectedLieu.nombre_electeurs) {
      setError("Le total des voix dépasse le nombre d'électeurs autorisés.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res = await fetchWithToken(
        `${process.env.REACT_APP_API_BASE_URL}/resultats`,
        {
          method: "POST",
          body: JSON.stringify({
            lieu_vote_id: lieuVoteId,
            resultats,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de l'enregistrement.");
        setLoading(false);
        return;
      }

      alert("Résultats enregistrés avec succès !");
      setLieuVoteId(null);
      setSelectedLieu(null);
      setResultats([]);

      // navigate("/admin-gest/resultats-votes");
    } catch {
      setError("Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  };

  const totalVoix = resultats.reduce(
    (sum, r) => sum + (Number(r.nombre_voix) || 0),
    0
  );

  const getAvailableCandidats = (currentIndex) => {
    const selectedIds = resultats
      .map((r, i) => (i !== currentIndex ? r.candidat_id : null))
      .filter(Boolean);

    return candidats.filter(
      (c) =>
        !selectedIds.includes(c.value) ||
        c.value === resultats[currentIndex]?.candidat_id
    );
  };

  /* =======================
      RENDER
  ======================= */
  return (
    <Layout>
      <Back>admin-gest/resultats-votes</Back>

      <div className="col-md-8 offset-md-2 mt-4">
        <h1>Ajouter des votes</h1>

        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        {/* ===== LIEU ===== */}
        <div className="mb-3">
          <label className="form-label">Lieu de vote *</label>
          <Select
            theme={customTheme}
            options={lieux}
            placeholder="Sélectionner un lieu"
            value={selectedLieu}
            onChange={async (opt) => {
              setLieuVoteId(opt?.value || null);
              setSelectedLieu(opt || null);

              if (opt && opt.value) {
                try {
                  const res = await fetchWithToken(
                    `${process.env.REACT_APP_API_BASE_URL}/resultats?lieu_vote_id=${opt.value}`
                  );

                  if (!res.ok) {
                    setResultats([]);
                    return;
                  }

                  const existing = await res.json();

                  if (Array.isArray(existing) && existing.length > 0) {
                    setResultats(
                      existing.map((r) => ({
                        candidat_id: r.candidat_id,
                        nombre_voix: r.nombre_voix,
                      }))
                    );
                  } else {
                    setResultats([]);
                  }
                } catch (err) {
                  setError(
                    "Erreur lors du chargement des résultats existants."
                  );
                }
              } else {
                setResultats([]);
              }
            }}
            isClearable
          />
          {selectedLieu && (
            <div className="alert alert-info mt-3">
              <strong>Total des voix :</strong> {totalVoix} /{" "}
              {selectedLieu.nombre_electeurs}
            </div>
          )}
        </div>

        {/* ===== RESULTATS ===== */}
        <div className="mb-3">
          <h5>Résultats par candidat</h5>

          {resultats.map((res, index) => (
            <div key={index} className="border rounded p-3 mb-2 bg-body">
              <div className="row align-items-end">
                <div className="col-md-6 mb-2">
                  <label className="form-label">Candidat</label>
                  <Select
                    theme={customTheme}
                    options={getAvailableCandidats(index)}
                    placeholder="Sélectionner un candidat"
                    value={candidats.find((c) => c.value === res.candidat_id)}
                    onChange={(opt) =>
                      updateResultat(index, "candidat_id", opt?.value || null)
                    }
                    isClearable
                  />
                </div>

                <div className="col-md-4 mb-2">
                  <label className="form-label">Nombre de voix</label>
                  <input
                    type="number"
                    min="0"
                    disabled={!res.candidat_id}
                    className={`form-control ${
                      selectedLieu && totalVoix > selectedLieu.nombre_electeurs
                        ? "is-invalid"
                        : ""
                    }`}
                    value={res.nombre_voix}
                    onChange={(e) => {
                      const value = Number(e.target.value);

                      const newTotal = totalVoix - res.nombre_voix + value;

                      if (
                        selectedLieu &&
                        newTotal > selectedLieu.nombre_electeurs
                      ) {
                        setError(
                          `Le total des voix (${newTotal}) dépasse le nombre d'électeurs (${selectedLieu.nombre_electeurs}).`
                        );
                        return;
                      }

                      updateResultat(index, "nombre_voix", value);
                    }}
                  />
                </div>

                <div className="col-md-2 mb-2">
                  <button
                    className="btn btn-danger w-100"
                    onClick={() => removeResultat(index)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            className="btn btn-outline-primary mt-2"
            onClick={addCandidat}
            disabled={resultats.length >= candidats.length}
          >
            <i className="fa fa-plus" /> Ajouter un candidat
          </button>
        </div>

        {/* ===== SUBMIT ===== */}
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary w-100 mt-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin me-2" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer les votes"
          )}
        </button>
      </div>

      <ConfirmPopup
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirm}
        title="Confirmation"
        body={<p>Voulez-vous enregistrer ces résultats ?</p>}
        btnColor="primary"
      />
    </Layout>
  );
};

export default AddVotes;
