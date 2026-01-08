import React from "react";

const VainqueurGroupe = ({ listPlayers }) => {
  return (
    <div>
      {["A", "B", "C"].map((g) => {
        const vainqueur = `vainqueur${g}`;
        if (listPlayers.vainqueur[vainqueur]) {
          return (
            <div>
              <h2>Groupe {g}</h2>
              <p>Le gagnant est {listPlayers.vainqueur[vainqueur]}</p>
            </div>
          );
        }
      })}
    </div>
  );
};

export default VainqueurGroupe;
