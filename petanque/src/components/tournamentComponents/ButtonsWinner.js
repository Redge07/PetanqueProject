import React from "react";

const ButtonWinner = ({ versus, handleWinner }) => {
  return (
    <div style={{ border: "solid 2px green" }}>
      <h4 style={{ color: "green" }}>Balise qui représente un versus</h4>
      {/* Montre infos entre joueur A et joueur B potentiel */}
      <p>
        Le joueur numéro {versus.joueurA.numero} ({versus.joueurA.pseudo}){" "}
        {versus.joueurB
          ? `affronte le joueur numéro ${versus.joueurB.numero} (${versus.joueurB.pseudo})`
          : "n'a pas encore d'adversaire attitré"}
        {/* Précise si s'agit d'un match de barrage */}
        {versus.barrage && (
          <span
            style={{
              color: "red",
            }}
          >
            {" "}
            Il s'agit d'un match de barrage
          </span>
        )}
      </p>
      {/* Si y'a bien joueur B pour le match alors on peut déclarer un vainqueur et donc afficher les boutons*/}
      {versus.joueurB && (
        <div>
          <button
            onClick={() =>
              handleWinner(versus.joueurA.numero, versus.joueurB.numero, versus)
            }
          >
            Victoire de {versus.joueurA.pseudo}
          </button>
          <button
            onClick={() =>
              handleWinner(versus.joueurB.numero, versus.joueurA.numero, versus)
            }
          >
            Victoire de {versus.joueurB.pseudo}
          </button>
        </div>
      )}
    </div>
  );
};

export default ButtonWinner;
