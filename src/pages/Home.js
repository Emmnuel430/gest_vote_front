import React from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout/Layout";
// Récupérer l'ID de l'utilisateur connecté à partir du sessionStorage
// const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

const Home = () => {
  const navigate = useNavigate();

  const dashboardLinks = [
    {
      label: "Listing candidats",
      icon: "fa-list",
      path: "/admin-gest/candidats",
    },
    {
      label: "Importer lieux de vote",
      icon: "fa-upload",
      path: "/admin-gest/lieux/importer",
    },
    {
      label: "Listing lieux de vote",
      icon: "fa-list-alt",
      path: "/admin-gest/lieux-de-vote",
    },
    {
      label: "Ajouter résultats",
      icon: "fa-plus-circle",
      path: "/admin-gest/votes/ajouter",
    },
    {
      label: "Statistiques",
      icon: "fa-chart-bar",
      path: "/admin-gest/votes/stats",
    },
  ];

  return (
    <div>
      <Layout>
        <div className="container mt-4 px-4">
          <h1 className="mb-3">Dashboard</h1>
          <h2 className="mb-4">Bienvenue !</h2>

          <div className="d-flex flex-wrap justify-content-center gap-4 mt-4">
            {dashboardLinks.map((item, index) => (
              <div
                key={index}
                className="card shadow-sm text-center"
                style={{ width: "220px", cursor: "pointer" }}
                onClick={() => navigate(item.path)}
              >
                <div className="card-body">
                  <i className={`fa ${item.icon} fa-2x mb-3 text-primary`} />
                  <h6 className="card-title">{item.label}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
