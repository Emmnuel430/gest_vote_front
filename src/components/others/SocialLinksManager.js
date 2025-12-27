import React from "react";

const SOCIAL_OPTIONS = [
  { key: "facebook", label: "Facebook", icon: "fab fa-square-facebook" },
  { key: "twitter", label: "Twitter (X)", icon: "fab fa-x-twitter" },
  { key: "instagram", label: "Instagram", icon: "fab fa-instagram" },
  { key: "youtube", label: "YouTube", icon: "fab fa-youtube" },
  { key: "whatsapp", label: "WhatsApp", icon: "fab fa-whatsapp" },
];

const SocialLinksManager = ({ socials, setSocials, max = 5 }) => {
  // Ajouter une ligne
  const addSocialLine = () => {
    if (socials.length >= max) return;
    setSocials([...socials, { name: "", url: "" }]);
  };

  // Modifier une ligne
  const updateSocial = (index, key, value) => {
    const updated = [...socials];
    updated[index][key] = value;
    setSocials(updated);
  };

  // Supprimer une ligne
  const removeSocial = (index) => {
    const updated = socials.filter((_, i) => i !== index);
    setSocials(updated.length ? updated : [{ name: "", url: "" }]);
  };

  // Réseaux déjà utilisés
  const usedNetworks = socials.map((s) => s.name).filter(Boolean);

  return (
    <div className="card p-3 mt-3">
      <h5 className="mb-3">Réseaux sociaux</h5>

      <div className="d-flex flex-column gap-3">
        {socials.map((social, idx) => (
          <div key={idx} className="d-flex gap-3 align-items-start">
            {/* Réseau */}
            <div className="flex-grow-1">
              <label className="form-label">Réseau</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i
                    className={
                      SOCIAL_OPTIONS.find((o) => o.key === social.name)?.icon ||
                      "fa fa-link"
                    }
                  ></i>
                </span>

                <select
                  className="form-select"
                  value={social.name}
                  onChange={(e) => updateSocial(idx, "name", e.target.value)}
                >
                  <option value="">Choisir…</option>

                  {SOCIAL_OPTIONS.map((opt) => (
                    <option
                      key={opt.key}
                      value={opt.key}
                      disabled={
                        // désactive si déjà pris par une autre ligne
                        usedNetworks.includes(opt.key) &&
                        opt.key !== social.name
                      }
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lien */}
            <div className="flex-grow-1">
              <label className="form-label">Lien</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://..."
                value={social.url}
                onChange={(e) => updateSocial(idx, "url", e.target.value)}
              />
            </div>

            {/* Remove */}
            <div className="mt-4 text-md-end">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeSocial(idx)}
              >
                <i className="fa fa-minus"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {socials.length < max && (
        <button
          type="button"
          className="btn btn-outline-primary mt-3"
          onClick={addSocialLine}
        >
          <i className="fa fa-plus"></i> Ajouter un réseau
        </button>
      )}
    </div>
  );
};

export default SocialLinksManager;
