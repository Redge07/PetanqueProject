import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { linkBackend } from "../constants/LinkBackend";
import SearchTournament from "./playerComponents/SearchTournament";
import DirectTournament from "./playerComponents/DirectTournament";
import { UsersContext } from "../App";

const Participant = ({ player }) => {
  // State qui va récupérer la situation de l'utilisateur sous sa forme de "player", il sera soit inscrit a aucun tournoi, soit en attente, soit accepté, soit le tournoi a commencé et il n'a aucun adversaire, soit il a un adversaire
  const [dataPlayer, setDataPlayer] = useState({ res: 0 });
  const { setLoad } = useContext(UsersContext);

  // Récupérer un petit message pour dire que l'utilisateur a bien été désinscrit du tournoi
  const [responseDeinscription, setResponseDeinscription] = useState("");

  // Quand on s'est inscrit a un tournoi mais on n'est en attente et on veut se désinscrire
  const handleDelete = () => {
    setLoad(true);
    axios
      .delete(linkBackend + "players/" + player.id)
      .then((res) => {
        setResponseDeinscription(res.data.res);
        setTimeout(() => {
          recharge();
        }, 1000);
      })
      .finally(() => setLoad(false));
  };

  // Fonction qui recharge la page, on récupère la situation du joueur bien mise a jour
  const recharge = () => {
    setLoad(true);
    setResponseDeinscription("");
    axios
      .get(linkBackend + "players/" + player.id)
      .then((res) => {
        console.log(res.data);
        setDataPlayer(res.data);
      })
      .finally(() => setLoad(false));
  };

  useEffect(() => {
    recharge();
  }, []);
  return (
    <div>
      <h2>Participant</h2>
      <button onClick={recharge}>Recharger la page</button>
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
      {dataPlayer.res == 3 && <DirectTournament dataPlayer={dataPlayer} />}
      {/* Le joueur a gagné le tournoi */}
      {dataPlayer.res == 4 && (
        <div>
          <h1>{dataPlayer.msg}</h1>
          <button onClick={handleDelete}>Quitter le tournoi</button>
          <p>{responseDeinscription}</p>
        </div>
      )}
    </div>
  );
};

export default Participant;
