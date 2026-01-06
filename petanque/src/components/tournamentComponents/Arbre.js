import React from "react";
import ButtonWinner from "./ButtonWinner";

const Arbre = ({ pairesInfos, matches, handleWinner }) => {
  const sortedTours = [...pairesInfos.tours].sort((a, b) => a - b);
  return (
    <div style={{ border: "solid 2px blue" }}>
      <h4 style={{ color: "blue" }}>Composant qui est un arbre en entier</h4>
      {/* Je vais trier les affichage par les tours des joueurs */}
      {sortedTours.map((t) => {
        return (
          <div
            style={{ border: "solid 2px red", margin: "20px", padding: "20px" }}
            key={t}
          >
            <h4 style={{ color: "red" }}>Balise qui est un tour de l'arbre</h4>
            {t == 1 ? <h2>La finale</h2> : <h2>Matchs de 1/{t}</h2>}
            {/* Une fois que c'est trier, j'affiche les matches qui correspondent aux filtres */}
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
        );
      })}
    </div>
  );
};

export default Arbre;
