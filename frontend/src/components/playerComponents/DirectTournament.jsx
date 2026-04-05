import React, { useState } from "react";
import ClassementPlayer from "./ClassementPlayer";
import CascadePlayer from "./CascadePlayer";
import ArbrePlayer from "./ArbrePlayer";
import ViewTournament from "./ViewTournament";
import Order from "../tournamentComponents/Order";

const DirectTournament = ({ dataPlayer }) => {
  // State pour afficher ou non le classement
  const [showOrder, setShowOrder] = useState(false);
  // State pour afficher le détails/autre match du tournoi
  const [showDetailsTournament, setShowDetailsTournament] = useState(false);

  // En fonction du tournoi auquel est inscrit le joueur, on affiche quelque chose de différent sur sa situation
  const formatTournament = {
    arbre: ArbrePlayer,
    cascade: CascadePlayer,
    classement: ClassementPlayer,
  };

  const TournamentComponent = formatTournament[dataPlayer.style];
  return (
    <div className="composant" style={{ border: "solid 2px blue" }}>
      <h4 style={{ color: "blue" }}>
        Balise pour montrer toutes les infos lorsqu'un joueur participe a un
        tournoi
      </h4>
      <h2>Numero : {dataPlayer.numero}</h2>
      <h3>{dataPlayer.tournamentName} Tournament !</h3>
      <p>
        Vous participez au tournoi {dataPlayer.tournamentName} qui est un
        tournoi en {dataPlayer.style}
      </p>
      {/* Composant qui montre la situation d'un joueur dans un tournoi précis */}
      {TournamentComponent && <TournamentComponent dataPlayer={dataPlayer} />}
      <p>
        {" "}
        {dataPlayer.idVersus
          ? `Vous affronter ${dataPlayer.pseudoVersus} qui est le numéro
                ${dataPlayer.idVersus}`
          : "Vous n'avez pas d'adversaire"}
      </p>
      {/* Si on est dans un tournoi "classement" */}
      {dataPlayer.style == "classement" && (
        <div
          className="composant"
          style={{
            border: "2px solid green",
          }}
        >
          <h4 style={{ color: "green" }}>
            Balise pour montrer le classement du tournoi
          </h4>

          {/* On peut afficher le classement */}
          <div>
            {showOrder ? (
              <button onClick={() => setShowOrder(false)}>
                Ne plus voir le classement
              </button>
            ) : (
              <button onClick={() => setShowOrder(true)}>
                Voir Classement
              </button>
            )}
          </div>

          {showOrder && <Order idTournament={dataPlayer.id_tournament} />}
        </div>
      )}
      <div
        className="composant"
        style={{
          border: "2px solid green",
        }}
      >
        <h4 style={{ color: "green" }}>
          Balise pour montrer les infos du tournoi auquel il participe
        </h4>
        {/* On peut montrer les autres matches du tournoi pour voir on en est ou */}
        {showDetailsTournament ? (
          <button onClick={() => setShowDetailsTournament(false)}>
            Ne plus voir le détails des matches
          </button>
        ) : (
          <button onClick={() => setShowDetailsTournament(true)}>
            Voir le détails des matches
          </button>
        )}
        {showDetailsTournament && (
          <ViewTournament
            idTournament={dataPlayer.id_tournament}
            style={dataPlayer.style}
          />
        )}
      </div>
    </div>
  );
};

export default DirectTournament;
