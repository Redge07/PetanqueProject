import React from "react";

const ClassementTournament = ({ dataPlayer }) => {
  return (
    <div style={{ border: "solid 2px red" }}>
      <h4 style={{ color: "red" }}>
        Composant pour montrer la situation spécifique d'un joueur qui fait un
        tournoi en classement
      </h4>
      {dataPlayer.groupe && <p>Tu es dans le groupe {dataPlayer.groupe}</p>}
      <p>
        Tu es actuellement{" "}
        {dataPlayer.round == 4
          ? dataPlayer.class != 0
            ? dataPlayer.class == 1
              ? `en finale de ton groupe`
              : `en 1/${dataPlayer.class} de finale de ton groupe`
            : `a la fin des 3 matchs de poules, il faut attendre que tout le monde finissent ses 3 matchs pour procéder à la sélection des qualifiés`
          : `au match numéro ${dataPlayer.round} de la phase de poule`}
      </p>
    </div>
  );
};

export default ClassementTournament;
