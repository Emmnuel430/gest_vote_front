// Importation des dépendances React et des composants nécessaires de React Router
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Protected from "./components/Protected";
// Importation des pages et composants utilisés dans les routes
import AccessDenied from "./components/AccessDenied";
import Login from "./pages/Login";
import Home from "./pages/Home";
// ----
import Register from "./pages/users/Register";
import UserList from "./pages/users/UserList";
import UserUpdate from "./pages/users/UserUpdate";

// ----
import ScrollToTop from "./components/ScrollToTop";
// ----
import CandidatList from "./pages/candidats/CandidatList";
import AddCandidat from "./pages/candidats/AddCandidat";
import CandidatUpdate from "./pages/candidats/CandidatUpdate";
// ----
import ImportLieu from "./pages/lieux/ImportLieu";
import LieuVoteList from "./pages/lieux/LieuVoteList";
import AddVotes from "./pages/votes/AddVotes";
import Statistiques from "./pages/votes/Statistiques";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth */}
        <Route path="/admin-gest" element={<Login />} />

        {/* ------------------------ */}
        <Route path="/admin-gest/home" element={<Protected Cmp={Home} />} />

        {/* Utilisateurs (Super Admin uniquement) */}
        <Route
          path="/admin-gest/register"
          element={<Protected Cmp={Register} adminOnly />}
        />
        <Route
          path="/admin-gest/utilisateurs"
          element={<Protected Cmp={UserList} adminOnly />}
        />
        <Route
          path="/admin-gest/update/user/:id"
          element={<Protected Cmp={UserUpdate} adminOnly />}
        />

        {/* ------------------------ */}
        <Route
          path="/admin-gest/candidats"
          element={<Protected Cmp={CandidatList} adminOnly />}
        />
        <Route
          path="/admin-gest/candidats/add"
          element={<Protected Cmp={AddCandidat} adminOnly />}
        />
        <Route
          path="/admin-gest/candidat/update/:id"
          element={<Protected Cmp={CandidatUpdate} adminOnly />}
        />
        {/* ------------------------ */}
        <Route
          path="/admin-gest/lieux/importer"
          element={<Protected Cmp={ImportLieu} />}
        />
        <Route
          path="/admin-gest/lieux-de-vote"
          element={<Protected Cmp={LieuVoteList} />}
        />
        {/* ------------------------ */}
        <Route
          path="/admin-gest/votes/ajouter"
          element={<Protected Cmp={AddVotes} />}
        />
        {/* ------------------------ */}
        <Route
          path="/admin-gest/votes/stats"
          element={<Protected Cmp={Statistiques} adminOnly />}
        />

        {/* Si l'URL n'est pas définie, renvoyer l'utilisateur vers la page de connexion */}
        <Route path="*" element={<Login />} />
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </BrowserRouter>
  );
};

// Exportation du composant AppRoutes pour l'utiliser dans d'autres parties de l'application
export default AppRoutes;
