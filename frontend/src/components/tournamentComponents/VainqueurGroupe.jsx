import React from "react";

const VainqueurGroupe = ({ listPlayers }) => {
  return (
    <div>
      {["A", "B", "C"].map((g) => {
        const vainqueur = `vainqueur${g}`;
        if (listPlayers.vainqueurs[vainqueur]) {
          return (
            <div>
              <h2>Groupe {g}</h2>
              <p>Le gagnant est {listPlayers.vainqueurs[vainqueur]}</p>
            </div>
          );
        }
      })}
    </div>
  );
};

export default VainqueurGroupe;
