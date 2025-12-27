import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

import Layout from "../../components/Layout/Layout";
import Back from "../../components/Layout/Back";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import ToastMessage from "../../components/Layout/ToastMessage";
import { fetchWithToken } from "../../utils/fetchWithToken";
import useSelectTheme from "./useSelectTheme";

const BUREAUX = [
  { value: 1, label: "Bureau 1" },
  { value: 2, label: "Bureau 2" },
  { value: 3, label: "Bureau 3" },
  { value: 4, label: "Bureau 4" },
  { value: 5, label: "Bureau 5" },
];

const AddVotes = () => {
  const navigate = useNavigate();
  const { customTheme } = useSelectTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [selectedBureau, setSelectedBureau] = useState(null);
  const [inscrits, setInscrits] = useState("");
  const [votants, setVotants] = useState("");

  const [bureauxEntries, setBureauxEntries] = useState([]);

  const [lieux, setLieux] = useState([]);
  const [selectedLieu, setSelectedLieu] = useState(null);

  const [candidats, setCandidats] = useState([]);

  const [lieuVoteId, setLieuVoteId] = useState(null);
  const [resultats, setResultats] = useState([]);

  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userId = userInfo?.id;
  const userRole = userInfo ? userInfo.role : null;

  const isDisabledForStaff = userRole === "staff";

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

    setResultats([
      ...resultats,
      {
        candidat_id: null,
        nombre_voix: 0,
        bureaux: bureauxEntries.map((b) => ({
          bureau_id: b.bureau_id,
          voix: 0,
        })), // détails par bureau
      },
    ]);
  };

  const updateResultat = (index, field, value) => {
    const updated = [...resultats];

    if (field === "bureaux") {
      updated[index].bureaux = value;
      // recalc total
      updated[index].nombre_voix = updated[index].bureaux.reduce(
        (s, b) => s + (Number(b.voix) || 0),
        0
      );
    } else {
      updated[index][field] = value;
    }

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
  const disabled = !lieuVoteId || resultats[0]?.candidat_id == null;
  const handleSubmit = async () => {
    if (disabled) {
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
            bureaux: bureauxEntries,
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

  const totalInscrits = bureauxEntries.reduce(
    (s, b) => s + (Number(b.inscrits) || 0),
    0
  );

  const getBureauTotalVoix = (bureau_id) => {
    return resultats.reduce(
      (s, r) =>
        s + (r.bureaux?.find((b) => b.bureau_id === bureau_id)?.voix || 0),
      0
    );
  };

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

  return (
    <Layout>
      <Back>admin-gest/resultats-votes</Back>

      <div className="col-md-8 offset-md-2 mt-4">
        <div>
          <h1>Ajouter des votes</h1>

          {error && (
            <ToastMessage message={error} onClose={() => setError("")} />
          )}

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
                      setBureauxEntries([]);
                      setResultats([]);
                      return;
                    }

                    const data = await res.json();

                    // Backend returns object { lieu_vote_id, bureaux, resultats }
                    const bureauxFromBack = data.bureaux || [];

                    const mappedBureaux = bureauxFromBack.map((b) => ({
                      bureau_id: b.bureau_id,
                      label: b.nom || b.label || `Bureau ${b.bureau_id}`,
                      inscrits: b.inscrits ?? 0,
                      votants: b.votants ?? 0,
                    }));

                    setBureauxEntries(mappedBureaux);

                    const resultatsFromBack = data.resultats || [];

                    if (
                      Array.isArray(resultatsFromBack) &&
                      resultatsFromBack.length > 0
                    ) {
                      setResultats(
                        resultatsFromBack.map((r) => {
                          // normalize bureaux for this candidat: merge backend bureaux with mappedBureaux
                          const rB = (r.bureaux || []).map((rb) => ({
                            bureau_id: rb.bureau_id,
                            voix: rb.voix ?? rb.nombre_voix ?? 0,
                          }));

                          const mergedBureaux = mappedBureaux.map((mb) => {
                            const found = rB.find(
                              (x) => x.bureau_id === mb.bureau_id
                            );
                            return {
                              bureau_id: mb.bureau_id,
                              voix: found ? found.voix : 0,
                            };
                          });

                          const nombre_voix =
                            r.nombre_voix ??
                            mergedBureaux.reduce(
                              (s, bb) => s + (Number(bb.voix) || 0),
                              0
                            );

                          return {
                            candidat_id: r.candidat_id,
                            nombre_voix,
                            bureaux: mergedBureaux,
                          };
                        })
                      );
                    } else {
                      // pas de résultats enregistrés: on initialise resultats à [] (l'utilisateur ajoutera)
                      setResultats([]);
                    }
                  } catch (err) {
                    setError(
                      "Erreur lors du chargement des résultats existants."
                    );
                  }
                } else {
                  setBureauxEntries([]);
                  setResultats([]);
                }
              }}
              isClearable
              isDisabled={loading}
            />

            {selectedLieu && (
              <div className="alert alert-info mt-3">
                <strong>Total des voix :</strong> {totalVoix} /{" "}
                {selectedLieu.nombre_electeurs} electeurs
              </div>
            )}
          </div>

          {/* ===== BUREAU DE VOTE ===== */}
          {lieuVoteId && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Bureau de vote</h5>

                {!isDisabledForStaff && (
                  <>
                    <div className="row">
                      <div className="col-md-4">
                        <label className="form-label">Bureau *</label>
                        <Select
                          theme={customTheme}
                          options={BUREAUX}
                          isOptionDisabled={(opt) =>
                            bureauxEntries.some(
                              (b) => b.bureau_id === opt.value
                            )
                          }
                          placeholder="Sélectionner..."
                          value={selectedBureau}
                          onChange={(opt) => setSelectedBureau(opt)}
                          isClearable
                          isDisabled={loading || isDisabledForStaff}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Inscrits</label>
                        <input
                          type="number"
                          disabled={loading || isDisabledForStaff}
                          min="0"
                          max={selectedLieu.nombre_electeurs}
                          className={`form-control ${
                            inscrits > selectedLieu.nombre_electeurs
                              ? "is-invalid"
                              : ""
                          }`}
                          value={inscrits}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (v > selectedLieu.nombre_electeurs) {
                              setError(
                                "Le nombre d'inscrits ne peut dépasser le total d'électeurs du lieu."
                              );
                            } else {
                              setError("");
                            }
                            setInscrits(v);
                          }}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Votants *</label>
                        <input
                          disabled={loading || isDisabledForStaff}
                          type="number"
                          min="0"
                          className={`form-control ${
                            votants > inscrits ? "is-invalid" : ""
                          }`}
                          value={votants}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (inscrits !== "" && v > inscrits) {
                              setError(
                                "Le nombre de votants ne peut dépasser le nombre d'inscrits."
                              );
                            } else {
                              setError("");
                            }
                            setVotants(v);
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 d-flex gap-2 align-items-center">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => {
                          if (!selectedBureau) {
                            setError("Sélectionnez un bureau avant d'ajouter.");
                            return;
                          }

                          // validate per-bureau and total inscrits
                          if (inscrits > selectedLieu.nombre_electeurs) {
                            setError(
                              "Le nombre d'inscrits ne peut dépasser le total d'électeurs du lieu."
                            );
                            return;
                          }

                          if (votants > inscrits) {
                            setError(
                              "Le nombre de votants ne peut dépasser le nombre d'inscrits."
                            );
                            return;
                          }

                          const sumInscrits = bureauxEntries.reduce(
                            (s, b) => s + (Number(b.inscrits) || 0),
                            0
                          );

                          if (
                            sumInscrits + (Number(inscrits) || 0) >
                            selectedLieu.nombre_electeurs
                          ) {
                            setError(
                              "La somme des inscrits de tous les bureaux dépasse le nombre d'électeurs du lieu."
                            );
                            return;
                          }

                          if (
                            bureauxEntries.some(
                              (b) => b.bureau_id === selectedBureau.value
                            )
                          ) {
                            setError("Ce bureau a déjà été ajouté.");
                            return;
                          }

                          const newB = {
                            bureau_id: selectedBureau.value,
                            label: selectedBureau.label,
                            inscrits: inscrits || 0,
                            votants: votants || 0,
                          };

                          setBureauxEntries([...bureauxEntries, newB]);

                          setResultats((prev) =>
                            prev.map((r) => ({
                              ...r,
                              bureaux: [
                                ...(r.bureaux || []),
                                { bureau_id: newB.bureau_id, voix: 0 },
                              ],
                            }))
                          );

                          setSelectedBureau(null);
                          setInscrits("");
                          setVotants("");
                          setError("");
                        }}
                      >
                        Ajouter ce bureau
                      </button>

                      <div className="flex-grow-1">
                        {votants && (
                          <div className="alert alert-info mt-0 mb-0">
                            <strong>Total voix :</strong> {votants} / {inscrits}{" "}
                            inscrits
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {bureauxEntries.length > 0 && (
                  <div className="mt-3">
                    {bureauxEntries.map((b, i) => (
                      <div
                        key={b.bureau_id}
                        className="border rounded p-2 mb-2 bg-body"
                      >
                        <div className="row align-items-center">
                          <div className="col-md-4">
                            <strong>{b.label}</strong>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Inscrits</label>
                            <input
                              disabled={loading || isDisabledForStaff}
                              type="number"
                              className={`form-control ${
                                b.inscrits > selectedLieu.nombre_electeurs
                                  ? "is-invalid"
                                  : ""
                              }`}
                              value={b.inscrits}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                const updated = [...bureauxEntries];
                                updated[i].inscrits = v;
                                const sumInscritsUpdated = updated.reduce(
                                  (s2, bb) => s2 + (Number(bb.inscrits) || 0),
                                  0
                                );
                                if (
                                  sumInscritsUpdated >
                                  selectedLieu.nombre_electeurs
                                )
                                  setError(
                                    "La somme des inscrits de tous les bureaux dépasse le nombre d'électeurs du lieu."
                                  );
                                else if (v > selectedLieu.nombre_electeurs)
                                  setError("Inscrits > électeurs du lieu.");
                                else setError("");
                                setBureauxEntries(updated);
                              }}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Votants</label>
                            <input
                              type="number"
                              disabled={loading || isDisabledForStaff}
                              className={`form-control ${
                                b.votants > b.inscrits ? "is-invalid" : ""
                              }`}
                              value={b.votants}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                const updated = [...bureauxEntries];
                                updated[i].votants = v;
                                if (v > updated[i].inscrits)
                                  setError(
                                    "Votants > inscrits pour ce bureau."
                                  );
                                else setError("");

                                const sumVoix = getBureauTotalVoix(b.bureau_id);
                                if (sumVoix > v)
                                  setError(
                                    "La somme des voix par bureau dépasse le nombre de votants."
                                  );

                                setBureauxEntries(updated);
                              }}
                            />
                          </div>
                          {!isDisabledForStaff && (
                            <div className="col-md-2">
                              <button
                                className="btn btn-danger w-100"
                                onClick={() => {
                                  if (
                                    !window.confirm(
                                      `Confirmer la suppression de ${b.label} ?`
                                    )
                                  )
                                    return;

                                  const updated = bureauxEntries.filter(
                                    (_, idx) => idx !== i
                                  );
                                  setBureauxEntries(updated);

                                  setResultats((prev) =>
                                    prev.map((r) => ({
                                      ...r,
                                      bureaux: (r.bureaux || []).filter(
                                        (bv) => bv.bureau_id !== b.bureau_id
                                      ),
                                      nombre_voix: (r.bureaux || [])
                                        .filter(
                                          (bv) => bv.bureau_id !== b.bureau_id
                                        )
                                        .reduce(
                                          (s, bb) => s + (Number(bb.voix) || 0),
                                          0
                                        ),
                                    }))
                                  );
                                }}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="mt-2">
                      <div
                        className={`alert ${
                          totalInscrits > (selectedLieu?.nombre_electeurs || 0)
                            ? "alert-danger"
                            : "alert-secondary"
                        }`}
                      >
                        <strong>Total inscrits bureaux :</strong>{" "}
                        {totalInscrits} / {selectedLieu?.nombre_electeurs}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== RESULTATS ===== */}
        <div className="my-4">
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
                    isDisabled={loading || isDisabledForStaff}
                  />
                </div>

                <div className="col-md-6 mb-2">
                  <label className="form-label">Nombre de voix total</label>
                  <input
                    type="number"
                    min="0"
                    disabled
                    className={`form-control ${
                      selectedLieu && totalVoix > selectedLieu.nombre_electeurs
                        ? "is-invalid"
                        : ""
                    }`}
                    value={res.nombre_voix}
                    readOnly
                  />
                </div>

                {/* voix par bureau inputs */}
                {bureauxEntries.length > 0 && (
                  <div className="mt-3">
                    {/* ===== TITRE ===== */}
                    <h6 className="fw-bold mb-3 text-primary">
                      Répartition des voix par bureau
                    </h6>

                    <div className="row">
                      {bureauxEntries.map((b) => {
                        const bv = res.bureaux?.find(
                          (x) => x.bureau_id === b.bureau_id
                        ) || {
                          voix: 0,
                        };

                        const bureauTotalAfter =
                          getBureauTotalVoix(b.bureau_id) - (bv.voix || 0);

                        return (
                          <div key={b.bureau_id} className="col-md-6 mb-2">
                            <label className="form-label">
                              {b.label}{" "}
                              {typeof b.votants === "number" && (
                                <small
                                  className={` ${
                                    b.votants -
                                      getBureauTotalVoix(b.bureau_id) <
                                    0
                                      ? "text-danger"
                                      : "text-muted"
                                  }`}
                                >
                                  (Restant:{" "}
                                  {b.votants - getBureauTotalVoix(b.bureau_id)})
                                </small>
                              )}
                            </label>

                            <input
                              type="number"
                              min="0"
                              disabled={
                                !res.candidat_id ||
                                loading ||
                                isDisabledForStaff
                              }
                              className={`form-control ${
                                b.votants !== undefined &&
                                bureauTotalAfter + (bv.voix || 0) > b.votants
                                  ? "is-invalid"
                                  : ""
                              }`}
                              value={bv.voix}
                              onChange={(e) => {
                                const value = Number(e.target.value);

                                const currentSumExcludingThis =
                                  getBureauTotalVoix(b.bureau_id) -
                                  (bv.voix || 0);

                                const newSum = currentSumExcludingThis + value;

                                if (
                                  b.votants !== undefined &&
                                  newSum > b.votants
                                ) {
                                  setError(
                                    `La somme des voix pour ${b.label} dépasse les votants (${b.votants}).`
                                  );
                                  return;
                                }

                                const newBureaux = [...(res.bureaux || [])];
                                const idx = newBureaux.findIndex(
                                  (x) => x.bureau_id === b.bureau_id
                                );

                                if (idx === -1) {
                                  newBureaux.push({
                                    bureau_id: b.bureau_id,
                                    voix: value,
                                  });
                                } else {
                                  newBureaux[idx] = {
                                    ...newBureaux[idx],
                                    voix: value,
                                  };
                                }

                                updateResultat(index, "bureaux", newBureaux);
                                setError("");
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!isDisabledForStaff && (
                  <div className="col-md-2 mb-2">
                    <button
                      className="btn btn-danger w-100 mt-2"
                      onClick={() => removeResultat(index)}
                    >
                      <i className="fa fa-trash" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {!isDisabledForStaff && (
            <button
              className="btn btn-outline-primary mt-2"
              onClick={addCandidat}
              disabled={resultats.length >= candidats.length}
            >
              <i className="fa fa-plus" /> Ajouter un candidat
            </button>
          )}
        </div>

        {/* ===== SUBMIT ===== */}
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary w-100 mt-3"
          disabled={loading || disabled || isDisabledForStaff}
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
