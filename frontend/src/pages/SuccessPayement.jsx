import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, NavLink } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

const REDIRECT_DELAY = 4; // secondes

const SuccessPayement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tournamentId = searchParams.get("tournament");
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);

  // Compte à rebours + redirection vers le concours
  useEffect(() => {
    const target = tournamentId ? "/" + tournamentId : "/";
    if (countdown <= 0) {
      navigate(target);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, tournamentId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg)] via-[var(--color-bg-mid)] to-[var(--color-bg-dark)] flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-10 shadow-2xl text-center max-w-md w-full">
        {/* Icône succès */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-11 h-11 text-green-500" />
        </div>

        <h1 className="text-2xl font-semibold text-[var(--color-primary)] mb-2">
          Paiement réussi !
        </h1>
        <p className="text-[var(--color-gray)] mb-8">
          Votre paiement a bien été pris en compte. Vous pouvez maintenant
          lancer votre concours.
        </p>

        {/* Bouton principal */}
        <NavLink
          to={tournamentId ? "/" + tournamentId : "/"}
          className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl font-medium shadow-lg hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
        >
          Retourner au concours
          <ArrowRight className="w-5 h-5" />
        </NavLink>

        <p className="text-xs text-[var(--color-gray-light)] mt-4">
          Redirection automatique dans {countdown}s…
        </p>
      </div>
    </div>
  );
};

export default SuccessPayement;
