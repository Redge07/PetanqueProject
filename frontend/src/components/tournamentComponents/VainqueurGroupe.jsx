import React from "react";
import { Trophy } from "lucide-react";

const VainqueurGroupe = ({ listPlayers }) => {
  return (
    <div className="space-y-3 mb-6">
      {["A", "B", "C"].map((g) => {
        const vainqueur = `vainqueur${g}`;
        if (listPlayers.vainqueurs[vainqueur]) {
          return (
            <div
              key={g}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-2xl p-4 shadow-xl text-white flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-[var(--color-gold)]/20 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[var(--color-gold)]" />
              </div>
              <div>
                <p className="text-[var(--color-gold)] text-xs font-medium">
                  Groupe {g}
                </p>
                <p className="font-semibold">
                  Vainqueur : {listPlayers.vainqueurs[vainqueur]}
                </p>
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};

export default VainqueurGroupe;
