import React, { useContext } from "react";
import { OrgaContext } from "../../pages/Tournament";
import { Swords, Trophy } from "lucide-react";

const ButtonWinner = ({ versus, handleWinner }) => {
  const context = useContext(OrgaContext);
  const orga = context?.orga;

  return (
    <div className="bg-[var(--color-bg-mid)] rounded-xl p-4 border border-[var(--color-border)]">
      {/* Montre infos entre joueur A et joueur B potentiel */}
      <div className="flex items-center gap-3 mb-3">
        <Swords className="w-4 h-4 text-[var(--color-gray)]" />
        <p className="text-[var(--color-gray)] text-sm">
          <span className="font-semibold text-[var(--color-primary)]">
            {versus.pseudo_A}
          </span>{" "}
          ({versus.id_playerA}){" "}
          {versus.id_playerB ? (
            <>
              vs{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                {versus.pseudo_B}
              </span>{" "}
              ({versus.id_playerB})
            </>
          ) : (
            "n'a pas encore d'adversaire attitré"
          )}
          {/* Précise si s'agit d'un match de barrage */}
          {versus.barrage == 1 && (
            <span className="ml-2 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
              Barrage
            </span>
          )}
        </p>
      </div>

      {/* Si y'a bien joueur B pour le match alors on peut déclarer un vainqueur et donc afficher les boutons */}
      {versus.id_playerB > 0 && orga && (
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleWinner(versus.id_playerA, versus.id_playerB, versus)
            }
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl text-sm font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            <Trophy className="w-4 h-4 text-[var(--color-gold)]" />
            {versus.pseudo_A}
          </button>
          <button
            onClick={() =>
              handleWinner(versus.id_playerB, versus.id_playerA, versus)
            }
            className="flex-1 flex items-center justify-center gap-2 h-10 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl text-sm font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            <Trophy className="w-4 h-4 text-[var(--color-gold)]" />
            {versus.pseudo_B}
          </button>
        </div>
      )}
    </div>
  );
};

export default ButtonWinner;
