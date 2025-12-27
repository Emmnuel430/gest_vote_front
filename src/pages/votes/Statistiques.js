import { useEffect, useState, useMemo } from "react";
import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import Select from "react-select";

import useSelectTheme from "./useSelectTheme";
import ChartRepartition from "./ChartRepartition";

/* =======================
      CONFIG PAR TYPE
  ======================= */
const config = {
  globales: {
    label: "Statistiques globales",
    endpoint: "/statistiques/globales",
    hasSelect: false,
  },
  departement: {
    label: "Par département",
    endpoint: "/statistiques/departement",
    optionsEndpoint: "/departements",
  },
  souspref: {
    label: "Par sous-préfecture",
    endpoint: "/statistiques/sous-pref",
    optionsEndpoint: "/sous-prefectures",
  },
  commune: {
    label: "Par commune",
    endpoint: "/statistiques/commune",
    optionsEndpoint: "/communes",
  },
  lieu: {
    label: "Par lieu de vote",
    endpoint: "/statistiques/lieu",
    optionsEndpoint: "/lieux-vote",
  },
};

const Statistiques = () => {
  const { customTheme } = useSelectTheme();

  const [type, setType] = useState("globales");
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =======================
      FETCH OPTIONS
  ======================= */
  useEffect(() => {
    if (!config[type]?.optionsEndpoint) return;

    const fetchOptions = async () => {
      try {
        const res = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}${config[type].optionsEndpoint}`
        );
        const data = await res.json();

        setOptions(
          data.map((o) => ({
            value: o.id,
            label: `${o.code} - ${o.nom}` || o.nom,
          }))
        );
      } catch {
        setError("Erreur chargement des options.");
      }
    };

    fetchOptions();
  }, [type]); // <-- juste `type` comme dépendance

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === selectedId) || null,
    [options, selectedId]
  );

  /* =======================
      FETCH STATS
  ======================= */
  const fetchStats = async () => {
    setLoading(true);
    setError("");
    setStats(null);

    try {
      const url =
        type === "globales"
          ? `${process.env.REACT_APP_API_BASE_URL}${config[type].endpoint}`
          : `${process.env.REACT_APP_API_BASE_URL}${config[type].endpoint}/${selectedId}`;

      const res = await fetchWithToken(url);
      const data = await res.json();

      if (!res.ok) throw new Error();

      setStats(data);
    } catch {
      setError("Erreur lors du chargement des statistiques.");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
      RENDER
  ======================= */
  return (
    <Layout>
      <Back>admin-gest</Back>

      <div className="col-md-10 offset-md-1 mt-4">
        <h1>Statistiques électorales</h1>

        {error && <ToastMessage message={error} onClose={() => setError("")} />}

        {/* ===== TYPE ===== */}
        <div className="mb-3">
          <label className="form-label">Type de statistiques</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setSelectedId(null);
              setStats(null);
            }}
          >
            <option value="globales">Globales</option>
            <option value="departement">Département</option>
            <option value="souspref">Sous-préfecture</option>
            <option value="commune">Commune</option>
            <option value="lieu">Lieu de vote</option>
          </select>
        </div>

        {/* ===== SELECT ===== */}
        {config[type]?.optionsEndpoint && (
          <div className="mb-3">
            <label className="form-label">Sélection</label>
            <Select
              theme={customTheme}
              options={options}
              placeholder="Choisir..."
              value={selectedOption}
              onChange={(opt) => setSelectedId(opt?.value || null)}
              isClearable
            />
          </div>
        )}

        <button
          className="btn btn-primary w-100"
          disabled={loading || (config[type]?.optionsEndpoint && !selectedId)}
          onClick={fetchStats}
        >
          {loading ? "Chargement..." : "Afficher les statistiques"}
        </button>

        {/* ===== RESULTATS ===== */}
        {stats && (
          <div className="mt-4">
            <div className="alert alert-info">
              <strong>Total voix :</strong> {stats.total_voix}
            </div>

            {stats.gagnant && (
              <div className="alert alert-success">
                🏆 <strong>Gagnant :</strong> {stats.gagnant.nom}{" "}
                {stats.gagnant.prenom} ({stats.gagnant.parti}) –{" "}
                <strong>{stats.gagnant.voix}</strong> voix (
                {stats.gagnant.pourcentage}%)
              </div>
            )}

            {stats && <ChartRepartition stats={stats} />}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Statistiques;
