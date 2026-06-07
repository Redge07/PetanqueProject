import React, { useContext } from "react";
import { OrgaContext } from "../../pages/Tournament";
import { Trophy, Clock } from "lucide-react";

const ButtonWinner = ({ versus, handleWinner }) => {
  const context = useContext(OrgaContext);
  const orga = context?.orga;
  const hasOpponent = versus.id_playerB > 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-[var(--color-border)] shadow-sm">
      {/* Badge barrage éventuel */}
      {versus.barrage == 1 && (
        <div className="mb-2">
          <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
            Match de barrage
          </span>
        </div>
      )}

      {/* En-tête : confrontation */}
      <div className="flex items-center gap-3 mb-3">
        {/* Équipe A */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="w-7 h-7 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {versus.id_playerA}
          </span>
          <span className="font-semibold text-[var(--color-primary)] truncate">
            {versus.pseudo_A}
          </span>
        </div>

        {hasOpponent ? (
          <>
            <span className="text-xs font-bold text-[var(--color-gray-light)] flex-shrink-0">
              VS
            </span>
            {/* Équipe B */}
            <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
              <span className="font-semibold text-[var(--color-primary)] truncate text-right">
                {versus.pseudo_B}
              </span>
              <span className="w-7 h-7 rounded-full bg-[var(--color-gold)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {versus.id_playerB}
              </span>
            </div>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-gray)] bg-[var(--color-bg-mid)] px-3 py-1.5 rounded-full flex-shrink-0">
            <Clock className="w-3.5 h-3.5" />
            En attente d'un adversaire
          </span>
        )}
      </div>

      {/* Boutons de déclaration du vainqueur */}
      {hasOpponent && orga && (
        <div className="flex gap-2">
          <button
            onClick={() =>
              handleWinner(versus.id_playerA, versus.id_playerB, versus)
            }
            className="flex-1 min-w-0 flex items-center justify-center gap-2 h-11 px-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl text-sm font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            <Trophy className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
            <span className="truncate">{versus.pseudo_A}</span>
          </button>
          <button
            onClick={() =>
              handleWinner(versus.id_playerB, versus.id_playerA, versus)
            }
            className="flex-1 min-w-0 flex items-center justify-center gap-2 h-11 px-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white rounded-xl text-sm font-medium hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all duration-300"
          >
            <Trophy className="w-4 h-4 text-[var(--color-gold)] flex-shrink-0" />
            <span className="truncate">{versus.pseudo_B}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ButtonWinner;
