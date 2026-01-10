import React from "react";

const ArbreTournament = ({ dataPlayer }) => {
  return (
    <div className="composant" style={{ border: "solid 2px red" }}>
      <h4 style={{ color: "red" }}>
        Composant pour montrer la situation spécifique d'un joueur qui fait un
        tournoi en arbre
      </h4>
      <p>
        Tu es actuellement en{" "}
        {dataPlayer.class == 1
          ? "finale du tournoi"
          : `1/${dataPlayer.class} de finale du tournoi.`}
      </p>
    </div>
  );
};

export default ArbreTournament;
