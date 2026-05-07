import React from "react";
import ButtonWinner from "./ButtonsWinner";

const Arbre = ({ pairesInfos, matches, handleWinner }) => {
  // On trie les tours qu'on a reçu
  const sortedTours = [...pairesInfos.tours].sort((a, b) => a - b);
  return (
    <div className="space-y-4">
      {/* Je vais trier les affichage par les tours des joueurs */}
      {sortedTours.map((t) => {
        if (matches.find((versus) => versus.class == t)) {
          return (
            <div
              key={t}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4">
                {t == 1
                  ? "La finale"
                  : t == 0.5
                    ? "Finale entre le vainqueur du groupe B et le vainqueur du groupe B2"
                    : `Matchs de 1/${t}`}
              </h2>
              <div className="space-y-3">
                {matches
                  .filter((versus) => versus.class == t)
                  .map((versus) => (
                    <ButtonWinner
                      versus={versus}
                      handleWinner={handleWinner}
                      key={versus.key}
                    />
                  ))}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Arbre;
