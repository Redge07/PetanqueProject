import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Cookie, X } from "lucide-react";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const refuse = () => {
    localStorage.setItem("cookie_consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Cookie className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--color-primary)] mb-0.5">
            Cookies et données
          </p>
          <p className="text-xs text-[var(--color-gray)] leading-relaxed">
            Nous utilisons un cookie de session pour votre connexion et les
            services Google OAuth2. Aucun cookie publicitaire.{" "}
            <NavLink
              to="/confidentialite"
              className="underline hover:text-[var(--color-primary)]"
            >
              En savoir plus
            </NavLink>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={refuse}
            className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-gray)] hover:bg-[var(--color-bg-mid)] transition-colors text-xs font-medium"
          >
            <X className="w-3.5 h-3.5" />
            Refuser
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white text-xs font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
