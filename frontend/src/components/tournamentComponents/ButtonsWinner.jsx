import React, { useContext } from "react";
import { OrgaContext } from "../../pages/Tournament";

const ButtonWinner = ({ versus, handleWinner }) => {
  const context = useContext(OrgaContext);
  const orga = context?.orga;

  return (
    <div className="composant" style={{ border: "solid 2px green" }}>
      <h4 style={{ color: "green" }}>Balise qui représente un versus</h4>
      {/* Montre infos entre joueur A et joueur B potentiel */}
      <p>
        Le joueur numéro {versus.id_playerA} ({versus.pseudo_A}){" "}
        {versus.id_playerB
          ? `affronte le joueur numéro ${versus.id_playerB} (${versus.pseudo_B})`
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
      {versus.id_playerB && orga && (
        <div>
          <button
            onClick={() =>
              handleWinner(versus.id_playerA, versus.id_playerB, versus)
            }
          >
            Victoire de {versus.pseudo_A}
          </button>
          <button
            onClick={() =>
              handleWinner(versus.id_playerB, versus.id_playerA, versus)
            }
          >
            Victoire de {versus.pseudo_B}
          </button>
        </div>
      )}
    </div>
  );
};

export default ButtonWinner;
