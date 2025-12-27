import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "react-bootstrap";
// import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import HeaderWithFilter from "../../components/Layout/HeaderWithFilter";
import Loader from "../../components/Layout/Loader";
import SearchBar from "../../components/Layout/SearchBar";
import ConfirmPopup from "../../components/Layout/ConfirmPopup";
import { fetchWithToken } from "../../utils/fetchWithToken";
import { Link } from "react-router-dom";
import { generatePdfBureaux } from "./generatePdfBureaux";

const LieuVoteList = () => {
  const [lieux, setLieux] = useState([]);
  const [sortedLieux, setSortedLieux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLieu, setSelectedLieu] = useState(null);
  const [sortOption, setSortOption] = useState("");

  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchLieux = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetchWithToken(
          `${process.env.REACT_APP_API_BASE_URL}/lieux-vote`
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des lieux de vote");
        }

        const data = await response.json();
        setLieux(data);
        setSortedLieux(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLieux();
  }, []);

  const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
  const userRole = userInfo ? userInfo.role : null;

  const handleShowDetails = (lieu) => {
    setSelectedLieu(lieu);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedLieu(null);
  };

  const filteredLieux = sortedLieux.filter((lieu) =>
    [
      lieu.nom,
      lieu.commune?.nom,
      lieu.commune?.sous_prefecture?.nom,
      lieu.commune?.sous_prefecture?.departement?.nom,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (lieu) => {
    setSelectedLieu(lieu);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedLieu(null);
    setShowModal(false);
  };

  return (
    <Layout>
      <div className="container mt-2">
        <div className="mb-3 d-flex gap-2">
          <button
            className="btn btn-secondary"
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const res = await fetchWithToken(
                  `${process.env.REACT_APP_API_BASE_URL}/lieux-bureaux`
                );
                if (!res.ok)
                  throw new Error("Erreur lors du téléchargement des bureaux");
                const data = await res.json();
                if (typeof generatePdfBureaux === "function") {
                  generatePdfBureaux(data.data || data);
                } else {
                  // fallback: open in new tab as JSON
                  const blob = new Blob(
                    [JSON.stringify(data.data || data, null, 2)],
                    { type: "application/json" }
                  );
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                }
              } catch (err) {
                setError(err.message || "Erreur inattendue");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <i className="fa fa-file-pdf me-2" />
            Exporter bureaux (PDF)
          </button>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "80vh" }}
          >
            <Loader />
          </div>
        ) : (
          <>
            {/* Recherche */}
            <SearchBar
              placeholder="Rechercher un lieu, commune, sous-préfecture ou département..."
              onSearch={setSearchQuery}
              delay={300}
            />

            {/* Header */}
            <HeaderWithFilter
              allowedRoles={["dev", "super_admin"]}
              title="Lieux de vote"
              link="/admin-gest/lieux/ajouter"
              linkText="Ajouter"
              main={lieux.length}
              sortOption={sortOption}
              setSortOption={setSortOption}
              dataList={lieux}
              setSortedList={setSortedLieux}
              alphaField="nom"
              dateField="created_at"
            />

            {/* Tableau */}
            <Table hover responsive className="centered-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Lieu</th>
                  <th>Département</th>
                  <th>Sous-préfecture</th>
                  <th>Commune</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLieux.length > 0 ? (
                  filteredLieux.map((lieu, index) => (
                    <tr key={index}>
                      <td>{lieu.code}</td>
                      <td>{lieu.nom}</td>
                      <td>
                        {lieu.commune?.sous_prefecture?.departement?.code ||
                          "-"}{" "}
                        -{" "}
                        {lieu.commune?.sous_prefecture?.departement?.nom || "-"}
                      </td>
                      <td>
                        {lieu.commune?.sous_prefecture?.code || "-"} -{" "}
                        {lieu.commune?.sous_prefecture?.nom || "-"}
                      </td>
                      <td>
                        {lieu.commune?.code || "-"} - {lieu.commune?.nom || "-"}
                      </td>
                      <td className="table-operations">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleShowDetails(lieu)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          {userRole !== "staff" && (
                            <>
                              <Link to={`/admin-gest/lieux/update/${lieu.id}`}>
                                <Button variant="warning" size="sm">
                                  <i className="fas fa-edit"></i>
                                </Button>
                              </Link>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleOpenModal(lieu)}
                              >
                                <i className="fas fa-trash"></i>
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Aucun lieu trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </>
        )}
      </div>

      {/* Modal suppression */}
      <ConfirmPopup
        show={showModal}
        onClose={handleCloseModal}
        onConfirm={() => {}}
        title="Confirmation"
        body={
          <p>
            Voulez-vous vraiment supprimer le lieu{" "}
            <strong>{selectedLieu?.nom}</strong> ?
          </p>
        }
      />

      {/* Modal détails */}
      {selectedLieu && (
        <Modal
          show={showDetails}
          onHide={handleCloseDetails}
          centered
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Détails du lieu</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="p-3 p-md-4">
              {/* ===== EN-TÊTE ===== */}
              <div className="text-center mb-4">
                <h3 className="text-primary mb-1 fw-bold">
                  {selectedLieu.nom}
                </h3>
                <span className="badge bg-secondary fs-6 ">
                  Code : {selectedLieu.code}
                </span>
              </div>

              {/* ===== INFORMATIONS GÉNÉRALES ===== */}
              <div className="bg-body rounded shadow-sm p-3 mb-3">
                <h5 className="mb-3">📍 Informations du lieu</h5>

                <div className="row">
                  <div className="col-md-6 mb-2">
                    <strong>Nbres de votants :</strong>{" "}
                    {selectedLieu.nombre_electeurs}
                  </div>

                  <div className="col-md-6 mb-2">
                    <strong>Nom du lieu :</strong> {selectedLieu.nom}
                  </div>
                </div>
              </div>

              {/* ===== LOCALISATION ADMINISTRATIVE ===== */}
              <div className="bg-body rounded shadow-sm p-3">
                <h5 className="mb-3">🗺️ Localisation administrative</h5>

                <div className="row">
                  <div className="col-md-12 mb-2">
                    <strong>Département :</strong>{" "}
                    {selectedLieu.commune?.sous_prefecture?.departement?.code ||
                      "-"}
                    {" - "}
                    {selectedLieu.commune?.sous_prefecture?.departement?.nom ||
                      "-"}
                  </div>

                  <div className="col-md-12 mb-2">
                    <strong>Sous-préfecture :</strong>{" "}
                    {selectedLieu.commune?.sous_prefecture?.code || "-"}
                    {" - "}
                    {selectedLieu.commune?.sous_prefecture?.nom || "-"}
                  </div>

                  <div className="col-md-12 mb-2">
                    <strong>Commune :</strong>{" "}
                    {selectedLieu.commune?.code || "-"}
                    {" - "}
                    {selectedLieu.commune?.nom || "-"}
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDetails}>
              Fermer
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Layout>
  );
};

export default LieuVoteList;
