import axios from "axios";
import React, { useEffect, useState } from "react";
import { linkBackend } from "../constants/LinkBackend";
import SearchTournament from "./playerComponents/SearchTournament";
import ArbreTournament from "./playerComponents/ArbrePlayer";
import CascadeTournament from "./playerComponents/CascadePlayer";
import ClassementTournament from "./playerComponents/ClassementPlayer";
import Order from "./Order";
import ViewTournament from "./playerComponents/ViewTournament";

const Participant = ({ player }) => {
  // State qui va récupérer la situation de l'utilisateur sous sa forme de "player", il sera soit inscrit a aucun tournoi, soit en attente, soit accepté, soit le tournoi a commencé et il n'a aucun adversaire, soit il a un adversaire
  const [dataPlayer, setDataPlayer] = useState({ res: 0 });

  // Récupérer un petit message pour dire que l'utilisateur a bien été désinscrit du tournoi
  const [responseDeinscription, setResponseDeinscription] = useState("");

  // State pour afficher ou non le classement
  const [showOrder, setShowOrder] = useState(false);
  const [showDetailsTournament, setShowDetailsTournament] = useState(false);

  const formatTournament = {
    arbre: ArbreTournament,
    cascade: CascadeTournament,
    classement: ClassementTournament,
  };

  const TournamentComponent = formatTournament[dataPlayer.style];

  // Quand on s'est inscrit a un tournoi mais on n'est en attente et on veut se désinscrire
  const handleDelete = () => {
    axios.delete(linkBackend + "players/" + player.id).then((res) => {
      setResponseDeinscription(res.data.res);
      setTimeout(() => {
        recharge();
      }, 1000);
    });
  };

  // Fonction qui recharge la page, on récupère la situation du joueur bien mise a jour
  const recharge = () => {
    setResponseDeinscription("");
    axios.get(linkBackend + "players/" + player.id).then((res) => {
      console.log(res.data);
      setDataPlayer(res.data);
    });
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <div>
      <h2>Participant</h2>
      {/* Si le joueur n'est lier a aucun tournoi, on propose une barre de recherche */}
      {dataPlayer.res == 0 && (
        <SearchTournament player={player} recharge={recharge} />
      )}
      {/* Le joueur est actuellement en attente d'acceptation d'un tournoi */}
      {dataPlayer.res == 1 && (
        <div>
          <p>
            Vous etes en liste d'attente pour le tournoi{" "}
            {dataPlayer.tournamentName} qui est en {dataPlayer.style}
          </p>
          {/* On laisse le choix au joueur de se désinscrire avant d'etre accepté */}
          <button onClick={handleDelete}>Se retirer</button>
          <p>{responseDeinscription}</p>
        </div>
      )}
      {/* Notre demande de participation au tournoi a été accepter mais le tournoi n'a pas encore commencé */}
      {dataPlayer.res == 2 && (
        <div>
          Votre demande pour participer au tournoi {dataPlayer.tournamentName}{" "}
          qui est en {dataPlayer.style} a été accepté. Vous etes le numéro{" "}
          {dataPlayer.numero}. Le tournoi va bientot commencer
        </div>
      )}
      {/* On est en plein tournoi */}
      {dataPlayer.res == 3 && (
        <div style={{ border: "solid 2px blue" }}>
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
          {/* Composant qui la situation d'un joueur dans un tournoi précis */}
          {TournamentComponent && (
            <TournamentComponent dataPlayer={dataPlayer} />
          )}
          <p>
            {" "}
            {dataPlayer.idVersus
              ? `Vous affronter ${dataPlayer.pseudoVersus} qui est le numéro
                ${dataPlayer.idVersus}`
              : "Vous n'avez pas d'adversaire"}
          </p>
        </div>
      )}
      {/* Le joueur a gagné le tournoi */}
      {dataPlayer.res == 4 && (
        <div>
          <h1>{dataPlayer.msg}</h1>
          <button onClick={handleDelete}>Quitter le tournoi</button>
          <p>{responseDeinscription}</p>
        </div>
      )}
      {dataPlayer.style == "classement" && (
        <div>
          {showOrder ? (
            <button onClick={() => setShowOrder(false)}>
              Ne plus voir le classement
            </button>
          ) : (
            <button onClick={() => setShowOrder(true)}>Voir Classement</button>
          )}
        </div>
      )}
      {showOrder && <Order idTournament={dataPlayer.id_tournament} />}
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
  );
};

export default Participant;
