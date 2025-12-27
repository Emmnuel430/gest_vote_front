import React from "react";

import Layout from "../components/Layout/Layout";
// Récupérer l'ID de l'utilisateur connecté à partir du sessionStorage
const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

const Home = () => {
  return (
    <div>
      <Layout>
        <div className="container mt-4 px-4">
          <h1 className="mb-3">Dashboard</h1>
          <h2 className="mb-4">
            Bienvenue, <strong>{userInfo ? userInfo.name : "Invité"}</strong> !
          </h2>

          <div className="card">
            <div className="card-body">
              <p className="card-text">
                Bienvenue sur <strong>Gest</strong>, votre tableau de bord de
                gestion de contenu. Cette application vous permet de créer et
                modifier les pages de votre site facilement, sans avoir à écrire
                une seule ligne de code.
              </p>
              <p className="card-text">
                Utilisez le menu de gauche pour accéder aux différentes
                fonctionnalités. <strong>Gest</strong> a été pensé pour rester{" "}
                <em>simple, modulaire et intuitif</em>, même sans éditeur
                enrichi.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Home;
