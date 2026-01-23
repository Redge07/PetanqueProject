import React from "react";
import ButtonWinner from "./ButtonsWinner";

const Arbre = ({ pairesInfos, matches, handleWinner }) => {
  const sortedTours = [...pairesInfos.tours].sort((a, b) => a - b);
  console.log("arbre");

  console.log(matches);

  return (
    <div className="composant" style={{ border: "solid 2px blue" }}>
      <h4 style={{ color: "blue" }}>Composant qui est un arbre en entier</h4>
      {/* Je vais trier les affichage par les tours des joueurs */}
      {sortedTours.map((t) => {
        if (matches.find((versus) => versus.class == t)) {
          return (
            <div
              className="composant"
              style={{
                border: "solid 2px red",
              }}
              key={t}
            >
              <h4 style={{ color: "red" }}>
                Balise qui est un tour de l'arbre
              </h4>
              {t == 1 ? (
                <h2>La finale</h2>
              ) : t == 0.5 ? (
                <h2>
                  Finale entre le vainqueur du groupe B et le vainqueur du
                  groupe B2
                </h2>
              ) : (
                <h2>Matchs de 1/{t}</h2>
              )}
              {matches
                .filter(
                  (versus) =>
                    versus.class == t && versus.id_playerA && !versus.end,
                )
                .map((versus) => (
                  <ButtonWinner
                    versus={versus}
                    handleWinner={handleWinner}
                    key={versus.key}
                  />
                ))}
            </div>
          );
        }
      })}
    </div>
  );
};

export default Arbre;
