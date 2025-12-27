import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarLinks({ user }) {
  const location = useLocation();
  if (!user) return null;

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const hasRole = (allowedRoles) => allowedRoles.includes(user?.role);

  // 📌 TABLEAU DES LIENS
  const links = [
    {
      label: "Dashboard",
      icon: "fa-home",
      path: "/admin-gest/home",
      roles: ["super_admin", "dev", "staff"],
    },

    {
      label: "Utilisateurs",
      icon: "fa-users",
      path: "/admin-gest/utilisateurs",
      roles: ["super_admin", "dev"],
    },

    // --- GESTION DES CANDIDATS ---
    {
      group: "Gestion des candidats",
      role: ["super_admin", "dev"],
      items: [
        {
          label: "Listing candidats",
          icon: "fa-list",
          path: "/admin-gest/candidats",
          roles: ["super_admin", "dev"],
        },
      ],
    },

    // --- LIEUX DE VOTE ---
    {
      group: "Lieux de vote",
      role: ["super_admin", "dev", "staff"],
      items: [
        {
          label: "Importer",
          icon: "fa-upload",
          path: "/admin-gest/lieux/importer",
          roles: ["super_admin", "dev"],
        },
        {
          label: "Listing lieux de votes",
          icon: "fa-list-alt",
          path: "/admin-gest/lieux-de-vote",
          roles: ["super_admin", "dev", "staff"],
        },
      ],
    },

    // --- VOTES & STATISTIQUES ---
    {
      group: "Votes & statistiques",
      role: ["super_admin", "dev", "staff"],
      items: [
        {
          label: "Ajouter résultats",
          icon: "fa-plus-circle",
          path: "/admin-gest/votes/ajouter",
          roles: ["super_admin", "dev", "staff"],
        },
        {
          label: "Statistiques",
          icon: "fa-chart-bar",
          path: "/admin-gest/votes/stats",
          roles: ["super_admin", "dev", "staff"],
        },
      ],
    },
  ];

  return (
    <div className="navbar-nav w-100">
      {/* ➤ Lien Dashboard (hors groupes) */}
      <Link
        to="/admin-gest/home"
        className={`nav-item nav-link ${
          isActive("/admin-gest/home") ? "active bg-body-secondary fw-bold" : ""
        }`}
      >
        <i className="fa fa-home me-2"></i>
        <span className="text-body">Dashboard</span>
      </Link>
      <Link
        to="/admin-gest/utilisateurs"
        className={`nav-item nav-link ${
          isActive("/admin-gest/utilisateurs")
            ? "active bg-body-secondary fw-bold"
            : ""
        }`}
      >
        <i className="fa fa-users me-2"></i>
        <span className="text-body">Utilisateurs</span>
      </Link>

      {/* ➤ Boucle sur les groupes */}
      {links
        .filter((g) => g.group) // ignore l’entrée Dashboard
        .map((group, idx) => (
          <div key={idx}>
            {hasRole(group.role) && (
              <>
                <hr />
                <h6 className="text-uppercase text-muted ps-3 mt-3">
                  {group.group}
                </h6>
              </>
            )}

            {group.items
              .filter((item) => hasRole(item.roles))
              .map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`nav-link d-flex align-items-center ${
                    isActive(item.path)
                      ? "active bg-body-secondary fw-bold"
                      : ""
                  }`}
                >
                  <i className={`fa ${item.icon} me-2`}></i>

                  <span className="text-body">
                    {item.multiline ? (
                      <>
                        Infos <br /> Générales
                      </>
                    ) : (
                      item.label
                    )}
                  </span>
                </Link>
              ))}
          </div>
        ))}
    </div>
  );
}
