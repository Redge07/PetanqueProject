import React from "react";

const CascadeTournament = ({ dataPlayer }) => {
  return (
    <div style={{ border: "solid 2px red" }}>
      <h4 style={{ color: "red" }}>
        Composant pour montrer la situation spécifique d'un joueur qui fait un
        tournoi en cascade
      </h4>
      <p>Tu es dans le groupe {dataPlayer.groupe}</p>
      <p>
        Tu es actuellement{" "}
        {dataPlayer.round == 4
          ? dataPlayer.class == 1
            ? `en finale de ton groupe`
            : dataPlayer.class == 0.5 && dataPlayer.groupe == "B"
            ? "dans la grande finale qui voit s'affronter le vainqueur du groupe B au vainqueur du groupe B2"
            : `en 1/${dataPlayer.class} de finale de ton groupe`
          : `au match numéro ${dataPlayer.round} de la phase de groupe`}
      </p>
      {dataPlayer.barrage == 1 && (
        <p style={{ color: "green" }}>Vous faites un barrage</p>
      )}
    </div>
  );
};

export default CascadeTournament;
